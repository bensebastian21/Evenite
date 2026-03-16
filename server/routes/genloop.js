const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
// Node 18+ has native fetch built-in — no import needed
const { authenticateToken: auth } = require('../utils/auth');

// Node.js fallback pipeline (used if Python service is down)
const { run: runNodePipeline } = require('../services/multiModalPipeline');
const { selectTemplate, recordOutcome } = require('../services/promptOptimizer');
const { retrain } = require('../services/engagementPredictor');
const { syncAnalyticsToVariants } = require('../services/feedbackLoop');

const ContentVariant = require('../models/ContentVariant');
const GenerationRun = require('../models/GenerationRun');
const Analytics = require('../models/Analytics');
const { cloudinary } = require('../utils/cloudinary');

// ── Python AI service config ──────────────────────────────────────────────────
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_TIMEOUT_MS  = 300_000; // 5 min — image gen can be slow

const VALID_SIGNALS = ['impression', 'click', 'share', 'registration'];

// ── Helper: proxy a request to the Python service ────────────────────────────
async function callPython(method, endpoint, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    };
    if (body) opts.body = JSON.stringify(body);
    const resp = await fetch(`${AI_SERVICE_URL}${endpoint}`, opts);
    const data = await resp.json();
    if (!resp.ok) throw Object.assign(new Error(data.detail || 'Python service error'), { status: resp.status });
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// ── Health check: is Python service available? ────────────────────────────────
async function isPythonAvailable() {
  try {
    const resp = await fetch(`${AI_SERVICE_URL}/health`, { method: 'GET' });
    return resp.ok;
  } catch {
    return false;
  }
}

// ── POST /api/genloop/generate ────────────────────────────────────────────────
router.post('/generate', auth, async (req, res) => {
  try {
    const {
      title, topic, targetAudience, venue, tone, variantCount, eventId,
      category, eventType, teamSize, eventDate, eventTime,
      registrationDeadline, capacity, imageStyle,
    } = req.body;

    if (!title || !topic) {
      return res.status(400).json({ msg: 'Title and topic are required.' });
    }

    const count = Math.min(5, Math.max(1, parseInt(variantCount) || 1));

    // ── Try Python service first ──────────────────────────────────────────────
    if (await isPythonAvailable()) {
      console.log('[GenLoop] Using Python AI service');
      try {
        const data = await callPython('POST', '/api/genloop/generate', {
          title,
          topic,
          target_audience:       targetAudience || 'All Students',
          venue:                 venue || 'TBD',
          tone:                  tone || 'Professional',
          category:              category || 'Hackathon',
          event_type:            eventType || 'solo',
          team_size:             teamSize || null,
          event_date:            eventDate || null,
          event_time:            eventTime || null,
          registration_deadline: registrationDeadline || null,
          capacity:              capacity || 100,
          image_style:           imageStyle || 'Vibrant',
          variant_count:         count,
          event_id:              eventId || null,
          host_id:               req.user.id,
        });

        // Proxy poster URLs through Node server if they're relative Python paths
        const variants = (data.variants || []).map((v) => ({
          variantId:           v.variantId,
          posterUrl:           v.posterUrl?.startsWith('/uploads')
                                 ? `${AI_SERVICE_URL}${v.posterUrl}`
                                 : v.posterUrl,
          imageFallback:       v.imageFallback,
          textCopy:            v.textCopy,
          predictedViralScore: v.predictedViralScore,
          status:              v.status,
        }));

        return res.json({ runId: data.runId, loopIteration: data.loopIteration, variants });
      } catch (pyErr) {
        console.warn('[GenLoop] Python service failed, falling back to Node pipeline:', pyErr.message);
      }
    } else {
      console.log('[GenLoop] Python service unavailable, using Node pipeline');
    }

    // ── Fallback: Node.js pipeline ────────────────────────────────────────────
    const template = await selectTemplate({ tone: tone || 'Professional', title, topic, targetAudience, venue });
    const metadata = {
      title, topic,
      targetAudience:       targetAudience || 'All Students',
      venue:                venue || 'TBD',
      tone:                 tone || 'Professional',
      category:             category || 'Hackathon',
      eventType:            eventType || 'solo',
      teamSize:             teamSize || null,
      eventDate:            eventDate || null,
      eventTime:            eventTime || null,
      registrationDeadline: registrationDeadline || null,
      capacity:             capacity || 100,
      imageStyle:           imageStyle || 'Vibrant',
      eventId:              eventId ? new mongoose.Types.ObjectId(eventId) : new mongoose.Types.ObjectId(),
      hostId:               req.user.id,
    };

    const { runId, loopIteration, variants } = await runNodePipeline(metadata, template, count);
    return res.json({
      runId, loopIteration,
      variants: variants.map((v) => ({
        variantId: v.variantId, posterUrl: v.posterUrl, imageFallback: v.imageFallback,
        textCopy: v.textCopy, predictedViralScore: v.predictedViralScore, status: v.status,
      })),
    });
  } catch (err) {
    console.error('[GenLoop] /generate error:', err.message);
    if (err.message?.includes('LLM parse failed')) return res.status(503).json({ msg: err.message });
    if (err.message?.toLowerCase().includes('timed out')) return res.status(504).json({ msg: err.message });
    res.status(500).json({ msg: 'Generation failed', error: err.message });
  }
});

