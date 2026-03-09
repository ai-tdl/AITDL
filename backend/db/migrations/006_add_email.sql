-- || ॐ श्री गणेशाय नमः ||
-- Add email column to contacts and partner_applications
-- Vikram Samvat 2082

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';
ALTER TABLE partner_applications ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';
