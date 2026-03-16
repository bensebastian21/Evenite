# GenLoop AI Service v2 (Python/FastAPI)

Upgraded Python microservice with persistent ML learning.

## Architecture

```
ai_service/
├── main.py              # FastAPI app + all routes
├── db.py                # SQLite persistence (runs, variants, analytics, weights)
├── predictor.py         # 10-dim viral score + online gradient descent
├── prompt_optimizer.py  # UCB1 template selection + EMA outcome recording
├── llm_service.py       # Groq LLM with dynamic prompt injection
├── image_service.py     # HF SDXL + Pillow text overlay
├── genloop.db           # SQLite database (auto-created)
└── uploads/genloop/     # Generated poster images
```

## ML Learning Pipeline

1. **Template Selection (UCB1)** — `prompt_optimizer.py`
   - Each tone has multiple prompt templates
   - UCB1 balances exploration of new templates vs exploitation of best performers
   - `avg_viral_score` updated via EMA after each winner selection

2. **Viral Score Prediction** — `predictor.py`
   - 10-dimensional weighted scoring (title, keywords, tone, social, CTR, description, CTA, gamification, badges, urgency)
   - Weights persisted in SQLite, survive restarts

3. **Online Weight Updates** — triggered on every `click` or `registration` signal
   - Gradient descent: `w_new = w + alpha * (realized_ctr - predicted) * feature_value`
   - Weights re-normalized to sum to 1.0 after each update

4. **Batch Retrain** — `POST /api/genloop/retrain`
   - Runs multiple gradient passes over all variants with sufficient impressions
   - Only saves new weights if MAE improves

## Setup

```bash
cd ai_service
pip install -r requirements.txt

# Set env vars
export GROQ_API_KEY=your_groq_key
export HF_API_TOKEN=your_hf_token   # optional

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/genloop/generate` | Generate variants (UCB1 template + ML scoring) |
| POST | `/api/genloop/track/{variantId}` | Track signal → triggers online weight update |
| POST | `/api/genloop/select-winner/{variantId}` | Mark winner → updates prompt template EMA |
| POST | `/api/genloop/retrain` | Batch retrain ML weights |
| GET  | `/api/genloop/ab-status/{eventId}` | A/B test status |
| GET  | `/api/genloop/analytics/{eventId}` | Full loop analytics |
| GET  | `/api/genloop/ml-status` | Current weights + template performance |
| GET  | `/health` | Health check |

## Connecting to Node.js backend

In `server/routes/genloop.js`, proxy to this service:

```js
const res = await axios.post('http://localhost:8000/api/genloop/generate', {
  title, topic, target_audience: targetAudience, venue, tone,
  category, event_type: eventType, event_date: eventDate,
  event_time: eventTime, capacity, image_style: imageStyle,
  variant_count: count, event_id: eventId, host_id: req.user.id
});
```
