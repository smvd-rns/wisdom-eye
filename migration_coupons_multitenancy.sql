-- ============================================================
-- SQL MIGRATION: COUPONS MULTI-TENANCY ISOLATION
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add organization_id column to coupons table
ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- 2. Populate organization_id from the coupon creator's profile
DO $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Fetch default organization ID
  SELECT id INTO default_org_id FROM organizations WHERE slug = 'wisdom-eye' LIMIT 1;
  IF default_org_id IS NULL THEN
    SELECT id INTO default_org_id FROM organizations LIMIT 1;
  END IF;

  -- Update coupons using the creator's organization_id
  UPDATE coupons c
  SET organization_id = u.organization_id
  FROM user_profiles u
  WHERE c.created_by = u.user_id AND c.organization_id IS NULL;

  -- Fallback remaining to default organization
  UPDATE coupons 
  SET organization_id = default_org_id 
  WHERE organization_id IS NULL;
END $$;

-- 3. Drop the old global unique constraint on coupon code
ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_code_key;

-- 4. Add unique constraint per organization and coupon code
ALTER TABLE coupons ADD CONSTRAINT coupons_org_code_unique UNIQUE (organization_id, code);