// ── POST /api/genloop/track/:variantId ────────────────────────────────────────
router.post('/track/:variantId', async (req, res) => {
  try {
    const { variantId } = req.params;
    const { signal, viewerFingerprint, source } = req.body;

    if (!VALID_SIGNALS.includes(signal)) {
      return res.status(400).json({ msg: `signal must be one of: ${VALID_SIGNALS.join(', ')}` });
    }

    // Forward to Python service (fire-and-forget for ML update)
    if (await isPythonAvailable()) {
      callPython('POST', `/api/genloop/track/${variantId}`, {
        signal, viewer_fingerprint: viewerFingerprint, source: source || 'direct',
      }).catch((e) => console.warn('[GenLoop] Python track failed:', e.message));
    }

    // Also update MongoDB for existing Node.js analytics/dashboard
    const variant = await ContentVariant.findOne({ variantId });
    if (!variant) {
      const orphan = new Analytics({
        eventId: new mongoose.Types.ObjectId(), hostId: new mongoose.Types.ObjectId(),
        type: signal === 'share' ? 'click' : signal, variantId, signal, source: source || 'direct',
      });
      try { await orphan.save(); } catch (_) {}
      return res.json({ orphaned: true });
    }

    if (signal === 'impression') {
      const hourBucket = Math.floor(Date.now() / 3600000);
      const dedupeKey = crypto.createHash('sha256')
        .update(variantId + (viewerFingerprint || '') + hourBucket).digest('hex');
      const existing = await Analytics.findOne({ dedupeKey });
      if (existing) return res.json({ success: true, deduped: true });
      await new Analytics({ eventId: variant.eventId, hostId: variant.hostId, type: 'impression',
        variantId, signal: 'impression', dedupeKey, source: source || 'direct' }).save();
      await ContentVariant.findOneAndUpdate({ variantId }, { $inc: { 'metrics.impressions': 1 } });
    } else {
      await new Analytics({ eventId: variant.eventId, hostId: variant.hostId,
        type: signal === 'share' ? 'click' : signal, variantId, signal, source: source || 'direct' }).save();
      const incField = signal === 'click' ? 'metrics.clicks' : signal === 'share' ? 'metrics.shares' : 'metrics.registrations';
      await ContentVariant.findOneAndUpdate({ variantId }, { $inc: { [incField]: 1 } });
    }

    const updated = await ContentVariant.findOne({ variantId });
    const { impressions, clicks, shares, registrations } = updated.metrics;
    await ContentVariant.findOneAndUpdate({ variantId }, {
      $set: {
        'metrics.ctr': impressions > 0 ? clicks / impressions : 0,
        'metrics.shareRate': impressions > 0 ? shares / impressions : 0,
        'metrics.registrationConversionRate': clicks > 0 ? registrations / clicks : 0,
      },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('[GenLoop] /track error:', err.message);
    res.status(500).json({ msg: 'Tracking failed', error: err.message });
  }
});

// ── POST /api/genloop/upload-poster/:variantId ────────────────────────────────
router.post('/upload-poster/:variantId', auth, async (req, res) => {
  try {
    const { variantId } = req.params;
    const variant = await ContentVariant.findOne({ variantId });

    // If variant is in MongoDB
    if (variant) {
      const { posterUrl, imageFallback } = variant;
      if (!posterUrl || imageFallback || posterUrl.startsWith('http')) {
        return res.json({ cloudinaryUrl: posterUrl });
      }
      const localPath = path.join(__dirname, '..', posterUrl);
      if (!fs.existsSync(localPath)) return res.status(404).json({ msg: 'Local image file not found.' });
      const result = await cloudinary.uploader.upload(localPath, { folder: 'student-events/genloop', resource_type: 'image' });
      await ContentVariant.findOneAndUpdate({ variantId }, { $set: { posterUrl: result.secure_url } });
      fs.unlink(localPath, () => {});
      return res.json({ cloudinaryUrl: result.secure_url });
    }

    // Variant is in Python service — fetch the image and upload to Cloudinary
    if (await isPythonAvailable()) {
      try {
        // Python posterUrl is a full URL like http://localhost:8000/uploads/genloop/xxx.jpg
        // We need to download it and upload to Cloudinary
        const imgResp = await fetch(`${AI_SERVICE_URL}/api/genloop/variant-poster/${variantId}`);
        if (imgResp.ok) {
          const buffer = await imgResp.buffer();
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'student-events/genloop', resource_type: 'image' },
              (err, res) => err ? reject(err) : resolve(res)
            );
            stream.end(buffer);
          });
          return res.json({ cloudinaryUrl: result.secure_url });
        }
      } catch (e) {
        console.warn('[GenLoop] Python poster upload failed:', e.message);
      }
    }

    return res.status(404).json({ msg: 'Variant not found.' });
  } catch (err) {
    console.error('[GenLoop] /upload-poster error:', err.message);
    res.status(500).json({ msg: 'Cloudinary upload failed', error: err.message });
  }
});

