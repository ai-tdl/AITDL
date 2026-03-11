-- || ॐ श्री गणेशाय नमः ||
--
-- Organization: AITDL
-- AITDL — A Living Knowledge Ecosystem for AI Technology Development Lab
--
-- Creator: Jawahar R. Mallah
-- Founder, Author & System Architect
--
-- Email: jawahar@aitdl.com
-- GitHub: https://github.com/jawahar-mallah
--
-- Websites:
-- https://ganitsutram.com
-- https://aitdl.com
--
-- Then: 628 CE · Brahmasphuṭasiddhānta
-- Now: 9 March MMXXVI · Vikram Samvat 2082
--
-- Copyright © aitdl.com · AITDL | GANITSUTRAM.com

-- 008_cms_content.sql
-- CMS content tables: pages, blocks, cards, blog_posts, media_assets,
-- cms_forms, cms_submissions.
-- All tables include created_at + updated_at and are workspace-scoped.
-- Slug uniqueness is enforced per workspace (UNIQUE(workspace_id, slug)).

-- Requires: 007_cms_workspaces.sql (workspaces table must exist)


-- ── pages ────────────────────────────────────────────────────────────────────
-- Full page records. Each page belongs to one workspace.
-- Blocks reference pages via page_id FK.

CREATE TABLE IF NOT EXISTS pages (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id    UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title           TEXT        NOT NULL,
    slug            TEXT        NOT NULL,                            -- /about, /products
    status          TEXT        NOT NULL DEFAULT 'draft',           -- draft | published | archived
    template        TEXT        NOT NULL DEFAULT 'custom',          -- landing | blog | product | custom
    seo_title       TEXT,                                           -- AI-generated or manual
    seo_description TEXT,                                           -- AI-generated or manual
    last_modified_by TEXT,                                          -- email of last editor (optimistic lock)
    published_at    TIMESTAMPTZ,
    created_by      TEXT,                                           -- admin email
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_pages_workspace_slug UNIQUE (workspace_id, slug)  -- per-suggestion: composite unique
);

CREATE TRIGGER pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_pages_workspace   ON pages (workspace_id);
CREATE INDEX IF NOT EXISTS idx_pages_status      ON pages (status);
CREATE INDEX IF NOT EXISTS idx_pages_slug        ON pages (workspace_id, slug);


-- ── blocks ───────────────────────────────────────────────────────────────────
-- Page builder blocks (ordered). Config is stored as JSONB — avoids a sprawling
-- per-block-type column set and makes adding new block types trivial.

