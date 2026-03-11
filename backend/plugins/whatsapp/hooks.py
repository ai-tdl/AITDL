import logging
import asyncio
import os
from services import hooks
from plugins.whatsapp.services import whatsapp_service

log = logging.getLogger(__name__)

# To receive internal alerts, we need the admin's registered phone number
ADMIN_PHONE = os.getenv("WHATSAPP_ADMIN_PHONE")

async def on_lead_received(contact_record):
    if not ADMIN_PHONE:
        log.warning("[WhatsApp] WHATSAPP_ADMIN_PHONE not set. Cannot send lead alert.")
        return
        
    log.info(f"[WhatsApp] Sending new lead alert to Admin for lead: {contact_record.name}")
    text = (
        f"🚨 *New AITDL Lead*\n\n"
        f"Name: {contact_record.name}\n"
        f"Phone: {contact_record.phone}\n"
        f"Email: {contact_record.email}\n"
        f"Section: {contact_record.section}\n\n"
        f"Message: {contact_record.message}"
    )
    # Fire and forget; don't block the API response
    asyncio.create_task(whatsapp_service.send_text_message(ADMIN_PHONE, text))

async def on_partner_applied(partner_record):
    if not ADMIN_PHONE:
        return
        
    log.info(f"[WhatsApp] Sending new partner app alert to Admin for: {partner_record.name}")
    text = (
        f"🤝 *New Partner Application*\n\n"
        f"Name: {partner_record.name}\n"
        f"Phone: {partner_record.phone}\n"
        f"City: {partner_record.city}\n"
        f"Occupation: {partner_record.occupation}"
    )
    asyncio.create_task(whatsapp_service.send_text_message(ADMIN_PHONE, text))

async def on_partner_approved(partner_record):
    log.info(f"[WhatsApp] Sending approval welcome template to: {partner_record.phone}")
    
    # As per Meta's policy, we use a pre-approved template to initiate a conversation with an end-user.
    template_name = "partner_welcome" 
    
    components = [
        {
            "type": "body",
            "parameters": [
                {
                    "type": "text",
                    "text": partner_record.name
                }
            ]
        }
    ]
    
    # Ensure phone has country code. Most AITDL users are in India.
    phone = partner_record.phone
    if not phone.startswith("+") and not phone.startswith("91") and len(phone) == 10:
        phone = f"91{phone}"
    elif phone.startswith("+"):
        phone = phone[1:] # Meta API expects phone without '+'
        
    asyncio.create_task(whatsapp_service.send_template_message(phone, template_name, components=components))

async def on_whatsapp_notify(event: str, workspace_id: str, **kwargs):
    if not ADMIN_PHONE:
        return
        
    log.info(f"[WhatsApp] Sending CMS alert to Admin for event: {event}")
    
    if event == "form_submission":
        form_id = kwargs.get("form_id")
        text = (
            f"📋 *New CMS Form Submission*\n\n"
            f"Workspace: {workspace_id}\n"
            f"Form ID: {form_id}\n"
            f"Submission ID: {kwargs.get('submission_id')}"
        )
        asyncio.create_task(whatsapp_service.send_text_message(ADMIN_PHONE, text))

hooks.register("on_lead_received", on_lead_received)
hooks.register("on_partner_applied", on_partner_applied)
hooks.register("on_partner_approved", on_partner_approved)
hooks.register("on_whatsapp_notify", on_whatsapp_notify)
