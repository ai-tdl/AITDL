<!--
  AITDL v2 — README.md
  Org          : AITDL — AI Technology Development Lab
  Developer    : Jawahar Ramkripal Mallah
  Author       : Jawahar Ramkripal Mallah
  System Arch  : Jawahar Ramkripal Mallah
  Version      : 2.0.0
  Date         : 2026-03-09
  Description  : Root README for AITDL v2 project
-->

# AITDL v2

**AI Technology Development Lab** — Technology Solutions for Retail, ERP, Education & AI.  
Pan India · Since 2007 · Mumbai · Nashik · Surat · Gorakhpur

---

## Quick Start

### Frontend (open locally)

```bash
# No build step — open directly in browser
cd aitdl-v2/frontend
# Double-click index.html  OR  serve with Live Server in VS Code
```

### Backend (FastAPI)

```bash
cd aitdl-v2/backend
python -m venv venv && venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env                           # Fill in DATABASE_URL and SUPABASE keys
uvicorn main:app --reload
# Docs at: http://localhost:8000/docs
```

### Run Tests

```bash
cd aitdl-v2
python -m pytest tests/ -v
```

---

## Infrastructure (Phase 4 — Supabase)

The project has migrated from local PostgreSQL and custom JWT auth to **Supabase**:
- **Database**: Managed PostgreSQL on Supabase.
- **Authentication**: Supabase Auth (JWT verification).
- **Environment Variables**: Requires `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_JWT_SECRET`.

---

## Project Structure

```
aitdl-v2/
├── rules/           ← 🔑 Read first — RULESBOOK.md
├── docs/            ← ARCHITECTURE, API, CHANGELOG, DEPLOYMENT, PHASE_TRACKER
├── core/            ← Brand identity (JSON)
├── pil/             ← Project Intelligence Layer (dependency_map, module_index)
├── frontend/        ← HTML + CSS + JS (deploy to Vercel)
│   ├── index.html   ← 3-door gate + 9 audience sections
│   ├── css/         ← main.css, themes.css, animations.css
│   └── js/          ← config.js, canvas.js, picker.js, forms.js, main.js
├── backend/         ← FastAPI (deploy to Railway)
│   ├── main.py
│   ├── routers/     ← contact.py, partner.py, auth.py (identity check), admin.py
│   ├── models/      ← contact.py, partner.py (Pydantic)
│   ├── core/        ← config.py, database.py, security.py (Supabase JWT verification)
│   └── db/migrations/ ← 001_initial.sql
├── scripts/         ← migrate.py, seed.py
├── tests/           ← test_contact.py, test_partner.py, test_auth.py (Mocked Supabase)
├── deploy/          ← vercel.json, netlify.toml, nginx.conf, railway.json
└── .github/workflows/ ← deploy.yml (CI/CD)
```

---

## Key Documents

| Document | Purpose |
|---|---|
| [RULESBOOK.md](aitdl-v2/rules/RULESBOOK.md) | Master rules — read before every task |
| [ARCHITECTURE.md](aitdl-v2/docs/ARCHITECTURE.md) | System design |
| [DEPLOYMENT.md](aitdl-v2/docs/DEPLOYMENT.md) | How to deploy on Vercel / Railway / Nginx |
| [PHASE_TRACKER.md](aitdl-v2/docs/PHASE_TRACKER.md) | What's live vs placeholder |
| [CHANGELOG.md](aitdl-v2/docs/CHANGELOG.md) | Version history |

---

## Bug Fixes (vs aitdl2.html)

| # | Bug | Fix |
|---|---|---|
| 1 | `scrollTo()` shadowed `window.scrollTo` | Renamed to `scrollToId()` throughout |
| 2 | `sendForm` was a fake 1.2s delay | Real Web3Forms POST with error handling |
| 3 | Picker secondary badge reset to '+ADD' | Badge always resets to 'PRIMARY' correctly |
| 4 | Reveal / counter observers not cleaned up | Disconnect before re-initialising |
| 5 | `#s-ngo` and `#s-ecom` IDs missing | Both confirmed present in index.html |
| 6 | card navigation `ReferenceError` | Fixed `onclick` handlers to use `setView()` |

---

## Contact

- **Email:** info@aitdl.com
- **Partner enquiries:** partners@aitdl.com
- **GitHub:** https://github.com/jawahar-mallah

© 2026 AITDL — AI Technology Development Lab
