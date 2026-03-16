"""
Image Service — HuggingFace SDXL background + Pillow text overlay.
"""

import uuid
import re
from io import BytesIO
from pathlib import Path
from typing import Optional

import httpx
from PIL import Image, ImageDraw, ImageFont
import textwrap

IMG_W, IMG_H = 768, 1024
HF_MODEL_URL = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0"
HF_TIMEOUT_S = 90
UPLOAD_DIR   = Path(__file__).parent / "uploads" / "genloop"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

STYLE_MODIFIERS = {
    "Vibrant":     "vibrant saturated colors, bold dynamic composition, colorful gradient, high contrast, energetic",
    "Minimalist":  "clean white background, minimal elegant design, generous whitespace, simple geometric shapes",
    "Retro":       "retro 80s synthwave aesthetic, vintage poster style, warm sunset tones, halftone texture",
    "Futuristic":  "futuristic sci-fi aesthetic, electric neon glows, deep dark background, holographic streaks",
    "Illustrated": "hand-drawn illustration style, watercolor wash textures, painterly artistic",
    "Dark":        "dark moody cinematic background, dramatic rim lighting, deep navy and charcoal tones",
    "Neon":        "neon sign glow effects, electric pink and cyan lights, dark night background, rave energy",
}
CATEGORY_ELEMENTS = {
    "Hackathon":   "glowing laptop screens, floating code snippets, circuit board patterns",
    "Workshop":    "hands working on project, collaborative table, tools and materials",
    "Seminar":     "elegant lecture hall, spotlight on stage, academic atmosphere",
    "Competition": "golden trophy, winners podium, achievement medals, dramatic spotlight",
    "Networking":  "silhouettes connecting, professional crowd, city skyline",
    "Cultural":    "vibrant cultural patterns, diverse celebration, festive colors",
    "Sports":      "dynamic athletic motion blur, sports equipment, stadium energy",
    "Tech Talk":   "microphone on stage, tech conference, engaged audience",
    "Career Fair": "professional skyline, career ladder, opportunity doors",
    "Other":       "university campus architecture, students in motion, academic symbols",
}
NEGATIVE_PROMPT = (
    "text, letters, words, typography, writing, labels, captions, watermark, "
    "blurry, low quality, pixelated, ugly, deformed, distorted, nsfw"
)
BG_COLORS = {
    "Vibrant": (30, 10, 80), "Minimalist": (245, 245, 245), "Retro": (60, 20, 40),
    "Futuristic": (5, 5, 30), "Illustrated": (240, 230, 210), "Dark": (10, 10, 20), "Neon": (5, 0, 20),
}


def build_image_prompt(meta: dict) -> str:
    style    = STYLE_MODIFIERS.get(meta.get("image_style", "Vibrant"), STYLE_MODIFIERS["Vibrant"])
    category = CATEGORY_ELEMENTS.get(meta.get("category", "Other"), CATEGORY_ELEMENTS["Other"])
    tone_map = {
        "Professional": "polished corporate design, clean professional aesthetic",
        "Hype":         "explosive energy, bold statement design, maximum visual impact",
        "Academic":     "scholarly intellectual design, university branding, academic prestige",
    }
    tone_mod = tone_map.get(meta.get("tone", "Professional"), tone_map["Professional"])
    return (
        f'Event poster background for "{meta.get("title", "Event")}", '
        f"Theme: {meta.get('topic', '')}, Visual: {category}, "
        f"{style}, {tone_mod}, university students, campus energy, "
        "8k ultra high resolution, portrait orientation, "
        "NO text, NO words, NO letters — pure visual background only"
    )


def _load_font(size: int):
    for name in ["DejaVuSans-Bold.ttf", "arial.ttf", "Arial.ttf", "LiberationSans-Bold.ttf"]:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def _draw_overlay(img: Image.Image, meta: dict, text_copy: Optional[dict]) -> Image.Image:
    draw = ImageDraw.Draw(img, "RGBA")

    font_title = _load_font(56)
    font_hook  = _load_font(28)
    font_info  = _load_font(24)

    title    = (text_copy.get("title") if text_copy else meta.get("title", "Event")).upper()
    hook     = (text_copy.get("short_hook", "") if text_copy else "")
    venue    = meta.get("venue", "")
    date_str = meta.get("event_date", "")
    if meta.get("event_date") and meta.get("event_time"):
        date_str = f"{meta['event_date']} · {meta['event_time']}"

    # Top band
    draw.rectangle([(0, 0), (IMG_W, 190)], fill=(0, 0, 0, 200))
    # Bottom band
    draw.rectangle([(0, IMG_H - 140), (IMG_W, IMG_H)], fill=(0, 0, 0, 210))

    # Title
    title_lines = textwrap.wrap(title, width=18)
    y = 18
    for line in title_lines:
        draw.text((IMG_W // 2, y), line, font=font_title, fill="white", anchor="mt",
                  stroke_width=3, stroke_fill="black")
        y += 66

    # Hook
    if hook:
        hook_lines = textwrap.wrap(hook, width=38)
        y = 200
        for line in hook_lines:
            draw.text((IMG_W // 2, y), line, font=font_hook, fill="#FFE066", anchor="mt",
                      stroke_width=2, stroke_fill="black")
            y += 36

    # Bottom info
    by = IMG_H - 130
    if venue:
        draw.text((44, by), f"📍 {venue}", font=font_info, fill="white",
                  stroke_width=2, stroke_fill="black")
    if date_str:
        draw.text((44, by + 44), f"🗓 {date_str}", font=font_info, fill="#FFE066",
                  stroke_width=2, stroke_fill="black")

    return img


async def generate_poster(meta: dict, text_copy: Optional[dict], hf_token: str) -> dict:
    bg_image = None

    if hf_token:
        prompt = build_image_prompt(meta)
        try:
            async with httpx.AsyncClient(timeout=HF_TIMEOUT_S) as client:
                resp = await client.post(
                    HF_MODEL_URL,
                    headers={"Authorization": f"Bearer {hf_token}", "Content-Type": "application/json"},
                    json={
                        "inputs": prompt,
                        "parameters": {
                            "negative_prompt": NEGATIVE_PROMPT,
                            "num_inference_steps": 40,
                            "guidance_scale": 9.0,
                            "width": IMG_W,
                            "height": IMG_H,
                        },
                    },
                )
                ct = resp.headers.get("content-type", "")
                if resp.is_success and "image" in ct:
                    bg_image = Image.open(BytesIO(resp.content)).convert("RGBA").resize((IMG_W, IMG_H))
                    print(f"[ImageService] HF background: {len(resp.content)} bytes")
                else:
                    print(f"[ImageService] HF error {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            print(f"[ImageService] HF failed: {e}")

    if bg_image is None:
        color = BG_COLORS.get(meta.get("image_style", "Vibrant"), BG_COLORS["Vibrant"])
        bg_image = Image.new("RGBA", (IMG_W, IMG_H), (*color, 255))

    overlay = Image.new("RGBA", (IMG_W, IMG_H), (0, 0, 0, 0))
    overlay = _draw_overlay(overlay, meta, text_copy)
    final   = Image.alpha_composite(bg_image.convert("RGBA"), overlay).convert("RGB")

    filename = f"{uuid.uuid4()}.jpg"
    filepath = UPLOAD_DIR / filename
    final.save(str(filepath), "JPEG", quality=92)
    return {"url": f"/uploads/genloop/{filename}", "fallback": bg_image is None}
