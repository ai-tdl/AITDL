from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
async def dailyboard_status():
    return {"product": "dailyboard", "status": "online"}
