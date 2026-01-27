-- ============================================================================
-- COMPLETE SUPABASE MIGRATION - Disruptors AI Marketing Hub
-- ============================================================================
-- Run this ENTIRE file in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Estimated time: 30-60 seconds
-- ============================================================================

-- ============================================================================
-- PART 1: EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- PART 2: SITE MEDIA TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_key text UNIQUE NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url text NOT NULL,
  page_slug text,
  section_name text,
  purpose text,
  alt_text text,
  caption text,
  title text,
  width integer,
  height integer,
  file_size integer,
  mime_type text,
  cloudinary_public_id text,
  cloudinary_folder text,
  cloudinary_version text,
  cloudinary_format text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  lazy_load boolean DEFAULT true,
  seo_optimized boolean DEFAULT false,
  accessibility_checked boolean DEFAULT false,
  tags text[],
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_media_page_slug ON site_media(page_slug);
CREATE INDEX IF NOT EXISTS idx_site_media_section ON site_media(section_name);
CREATE INDEX IF NOT EXISTS idx_site_media_type ON site_media(media_type);
CREATE INDEX IF NOT EXISTS idx_site_media_active ON site_media(is_active);
CREATE INDEX IF NOT EXISTS idx_site_media_media_key ON site_media(media_key);
CREATE INDEX IF NOT EXISTS idx_site_media_tags ON site_media USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_site_media_metadata ON site_media USING GIN(metadata);

-- ============================================================================
-- PART 3: POSTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    content_type VARCHAR(50) DEFAULT 'blog',
    featured_image TEXT,
    gallery_images TEXT[],
    author_id UUID,
    category VARCHAR(100),
    tags TEXT[],
    read_time_minutes INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    is_landing_page BOOLEAN DEFAULT false,
    primary_keyword TEXT,
    secondary_keywords JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON public.posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON public.posts(is_featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON public.posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_posts_content_type ON posts(content_type);
CREATE INDEX IF NOT EXISTS idx_posts_is_landing_page ON posts(is_landing_page);
CREATE INDEX IF NOT EXISTS idx_posts_primary_keyword ON posts(primary_keyword);

-- ============================================================================
-- PART 4: BUSINESS BRAIN TABLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS business_brains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  organization_id UUID,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  industry TEXT,
  founded_year INTEGER,
  company_size TEXT CHECK (company_size IN ('solo', '2-10', '11-50', '51-200', '201-1000', '1000+')),
  primary_website TEXT,
  primary_email TEXT,
  primary_phone TEXT,
  headquarters_city TEXT,
  headquarters_state TEXT,
  headquarters_country TEXT DEFAULT 'USA',
  service_areas TEXT[],
  ideal_customer_profile JSONB DEFAULT '[]'::jsonb,
  core_offerings JSONB DEFAULT '[]'::jsonb,
  unique_value_propositions TEXT[],
  key_differentiators TEXT[],
  pain_points_solved TEXT[],
  target_keywords TEXT[],
  competitor_urls TEXT[],
  brand_colors JSONB DEFAULT '{}'::jsonb,
  typography JSONB DEFAULT '{}'::jsonb,
  logo_urls JSONB DEFAULT '{}'::jsonb,
  design_style TEXT,
  brand_voice TEXT[],
  tone_attributes TEXT[],
  writing_style TEXT,
  vocabulary_level TEXT CHECK (vocabulary_level IN ('simple', 'intermediate', 'advanced', 'technical')),
  content_pillars TEXT[],
  content_formats TEXT[],
  publishing_frequency TEXT,
  seasonal_campaigns JSONB DEFAULT '[]'::jsonb,
  brain_level TEXT NOT NULL DEFAULT 'starter' CHECK (brain_level IN ('starter', 'enhanced', 'expert')),
  confidence_score DECIMAL(3,2) NOT NULL DEFAULT 0.00 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  total_facts INTEGER NOT NULL DEFAULT 0,
  last_trained_at TIMESTAMP WITH TIME ZONE,
  last_enhanced_at TIMESTAMP WITH TIME ZONE,
  auto_initialized BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  web_scrape_completed BOOLEAN DEFAULT FALSE,
  brand_colors_extracted BOOLEAN DEFAULT FALSE,
  integrations_connected INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE INDEX IF NOT EXISTS idx_business_brains_slug ON business_brains(slug);
CREATE INDEX IF NOT EXISTS idx_business_brains_level ON business_brains(brain_level);
CREATE INDEX IF NOT EXISTS idx_business_brains_industry ON business_brains(industry);
CREATE INDEX IF NOT EXISTS idx_business_brains_created ON business_brains(created_at DESC);

CREATE TABLE IF NOT EXISTS brain_facts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brain_id UUID NOT NULL REFERENCES business_brains(id) ON DELETE CASCADE,
  fact_text TEXT NOT NULL,
  fact_type TEXT NOT NULL CHECK (fact_type IN (
    'service', 'product', 'value_proposition', 'process', 'testimonial',
    'case_study', 'faq', 'pricing', 'location', 'team', 'history',
    'industry_insight', 'brand_rule', 'visual_asset', 'custom'
  )),
  category TEXT NOT NULL,
  subcategory TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'web_scrape', 'ai_conversation', 'file_upload', 'integration',
    'manual_entry', 'growth_audit', 'brand_detection'
  )),
  source_url TEXT,
  source_file_id UUID,
  source_integration_id UUID,
  embedding VECTOR(1536),
  keywords TEXT[],
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0.50 CHECK (confidence >= 0.0 AND confidence <= 1.0),
  importance TEXT CHECK (importance IN ('low', 'medium', 'high', 'critical')),
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES brain_facts(id),
  is_current BOOLEAN DEFAULT TRUE,
  deprecated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT valid_fact_text CHECK (LENGTH(fact_text) >= 10)
);

