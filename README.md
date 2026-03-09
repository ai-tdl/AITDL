# AITDL — Modular Platform Ecosystem

**AI Technology Development Lab** — Multi-product platform for Retail, ERP, Education & AI.  
Pan India · Since 2007 · Mumbai · Nashik · Surat · Gorakhpur

---

## 🏗️ AITDL Modular Platform Architecture

The platform is organized into a **layered monorepo** to ensure high modularity, easy maintenance, and scalability.

### Layers & Hierarchy
1.  **Core** (`/core`): Self-contained configuration, identity, and shared logic.
2.  **Plugins** (`/plugins`): Dynamic feature modules (e.g., CMS, AI Assistant) loaded at runtime.
3.  **Products** (`/products`): Specific product universes (e.g., GanitSūtram) that utilize Core and Plugins.
4.  **Apps** (`/apps`): Frontend applications (Portal, Admin) that consume the Backend API.

---

## 📂 Repository Structure

```text
AITDL/
├── apps/               # Frontend Apps (Portal, Admin, CMS)
├── backend/            # Backend Core (FastAPI)
│   ├── api/            # API Routers (Contact, Auth, Admin, AI)
│   ├── models/         # Pydantic Schemas
│   └── services/       # Dynamic Loaders & Logic
├── core/               # Platform Core (Config, Security, DB)
├── plugins/            # Dynamic Plugin Engine
├── products/           # Dynamic Product Engine
├── infrastructure/     # Deployment Configs (Vercel, Railway, Nginx)
├── scripts/            # Utility Scripts (Migrate, Seed, Export)
├── tests/              # Unified Test Suite (Pytest)
├── docs/               # Platform Documentation
└── archive/            # Legacy & Experimental Files
```

---

## 🚀 Quick Start

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # Configure Supabase & Database keys
uvicorn main:app --reload
# Docs: http://localhost:8000/docs
```

### 2. Frontend Apps
```bash
# Portal App
cd apps/portal
# Open index.html in browser or use Live Server

# Admin App
cd apps/admin
# Open index.html in browser
```

### 3. Run Tests
```bash
# Run from root
python -m pytest
```

---

## 🛠️ Key Commands
- **Seed Database**: `python scripts/seed.py`
- **Run Migrations**: `python scripts/migrate.py`
- **Export Architecture**: `python scripts/export_skeleton.py`

---

## 📄 Documentation
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [API Documentation](backend/README.md)

---

© 2026 AITDL — AI Technology Development Lab
https://aitdl.com | https://ganitsutram.com
