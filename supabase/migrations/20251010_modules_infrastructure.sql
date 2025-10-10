-- Disruptors AI Modules System Infrastructure
-- Migration: 20251010_modules_infrastructure
-- Description: Creates tables for the AI-first modules system with three-level access (internal/client/public)
-- Author: Claude Code
-- Date: 2025-10-10

-- =====================================================
-- MODULES REGISTRY TABLE
-- =====================================================
-- Central registry of all modules (micro-tools) in the system
-- Each module can work across three levels: internal, client, public

CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  slug TEXT UNIQUE NOT NULL, -- 'keyword-research', 'ai-content-writer', etc.
  name TEXT NOT NULL, -- 'Keyword Research'
  description TEXT,
  category TEXT, -- 'content', 'seo', 'automation', 'analytics', 'media', 'social'

  -- Lifecycle
  status TEXT DEFAULT 'testing' CHECK (status IN ('testing', 'review', 'approved', 'deprecated')),
  version TEXT DEFAULT '1.0.0',

  -- Access Control (three-level system)
  audience JSONB DEFAULT '["internal"]'::jsonb, -- ['internal'], ['internal', 'client'], ['internal', 'client', 'public']
  requires_brain BOOLEAN DEFAULT TRUE, -- Most modules need Business Brain context
  requires_auth BOOLEAN DEFAULT TRUE, -- Public modules may allow anonymous use

  -- Technical Configuration
  runtime_preference TEXT DEFAULT 'serverless' CHECK (runtime_preference IN ('serverless', 'node-heavy')),
  entry_point TEXT, -- 'src/modules/keyword-research/index.jsx'
  function_endpoint TEXT, -- '/.netlify/functions/module-keyword-research'
  component_path TEXT, -- 'src/modules/keyword-research/KeywordResearchUI.jsx'

  -- UI Metadata
  icon_url TEXT,
  color TEXT DEFAULT '#3B82F6', -- Tailwind blue-500
  tags TEXT[] DEFAULT '{}',

  -- Schema Definitions (Zod schemas as JSON)
  input_schema JSONB, -- Expected inputs
  output_schema JSONB, -- Expected outputs
  config_schema JSONB, -- User-configurable settings

  -- WordPress Integration
  wordpress_compatible BOOLEAN DEFAULT FALSE,
  wordpress_shortcode TEXT, -- '[disruptors_keyword_research]'
  wordpress_block TEXT, -- 'disruptors/keyword-research' (Gutenberg block)
  wordpress_embed_type TEXT DEFAULT 'iframe' CHECK (wordpress_embed_type IN ('iframe', 'web-component', 'rest-api')),

  -- Features & Capabilities
  supports_batch BOOLEAN DEFAULT FALSE,
  has_preview BOOLEAN DEFAULT TRUE,
  is_experimental BOOLEAN DEFAULT FALSE,

  -- Default Quotas (can be overridden per user in module_access)
  default_daily_limit INTEGER DEFAULT 10,
  default_monthly_limit INTEGER DEFAULT 100,
  default_cost_per_run NUMERIC(10, 6) DEFAULT 0.00, -- USD

  -- Metadata
  documentation_url TEXT,
  changelog TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_run_at TIMESTAMPTZ,

  -- Search
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(category, '')), 'C')
  ) STORED
);

-- Indexes for modules
CREATE INDEX idx_modules_status ON modules(status);
CREATE INDEX idx_modules_category ON modules(category);
CREATE INDEX idx_modules_slug ON modules(slug);
CREATE INDEX idx_modules_search ON modules USING GIN(search_vector);
CREATE INDEX idx_modules_audience ON modules USING GIN(audience);
CREATE INDEX idx_modules_created_at ON modules(created_at DESC);

-- =====================================================
-- MODULE RUNS (TELEMETRY) TABLE
-- =====================================================
-- Tracks every execution of every module for analytics, billing, debugging

