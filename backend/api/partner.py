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

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from models.partner import PartnerApplication, PartnerResponse
from models.db_tables import PartnerRecord
from core.database import get_db
from services import hooks

router = APIRouter(tags=["Partner"])


@router.post("/partner-apply", response_model=PartnerResponse, status_code=201)
async def submit_partner_application(
    form: PartnerApplication,
    db: AsyncSession = Depends(get_db),
):
    """
    Purpose : Persist an inbound partner application to the database.
    Input   : PartnerApplication (validated Pydantic model), AsyncSession (injected)
    Output  : PartnerResponse with DB-generated id and confirmation message
    Errors  : 500 on DB failure — rolled back automatically via session context
    """
    record = PartnerRecord(
        name=form.name,
        email=form.email,
        phone=form.phone,
        city=form.city,
        occupation=form.occupation,
        message=form.message,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    await hooks.trigger("on_partner_applied", record)

    return PartnerResponse(id=record.id)

