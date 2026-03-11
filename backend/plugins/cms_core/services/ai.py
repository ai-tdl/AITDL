# || ॐ श्री गणेशाय नमः ||
#
# Organization: AITDL
# AITDL — A Living Knowledge Ecosystem for AI Technology Development Lab
#
# Creator: Jawahar R. Mallah
# Founder, Author & System Architect
#
# Email: jawahar@aitdl.com
# GitHub: https://github.com/jawahar-mallah
#
# Websites:
# https://ganitsutram.com
# https://aitdl.com
#
# Then: 628 CE · Brahmasphuṭasiddhānta
# Now: 9 March MMXXVI · Vikram Samvat 2082
#
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com

"""
CMS AI Service — plugins/cms-core/services/ai.py

Purpose : Wraps the existing ai_gateway.generate_response() for CMS-specific
          use cases. Handles context size guarding, AI credit deduction per
          workspace, and task-type → TaskComplexity routing.

Credit costs (per call):
    alt_text  → BASIC     → 1 credit   (local Ollama)
    seo       → CONTENT   → 5 credits  (open-source)
    generate  → CONTENT   → 5 credits
    improve   → CONTENT   → 5 credits
    translate → CONTENT   → 5 credits
    blog_draft → ADVANCED → 20 credits (premium)

Context size guards (truncation, not rejection):
    BASIC   → max 1000 chars
    CONTENT → max 3000 chars
    ADVANCED → max 6000 chars

Input   : CMS-specific parameters per function
Output  : {"content": str, "credits_charged": int, "tokens_used": int (approx)}
Errors  : 402 if workspace has insufficient credits
          500 if all AI providers fail (from ai_gateway)
"""

import sys
import os
import logging
import math

log = logging.getLogger(__name__)

# Resolve backend path
_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from services.ai_gateway import generate_response, TaskComplexity  # noqa: E402

_plugin_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _plugin_dir not in sys.path:
    sys.path.insert(0, _plugin_dir)

from cms_core.models.cms_tables import Workspace, CMSPrompt  # noqa: E402


# ── Cost table ─────────────────────────────────────────────────────────────────

_TASK_CONFIG = {
    "generate":   {"complexity": TaskComplexity.CONTENT,  "credits": 5,  "max_ctx": 3000},
    "improve":    {"complexity": TaskComplexity.CONTENT,  "credits": 5,  "max_ctx": 3000},
    "translate":  {"complexity": TaskComplexity.CONTENT,  "credits": 5,  "max_ctx": 3000},
    "seo":        {"complexity": TaskComplexity.CONTENT,  "credits": 5,  "max_ctx": 3000},
    "alt_text":   {"complexity": TaskComplexity.BASIC,    "credits": 1,  "max_ctx": 1000},
    "blog_draft": {"complexity": TaskComplexity.ADVANCED, "credits": 20, "max_ctx": 6000},
    "summary":    {"complexity": TaskComplexity.CONTENT,  "credits": 5,  "max_ctx": 4000},
}


# ── Helpers ────────────────────────────────────────────────────────────────────

async def _get_active_prompt(task_type: str, db: AsyncSession) -> str:
    """Retrieve the active system prompt for a task type from cms_prompts table."""
    result = await db.execute(
        select(CMSPrompt)
        .where(CMSPrompt.task_type == task_type, CMSPrompt.is_active == True)
        .order_by(CMSPrompt.version.desc())
        .limit(1)
    )
    prompt_row = result.scalar_one_or_none()
    if prompt_row:
        return prompt_row.system_prompt
    # Fallback if table not yet seeded
    return "You are a helpful AI assistant for AITDL. Generate professional Indian-market content."


