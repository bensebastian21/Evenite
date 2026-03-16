"""
Engagement Predictor with persistent ML weights.
- 10-dimensional weighted scoring
- Online gradient descent weight updates
- Weights persisted to SQLite so learning survives restarts
"""

import re
import json
import math
from db import tx

# ── Default weights ───────────────────────────────────────────────────────────
DEFAULT_WEIGHTS = {
    "w1": 0.13,  # title quality
    "w2": 0.15,  # keyword density
    "w3": 0.10,  # tone multiplier
    "w4": 0.12,  # social post quality
    "w5": 0.10,  # historical CTR
    "w6": 0.10,  # description richness
    "w7": 0.10,  # CTA urgency
    "w8": 0.10,  # gamification rewards
    "w9": 0.05,  # badges
    "w10": 0.05, # urgency triggers
}

POWER_WORDS = [
    "win","hack","build","master","dominate","unleash","compete",
    "exclusive","free","limited","ultimate","epic","live","now",
    "challenge","prize","cash","certificate","internship","opportunity",
]
URGENCY_WORDS = [
    "now","today","limited","spots","hurry","last","deadline",
    "only","left","closing","ends","final","register","join",
]
HIGH_VALUE_REWARDS = ["cash", "₹", "$", "internship", "certificate", "prize", "scholarship"]


def load_weights() -> dict:
    with tx() as conn:
        row = conn.execute("SELECT weights FROM ml_weights WHERE id=1").fetchone()
        if row:
            return json.loads(row["weights"])
    return dict(DEFAULT_WEIGHTS)


def save_weights(weights: dict, mae: float = 999.0):
    with tx() as conn:
        conn.execute("""
            INSERT INTO ml_weights (id, weights, mae, updated_at)
            VALUES (1, ?, ?, datetime('now'))
            ON CONFLICT(id) DO UPDATE SET weights=excluded.weights,
                mae=excluded.mae, updated_at=excluded.updated_at
        """, (json.dumps(weights), mae))


def _normalize(value, mn, mx):
    if mx == mn:
        return 0.0
    return min(1.0, max(0.0, (value - mn) / (mx - mn)))


def score_title(title: str) -> float:
    if not title:
        return 0.0
    ls = _normalize(len(title), 5, 80)
    sweet = 0.2 if 30 <= len(title) <= 70 else 0.0
    hits = sum(1 for w in POWER_WORDS if w in title.lower())
    return min(1.0, ls + sweet + min(0.3, hits * 0.1))


def score_social(twitter: str) -> float:
    if not twitter:
        return 0.0
    ls = _normalize(len(twitter), 50, 280)
    tags = len(re.findall(r"#\w+", twitter))
    return min(1.0, ls + min(0.3, tags * 0.06))


def score_description(html: str) -> float:
    if not html:
        return 0.0
    plain = re.sub(r"<[^>]+>", " ", html).strip()
    ls = _normalize(len(plain), 100, 800)
    paras = len([p for p in re.split(r"\n+", plain) if len(p.strip()) > 20])
    return min(1.0, ls + min(0.3, paras * 0.08))


def score_cta(cta: str) -> float:
    if not cta:
        return 0.0
    hits = sum(1 for w in URGENCY_WORDS if w in cta.lower())
    return min(1.0, hits * 0.2)


def score_gamification(rewards: list) -> float:
    if not rewards:
        return 0.0
    base = min(1.0, len(rewards) / 3)
    hv = sum(1 for r in rewards if any(k in r.lower() for k in HIGH_VALUE_REWARDS))
    return min(1.0, base + min(0.3, hv * 0.1))


def score_badges(badges: list) -> float:
    return min(1.0, len(badges) / 3) if badges else 0.0


def score_urgency(triggers: list) -> float:
    return min(1.0, len(triggers) / 3) if triggers else 0.0


