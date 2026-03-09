import logging
from services import hooks

log = logging.getLogger(__name__)

def on_partner_approved(partner_data):
    log.info(f"[WhatsApp] Sending approval welcome message to: {partner_data.get('phone')}")

hooks.register("on_partner_approved", on_partner_approved)
