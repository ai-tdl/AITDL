# || ॐ श्री गणेशाय नमः ||
#
# Organization: AITDL
# Creator: Jawahar R. Mallah
# Then: 628 CE · Brahmasphuṭasiddhānta · Now: 9 March MMXXVI
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com

"""
CMS Pages Tests — tests/test_cms_pages.py

Purpose : Integration tests for CMS page and block CRUD endpoints.
          Uses the same in-memory SQLite setup as other tests (conftest.py).
          AI Gateway is in STUB mode by default — no real API calls.

Tests:
    test_create_page          — POST creates page, returns 201
    test_get_page             — GET returns correct page by ID
    test_duplicate_page       — POST duplicate creates clone with -copy slug
    test_optimistic_lock      — PATCH with stale If-Match returns 409
    test_delete_page          — DELETE returns 204
    test_create_page_dup_slug — duplicate slug returns 400
"""

import pytest
import pytest_asyncio
import uuid
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "plugins"))

from httpx import AsyncClient, ASGITransport
from main import app

from datetime import datetime, timedelta, timezone
from jose import jwt
from core.config import settings

def create_jwt(payload_override: dict = None) -> str:
    """Simulates a Supabase Auth JWT for testing."""
    payload = {
        "sub": "test@aitdl.com",
        "app_metadata": {"role": "superadmin"},
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    if payload_override:
        payload.update(payload_override)
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

# Register CMS ORM models with Base.metadata so SQLite test DB creates their tables
from cms_core.models.cms_tables import (  # noqa: F401
    Workspace, Page, Block, Card, BlogPost, MediaAsset,
    CMSForm, CMSSubmission, ContentVersion, CMSAuditLog, CMSPrompt
)


# ── Fixtures ───────────────────────────────────────────────────────────────────

@pytest_asyncio.fixture
async def cms_token():
    """JWT for a superadmin — Phase 1 uses workspace_id='aitdl' fallback."""
    return create_jwt({"sub": "test@aitdl.com", "role": "superadmin"})


@pytest_asyncio.fixture
async def workspace_seed(db_session):
    """Insert the internal AITDL workspace into the test DB."""
    from cms_core.models.cms_tables import Workspace
    ws = Workspace(
        id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
        name="AITDL Internal", slug="aitdl",
        plan="internal", ai_credits_limit=-1,
    )
    db_session.add(ws)
    await db_session.commit()
    return ws


# ── Test Helpers ───────────────────────────────────────────────────────────────

async def _create_page(client, token, slug="test-page", title="Test Page"):
    resp = await client.post(
        "/api/v1/cms/pages",
        json={"title": title, "slug": slug},
        headers={"Authorization": f"Bearer {token}"},
    )
    return resp


# ── Tests ──────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_page(cms_token, workspace_seed):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await _create_page(client, cms_token)
        assert resp.status_code == 201, resp.text
        data = resp.json()
        assert data["slug"] == "test-page"
        assert data["status"] == "draft"
        assert data["workspace_id"] is not None


@pytest.mark.asyncio
async def test_get_page(cms_token, workspace_seed):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        create_resp = await _create_page(client, cms_token, slug="get-page")
        assert create_resp.status_code == 201, f"Failed to create page: {create_resp.text}"
        page_id = create_resp.json()["id"]

        get_resp = await client.get(
            f"/api/v1/cms/pages/{page_id}",
            headers={"Authorization": f"Bearer {cms_token}"},
        )
        assert get_resp.status_code == 200
        assert get_resp.json()["id"] == page_id


@pytest.mark.asyncio
async def test_create_page_duplicate_slug(cms_token, workspace_seed):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await _create_page(client, cms_token, slug="duplicate-slug")
        resp2 = await _create_page(client, cms_token, slug="duplicate-slug")
        assert resp2.status_code == 400
        assert "already exists" in resp2.json()["detail"]


@pytest.mark.asyncio
async def test_duplicate_page(cms_token, workspace_seed):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        create_resp = await _create_page(client, cms_token, slug="original-page", title="Original")
        assert create_resp.status_code == 201, f"Failed to create page: {create_resp.text}"
        page_id = create_resp.json()["id"]

        dup_resp = await client.post(
            f"/api/v1/cms/pages/{page_id}/duplicate",
            headers={"Authorization": f"Bearer {cms_token}"},
        )
        assert dup_resp.status_code == 201
        dup = dup_resp.json()
        assert dup["slug"] == "original-page-copy"
        assert "(copy)" in dup["title"]
        assert dup["status"] == "draft"
        assert dup["id"] != page_id


@pytest.mark.asyncio
async def test_optimistic_lock_conflict(cms_token, workspace_seed):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        create_resp = await _create_page(client, cms_token, slug="lock-page")
        assert create_resp.status_code == 201, f"Failed to create page: {create_resp.text}"
        page_id = create_resp.json()["id"]

        # PATCH with a stale / wrong If-Match value should 409
        patch_resp = await client.patch(
            f"/api/v1/cms/pages/{page_id}",
            json={"title": "Updated Title"},
            headers={
                "Authorization": f"Bearer {cms_token}",
                "If-Match": "2000-01-01T00:00:00+00:00",  # stale timestamp
            },
        )
        assert patch_resp.status_code == 409
        assert "modified" in patch_resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_delete_page(cms_token, workspace_seed):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        create_resp = await _create_page(client, cms_token, slug="delete-page")
        assert create_resp.status_code == 201, f"Failed to create page: {create_resp.text}"
        page_id = create_resp.json()["id"]

        del_resp = await client.delete(
            f"/api/v1/cms/pages/{page_id}",
            headers={"Authorization": f"Bearer {cms_token}"},
        )
        assert del_resp.status_code == 204

        # Confirm it's gone
        get_resp = await client.get(
            f"/api/v1/cms/pages/{page_id}",
            headers={"Authorization": f"Bearer {cms_token}"},
        )
        assert get_resp.status_code == 404
