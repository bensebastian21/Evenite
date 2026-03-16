"""
GenLoop AI Service — FastAPI microservice (upgraded)
Features:
  - SQLite-persisted prompt templates, runs, variants, analytics
  - UCB1 prompt template selection (exploration/exploitation)
  - Online gradient descent weight updates from real interaction signals
  - Batch retrain endpoint
  - Full A/B status, analytics, and feedback loop
"""

import os
import uuid
import json
import hashlib
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from pathlib import Path

import db as database
import predictor
import prompt_optimizer
import llm_service
import image_service

# ── Config ────────────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")

UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="GenLoop AI Service", version="2.0.0")
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Init DB on startup
@app.on_event("startup")
def startup():
    database.init_db()
    print("[GenLoop] Service started")

# ── Pydantic models ───────────────────────────────────────────────────────────

class EventMetadata(BaseModel):
    title: str
    topic: str
    target_audience: str = "All Students"
    venue: str = "TBD"
    tone: str = "Professional"
    category: str = "Hackathon"
    event_type: str = "solo"
    team_size: Optional[int] = None
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    registration_deadline: Optional[str] = None
    capacity: int = 100
    image_style: str = "Vibrant"
    variant_count: int = Field(default=1, ge=1, le=5)
    event_id: Optional[str] = None
    host_id: Optional[str] = None

class TrackRequest(BaseModel):
    signal: str  # impression | click | share | registration
    viewer_fingerprint: Optional[str] = None
    source: str = "direct"

class RetrainRequest(BaseModel):
    min_impressions: int = 10

class WinnerRequest(BaseModel):
    variant_id: str

# ── Helpers ───────────────────────────────────────────────────────────────────

VALID_SIGNALS = {"impression", "click", "share", "registration"}


def _meta_to_dict(meta: EventMetadata) -> dict:
    return {
        "title":                 meta.title,
        "topic":                 meta.topic,
        "target_audience":       meta.target_audience,
        "venue":                 meta.venue,
        "tone":                  meta.tone,
        "category":              meta.category,
        "event_type":            meta.event_type,
        "team_size":             meta.team_size,
        "event_date":            meta.event_date,
        "event_time":            meta.event_time,
        "registration_deadline": meta.registration_deadline,
        "capacity":              meta.capacity,
        "image_style":           meta.image_style,
        "event_id":              meta.event_id,
        "host_id":               meta.host_id,
    }