async def _charge_credits(workspace: Workspace, task_type: str, db: AsyncSession) -> int:
    """
    Deduct AI credits from the workspace and return the amount charged.
    Raises 402 if workspace has insufficient credits (limit != -1).
    """
    cfg = _TASK_CONFIG.get(task_type, {"credits": 5})
    credits = cfg["credits"]

    # -1 = unlimited (internal workspace)
    if workspace.ai_credits_limit != -1:
        remaining = workspace.ai_credits_limit - workspace.ai_credits_used
        if remaining < credits:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Insufficient AI credits. Need {credits}, have {remaining}. "
                       f"Upgrade your workspace plan or top up credits."
            )

    workspace.ai_credits_used += credits
    db.add(workspace)
    await db.commit()
    log.info(f"[cms-ai] Charged {credits} credits to workspace '{workspace.slug}' for task '{task_type}'")
    return credits


def _guard_context(text: str, task_type: str) -> str:
    """Silently truncate context to the max allowed length for the task tier."""
    max_len = _TASK_CONFIG.get(task_type, {}).get("max_ctx", 3000)
    if len(text) > max_len:
        log.debug(f"[cms-ai] Context truncated from {len(text)} to {max_len} chars for task '{task_type}'")
        return text[:max_len]
    return text


def _approx_tokens(text: str) -> int:
    """Rough token count estimate (1 token ≈ 4 chars for English/Hindi mix)."""
    return math.ceil(len(text) / 4)


# ── Public API ─────────────────────────────────────────────────────────────────

async def generate_copy(
    block_type: str,
    context: str,
    tone: str,
    language: str,
    workspace: Workspace,
    db: AsyncSession,
) -> dict:
    """
    Generate copy for a page block (hero, cards, CTA, etc.).

    Args:
        block_type : 'hero' | 'cards' | 'cta_banner' | 'text' | 'stats'
        context    : Page title, section purpose, audience notes
        tone       : 'professional' | 'friendly' | 'formal' | 'casual'
        language   : 'en' | 'hi' | 'mr' | 'gu' | 'ta'
        workspace  : Workspace ORM object (for credit tracking)
        db         : AsyncSession
    """
    task = "generate"
    context = _guard_context(context, task)
    system_prompt = await _get_active_prompt(task, db)
    cfg = _TASK_CONFIG[task]

    prompt = (
        f"{system_prompt}\n\n"
        f"Block type: {block_type}\n"
        f"Language: {language}\n"
        f"Tone: {tone}\n"
        f"Context: {context}\n\n"
        f"Generate the block content now."
    )

    result = await generate_response(prompt, task_type=cfg["complexity"])
    credits = await _charge_credits(workspace, task, db)

    return {
        "content": result.get("response", ""),
        "provider": result.get("provider", "unknown"),
        "credits_charged": credits,
        "tokens_used": _approx_tokens(prompt),
    }


async def improve_text(
    text: str,
    instruction: str,
    workspace: Workspace,
    db: AsyncSession,
) -> dict:
    """
    Improve existing text per editor instruction.

    Args:
        text        : Original text to improve
        instruction : 'shorten' | 'expand' | 'more formal' | 'more casual' | custom
    """
    task = "improve"
    text = _guard_context(text, task)
    system_prompt = await _get_active_prompt(task, db)
    cfg = _TASK_CONFIG[task]

    prompt = (
        f"{system_prompt}\n\n"
        f"Instruction: {instruction}\n"
        f"Original text:\n{text}\n\n"
        f"Return only the improved text."
    )

    result = await generate_response(prompt, task_type=cfg["complexity"])
    credits = await _charge_credits(workspace, task, db)

    return {
        "improved_text": result.get("response", ""),
        "diff_summary": f"Applied: {instruction}",
        "provider": result.get("provider", "unknown"),
        "credits_charged": credits,
        "tokens_used": _approx_tokens(prompt),
    }


