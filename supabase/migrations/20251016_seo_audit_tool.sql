-- SEO Audit Tool - Database Schema
-- Created: 2025-10-16
-- Purpose: Store SEO audit data for both internal and public tools

-- ============================================================================
-- SEO AUDITS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.seo_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  -- Source tracking
  source TEXT DEFAULT 'internal' CHECK (source IN ('internal', 'public', 'api')),
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requester_email TEXT,
  requester_name TEXT,

  -- Report data
  report_markdown TEXT,
  report_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Raw data storage
  website_data JSONB DEFAULT '{}'::jsonb,
  keyword_data JSONB DEFAULT '{}'::jsonb,
  competitor_data JSONB DEFAULT '{}'::jsonb,
  analysis_data JSONB DEFAULT '{}'::jsonb,

  -- Summary metrics (for quick display)
  overall_score INTEGER,
  ranked_keywords_count INTEGER DEFAULT 0,
  average_position DECIMAL(5,2),
  organic_traffic_estimate INTEGER DEFAULT 0,
  traffic_value_estimate DECIMAL(10,2),

  -- Issue counts
  critical_issues_count INTEGER DEFAULT 0,
  high_priority_issues_count INTEGER DEFAULT 0,
  medium_priority_issues_count INTEGER DEFAULT 0,
  low_priority_issues_count INTEGER DEFAULT 0,

  -- Error handling
  error_message TEXT,
  error_details JSONB,

  -- Indexes
  CONSTRAINT unique_domain_per_day UNIQUE (domain, DATE(created_at))
);

-- ============================================================================
-- SEO AUDIT SECTIONS TABLE (Detailed breakdown)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.seo_audit_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id UUID NOT NULL REFERENCES public.seo_audits(id) ON DELETE CASCADE,

  -- Section info
  section_name TEXT NOT NULL,
  section_title TEXT NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 10),

  -- Findings
  strengths JSONB DEFAULT '[]'::jsonb,
  issues JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (audit_id, section_name)
);

-- ============================================================================
-- SEO AUDIT RECOMMENDATIONS TABLE (Actionable items)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.seo_audit_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id UUID NOT NULL REFERENCES public.seo_audits(id) ON DELETE CASCADE,

  -- Recommendation details
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  impact TEXT CHECK (impact IN ('high', 'medium', 'low')),
  effort TEXT CHECK (effort IN ('high', 'medium', 'low')),

  -- Implementation
  implementation_steps TEXT,
  estimated_time TEXT,

  -- Categorization
  category TEXT, -- 'meta_tags', 'content', 'technical', 'authority', etc.

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SEO LEADS TABLE (Capture leads from public tool)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.seo_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id UUID REFERENCES public.seo_audits(id) ON DELETE SET NULL,

  -- Lead info
  email TEXT NOT NULL,
  name TEXT,
  domain TEXT NOT NULL,
  company_name TEXT,
  phone TEXT,

  -- Lead qualification
  seo_score INTEGER,
  critical_issues_count INTEGER,
  interest_level TEXT CHECK (interest_level IN ('high', 'medium', 'low')),

  -- Follow-up tracking
  contacted BOOLEAN DEFAULT FALSE,
  contacted_at TIMESTAMPTZ,
  contacted_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  notes TEXT,

  -- Marketing automation
  synced_to_ghl BOOLEAN DEFAULT FALSE,
  ghl_contact_id TEXT,
  email_sent BOOLEAN DEFAULT FALSE,
  email_opened BOOLEAN DEFAULT FALSE,
  report_downloaded BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_seo_audits_domain ON public.seo_audits(domain);
CREATE INDEX IF NOT EXISTS idx_seo_audits_status ON public.seo_audits(status);
CREATE INDEX IF NOT EXISTS idx_seo_audits_source ON public.seo_audits(source);
CREATE INDEX IF NOT EXISTS idx_seo_audits_created_at ON public.seo_audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_audits_overall_score ON public.seo_audits(overall_score);

CREATE INDEX IF NOT EXISTS idx_seo_audit_sections_audit_id ON public.seo_audit_sections(audit_id);
CREATE INDEX IF NOT EXISTS idx_seo_audit_recommendations_audit_id ON public.seo_audit_recommendations(audit_id);
CREATE INDEX IF NOT EXISTS idx_seo_audit_recommendations_priority ON public.seo_audit_recommendations(priority);

