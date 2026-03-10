-- ॥ ॐ श्री गणेशाय नमः ॥
-- AITDL Platform V3 - Database Schema Initialization

-- 1. CMS Pages Table
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content JSONB DEFAULT '{}',
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Blog Posts Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    category TEXT,
    author_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'draft',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source TEXT, -- e.g., 'contact_form', 'retail', 'erp'
    message TEXT,
    workspace_id TEXT DEFAULT 'aitdl',
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Partner Applications Table
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    organization TEXT,
    city TEXT,
    whatsapp TEXT,
    background TEXT,
    network_size TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Audit Logs (Rule 13 Intelligence)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Allow authenticated admins to manage everything)
CREATE POLICY "Admins have full access to pages" ON public.pages FOR ALL TO authenticated USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'superadmin');
CREATE POLICY "Admins have full access to blog_posts" ON public.blog_posts FOR ALL TO authenticated USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'superadmin');
CREATE POLICY "Admins have full access to leads" ON public.leads FOR ALL TO authenticated USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'superadmin');
CREATE POLICY "Admins have full access to partners" ON public.partners FOR ALL TO authenticated USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'superadmin');

-- Public Access Policies (for lead capture)
CREATE POLICY "Public can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert partners" ON public.partners FOR INSERT WITH CHECK (true);
