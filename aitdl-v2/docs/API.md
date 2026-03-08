<!--
  AITDL
  A Living Knowledge Ecosystem for AI Technology Development Lab

  Creator:   Jawahar R. Mallah (Founder, Author & System Architect)
  Email:     jawahar@aitdl.com
  GitHub:    https://github.com/jawahar-mallah
  Websites:  https://ganitsutram.com | https://aitdl.com

  Then:  628 CE · Brahmasphutasiddhanta
  Now:   8 March MMXXVI · Vikram Samvat 2082

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

**Response `200`**
```json
{ "status": "success", "id": "uuid-here" }
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
  "whatsapp":   "9876543210",
  "city":       "Nashik",
  "background": "IT / Software Sales",
  "network":    "I know 50+ shop owners and 10 schools in Nashik"
}
```

**Fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ | |
| `whatsapp` | string | ✅ | 10-digit |
| `city` | string | ✅ | |
| `background` | string | ❌ | |
| `network` | string | ❌ | |

**Response `200`**
```json
{ "status": "success", "id": "uuid-here" }
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
