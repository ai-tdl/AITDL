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

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from models.contact import ContactForm, ContactResponse
from models.db_tables import ContactRecord
from core.database import get_db
from services import hooks

router = APIRouter(tags=["Contact"])


@router.post("/contact", response_model=ContactResponse, status_code=201)
async def submit_contact(
    form: ContactForm,
    db: AsyncSession = Depends(get_db),
):
    """
    Purpose : Persist an inbound contact form submission to the database.
    Input   : ContactForm (validated Pydantic model), AsyncSession (injected)
    Output  : ContactResponse with DB-generated id and confirmation message
    Errors  : 500 on DB failure — rolled back automatically via session context
    """
    record = ContactRecord(
        name=form.name,
        email=form.email,
        phone=form.phone,
        section=form.section,
        business=form.business,
        city=form.city,
        message=form.message,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    await hooks.trigger("on_lead_received", record)

    return ContactResponse(id=record.id)

