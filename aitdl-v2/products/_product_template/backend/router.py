from fastapi import APIRouter

# This router will be automatically mounted at /api/{product_name}
router = APIRouter()

@router.get("/")
async def root():
    return {"message": "Hello from the product template API!"}
