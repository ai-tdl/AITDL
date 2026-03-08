<!--
  AITDL
  A Living Knowledge Ecosystem for AI Technology Development Lab

  Creator:   Jawahar R. Mallah (Founder, Author & System Architect)
  Email:     jawahar@aitdl.com
  GitHub:    https://github.com/jawahar-mallah
  Websites:  https://ganitsutram.com
             https://aitdl.com

  Then:  628 CE · Brahmasphutasiddhanta
  Now:   8 March MMXXVI · Vikram Samvat 2082

  Copyright © aitdl.com · AITDL | GANITSUTRAM.com
-->

# AITDL v2 — Architecture

## Overview

AITDL v2 is a **platform-agnostic, audience-personalised marketing and lead-capture platform** for AITDL's full product portfolio across Retail, ERP, Education, AI Tools, and Partner Programme.

---

## System Diagram

```
                    ┌─────────────────────────────────┐
                    │         VISITOR BROWSER          │
                    └─────────────────────────────────┘
                                    │
                    ┌─────────────────────────────────┐
                    │    frontend/index.html           │
                    │    (Static Site — any CDN)       │
                    │                                  │
                    │  Gate (3 doors)                  │
                    │    ├─ Universe Overview          │
                    │    ├─ Role Picker (9 roles)      │
                    │    └─ Partner Landing            │
                    │                                  │
                    │  Audience Sections (9 segments)  │
                    │    Retail · ERP · Education      │
                    │    Teacher · Student · Home      │
                    │    Partner · NGO · Ecom          │
                    └─────────────────────────────────┘
                                    │
                      Form Submit (HTTPS POST)
                                    │
              ┌─────────────────────┴──────────────────┐
              │                                        │
              ▼                                        ▼
  ┌─────────────────────┐              ┌──────────────────────┐
  │  Web3Forms (Interim) │              │   backend/main.py    │
  │  (Zero-server captue)│              │   FastAPI — any host  │
  └─────────────────────┘              │                      │
  (replace with backend                │  /api/contact        │
   when backend is live)               │  /api/partner-apply  │
                                       └──────────┬───────────┘
                                                  │
                                       ┌──────────▼───────────┐
                                       │  PostgreSQL Database  │
                                       │  (Supabase/Railway/  │
                                       │   own VPS)           │
                                       └──────────────────────┘
```

---

## Frontend Architecture

```
frontend/
├── index.html          Single-page app (SPA pattern without framework)
├── css/
│   ├── main.css        CSS custom properties, layout, components
│   ├── themes.css      9 audience color themes
│   └── animations.css  Keyframes, .rv reveal, .rv2 variants
└── js/
    ├── config.js       All configurable constants (API URL, keys)
    ├── main.js         App router, state, theme switcher, door/picker logic
    ├── canvas.js       Particle canvas animation
    ├── picker.js       Role picker — primary/secondary selection
    └── forms.js        Form handlers → POST to backend or Web3Forms
```

### State Model
```js
// Managed in main.js
{
  currentView: null,           // 'gate' | 'overview' | 'partner-landing' | roleId
  primaryRole: null,            // selected primary role
  secondaryRoles: [],           // additional roles
  particleColor: [201,168,76], // current theme RGB
}
```

### Routing (no URL change — DOM show/hide)
```
Gate           show: #gate          hide: all others
Universe       show: #overview      hide: all others
Partner Door   show: #partner-landing hide: all others
Role View      show: #s-{roleId}    hide: all others
Multi-role     show: #s-{primary} + #s-{secondary...}
```

---

## Backend Architecture (FastAPI)

```
backend/
├── main.py             App factory, middleware, router registration
├── routers/
│   ├── contact.py      POST /api/contact
│   └── partner.py      POST /api/partner-apply
├── models/
│   ├── contact.py      ContactRequest, ContactResponse (Pydantic)
│   └── partner.py      PartnerRequest, PartnerResponse (Pydantic)
├── core/
│   ├── config.py       Settings from env (pydantic-settings)
│   ├── database.py     Async SQLAlchemy engine + session
│   └── cors.py         CORS middleware config
└── db/
    └── migrations/
        └── 001_initial.sql
```

### API Endpoints
| Method | Path | Request Body | Response |
|---|---|---|---|
| `POST` | `/api/contact` | name, phone, section, message | `{status, id}` |
| `POST` | `/api/partner-apply` | name, whatsapp, city, background, network | `{status, id}` |
| `GET` | `/health` | — | `{status: "ok"}` |
| `GET` | `/docs` | — | Swagger UI (dev only) |

---

## Database Schema

```sql
-- contacts
id UUID PK, name, phone, section, message, created_at

-- partner_applications
id UUID PK, name, whatsapp, city, background, network, created_at
```

---

## Audience Theme Map

| Segment | CSS Class | Primary Colour | RGB |
|---|---|---|---|
| Default / Overview | (none) | Gold `#c9a84c` | 201,168,76 |
| Retail | `.t-retail` | Orange `#ff6b1a` | 255,107,26 |
| ERP | `.t-erp` | Blue `#1a8fff` | 26,143,255 |
| Education | `.t-education` | Green `#22c565` | 34,197,101 |
| Teacher | `.t-education` | Green `#22c565` | 34,197,101 |
| Student | `.t-ai` | Purple `#a259ff` | 162,89,255 |
| Home | `.t-home` | Pink `#ff4d6a` | 255,77,106 |
| Partner | `.t-partner` | Lime `#39e07a` | 57,224,122 |
| NGO | `.t-ngo` | Teal `#0eb8a0` | 14,184,160 |
| Ecommerce | `.t-ecom` | Indigo `#6c63ff` | 108,99,255 |

---

## Deployment Topology

```
GitHub (main branch)
    ├── push → Vercel/Netlify auto-deploys frontend/
    └── push → Railway/Render auto-deploys backend/
```

See `deploy/` folder for platform-specific configs.

---

*AITDL · System Architect: Jawahar R. Mallah · Since 2007*