// ── POST /api/genloop/select-winner/:variantId ────────────────────────────────
router.post('/select-winner/:variantId', auth, async (req, res) => {
  try {
    const { variantId } = req.params;

    // Try Python service first
    if (await isPythonAvailable()) {
      try {
        const data = await callPython('POST', `/api/genloop/select-winner/${variantId}`);
        return res.json(data);
      } catch (e) {
        if (e.status === 404 || e.status === 409) return res.status(e.status).json({ msg: e.message });
        console.warn('[GenLoop] Python select-winner failed, trying MongoDB:', e.message);
      }
    }

    // MongoDB fallback
    const selected = await ContentVariant.findOne({ variantId });
    if (!selected) return res.status(404).json({ msg: 'Variant not found.' });
    const allVariants = await ContentVariant.find({ runId: selected.runId });
    if (allVariants.some((v) => v.status === 'winner' || v.status === 'eliminated')) {
      return res.status(409).json({ msg: 'Run already decided' });
    }
    await ContentVariant.findOneAndUpdate({ variantId }, { $set: { status: 'winner' } });
    const otherIds = allVariants.filter((v) => v.variantId !== variantId).map((v) => v.variantId);
    if (otherIds.length > 0) {
      await ContentVariant.updateMany({ variantId: { $in: otherIds } }, { $set: { status: 'eliminated' } });
    }
    return res.json({ success: true, winner: variantId, eliminated: otherIds });
  } catch (err) {
    console.error('[GenLoop] /select-winner error:', err.message);
    res.status(500).json({ msg: 'Failed to select winner', error: err.message });
  }
});

// ── GET /api/genloop/ab-status/:eventId ──────────────────────────────────────
router.get('/ab-status/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;

    if (await isPythonAvailable()) {
      try {
        const data = await callPython('GET', `/api/genloop/ab-status/${eventId}`);
        return res.json(data);
      } catch (e) {
        if (e.status === 404) return res.status(404).json({ msg: 'No generation run found.' });
        console.warn('[GenLoop] Python ab-status failed, trying MongoDB:', e.message);
      }
    }

    const latestRun = await GenerationRun.findOne({ eventId: new mongoose.Types.ObjectId(eventId) }).sort({ createdAt: -1 });
    if (!latestRun) return res.status(404).json({ msg: 'No generation run found for this event.' });
    const variants = await ContentVariant.find({ runId: latestRun.runId });
    return res.json({
      runId: latestRun.runId,
      variants: variants.map((v) => {
        const imp = v.metrics.impressions;
        return {
          variantId: v.variantId, predictedViralScore: v.predictedViralScore,
          status: v.status, metrics: v.metrics,
          confidence: imp < 30 ? 'insufficient_data' : imp < 100 ? 'low' : imp < 500 ? 'medium' : 'high',
        };
      }),
    });
  } catch (err) {
    console.error('[GenLoop] /ab-status error:', err.message);
    res.status(500).json({ msg: 'Failed to fetch A/B status', error: err.message });
  }
});

