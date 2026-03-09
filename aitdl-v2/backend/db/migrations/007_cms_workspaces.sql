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

-- 007_cms_workspaces.sql
-- Creates the CMS workspaces table.
-- One workspace per AITDL client/tenant — isolation enforced via RLS in migration 009.

CREATE TABLE IF NOT EXISTS workspaces (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name             TEXT        NOT NULL,                          -- 'AITDL', 'Sharma Retail', etc.
    slug             TEXT        NOT NULL UNIQUE,                   -- used in API routes and URLs
    plan             TEXT        NOT NULL DEFAULT 'internal',       -- 'internal' | 'starter' | 'pro' | 'business'
    ai_credits_used  INTEGER     NOT NULL DEFAULT 0,
    ai_credits_limit INTEGER     NOT NULL DEFAULT 1000,            -- Starter=500, Pro=2000, Business=-1 (unlimited)
    is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the internal AITDL workspace so Phase 1 works out of the box
INSERT INTO workspaces (id, name, slug, plan, ai_credits_limit)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'AITDL Internal',
    'aitdl',
    'internal',
    -1  -- -1 = unlimited credits for internal workspace
)
ON CONFLICT (slug) DO NOTHING;

-- Trigger to auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workspaces_updated_at
    BEFORE UPDATE ON workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_slug   ON workspaces (slug);
CREATE INDEX IF NOT EXISTS idx_workspaces_plan   ON workspaces (plan);