async def translate(
    text: str,
    target_lang: str,
    workspace: Workspace,
    db: AsyncSession,
) -> dict:
    """
    Translate content to a target Indian language.

    Args:
        text        : Source text (any language)
        target_lang : 'hi' (Hindi) | 'mr' (Marathi) | 'gu' (Gujarati) | 'ta' (Tamil)
    """
    task = "translate"
    text = _guard_context(text, task)
    system_prompt = await _get_active_prompt(task, db)
    cfg = _TASK_CONFIG[task]

    lang_names = {"hi": "Hindi", "mr": "Marathi", "gu": "Gujarati", "ta": "Tamil", "en": "English"}
    lang_name = lang_names.get(target_lang, target_lang)

    prompt = (
        f"{system_prompt}\n\n"
        f"Translate to: {lang_name}\n"
        f"Source text:\n{text}\n\n"
        f"Return only the translated text."
    )

    result = await generate_response(prompt, task_type=cfg["complexity"])
    credits = await _charge_credits(workspace, task, db)

    return {
        "translated": result.get("response", ""),
        "language_detected": "auto",
        "target_language": target_lang,
        "provider": result.get("provider", "unknown"),
        "credits_charged": credits,
        "tokens_used": _approx_tokens(prompt),
    }


async def seo_meta(
    page_title: str,
    content_summary: str,
    workspace: Workspace,
    db: AsyncSession,
) -> dict:
    """
    Auto-generate SEO title, meta description, and keywords for a page.

    Returns:
        {"seo_title": str, "meta_description": str, "keywords": [str]}
    """
    task = "seo"
    context = _guard_context(f"{page_title}\n{content_summary}", task)
    system_prompt = await _get_active_prompt(task, db)
    cfg = _TASK_CONFIG[task]

    prompt = (
        f"{system_prompt}\n\n"
        f"Page title: {page_title}\n"
        f"Content summary: {content_summary}\n\n"
        f"Return JSON only."
    )

    result = await generate_response(prompt, task_type=cfg["complexity"])
    credits = await _charge_credits(workspace, task, db)

    # Try to parse JSON response; fall back to raw response
    import json
    raw = result.get("response", "{}")
    try:
        parsed = json.loads(raw)
    except (json.JSONDecodeError, ValueError):
        parsed = {
            "seo_title": page_title[:60],
            "meta_description": content_summary[:155],
            "keywords": [],
        }

    return {
        **parsed,
        "provider": result.get("provider", "unknown"),
        "credits_charged": credits,
        "tokens_used": _approx_tokens(prompt),
    }


async def generate_alt_text(
    filename: str,
    context: str,
    workspace: Workspace,
    db: AsyncSession,
) -> dict:
    """Generate alt text for an uploaded image asset (1 credit — local Ollama)."""
    task = "alt_text"
    system_prompt = await _get_active_prompt(task, db)
    cfg = _TASK_CONFIG[task]

    prompt = (
        f"{system_prompt}\n\n"
        f"Filename: {filename}\n"
        f"Context: {context}\n\n"
        f"Return only the alt text string."
    )

    result = await generate_response(prompt, task_type=cfg["complexity"])
    credits = await _charge_credits(workspace, task, db)

    return {
        "alt_text": result.get("response", ""),
        "provider": result.get("provider", "unknown"),
        "credits_charged": credits,
        "tokens_used": _approx_tokens(prompt),
    }


async def summarize_blog_content(
    title: str,
    content_raw: str,
    workspace: Workspace,
    db: AsyncSession,
) -> dict:
    """Generate a 2-sentence SEO-friendly blog summary (5 credits)."""
    task = "summary"
    content_raw = _guard_context(content_raw, task)
    system_prompt = await _get_active_prompt(task, db)
    cfg = _TASK_CONFIG[task]

    prompt = (
        f"{system_prompt}\n\n"
        f"Blog Title: {title}\n"
        f"Full Content:\n{content_raw}\n\n"
        f"Return ONLY the summary string."
    )

    result = await generate_response(prompt, task_type=cfg["complexity"])
    credits = await _charge_credits(workspace, task, db)

    return {
        "summary": result.get("response", ""),
        "provider": result.get("provider", "unknown"),
        "credits_charged": credits,
        "tokens_used": _approx_tokens(prompt),
    }
