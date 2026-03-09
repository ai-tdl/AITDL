**AITDL V3**

**Master Execution Command**

Code Complete \+ Production Deploy

Jawahar R. Mallah  |  Founder & System Architect  |  March 2026

| Current Score 7.2 / 10 | Target Score 9.5 / 10 | Primary Gap Admin Dashboard | Deploy Target Railway \+ Vercel |
| :---: | :---: | :---: | :---: |

# **Section 1 — Critical Fixes Before Anything Else**

|  | These three bugs will crash your app on startup or silently corrupt production data. Fix them first, before touching the admin dashboard or deploy. |
| :---- | :---- |

## **Fix 1 — plugin\_loader.py Typo (Hard Crash)**

The \_\_line\_\_ reference does not exist in Python. This crashes startup immediately.

| \# BROKEN — crashes on import PLUGINS\_DIR \= os.path.abspath(os.path.join(os.path.dirname(\_\_line\_\_), ...)) \# FIXED PLUGINS\_DIR \= os.path.abspath(os.path.join(os.path.dirname(\_\_file\_\_), '../../plugins')) |
| :---- |

## **Fix 2 — Lifespan Migration (main.py)**

Loaders currently run at module import time. Move them into a lifespan context manager and fire on\_system\_ready after plugins load — this is also what triggers the ai-assistant plugin which is currently registered but never called.

| from contextlib import asynccontextmanager @asynccontextmanager async def lifespan(app: FastAPI):     plugin\_loader.load\_plugins(app)   \# load first     product\_loader.load\_products(app)  \# validate plugin deps     await hooks.trigger('on\_system\_ready')  \# fire after both loaders     yield     \# teardown if needed app \= FastAPI(..., lifespan=lifespan)  \# remove old load calls at module level |
| :---- |

## **Fix 3 — product\_loader Must Respect enabled Flag**

Currently \_product\_template gets mounted as a live product. Add two guards: skip directories starting with underscore, and respect the enabled field in product.json.

| if item.startswith('\_'):     continue  \# skip templates if not manifest.get('enabled', True):     log.info(f'Skipping disabled product: {item}')     continue |
| :---- |

|  | Also update ganitsutram/product.json: change theme from vedic-classic to default — that theme does not exist yet and will cause a silent lookup failure when the theme engine runs. |
| :---- | :---- |

# **Section 2 — Admin Dashboard (Primary Blocker)**

The admin dashboard needs three new views: Products Manager, Plugin Manager, and Theme Selector. All three reuse your existing admin.css and JS patterns. Do not reinvent the design system.

## **2A — Backend API Routes First**

Build the API endpoints before touching frontend HTML. This lets you test data shapes independently.

### **Add to backend/routers/admin.py**

| \# Products list GET  /api/admin/products \# Returns: \[{id, name, version, enabled, route\_prefix, plugins\_required, theme}\] PATCH /api/admin/products/{product\_id} \# Body: {enabled: bool}  — toggle product on/off \# Plugins list GET  /api/admin/plugins \# Returns: \[{name, version, hooks\_registered: \[...\], status}\] \# Theme list GET  /api/admin/themes \# Returns: \[{name, version, active: bool}\] PATCH /api/admin/themes/active \# Body: {theme: string}  — set active theme |
| :---- |

|  | All admin routes must verify Supabase service\_role JWT — not just the regular authenticated check. A misconfigured admin endpoint exposes your entire platform config. |
| :---- | :---- |

## **2B — Products Manager View**

File: frontend/admin/products.html — reuse dashboard.html as the structural template.

| \[ \] | Create frontend/admin/products.html  —  copy dashboard.html structure, update nav active state |
| :---: | :---- |
| \[ \] | **Load products via GET /api/admin/products**  —  same fetch pattern as admin-leads.js |
| \[ \] | **Render product cards**  —  show: name, version, status badge, route prefix, required plugins |
| \[ \] | **Enable/disable toggle**  —  PATCH /api/admin/products/:id with {enabled: bool}, local JS mutation on success |
| \[ \] | **Show plugin dependency status**  —  red badge if a required plugin failed to load, green if all present |
| \[ \] | **Add nav link in dashboard.html sidebar**  —  Products — /admin/products.html |

