**AITDL**

**Content Management System**

Architecture & Design Plan

Internal First  ·  Then Productize  ·  AI-Native from Day One

| V1 Features 6 Modules | Approach Design First | Scope Internal → Product | AI Layer Native Gateway |
| :---: | :---: | :---: | :---: |

# **Section 1 — Vision & Strategic Position**

AITDL CMS is not a generic content tool. It is an AI-native, modular content platform built for the Indian market — designed first for AITDL's own landing pages, blog, and product cards, then productized and sold to AITDL's existing client base: retailers, schools, NGOs, and businesses who need to manage their own digital presence without technical teams.

|  | The AI assistance layer is the core differentiator. No existing Indian CMS has a deeply integrated AI that knows your brand voice, your audience segments, your language preferences, and your product catalogue. AITDL CMS does — because it runs on the same AI Gateway already built into the platform. |
| :---- | :---- |

## **1A — What Makes This Different**

| Differentiator | What it means for AITDL |
| :---- | :---- |
| AI-native from day one | Content generation, improvement, and translation powered by your own AI Gateway — not a third-party plugin |
| India-first design | Hindi/regional language support, Indian date formats, GST-aware form fields, UPI-ready media |
| Built on your existing stack | FastAPI \+ Supabase \+ Vercel — no new infrastructure, no new vendors |
| Modular plugin architecture | CMS is a plugin (cms-core) — can be enabled/disabled per product, just like analytics or whatsapp |
| Multi-tenant ready | Each AITDL client gets their own content workspace — isolated via RLS, same codebase |
| Sells itself | AITDL clients already trust the brand — CMS becomes an upsell to existing retail, school, NGO clients |

## **1B — Who Uses It**

| User Type | Role & Permissions |
| :---- | :---- |
| AITDL Super Admin | Full access to all workspaces, system config, AI gateway settings, plugin management |
| AITDL Content Editor | Manages AITDL's own pages, blog, cards — uses AI generation freely |
| Client Admin | Manages their own workspace only — pages, blog, forms, media — cannot see other clients |
| Client Editor | Creates and edits content within their workspace — cannot publish without approval |
| AI Assistant (system) | Automated agent — suggests improvements, flags broken links, generates SEO metadata |

# **Section 2 — System Architecture**

The CMS is built as a plugin within the AITDL Modular Ecosystem. It does not replace or modify the core backend — it extends it via the existing plugin\_loader and hooks system already in place.

## **2A — High-Level Architecture**

| AITDL CMS — Architecture Layers ┌─────────────────────────────────────────────┐ │  CMS Studio (Frontend — Vercel)             │ │  Page Builder · Blog · Cards · Media · Forms│ └────────────────┬────────────────────────────┘                  │  REST \+ WebSocket            ┌────────────────▼────────────────────────────┐ │  cms-core Plugin (FastAPI / Railway)        │ │  /api/cms/\*  ·  hooks  ·  router            │ └──┬──────────┬──────────┬────────────────────┘    │          │          │                          ▼          ▼          ▼                       Supabase   AI Gateway  Media Store              (content   (generate   (Supabase Storage         DB \+ RLS)  improve)    or S3-compatible)       |
| :---- |

## **2B — Plugin Structure**

| File / Directory | Purpose |
| :---- | :---- |
| plugins/cms-core/plugin.json | Plugin manifest — name, version, dependencies, enabled flag |
| plugins/cms-core/hooks.py | Registers on\_content\_published, on\_media\_uploaded, on\_form\_submitted |
| plugins/cms-core/router.py | Mounts all /api/cms/\* endpoints to FastAPI |
| plugins/cms-core/models/ | SQLAlchemy models: Page, Block, Card, BlogPost, MediaAsset, CMSForm |
| plugins/cms-core/services/ai.py | Wraps AI Gateway — generate\_copy(), improve\_text(), translate(), seo\_meta() |
| plugins/cms-core/frontend/ | CMS Studio UI — served at /cms or admin.aitdl.com/cms |
| plugins/cms-core/migrations/ | SQL migrations for all CMS tables — applied via existing migrate.py |

## **2C — Integration with Existing System**

