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

-- 004_partner_status.sql
-- Adds status tracking to partner_applications for admin review workflow.

ALTER TABLE partner_applications
    ADD COLUMN IF NOT EXISTS status      VARCHAR(30) NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS admin_notes TEXT        NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- status values: pending | approved | rejected | on_hold

CREATE INDEX IF NOT EXISTS idx_partners_status ON partner_applications (status);
CREATE INDEX IF NOT EXISTS idx_partners_city   ON partner_applications (city);
