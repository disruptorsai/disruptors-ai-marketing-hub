-- Migration: Create Leads and Settings Tables
-- Date: 2025-10-26
-- Purpose: Enable DataManager and system-wide configuration

-- ====================
-- 1. LEADS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Contact Information
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  website TEXT,

  -- Lead Details
  source TEXT,
  source_page TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,

  -- Lead Management
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'nurturing', 'converted', 'lost', 'unqualified')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  interest_level TEXT DEFAULT 'medium' CHECK (interest_level IN ('low', 'medium', 'high')),

  -- Assignment & Tracking
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_contact_date TIMESTAMPTZ,
  next_follow_up_date TIMESTAMPTZ,
  contacted BOOLEAN DEFAULT FALSE,

  -- Additional Data
  notes TEXT,
  tags JSONB DEFAULT '[]'::JSONB,
  custom_fields JSONB DEFAULT '{}'::JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_tags ON public.leads USING GIN (tags);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- ====================
-- 2. SETTINGS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Setting Identification
  key TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'general',

  -- Setting Values (support multiple types)
  value_text TEXT,
  value_number NUMERIC,
  value_boolean BOOLEAN,
  value_json JSONB,

  -- Setting Metadata
  data_type TEXT NOT NULL DEFAULT 'text' CHECK (data_type IN ('text', 'number', 'boolean', 'json', 'array')),
  label TEXT NOT NULL,
  description TEXT,

  -- Validation & Constraints
  is_required BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  validation_rules JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON public.settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_is_public ON public.settings(is_public);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- ====================
-- ROW LEVEL SECURITY
-- ====================

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Leads: Admin full access
CREATE POLICY "Admins have full access to leads"
  ON public.leads
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Leads: Assigned users can read their leads
CREATE POLICY "Users can view their assigned leads"
  ON public.leads
  FOR SELECT
  USING (assigned_to = auth.uid());

-- Settings: Admin full access
CREATE POLICY "Admins have full access to settings"
  ON public.settings
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Settings: Public can read public settings
CREATE POLICY "Public can view public settings"
  ON public.settings
  FOR SELECT
  USING (is_public = true);

-- ====================
-- DEFAULT SETTINGS
-- ====================

-- Insert default system settings
INSERT INTO public.settings (key, category, value_text, data_type, label, description, is_public) VALUES
  ('site_name', 'general', 'Disruptors AI', 'text', 'Site Name', 'The name of the website', true),
  ('site_tagline', 'general', 'AI-Powered Marketing Solutions', 'text', 'Site Tagline', 'The tagline of the website', true),
  ('contact_email', 'general', 'contact@disruptorsmedia.com', 'text', 'Contact Email', 'Primary contact email', false),
  ('enable_maintenance_mode', 'general', null, 'boolean', 'Maintenance Mode', 'Enable/disable maintenance mode', false),
  ('max_upload_size_mb', 'general', null, 'number', 'Max Upload Size (MB)', 'Maximum file upload size in megabytes', false),
  ('items_per_page', 'general', null, 'number', 'Items Per Page', 'Default pagination size', false)
ON CONFLICT (key) DO NOTHING;

-- Set initial values for numeric/boolean defaults
UPDATE public.settings SET value_boolean = false WHERE key = 'enable_maintenance_mode' AND value_boolean IS NULL;
UPDATE public.settings SET value_number = 10 WHERE key = 'max_upload_size_mb' AND value_number IS NULL;
UPDATE public.settings SET value_number = 20 WHERE key = 'items_per_page' AND value_number IS NULL;

-- ====================
-- COMMENTS
-- ====================

COMMENT ON TABLE public.leads IS 'Lead management and tracking system';
COMMENT ON TABLE public.settings IS 'System-wide configuration settings';
COMMENT ON COLUMN public.leads.score IS 'Lead quality score from 0-100';
COMMENT ON COLUMN public.leads.tags IS 'Array of tags for categorization';
COMMENT ON COLUMN public.leads.custom_fields IS 'Flexible JSONB for additional lead data';
COMMENT ON COLUMN public.settings.key IS 'Unique setting identifier';
COMMENT ON COLUMN public.settings.data_type IS 'Type of value stored (determines which value_* column to use)';
COMMENT ON COLUMN public.settings.validation_rules IS 'JSONB object with validation rules';

-- Migration complete