CREATE INDEX IF NOT EXISTS idx_brain_facts_brain ON brain_facts(brain_id);
CREATE INDEX IF NOT EXISTS idx_brain_facts_type ON brain_facts(fact_type);
CREATE INDEX IF NOT EXISTS idx_brain_facts_category ON brain_facts(category);
CREATE INDEX IF NOT EXISTS idx_brain_facts_source ON brain_facts(source_type);
CREATE INDEX IF NOT EXISTS idx_brain_facts_confidence ON brain_facts(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_brain_facts_current ON brain_facts(is_current) WHERE is_current = TRUE;
CREATE INDEX IF NOT EXISTS idx_brain_facts_verified ON brain_facts(verified) WHERE verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_brain_facts_fts ON brain_facts USING gin(to_tsvector('english', coalesce(fact_text, '') || ' ' || coalesce(category, '')));
CREATE INDEX IF NOT EXISTS idx_brain_facts_embedding ON brain_facts USING hnsw (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS brand_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brain_id UUID NOT NULL REFERENCES business_brains(id) ON DELETE CASCADE,
  rule_category TEXT NOT NULL CHECK (rule_category IN ('voice', 'tone', 'style', 'lexicon', 'taboos', 'examples')),
  rule_type TEXT NOT NULL,
  rule_text TEXT NOT NULL,
  applies_to TEXT[],
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  good_examples TEXT[],
  bad_examples TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_brand_rules_brain ON brand_rules(brain_id);
CREATE INDEX IF NOT EXISTS idx_brand_rules_category ON brand_rules(rule_category);
CREATE INDEX IF NOT EXISTS idx_brand_rules_active ON brand_rules(is_active) WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS brand_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brain_id UUID NOT NULL REFERENCES business_brains(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('logo', 'icon', 'image', 'pattern', 'illustration', 'photo', 'other')),
  asset_url TEXT NOT NULL,
  thumbnail_url TEXT,
  cloudinary_public_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  alt_text TEXT,
  tags TEXT[],
  dominant_colors TEXT[],
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  file_format TEXT,
  usage_context TEXT[],
  is_primary BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_assets_brain ON brand_assets(brain_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_type ON brand_assets(asset_type);

CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brain_id UUID NOT NULL REFERENCES business_brains(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('initial', 'enhancement', 'refinement')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_question_index INTEGER DEFAULT 0,
  total_questions INTEGER,
  facts_extracted INTEGER DEFAULT 0,
  rules_extracted INTEGER DEFAULT 0,
  confidence_improvement DECIMAL(3,2),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_brain ON onboarding_sessions(brain_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_status ON onboarding_sessions(status);

CREATE TABLE IF NOT EXISTS knowledge_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brain_id UUID NOT NULL REFERENCES business_brains(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'google_analytics', 'google_search_console', 'hubspot', 'mailchimp',
    'shopify', 'woocommerce', 'stripe', 'quickbooks', 'social_media',
    'rss_feed', 'api_endpoint', 'webhook', 'custom'
  )),
  source_name TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT FALSE,
  connection_config JSONB DEFAULT '{}'::jsonb,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_frequency TEXT CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'manual')),
  fact_mapping JSONB DEFAULT '{}'::jsonb,
  auto_categorize BOOLEAN DEFAULT TRUE,
  sync_status TEXT CHECK (sync_status IN ('active', 'paused', 'error', 'disconnected')),
  last_error TEXT,
  sync_count INTEGER DEFAULT 0,
  facts_created INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_sources_brain ON knowledge_sources(brain_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_type ON knowledge_sources(source_type);

-- ============================================================================
-- PART 5: MODULES SYSTEM
-- ============================================================================
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'testing' CHECK (status IN ('testing', 'review', 'approved', 'deprecated')),
  version TEXT DEFAULT '1.0.0',
  audience JSONB DEFAULT '["internal"]'::jsonb,
  requires_brain BOOLEAN DEFAULT TRUE,
  requires_auth BOOLEAN DEFAULT TRUE,
  runtime_preference TEXT DEFAULT 'serverless' CHECK (runtime_preference IN ('serverless', 'node-heavy')),
  entry_point TEXT,
  function_endpoint TEXT,
  component_path TEXT,
  icon_url TEXT,
  color TEXT DEFAULT '#3B82F6',
  tags TEXT[] DEFAULT '{}',
  input_schema JSONB,
  output_schema JSONB,
  config_schema JSONB,
  wordpress_compatible BOOLEAN DEFAULT FALSE,
  wordpress_shortcode TEXT,
  wordpress_block TEXT,
  wordpress_embed_type TEXT DEFAULT 'iframe' CHECK (wordpress_embed_type IN ('iframe', 'web-component', 'rest-api')),
  supports_batch BOOLEAN DEFAULT FALSE,
  has_preview BOOLEAN DEFAULT TRUE,
  is_experimental BOOLEAN DEFAULT FALSE,
  default_daily_limit INTEGER DEFAULT 10,
  default_monthly_limit INTEGER DEFAULT 100,
  default_cost_per_run NUMERIC(10, 6) DEFAULT 0.00,
  documentation_url TEXT,
  changelog TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_run_at TIMESTAMPTZ,
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(category, '')), 'C')
  ) STORED
);

