-- ============================================================
-- SQL MIGRATION: USER PROFILE EMAIL MULTI-TENANCY ISOLATION
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Drop the old global unique constraint on email
-- Note: Supabase usually names this constraint 'user_profiles_email_key'
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_email_key;

-- 2. Add unique constraint per organization and email
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_org_email_unique UNIQUE (organization_id, email);
