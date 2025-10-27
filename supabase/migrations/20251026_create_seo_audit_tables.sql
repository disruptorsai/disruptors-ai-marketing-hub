-- Migration: Create SEO Audit Tool Tables
-- Date: 2025-10-26
-- Purpose: Enable SEO Audit Tool module functionality

-- ====================
-- 1. SEO AUDITS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS public.seo_audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Basic Info
  domain TEXT NOT NULL,
  requester_email TEXT,
  source TEXT NOT NULL DEFAULT 'internal' CHECK (source IN ('public', 'internal')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  -- Scores & Metrics
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  ranked_keywords_count INTEGER DEFAULT 0,
  average_position NUMERIC(5,2),
  organic_traffic_estimate INTEGER DEFAULT 0,
  critical_issues_count INTEGER DEFAULT 0,

  -- Report Data
  report_markdown TEXT,
  report_html TEXT,

  -- Metadata
  processing_time_ms INTEGER,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_audits_domain ON public.seo_audits(domain);
CREATE INDEX IF NOT EXISTS idx_seo_audits_status ON public.seo_audits(status);
CREATE INDEX IF NOT EXISTS idx_seo_audits_source ON public.seo_audits(source);
CREATE INDEX IF NOT EXISTS idx_seo_audits_created_at ON public.seo_audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_audits_requester_email ON public.seo_audits(requester_email);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_seo_audits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seo_audits_updated_at
  BEFORE UPDATE ON public.seo_audits
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_audits_updated_at();

-- ====================
-- 2. SEO LEADS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS public.seo_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Lead Info
  name TEXT,
  email TEXT NOT NULL,
  domain TEXT NOT NULL,

  -- Audit Reference
  audit_id UUID REFERENCES public.seo_audits(id) ON DELETE SET NULL,

  -- SEO Details
  seo_score INTEGER CHECK (seo_score >= 0 AND seo_score <= 100),
  critical_issues_count INTEGER DEFAULT 0,
  interest_level TEXT DEFAULT 'medium' CHECK (interest_level IN ('low', 'medium', 'high')),

  -- Lead Management
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  contacted BOOLEAN DEFAULT FALSE,
  contacted_at TIMESTAMPTZ,

  -- Notes & Tracking
  notes TEXT,
  source_page TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_leads_email ON public.seo_leads(email);
CREATE INDEX IF NOT EXISTS idx_seo_leads_domain ON public.seo_leads(domain);
CREATE INDEX IF NOT EXISTS idx_seo_leads_status ON public.seo_leads(status);
CREATE INDEX IF NOT EXISTS idx_seo_leads_interest_level ON public.seo_leads(interest_level);
CREATE INDEX IF NOT EXISTS idx_seo_leads_created_at ON public.seo_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_leads_audit_id ON public.seo_leads(audit_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_seo_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seo_leads_updated_at
  BEFORE UPDATE ON public.seo_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_leads_updated_at();

-- ====================
-- 3. SEO AUDIT SECTIONS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS public.seo_audit_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Audit Reference
  audit_id UUID NOT NULL REFERENCES public.seo_audits(id) ON DELETE CASCADE,

  -- Section Info
  section_title TEXT NOT NULL,
  section_description TEXT,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),

  -- Details
  findings JSONB DEFAULT '[]'::JSONB,
  recommendations TEXT[],

  -- Metadata
  order_index INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_audit_sections_audit_id ON public.seo_audit_sections(audit_id);
CREATE INDEX IF NOT EXISTS idx_seo_audit_sections_score ON public.seo_audit_sections(score);

-- ====================
-- 4. SEO AUDIT RECOMMENDATIONS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS public.seo_audit_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Audit Reference
  audit_id UUID NOT NULL REFERENCES public.seo_audits(id) ON DELETE CASCADE,

  -- Recommendation Info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  -- Implementation Details
  estimated_time TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'hard')),
  impact TEXT CHECK (impact IN ('low', 'medium', 'high')),

  -- Technical Details
  affected_urls TEXT[],
  code_examples TEXT,

  -- Status Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,

  -- Metadata
  order_index INTEGER DEFAULT 0,
  category TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_audit_recs_audit_id ON public.seo_audit_recommendations(audit_id);
CREATE INDEX IF NOT EXISTS idx_seo_audit_recs_priority ON public.seo_audit_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_seo_audit_recs_status ON public.seo_audit_recommendations(status);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_seo_audit_recs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seo_audit_recommendations_updated_at
  BEFORE UPDATE ON public.seo_audit_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_audit_recs_updated_at();

-- ====================
-- ROW LEVEL SECURITY
-- ====================

-- Enable RLS
ALTER TABLE public.seo_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_audit_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_audit_recommendations ENABLE ROW LEVEL SECURITY;

-- Admin full access policies
CREATE POLICY "Admins have full access to seo_audits"
  ON public.seo_audits
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full access to seo_leads"
  ON public.seo_leads
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full access to seo_audit_sections"
  ON public.seo_audit_sections
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full access to seo_audit_recommendations"
  ON public.seo_audit_recommendations
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Public can create audits (for public audit tool)
CREATE POLICY "Public can create seo_audits"
  ON public.seo_audits
  FOR INSERT
  WITH CHECK (source = 'public');

-- Public can create leads (from audit tool)
CREATE POLICY "Public can create seo_leads"
  ON public.seo_leads
  FOR INSERT
  WITH CHECK (true);

-- ====================
-- COMMENTS
-- ====================

COMMENT ON TABLE public.seo_audits IS 'SEO audit data with scores and reports';
COMMENT ON TABLE public.seo_leads IS 'Leads captured from public SEO audits';
COMMENT ON TABLE public.seo_audit_sections IS 'Individual section scores for each audit';
COMMENT ON TABLE public.seo_audit_recommendations IS 'Actionable recommendations from audits';

-- Migration complete