|  | The CMS hooks into your existing hook system. When content is published, on\_content\_published fires — the analytics plugin listens and records it, the whatsapp plugin can notify clients, and the AI plugin can auto-generate a social media post. Zero coupling between plugins. |
| :---- | :---- |

# **Section 3 — Database Schema Design**

All CMS tables live in Supabase PostgreSQL. RLS enforces workspace isolation — each client's content is invisible to other clients at the database level, not just the application level.

## **3A — Core Tables**

| \-- workspaces — one per client |
| :---- |
| id                          uuid PK             DEFAULT gen\_random\_uuid() |
| name                        TEXT NOT NULL       \-- 'AITDL', 'Sharma Retail', etc. |
| slug                        TEXT UNIQUE         \-- used in API routes |
| plan                        TEXT                \-- 'internal', 'starter', 'pro' |
| ai\_credits\_used             INTEGER             DEFAULT 0 |
| ai\_credits\_limit            INTEGER             DEFAULT 1000 |
| created\_at                  TIMESTAMPTZ         DEFAULT now() |

| \-- pages — full page records |
| :---- |
| id                          uuid PK              |
| workspace\_id                uuid FK             REFERENCES workspaces(id) |
| title                       TEXT NOT NULL        |
| slug                        TEXT NOT NULL       \-- /about, /products |
| status                      TEXT                \-- draft | published | archived |
| template                    TEXT                \-- landing | blog | product | custom |
| seo\_title                   TEXT                \-- AI-generated or manual |
| seo\_description             TEXT                \-- AI-generated or manual |
| published\_at                TIMESTAMPTZ          |
| created\_by                  uuid FK             REFERENCES admin\_users(id) |

| \-- blocks — page builder blocks (ordered) |
| :---- |
| id                          uuid PK              |
| page\_id                     uuid FK             REFERENCES pages(id) ON DELETE CASCADE |
| type                        TEXT NOT NULL       \-- hero|cards|blog|form|media|text|cta |
| sort\_order                  INTEGER              |
| config                      JSONB               \-- all block settings as structured JSON |
| ai\_generated                BOOLEAN             DEFAULT false |
| updated\_at                  TIMESTAMPTZ         DEFAULT now() |

| \-- cards — reusable card \+ sub-card system |
| :---- |
| id                          uuid PK              |
| workspace\_id                uuid FK              |
| parent\_id                   uuid FK             REFERENCES cards(id) \-- NULL \= root card |
| title                       TEXT NOT NULL        |
| description                 TEXT                 |
| icon                        TEXT                \-- emoji or icon key |
| badge                       TEXT                \-- 'LIVE', 'COMING SOON', etc. |
| cta\_text                    TEXT                 |
| cta\_url                     TEXT                 |
| sort\_order                  INTEGER              |
| enabled                     BOOLEAN             DEFAULT true |
| tags                        TEXT\[\]              \-- for filtering |

| \-- blog\_posts |
| :---- |
| id                          uuid PK              |
| workspace\_id                uuid FK              |
| title                       TEXT NOT NULL        |
| slug                        TEXT NOT NULL        |
| content                     JSONB               \-- rich text as structured blocks |
| author\_id                   uuid FK              |
| status                      TEXT                \-- draft | review | published |
| featured\_image              uuid FK             REFERENCES media\_assets(id) |
| ai\_summary                  TEXT                \-- auto-generated |
| published\_at                TIMESTAMPTZ          |

| \-- media\_assets |
| :---- |
| id                          uuid PK              |
| workspace\_id                uuid FK              |
| filename                    TEXT NOT NULL        |
| storage\_path                TEXT NOT NULL       \-- Supabase Storage path |
| cdn\_url                     TEXT                \-- public CDN URL |
| mime\_type                   TEXT                 |
| size\_bytes                  INTEGER              |
| alt\_text                    TEXT                \-- AI-generated if not provided |
| uploaded\_by                 uuid FK              |

| \-- cms\_forms \+ cms\_submissions |
| :---- |
| cms\_forms: id               workspace\_id, title fields JSONB, notify\_email, enabled |
| cms\_submissions: id         form\_id, data JSONB submitted\_at, ip\_hash, status |

# **Section 4 — API Design**

All CMS endpoints mount under /api/cms/. Workspace isolation is enforced at the middleware level — every request is scoped to the authenticated user's workspace automatically.

## **4A — Endpoint Map**

