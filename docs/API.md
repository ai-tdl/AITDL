<!--
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
-->
<!--
|| ॐ श्री गणेशाय नमः ||

Organization: AITDL
AITDL — A Living Knowledge Ecosystem for AI Technology Development Lab

Creator: Jawahar R. Mallah
Founder, Author & System Architect

Email: jawahar@aitdl.com
GitHub: https://github.com/jawahar-mallah

Websites:
https://ganitsutram.com
https://aitdl.com

Then: 628 CE · Brahmasphuṭasiddhānta
Now: 8 March MMXXVI · Vikram Samvat 2082

Copyright © aitdl.com · AITDL | GANITSUTRAM.com
-->

# AITDL v2 — API Reference

## Base URL
```
Production:  https://api.aitdl.com
Development: http://localhost:8000
```

> All frontend requests use `CONFIG.API_BASE_URL` from `frontend/js/config.js` — never hardcoded.

---

## Endpoints

### POST `/api/contact`
Captures an enquiry from any audience section.

**Request**
```json
{
  "name":    "Rajesh Kumar",
  "phone":   "9876543210",
  "section": "retail",
  "message": "I need POS for 3 stores"
}
```

**Fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ | min 2 chars |
| `phone` | string | ✅ | 10-digit Indian mobile |
| `section` | string | ✅ | one of: retail, erp, education, teacher, student, home, partner, ngo, ecom |
| `message` | string | ❌ | max 1000 chars |

**Response `201`**
```json
{ "id": 1, "message": "Thank you! We'll contact you on WhatsApp shortly." }
```

**Response `422`**
```json
{ "detail": [{ "loc": ["body","phone"], "msg": "Invalid phone number", "type": "value_error" }] }
```

---

### POST `/api/partner-apply`
Captures a Partner Programme application.

**Request**
```json
{
  "name":       "Suresh Mehta",
  "phone":      "9876543210",
  "city":       "Nashik",
  "occupation": "IT / Software Sales",
  "message":    "I know 50+ shop owners and 10 schools in Nashik"
}
```

**Fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ | |
| `phone` | string | ✅ | 10-digit Indian mobile |
| `city` | string | ✅ | |
| `occupation` | string | ❌ | Current role / profession |
| `message` | string | ❌ | Why they want to partner |

**Response `201`**
```json
{ "id": 1, "message": "Application received! Our team will WhatsApp you within 24 hours." }
```

---

### GET `/health`
Health check — for deployment monitoring.

**Response `200`**
```json
{ "status": "ok", "version": "2.0.0" }
```

---

## Error Codes
| Code | Meaning |
|---|---|
| 200 | Success |
| 422 | Validation error (see detail array) |
| 429 | Rate limited (max 10 req/min per IP) |
| 500 | Internal server error |

---

## Interim (Web3Forms)
While backend is being built, forms POST to Web3Forms:
```
POST https://api.web3forms.com/submit
Body: { access_key, name, phone, section, message }
```
Replace by updating `frontend/js/forms.js` only — HTML unchanged.
