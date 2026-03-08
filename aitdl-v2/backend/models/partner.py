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

from pydantic import BaseModel, field_validator
import re


class PartnerApplication(BaseModel):
    name:       str
    phone:      str
    city:       str
    occupation: str = ""
    message:    str = ""

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if len(digits) < 10:
            raise ValueError("Phone number must be at least 10 digits")
        return digits


class PartnerResponse(BaseModel):
    id:      int
    message: str = "Application received! Our team will WhatsApp you within 24 hours."
