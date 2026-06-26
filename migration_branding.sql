-- Migration to add branding fields to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS slogan TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS linkedin_url TEXT;


-- Table to store tenant-specific custom course categories
CREATE TABLE IF NOT EXISTS course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- Table to store uploaded images in a media library per tenant
CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, url)
);