def extract_features(text_copy: dict, tone: str, historical_ctr: float = 0.0) -> dict:
    title       = text_copy.get("title", "")
    twitter     = (text_copy.get("social_posts") or text_copy.get("socialPosts") or {}).get("twitter", "")
    description = text_copy.get("description_html") or text_copy.get("descriptionHtml", "")
    keywords    = text_copy.get("keywords", [])
    cta         = text_copy.get("call_to_action") or text_copy.get("callToAction", "")
    rewards     = text_copy.get("gamification_rewards") or text_copy.get("gamificationRewards", [])
    badges      = text_copy.get("badges", [])
    triggers    = text_copy.get("urgency_triggers") or text_copy.get("urgencyTriggers", [])

    plain = re.sub(r"<[^>]+>", " ", description)
    words = [w for w in plain.split() if w]
    total_words = max(len(words), 1)
    kw_hits = sum(len(re.findall(re.escape(kw), description, re.IGNORECASE)) for kw in keywords)
    keyword_density = min(1.0, kw_hits / total_words)

    tone_map = {"Professional": 0.7, "Hype": 1.0, "Academic": 0.6}
    tone_mult = tone_map.get(tone, 0.7)

    return {
        "f1": score_title(title),
        "f2": keyword_density,
        "f3": tone_mult,
        "f4": score_social(twitter),
        "f5": min(1.0, historical_ctr),
        "f6": score_description(description),
        "f7": score_cta(cta),
        "f8": score_gamification(rewards),
        "f9": score_badges(badges),
        "f10": score_urgency(triggers),
    }


def predict(features: dict, weights: dict = None) -> int:
    w = weights or load_weights()
    raw = (
        w["w1"] * features["f1"] + w["w2"] * features["f2"] +
        w["w3"] * features["f3"] + w["w4"] * features["f4"] +
        w["w5"] * features["f5"] + w["w6"] * features["f6"] +
        w["w7"] * features["f7"] + w["w8"] * features["f8"] +
        w["w9"] * features["f9"] + w["w10"] * features["f10"]
    )
    return round(min(100, max(0, raw * 100)))


def update_weights_online(features: dict, realized_ctr: float, alpha: float = 0.05):
    """
    Online gradient descent: adjust weights toward realized CTR signal.
    Uses EMA-style update: w_new = (1-alpha)*w + alpha*gradient_correction
    """
    weights = load_weights()
    predicted = predict(features, weights) / 100.0
    gradient = realized_ctr - predicted

    feat_vals = [features[f"f{i}"] for i in range(1, 11)]
    keys = [f"w{i}" for i in range(1, 11)]

    for i, key in enumerate(keys):
        weights[key] = max(0.01, weights[key] + alpha * gradient * feat_vals[i])

    # Re-normalize so weights sum to 1.0
    total = sum(weights.values())
    if total > 0:
        for key in keys:
            weights[key] = weights[key] / total

    save_weights(weights)
    return weights


def retrain_batch(variants_data: list) -> dict:
    """
    Batch retrain from a list of {text_copy, tone, ctr} dicts.
    Runs multiple passes of gradient descent.
    """
    if not variants_data:
        return {"accuracy": 0.0, "rejected": True, "samples": 0}

    weights = load_weights()
    total_error = 0.0

    for v in variants_data:
        features = extract_features(v.get("text_copy", {}), v.get("tone", "Professional"),
                                    v.get("ctr", 0.0))
        realized = v.get("ctr", 0.0)
        predicted = predict(features, weights) / 100.0
        total_error += abs(predicted - realized)

        # Gradient step
        gradient = realized - predicted
        feat_vals = [features[f"f{i}"] for i in range(1, 11)]
        keys = [f"w{i}" for i in range(1, 11)]
        for i, key in enumerate(keys):
            weights[key] = max(0.01, weights[key] + 0.05 * gradient * feat_vals[i])

    # Normalize
    total = sum(weights.values())
    if total > 0:
        for key in weights:
            weights[key] /= total

    new_mae = total_error / len(variants_data)
    new_accuracy = max(0.0, 1.0 - new_mae)

    # Only save if improved
    with tx() as conn:
        row = conn.execute("SELECT mae FROM ml_weights WHERE id=1").fetchone()
        old_mae = row["mae"] if row else 999.0

    if new_mae < old_mae:
        save_weights(weights, new_mae)
        return {"accuracy": new_accuracy, "mae": new_mae, "rejected": False, "samples": len(variants_data)}

    return {"accuracy": new_accuracy, "mae": new_mae, "rejected": True, "samples": len(variants_data)}
