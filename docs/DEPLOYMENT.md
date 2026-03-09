# AITDL — Deployment Guide

## Stack Overview

| Layer | Tech | Platform |
|---|---|---|
| Frontend Apps | HTML + CSS + JS (Vanilla) | Vercel / Netlify / Nginx |
| Backend Core | FastAPI (Python 3.11+) | Railway / Render / Fly.io / VPS |
| Database | PostgreSQL | Supabase / Railway / Neon |

---

## Frontend Deployment

### Apps Structure
- **Portal**: `apps/portal`
- **Admin**: `apps/admin`

### Option A — Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy Portal
cd apps/portal
vercel

# 3. Deploy Admin
cd apps/admin
vercel

# 4. Set env vars in Vercel dashboard:
#    VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (if using Supabase)
#    WEB3FORMS_KEY (for contact forms)
```

Config: `infrastructure/vercel.json` contains shared rules.

### Option B — Self-Hosted (Nginx)

```bash
# Copy files to web root
sudo cp -r apps/portal/* /var/www/aitdl-portal/
sudo cp -r apps/admin/* /var/www/aitdl-admin/

# Use config from infrastructure/nginx.conf
sudo cp infrastructure/nginx.conf /etc/nginx/sites-available/aitdl
```

---

## Backend Deployment

### Local Development

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

pip install -r requirements.txt
cp .env.example .env           # Edit with your values

# Start dev server
uvicorn main:app --reload --port 8000
# Swagger docs: http://localhost:8000/docs
```

### Option A — Railway

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login and deploy
railway login
cd backend
railway up

# 3. Set env vars via Railway dashboard
```

Config: `infrastructure/railway.json`

---

## Environment Variables

### Frontend
| Variable | Description | Example |
|---|---|---|
| `WEB3FORMS_KEY` | Web3Forms access key for contact forms | `abc123` |
| `API_BASE_URL` | Backend API URL | `https://api.aitdl.com` |

### Backend (`.env` file)
| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `SUPABASE_URL` | Supabase Project URL | `https://your-proj.supabase.co` |
| `SUPABASE_JWT_SECRET` | Supabase JWT Secret | `your-secret` |

---

## Database & Maintenance

```bash
# Run migrations
python scripts/migrate.py

# Seed development data
python scripts/seed.py

# Export architecture for review
python scripts/export_skeleton.py
```

---

## CI/CD

GitHub Actions workflow in `.github/workflows/deploy.yml`:
- **Trigger**: Push to `main` branch
- **Frontend**: Auto-deploys to Vercel (multi-app)
- **Backend**: Auto-deploys to Railway
- **Tests**: Runs `python -m pytest` before deploy

---

## Health Check

```bash
# Backend health
curl https://api.aitdl.com/health
```

© 2026 AITDL — AI Technology Development Lab