| Endpoint | Method | Module | Priority |
| :---- | :---- | :---- | :---- |
| GET /api/cms/pages | GET | **Pages** | **P0** |
| POST /api/cms/pages | POST | **Pages** | **P0** |
| PATCH /api/cms/pages/:id | PATCH | **Pages** | **P0** |
| DELETE /api/cms/pages/:id | DELETE | **Pages** | **P0** |
| GET /api/cms/pages/:id/blocks | GET | **Page Builder** | **P0** |
| POST /api/cms/pages/:id/blocks | POST | **Page Builder** | **P0** |
| PATCH /api/cms/blocks/:id | PATCH | **Page Builder** | **P0** |
| POST /api/cms/blocks/reorder | POST | **Page Builder** | **P0** |
| GET /api/cms/cards | GET | **Cards** | **P0** |
| POST /api/cms/cards | POST | **Cards** | **P0** |
| PATCH /api/cms/cards/:id | PATCH | **Cards** | **P0** |
| GET /api/cms/cards/:id/children | GET | **Sub-cards** | **P0** |
| GET /api/cms/blog | GET | **Blog** | **P1** |
| POST /api/cms/blog | POST | **Blog** | **P1** |
| PATCH /api/cms/blog/:id | PATCH | **Blog** | **P1** |
| POST /api/cms/blog/:id/publish | POST | **Blog** | **P1** |
| POST /api/cms/media/upload | POST | **Media** | **P1** |
| GET /api/cms/media | GET | **Media** | **P1** |
| DELETE /api/cms/media/:id | DELETE | **Media** | **P1** |
| GET /api/cms/forms | GET | **Forms** | **P1** |
| POST /api/cms/forms | POST | **Forms** | **P1** |
| GET /api/cms/forms/:id/submissions | GET | **Forms** | **P1** |
| POST /api/cms/ai/generate | POST | **AI Layer** | **P0** |
| POST /api/cms/ai/improve | POST | **AI Layer** | **P0** |
| POST /api/cms/ai/translate | POST | **AI Layer** | **P1** |
| POST /api/cms/ai/seo | POST | **AI Layer** | **P1** |
| GET /api/cms/workspaces | GET | **Multi-tenant** | **P2** |
| POST /api/cms/workspaces | POST | **Multi-tenant** | **P2** |

## **4B — AI Endpoints Detail**

| Endpoint | Request → Response |
| :---- | :---- |
| POST /api/cms/ai/generate | {block\_type, context, tone, language} → {content, tokens\_used} |
| POST /api/cms/ai/improve | {text, instruction} → {improved\_text, diff\_summary} |
| POST /api/cms/ai/translate | {text, target\_lang} → {translated, language\_detected} |
| POST /api/cms/ai/seo | {page\_title, content\_summary} → {seo\_title, meta\_description, keywords\[\]} |

|  | All AI endpoints route through the existing AI Gateway (ai\_gateway.py). The CMS AI service does not call OpenAI or Ollama directly — it calls generate\_response() with appropriate task\_type. This means AI routing (local vs premium), fallback chains, and cost tracking all work automatically. |
| :---- | :---- |

# **Section 5 — Six V1 Modules**

## **Module 1 — Page Builder**

Block-based, not drag-and-drop. Blocks are ordered JSON configs stored in the blocks table. The editor renders a visual preview of each block with an Edit button — no live canvas manipulation.

| Block Type | Config Fields |
| :---- | :---- |
| hero | title, subtitle, cta\_text, cta\_url, background\_type, image\_id |
| cards | card\_ids\[\] (references cards table), layout: grid|list|carousel |
| blog\_preview | count, filter\_tag, show\_featured\_image |
| text | content (rich text JSONB), alignment, max\_width |
| media | asset\_id, caption, display: full|contained|float |
| cta\_banner | heading, subtext, button\_text, button\_url, bg\_color |
| form | form\_id (references cms\_forms), show\_title, success\_message |
| stats | items: \[{label, value, suffix}\], layout: row|grid |

|  | AI integration: any block has a 'Generate with AI' button. Clicking it sends the block\_type and page context to POST /api/cms/ai/generate and populates the fields automatically. The editor can accept, modify, or regenerate. |
| :---- | :---- |

