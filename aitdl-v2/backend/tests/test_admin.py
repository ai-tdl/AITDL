import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_admin_stats_unauthorized():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/admin/stats")
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_admin_leads_unauthorized():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/admin/leads")
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_admin_partners_unauthorized():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/admin/partners")
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_login_wrong_creds():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/auth/login", json={"email": "wrong@test.com", "password": "wrong"})
    assert response.status_code == 401