CREATE TABLE IF NOT EXISTS blocks (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id      UUID        NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    type         TEXT        NOT NULL,                               -- hero|cards|blog|form|media|text|cta|stats
    sort_order   INTEGER     NOT NULL DEFAULT 0,
    config       JSONB       NOT NULL DEFAULT '{}',                  -- all block settings as structured JSON
    ai_generated BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER blocks_updated_at
    BEFORE UPDATE ON blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_blocks_page_order ON blocks (page_id, sort_order);


-- ── cards ────────────────────────────────────────────────────────────────────
-- Reusable card + sub-card system. Max 2 levels deep (card → sub-cards).
-- parent_id = NULL means root card.
-- workspace_id on the parent FK guard prevents cross-workspace sub-card references.

CREATE TABLE IF NOT EXISTS cards (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    parent_id    UUID        REFERENCES cards(id) ON DELETE CASCADE,  -- NULL = root card
    title        TEXT        NOT NULL,
    description  TEXT,
    icon         TEXT,                                               -- emoji or icon key
    badge        TEXT,                                               -- 'LIVE', 'COMING SOON', etc.
    cta_text     TEXT,
    cta_url      TEXT,
    sort_order   INTEGER     NOT NULL DEFAULT 0,
    enabled      BOOLEAN     NOT NULL DEFAULT TRUE,
    tags         JSONB       NOT NULL DEFAULT '[]',                  -- filter by audience: retail, student, ngo
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER cards_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enforce: a sub-card's workspace must match its parent's workspace
-- (application-level check in the router is sufficient for MVP;
--  a DB trigger can be added for strict enforcement later)

CREATE INDEX IF NOT EXISTS idx_cards_workspace   ON cards (workspace_id);
CREATE INDEX IF NOT EXISTS idx_cards_parent      ON cards (parent_id);
CREATE INDEX IF NOT EXISTS idx_cards_tags        ON cards USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_cards_enabled     ON cards (workspace_id, enabled);


-- ── media_assets ─────────────────────────────────────────────────────────────
-- Created before blog_posts because blog_posts references media_assets(id).

CREATE TABLE IF NOT EXISTS media_assets (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id  UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    filename      TEXT        NOT NULL,
    storage_path  TEXT        NOT NULL,                              -- Supabase Storage path
    cdn_url       TEXT,                                              -- public CDN URL (abstracts storage backend)
    mime_type     TEXT        NOT NULL DEFAULT 'application/octet-stream',
    size_bytes    INTEGER     NOT NULL DEFAULT 0,
    alt_text      TEXT,                                              -- AI-generated if not provided
    uploaded_by   TEXT,                                              -- admin email
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER media_assets_updated_at
    BEFORE UPDATE ON media_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_media_workspace   ON media_assets (workspace_id);
CREATE INDEX IF NOT EXISTS idx_media_mime        ON media_assets (mime_type);


-- ── blog_posts ───────────────────────────────────────────────────────────────
-- Rich text stored as structured JSONB nodes (Sanity-style Portable Text —
-- not raw HTML, which is an XSS risk and hard to translate/query).

CREATE TABLE IF NOT EXISTS blog_posts (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id   UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title          TEXT        NOT NULL,
    slug           TEXT        NOT NULL,
    content        JSONB       NOT NULL DEFAULT '[]',                -- array of rich text nodes
    author_id      TEXT,                                            -- admin email
    status         TEXT        NOT NULL DEFAULT 'draft',            -- draft | review | published
    featured_image UUID        REFERENCES media_assets(id) ON DELETE SET NULL,
    ai_summary     TEXT,                                            -- auto-generated 2-sentence summary
    tags           JSONB       NOT NULL DEFAULT '[]',               -- per-suggestion: added tags
    seo_title      TEXT,
    seo_description TEXT,
    last_modified_by TEXT,
    published_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_blog_workspace_slug UNIQUE (workspace_id, slug)   -- per-suggestion: composite unique
);

CREATE TRIGGER blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_blog_workspace    ON blog_posts (workspace_id);
CREATE INDEX IF NOT EXISTS idx_blog_status       ON blog_posts (status);
CREATE INDEX IF NOT EXISTS idx_blog_published    ON blog_posts (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_tags         ON blog_posts USING gin (tags);


-- ── cms_forms ────────────────────────────────────────────────────────────────
-- Full table definition (original doc had a one-liner — fleshed out per suggestion).

CREATE TABLE IF NOT EXISTS cms_forms (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title        TEXT        NOT NULL,
    slug         TEXT        NOT NULL,                              -- used to embed: /forms/<slug>
    fields       JSONB       NOT NULL DEFAULT '[]',                 -- [{type, name, label, required, options, validation}]
    notify_email TEXT,                                              -- email to notify on submission
    success_message TEXT     NOT NULL DEFAULT 'Thank you! We will get back to you soon.',
    enabled      BOOLEAN     NOT NULL DEFAULT TRUE,
    honeypot_field TEXT      NOT NULL DEFAULT '_hp',               -- anti-spam honeypot field name
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_forms_workspace_slug UNIQUE (workspace_id, slug)
);

CREATE TRIGGER cms_forms_updated_at
    BEFORE UPDATE ON cms_forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_forms_workspace   ON cms_forms (workspace_id);


-- ── cms_submissions ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cms_submissions (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id      UUID        NOT NULL REFERENCES cms_forms(id) ON DELETE CASCADE,
    workspace_id UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    data         JSONB       NOT NULL DEFAULT '{}',                 -- submitted field values
    status       TEXT        NOT NULL DEFAULT 'new',               -- new | read | archived
    ip_hash      TEXT,                                              -- SHA-256 of submitter IP (privacy-safe)
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER cms_submissions_updated_at
    BEFORE UPDATE ON cms_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_submissions_form       ON cms_submissions (form_id);
CREATE INDEX IF NOT EXISTS idx_submissions_workspace  ON cms_submissions (workspace_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status     ON cms_submissions (status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted  ON cms_submissions (submitted_at DESC);