## **2C — Plugin Manager View**

File: frontend/admin/plugins.html — this view doubles as your primary debugging tool during development.

| \[ \] | Create frontend/admin/plugins.html  —  copy products.html once it exists |
| :---: | :---- |
| \[ \] | **Load plugins via GET /api/admin/plugins** |
| \[ \] | **Show hooks registered per plugin**  —  expose hooks.\_hooks registry via the API endpoint |
| \[ \] | **Show last-fired timestamp per hook**  —  add last\_fired tracking to hooks.py |
| \[ \] | **Show plugin status**  —  loaded / failed / disabled |
| \[ \] | **Add hooks.list\_hooks() helper**  —  returns {event: \[callback names\]} — needed for the API response |

### **Add to backend/services/hooks.py**

| def list\_hooks() \-\> dict:     return {event: \[fn.\_\_name\_\_ for fn in callbacks\]             for event, callbacks in \_hooks.items()} def clear(event\_name: str) \-\> None:     \_hooks.pop(event\_name, None) |
| :---- |

## **2D — Theme Selector View**

File: frontend/admin/themes.html — live preview before save is the key UX requirement here.

| \[ \] | Create frontend/admin/themes.html |
| :---: | :---- |
| \[ \] | **Load themes via GET /api/admin/themes**  —  show active badge on current theme |
| \[ \] | **Live preview on click**  —  inject theme CSS variables into document.documentElement.style before saving — no page reload |
| \[ \] | **Save via PATCH /api/admin/themes/active**  —  persist to localStorage AND send to backend |
| \[ \] | **Scoped CSS per product**  —  theme variables apply globally; product overrides use \[data-product=name\] selectors |
| \[ \] | **Add nav link in dashboard.html**  —  Themes — /admin/themes.html |

# **Section 3 — Code Complete (Fill All TODOs)**

| Task | File / Location | Priority | Status |
| :---- | :---- | :---- | :---- |
| Fix \_\_line\_\_ typo | backend/services/plugin\_loader.py | **P0** | **CRITICAL** |
| Lifespan context manager | backend/main.py | **P0** | **CRITICAL** |
| product\_loader enabled guard | backend/services/product\_loader.py | **P0** | **CRITICAL** |
| Wire Ollama for LOCAL tier | backend/services/ai\_gateway.py | **P1** | **HIGH** |
| Wire OpenAI for PREMIUM tier | backend/services/ai\_gateway.py | **P1** | **HIGH** |
| Add fallback chain (premium→oss→local) | backend/services/ai\_gateway.py | **P1** | **HIGH** |
| Add STUB\_MODE flag | backend/services/ai\_gateway.py | **P1** | **HIGH** |
| Add list\_hooks() \+ clear() | backend/services/hooks.py | **P1** | **HIGH** |
| Admin products API route | backend/routers/admin.py | **P1** | **HIGH** |
| Admin plugins API route | backend/routers/admin.py | **P1** | **HIGH** |
| Admin themes API route | backend/routers/admin.py | **P1** | **HIGH** |
| products.html | frontend/admin/products.html | **P1** | **HIGH** |
| plugins.html | frontend/admin/plugins.html | **P1** | **HIGH** |
| themes.html | frontend/admin/themes.html | **P1** | **HIGH** |
| Plugin dependency validation | backend/services/product\_loader.py | **P2** | **MEDIUM** |
| ganitsutram theme fix | products/ganitsutram/product.json | **P2** | **MEDIUM** |
| Redis caching for /api/admin/stats | backend/routers/admin.py | **P2** | **MEDIUM** |
| Structured JSON logging | backend/core/config.py | **P2** | **MEDIUM** |
| on\_system\_ready fire confirmation | backend/main.py lifespan | **P2** | **MEDIUM** |
| whatsapp plugin router.py | plugins/whatsapp/ | **P3** | **LATER** |
| payments plugin router.py | plugins/payments/ | **P3** | **LATER** |
| ganitsutram backend router.py | products/ganitsutram/backend/ | **P3** | **LATER** |

# **Section 4 — AI Gateway Wiring**

The gateway currently returns fake stub data. Wire it properly before deploying — silent stubs in production are dangerous.

