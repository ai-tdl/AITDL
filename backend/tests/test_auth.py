# || ॐ श्री गणेशाय नमः ||
import pytest
from httpx import AsyncClient, ASGITransport
import sys, os
from jose import jwt
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

# Mock environment variables for Supabase Auth before importing config/app
os.environ["SUPABASE_URL"] = "https://mock.supabase.co"
os.environ["SUPABASE_ANON_KEY"] = "mock-anon-key"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "mock-service-role"
os.environ["SUPABASE_JWT_SECRET"] = "mock-supabase-jwt-secret-key-12345"

from main import app
from core.config import settings

@pytest.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

def create_mock_supabase_token(user_id="123e4567-e89b-12d3-a456-426614174000", role="superadmin"):
    """
    Simulates a JWT structurally identical to what Supabase Auth issues.
    """
    payload = {
        "sub": user_id,
        "app_metadata": {"role": role},
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

@pytest.mark.asyncio
async def test_auth_me_valid(async_client: AsyncClient):
    token = create_mock_supabase_token(role="superadmin")
    response = await async_client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "superadmin"
    assert data["sub"] == "123e4567-e89b-12d3-a456-426614174000"

@pytest.mark.asyncio
async def test_auth_me_invalid(async_client: AsyncClient):
    response = await async_client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer not-a-valid-token"}
    )
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_admin_leads_no_token(async_client: AsyncClient):
    response = await async_client.get("/api/admin/leads")
    assert response.status_code in (401, 403)

@pytest.mark.asyncio
async def test_admin_leads_with_token(async_client: AsyncClient):
    token = create_mock_supabase_token(role="admin")
    response = await async_client.get(
        "/api/admin/leads",
        headers={"Authorization": f"Bearer {token}"}
    )
    # The leads endpoint might return 200 if the database setup is correct
    # We mainly test that auth is accepted.
    assert response.status_code == 200
