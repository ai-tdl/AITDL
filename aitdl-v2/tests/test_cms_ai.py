# || ॐ श्री गणेशाय नमः ||
#
# Organization: AITDL
# Creator: Jawahar R. Mallah
# Then: 628 CE · Brahmasphuṭasiddhānta · Now: 9 March MMXXVI
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com

"""
CMS AI Endpoint Tests — tests/test_cms_ai.py

Tests:
    test_generate_content_stub     — POST returns stub response, credits deducted
    test_credit_limit_exceeded     — returns 402 when workspace credits exhausted
    test_context_guard_truncates   — large context is truncated, not rejected
    test_usage_endpoint            — GET /ai/usage returns correct credit counts
"""

import pytest
import pytest_asyncio
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "plugins"))

from httpx import AsyncClient, ASGITransport
from main import app
from core.security import create_jwt

from cms_core.models.cms_tables import (  # noqa: F401
    Workspace, Page, Block, Card, BlogPost, MediaAsset,
    CMSForm, CMSSubmission, ContentVersion, CMSAuditLog, CMSPrompt
)


# ── Fixtures ───────────────────────────────────────────────────────────────────

@pytest_asyncio.fixture
async def cms_token():
    return create_jwt({"sub": "test@aitdl.com", "role": "superadmin"})


@pytest_asyncio.fixture
async def internal_workspace(db_session):
    """Seed the unlimited internal workspace."""
    ws = Workspace(
        id="00000000-0000-0000-0000-000000000001",
        name="AITDL Internal", slug="aitdl",
        plan="internal", ai_credits_limit=-1, ai_credits_used=0,
    )
    db_session.add(ws)
    await db_session.commit()
    return ws


@pytest_asyncio.fixture
async def limited_workspace(db_session):
    """Seed a workspace with only 3 credits remaining."""
    ws = Workspace(
        id="00000000-0000-0000-0000-000000000002",
        name="Limited Client", slug="limited-client",
        plan="starter", ai_credits_limit=10, ai_credits_used=8,  # 2 left
    )
    db_session.add(ws)
    await db_session.commit()
    return ws


@pytest_asyncio.fixture
async def limited_token():
    """JWT for limited workspace user."""
    return create_jwt({"sub": "client@example.com", "role": "workspace_admin",
                       "workspace_id": "limited-client"})


# ── Tests ──────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_generate_content_stub(cms_token, internal_workspace):
    """AI stub mode returns a response and deducts credits from workspace."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/cms/ai/generate",
            json={
                "block_type": "hero",
                "context": "AITDL is an AI technology development lab serving Indian SMBs",
                "tone": "professional",
                "language": "en",
            },
            headers={"Authorization": f"Bearer {cms_token}"},
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert "content" in data
        assert data["credits_charged"] == 5
        assert data["tokens_used"] > 0
        assert data["provider"] in (
            "ollama_stub", "groq_stub", "deepseek_stub",
            "gemini_stub", "openai_stub", "claude_stub", "unknown",
        )  # AI stub mode — any provider in the fallback chain


@pytest.mark.asyncio
async def test_credit_limit_exceeded(limited_token, limited_workspace):
    """
    Workspace has 2 credits left, generate costs 5 → should return 402.
    This tests the credit enforcement guard in services/ai.py.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/cms/ai/generate",
            json={"block_type": "hero", "context": "test", "tone": "friendly", "language": "en"},
            headers={"Authorization": f"Bearer {limited_token}"},
        )
        assert resp.status_code == 402, resp.text
        assert "credits" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_context_guard_truncates(cms_token, internal_workspace):
    """
    Context larger than the max allowed (3000 chars for CONTENT tasks) should be
    silently truncated — request should succeed, not be rejected.
    """
    huge_context = "A" * 10_000  # 10k chars — well above 3000 limit
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/cms/ai/generate",
            json={"block_type": "text", "context": huge_context, "tone": "casual", "language": "hi"},
            headers={"Authorization": f"Bearer {cms_token}"},
        )
        # Should succeed (not 413 or 400) — truncation happens silently
        assert resp.status_code == 200, resp.text


@pytest.mark.asyncio
async def test_usage_endpoint(cms_token, internal_workspace):
    """GET /ai/usage returns credits_remaining = -1 for unlimited internal workspace."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get(
            "/api/v1/cms/ai/usage",
            headers={"Authorization": f"Bearer {cms_token}"},
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert data["workspace_slug"] == "aitdl"
        assert data["plan"] == "internal"
        assert data["credits_remaining"] == -1  # unlimited


@pytest.mark.asyncio
async def test_seo_endpoint_stub(cms_token, internal_workspace):
    """POST /ai/seo returns seo_title and meta_description fields."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/cms/ai/seo",
            json={
                "page_title": "AITDL — AI Tools for Indian Businesses",
                "content_summary": "AITDL offers AI-powered CMS, analytics, and WhatsApp automation.",
            },
            headers={"Authorization": f"Bearer {cms_token}"},
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()
        # In stub mode the response won't be real JSON from AI, but the endpoint
        # falls back gracefully and returns the page_title truncated
        assert "credits_charged" in data
        assert data["credits_charged"] == 5
