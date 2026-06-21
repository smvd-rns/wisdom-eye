-- Migration to add organization_id to site_pages table for multi-tenancy
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

-- 1. Create site_pages table if it doesn't exist at all (fallback definition)
CREATE TABLE IF NOT EXISTS site_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  blocks JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- 2. Add organization_id column if it doesn't exist
ALTER TABLE site_pages 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- 3. Update existing records to link to the first organization if any exist
DO $$
DECLARE
  first_org_id UUID;
BEGIN
  SELECT id INTO first_org_id FROM organizations LIMIT 1;
  IF first_org_id IS NOT NULL THEN
    UPDATE site_pages SET organization_id = first_org_id WHERE organization_id IS NULL;
  END IF;
END $$;

-- 4. Drop the old unique constraint on slug if it exists (since slug should be unique per organization)
ALTER TABLE site_pages DROP CONSTRAINT IF EXISTS site_pages_slug_key;

-- 5. Add unique constraint for (organization_id, slug)
ALTER TABLE site_pages ADD CONSTRAINT site_pages_org_slug_unique UNIQUE (organization_id, slug);
