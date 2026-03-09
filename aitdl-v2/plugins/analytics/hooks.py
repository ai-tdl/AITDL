import logging
from services import hooks

log = logging.getLogger(__name__)

def on_lead_created(lead_data):
    log.info(f"[Analytics] Tracked new lead conversion: {lead_data.get('email')}")

hooks.register("on_lead_created", on_lead_created)
