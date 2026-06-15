-- Create home_config table for custom homepage editor
CREATE TABLE IF NOT EXISTS public.home_config (
  id TEXT PRIMARY KEY,
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.home_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access to home_config
CREATE POLICY "Allow public read access to home_config" ON public.home_config
  FOR SELECT USING (true);

-- Allow authenticated users (admins) full access to home_config
CREATE POLICY "Allow admins full access to home_config" ON public.home_config
  FOR ALL TO authenticated USING (true);
