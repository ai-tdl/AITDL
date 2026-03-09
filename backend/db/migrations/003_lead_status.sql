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

-- 003_lead_status.sql
-- Adds status tracking columns to contacts table for admin follow-up workflow.

ALTER TABLE contacts
    ADD COLUMN IF NOT EXISTS status       VARCHAR(30)  NOT NULL DEFAULT 'new',
    ADD COLUMN IF NOT EXISTS admin_notes  TEXT         NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ;

-- status values: new | contacted | follow_up | closed

CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts (status);
CREATE INDEX IF NOT EXISTS idx_contacts_section ON contacts (section);
