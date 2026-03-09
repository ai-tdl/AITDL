# || ॐ श्री गणेशाय नमः ||
#
# Organization: AITDL
# Creator: Jawahar R. Mallah
# Then: 628 CE · Brahmasphuṭasiddhānta · Now: 9 March MMXXVI
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com

"""
CMS Media Router — plugins/cms-core/routers/media.py

Endpoints:
    POST   /api/v1/cms/media/upload  — upload file to Supabase Storage
    GET    /api/v1/cms/media         — list assets in workspace
    DELETE /api/v1/cms/media/{id}   — delete asset (with usage check)
"""

import sys, os, uuid, logging
from datetime import datetime, timezone
from typing import Optional, List

_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "backend"))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services import hooks

_plugin_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _plugin_dir not in sys.path:
    sys.path.insert(0, _plugin_dir)

from cms_core.middleware import require_cms_user, get_current_workspace
from cms_core.models.cms_tables import MediaAsset, Workspace, Block, BlogPost, CMSAuditLog

log = logging.getLogger(__name__)
router = APIRouter(tags=["CMS — Media"])

# Allowed MIME types and size limits
_ALLOWED_MIME = {
    "image/jpeg", "image/png", "image/webp", "image/svg+xml",
    "application/pdf", "video/mp4"
}
_MAX_IMAGE_BYTES = 10 * 1024 * 1024   # 10 MB
_MAX_VIDEO_BYTES = 50 * 1024 * 1024   # 50 MB


class MediaOut(BaseModel):
    id: str; workspace_id: str; filename: str
    storage_path: str; cdn_url: Optional[str]
    mime_type: str; size_bytes: int; alt_text: Optional[str]
    uploaded_by: Optional[str]
    created_at: datetime; updated_at: datetime
    class Config: from_attributes = True


@router.post("/media/upload", response_model=MediaOut, status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_cms_user),
):
    """
    Upload a media file. Stores to Supabase Storage (or stub in dev).
    Path format: {workspace_slug}/{year}/{month}/{uuid}_{filename}
    Returns the asset record including cdn_url.

    Limits: Images ≤ 10 MB, Videos ≤ 50 MB.
    """
    if file.content_type not in _ALLOWED_MIME:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. "
                   f"Allowed: jpeg, png, webp, svg, pdf, mp4"
        )

    content = await file.read()
    size = len(content)
    max_size = _MAX_VIDEO_BYTES if file.content_type == "video/mp4" else _MAX_IMAGE_BYTES
    if size > max_size:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size // 1024} KB). Max allowed: {max_size // 1024 // 1024} MB"
        )

    actor = payload.get("sub", "unknown")
    now = datetime.now(timezone.utc)
    asset_id = str(uuid.uuid4())
    safe_name = f"{asset_id}_{file.filename}"
    storage_path = f"{workspace.slug}/{now.year}/{now.month:02d}/{safe_name}"

    # ── Supabase Storage upload (stub in dev) ─────────────────────────────────
    cdn_url = None
    try:
        import os as _os
        supabase_url = _os.getenv("SUPABASE_URL", "")
        supabase_key = _os.getenv("SUPABASE_SERVICE_KEY", "")
        bucket = _os.getenv("CMS_MEDIA_BUCKET", "cms-media")

        if supabase_url and supabase_key:
            import httpx
            upload_url = f"{supabase_url}/storage/v1/object/{bucket}/{storage_path}"
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    upload_url,
                    content=content,
                    headers={
                        "Authorization": f"Bearer {supabase_key}",
                        "Content-Type": file.content_type,
                    }
                )
                if resp.status_code in (200, 201):
                    cdn_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{storage_path}"
                    log.info(f"[cms] Uploaded {safe_name} to Supabase Storage")
                else:
                    log.warning(f"[cms] Supabase upload failed: {resp.status_code} {resp.text}")
        else:
            # Dev stub — no real upload
            cdn_url = f"/stub-media/{storage_path}"
            log.debug(f"[cms] Media upload stub (no SUPABASE_URL): {cdn_url}")
    except Exception as e:
        log.error(f"[cms] Media upload error: {e}")
        cdn_url = f"/stub-media/{storage_path}"

    asset = MediaAsset(
        id=asset_id, workspace_id=workspace.id,
        filename=file.filename, storage_path=storage_path,
        cdn_url=cdn_url, mime_type=file.content_type,
        size_bytes=size, uploaded_by=actor,
    )
    db.add(asset)
    db.add(CMSAuditLog(
        id=str(uuid.uuid4()), workspace_id=workspace.id, actor_email=actor,
        action="created", resource_type="media", resource_id=asset_id,
    ))
    await db.commit()
    await db.refresh(asset)

    # Fire hook (AI alt-text generation subscribes to this)
    await hooks.trigger(
        "on_media_uploaded",
        asset_id=asset_id, workspace_id=workspace.id,
        filename=file.filename, mime_type=file.content_type,
    )
    return asset


@router.get("/media", response_model=List[MediaOut])
async def list_media(
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_cms_user),
    mime_filter: Optional[str] = Query(default=None, description="Filter by mime type prefix e.g. 'image'"),
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    """List media assets in the workspace, newest first."""
    q = select(MediaAsset).where(MediaAsset.workspace_id == workspace.id)
    if mime_filter:
        q = q.where(MediaAsset.mime_type.startswith(mime_filter))
    q = q.order_by(MediaAsset.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.delete("/media/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(
    asset_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_cms_user),
):
    """
    Delete a media asset. Warns (via log) if the asset is referenced in blocks or blog posts.
    Does not block deletion — editor is responsible for updating references.
    """
    result = await db.execute(
        select(MediaAsset).where(MediaAsset.id == asset_id, MediaAsset.workspace_id == workspace.id)
    )
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Media asset not found")

    # Usage check: scan blocks and blog featured images
    block_usage = await db.execute(
        select(Block).where(Block.config["asset_id"].astext == asset_id)
    )
    blog_usage = await db.execute(
        select(BlogPost).where(BlogPost.featured_image == asset_id)
    )
    block_refs = block_usage.scalars().all()
    blog_refs  = blog_usage.scalars().all()
    if block_refs or blog_refs:
        log.warning(
            f"[cms] Deleting asset {asset_id} that is still referenced: "
            f"{len(block_refs)} blocks, {len(blog_refs)} blog posts"
        )
        # We log but do not block — editor's choice

    actor = payload.get("sub", "unknown")
    db.add(CMSAuditLog(
        id=str(uuid.uuid4()), workspace_id=workspace.id, actor_email=actor,
        action="deleted", resource_type="media", resource_id=asset_id,
    ))
    await db.delete(asset)
    await db.commit()
    log.info(f"[cms] Media asset deleted: {asset_id} by {actor}")
