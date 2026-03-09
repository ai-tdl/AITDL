"""
॥ ॐ श्री गणेशाय नमः ॥
॥ ॐ श्री सरस्वत्यै नमः ॥
॥ ॐ नमो नारायणाय ॥
॥ ॐ नमः शिवाय ॥
॥ ॐ दुर्गायै नमः ॥

Creator: Jawahar R. Mallah
Organization: AITDL — AI Technology Development Lab
Web: https://aitdl.com

Historical Reference:
628 CE · Brahmasphuṭasiddhānta

Current Build:
8 March MMXXVI
Vikram Samvat 2082

Platform: AITDL Platform V3
Fingerprint: AITDL-PLATFORM-V3
"""

import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from services.ai_gateway import generate_response, TaskComplexity

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["AI Integration"])

class AIRequest(BaseModel):
    prompt: str
    task_type: TaskComplexity = TaskComplexity.BASIC
    context: Optional[Dict[str, Any]] = None

class AIResponse(BaseModel):
    provider: str
    model: str
    response: str
    status: str

@router.post("/assistant", response_model=AIResponse)
async def ai_assistant_endpoint(payload: AIRequest):
    """
    Universal AI Gateway hook. Products and plugins should send all AI requests here.
    The Gateway will intelligently route the request to Local, Open-Source, or Premium 
    models depending on the `task_type` provided in the payload.
    """
    try:
        result = await generate_response(
            prompt=payload.prompt,
            task_type=payload.task_type,
            context=payload.context
        )
        return AIResponse(**result)
    except Exception as e:
        log.error(f"AI Gateway processing failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate AI response. Plase try again later."
        )
