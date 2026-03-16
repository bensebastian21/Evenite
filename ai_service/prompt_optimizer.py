"""
Prompt Optimizer — manages PromptTemplate selection and outcome recording.
Uses UCB1 (Upper Confidence Bound) for exploration/exploitation of templates.
Templates are persisted in SQLite and their avg_viral_score is updated via EMA.
"""

import uuid
import json
import math
from db import tx

SEED_TEMPLATES = {
    "Professional": (
        "You are an expert academic event marketing specialist. "
        "Generate professional, polished marketing copy. "
        "Event: Title={{title}}, Topic={{topic}}, Audience={{targetAudience}}, Venue={{venue}}. "
        "Respond ONLY with valid JSON containing: title, shortHook, description, callToAction, "
        "socialPosts(twitter/instagram/linkedin), keywords[], gamificationRewards[], "
        "badges[], urgencyTriggers[], targetAudienceInsight."
    ),
    "Hype": (
        "You are a viral social media expert who creates HYPE content. "
        "Generate explosive, energetic marketing copy that drives registrations. "
        "Event: Title={{title}}, Topic={{topic}}, Audience={{targetAudience}}, Venue={{venue}}. "
        "Use power words, urgency, and excitement! "
        "Respond ONLY with valid JSON containing: title, shortHook, description, callToAction, "
        "socialPosts(twitter/instagram/linkedin), keywords[], gamificationRewards[], "
        "badges[], urgencyTriggers[], targetAudienceInsight."
    ),
    "Academic": (
        "You are an academic communications specialist. "
        "Generate scholarly, credible marketing copy for academic events. "
        "Event: Title={{title}}, Topic={{topic}}, Audience={{targetAudience}}, Venue={{venue}}. "
        "Emphasize learning outcomes and professional development. "
        "Respond ONLY with valid JSON containing: title, shortHook, description, callToAction, "
        "socialPosts(twitter/instagram/linkedin), keywords[], gamificationRewards[], "
        "badges[], urgencyTriggers[], targetAudienceInsight."
    ),
}

EMA_ALPHA = 0.1  # smoothing factor for avg_viral_score updates


def _ensure_seed(conn, tone: str):
    """Insert seed template for a tone if none exists."""
    existing = conn.execute(
        "SELECT template_id FROM prompt_templates WHERE tone=? LIMIT 1", (tone,)
    ).fetchone()
    if not existing:
        prompt_text = SEED_TEMPLATES.get(tone, SEED_TEMPLATES["Professional"])
        conn.execute(
            "INSERT INTO prompt_templates (template_id, tone, prompt_text, avg_viral_score, usage_count) "
            "VALUES (?, ?, ?, 50, 0)",
            (str(uuid.uuid4()), tone, prompt_text),
        )


def select_template(tone: str) -> dict:
    """
    Select the best prompt template for a given tone using UCB1.
    UCB1 score = avg_viral_score + C * sqrt(ln(total_uses) / usage_count)
    Falls back to seed template if none exist.
    """
    with tx() as conn:
        _ensure_seed(conn, tone)
        rows = conn.execute(
            "SELECT * FROM prompt_templates WHERE tone=?", (tone,)
        ).fetchall()

    if not rows:
        return {"template_id": str(uuid.uuid4()), "prompt_text": SEED_TEMPLATES.get(tone, ""), "tone": tone}

    total_uses = sum(max(r["usage_count"], 1) for r in rows)
    C = 10.0  # exploration constant (higher = more exploration)

    best = None
    best_score = -1.0
    for row in rows:
        n = max(row["usage_count"], 1)
        ucb = row["avg_viral_score"] + C * math.sqrt(math.log(total_uses) / n)
        if ucb > best_score:
            best_score = ucb
            best = row

    return dict(best)


def record_outcome(template_id: str, realized_viral_score: float):
    """
    Update template's avg_viral_score using EMA and increment usage_count.
    avg_new = (1 - alpha) * avg_old + alpha * realized
    """
    with tx() as conn:
        row = conn.execute(
            "SELECT avg_viral_score, usage_count FROM prompt_templates WHERE template_id=?",
            (template_id,)
        ).fetchone()
        if not row:
            return

        new_avg = (1 - EMA_ALPHA) * row["avg_viral_score"] + EMA_ALPHA * realized_viral_score
        conn.execute(
            "UPDATE prompt_templates SET avg_viral_score=?, usage_count=usage_count+1 WHERE template_id=?",
            (new_avg, template_id),
        )


def get_all_templates() -> list:
    with tx() as conn:
        rows = conn.execute("SELECT * FROM prompt_templates ORDER BY avg_viral_score DESC").fetchall()
    return [dict(r) for r in rows]
