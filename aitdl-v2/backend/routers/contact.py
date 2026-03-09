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

