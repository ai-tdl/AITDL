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

# AITDL v2 — Deployment Guide

## Stack Overview

| Layer | Tech | Platform |
|---|---|---|
| Frontend | HTML + CSS + JS (Vanilla) | Vercel / Netlify / Nginx |
| Backend | FastAPI (Python 3.11+) | Railway / Render / Fly.io / VPS |
| Database | PostgreSQL | Supabase / Railway / Neon |

---

## Frontend Deployment

### Option A — Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy from project root
cd aitdl-v2/frontend
vercel

# 3. Follow prompts — point to frontend/ directory
# 4. Set env vars in Vercel dashboard:
#    VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (if using Supabase)
#    WEB3FORMS_KEY (for contact forms)
```

Config: `deploy/vercel.json` is auto-picked up.

### Option B — Netlify

```bash
cd aitdl-v2/frontend
netlify deploy --prod
```

Config: `deploy/netlify.toml` handles redirects and headers.

### Option C — Self-Hosted (Nginx)

```bash
# Copy files to web root
sudo cp -r frontend/* /var/www/aitdl/

# Use config from deploy/nginx.conf
sudo cp deploy/nginx.conf /etc/nginx/sites-available/aitdl
sudo ln -s /etc/nginx/sites-available/aitdl /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## Backend Deployment

### Local Development

```bash
cd aitdl-v2/backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

pip install -r requirements.txt
cp .env.example .env           # Edit with your values

# Run DB migrations
python ../scripts/migrate.py

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
cd aitdl-v2/backend
railway up

# 3. Set env vars via Railway dashboard
# 4. Add PostgreSQL service in Railway
# 5. Run migrations: railway run python ../scripts/migrate.py
```

Config: `deploy/railway.json`

### Option B — Render

1. Connect GitHub repo to Render
2. Set Root Directory: `aitdl-v2/backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add env vars in Render dashboard
6. Add PostgreSQL database service

### Option C — Self-Hosted VPS

```bash
# Install dependencies
sudo apt update && sudo apt install python3.11 python3.11-venv nginx postgresql

# Clone and setup
cd /opt
git clone https://github.com/YOUR_ORG/aitdl-v2.git
cd aitdl-v2/backend
python3.11 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Setup systemd service
sudo cp deploy/aitdl-backend.service /etc/systemd/system/
sudo systemctl enable aitdl-backend && sudo systemctl start aitdl-backend

# Setup Nginx reverse proxy
sudo cp deploy/nginx.conf /etc/nginx/sites-available/aitdl
```

---

## Environment Variables

### Frontend (`frontend/js/config.js` picks these up)

| Variable | Description | Example |
|---|---|---|
| `WEB3FORMS_KEY` | Web3Forms access key for contact forms | `abc123` |
| `API_BASE_URL` | Backend API URL | `https://api.aitdl.com` |

### Backend (`.env` file)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `CORS_ORIGINS` | Allowed frontend domains | `https://aitdl.com,https://www.aitdl.com` |
| `SECRET_KEY` | App secret (random string) | `change-this-in-production` |

---

## Database Setup

```bash
# Run initial migration
cd aitdl-v2
python scripts/migrate.py

# Seed development data (optional)
python scripts/seed.py
```

---

## CI/CD

GitHub Actions workflow in `.github/workflows/deploy.yml`:
- **Trigger**: Push to `main` branch
- **Frontend**: Auto-deploys to Vercel
- **Backend**: Auto-deploys to Railway
- **Tests**: Runs `pytest tests/` before deploy

---

## Health Check

```bash
# Backend health
curl https://api.aitdl.com/health

# Test contact form
curl -X POST https://api.aitdl.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"9876543210","section":"retail","message":"Demo"}'
```