## **4A — Add STUB\_MODE and Fallback Chain**

| STUB\_MODE \= os.getenv('AI\_STUB\_MODE', 'false').lower() \== 'true' async def generate\_response(prompt, task\_type=TaskComplexity.BASIC, context=None):     source \= \_determine\_source(task\_type)     providers \= {         AISource.PREMIUM: \_call\_premium\_model,         AISource.OPEN\_SOURCE: \_call\_opensource\_model,         AISource.LOCAL: \_call\_local\_model,     }     \# Fallback chain: premium \-\> oss \-\> local     order \= list(providers.keys())     start \= order.index(source)     for provider\_key in order\[start:\]:         try:             return await providers\[provider\_key\](prompt, context)         except Exception as e:             log.warning(f'{provider\_key} failed, trying next: {e}')     raise RuntimeError('All AI providers failed') |
| :---- |

## **4B — Ollama Integration (LOCAL tier)**

| import httpx OLLAMA\_HOST \= os.getenv('OLLAMA\_HOST', 'http://localhost:11434') async def \_call\_local\_model(prompt, context=None):     if STUB\_MODE:         raise NotImplementedError('LOCAL stub — set AI\_STUB\_MODE=false')     async with httpx.AsyncClient(timeout=30) as client:         r \= await client.post(f'{OLLAMA\_HOST}/api/generate',             json={'model': 'llama3:8b', 'prompt': prompt, 'stream': False})         r.raise\_for\_status()         return {'provider': 'ollama', 'response': r.json()\['response'\], 'status': 'success'} |
| :---- |

## **4C — OpenAI Integration (PREMIUM tier)**

| import openai async def \_call\_premium\_model(prompt, context=None):     if STUB\_MODE:         raise NotImplementedError('PREMIUM stub — set AI\_STUB\_MODE=false')     client \= openai.AsyncOpenAI(api\_key=os.getenv('OPENAI\_API\_KEY'))     r \= await client.chat.completions.create(         model='gpt-4-turbo',         messages=\[{'role': 'user', 'content': prompt}\]     )     return {'provider': 'openai', 'response': r.choices\[0\].message.content, 'status': 'success'} |
| :---- |

|  | Ollama cannot run inside the FastAPI Railway dyno. It needs a separate Railway service or a dedicated VPS. Set OLLAMA\_HOST env var to point to that service URL. |
| :---- | :---- |

# **Section 5 — Production Deploy**

## **5A — Environment Variables (Never in Git)**

Set all of these in Railway and Vercel dashboards — never in .env committed to repo.

| Variable | Platform | Notes |
| :---- | :---- | :---- |
| SUPABASE\_URL | Railway | Project settings \> API |
| SUPABASE\_ANON\_KEY | Railway | Project settings \> API |
| SUPABASE\_SERVICE\_ROLE | Railway | Never expose to frontend |
| OPENAI\_API\_KEY | Railway | OpenAI dashboard |
| OLLAMA\_HOST | Railway | URL of your Ollama service |
| AI\_STUB\_MODE | Railway | false in production, true in dev |
| VITE\_API\_URL | Vercel | https://api.aitdl.com |

## **5B — Railway Deploy (FastAPI Backend)**

| \[ \] | Set start command  —  uvicorn backend.main:app \--host 0.0.0.0 \--port $PORT \--workers 4 |
| :---: | :---- |
| \[ \] | **Set all env vars in Railway dashboard**  —  see table above |
| \[ \] | **Add /health endpoint check**  —  Railway health check: GET /health, 200 \= healthy |
| \[ \] | **Set custom domain**  —  api.aitdl.com → Railway service |
| \[ \] | **Enable Railway auto-deploy from main branch**  —  Settings \> Deployments |
| \[ \] | **Verify CORS allows Vercel domain**  —  cors\_origins() must include https://aitdl.com and https://admin.aitdl.com |

## **5C — Vercel Deploy (Frontend \+ Admin)**

