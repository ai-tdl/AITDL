# || ॐ श्री गणेशाय नमः ||
#
# Organization: AITDL
# AITDL — A Living Knowledge Ecosystem for AI Technology Development Lab
#
# Creator: Jawahar R. Mallah
#
# Then: 628 CE · Brahmasphuṭasiddhānta
# Now: 9 March MMXXVI · Vikram Samvat 2082
#
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com

"""
CMS Blog Router — plugins/cms-core/routers/blog.py

Endpoints:
    GET    /api/v1/cms/blog               — list posts
    POST   /api/v1/cms/blog               — create post
    GET    /api/v1/cms/blog/{id}          — get single post
    PATCH  /api/v1/cms/blog/{id}          — update post (auto-save friendly)
    POST   /api/v1/cms/blog/{id}/publish  — publish (fires hook + AI SEO auto-fill)
"""

import sys, os, uuid, logging
from datetime import datetime, timezone
from typing import Optional, List

_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "backend"))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services import hooks

_plugin_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _plugin_dir not in sys.path:
    sys.path.insert(0, _plugin_dir)

from cms_core.middleware import require_cms_user, get_current_workspace
from cms_core.models.cms_tables import BlogPost, Workspace, ContentVersion, CMSAuditLog

log = logging.getLogger(__name__)
router = APIRouter(tags=["CMS — Blog"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class BlogCreate(BaseModel):
    title:         str       = Field(..., min_length=1, max_length=500)
    slug:          str       = Field(..., min_length=1, max_length=255, pattern=r'^[a-z0-9/_-]+$')
    content:       list      = Field(default_factory=list)   # JSONB rich text nodes
    tags:          List[str] = Field(default_factory=list)

class BlogUpdate(BaseModel):
    title:           Optional[str]      = Field(default=None, max_length=500)
    slug:            Optional[str]      = None
    content:         Optional[list]     = None
    tags:            Optional[List[str]] = None
    seo_title:       Optional[str]      = Field(default=None, max_length=60)
    seo_description: Optional[str]      = Field(default=None, max_length=155)
    ai_summary:      Optional[str]      = None

class BlogOut(BaseModel):
    id: uuid.UUID; workspace_id: uuid.UUID; title: str; slug: str
    content: list; author_id: Optional[str]; status: str
    featured_image: Optional[uuid.UUID]; ai_summary: Optional[str]
    tags: list; seo_title: Optional[str]; seo_description: Optional[str]
    last_modified_by: Optional[str]
    published_at: Optional[datetime]
    created_at: datetime; updated_at: datetime
    class Config: from_attributes = True


# ── Helpers ────────────────────────────────────────────────────────────────────

async def _get_post_or_404(post_id: uuid.UUID, workspace_id: uuid.UUID, db: AsyncSession) -> BlogPost:
    result = await db.execute(
        select(BlogPost).where(BlogPost.id == post_id, BlogPost.workspace_id == workspace_id)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post

async def _audit(db, workspace_id, actor, action, rid, diff=None):
    db.add(CMSAuditLog(id=uuid.uuid4(), workspace_id=workspace_id,
                       actor_email=actor, action=action, resource_type="blog_post",
                       resource_id=str(rid), diff=diff))


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("/blog", response_model=List[BlogOut])
async def list_posts(
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_cms_user),
    status_filter: Optional[str] = None,
    tag: Optional[str] = None,
):
    """List blog posts. Filter by status (draft|review|published) or tag."""
    q = select(BlogPost).where(BlogPost.workspace_id == workspace.id)
    if status_filter:
        q = q.where(BlogPost.status == status_filter)
    if tag:
        q = q.where(BlogPost.tags.contains([tag]))
    q = q.order_by(BlogPost.created_at.desc())
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/blog", response_model=BlogOut, status_code=status.HTTP_201_CREATED)
async def create_post(
    body: BlogCreate,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_cms_user),
):
    """Create a new blog post (draft)."""
    exists = await db.execute(
        select(BlogPost).where(BlogPost.workspace_id == workspace.id, BlogPost.slug == body.slug)
    )
    if exists.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Slug '{body.slug}' already exists")

    actor = payload.get("sub", "unknown")
    post = BlogPost(
        id=uuid.uuid4(), workspace_id=workspace.id,
        title=body.title, slug=body.slug, content=body.content,
        author_id=actor, status="draft", tags=body.tags,
        last_modified_by=actor,
    )
    db.add(post)
    await _audit(db, workspace.id, actor, "created", post.id)
    await db.commit()
    await db.refresh(post)
    return post


@router.get("/blog/{post_id}", response_model=BlogOut)
async def get_post(
    post_id: uuid.UUID,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_cms_user),
):
    """Get a single blog post by ID."""
    return await _get_post_or_404(post_id, workspace.id, db)


@router.patch("/blog/{post_id}", response_model=BlogOut)
async def update_post(
    post_id: uuid.UUID,
    body: BlogUpdate,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_cms_user),
):
    """
    Update a blog post. Safe for auto-save (30s interval) — partial updates only.
    Saves a content version snapshot on every call.
    """
    post = await _get_post_or_404(post_id, workspace.id, db)
    actor = payload.get("sub", "unknown")

    # Save version snapshot
    version_result = await db.execute(
        select(ContentVersion).where(
            ContentVersion.resource_type == "blog_post",
            ContentVersion.resource_id == post_id
        )
    )
    existing = version_result.scalars().all()
    db.add(ContentVersion(
        id=uuid.uuid4(), workspace_id=workspace.id,
        resource_type="blog_post", resource_id=post_id,
        version_num=len(existing) + 1,
        snapshot={"title": post.title, "slug": post.slug, "content": post.content},
        saved_by=actor,
    ))

    if body.title is not None:           post.title = body.title
    if body.slug is not None:            post.slug = body.slug
    if body.content is not None:         post.content = body.content
    if body.tags is not None:            post.tags = body.tags
    if body.seo_title is not None:       post.seo_title = body.seo_title
    if body.seo_description is not None: post.seo_description = body.seo_description
    if body.ai_summary is not None:      post.ai_summary = body.ai_summary
    post.last_modified_by = actor
    post.updated_at = datetime.now(timezone.utc)

    await _audit(db, workspace.id, actor, "updated", post_id)
    await db.commit()
    await db.refresh(post)
    return post


@router.post("/blog/{post_id}/publish", response_model=BlogOut)
async def publish_post(
    post_id: uuid.UUID,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_cms_user),
):
    """
    Publish a blog post. Sets status=published and published_at=now.
    Fires on_content_published hook (analytics, WhatsApp plugins will respond).
    AI SEO auto-fill is triggered if seo_title/seo_description are empty
    (handled by the AI router — call /api/v1/cms/ai/seo separately for now).
    """
    post = await _get_post_or_404(post_id, workspace.id, db)
    if post.status == "published":
        raise HTTPException(status_code=400, detail="Post is already published")

    actor = payload.get("sub", "unknown")
    post.status = "published"
    post.published_at = datetime.now(timezone.utc)
    post.last_modified_by = actor
    post.updated_at = datetime.now(timezone.utc)

    await _audit(db, workspace.id, actor, "published", post_id)
    await db.commit()
    await db.refresh(post)

    # Fire hook — non-blocking, other plugins will react
    await hooks.trigger(
        "on_content_published",
        resource_type="blog_post",
        resource_id=post_id,
        workspace_id=workspace.id,
        title=post.title,
        slug=post.slug,
    )
    log.info(f"[cms] Blog post published: {post_id} by {actor}")
    return post
