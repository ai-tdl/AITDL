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

log = logging.getLogger(__name__)

# Resolve backend path so we can import from services.hooks
_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend"))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from services import hooks  # noqa: E402  (path adjusted above)


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
    # TODO (Phase 4): Trigger real CDN cache invalidation via Vercel/Cloudflare API
    log.debug(f"[cms-core] CDN invalidation stub triggered for {resource_type}:{resource_id}")


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
    # TODO (Phase 3): Call cms_ai.generate_alt_text(asset_id, filename, mime_type)
    # and UPDATE media_assets SET alt_text = ... WHERE id = asset_id
    log.debug(f"[cms-core] Alt-text AI generation stub triggered for asset:{asset_id}")


async def _on_form_submitted(form_id: str, workspace_id: str, submission_id: str, notify_email: str = None, **kwargs) -> None:
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
        # TODO (Phase 4): Send email via existing email service
        log.debug(f"[cms-core] Email notification stub → {notify_email}")

    # TODO (Phase 4): Trigger WhatsApp plugin via hooks.trigger('on_whatsapp_notify', ...)


# ── Registration ───────────────────────────────────────────────────────────────

def _register() -> None:
    """Register all cms-core hook handlers into the global hooks registry."""
    hooks.register("on_content_published", _on_content_published)
    hooks.register("on_media_uploaded", _on_media_uploaded)
    hooks.register("on_form_submitted", _on_form_submitted)
    log.info("[cms-core] Hooks registered: on_content_published, on_media_uploaded, on_form_submitted")


# Called by plugin_loader when this file is exec'd
_register()