CREATE INDEX IF NOT EXISTS idx_seo_leads_email ON public.seo_leads(email);
CREATE INDEX IF NOT EXISTS idx_seo_leads_domain ON public.seo_leads(domain);
CREATE INDEX IF NOT EXISTS idx_seo_leads_status ON public.seo_leads(status);
CREATE INDEX IF NOT EXISTS idx_seo_leads_created_at ON public.seo_leads(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.seo_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_audit_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_audit_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_leads ENABLE ROW LEVEL SECURITY;

-- Policies for seo_audits
CREATE POLICY "Public can insert their own audits"
  ON public.seo_audits FOR INSERT
  WITH CHECK (source = 'public');

CREATE POLICY "Users can view their own audits"
  ON public.seo_audits FOR SELECT
  USING (
    requester_email = auth.jwt()->>'email'
    OR requested_by = auth.uid()
    OR auth.jwt()->>'role' = 'admin'
  );

CREATE POLICY "Admins can do anything with audits"
  ON public.seo_audits FOR ALL
  USING (auth.jwt()->>'role' = 'admin');

-- Policies for seo_audit_sections
CREATE POLICY "Users can view sections of their audits"
  ON public.seo_audit_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.seo_audits
      WHERE seo_audits.id = seo_audit_sections.audit_id
      AND (
        seo_audits.requester_email = auth.jwt()->>'email'
        OR seo_audits.requested_by = auth.uid()
        OR auth.jwt()->>'role' = 'admin'
      )
    )
  );

CREATE POLICY "Service role can manage sections"
  ON public.seo_audit_sections FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Policies for seo_audit_recommendations
CREATE POLICY "Users can view recommendations of their audits"
  ON public.seo_audit_recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.seo_audits
      WHERE seo_audits.id = seo_audit_recommendations.audit_id
      AND (
        seo_audits.requester_email = auth.jwt()->>'email'
        OR seo_audits.requested_by = auth.uid()
        OR auth.jwt()->>'role' = 'admin'
      )
    )
  );

CREATE POLICY "Service role can manage recommendations"
  ON public.seo_audit_recommendations FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Policies for seo_leads
CREATE POLICY "Admins can view all leads"
  ON public.seo_leads FOR SELECT
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can update leads"
  ON public.seo_leads FOR UPDATE
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Service role can manage leads"
  ON public.seo_leads FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_seo_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for seo_leads
CREATE TRIGGER trigger_update_seo_leads_updated_at
  BEFORE UPDATE ON public.seo_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_leads_updated_at();

-- Function to calculate overall score from sections
CREATE OR REPLACE FUNCTION calculate_seo_audit_overall_score(audit_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  avg_score DECIMAL;
BEGIN
  SELECT AVG(score)::INTEGER INTO avg_score
  FROM public.seo_audit_sections
  WHERE audit_id = audit_uuid;

  RETURN COALESCE(avg_score, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS (for easier querying)
-- ============================================================================

-- View for admin dashboard
CREATE OR REPLACE VIEW admin_seo_audit_summary AS
SELECT
  a.id,
  a.domain,
  a.status,
  a.source,
  a.overall_score,
  a.ranked_keywords_count,
  a.critical_issues_count,
  a.created_at,
  a.completed_at,
  l.email AS lead_email,
  l.name AS lead_name,
  l.status AS lead_status,
  l.contacted,
  COUNT(DISTINCT s.id) AS sections_count,
  COUNT(DISTINCT r.id) AS recommendations_count
FROM public.seo_audits a
LEFT JOIN public.seo_leads l ON l.audit_id = a.id
LEFT JOIN public.seo_audit_sections s ON s.audit_id = a.id
LEFT JOIN public.seo_audit_recommendations r ON r.audit_id = a.id
GROUP BY a.id, l.id;

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Insert sample audit (for development)
-- Uncomment to use:
/*
INSERT INTO public.seo_audits (
  domain,
  status,
  source,
  requester_email,
  overall_score,
  ranked_keywords_count,
  average_position,
  critical_issues_count,
  high_priority_issues_count
) VALUES (
  'example.com',
  'completed',
  'public',
  'test@example.com',
  42,
  4,
  66.5,
  5,
  8
);
*/

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.seo_audits IS 'Stores SEO audit reports for domains';
COMMENT ON TABLE public.seo_audit_sections IS 'Detailed breakdown of audit sections with scores';
COMMENT ON TABLE public.seo_audit_recommendations IS 'Actionable recommendations from audits';
COMMENT ON TABLE public.seo_leads IS 'Leads captured from public SEO audit tool';

COMMENT ON COLUMN public.seo_audits.source IS 'Where audit was requested: internal (admin), public (lead gen), or api';
COMMENT ON COLUMN public.seo_audits.overall_score IS 'Overall SEO health score 0-100';
COMMENT ON COLUMN public.seo_audits.website_data IS 'Raw scraped website data from Firecrawl';
COMMENT ON COLUMN public.seo_audits.keyword_data IS 'Keyword rankings from DataForSEO';
COMMENT ON COLUMN public.seo_audits.analysis_data IS 'AI-generated analysis from Claude';
