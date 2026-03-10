# AITDL Portal — Next.js 15

Replaces `apps/portal/` (plain HTML) with a proper SSR + static hybrid portal.

## Structure

```
src/app/
├── page.tsx              ← SSR · Public homepage (The Gate)
├── ganitsutram/          ← SSR · Product page · SEO indexed
├── dailyboard/           ← SSR · Product page · SEO indexed
├── admin/                ← Client-only · No SSR · Auth required
│   ├── layout.tsx        ← Auth guard wrapper
│   └── page.tsx          ← Dashboard entry
└── api/[...proxy]/       ← Forwards to FastAPI on Railway
src/plugins/
└── registry.ts           ← Frontend plugin registry (mirrors backend loader)
```

## Decision: Server vs Client

| Route          | Type          | Reason                        |
|----------------|---------------|-------------------------------|
| `/`            | Server (SSR)  | SEO · homepage                |
| `/ganitsutram` | Server (SSR)  | SEO · product page            |
| `/dailyboard`  | Server (SSR)  | SEO · product page            |
| `/admin/*`     | Client only   | Auth required · not indexed   |

## Dev

```bash
npm install
npm run dev   # → http://localhost:3000
```

## Deploy

Already configured for Vercel — `vercel.json` + `next.config.ts` rewrites.

## Migration from apps/portal/

1. Phase 1 (done) — scaffold created, Gate concept ported to `page.tsx`
2. Phase 2 — migrate product sections from `portal/index.html` to individual pages
3. Phase 3 — connect forms to FastAPI backend via `/api/*` proxy
4. Phase 4 — wire Supabase auth into `/admin/` layout guard
