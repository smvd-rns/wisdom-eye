-- Add course material columns to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS has_material BOOLEAN DEFAULT FALSE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS materials JSONB DEFAULT '[]'::jsonb;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS shipping_charges NUMERIC DEFAULT 0;

-- Add shipping tracking columns to lms_payments table
ALTER TABLE lms_payments ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'none';
ALTER TABLE lms_payments ADD COLUMN IF NOT EXISTS shipping_name TEXT;
ALTER TABLE lms_payments ADD COLUMN IF NOT EXISTS shipping_phone TEXT;
ALTER TABLE lms_payments ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE lms_payments ADD COLUMN IF NOT EXISTS shipping_city TEXT;
ALTER TABLE lms_payments ADD COLUMN IF NOT EXISTS shipping_state TEXT;
ALTER TABLE lms_payments ADD COLUMN IF NOT EXISTS shipping_pincode TEXT;
ALTER TABLE lms_payments ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE lms_payments ADD COLUMN IF NOT EXISTS shipping_status TEXT DEFAULT 'not_applicable';
ALTER TABLE lms_payments ADD COLUMN IF NOT EXISTS tracking_id TEXT;