## **Module 2 — Blog \+ Rich Text Editor**

Blog posts are stored as structured JSONB (not raw HTML). This makes them queryable, translatable, and renderable on any frontend without a parser.

| Feature | Implementation |
| :---- | :---- |
| Rich text nodes | paragraph, heading(1-3), bold, italic, link, image, code, quote, divider |
| Image in content | Upload via media library — stored as media\_asset\_id reference, not base64 |
| Auto-save | Draft saves every 30 seconds via PATCH /api/cms/blog/:id — no data loss |
| AI summary | On publish, POST /api/cms/ai/generate auto-creates a 2-sentence summary |
| SEO meta | POST /api/cms/ai/seo auto-fills seo\_title and meta\_description on publish |
| Status flow | draft → review → published (configurable — solo users can skip review) |
| Scheduled publish | published\_at field — cron job on Railway checks and publishes at time |

## **Module 3 — Card & Sub-Card Manager**

Cards are the core content unit of AITDL's frontend — the gate doors, the overview grid, the product cards. The card manager makes all of these editable without touching HTML.

| Concept | Detail |
| :---- | :---- |
| Root cards | Top-level cards — the 9 overview cards, the 3 gate doors, product cards |
| Sub-cards | Children of root cards — product features, pricing tiers, FAQ items |
| Depth | Max 2 levels (card → sub-cards). Deeper nesting not needed for AITDL use case |
| Ordering | sort\_order integer — drag reorder in UI, PATCH /api/cms/blocks/reorder |
| Enabled toggle | enabled boolean — disable a card without deleting it |
| Tags | tags TEXT\[\] — filter cards by audience segment: retail, student, ngo, etc. |
| Frontend binding | Cards fetched via GET /api/cms/cards?tag=retail — frontend renders dynamically |

## **Module 4 — Media Library**

| Feature | Detail |
| :---- | :---- |
| Storage backend | Supabase Storage (primary) — S3-compatible, CDN via Supabase CDN URLs |
| Upload | Multipart upload to POST /api/cms/media/upload — max 10MB images, 50MB video |
| Auto alt-text | On upload, POST /api/cms/ai/generate generates alt text from filename \+ context |
| Formats | jpg, png, webp, svg, pdf, mp4 (video preview only) |
| Image optimisation | Supabase Storage transformation API — resize/format on the fly via URL params |
| Folder structure | workspace\_id / year / month / filename — collision-safe, tenant-isolated |
| Usage tracking | media\_assets tracks which blocks/posts reference each asset — safe delete warning |

## **Module 5 — AI Content Generation**

| AI Feature | User-facing behaviour |
| :---- | :---- |
| Generate block content | 'Fill with AI' button on any block — generates title, body, CTA from context |
| Improve existing text | Select text → 'Improve' → choose: shorten / expand / more formal / more casual |
| Translate content | One-click translate page or block to Hindi, Marathi, Gujarati, Tamil |
| SEO metadata | Auto-generate seo\_title \+ meta\_description on publish or on demand |
| Blog summary | Auto-generate 2-sentence summary for blog listing cards on publish |
| Brand voice lock | System prompt includes AITDL brand guidelines — AI stays on-brand always |
| Credit system | Each workspace has ai\_credits\_limit — tracks usage, prevents abuse |
| Tier routing | Simple tasks (alt text) → local Ollama. Blog writing → premium. Auto-routed. |

## **Module 6 — Form Builder \+ Submissions**

| Feature | Detail |
| :---- | :---- |
| Form config | Fields stored as JSONB: \[{type, name, label, required, options, validation}\] |
| Field types | text, email, tel, select, textarea, checkbox, radio, file upload, hidden |
| Submission storage | All submissions saved to cms\_submissions — never lost even if email fails |
| Notifications | On submit: fire on\_form\_submitted hook → email notification \+ optional WhatsApp |
| Anti-spam | Honeypot field \+ rate limiting (5 submissions / IP / hour via slowapi) |
| Export | GET /api/cms/forms/:id/submissions?format=csv — download for CRM import |
| Replaces | Your existing /api/contact and /api/partner forms — migrate them to CMS forms |

# **Section 6 — CMS Studio UI Design**

The CMS Studio is the editor interface — served as a separate frontend at admin.aitdl.com/cms or cms.aitdl.com. It reuses your existing admin.css dark aesthetic and component patterns.