| \[ \] | Connect GitHub repo to Vercel  —  Import project, set root to frontend/ |
| :---: | :---- |
| \[ \] | **Set VITE\_API\_URL env var**  —  https://api.aitdl.com |
| \[ \] | **Configure vercel.json routing**  —  / → index.html, /admin → admin/index.html, /app/\* → products |
| \[ \] | **Set custom domains**  —  aitdl.com and admin.aitdl.com both point to Vercel |
| \[ \] | **Verify admin dashboard loads**  —  https://admin.aitdl.com/dashboard.html |
| \[ \] | **Test auth flow end-to-end**  —  Login → JWT → admin API call → 200 |

## **5D — Cloudflare (DNS \+ Protection)**

| \[ \] | Point aitdl.com to Vercel  —  A/CNAME record, proxy enabled (orange cloud) |
| :---: | :---- |
| \[ \] | **Point api.aitdl.com to Railway**  —  proxy enabled — hides backend IP |
| \[ \] | **Enable WAF**  —  block common attack patterns |
| \[ \] | **Enable DDoS protection**  —  Under Attack mode available if needed |
| \[ \] | **Set SSL/TLS to Full (strict)**  —  Security \> SSL/TLS |

# **Section 6 — Post-Deploy Verification**

Run this checklist after every deploy before marking the release as stable.

## **Backend Health**

| \[ \] | GET /health returns 200  —  status: ok, version: 3.0.0 |
| :---: | :---- |
| \[ \] | **GET /docs loads FastAPI Swagger**  —  all routers visible including product and plugin routes |
| \[ \] | **Plugin loader log shows all 4 plugins**  —  ai-assistant, analytics, whatsapp, payments |
| \[ \] | **Product loader log shows ganitsutram \+ dailyboard**  —  \_product\_template must NOT appear |
| \[ \] | **on\_system\_ready fires in logs**  —  look for: \[AI Assistant\] Plugin initialized |
| \[ \] | **Rate limiting works**  —  POST /api/auth/login 6 times — 6th should return 429 |

## **Admin Dashboard**

| \[ \] | admin.aitdl.com/index.html loads login |
| :---: | :---- |
| \[ \] | **Login with admin credentials succeeds**  —  redirects to dashboard.html |
| \[ \] | **Stats load correctly**  —  leads count, partners count visible |
| \[ \] | **Products Manager loads product list**  —  ganitsutram and dailyboard visible, \_template absent |
| \[ \] | **Plugin Manager loads all 4 plugins with hook names** |
| \[ \] | **Theme Selector live preview works**  —  click theme → CSS variables change without reload |
| \[ \] | **Enable/disable product toggle persists**  —  disable ganitsutram → reload → still disabled |

## **AI Gateway**

| \[ \] | POST /api/ai/assistant returns response  —  task\_type: basic → ollama route |
| :---: | :---- |
| \[ \] | **Fallback chain works**  —  stop Ollama → request falls back to open-source tier |
| \[ \] | **STUB\_MODE=false confirmed in Railway env**  —  no stub responses in production logs |
| \[ \] | **Premium tier responds for advanced task\_type** |

## **Security**

| \[ \] | CORS rejects requests from unlisted origins  —  test from a random domain — must get CORS error |
| :---: | :---- |
| \[ \] | **Admin endpoints return 403 without service\_role JWT** |
| \[ \] | **Auth endpoint returns generic error for wrong credentials**  —  must not say email not found or wrong password |
| \[ \] | **.env not present in Railway build logs**  —  check deploy logs for accidental exposure |
| \[ \] | **Cloudflare proxy active on both domains**  —  server IP not visible via DNS lookup |

# **Section 7 — After Launch: Next Phase**

Once production is stable, the most impactful next investments in order:

| Phase | Feature | Why Now |
| :---- | :---- | :---- |
| **A** | WhatsApp Plugin — lead.created → instant message | Highest user-visible impact, short build time |
| **B** | AI Lead Scoring — intent, quality, priority | Makes the admin dashboard genuinely useful, not just aesthetic |
| **C** | Redis Caching — admin stats \+ AI response cache | Cost reduction and performance, needed before scale |
| **D** | Public Portal Gateway — AITDL product index page | External-facing, requires scoring to make first impression strong |
| **E** | Structured JSON Logging \+ Sentry | Ops necessity — you will be blind without it post-launch |

| Complete this document → ship this project. Current: 7.2 / 10  →  Target: 9.5 / 10 || ॐ श्री गणेशाय नमः || |
| :---: |

