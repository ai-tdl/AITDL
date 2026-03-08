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

from fastapi import APIRouter, HTTPException
from models.contact import ContactForm, ContactResponse

router = APIRouter(tags=["Contact"])


@router.post("/contact", response_model=ContactResponse, status_code=201)
async def submit_contact(form: ContactForm):
    """
    Receive a contact form submission.
    Currently stores in-memory (swap for DB insert when backend is deployed).
    """
    # TODO: replace with actual DB insert via SQLAlchemy
    # Example:
    # async with get_db() as db:
    #     result = await db.execute(
    #         insert(contacts_table).values(**form.model_dump()).returning(contacts_table.c.id)
    #     )
    #     row_id = result.scalar_one()
    #     await db.commit()

    print(f"[CONTACT] {form.name} | {form.phone} | section={form.section}")
    return ContactResponse(id=1)
