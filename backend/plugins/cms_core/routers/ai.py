# || ॐ श्री गणेशाय नमः ||
#
# Organization: AITDL
# Creator: Jawahar R. Mallah
# Then: 628 CE · Brahmasphuṭasiddhānta · Now: 9 March MMXXVI
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com

"""
CMS AI Endpoints Router — plugins/cms-core/routers/ai.py

Endpoints:
    POST   /api/v1/cms/ai/generate    — generate block content from context
    POST   /api/v1/cms/ai/improve     — improve existing text
    POST   /api/v1/cms/ai/translate   — translate content to Indian language
    POST   /api/v1/cms/ai/seo         — generate SEO title + meta description
    GET    /api/v1/cms/ai/usage       — credits used vs limit for workspace
"""

import sys, os, uuid, logging
from typing import Optional, List

_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db

_plugin_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _plugin_dir not in sys.path:
    sys.path.insert(0, _plugin_dir)

from cms_core.middleware import require_cms_user, get_current_workspace
from cms_core.models.cms_tables import Workspace
from cms_core.services import ai as cms_ai

log = logging.getLogger(__name__)
router = APIRouter(tags=["CMS — AI Layer"])


# ── Request / Response Schemas ─────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    block_type: str = Field(..., description="hero | cards | cta_banner | text | stats")
    context:    str = Field(..., min_length=1, description="Page title, audience, section purpose")
    tone:       str = Field(default="professional", description="professional | friendly | formal | casual")
    language:   str = Field(default="en", description="en | hi | mr | gu | ta")

class ImproveRequest(BaseModel):
    text:        str = Field(..., min_length=1)
    instruction: str = Field(..., description="shorten | expand | more formal | more casual | custom instruction")

class TranslateRequest(BaseModel):
    text:        str = Field(..., min_length=1)
    target_lang: str = Field(..., description="hi | mr | gu | ta | en")

class SEORequest(BaseModel):
    page_title:      str = Field(..., min_length=1, max_length=200)
    content_summary: str = Field(..., min_length=1)

class AIResponse(BaseModel):
    content:        Optional[str] = None
    improved_text:  Optional[str] = None
    diff_summary:   Optional[str] = None
    translated:     Optional[str] = None
    language_detected: Optional[str] = None
    target_language: Optional[str] = None
    seo_title:      Optional[str] = None
    meta_description: Optional[str] = None
    keywords:       Optional[List[str]] = None
    provider:       str
    credits_charged: int
    tokens_used:    int

class UsageResponse(BaseModel):
    workspace_id:    uuid.UUID
    workspace_slug:  str
    plan:            str
    ai_credits_used: int
    ai_credits_limit: int
    credits_remaining: int   # -1 = unlimited


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/ai/generate", response_model=AIResponse)
async def generate_content(
    body: GenerateRequest,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_cms_user),
):
    """
    Generate copy for a page block using the AI gateway.
    Credit cost: 5 (CONTENT tier — open-source model).
    Context is silently truncated to 3000 chars if exceeded.
    """
    result = await cms_ai.generate_copy(
        block_type=body.block_type, context=body.context,
        tone=body.tone, language=body.language,
        workspace=workspace, db=db,
    )
    return AIResponse(content=result["content"], provider=result["provider"],
                      credits_charged=result["credits_charged"], tokens_used=result["tokens_used"])


@router.post("/ai/improve", response_model=AIResponse)
async def improve_content(
    body: ImproveRequest,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_cms_user),
):
    """
    Improve existing text per instruction.
    Credit cost: 5 (CONTENT tier).
    """
    result = await cms_ai.improve_text(
        text=body.text, instruction=body.instruction,
        workspace=workspace, db=db,
    )
    return AIResponse(
        improved_text=result["improved_text"], diff_summary=result["diff_summary"],
        provider=result["provider"], credits_charged=result["credits_charged"],
        tokens_used=result["tokens_used"],
    )


@router.post("/ai/translate", response_model=AIResponse)
async def translate_content(
    body: TranslateRequest,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_cms_user),
):
    """
    Translate content to a target Indian language.
    Credit cost: 5 (CONTENT tier).
    Supported targets: hi (Hindi), mr (Marathi), gu (Gujarati), ta (Tamil), en (English).
    """
    result = await cms_ai.translate(
        text=body.text, target_lang=body.target_lang,
        workspace=workspace, db=db,
    )
    return AIResponse(
        translated=result["translated"],
        language_detected=result["language_detected"],
        target_language=result["target_language"],
        provider=result["provider"], credits_charged=result["credits_charged"],
        tokens_used=result["tokens_used"],
    )


@router.post("/ai/seo", response_model=AIResponse)
async def seo_metadata(
    body: SEORequest,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_cms_user),
):
    """
    Auto-generate SEO title (≤60 chars), meta description (≤155 chars), and keywords.
    Credit cost: 5 (CONTENT tier).
    Typically called on page/blog publish if fields are empty.
    """
    result = await cms_ai.seo_meta(
        page_title=body.page_title, content_summary=body.content_summary,
        workspace=workspace, db=db,
    )
    return AIResponse(
        seo_title=result.get("seo_title"),
        meta_description=result.get("meta_description"),
        keywords=result.get("keywords", []),
        provider=result.get("provider", "unknown"),
        credits_charged=result.get("credits_charged", 0),
        tokens_used=result.get("tokens_used", 0),
    )


@router.get("/ai/usage", response_model=UsageResponse)
async def get_ai_usage(
    workspace: Workspace = Depends(get_current_workspace),
    _: dict = Depends(require_cms_user),
):
    """
    Return AI credit usage for the current workspace.
    credits_remaining = -1 means unlimited (internal plan).
    """
    remaining = (
        -1 if workspace.ai_credits_limit == -1
        else workspace.ai_credits_limit - workspace.ai_credits_used
    )
    return UsageResponse(
        workspace_id=workspace.id,
        workspace_slug=workspace.slug,
        plan=workspace.plan,
        ai_credits_used=workspace.ai_credits_used,
        ai_credits_limit=workspace.ai_credits_limit,
        credits_remaining=remaining,
    )