def _recompute_metrics(conn, variant_id: str):
    row = conn.execute(
        "SELECT impressions, clicks, shares, registrations FROM content_variants WHERE variant_id=?",
        (variant_id,)
    ).fetchone()
    if not row:
        return
    imp, clk, shr, reg = row["impressions"], row["clicks"], row["shares"], row["registrations"]
    ctr       = clk / imp if imp > 0 else 0.0
    share_rate = shr / imp if imp > 0 else 0.0
    reg_conv  = reg / clk if clk > 0 else 0.0
    conn.execute(
        "UPDATE content_variants SET ctr=?, share_rate=?, reg_conv_rate=? WHERE variant_id=?",
        (ctr, share_rate, reg_conv, variant_id)
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@app.post("/api/genloop/generate")
async def generate(meta: EventMetadata):
    """Generate content variants via multi-modal pipeline."""
    if not meta.title or not meta.topic:
        raise HTTPException(status_code=400, detail="title and topic are required")

    meta_dict = _meta_to_dict(meta)
    event_id  = meta.event_id or str(uuid.uuid4())
    host_id   = meta.host_id or "unknown"

    # Determine loop iteration
    with database.tx() as conn:
        row = conn.execute(
            "SELECT COUNT(*) as cnt FROM generation_runs WHERE event_id=?", (event_id,)
        ).fetchone()
        loop_iteration = (row["cnt"] or 0) + 1

    # Select prompt template via UCB1
    template = prompt_optimizer.select_template(meta.tone)
    run_id   = str(uuid.uuid4())

    # Persist run
    with database.tx() as conn:
        conn.execute(
            "INSERT INTO generation_runs (run_id, event_id, host_id, variant_count, status, "
            "prompt_template_id, loop_iteration) VALUES (?,?,?,?,?,?,?)",
            (run_id, event_id, host_id, meta.variant_count, "in_progress",
             template["template_id"], loop_iteration)
        )

    variants_out = []
    all_failed   = True

    for i in range(meta.variant_count):
        # 1. Generate text copy
        text_copy   = None
        text_failed = False
        try:
            text_copy = await llm_service.generate_text_copy(
                meta_dict, template["prompt_text"], GROQ_API_KEY
            )
        except Exception as e:
            print(f"[Pipeline] Text gen failed variant {i}: {e}")
            text_failed = True
            text_copy = {"title": meta.title, "short_hook": "", "description_html": ""}

        # 2. Generate poster
        poster_url     = "/uploads/genloop/placeholder.jpg"
        image_fallback = True
        try:
            result     = await image_service.generate_poster(meta_dict, text_copy, HF_API_TOKEN)
            poster_url = result["url"]
            image_fallback = result["fallback"]
        except Exception as e:
            print(f"[Pipeline] Image gen failed variant {i}: {e}")

        # 3. Score
        features    = predictor.extract_features(text_copy, meta.tone)
        viral_score = predictor.predict(features)

        # 4. Persist variant
        variant_id = str(uuid.uuid4())
        status     = "partial" if text_failed else "active"
        with database.tx() as conn:
            conn.execute(
                "INSERT INTO content_variants (variant_id, run_id, event_id, host_id, "
                "prompt_template_id, poster_url, image_fallback, text_copy, tone, "
                "predicted_viral_score, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                (variant_id, run_id, event_id, host_id, template["template_id"],
                 poster_url, int(image_fallback), json.dumps(text_copy),
                 meta.tone, viral_score, status)
            )

        if not text_failed:
            all_failed = False

        variants_out.append({
            "variantId":           variant_id,
            "posterUrl":           poster_url,
            "imageFallback":       image_fallback,
            "textCopy":            _to_camel(text_copy),
            "predictedViralScore": viral_score,
            "status":              status,
        })

    # Update run status
    final_status = "failed" if all_failed else "completed"
    with database.tx() as conn:
        conn.execute(
            "UPDATE generation_runs SET status=?, completed_at=datetime('now') WHERE run_id=?",
            (final_status, run_id)
        )

    return {"runId": run_id, "loopIteration": loop_iteration, "variants": variants_out}


