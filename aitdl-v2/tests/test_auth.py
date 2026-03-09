# || ॐ श्री गणेशाय नमः ||
import pytest
from httpx import AsyncClient, ASGITransport
import sys, os
from sqlalchemy.ext.asyncio import AsyncSession

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
from main import app
from core.security import hash_password
from models.db_tables import AdminUser
from core.database import get_db

@pytest.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def seed_admin(db_session: AsyncSession):
    admin = AdminUser(
        email="iamadmin@aitdl.com",
        password_hash=hash_password("testpass123"),
        role="superadmin",
        is_active=True
    )
    db_session.add(admin)
    await db_session.commit()
    return admin

@pytest.mark.asyncio
async def test_login_valid(async_client: AsyncClient, seed_admin):
    response = await async_client.post(
        "/api/auth/login",
        json={"email": "iamadmin@aitdl.com", "password": "testpass123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_wrong_password(async_client: AsyncClient, seed_admin):
    response = await async_client.post(
        "/api/auth/login",
        json={"email": "iamadmin@aitdl.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_login_unknown_email(async_client: AsyncClient):
    response = await async_client.post(
        "/api/auth/login",
        json={"email": "nobody@aitdl.com", "password": "testpass123"}
    )
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_admin_leads_no_token(async_client: AsyncClient):
    response = await async_client.get("/api/admin/leads")
    assert response.status_code in (401, 403)

@pytest.mark.asyncio
async def test_admin_leads_with_token(async_client: AsyncClient, seed_admin):
    # 1. Login to get token
    login_res = await async_client.post(
        "/api/auth/login",
        json={"email": "iamadmin@aitdl.com", "password": "testpass123"}
    )
    token = login_res.json()["access_token"]
    
    # 2. Access protected route
    response = await async_client.get(
        "/api/admin/leads",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
