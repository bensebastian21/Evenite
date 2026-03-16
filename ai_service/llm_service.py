"""
LLM Service — Groq API text copy generation with retry + JSON salvage.
Supports dynamic prompt injection from PromptTemplate.
"""

import re
import json
import asyncio
import httpx
from typing import Optional

GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions"
LLM_RETRIES = 2


def _fill_template(prompt_text: str, meta: dict) -> str:
    """Replace {{placeholders}} in prompt template with actual values."""
    replacements = {
        "{{title}}":          meta.get("title", ""),
        "{{topic}}":          meta.get("topic", ""),
        "{{targetAudience}}": meta.get("target_audience", "All Students"),
        "{{venue}}":          meta.get("venue", "TBD"),
        "{{tone}}":           meta.get("tone", "Professional"),
        "{{category}}":       meta.get("category", "Hackathon"),
        "{{capacity}}":       str(meta.get("capacity", 100)),
    }
    for placeholder, value in replacements.items():
        prompt_text = prompt_text.replace(placeholder, value)
    return prompt_text


def _build_messages(meta: dict, prompt_text: str) -> list:
    date_str = meta.get("event_date") or "TBD"
    if meta.get("event_date") and meta.get("event_time"):
        date_str = f"{meta['event_date']} at {meta['event_time']}"
    deadline_str = meta.get("registration_deadline") or "TBD"
    participation = (
        f"Team event, up to {meta.get('team_size') or 4} members"
        if meta.get("event_type") == "team"
        else "Individual / solo"
    )

    # Use the template as system prompt (with placeholders filled)
    system = _fill_template(prompt_text, meta)

    user = (
        f"Generate marketing content for this event:\n"
        f"Title: {meta.get('title', '')}\n"
        f"Category: {meta.get('category', 'Academic Event')}\n"
        f"Topic: {meta.get('topic', '')}\n"
        f"Audience: {meta.get('target_audience', 'All Students')}\n"
        f"Venue: {meta.get('venue', 'TBD')}\n"
        f"Date: {date_str}\n"
        f"Registration Deadline: {deadline_str}\n"
        f"Participation: {participation}\n"
        f"Capacity: {meta.get('capacity', 100)}\n"
        f"Tone: {meta.get('tone', 'Professional')}\n\n"
        "Return ONLY a JSON object with keys: title, shortHook, description, callToAction, "
        "socialPosts(twitter/instagram/linkedin), keywords[], gamificationRewards[], "
        "badges[], urgencyTriggers[], targetAudienceInsight."
    )
    return [{"role": "system", "content": system}, {"role": "user", "content": user}]


def _salvage(raw: str) -> Optional[dict]:
    def extract(key):
        m = re.search(rf'"{key}"\s*:\s*"((?:[^"\\]|\\.)*)"', raw, re.S)
        return m.group(1).replace("\\n", "\n").replace('\\"', '"') if m else None

    title = extract("title")
    hook  = extract("shortHook")
    desc  = extract("description") or extract("descriptionHtml")
    if not (title and hook and desc):
        return None

    kw_m = re.search(r'"keywords"\s*:\s*\[([\s\S]*?)\]', raw)
    keywords = re.findall(r'"([^"]+)"', kw_m.group(1)) if kw_m else []

    def extract_array(key):
        m = re.search(rf'"{key}"\s*:\s*\[([\s\S]*?)\]', raw)
        return re.findall(r'"([^"]+)"', m.group(1)) if m else []

    return {
        "title": title, "shortHook": hook, "descriptionHtml": desc,
        "callToAction": extract("callToAction") or "",
        "socialPosts": {
            "twitter":   extract("twitter") or "",
            "instagram": extract("instagram") or "",
            "linkedin":  extract("linkedin") or "",
        },
        "keywords":             keywords,
        "gamificationRewards":  extract_array("gamificationRewards"),
        "badges":               extract_array("badges"),
        "urgencyTriggers":      extract_array("urgencyTriggers"),
        "targetAudienceInsight": extract("targetAudienceInsight") or "",
    }


async def generate_text_copy(meta: dict, prompt_text: str, api_key: str) -> dict:
    """
    Call Groq LLM and return parsed text copy dict.
    Raises ValueError on all retries exhausted.
    """
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured")

    messages = _build_messages(meta, prompt_text)
    last_err = None

    async with httpx.AsyncClient(timeout=60) as client:
        for attempt in range(LLM_RETRIES + 1):
            try:
                resp = await client.post(
                    GROQ_URL,
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={
                        "model": GROQ_MODEL,
                        "messages": messages,
                        "response_format": {"type": "json_object"},
                        "temperature": 0.75,
                    },
                )
                data = resp.json()
                if not resp.is_success:
                    raise ValueError(data.get("error", {}).get("message", f"Groq {resp.status_code}"))

                raw = data["choices"][0]["message"]["content"]
                parsed = None
                try:
                    parsed = json.loads(raw)
                except json.JSONDecodeError:
                    stripped = re.sub(r"```json|```", "", raw).strip()
                    m = re.search(r"\{[\s\S]*\}", stripped)
                    if m:
                        try:
                            parsed = json.loads(m.group(0))
                        except json.JSONDecodeError:
                            pass
                    if not parsed:
                        parsed = _salvage(raw)

                if not parsed:
                    raise ValueError("Could not parse LLM response as JSON")

                title = parsed.get("title", "")
                hook  = parsed.get("shortHook", "")
                desc  = parsed.get("description") or parsed.get("descriptionHtml", "")
                if not (title and hook and desc):
                    raise ValueError("Response missing required fields")

                sp = parsed.get("socialPosts", {})
                return {
                    "title":                  title,
                    "short_hook":             hook,
                    "description_html":       desc,
                    "call_to_action":         parsed.get("callToAction", ""),
                    "keywords":               parsed.get("keywords", []),
                    "gamification_rewards":   parsed.get("gamificationRewards", []),
                    "badges":                 parsed.get("badges", []),
                    "urgency_triggers":       parsed.get("urgencyTriggers", []),
                    "target_audience_insight": parsed.get("targetAudienceInsight", ""),
                    "social_posts": {
                        "twitter":   sp.get("twitter", ""),
                        "instagram": sp.get("instagram", ""),
                        "linkedin":  sp.get("linkedin", ""),
                    },
                }
            except Exception as e:
                last_err = e
                if attempt < LLM_RETRIES:
                    print(f"[LLMService] Attempt {attempt+1} failed, retrying: {e}")
                    await asyncio.sleep(1.5 * (attempt + 1))

    raise ValueError(f"LLM parse failed after retries: {last_err}")
