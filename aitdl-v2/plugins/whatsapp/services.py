# || ॐ श्री गणेशाय नमः ||
#
# Organization: AITDL
# Description : WhatsApp Business API Service (Meta Cloud API)
#

import os
import logging
import httpx

log = logging.getLogger(__name__)

class WhatsAppService:
    def __init__(self):
        self.phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
        self.access_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
        self.api_version = os.getenv("WHATSAPP_API_VERSION", "v21.0")
        
        self.base_url = f"https://graph.facebook.com/{self.api_version}"
        
        # In STUB mode, we just log instead of sending real messages
        self.is_stub = os.getenv("WHATSAPP_STUB_MODE", "true").lower() == "true"

    def _get_headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }

    async def send_text_message(self, to_phone: str, text: str) -> dict:
        """
        Sends a standard text message. Note: Meta requires an active 24-hr session 
        for free-form text messages. Otherwise, you must use a template.
        """
        if self.is_stub:
            log.info(f"[WhatsApp STUB] Text Message to {to_phone}: {text}")
            return {"status": "stub", "to": to_phone, "message": text}
            
        if not self.phone_number_id or not self.access_token:
            log.warning("WhatsApp credentials missing. Skipping message send.")
            return {"error": "Missing credentials"}

        url = f"{self.base_url}/{self.phone_number_id}/messages"
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to_phone,
            "type": "text",
            "text": {
                "preview_url": False,
                "body": text
            }
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=self._get_headers(), json=payload, timeout=10.0)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            log.error(f"Failed to send WhatsApp text message: {e}")
            return {"error": str(e)}

    async def send_template_message(self, to_phone: str, template_name: str, language_code: str = "en_US", components: list = None) -> dict:
        """
        Sends a predefined WhatsApp template message. This is required for initiating 
        conversations outside the 24-hour window.
        """
        if self.is_stub:
            log.info(f"[WhatsApp STUB] Template '{template_name}' to {to_phone}. Components: {components}")
            return {"status": "stub", "to": to_phone, "template": template_name}

        if not self.phone_number_id or not self.access_token:
            log.warning("WhatsApp credentials missing. Skipping template send.")
            return {"error": "Missing credentials"}

        url = f"{self.base_url}/{self.phone_number_id}/messages"
        payload = {
            "messaging_product": "whatsapp",
            "to": to_phone,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {
                    "code": language_code
                }
            }
        }
        
        if components:
            payload["template"]["components"] = components

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=self._get_headers(), json=payload, timeout=10.0)
                if response.status_code >= 400:
                    log.error(f"WhatsApp API Error: {response.text}")
                response.raise_for_status()
                return response.json()
        except Exception as e:
            log.error(f"Failed to send WhatsApp template message: {e}")
            return {"error": str(e)}

whatsapp_service = WhatsAppService()
