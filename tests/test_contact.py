# || ॐ श्री गणेशाय नमः ||
#
# Organization: AITDL
# AITDL — A Living Knowledge Ecosystem for AI Technology Development Lab
#
# Creator: Jawahar R. Mallah
# Founder, Author & System Architect
#
# Email: jawahar@aitdl.com
# GitHub: https://github.com/jawahar-mallah
#
# Websites:
# https://ganitsutram.com
# https://aitdl.com
#
# Then: 628 CE · Brahmasphuṭasiddhānta
# Now: 8 March MMXXVI · Vikram Samvat 2082
#
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com

import pytest
from httpx import AsyncClient, ASGITransport

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app


@pytest.mark.asyncio
async def test_contact_valid():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/contact", json={
            "name":    "Test User",
            "email":   "test@aitdl.com",
            "phone":   "9876543210",
            "section": "retail",
            "message": "I want a demo",
        })
    assert res.status_code == 201
    assert "id" in res.json()


@pytest.mark.asyncio
async def test_contact_short_phone():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/contact", json={
            "name":    "Test",
            "phone":   "123",
            "section": "retail",
        })
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