## **6A — Navigation Structure**

| Nav Item | Sub-items |
| :---- | :---- |
| Pages | All Pages · New Page · Templates |
| Cards | Root Cards · Sub-cards · Tag Manager |
| Blog | All Posts · New Post · Categories · Comments |
| Media | All Assets · Upload · Folders |
| Forms | All Forms · New Form · Submissions |
| AI Studio | Generate · Improve · Translate · Usage |
| Settings | Workspace · Users · SEO Defaults · Integrations |

## **6B — Page Builder UX Flow**

| Page Builder Flow 1\.  Editor opens a page → sees ordered list of blocks (not a canvas) 2\.  Each block shows: block type badge, preview summary, Edit / Delete / Move buttons 3\.  Click Edit → side panel opens with block-specific form fields 4\.  'Generate with AI' button in side panel → fills fields from AI gateway 5\.  Save block → local optimistic update, then PATCH /api/cms/blocks/:id 6\.  Drag block row to reorder → POST /api/cms/blocks/reorder with new sort\_order\[\] 7\.  'Add Block' button → modal shows all block types with visual previews 8\.  Preview button → opens live preview in iframe at /preview/:page\_slug?draft=true 9\.  Publish → PATCH page status to published, fires on\_content\_published hook |
| :---- |

## **6C — AI Studio Panel**

A dedicated AI Studio tab — not just AI buttons scattered in forms. This is where non-technical editors go to generate content from scratch before placing it in pages.

| Tool | Input → Output |
| :---- | :---- |
| Page Copy Generator | Page type \+ audience \+ tone → full hero title, subtitle, CTA copy |
| Blog Post Drafter | Topic \+ keywords \+ length → structured blog post draft |
| Card Batch Generator | Product name \+ features\[\] → full card title, description, badge, CTA |
| SEO Audit | Page URL → SEO score, missing meta, keyword suggestions |
| Translate Workspace | Select page/post → translate all text fields to chosen language |
| Brand Voice Check | Paste any text → score against AITDL brand guidelines, suggest improvements |

# **Section 7 — Productization Plan**

Once AITDL CMS runs stable for AITDL internally, it becomes a product sold to AITDL's existing client base. The multi-tenant architecture (workspaces \+ RLS) is designed for this from day one — no architectural changes needed to productize.

## **7A — Pricing Model**

| Plan | Price | AI Credits/mo | Target |
| :---- | :---- | :---- | :---- |
| **Internal** | Free | Unlimited | AITDL own use |
| **Starter** | ₹999/mo | 500 credits | Small retailers, teachers |
| **Pro** | ₹2,499/mo | 2,000 credits | Schools, coaching institutes |
| **Business** | ₹4,999/mo | Unlimited | NGOs, multi-branch retail |

|  | AI credits map to gateway costs. Local Ollama \= 1 credit. Open-source \= 5 credits. Premium OpenAI \= 20 credits. This aligns client pricing with your actual infrastructure costs and incentivises local AI usage. |
| :---- | :---- |

## **7B — Go-to-Market**

| Phase | Action |
| :---- | :---- |
| Month 1–2 | Use internally — AITDL's own landing page and blog managed via CMS |
| Month 3 | Pilot with 2–3 trusted clients (school, retailer, NGO) — free access |
| Month 4 | Gather feedback, fix rough edges, add missing field types |
| Month 5 | Launch Starter plan to existing AITDL client base via email campaign |
| Month 6+ | Partner programme — AITDL partners sell CMS subscriptions in their city |

# **Section 8 — Build Phases & Sequencing**

| Phase 1  — Foundation (Week 1–2) |  |  |
| :---- | :---- | :---- |
| **Plugin scaffold** | Create plugins/cms-core/ with plugin.json, hooks.py, router.py |  |
| **Database migrations** | Write and apply all CMS table migrations via migrate.py |  |
| **Workspace middleware** | Request scoping — every API call auto-filtered by workspace\_id |  |
| **Basic pages CRUD** | GET/POST/PATCH/DELETE /api/cms/pages — no blocks yet |  |
| **Cards CRUD** | Full card \+ sub-card API with parent\_id tree structure |  |
| **Auth integration** | CMS endpoints use existing Supabase JWT — no new auth system |  |