CREATE TABLE IF NOT EXISTS module_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous public runs
  brain_id UUID REFERENCES business_brains(id) ON DELETE SET NULL,

  -- Context
  audience TEXT NOT NULL CHECK (audience IN ('internal', 'client', 'public')),
  run_context JSONB DEFAULT '{}'::jsonb, -- { source: 'admin', 'app', 'public', ip_address, user_agent, etc. }

  -- Input/Output
  input_data JSONB, -- What the user provided
  output_data JSONB, -- What the module returned
  input_hash TEXT, -- MD5 of input for deduplication

  -- Performance Metrics
  duration_ms INTEGER,
  tokens_used INTEGER,
  cost_usd NUMERIC(10, 6),

  -- Result
  status TEXT NOT NULL CHECK (status IN ('success', 'fail', 'timeout', 'rate_limited', 'quota_exceeded')),
  error_message TEXT,
  error_stack TEXT,

  -- Metadata
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  session_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for module_runs (optimized for common queries)
CREATE INDEX idx_module_runs_module_id ON module_runs(module_id);
CREATE INDEX idx_module_runs_user_id ON module_runs(user_id);
CREATE INDEX idx_module_runs_brain_id ON module_runs(brain_id);
CREATE INDEX idx_module_runs_status ON module_runs(status);
CREATE INDEX idx_module_runs_audience ON module_runs(audience);
CREATE INDEX idx_module_runs_created_at ON module_runs(created_at DESC);
CREATE INDEX idx_module_runs_input_hash ON module_runs(input_hash); -- For deduplication
CREATE INDEX idx_module_runs_session ON module_runs(session_id); -- For session tracking

-- =====================================================
-- MODULE ACCESS (PER-USER QUOTAS & CONFIG) TABLE
-- =====================================================
-- Controls who can access which modules and with what limits

CREATE TABLE IF NOT EXISTS module_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Access Control
  enabled BOOLEAN DEFAULT TRUE,
  audience TEXT NOT NULL CHECK (audience IN ('internal', 'client', 'public')),

  -- Quotas (NULL means use module defaults)
  daily_limit INTEGER, -- Override module's default_daily_limit
  monthly_limit INTEGER, -- Override module's default_monthly_limit
  lifetime_limit INTEGER, -- Total runs allowed ever (NULL = unlimited)

  -- Current Usage (reset periodically)
  daily_used INTEGER DEFAULT 0,
  monthly_used INTEGER DEFAULT 0,
  lifetime_used INTEGER DEFAULT 0,

  -- User-Specific Configuration
  config JSONB DEFAULT '{}'::jsonb, -- User's custom settings for this module
  preferences JSONB DEFAULT '{}'::jsonb, -- UI preferences, saved defaults, etc.

  -- Reset Tracking
  daily_reset_at TIMESTAMPTZ DEFAULT NOW(),
  monthly_reset_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Who gave this access?
  granted_reason TEXT, -- Why was access granted?

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,

  -- Ensure one access record per user per module
  UNIQUE(module_id, user_id)
);

-- Indexes for module_access
CREATE INDEX idx_module_access_user_id ON module_access(user_id);
CREATE INDEX idx_module_access_module_id ON module_access(module_id);
CREATE INDEX idx_module_access_enabled ON module_access(enabled);
CREATE INDEX idx_module_access_audience ON module_access(audience);

-- =====================================================
-- MODULE CONFIGS (SYSTEM-WIDE SETTINGS) TABLE
-- =====================================================
-- System-level configuration for each module (API keys, feature flags, etc.)

CREATE TABLE IF NOT EXISTS module_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,

  -- Configuration
  key TEXT NOT NULL, -- 'api_key', 'feature_flags', 'rate_limit_override', etc.
  value JSONB NOT NULL,
  encrypted BOOLEAN DEFAULT FALSE, -- If true, value should be encrypted before storage

  -- Metadata
  description TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One config key per module
  UNIQUE(module_id, key)
);

-- Indexes for module_configs
CREATE INDEX idx_module_configs_module_id ON module_configs(module_id);
CREATE INDEX idx_module_configs_key ON module_configs(key);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_configs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- MODULES TABLE RLS
-- =====================================================

