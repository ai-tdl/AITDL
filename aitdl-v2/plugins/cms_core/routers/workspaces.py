# || ॐ श्री गणेशाय नमः ||

import logging
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from core.database import get_db
from cms_core.middleware import require_workspace_admin, get_current_workspace, require_cms_user
from cms_core.models.cms_tables import (
    Workspace, Page, Card, BlogPost, MediaAsset, CMSForm, CMSSubmission, Block
)
from cms_core.services.onboarding import seed_new_workspace

log = logging.getLogger(__name__)

router = APIRouter(tags=["CMS — Workspaces"])

# ── Schemas ────────────────────────────────────────────────────────────────────

class WorkspaceCreate(BaseModel):
    name: str = Field(..., max_length=120)
    slug: str = Field(..., max_length=120)
    plan: str = Field(default="starter")
    ai_credits_limit: int = Field(default=1000)

class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    plan: Optional[str] = None
    ai_credits_limit: Optional[int] = None
    is_active: Optional[bool] = None

class WorkspaceResponse(BaseModel):
    id: str
    name: str
    slug: str
    plan: str
    ai_credits_used: int
    ai_credits_limit: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class WorkspaceStats(BaseModel):
    pages_count: int
    blog_posts_count: int
    forms_count: int
    submissions_count: int
    media_assets_count: int
    ai_credits_used: int
    ai_credits_limit: int


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("/workspaces", response_model=List[WorkspaceResponse])
async def list_workspaces(
    db: AsyncSession = Depends(get_db),
    # Need to be a top-level admin to list all workspaces
    # Temporarily using require_cms_user for V1 till Superadmin RBAC is fully flushed out
    user: dict = Depends(require_cms_user),
):
    """List all workspaces. Intended for superadmin dashboard."""
    # In a real superadmin scenario, we would check user['role'] == 'superadmin'
    result = await db.execute(select(Workspace).order_by(Workspace.created_at.desc()))
    return result.scalars().all()


@router.post("/workspaces", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    req: WorkspaceCreate,
    db: AsyncSession = Depends(get_db),
    # Temporarily wide open for V1
    user: dict = Depends(require_cms_user),
):
    """Create a new client workspace and run the onboarding content seed."""
    # Check duplicate
    existing = await db.scalar(select(Workspace).where(Workspace.slug == req.slug))
    if existing:
        raise HTTPException(400, "Workspace slug already exists.")

    new_workspace = Workspace(
        id=str(import_uuid().uuid4()),
        name=req.name,
        slug=req.slug,
        plan=req.plan,
        ai_credits_limit=req.ai_credits_limit
    )
    db.add(new_workspace)
    
    # Auto-seed
    await seed_new_workspace(new_workspace.id, db, admin_email=user["sub"])
    
    log.info(f"[cms] Created new workspace '{req.slug}' (plan: {req.plan})")
    
    # Refresh to get generated datetimes
    await db.refresh(new_workspace)
    return new_workspace


@router.patch("/workspaces/{slug}", response_model=WorkspaceResponse)
async def update_workspace(
    slug: str,
    req: WorkspaceUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_cms_user),
):
    """Update workspace plan, credit limits, or active status."""
    workspace = await db.scalar(select(Workspace).where(Workspace.slug == slug))
    if not workspace:
        raise HTTPException(404, "Workspace not found.")
        
    update_data = req.model_dump(exclude_unset=True)
    if not update_data:
        return workspace
        
    for k, v in update_data.items():
        setattr(workspace, k, v)
        
    workspace.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(workspace)
        
    log.info(f"[cms] Updated workspace '{slug}': {update_data}")
    return workspace


@router.get("/workspaces/{workspace_slug}/export")
async def export_workspace(
    workspace_slug: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_workspace_admin),
):
    """
    Export all workspace content as structured JSON.
    Use for backups, migrations, or DPDP/GDPR data portability compliance.
    """
    pages_r   = await db.execute(select(Page).where(Page.workspace_id == workspace.id))
    cards_r   = await db.execute(select(Card).where(Card.workspace_id == workspace.id))
    blog_r    = await db.execute(select(BlogPost).where(BlogPost.workspace_id == workspace.id))
    media_r   = await db.execute(select(MediaAsset).where(MediaAsset.workspace_id == workspace.id))
    forms_r   = await db.execute(select(CMSForm).where(CMSForm.workspace_id == workspace.id))

    def _to_dict(obj):
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

    log.info(f"[cms] Workspace export: {workspace.slug} — {len(export_data['pages'])} pages")
    return export_data


@router.get("/workspaces/{workspace_slug}/stats", response_model=WorkspaceStats)
async def get_workspace_stats(
    workspace_slug: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_workspace_admin),
):
    """Return aggregate usage stats for the CMS dashboard."""
    pages_count = await db.scalar(select(func.count(Page.id)).where(Page.workspace_id == workspace.id))
    blogs_count = await db.scalar(select(func.count(BlogPost.id)).where(BlogPost.workspace_id == workspace.id))
    forms_count = await db.scalar(select(func.count(CMSForm.id)).where(CMSForm.workspace_id == workspace.id))
    subs_count = await db.scalar(select(func.count(CMSSubmission.id)).where(CMSSubmission.workspace_id == workspace.id))
    media_count = await db.scalar(select(func.count(MediaAsset.id)).where(MediaAsset.workspace_id == workspace.id))

    return {
        "pages_count": pages_count or 0,
        "blog_posts_count": blogs_count or 0,
        "forms_count": forms_count or 0,
        "submissions_count": subs_count or 0,
        "media_assets_count": media_count or 0,
        "ai_credits_used": workspace.ai_credits_used,
        "ai_credits_limit": workspace.ai_credits_limit
    }

def import_uuid():
    import uuid
    return uuid