| Phase 2  — Core Editing (Week 3–4) |  |  |
| :---- | :---- | :---- |
| **Block system** | blocks table, CRUD endpoints, reorder endpoint |  |
| **Page builder UI** | Studio frontend — block list view, side panel editor, block type modal |  |
| **Card manager UI** | Root cards list, sub-cards nested view, drag reorder, enable toggle |  |
| **Media upload** | POST /api/cms/media/upload → Supabase Storage, CDN URL returned |  |
| **Media library UI** | Grid view, search, select-for-block, delete with usage check |  |
| **Live preview** | GET /preview/:slug?draft=true — renders page with current draft blocks |  |

| Phase 3  — AI Layer (Week 5\) |  |  |
| :---- | :---- | :---- |
| **AI service wrapper** | plugins/cms-core/services/ai.py — wraps existing ai\_gateway.py |  |
| **Generate endpoint** | POST /api/cms/ai/generate — block\_type \+ context → content |  |
| **Improve endpoint** | POST /api/cms/ai/improve — text \+ instruction → improved |  |
| **Generate buttons** | 'Fill with AI' in every block side panel — single click generation |  |
| **Credit tracking** | Deduct from workspace ai\_credits\_used on every AI call |  |
| **SEO auto-fill** | On page publish — auto-call /api/cms/ai/seo if fields empty |  |

| Phase 4  — Blog & Forms (Week 6–7) |  |  |
| :---- | :---- | :---- |
| **Blog post model** | JSONB rich text storage, status flow, scheduled publish cron |  |
| **Rich text editor** | Block-based editor in Studio — paragraph, heading, image, quote nodes |  |
| **Blog UI** | Post list, new post, editor, publish flow, preview |  |
| **Form builder** | JSONB field config, form renderer, submission endpoint |  |
| **Submission storage** | cms\_submissions table, export to CSV endpoint |  |
| **Form notifications** | on\_form\_submitted hook → email \+ optional WhatsApp plugin trigger |  |

| Phase 5  — Multi-tenant & Productize (Week 8–10) |  |  |
| :---- | :---- | :---- |
| **Workspace management** | Create workspace, invite users, set plan, ai\_credits\_limit |  |
| **Billing integration** | Razorpay subscription — plan upgrade triggers credit limit update |  |
| **Client onboarding** | New workspace → seed with default page, sample card, welcome blog post |  |
| **Usage dashboard** | AI credits used vs limit, pages count, form submissions this month |  |
| **Partner white-label** | Optional: client sees their brand in Studio, not AITDL branding |  |
| **Documentation** | API docs, editor guide, partner reseller guide |  |

# **Section 9 — Key Design Decisions**

| Decision | Rationale |
| :---- | :---- |
| Block-based, not drag-and-drop | Drag-and-drop is complex to build and fragile on mobile. Block ordering with up/down arrows or simple drag handles is sufficient for the use case and ships in days not weeks. |
| JSONB for block config, not separate columns | Each block type has different fields. JSONB avoids a sprawling table schema and makes adding new block types trivial — just define the config shape in the frontend. |
| Rich text as JSONB nodes, not raw HTML | Raw HTML is an XSS risk and hard to translate or query. Structured nodes (like Sanity's Portable Text) are safe, queryable, and render anywhere. |
| Supabase Storage over S3 | Already in your stack. Zero new credentials. RLS policies apply to storage buckets. Upgrade to S3 later if needed — the cdn\_url field abstracts the storage backend. |
| AI credits, not token counting | Token counting is confusing for clients. Credits (1 / 5 / 20 per call tier) are simple to understand, easy to display in a dashboard, and map well to your cost tiers. |
| Plugin, not standalone service | CMS as a plugin means it loads only when enabled, shares the FastAPI process, uses existing auth middleware, and benefits from all future platform improvements automatically. |
| Max 2 card nesting levels | Deeper nesting creates UX complexity for editors and rarely maps to real content needs. Two levels (card → sub-cards) covers every AITDL use case identified so far. |

| Design complete. Architecture approved. Begin Phase 1\. AITDL CMS — built on your stack, powered by your AI, sold to your clients. || ॐ श्री गणेशाय नमः || |
| :---: |

