# || ॐ श्री गणेशाय नमः ||
#
# Organization: AITDL
# Creator: Jawahar R. Mallah
# Then: 628 CE · Brahmasphuṭasiddhānta · Now: 9 March MMXXVI
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com

"""
CMS Core Plugin — Main Router — plugins/cms-core/router.py

Purpose : Aggregates all CMS sub-routers into a single APIRouter
          mounted at /api/v1/cms by the plugin_loader.
          Also exposes the workspace export endpoint.

All CMS endpoints share:
  - prefix : /api/v1/cms
  - auth   : require_cms_user (minimum) via each sub-router's Depends
"""

import sys, os, uuid, json, logging
from typing import Optional, List
from datetime import datetime

_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db

_plugin_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _plugin_dir not in sys.path:
    sys.path.insert(0, _plugin_dir)

from cms_core.middleware import require_workspace_admin, get_current_workspace
from cms_core.models.cms_tables import (
    Workspace, Page, Card, BlogPost, MediaAsset, CMSForm, CMSSubmission
)
from cms_core.routers import pages, cards, blog, media, forms, ai as ai_router

log = logging.getLogger(__name__)

# ── Main CMS Router ────────────────────────────────────────────────────────────
router = APIRouter(prefix="/api/v1/cms")

# Mount all sub-routers
router.include_router(pages.router)
router.include_router(cards.router)
router.include_router(blog.router)
router.include_router(media.router)
router.include_router(forms.router)
router.include_router(ai_router.router)


# ── Workspace Export ───────────────────────────────────────────────────────────

@router.get("/workspaces/{workspace_slug}/export", tags=["CMS — Workspaces"])
async def export_workspace(
    workspace_slug: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_workspace_admin),
):
    """
    Export all workspace content as structured JSON.
    Includes: pages (with blocks), cards, blog posts, media assets, forms.
    Use for backups, migrations, or DPDP/GDPR data portability compliance.
    """
    pages_r   = await db.execute(select(Page).where(Page.workspace_id == workspace.id))
    cards_r   = await db.execute(select(Card).where(Card.workspace_id == workspace.id))
    blog_r    = await db.execute(select(BlogPost).where(BlogPost.workspace_id == workspace.id))
    media_r   = await db.execute(select(MediaAsset).where(MediaAsset.workspace_id == workspace.id))
    forms_r   = await db.execute(select(CMSForm).where(CMSForm.workspace_id == workspace.id))

    def _to_dict(obj):
        """Convert ORM object to plain dict, ISO-formatting datetime fields."""
        d = {}
        for col in obj.__table__.columns:
            val = getattr(obj, col.name)
            if isinstance(val, datetime):
                val = val.isoformat()
            d[col.name] = val
        return d

    export_data = {
        "exported_at": datetime.utcnow().isoformat() + "Z",
        "workspace": {"slug": workspace.slug, "name": workspace.name, "plan": workspace.plan},
        "pages":       [_to_dict(p) for p in pages_r.scalars().all()],
        "cards":       [_to_dict(c) for c in cards_r.scalars().all()],
        "blog_posts":  [_to_dict(b) for b in blog_r.scalars().all()],
        "media_assets":[_to_dict(m) for m in media_r.scalars().all()],
        "forms":       [_to_dict(f) for f in forms_r.scalars().all()],
    }

    log.info(f"[cms] Workspace export: {workspace.slug} — "
             f"{len(export_data['pages'])} pages, {len(export_data['blog_posts'])} posts")
    return export_data