-- Public: Can view approved modules marked for public audience
CREATE POLICY "Public can view approved public modules"
  ON modules FOR SELECT
  USING (
    status = 'approved' AND
    audience::jsonb ? 'public'
  );

-- Authenticated: Can view approved modules they have access to (internal or client)
CREATE POLICY "Authenticated users can view approved modules"
  ON modules FOR SELECT
  TO authenticated
  USING (
    status = 'approved' AND
    (
      audience::jsonb ? 'client' OR
      audience::jsonb ? 'internal'
    )
  );

-- Service role: Full access (for admin operations)
CREATE POLICY "Service role has full access to modules"
  ON modules FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- MODULE_RUNS TABLE RLS
-- =====================================================

-- Users can view their own runs
CREATE POLICY "Users can view their own module runs"
  ON module_runs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own runs (created by Netlify functions via service role typically)
CREATE POLICY "Users can insert module runs"
  ON module_runs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Service role: Full access (for telemetry dashboards, analytics)
CREATE POLICY "Service role has full access to module runs"
  ON module_runs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- MODULE_ACCESS TABLE RLS
-- =====================================================

-- Users can view their own access records
CREATE POLICY "Users can view their own module access"
  ON module_access FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own config/preferences (not quotas!)
CREATE POLICY "Users can update their own module preferences"
  ON module_access FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    -- Prevent users from modifying quotas (only config/preferences)
    daily_limit IS NOT DISTINCT FROM (SELECT daily_limit FROM module_access WHERE id = module_access.id) AND
    monthly_limit IS NOT DISTINCT FROM (SELECT monthly_limit FROM module_access WHERE id = module_access.id) AND
    enabled IS NOT DISTINCT FROM (SELECT enabled FROM module_access WHERE id = module_access.id)
  );

-- Service role: Full access (for admin operations, quota management)
CREATE POLICY "Service role has full access to module access"
  ON module_access FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- MODULE_CONFIGS TABLE RLS
-- =====================================================

-- No direct user access to module_configs (system-level only)
-- Service role only
CREATE POLICY "Service role has full access to module configs"
  ON module_configs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if user has access to a module
CREATE OR REPLACE FUNCTION check_module_access(
  p_module_slug TEXT,
  p_user_id UUID,
  p_audience TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_module RECORD;
  v_access RECORD;
  v_result JSONB;
BEGIN
  -- Get module
  SELECT * INTO v_module
  FROM modules
  WHERE slug = p_module_slug AND status = 'approved';

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Module not found or not approved'
    );
  END IF;

  -- Check if module supports this audience
  IF NOT (v_module.audience::jsonb ? p_audience) THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Module not available for this audience'
    );
  END IF;

  -- For public audience, check module settings only
  IF p_audience = 'public' THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'module_id', v_module.id,
      'daily_limit', v_module.default_daily_limit,
      'monthly_limit', v_module.default_monthly_limit
    );
  END IF;

  -- For authenticated users, check module_access
  SELECT * INTO v_access
  FROM module_access
  WHERE module_id = v_module.id
    AND user_id = p_user_id
    AND enabled = true;

  -- If no access record, create default one
  IF NOT FOUND THEN
    INSERT INTO module_access (module_id, user_id, audience, daily_limit, monthly_limit)
    VALUES (v_module.id, p_user_id, p_audience, v_module.default_daily_limit, v_module.default_monthly_limit)
    RETURNING * INTO v_access;
  END IF;

  -- Check quotas
  IF v_access.daily_used >= COALESCE(v_access.daily_limit, v_module.default_daily_limit) THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Daily quota exceeded',
      'quota_reset_at', v_access.daily_reset_at + INTERVAL '1 day'
    );
  END IF;

  IF v_access.monthly_used >= COALESCE(v_access.monthly_limit, v_module.default_monthly_limit) THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Monthly quota exceeded',
      'quota_reset_at', v_access.monthly_reset_at + INTERVAL '1 month'
    );
  END IF;

  -- Access granted
  RETURN jsonb_build_object(
    'allowed', true,
    'module_id', v_module.id,
    'access_id', v_access.id,
    'daily_limit', COALESCE(v_access.daily_limit, v_module.default_daily_limit),
    'monthly_limit', COALESCE(v_access.monthly_limit, v_module.default_monthly_limit),
    'daily_used', v_access.daily_used,
    'monthly_used', v_access.monthly_used,
    'config', v_access.config
  );
