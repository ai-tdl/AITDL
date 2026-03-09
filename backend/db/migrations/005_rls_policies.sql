-- || ॐ श्री गणेशाय नमः ||
-- Phase 4c: PostgreSQL Row-Level Security policies for contacts and partners

-- Contacts table policies
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous insertions (for frontend form submission)
CREATE POLICY "Contacts are insertable anonymously"
ON contacts FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Only authenticated users (admins via Supabase) can view or modify records
CREATE POLICY "Admins can view contacts"
ON contacts FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can update contacts"
ON contacts FOR UPDATE TO authenticated
USING (true);

-- Partner applications table policies
ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous insertions (for frontend form submission)
CREATE POLICY "Partners are insertable anonymously"
ON partner_applications FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Only authenticated users (admins via Supabase) can view or modify records
CREATE POLICY "Admins can view partners"
ON partner_applications FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can update partners"
ON partner_applications FOR UPDATE TO authenticated
USING (true);
