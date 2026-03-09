# || ॐ श्री गणेशाय नमः ||
#
# Organization: AITDL
# Creator: Jawahar R. Mallah
# Then: 628 CE · Brahmasphuṭasiddhānta · Now: 9 March MMXXVI
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com

"""
CMS Workspaces Tests — tests/test_cms_workspaces.py

Purpose : Integration tests for workspace CRUD, automated onboarding
          seed, stats, and export endpoints.
          Uses the same in-memory SQLite setup as other tests (conftest.py).

Tests:
    test_create_workspace              — POST creates workspace, returns 201
    test_create_workspace_seeds_content — onboarding seeds default page/blog/card/form
    test_create_workspace_duplicate_slug — duplicate slug returns 400
    test_list_workspaces               — GET returns all workspaces
    test_update_workspace              — PATCH updates plan/credits
    test_workspace_stats               — GET stats returns correct counts
    test_workspace_export              — GET export returns structured JSON
"""

import pytest
import pytest_asyncio
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "plugins"))

from httpx import AsyncClient, ASGITransport
from main import app
from core.security import create_jwt

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
    """Insert the internal AITDL workspace so middleware resolves it."""
    ws = Workspace(
        id="00000000-0000-0000-0000-000000000001",
        name="AITDL Internal", slug="aitdl",
        plan="internal", ai_credits_limit=-1,
    )
    db_session.add(ws)
    await db_session.commit()
    return ws


# ── Helpers ────────────────────────────────────────────────────────────────────

async def _create_workspace(client, token, slug="sharma-retail", name="Sharma Retail", plan="starter"):
    return await client.post(
        "/api/v1/cms/workspaces",
        json={"name": name, "slug": slug, "plan": plan, "ai_credits_limit": 500},
        headers={"Authorization": f"Bearer {token}"},
    )


# ── Tests ──────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_workspace(cms_token, workspace_seed):
    """POST /workspaces creates a new workspace and returns 201."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await _create_workspace(client, cms_token)
        assert resp.status_code == 201, resp.text
        data = resp.json()
        assert data["slug"] == "sharma-retail"
        assert data["plan"] == "starter"
        assert data["ai_credits_limit"] == 500
        assert data["ai_credits_used"] == 0
        assert data["is_active"] is True


@pytest.mark.asyncio
async def test_create_workspace_seeds_content(cms_token, workspace_seed):
    """Creating a workspace auto-seeds default page, blog post, card, and form."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create a new workspace — onboarding fires
        create_resp = await _create_workspace(client, cms_token, slug="seed-test", name="Seed Test")
        assert create_resp.status_code == 201

        ws_slug = create_resp.json()["slug"]

        # Build a token scoped to the new workspace
        scoped_token = create_jwt({"sub": "test@aitdl.com", "role": "superadmin", "workspace_id": ws_slug})
        headers = {"Authorization": f"Bearer {scoped_token}"}

        # Verify seeded page
        pages_resp = await client.get("/api/v1/cms/pages", headers=headers)
        assert pages_resp.status_code == 200
        pages = pages_resp.json()
        assert any(p["slug"] == "home" for p in pages), "Default 'home' page not seeded"

        # Verify seeded blog post
        blog_resp = await client.get("/api/v1/cms/blog", headers=headers)
        assert blog_resp.status_code == 200
        posts = blog_resp.json()
        assert any(p["slug"] == "welcome" for p in posts), "Default 'welcome' blog post not seeded"

        # Verify seeded form
        forms_resp = await client.get("/api/v1/cms/forms", headers=headers)
        assert forms_resp.status_code == 200
        forms = forms_resp.json()
        assert any(f["slug"] == "contact" for f in forms), "Default 'contact' form not seeded"

        # Verify seeded card
        cards_resp = await client.get("/api/v1/cms/cards", headers=headers)
        assert cards_resp.status_code == 200
        cards = cards_resp.json()
        assert len(cards) >= 1, "Default card not seeded"


@pytest.mark.asyncio
async def test_create_workspace_duplicate_slug(cms_token, workspace_seed):
    """Duplicate workspace slug returns 400."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await _create_workspace(client, cms_token, slug="dup-ws")
        resp2 = await _create_workspace(client, cms_token, slug="dup-ws")
        assert resp2.status_code == 400
        assert "already exists" in resp2.json()["detail"]


@pytest.mark.asyncio
async def test_list_workspaces(cms_token, workspace_seed):
    """GET /workspaces returns all workspaces."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create two additional workspaces
        await _create_workspace(client, cms_token, slug="ws-1", name="WS One")
        await _create_workspace(client, cms_token, slug="ws-2", name="WS Two")

        resp = await client.get(
            "/api/v1/cms/workspaces",
            headers={"Authorization": f"Bearer {cms_token}"},
        )
        assert resp.status_code == 200
        slugs = [ws["slug"] for ws in resp.json()]
        # Should include the seed workspace + the two we created
        assert "aitdl" in slugs
        assert "ws-1" in slugs
        assert "ws-2" in slugs


@pytest.mark.asyncio
async def test_update_workspace(cms_token, workspace_seed):
    """PATCH /workspaces/{slug} updates plan and credits."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await _create_workspace(client, cms_token, slug="update-ws")

        patch_resp = await client.patch(
            "/api/v1/cms/workspaces/update-ws",
            json={"plan": "pro", "ai_credits_limit": 2000},
            headers={"Authorization": f"Bearer {cms_token}"},
        )
        assert patch_resp.status_code == 200
        data = patch_resp.json()
        assert data["plan"] == "pro"
        assert data["ai_credits_limit"] == 2000


@pytest.mark.asyncio
async def test_workspace_stats(cms_token, workspace_seed):
    """GET /workspaces/{slug}/stats returns correct counts after onboarding seed."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create workspace (onboarding seeds: 1 page, 1 blog, 1 card, 1 form)
        await _create_workspace(client, cms_token, slug="stats-ws")
        scoped_token = create_jwt({"sub": "test@aitdl.com", "role": "superadmin", "workspace_id": "stats-ws"})

        stats_resp = await client.get(
            "/api/v1/cms/workspaces/stats-ws/stats",
            headers={"Authorization": f"Bearer {scoped_token}"},
        )
        assert stats_resp.status_code == 200
        stats = stats_resp.json()
        assert stats["pages_count"] >= 1
        assert stats["blog_posts_count"] >= 1
        assert stats["forms_count"] >= 1


@pytest.mark.asyncio
async def test_workspace_export(cms_token, workspace_seed):
    """GET /workspaces/{slug}/export returns structured JSON with all content types."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await _create_workspace(client, cms_token, slug="export-ws")
        scoped_token = create_jwt({"sub": "test@aitdl.com", "role": "superadmin", "workspace_id": "export-ws"})

        export_resp = await client.get(
            "/api/v1/cms/workspaces/export-ws/export",
            headers={"Authorization": f"Bearer {scoped_token}"},
        )
        assert export_resp.status_code == 200
        data = export_resp.json()
        assert "exported_at" in data
        assert "workspace" in data
        assert data["workspace"]["slug"] == "export-ws"
        assert "pages" in data
        assert "blog_posts" in data
        assert "cards" in data
        assert "forms" in data
        # Onboarding should have seeded at least 1 page
        assert len(data["pages"]) >= 1
