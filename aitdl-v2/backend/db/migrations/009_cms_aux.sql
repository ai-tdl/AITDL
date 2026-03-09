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

-- 009_cms_aux.sql
-- Auxiliary CMS tables: content versioning, audit log, AI prompt registry.
-- These support rollback, accountability, and AI prompt iteration.

-- Requires: 008_cms_content.sql


-- ── content_versions ─────────────────────────────────────────────────────────
-- Snapshot of a page or blog_post before a change.
-- Allows editors to roll back to a previous version.

CREATE TABLE IF NOT EXISTS content_versions (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id  UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    resource_type TEXT        NOT NULL,                              -- 'page' | 'blog_post'
    resource_id   UUID        NOT NULL,                             -- references pages.id or blog_posts.id
    version_num   INTEGER     NOT NULL DEFAULT 1,
    snapshot      JSONB       NOT NULL DEFAULT '{}',                -- full record snapshot at time of save
    saved_by      TEXT,                                             -- admin email
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_versions_resource   ON content_versions (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_versions_workspace  ON content_versions (workspace_id);
CREATE INDEX IF NOT EXISTS idx_versions_created    ON content_versions (created_at DESC);


-- ── cms_audit_log ─────────────────────────────────────────────────────────────
-- Immutable record of every mutating action in the CMS.
-- Supports client accountability in multi-tenant deployments.

CREATE TABLE IF NOT EXISTS cms_audit_log (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id  UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    actor_email   TEXT        NOT NULL,                             -- JWT sub (editor email)
    action        TEXT        NOT NULL,                             -- 'created' | 'updated' | 'deleted' | 'published'
    resource_type TEXT        NOT NULL,                             -- 'page' | 'block' | 'card' | 'blog_post' | 'media' | 'form'
    resource_id   TEXT        NOT NULL,                             -- UUID as text (allows non-UUID IDs too)
    diff          JSONB,                                            -- {before: {...}, after: {...}} for updates
    ip_hash       TEXT,                                             -- SHA-256 of request IP
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit log is append-only — no UPDATE or DELETE should be issued on this table.
CREATE INDEX IF NOT EXISTS idx_audit_workspace    ON cms_audit_log (workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor        ON cms_audit_log (actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_resource     ON cms_audit_log (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created      ON cms_audit_log (created_at DESC);


-- ── cms_prompts ───────────────────────────────────────────────────────────────
-- Versioned AI system prompts per task type.
-- Enables A/B testing prompts and rolling back to previous prompt versions
-- without a code deployment.

CREATE TABLE IF NOT EXISTS cms_prompts (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    task_type     TEXT        NOT NULL,                             -- 'generate' | 'improve' | 'translate' | 'seo' | 'alt_text'
    version       INTEGER     NOT NULL DEFAULT 1,
    is_active     BOOLEAN     NOT NULL DEFAULT TRUE,               -- only one active per task_type
    system_prompt TEXT        NOT NULL,                            -- full system prompt text
    notes         TEXT,                                            -- human-readable changelog note
    created_by    TEXT,                                            -- admin email
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_prompts_task_version UNIQUE (task_type, version)
);

CREATE INDEX IF NOT EXISTS idx_prompts_task_active ON cms_prompts (task_type, is_active);


-- Seed default prompts for all task types
INSERT INTO cms_prompts (task_type, version, is_active, system_prompt, notes)
VALUES
    ('generate', 1, TRUE,
     'You are the AITDL content assistant. Generate professional, India-first marketing copy in the requested language and tone. Your responses should reflect AITDL brand values: trustworthy, modern, accessible, and rooted in Indian culture. Return only the requested content without preamble.',
     'Initial default prompt — Phase 1'),
    ('improve', 1, TRUE,
     'You are an expert editor for AITDL. Improve the provided text as instructed (shorten / expand / more formal / more casual). Preserve the original meaning and AITDL brand voice. Return only the improved text without explanation.',
     'Initial default prompt — Phase 1'),
    ('translate', 1, TRUE,
     'You are a professional translator specializing in Indian languages for AITDL. Translate the provided content accurately and naturally into the target language. Preserve technical terms in English where appropriate for Indian business contexts.',
     'Initial default prompt — Phase 1'),
    ('seo', 1, TRUE,
     'You are an SEO specialist for AITDL. Generate an SEO-optimized title (max 60 chars) and meta description (max 155 chars) for the given page content. Target Indian search users. Return JSON: {"seo_title": "...", "meta_description": "...", "keywords": ["...", "..."]}',
     'Initial default prompt — Phase 1'),
    ('alt_text', 1, TRUE,
     'You are an accessibility specialist. Generate a concise, descriptive alt text for an image based on its filename and any context provided. Max 125 characters. Return only the alt text string.',
     'Initial default prompt — Phase 1')
ON CONFLICT (task_type, version) DO NOTHING;


-- ── RLS Policies (Supabase) ───────────────────────────────────────────────────
-- Enable Row Level Security on all CMS tables so that in Supabase direct access,
-- each workspace can only see its own data.
-- Application-level middleware enforces this too — RLS is a safety backstop.

ALTER TABLE workspaces        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards             ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_forms         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_submissions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_audit_log     ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_prompts       ENABLE ROW LEVEL SECURITY;

-- Service-role bypass: FastAPI backend connects via service key and bypasses RLS.
-- Client-side Supabase JS calls (if any) would be restricted by these policies.
-- Policy: users can only read/write rows where workspace_id matches their JWT claim.

-- Pages policy example (repeat for other workspace-scoped tables):
CREATE POLICY cms_workspace_isolation_pages ON pages
    USING (workspace_id::text = current_setting('request.jwt.claims', true)::json->>'workspace_id');

CREATE POLICY cms_workspace_isolation_blogs ON blog_posts
    USING (workspace_id::text = current_setting('request.jwt.claims', true)::json->>'workspace_id');

CREATE POLICY cms_workspace_isolation_cards ON cards
    USING (workspace_id::text = current_setting('request.jwt.claims', true)::json->>'workspace_id');