// ── GET /api/genloop/analytics/:eventId ──────────────────────────────────────
router.get('/analytics/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;

    if (await isPythonAvailable()) {
      try {
        const data = await callPython('GET', `/api/genloop/analytics/${eventId}`);
        return res.json(data);
      } catch (e) {
        if (e.status === 404) return res.status(404).json({ msg: 'No runs found.' });
        console.warn('[GenLoop] Python analytics failed, trying MongoDB:', e.message);
      }
    }

    const eventObjId = new mongoose.Types.ObjectId(eventId);
    const runs = await GenerationRun.find({ eventId: eventObjId }).sort({ loopIteration: 1 });
    if (!runs.length) return res.status(404).json({ msg: 'No runs found for this event.' });

    let totalImpressions = 0, totalClicks = 0, totalShares = 0, totalRegistrations = 0;
    const loopHistory = [];
    for (const run of runs) {
      const variants = await ContentVariant.find({ runId: run.runId });
      const winner = variants.find((v) => v.status === 'winner') ||
        variants.sort((a, b) => b.predictedViralScore - a.predictedViralScore)[0];
      loopHistory.push({ runId: run.runId, loopIteration: run.loopIteration, date: run.createdAt,
        variantCount: run.variantCount, winnerScore: winner?.predictedViralScore || 0 });
      for (const v of variants) {
        totalImpressions += v.metrics.impressions || 0;
        totalClicks += v.metrics.clicks || 0;
        totalShares += v.metrics.shares || 0;
        totalRegistrations += v.metrics.registrations || 0;
      }
    }
    const allVariants = await ContentVariant.find({ eventId: eventObjId });
    const pool = allVariants.filter((v) => v.status === 'winner');
    const overall = (pool.length ? pool : allVariants).sort((a, b) => b.predictedViralScore - a.predictedViralScore)[0];
    return res.json({
      bestVariant: overall ? { variantId: overall.variantId, viralScore: overall.predictedViralScore, metrics: overall.metrics } : null,
      loopHistory,
      aggregate: {
        totalImpressions,
        ctr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
        shareRate: totalImpressions > 0 ? totalShares / totalImpressions : 0,
        registrationConversionRate: totalClicks > 0 ? totalRegistrations / totalClicks : 0,
      },
    });
  } catch (err) {
    console.error('[GenLoop] /analytics error:', err.message);
    res.status(500).json({ msg: 'Failed to fetch analytics', error: err.message });
  }
});

// ── POST /api/genloop/retrain ─────────────────────────────────────────────────
router.post('/retrain', auth, async (req, res) => {
  try {
    if (await isPythonAvailable()) {
      try {
        const data = await callPython('POST', '/api/genloop/retrain', { min_impressions: 10 });
        return res.json({ success: true, ...data });
      } catch (e) {
        console.warn('[GenLoop] Python retrain failed, using Node fallback:', e.message);
      }
    }
    await syncAnalyticsToVariants();
    const variants = await ContentVariant.find({ 'metrics.impressions': { $gte: 50 } });
    const result = retrain(variants);
    return res.json({ success: true, newAccuracy: result.accuracy, retrain_rejected: result.rejected });
  } catch (err) {
    console.error('[GenLoop] /retrain error:', err.message);
    res.status(500).json({ msg: 'Retraining failed', error: err.message });
  }
});

// ── GET /api/genloop/ml-status ────────────────────────────────────────────────
router.get('/ml-status', auth, async (req, res) => {
  try {
    if (await isPythonAvailable()) {
      const data = await callPython('GET', '/api/genloop/ml-status');
      return res.json(data);
    }
    return res.status(503).json({ msg: 'Python AI service not available' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ── POST /api/genloop/export-feedback ────────────────────────────────────────
router.post('/export-feedback', auth, async (req, res) => {
  try {
    const runs = await GenerationRun.find({ status: 'completed' });
    const result = [];
    for (const run of runs) {
      const variants = await ContentVariant.find({ runId: run.runId });
      result.push({ run, variants });
    }
    return res.json(result);
  } catch (err) {
    console.error('[GenLoop] /export-feedback error:', err.message);
    res.status(500).json({ msg: 'Export failed', error: err.message });
  }
});

module.exports = router;
