import sys, os
sys.path.insert(0, os.path.join(os.getcwd(), "backend"))
sys.path.insert(0, os.path.join(os.getcwd(), "plugins"))

from main import app
from httpx import AsyncClient, ASGITransport
import asyncio

async def run_test():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post("/api/v1/cms/pages", json={"title": "test", "slug": "test"})
        print(f"Status: {resp.status_code}")
        print(f"Body: {resp.text}")

if __name__ == "__main__":
    asyncio.run(run_test())
