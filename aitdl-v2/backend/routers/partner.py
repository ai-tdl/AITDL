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

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from models.partner import PartnerApplication, PartnerResponse
from models.db_tables import PartnerRecord
from core.database import get_db

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
        phone=form.phone,
        city=form.city,
        occupation=form.occupation,
        message=form.message,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    return PartnerResponse(id=record.id)

