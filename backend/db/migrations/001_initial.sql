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

CREATE TABLE IF NOT EXISTS contacts (
    id          SERIAL PRIMARY KEY,
    name        TEXT        NOT NULL,
    phone       TEXT        NOT NULL,
    section     TEXT        NOT NULL DEFAULT '',
    business    TEXT        NOT NULL DEFAULT '',
    city        TEXT        NOT NULL DEFAULT '',
    message     TEXT        NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_applications (
    id          SERIAL PRIMARY KEY,
    name        TEXT        NOT NULL,
    phone       TEXT        NOT NULL,
    city        TEXT        NOT NULL,
    occupation  TEXT        NOT NULL DEFAULT '',
    message     TEXT        NOT NULL DEFAULT '',
    status      TEXT        NOT NULL DEFAULT 'new',   -- new | contacted | onboarded | rejected
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_contacts_section    ON contacts (section);
CREATE INDEX IF NOT EXISTS idx_contacts_created    ON contacts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partner_city        ON partner_applications (city);
CREATE INDEX IF NOT EXISTS idx_partner_status      ON partner_applications (status);
CREATE INDEX IF NOT EXISTS idx_partner_created     ON partner_applications (created_at DESC);