CREATE INDEX IF NOT EXISTS idx_modules_status ON modules(status);
CREATE INDEX IF NOT EXISTS idx_modules_category ON modules(category);
CREATE INDEX IF NOT EXISTS idx_modules_slug ON modules(slug);
CREATE INDEX IF NOT EXISTS idx_modules_search ON modules USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_modules_audience ON modules USING GIN(audience);

CREATE TABLE IF NOT EXISTS module_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  brain_id UUID REFERENCES business_brains(id) ON DELETE SET NULL,
  audience TEXT NOT NULL CHECK (audience IN ('internal', 'client', 'public')),
  run_context JSONB DEFAULT '{}'::jsonb,
  input_data JSONB,
  output_data JSONB,
  input_hash TEXT,
  duration_ms INTEGER,
  tokens_used INTEGER,
  cost_usd NUMERIC(10, 6),
  status TEXT NOT NULL CHECK (status IN ('success', 'fail', 'timeout', 'rate_limited', 'quota_exceeded')),
  error_message TEXT,
  error_stack TEXT,
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_module_runs_module_id ON module_runs(module_id);
CREATE INDEX IF NOT EXISTS idx_module_runs_user_id ON module_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_module_runs_status ON module_runs(status);
CREATE INDEX IF NOT EXISTS idx_module_runs_created_at ON module_runs(created_at DESC);

