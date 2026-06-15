-- Navigation links setup
CREATE TABLE site_navigation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,              -- e.g. "Home", "Events"
  url TEXT NOT NULL,                -- e.g. "/", "/events"
  order_index INTEGER DEFAULT 0,    -- navbar sorting order
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_navigation ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to navigation links" ON site_navigation
  FOR SELECT USING (true);

-- Allow admins full access
CREATE POLICY "Allow admins full access to navigation links" ON site_navigation
  FOR ALL TO authenticated USING (true);

-- Insert default navigation links
INSERT INTO site_navigation (label, url, order_index) VALUES
  ('Home', '/', 1),
  ('Courses', '/courses', 2),
  ('Books', '/books', 3),
  ('Media', '/media', 4),
  ('Daily Reading', '/daily-reading', 5),
  ('About', '/about', 6);
