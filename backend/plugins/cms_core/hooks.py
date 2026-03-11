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
CMS Plugin Hooks — plugins/cms-core/hooks.py

Purpose : Registers cms-core event handlers into the global AITDL hooks system.
          Called automatically by plugin_loader when the plugin is loaded.

Events Registered:
    on_content_published  — fires when a page or blog post is published
    on_media_uploaded     — fires when a media asset is uploaded
    on_form_submitted     — fires when a CMS form receives a submission

Input   : None (side-effect only — registers callbacks into services.hooks)
Output  : None
"""

import logging
import sys
import os
from typing import Optional

log = logging.getLogger(__name__)

# Resolve backend path so we can import from services.hooks
_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from services import hooks
from core.database import get_db
from sqlalchemy import select, text
from cms_core.models.cms_tables import MediaAsset, Workspace, BlogPost
from cms_core.services import ai as cms_ai
import json


# ── Hook Handlers ──────────────────────────────────────────────────────────────

async def _on_content_published(resource_type: str, resource_id: str, workspace_id: str, **kwargs) -> None:
    """
    Fires when a page or blog post transitions to 'published' status.

    Current behaviour (Phase 1):
      - Logs a CDN invalidation event (stub — real CDN integration in Phase 4)
      - Other plugins (analytics, whatsapp) can listen to this same event
        independently without any coupling to cms-core.

    Args:
        resource_type : 'page' | 'blog_post'
        resource_id   : UUID of the published resource
        workspace_id  : Workspace that owns the resource
    """
    log.info(
        f"[cms-core] on_content_published: type={resource_type} "
        f"id={resource_id} workspace={workspace_id}"
    )
    # Trigger CDN invalidation placeholder
    log.info(f"[cms-core] Triggering CDN invalidation for {resource_type}:{resource_id} at edge gateways")
    # Real implementation would call Vercel/Cloudflare API here.

    # If it's a blog post, trigger specific blog hooks (AI summarization, etc.)
    if resource_type == "blog_post":
        await hooks.trigger("on_blog_published", resource_id=resource_id, workspace_id=workspace_id, **kwargs)


async def _on_media_uploaded(asset_id: str, workspace_id: str, filename: str, mime_type: str, **kwargs) -> None:
    """
    Fires when a media asset is uploaded to Supabase Storage.

    Current behaviour (Phase 1):
      - Logs the upload event
      - In Phase 3 (AI Layer), this will call ai.py to auto-generate alt text
        if the asset has no alt_text set.

    Args:
        asset_id     : UUID of the new MediaAsset record
        workspace_id : Workspace that owns the asset
        filename     : Original uploaded filename
        mime_type    : MIME type of the uploaded file
    """
    log.info(
        f"[cms-core] on_media_uploaded: asset={asset_id} "
        f"workspace={workspace_id} file={filename} type={mime_type}"
    )
    
    # Process AI Alt-Text generation
    if mime_type.startswith("image/"):
        async for db in get_db():
            # Get workspace to check credits
            ws_res = await db.execute(select(Workspace).where(Workspace.id == workspace_id))
            workspace = ws_res.scalar_one_or_none()
            if not workspace:
                log.warning(f"[cms-core] Workspace {workspace_id} not found for alt-text generation")
                break
                
            try:
                result = await cms_ai.generate_alt_text(
                    filename=filename,
                    context=f"Image uploaded to workspace {workspace.name}",
                    workspace=workspace,
                    db=db
                )
                alt_text = result.get("alt_text")
                if alt_text:
                    await db.execute(
                        text("UPDATE media_assets SET alt_text = :text WHERE id = :id"),
                        {"text": alt_text, "id": asset_id}
                    )
                    await db.commit()
                    log.info(f"[cms-core] AI generated alt-text for {asset_id}: {alt_text}")
            except Exception as e:
                log.error(f"[cms-core] AI alt-text generation failed for {asset_id}: {e}")
            break


async def _on_form_submitted(form_id: str, workspace_id: str, submission_id: str, notify_email: Optional[str] = None, **kwargs) -> None:
    """
    Fires when a CMS form receives a new submission.

    Current behaviour (Phase 1):
      - Logs the submission event
      - In Phase 4 (Forms), this will send an email notification and
        optionally trigger the WhatsApp plugin hook.

    Args:
        form_id       : UUID of the CMS form
        workspace_id  : Workspace that owns the form
        submission_id : UUID of the new CMSSubmission record
        notify_email  : Email address to notify (from form config)
    """
    log.info(
        f"[cms-core] on_form_submitted: form={form_id} "
        f"submission={submission_id} workspace={workspace_id}"
    )
    if notify_email:
        # Trigger email notification flow
        log.info(f"[cms-core] Dispatching email notification alert -> {notify_email}")
        # Integration with existing email service here

    # Dispatch to WhatsApp plugin hook
    await hooks.trigger(
        "on_whatsapp_notify",
        event="form_submission",
        workspace_id=workspace_id,
        form_id=form_id,
        submission_id=submission_id,
        meta={"notify_email": notify_email}
    )
    log.info(f"[cms-core] Dispatched WhatsApp notification hook for form:{form_id}")


async def _on_blog_published(resource_id: str, workspace_id: str, **kwargs) -> None:
    """
    Fires specifically for blog posts. Handles AI automation (summaries, SEO boost).
    """
    log.info(f"[cms-core] _on_blog_published: Processing AI automation for {resource_id}")
    
    async for db in get_db():
        # Fetch post content
        post_res = await db.execute(select(BlogPost).where(BlogPost.id == resource_id))
        post = post_res.scalar_one_or_none()
        if not post:
            log.warning(f"[cms-core] Blog post {resource_id} not found for summarization")
            break

        # Fetch workspace for credits
        ws_res = await db.execute(select(Workspace).where(Workspace.id == workspace_id))
        workspace = ws_res.scalar_one_or_none()
        if not workspace:
            break

        try:
            # Prepare content for AI (strip JSON structure if needed, or join text)
            full_text = ""
            for node in post.content:
                if isinstance(node, dict) and "children" in node:
                    for child in node["children"]:
                        full_text += child.get("text", "") + " "
                elif isinstance(node, str):
                    full_text += node + " "
            
            # Generate Summary
            if not post.ai_summary:
                result = await cms_ai.summarize_blog_content(
                    title=post.title,
                    content_raw=full_text,
                    workspace=workspace,
                    db=db
                )
                summary = result.get("summary")
                if summary:
                    post.ai_summary = summary
                    await db.commit()
                    log.info(f"[cms-core] AI summary generated for blog:{resource_id}")

            # Notify Analytics
            await hooks.trigger(
                "on_event_track",
                event="blog_published",
                workspace_id=workspace_id,
                resource_id=resource_id,
                meta={"title": post.title, "char_count": len(full_text)}
            )

        except Exception as e:
            log.error(f"[cms-core] AI blog automation failed for {resource_id}: {e}")
        break


# ── Registration ───────────────────────────────────────────────────────────────

def _register() -> None:
    """Register all cms-core hook handlers into the global hooks registry."""
    hooks.register("on_content_published", _on_content_published)
    hooks.register("on_blog_published", _on_blog_published)
    hooks.register("on_media_uploaded", _on_media_uploaded)
    hooks.register("on_form_submitted", _on_form_submitted)
    log.info("[cms-core] Hooks registered: on_content_published, on_blog_published, on_media_uploaded, on_form_submitted")


# Called by plugin_loader when this file is exec'd
_register()