CREATE TABLE IF NOT EXISTS module_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT TRUE,
  audience TEXT NOT NULL CHECK (audience IN ('internal', 'client', 'public')),
  daily_limit INTEGER,
  monthly_limit INTEGER,
  lifetime_limit INTEGER,
  daily_used INTEGER DEFAULT 0,
  monthly_used INTEGER DEFAULT 0,
  lifetime_used INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  daily_reset_at TIMESTAMPTZ DEFAULT NOW(),
  monthly_reset_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  UNIQUE(module_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_module_access_user_id ON module_access(user_id);
CREATE INDEX IF NOT EXISTS idx_module_access_module_id ON module_access(module_id);

-- ============================================================================
-- PART 6: LEADS AND SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  website TEXT,
  source TEXT,
  source_page TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'nurturing', 'converted', 'lost', 'unqualified')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  interest_level TEXT DEFAULT 'medium' CHECK (interest_level IN ('low', 'medium', 'high')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_contact_date TIMESTAMPTZ,
  next_follow_up_date TIMESTAMPTZ,
  contacted BOOLEAN DEFAULT FALSE,
  notes TEXT,
  tags JSONB DEFAULT '[]'::JSONB,
  custom_fields JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'general',
  value_text TEXT,
  value_number NUMERIC,
  value_boolean BOOLEAN,
  value_json JSONB,
  data_type TEXT NOT NULL DEFAULT 'text' CHECK (data_type IN ('text', 'number', 'boolean', 'json', 'array')),
  label TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  validation_rules JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON public.settings(category);

-- ============================================================================
-- PART 7: SEO TABLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword TEXT NOT NULL,
  keyword_hash TEXT UNIQUE,
  discovery_source TEXT DEFAULT 'manual',
  discovery_location TEXT,
  discovery_language TEXT,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  search_volume INTEGER,
  cpc NUMERIC(10, 2),
  competition NUMERIC(3, 2),
  keyword_difficulty INTEGER CHECK (keyword_difficulty >= 0 AND keyword_difficulty <= 100),
  trend_score NUMERIC(3, 2) DEFAULT 0,
  monthly_volumes JSONB,
  opportunity_score NUMERIC(5, 2),
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  keyword_type TEXT,
  search_intent TEXT,
  assignment_status TEXT DEFAULT 'available',
  assigned_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_keywords_hash ON keywords(keyword_hash);
CREATE INDEX IF NOT EXISTS idx_keywords_opportunity ON keywords(opportunity_score DESC);

-- ============================================================================
-- PART 8: HELPER FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['site_media', 'posts', 'business_brains', 'brain_facts', 'brand_rules', 'brand_assets', 'knowledge_sources', 'modules', 'module_access', 'leads', 'settings', 'keywords'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %s', tbl, tbl);
    EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', tbl, tbl);
  END LOOP;
END $$;

-- Brain search functions
CREATE OR REPLACE FUNCTION search_brain_facts(
  p_brain_id UUID,
  q TEXT,
  limit_count INTEGER DEFAULT 15
)
RETURNS TABLE (
  id UUID,
  fact_text TEXT,
  fact_type TEXT,
  category TEXT,
  confidence DECIMAL,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bf.id,
    bf.fact_text,
    bf.fact_type,
    bf.category,
    bf.confidence,
    ts_rank(to_tsvector('english', bf.fact_text || ' ' || coalesce(bf.category, '')), plainto_tsquery('english', q)) AS relevance
  FROM brain_facts bf
  WHERE bf.brain_id = p_brain_id AND bf.is_current = TRUE
    AND to_tsvector('english', bf.fact_text || ' ' || coalesce(bf.category, '')) @@ plainto_tsquery('english', q)
  ORDER BY relevance DESC, bf.confidence DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION search_brain_facts_vector(
  p_brain_id UUID,
  query_embedding VECTOR(1536),
  limit_count INTEGER DEFAULT 15,
  similarity_threshold REAL DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  fact_text TEXT,
  fact_type TEXT,
  category TEXT,
  confidence DECIMAL,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bf.id,
    bf.fact_text,
    bf.fact_type,
    bf.category,
    bf.confidence,
    1 - (bf.embedding <=> query_embedding) AS similarity
  FROM brain_facts bf
  WHERE bf.brain_id = p_brain_id AND bf.is_current = TRUE AND bf.embedding IS NOT NULL
    AND (1 - (bf.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY bf.embedding <=> query_embedding
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 9: ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE site_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_brains ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

-- Service role full access (for all tables)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['site_media', 'posts', 'business_brains', 'brain_facts', 'brand_rules', 'brand_assets', 'onboarding_sessions', 'knowledge_sources', 'modules', 'module_runs', 'module_access', 'leads', 'settings', 'keywords'])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Service role full access %s" ON %s', tbl, tbl);
    EXECUTE format('CREATE POLICY "Service role full access %s" ON %s FOR ALL TO service_role USING (true) WITH CHECK (true)', tbl, tbl);
  END LOOP;
END $$;

-- Public read policies for published content
CREATE POLICY "Public read published posts" ON posts FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public read active media" ON site_media FOR SELECT USING (is_active = true);
CREATE POLICY "Public read approved modules" ON modules FOR SELECT USING (status = 'approved' AND audience::jsonb ? 'public');
CREATE POLICY "Public read public settings" ON settings FOR SELECT USING (is_public = true);

-- Authenticated user policies
CREATE POLICY "Auth users read all posts" ON posts FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Auth users manage posts" ON posts FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "Auth users read own brains" ON business_brains FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Auth users manage own brains" ON business_brains FOR ALL TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Auth users read brain facts" ON brain_facts FOR SELECT TO authenticated USING (brain_id IN (SELECT id FROM business_brains WHERE created_by = auth.uid()));
CREATE POLICY "Auth users manage brain facts" ON brain_facts FOR ALL TO authenticated USING (brain_id IN (SELECT id FROM business_brains WHERE created_by = auth.uid()));
CREATE POLICY "Auth users read brand rules" ON brand_rules FOR SELECT TO authenticated USING (brain_id IN (SELECT id FROM business_brains WHERE created_by = auth.uid()));
CREATE POLICY "Auth users manage brand rules" ON brand_rules FOR ALL TO authenticated USING (brain_id IN (SELECT id FROM business_brains WHERE created_by = auth.uid()));
CREATE POLICY "Auth users read modules" ON modules FOR SELECT TO authenticated USING (status = 'approved' AND (audience::jsonb ? 'client' OR audience::jsonb ? 'internal'));
CREATE POLICY "Auth users read own runs" ON module_runs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Auth users read own access" ON module_access FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- PART 10: GRANTS
-- ============================================================================
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '✅ MIGRATION COMPLETE!';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Tables created: 14+';
  RAISE NOTICE 'Indexes created: 50+';
  RAISE NOTICE 'Functions created: 3';
  RAISE NOTICE 'RLS policies: Enabled on all tables';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEP: Run the data import script';
  RAISE NOTICE '==========================================';
END $$;
