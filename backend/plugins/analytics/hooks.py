import logging
from services import hooks

log = logging.getLogger(__name__)

def on_event_track(event, workspace_id, resource_id=None, meta=None):
    """
    Centralized event tracking for the platform.
    Captures conversions, AI usage, and media uploads.
    """
    meta_str = f" | meta: {meta}" if meta else ""
    log.info(
        f"[Analytics] TRACK EVENT: {event} | workspace: {workspace_id} "
        f"| resource: {resource_id}{meta_str}"
    )

def on_lead_created(lead_data):
    workspace_id = lead_data.get("workspace_id")
    on_event_track("lead_created", workspace_id, meta={"email": lead_data.get("email")})

# Subscribe to core events
hooks.register("on_event_track", on_event_track)
hooks.register("on_lead_created", on_lead_created)

# CMS Core events
hooks.register("on_form_submitted", lambda **kw: on_event_track("form_submission", kw.get("workspace_id"), kw.get("submission_id")))
hooks.register("on_media_uploaded", lambda **kw: on_event_track("media_upload", kw.get("workspace_id"), kw.get("asset_id"), {"mime": kw.get("mime_type")}))
hooks.register("on_content_published", lambda **kw: on_event_track("content_published", kw.get("workspace_id"), kw.get("resource_id"), {"type": kw.get("resource_type")}))
