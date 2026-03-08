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

from fastapi import APIRouter
from models.partner import PartnerApplication, PartnerResponse

router = APIRouter(tags=["Partner"])


@router.post("/partner-apply", response_model=PartnerResponse, status_code=201)
async def submit_partner_application(form: PartnerApplication):
    """
    Receive a partner application.
    Currently logs to console — swap for DB insert when deployed.
    """
    print(f"[PARTNER] {form.name} | {form.phone} | city={form.city}")
    return PartnerResponse(id=1)
