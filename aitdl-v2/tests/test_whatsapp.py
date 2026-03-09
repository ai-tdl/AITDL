import pytest
import asyncio
from unittest.mock import patch, AsyncMock
from plugins.whatsapp.services import WhatsAppService
from plugins.whatsapp.hooks import on_lead_received, on_partner_applied, on_partner_approved
from models.db_tables import ContactRecord, PartnerRecord

@pytest.fixture
def mock_whatsapp_service(monkeypatch):
    """
    Mock the whatsapp service methods to avoid actually calling Meta APIs,
    while capturing the calls for assertion.
    """
    service = WhatsAppService()
    service.is_stub = False
    service.phone_number_id = "123"
    service.access_token = "abc"
    
    # Mock the httpx calls
    mock_post = AsyncMock()
    # Need to patch httpx.AsyncClient.post
    monkeypatch.setattr("httpx.AsyncClient.post", mock_post)
    return service

@pytest.mark.asyncio
async def test_whatsapp_service_stub_mode():
    service = WhatsAppService()
    service.is_stub = True  # Override to ensure stub mode
    
    res = await service.send_text_message("9876543210", "Test Message")
    assert res["status"] == "stub"
    assert res["to"] == "9876543210"

@pytest.mark.asyncio
async def test_on_lead_received_hook(monkeypatch):
    # Mock environment
    monkeypatch.setenv("WHATSAPP_ADMIN_PHONE", "919876543210")
    
    # Needs to reload or re-evaluate ADMIN_PHONE inside hooks.py since it's module level
    import plugins.whatsapp.hooks as hooks_module
    hooks_module.ADMIN_PHONE = "919876543210"
    
    with patch("plugins.whatsapp.services.whatsapp_service.send_text_message", new_callable=AsyncMock) as mock_send:
        record = ContactRecord(
            name="John Doe", phone="1234567890", email="john@example.com",
            section="AI Training", business="Startups", city="Mumbai", message="Hello"
        )
        
        await on_lead_received(record)
        
        # Give event loop a tiny tick for asyncio.create_task to run
        await asyncio.sleep(0.01)
        
        mock_send.assert_called_once()
        args, _ = mock_send.call_args
        assert args[0] == "919876543210"
        assert "John Doe" in args[1]
        assert "AI Training" in args[1]

@pytest.mark.asyncio
async def test_on_partner_approved_hook():
    with patch("plugins.whatsapp.services.whatsapp_service.send_template_message", new_callable=AsyncMock) as mock_send_template:
        record = PartnerRecord(
            name="Jane Doe", phone="9876543210", email="jane@example.com",
            city="Pune", occupation="Developer", message="Hello", status="approved"
        )
        
        await on_partner_approved(record)
        
        await asyncio.sleep(0.01)
        
        mock_send_template.assert_called_once()
        args, kwargs = mock_send_template.call_args
        assert args[0] == "919876543210"  # Ensure it prepended 91 if it was 10 digits
        assert args[1] == "partner_welcome"
        
        components = kwargs.get("components")
        assert len(components) == 1
        assert components[0]["parameters"][0]["text"] == "Jane Doe"
