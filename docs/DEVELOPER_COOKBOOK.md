॥ ॐ श्री गणेशाय नमः ॥
॥ ॐ श्री सरस्वत्यै नमः ॥
॥ ॐ नमो नारायणाय ॥
॥ ॐ नमः शिवाय ॥
॥ ॐ दुर्गायै नमः ॥

# AITDL DEVELOPER COOKBOOK
### A Living Knowledge Ecosystem — Platform V3

---

## 🏛️ Frontispiece

- **Author**: Jawahar R. Mallah
- **Organization**: AITDL — Artificial Intelligence That Defines Legacy
- **Website**: [https://aitdl.com](https://aitdl.com)
- **Copyright**: © aitdl.com | AITDL | Vikram Samvat 2083 | 2026

---

## 📖 Table of Contents

1.  [**Vision & Mission**](#-chapter-1-vision--mission)
2.  [**The Core Stack**](#-chapter-2-the-core-stack)
3.  [**Visual Design System**](#-chapter-3-visual-design-system)
4.  [**Architectural Blueprint**](#-chapter-4-architectural-blueprint)
5.  [**Authentication & Security**](#-chapter-5-authentication--security)
6.  [**Data & State Management**](#-chapter-6-data--state-management)
7.  [**Deployment & Verification**](#-chapter-7-deployment--verification)
8.  [**Signature & Ethics**](#-chapter-8-signature--ethics)
9.  [**The Spiritual Codebase**](#-chapter-9-the-spiritual-codebase)
10. [**Component Gallery**](#-chapter-10-component-gallery)
11. [**Content Studio (CMS) Internals**](#-chapter-11-content-studio-cms-internals)
12. [**The Troubleshooting Matrix**](#-chapter-12-the-troubleshooting-matrix)
13. [**Local Development Workflow**](#-chapter-13-local-development-workflow)
14. [**Development History (Walkthrough)**](#-chapter-14-development-history-walkthrough)
15. [**The API & Service Mesh**](#-chapter-15-the-api--service-mesh)
16. [**Security & Data Governance**](#-chapter-16-security--data-governance)
17. [**AI Studio Engineering**](#-chapter-17-ai-studio-engineering)
18. [**Advanced UI Tokens & Motion**](#-chapter-18-advanced-ui-tokens--motion)
19. [**Performance & Edge Orchestration**](#-chapter-19-performance--edge-orchestration)
20. [**Testing the Universe**](#-chapter-20-testing-the-universe)

---

## 🌌 Chapter 1: Vision & Mission

AITDL is not merely a software suite; it is a **Living Knowledge Ecosystem**. Established in 2007, the platform has evolved from its roots in 628 CE (Brahmasphuṭasiddhānta) to a modern AI-driven infrastructure.

Our mission is to provide technology solutions for Retail, ERP, Education, and AI that define legacy through precision, speed, and aesthetic excellence.

---

## 🛠️ Chapter 2: The Core Stack

The V3 Platform is built on the cutting edge of the modern web:

-   **Framework**: Next.js 15.4+ (App Router)
-   **Language**: TypeScript (Strict Mode)
-   **Database**: Supabase / PostgreSQL
-   **Backend Proxy**: FastAPI (Python)
-   **Styling**: Tailwind CSS + Custom Vanilla CSS
-   **Deployment**: Vercel (Frontend) / Railway (Backend)

---

## 🎨 Chapter 3: Visual Design System

### The "Cinematic" Philosophy
Every page must WOW the user. We avoid generic designs in favor of **Premium Aesthetics**.

-   **Glassmorphism**: Use the `.glass` class for translucent, blurred backgrounds.
-   **Color Theory**: Curated HSL palettes tailored for each audience (Retail Orange, ERP Blue, AI Purple).
-   **Typography**: Modern sans-serif fonts (Inter, Outfit) with tracking-[0.2em] for headers.
-   **Micro-animations**: Subtle reveals, custom cursors, and particle backgrounds.

---

## 🏗️ Chapter 4: Architectural Blueprint

### Folder Structure
The repository follows a clean, modular structure:

-   `src/app/(portal)`: Public-facing routes (Universe, Explore, Partner).
-   `src/app/admin`: Administrative Dashboard and Management.
-   `src/app/cms`: The Content Studio for blog/media management.
-   `src/components/visual`: Reusable UI components (Sidebar, Backgrounds).

### Layout Isolation
We use **Route Groups** like `(portal)` to isolate public headers/footers from the administrative shell, preventing UI overlap and ensuring a dedicated workspace for admins.

---

## 🔐 Chapter 5: Authentication & Security

### Supabase SSR
V3 uses `@supabase/ssr` for seamless server-side and client-side authentication.

-   **Server Components**: Use `createSupabaseServerClient` in layouts for guards.
-   **Force Dynamic**: Administration routes MUST utilize `export const dynamic = 'force-dynamic'` to bypass build-time pre-rendering errors.

### Authorization Levels
Users are granted access based on `app_metadata`:
- `superadmin`: Full access to Admin and CMS.
- `admin`: Standard administrative access.
- `partner`: Access restricted to partner networking portals.

---

## 📊 Chapter 6: Data & State Management

### Database Collections
-   `leads`: Captured inquiries from public forms.
-   `partners`: Registered partner network data.
-   `blog_posts`: Content for the Intelligence section.
-   `pages`: Dynamically rendered portal pages.

### Real-time Interaction
Use Supabase Real-time for live feed updates on the Admin Dashboard to show new lead velocity as it happens.

---

## 🚀 Chapter 7: Deployment & Verification

### Vercel Environments
Environment variables are critical. Ensure the following are set for every deployment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Server only)

### Verification
Always verify transitions with:
1.  `npm run build` locally.
2.  Browser subagent check on the live Vercel URL.

---

## ✍️ Chapter 8: Signature & Ethics

### The Fingerprint
Every core file must bear the identity fingerprint `AITDL-PLATFORM-V3`.

### Code of Ethics
- **No Placeholders**: Use AI-generated assets or real data.
- **Precision**: Code is art. Maintain strict type safety and semantic HTML.
- **Pride**: Built Pan India. Since 2007.

---


## 📿 Chapter 9: The Spiritual Codebase

### Standards for Invocations
The platform follows a sacred aesthetic. Every critical source file (Pages, Layouts, Core Libs) MUST start with the following block to maintain historical and spiritual alignment:
```tsx
// ॥ ॐ श्री गणेशाय नमः ॥
// Organization: AITDL · Creator: Jawahar R. Mallah
// Project: AITDL Platform V3
```

### Sovereign Naming
Consistency in naming maintains the project's identity. Use these terms in documentation and UI:
- **Sūtram**: Description for core logic, algorithms, and "rules of the game."
- **Universe**: The primary data-driven explore view of the platform.
- **Intelligence**: The knowledge hub comprising the Blog and AI insights.
- **Glass**: The custom CSS utility for translucent, blurred backgrounds.

### The Rule 13 Fingerprint
To ensure authenticity and integrity, the `AITDL-PLATFORM-V3` fingerprint must be present in:
1.  **Docs**: `docs/aitdl_signature.md`
2.  **JSON**: `core/aitdl_identity.json`
3.  **Logs**: Application startup logs in production.

---

## 🖼️ Chapter 10: Component Gallery

### Visual Building Blocks
- **`ShellSidebar`**: A unified navigation component that handles role-based visibility and session-aware sign-out.
- **`CanvasBackground`**: An interactive particle field that adapts its HSL color scheme based on the active audience theme (e.g., Orange for Retail, Blue for ERP).
- **`CustomCursor`**: A high-fidelity cursor implementation that uses the `framer-motion` library for lag-free tracking and hover-scaling.

### The Reveal System
We use a standardized animation pattern to make the portal feel "alive":
- **`RevealOnScroll`**: A component wrapper that uses Intersection Observer to fade elements in with a subtle Y-axis offset.
- **`RevealOnHover`**: CSS classes (`hover:scale-[1.02] transition-all duration-500`) used for glass cards.

### Role Picker Logic
The platform manages 9 distinct audience segments. The logic resides in `src/components/visual/RolePicker.tsx`, which triggers state changes across the layout provider, updating CSS variables for `--primary-theme-color` globally.

---

## 💻 Chapter 11: Content Studio (CMS) Internals

### Dynamic Page Mapping
Static "shell" pages aren't enough. We use a catch-all route to serve content from the database:
- **Path**: `src/app/(portal)/pages/[slug]/page.tsx`
- **Logic**: The `slug` is used to query the `pages` table in Supabase. If found, the JSON content is rendered using our cinematic typography system.

### Media Handling & "No Placeholders"
- **Storage**: All assets must be served via Supabase Storage Buckets with CDN caching.
- **Golden Rule**: **NEVER use placeholder images.** If an asset is missing, use the `generate_image` tool to create a premium-grade visual that matches the dark, cinematic theme.

### Blog Serialization
Markdown content in the `blog_posts` table is parsed via `react-markdown` and styled with a custom Tailwind `prose` configuration that maintains gold-and-white accents on black backgrounds.

---

## 🩹 Chapter 12: The Troubleshooting Matrix

### "Gotchas" & Master Fixes
- **Dynamic Server Error**: 
  - *Symptom*: Build fails with "Route used cookies/headers".
  - *Fix*: Refactor the layout to a Server Component and add `export const dynamic = 'force-dynamic'`.
- **Layout Overlap**:
  - *Symptom*: Global header covers the Sidebar.
  - *Fix*: Move all public pages into the `(portal)` route group, leaving `admin` and `cms` top-level.
- **Supabase Init Failure**:
  - *Symptom*: `Your project's URL and API key are required`.
  - *Fix*: Check Vercel **Project Settings > Environment Variables**. Redeploy is required after adding variables.
- **Supabase REST 404 (Not Found)**:
  - *Symptom*: `GET .../rest/v1/pages?select=*... 404 (Not Found)`.
  - *Fix*: The table does not exist in the database. Run the initialization script found in `docs/SUPABASE_SCHEMA.sql` via the Supabase SQL Editor.

### Environment Hygiene
1.  **Local**: `.env.local` for development.
2.  **Vercel**: Dashboard variables (Production/Preview).
3.  **Secrets**: Never commit `SUPABASE_SERVICE_ROLE_KEY` to Git.

---

## ⌨️ Chapter 13: Local Development Workflow

### Master Command Table
| Command | Action |
|---|---|
| `npm run dev` | Spins up Next.js on port 3000 |
| `npm run build` | Validates types and prerendering |
| `npm test` | (Planned) Runs Vitest suite |
| `npm run lint` | Ensures code follows AITDL standards |

### Git & Branching
- **Branching**: `main` is production-only. Feature branches should follow `feat/migration-phase-X`.
- **Commits**: Messages MUST mention the Task ID from `task.md` (e.g., `git commit -m "Fix(layout): Resolve overlap [id: 28]"`).

---

## 📜 Chapter 14: Development History (Walkthrough)

### Phase: Admin & CMS Migration (March 2026)
Successfully transitioned legacy administrative systems to the V3 Portal infrastructure.

**Milestones achieved:**
1.  **Secure Shell**: Implemented `/admin` login and `ShellSidebar` at `/cms` and `/admin`.
2.  **Dashboard Hub**: Developed statistical overviews with `Chart.js` integration.
3.  **CMS Studio**: Migrated list views for Blog, Pages, and Media.
4.  **Structural Fix**: Resolved critical layout overlapping by introducing the `(portal)` route group.
5.  **Build Stabilization**: Refactored layouts to Server Components to correctly handle `force-dynamic` rendering.

---

## 🔗 Chapter 15: The API & Service Mesh

### Next.js ↔ FastAPI Proxy
The platform operates as a hybrid monolith. Complex Python logic is decoupled but served through a unified API path:
- **Path**: `src/app/api/py/[...path]/route.ts`
- **Mechanism**: All calls to `/api/py/*` are proxied to the FastAPI instance on Railway/Localhost using `node-fetch`.

### Schema Synchronization
Maintain parity between frontend and backend via shared models:
- **Frontend**: TypeScript Interfaces in `src/types/api.ts`.
- **Backend**: Pydantic Models in `backend/models/*.py`.

---

## 🛡️ Chapter 16: Security & Data Governance

### Row Level Security (RLS)
The database is secured at the hardware level. Example RLS policy for Partner leads:
```sql
CREATE POLICY "Partners see own leads" ON leads 
FOR SELECT USING (workspace_id = auth.jwt() ->> 'workspace_id');
```

### Audit Logging
The `History Chain` tracks every modification in the CMS. Every `UPDATE` in the `pages` or `blog_posts` table triggers a function that logs the `user_id`, `timestamp`, and `diff` to the `audit_logs` table.

---

## 🤖 Chapter 17: AI Studio Engineering

### Tool Integration Recipes
Adding a new AI tool follows a 3-step ritual:
1. **Engine**: Define the logic in `backend/ai/tools/`.
2. **Streaming**: Implement a Server-Sent Events (SSE) endpoint for real-time token streaming.
3. **Shell**: Create a glassmorphic interface in `src/app/cms/ai/tools/`.

### Model Agnosticism
All AI calls pass through a centralized `AITDL-Engine` which allows swapping between OpenAI, Anthropic, or DeepSeek models without modifying the UI components.

---

## 💎 Chapter 18: Advanced UI Tokens & Motion

### The HSL System
Colors are not hardcoded. We use CSS variables derived from HSL to allow for dynamic "Glass" transparency:
```css
--theme-primary: 201 50% 45%; 
--theme-glass: hsla(var(--theme-primary), 0.15);
```

### Framer Motion Standards
Use the `RevealVariant` for consistent entry animations:
```js
const RevealVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "circOut" } }
}
```

---

## ⚡ Chapter 19: Performance & Edge Orchestration

### Incremental Static Regeneration (ISR)
Public pages (Retail, ERP, Blog) use ISR to bridge the gap between static speed and live updates:
```tsx
export const revalidate = 60; // Refresh data every minute
```

### Edge Orchestration
Middleware logic for geolocation-based partner routing is handled at the **Vercel Edge**, specifically for low-latency dispatching within India (Mumbai, Delhi, Bangalore nodes).

---

## 🧪 Chapter 20: Testing the Universe

### Visual Regression
Use **Playwright** screenshots to verify that CSS changes don't break the glassmorphic blur effects or overlapping components across different viewport tiers (Mobile to Ultrawide).

### Auth Flow Mocking
Local tests use a `docker-compose` instance of Supabase to verify authentication redirects and RLS policies without consuming production tokens or data quotas.

---
*Last Refined: 11 March MMXXVI*
*Vikram Samvat 2083*
