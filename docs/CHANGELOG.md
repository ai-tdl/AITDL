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

Now: 8 March MMXXVI · Vikram Samvat 2082

Copyright © aitdl.com · AITDL | GANITSUTRAM.com
-->

# AITDL v2 — Changelog

All notable changes to this project are documented here.
Format: [Semantic Versioning](https://semver.org)

---

## [2.1.0] — 2026-03-09 · DB Integration + Full RULESBOOK Compliance

### Added
- `backend/models/db_tables.py` — SQLAlchemy ORM: `ContactRecord` + `PartnerRecord`
- `tests/conftest.py` — in-memory SQLite async fixtures, `get_db` override (no live DB for tests)
- `pytest.ini` — `asyncio_mode = auto`, `testpaths = tests`
- `backend/core/aitdl_identity.py` — Rule 13 identity fingerprint module
- `scripts/aitdl_signature.py` — Rule 13 CLI signature printer
- `docs/aitdl_signature.md` — Rule 13 documentation record
- `guardian/README.md`, `ade/README.md`, `agents/README.md` — all Phase 2 root dirs scaffolded
- `aiosqlite==0.20.0` added to `backend/requirements.txt`

### Changed
- `backend/routers/contact.py` — real async SQLAlchemy DB insert (was `print()` stub)
- `backend/routers/partner.py` — real async SQLAlchemy DB insert (was `print()` stub)
- `pil/project_map.json`, `module_index.json`, `dependency_map.json` — updated to v2.1.0
- Rule 14 attribution header applied to all 29+ generated files

### Tests
- 5/5 pass: `test_contact_valid`, `test_contact_short_phone`, `test_health`, `test_partner_valid`, `test_partner_missing_city`
- Tests run with in-memory SQLite — no PostgreSQL connection required

---

## [2.0.0] — 2026-03-09 · Initial v2 Bootstrap

### Added
- Full project scaffold: `frontend/`, `backend/`, `scripts/`, `tests/`, `deploy/`, `.github/`
- `rules/RULESBOOK.md` — master rules + AITDL identity
- `docs/ARCHITECTURE.md` — system design
- `docs/API.md` — endpoint contracts
- `frontend/index.html` — 3-door gate system (Universe / Destination / Partner)
- `frontend/css/main.css` — core design system + variables
- `frontend/css/themes.css` — 9 audience colour themes
- `frontend/css/animations.css` — reveal + keyframe animations
- `frontend/js/config.js` — env-aware configuration
- `frontend/js/main.js` — app router + all 5 bug fixes applied
- `frontend/js/canvas.js` — particle canvas system
- `frontend/js/picker.js` — role picker state machine
- `frontend/js/forms.js` — Web3Forms integration (interim)
- `backend/main.py` — FastAPI entry point
- `backend/routers/`, `backend/models/`, `backend/core/` — full API structure
- `backend/db/migrations/001_initial.sql` — DB schema
- `.github/workflows/deploy.yml` — CI/CD pipeline
- `deploy/` — Vercel, Netlify, Nginx, Railway configs

### Fixed (from aitdl2.html → v2)
- `scrollTo` name conflict with `window.scrollTo` — renamed to `scrollToId`
- Missing `#s-ngo` and `#s-ecom` section IDs registered in router
- `sendForm` using fake delay → now posts to Web3Forms webhook
- Counter observer not cleaning up old entries on section revisit
- `pickRole` badge reset bug on secondary-to-none transition

---

## [1.0.0] — Pre-2026 · Legacy Single-File

- `aitdl1.html` — original monolithic site
- `aitdl2.html` — expanded version with 9 audience sections, partner landing
