-- ============================================================
-- SQL MIGRATION: COURSE PACKAGES & BUNDLES
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  thumbnail_url TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create package_courses join table
CREATE TABLE IF NOT EXISTS package_courses (
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (package_id, course_id)
);

-- 3. Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_courses ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for packages
DROP POLICY IF EXISTS "Allow public read access to published packages" ON packages;
CREATE POLICY "Allow public read access to published packages" ON packages
  FOR SELECT USING (status = 'published' OR status = 'archived');

DROP POLICY IF EXISTS "Allow admins full access to packages" ON packages;
CREATE POLICY "Allow admins full access to packages" ON packages
  FOR ALL TO authenticated USING (true);

-- 5. Create RLS Policies for package_courses
DROP POLICY IF EXISTS "Allow public read access to package courses" ON package_courses;
CREATE POLICY "Allow public read access to package courses" ON package_courses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins full access to package courses" ON package_courses;
CREATE POLICY "Allow admins full access to package courses" ON package_courses
  FOR ALL TO authenticated USING (true);
