-- Lead Magnet Tracking System Migration
-- Created: 2025-01-17
-- Purpose: Track lead magnet signups and content access for attribution and follow-up

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- LEAD CAPTURES TABLE
-- ============================================================================
-- Tracks initial signup when user clicks through from social posts
--
CREATE TABLE IF NOT EXISTS public.lead_captures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  lead_magnet_slug TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  signup_method TEXT, -- 'one_tap' | 'oauth_button' | 'email_password'
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accessed BOOLEAN DEFAULT FALSE,
  accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_lead_captures_email ON public.lead_captures(email);
CREATE INDEX IF NOT EXISTS idx_lead_captures_slug ON public.lead_captures(lead_magnet_slug);
CREATE INDEX IF NOT EXISTS idx_lead_captures_captured_at ON public.lead_captures(captured_at);
CREATE INDEX IF NOT EXISTS idx_lead_captures_utm_source ON public.lead_captures(utm_source);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_lead_captures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lead_captures_updated_at
  BEFORE UPDATE ON public.lead_captures
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_captures_updated_at();

-- ============================================================================
-- LEAD ACCESSES TABLE
-- ============================================================================
-- Tracks when users actually access/download the lead magnet content
--
CREATE TABLE IF NOT EXISTS public.lead_accesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_magnet_slug TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_lead_accesses_email ON public.lead_accesses(email);
CREATE INDEX IF NOT EXISTS idx_lead_accesses_user_id ON public.lead_accesses(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_accesses_slug ON public.lead_accesses(lead_magnet_slug);
CREATE INDEX IF NOT EXISTS idx_lead_accesses_accessed_at ON public.lead_accesses(accessed_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.lead_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_accesses ENABLE ROW LEVEL SECURITY;

-- Lead Captures Policies
-- Service role can do everything (for Netlify functions)
CREATE POLICY "Service role full access to lead_captures"
  ON public.lead_captures
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can view their own captures
CREATE POLICY "Users can view own lead_captures"
  ON public.lead_captures
  FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Lead Accesses Policies
-- Service role can do everything (for Netlify functions)
CREATE POLICY "Service role full access to lead_accesses"
  ON public.lead_accesses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can view their own accesses
CREATE POLICY "Users can view own lead_accesses"
  ON public.lead_accesses
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

-- View: Lead Magnet Performance Summary
CREATE OR REPLACE VIEW public.lead_magnet_stats AS
SELECT
  lead_magnet_slug,
  COUNT(DISTINCT email) as total_signups,
  COUNT(DISTINCT CASE WHEN accessed = true THEN email END) as total_accessed,
  ROUND(
    COUNT(DISTINCT CASE WHEN accessed = true THEN email END)::NUMERIC /
    NULLIF(COUNT(DISTINCT email), 0) * 100,
    2
  ) as access_rate_percent,
  COUNT(DISTINCT utm_source) as unique_sources,
  COUNT(DISTINCT utm_campaign) as unique_campaigns,
  MIN(captured_at) as first_signup,
  MAX(captured_at) as last_signup
FROM public.lead_captures
GROUP BY lead_magnet_slug;

-- View: Recent Lead Magnet Activity
CREATE OR REPLACE VIEW public.recent_lead_activity AS
SELECT
  lc.email,
  lc.lead_magnet_slug,
  lc.utm_source,
  lc.utm_campaign,
  lc.signup_method,
  lc.captured_at,
  lc.accessed,
  lc.accessed_at,
  CASE
    WHEN lc.accessed THEN 'completed'
    WHEN NOW() - lc.captured_at > INTERVAL '24 hours' THEN 'abandoned'
    ELSE 'pending'
  END as status
FROM public.lead_captures lc
ORDER BY lc.captured_at DESC
LIMIT 100;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Get lead magnet conversion funnel
CREATE OR REPLACE FUNCTION public.get_lead_funnel(
  p_lead_magnet_slug TEXT,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  step TEXT,
  count BIGINT,
  percentage NUMERIC
) AS $$
DECLARE
  total_signups BIGINT;
BEGIN
  -- Get total signups for this lead magnet
  SELECT COUNT(DISTINCT email)
  INTO total_signups
  FROM public.lead_captures
  WHERE lead_magnet_slug = p_lead_magnet_slug
    AND captured_at >= NOW() - (p_days_back || ' days')::INTERVAL;

  -- Return funnel data
  RETURN QUERY
  SELECT
    'Signed Up'::TEXT as step,
    total_signups as count,
    100.0 as percentage
  UNION ALL
  SELECT
    'Accessed Content'::TEXT as step,
    COUNT(DISTINCT email) as count,
    ROUND(COUNT(DISTINCT email)::NUMERIC / NULLIF(total_signups, 0) * 100, 2) as percentage
  FROM public.lead_captures
  WHERE lead_magnet_slug = p_lead_magnet_slug
    AND accessed = true
    AND captured_at >= NOW() - (p_days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant access to authenticated users for views
GRANT SELECT ON public.lead_magnet_stats TO authenticated;
GRANT SELECT ON public.recent_lead_activity TO authenticated;

-- Grant execute on functions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_lead_funnel TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.lead_captures IS 'Tracks lead magnet signups from social media posts';
COMMENT ON TABLE public.lead_accesses IS 'Tracks when users actually access/download lead magnet content';
COMMENT ON VIEW public.lead_magnet_stats IS 'Performance summary for each lead magnet';
COMMENT ON VIEW public.recent_lead_activity IS 'Most recent 100 lead magnet interactions';
COMMENT ON FUNCTION public.get_lead_funnel IS 'Get conversion funnel for a specific lead magnet';