@app.post("/api/genloop/track/{variant_id}")
async def track(variant_id: str, body: TrackRequest, background_tasks: BackgroundTasks):
    """Track engagement signal and trigger online weight update."""
    if body.signal not in VALID_SIGNALS:
        raise HTTPException(status_code=400, detail=f"signal must be one of {VALID_SIGNALS}")

    with database.tx() as conn:
        variant = conn.execute(
            "SELECT * FROM content_variants WHERE variant_id=?", (variant_id,)
        ).fetchone()

        if not variant:
            return {"orphaned": True}

        if body.signal == "impression":
            # Deduplicate by fingerprint + hour bucket
            hour_bucket = int(datetime.now(timezone.utc).timestamp() // 3600)
            raw_key     = f"{variant_id}{body.viewer_fingerprint or ''}{hour_bucket}"
            dedupe_key  = hashlib.sha256(raw_key.encode()).hexdigest()

            existing = conn.execute(
                "SELECT id FROM analytics_events WHERE dedupe_key=?", (dedupe_key,)
            ).fetchone()
            if existing:
                return {"success": True, "deduped": True}

            conn.execute(
                "INSERT INTO analytics_events (variant_id, event_id, signal, dedupe_key, source) "
                "VALUES (?,?,?,?,?)",
                (variant_id, variant["event_id"], "impression", dedupe_key, body.source)
            )
            conn.execute(
                "UPDATE content_variants SET impressions=impressions+1 WHERE variant_id=?",
                (variant_id,)
            )
        else:
            field_map = {"click": "clicks", "share": "shares", "registration": "registrations"}
            field = field_map[body.signal]
            conn.execute(
                "INSERT INTO analytics_events (variant_id, event_id, signal, source) VALUES (?,?,?,?)",
                (variant_id, variant["event_id"], body.signal, body.source)
            )
            conn.execute(
                f"UPDATE content_variants SET {field}={field}+1 WHERE variant_id=?",
                (variant_id,)
            )

        _recompute_metrics(conn, variant_id)

    # Trigger online weight update in background after click/registration
    if body.signal in ("click", "registration"):
        background_tasks.add_task(_online_update, variant_id)

    return {"success": True}


async def _online_update(variant_id: str):
    """Background task: update ML weights from this variant's real CTR."""
    with database.tx() as conn:
        row = conn.execute(
            "SELECT text_copy, tone, ctr FROM content_variants WHERE variant_id=?",
            (variant_id,)
        ).fetchone()
    if not row:
        return
    try:
        text_copy = json.loads(row["text_copy"])
        features  = predictor.extract_features(text_copy, row["tone"], row["ctr"])
        predictor.update_weights_online(features, row["ctr"])
        print(f"[ML] Online weight update from variant {variant_id[:8]} CTR={row['ctr']:.4f}")
    except Exception as e:
        print(f"[ML] Online update failed: {e}")


@app.post("/api/genloop/retrain")
async def retrain(body: RetrainRequest):
    """Batch retrain ML weights from all variants with sufficient impressions."""
    with database.tx() as conn:
        rows = conn.execute(
            "SELECT text_copy, tone, ctr FROM content_variants WHERE impressions >= ?",
            (body.min_impressions,)
        ).fetchall()

    if not rows:
        raise HTTPException(status_code=404, detail="No variants with sufficient impressions")

    variants_data = [
        {"text_copy": json.loads(r["text_copy"]), "tone": r["tone"], "ctr": r["ctr"]}
        for r in rows
    ]
    result = predictor.retrain_batch(variants_data)
    return result


@app.post("/api/genloop/select-winner/{variant_id}")
async def select_winner(variant_id: str):
    """Mark a variant as winner, eliminate others in the same run."""
    with database.tx() as conn:
        selected = conn.execute(
            "SELECT * FROM content_variants WHERE variant_id=?", (variant_id,)
        ).fetchone()
        if not selected:
            raise HTTPException(status_code=404, detail="Variant not found")

        # Check if already decided
        already = conn.execute(
            "SELECT variant_id FROM content_variants WHERE run_id=? AND status IN ('winner','eliminated')",
            (selected["run_id"],)
        ).fetchone()
        if already:
            raise HTTPException(status_code=409, detail="Run already decided")

        conn.execute(
            "UPDATE content_variants SET status='winner' WHERE variant_id=?", (variant_id,)
        )
        others = conn.execute(
            "SELECT variant_id FROM content_variants WHERE run_id=? AND variant_id!=?",
            (selected["run_id"], variant_id)
        ).fetchall()
        other_ids = [r["variant_id"] for r in others]
        if other_ids:
            placeholders = ",".join("?" * len(other_ids))
            conn.execute(
                f"UPDATE content_variants SET status='eliminated' WHERE variant_id IN ({placeholders})",
                other_ids
            )

    # Record outcome for prompt optimizer
    with database.tx() as conn:
        row = conn.execute(
            "SELECT predicted_viral_score, prompt_template_id FROM content_variants WHERE variant_id=?",
            (variant_id,)
        ).fetchone()
    if row and row["prompt_template_id"]:
        prompt_optimizer.record_outcome(row["prompt_template_id"], row["predicted_viral_score"])

    return {"success": True, "winner": variant_id, "eliminated": other_ids}


@app.get("/api/genloop/ab-status/{event_id}")
async def ab_status(event_id: str):
    """Get A/B test status for an event's latest run."""
    with database.tx() as conn:
        run = conn.execute(
            "SELECT * FROM generation_runs WHERE event_id=? ORDER BY created_at DESC LIMIT 1",
            (event_id,)
        ).fetchone()
        if not run:
            raise HTTPException(status_code=404, detail="No generation run found")

        variants = conn.execute(
            "SELECT * FROM content_variants WHERE run_id=?", (run["run_id"],)
        ).fetchall()

    result = []
    for v in variants:
        imp = v["impressions"]
        if imp < 30:   confidence = "insufficient_data"
        elif imp < 100: confidence = "low"
        elif imp < 500: confidence = "medium"
        else:           confidence = "high"
        result.append({
            "variantId":           v["variant_id"],
            "predictedViralScore": v["predicted_viral_score"],
            "status":              v["status"],
            "metrics": {
                "impressions": imp, "clicks": v["clicks"],
                "shares": v["shares"], "registrations": v["registrations"],
                "ctr": v["ctr"], "shareRate": v["share_rate"],
                "registrationConversionRate": v["reg_conv_rate"],
            },
            "confidence": confidence,
        })

    return {"runId": run["run_id"], "variants": result}


@app.get("/api/genloop/analytics/{event_id}")
async def analytics(event_id: str):
    """Get full analytics across all loop iterations for an event."""
    with database.tx() as conn:
        runs = conn.execute(
            "SELECT * FROM generation_runs WHERE event_id=? ORDER BY loop_iteration ASC",
            (event_id,)
        ).fetchall()
        if not runs:
            raise HTTPException(status_code=404, detail="No runs found")

        all_variants = conn.execute(
            "SELECT * FROM content_variants WHERE event_id=?", (event_id,)
        ).fetchall()

    loop_history = []
    total_imp = total_clk = total_shr = total_reg = 0

    for run in runs:
        run_variants = [v for v in all_variants if v["run_id"] == run["run_id"]]
        winner = next((v for v in run_variants if v["status"] == "winner"), None)
        if not winner and run_variants:
            winner = max(run_variants, key=lambda v: v["predicted_viral_score"])
        loop_history.append({
            "runId":          run["run_id"],
            "loopIteration":  run["loop_iteration"],
            "date":           run["created_at"],
            "variantCount":   run["variant_count"],
            "winnerScore":    winner["predicted_viral_score"] if winner else 0,
        })
        for v in run_variants:
            total_imp += v["impressions"]
            total_clk += v["clicks"]
            total_shr += v["shares"]
            total_reg += v["registrations"]

    winners = [v for v in all_variants if v["status"] == "winner"]
    pool    = winners if winners else list(all_variants)
    best    = max(pool, key=lambda v: v["predicted_viral_score"]) if pool else None

    return {
        "bestVariant": {
            "variantId":  best["variant_id"],
            "viralScore": best["predicted_viral_score"],
            "metrics": {
                "impressions": best["impressions"], "clicks": best["clicks"],
                "ctr": best["ctr"],
            },
        } if best else None,
        "loopHistory": loop_history,
        "aggregate": {
            "totalImpressions": total_imp,
            "ctr":              total_clk / total_imp if total_imp > 0 else 0,
            "shareRate":        total_shr / total_imp if total_imp > 0 else 0,
            "registrationConversionRate": total_reg / total_clk if total_clk > 0 else 0,
        },
    }


@app.get("/api/genloop/ml-status")
async def ml_status():
    """Return current ML weights and prompt template performance."""
    weights   = predictor.load_weights()
    templates = prompt_optimizer.get_all_templates()
    with database.tx() as conn:
        row = conn.execute("SELECT mae FROM ml_weights WHERE id=1").fetchone()
        mae = row["mae"] if row else None
    return {
        "weights":   weights,
        "mae":       mae,
        "templates": [
            {"templateId": t["template_id"], "tone": t["tone"],
             "avgViralScore": t["avg_viral_score"], "usageCount": t["usage_count"]}
            for t in templates
        ],
    }


@app.get("/api/genloop/variant-poster/{variant_id}")
async def variant_poster(variant_id: str):
    """Return the raw image file for a variant so Node.js can upload it to Cloudinary."""
    from fastapi.responses import FileResponse
    with database.tx() as conn:
        row = conn.execute(
            "SELECT poster_url, image_fallback FROM content_variants WHERE variant_id=?",
            (variant_id,)
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Variant not found")
    if row["image_fallback"]:
        raise HTTPException(status_code=404, detail="Variant uses fallback SVG, no file to serve")
    # poster_url is like /uploads/genloop/xxx.jpg
    rel_path = row["poster_url"].lstrip("/")
    filepath = Path(__file__).parent / rel_path
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Image file not found on disk")
    return FileResponse(str(filepath), media_type="image/jpeg")


@app.get("/health")
async def health():
    return {"status": "ok", "groq": bool(GROQ_API_KEY), "hf": bool(HF_API_TOKEN)}


# ── Camel-case helper for frontend compatibility ──────────────────────────────

def _to_camel(tc: dict) -> dict:
    if not tc:
        return {}
    sp = tc.get("social_posts", {})
    return {
        "title":                tc.get("title", ""),
        "shortHook":            tc.get("short_hook", ""),
        "descriptionHtml":      tc.get("description_html", ""),
        "callToAction":         tc.get("call_to_action", ""),
        "keywords":             tc.get("keywords", []),
        "gamificationRewards":  tc.get("gamification_rewards", []),
        "badges":               tc.get("badges", []),
        "urgencyTriggers":      tc.get("urgency_triggers", []),
        "targetAudienceInsight": tc.get("target_audience_insight", ""),
        "socialPosts": {
            "twitter":   sp.get("twitter", ""),
            "instagram": sp.get("instagram", ""),
            "linkedin":  sp.get("linkedin", ""),
        },
    }
