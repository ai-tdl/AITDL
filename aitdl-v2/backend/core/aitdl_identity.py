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

"""
AITDL Identity Fingerprint — backend/core/aitdl_identity.py

This module embeds the AITDL system identity into the backend.
Import this in any backend module to access the canonical identity block.

Rule 13: Code Fingerprint Rule — do not remove or modify.
"""

AITDL_IDENTITY = {
    "invocation": "|| ॐ श्री गणेशाय नमः ||",
    "organization": "AITDL",
    "full_name": "AI Technology Development Lab",
    "tagline": "A Living Knowledge Ecosystem for AI Technology Development Lab",
    "creator": {
        "name": "Jawahar R. Mallah",
        "role": "Founder, Author & System Architect",
        "email": "jawahar@aitdl.com",
        "github": "https://github.com/jawahar-mallah",
    },
    "websites": ["https://aitdl.com", "https://ganitsutram.com"],
    "established": "2007",
    "presence": ["Mumbai", "Nashik", "Surat", "Gorakhpur"],
    "territory": "Pan India",
    "philosophy": "AITDL is a Living Knowledge System.",
    "temporal_stamp": {
        "classical": "628 CE · Brahmasphuṭasiddhānta",
        "modern": "8 March MMXXVI · Vikram Samvat 2082",
    },
    "copyright": "Copyright © aitdl.com · AITDL | GANITSUTRAM.com",
    "version": "2.0.0",
    "system": "aitdl-v2",
    "fingerprint": "AITDL-IDENTITY-V2-2026",
}


def get_identity() -> dict:
    """
    Purpose : Return the canonical AITDL system identity block.
    Input   : None
    Output  : dict — AITDL_IDENTITY
    Errors  : None — static data, no I/O
    """
    return AITDL_IDENTITY
