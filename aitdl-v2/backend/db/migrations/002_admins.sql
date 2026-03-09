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
-- Now: 8 March MMXXVI · Vikram Samvat 2082
--
-- Copyright © aitdl.com · AITDL | GANITSUTRAM.com

-- 002_admins.sql
-- Creates the admins table for AITDL super admin access.
-- Roles: superadmin | admin

CREATE TABLE IF NOT EXISTS admins (
    id           SERIAL PRIMARY KEY,
    email        VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(200) NOT NULL,
    role         VARCHAR(30)  NOT NULL DEFAULT 'admin',
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_login   TIMESTAMPTZ
);

-- Index for fast email lookup during login
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins (email);
