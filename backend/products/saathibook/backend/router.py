from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
async def saathibook_status():
    return {"product": "saathibook", "status": "online"}