END;
$$;

-- Function to increment module usage
CREATE OR REPLACE FUNCTION increment_module_usage(
  p_module_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update usage counters
  UPDATE module_access
  SET
    daily_used = daily_used + 1,
    monthly_used = monthly_used + 1,
    lifetime_used = lifetime_used + 1,
    last_used_at = NOW(),
    updated_at = NOW()
  WHERE module_id = p_module_id AND user_id = p_user_id;

  -- Update module's last_run_at
  UPDATE modules
  SET last_run_at = NOW()
  WHERE id = p_module_id;
END;
$$;

-- Function to reset daily quotas (call via cron daily)
CREATE OR REPLACE FUNCTION reset_daily_module_quotas()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reset_count INTEGER;
BEGIN
  UPDATE module_access
  SET
    daily_used = 0,
    daily_reset_at = NOW()
  WHERE daily_reset_at < NOW() - INTERVAL '1 day';

  GET DIAGNOSTICS v_reset_count = ROW_COUNT;

  RETURN v_reset_count;
END;
$$;

-- Function to reset monthly quotas (call via cron monthly)
CREATE OR REPLACE FUNCTION reset_monthly_module_quotas()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reset_count INTEGER;
BEGIN
  UPDATE module_access
  SET
    monthly_used = 0,
    monthly_reset_at = NOW()
  WHERE monthly_reset_at < NOW() - INTERVAL '1 month';

  GET DIAGNOSTICS v_reset_count = ROW_COUNT;

  RETURN v_reset_count;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp on modules
CREATE OR REPLACE FUNCTION update_modules_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW
  EXECUTE FUNCTION update_modules_timestamp();

-- Auto-update updated_at timestamp on module_access
CREATE OR REPLACE FUNCTION update_module_access_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER module_access_updated_at
  BEFORE UPDATE ON module_access
  FOR EACH ROW
  EXECUTE FUNCTION update_module_access_timestamp();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE modules IS 'Registry of all modules (micro-tools) in the system. Each module can operate at three levels: internal (admin), client (authenticated users), and public (lead magnets).';
COMMENT ON TABLE module_runs IS 'Telemetry table tracking every execution of every module for analytics, billing, and debugging.';
COMMENT ON TABLE module_access IS 'Per-user access control and quota management for modules.';
COMMENT ON TABLE module_configs IS 'System-wide configuration for modules (API keys, feature flags, etc.). Not directly accessible by users.';

COMMENT ON COLUMN modules.audience IS 'JSON array of access levels: ["internal"], ["internal", "client"], or ["internal", "client", "public"]';
COMMENT ON COLUMN modules.requires_brain IS 'Most modules need Business Brain context for personalization. Set to false for generic utilities.';
COMMENT ON COLUMN modules.runtime_preference IS 'Indicates whether module prefers serverless execution (Netlify functions) or node-heavy (Railway for long-running tasks).';
COMMENT ON COLUMN modules.wordpress_compatible IS 'Whether this module can be embedded in WordPress sites via plugin/shortcode.';

COMMENT ON FUNCTION check_module_access IS 'Checks if a user has access to a module and returns quota/config information. Creates default access record if none exists.';
COMMENT ON FUNCTION increment_module_usage IS 'Increments usage counters after successful module run. Call from Netlify functions after execution.';
COMMENT ON FUNCTION reset_daily_module_quotas IS 'Resets daily quotas for all users. Schedule via pg_cron or external cron.';
COMMENT ON FUNCTION reset_monthly_module_quotas IS 'Resets monthly quotas for all users. Schedule via pg_cron or external cron.';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
