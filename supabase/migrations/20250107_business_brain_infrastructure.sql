-- =====================================================
-- BUSINESS BRAIN INFRASTRUCTURE MIGRATION
-- =====================================================
-- This migration creates the complete Business Brain system infrastructure
-- including enhanced tables, RLS policies, and database functions.
--
-- Tables Created:
-- - business_brains (enhanced with 40+ fields)
-- - brain_facts (knowledge entries with FTS + vector search)
-- - brand_rules (voice, tone, style guidelines)
-- - brand_assets (visual assets with metadata)
-- - onboarding_sessions (AI conversation history)
-- - knowledge_sources (integration configurations)
-- - posts_brain_facts (junction table for fact usage tracking)
--
-- Features:
-- - Row-Level Security (RLS) on all tables
-- - Full-text search for brain facts
-- - Vector embeddings for semantic search
-- - Confidence scoring system
-- - Multi-tier brain levels
-- - Audit logging
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- BUSINESS_BRAINS TABLE (Enhanced)
-- =====================================================
-- Central Business Brain entity with comprehensive business intelligence

CREATE TABLE IF NOT EXISTS business_brains (
  -- Primary Keys
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  organization_id UUID, -- Nullable - will reference organizations(id) when organizations table exists

  -- Basic Information
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  industry TEXT,
  founded_year INTEGER,
  company_size TEXT CHECK (company_size IN ('solo', '2-10', '11-50', '51-200', '201-1000', '1000+')),

  -- Contact & Location
  primary_website TEXT,
  primary_email TEXT,
  primary_phone TEXT,
  headquarters_city TEXT,
  headquarters_state TEXT,
  headquarters_country TEXT DEFAULT 'USA',
  service_areas TEXT[], -- Geographic areas served

  -- Business Intelligence
  ideal_customer_profile JSONB DEFAULT '[]'::jsonb, -- Array of ICP objects
  core_offerings JSONB DEFAULT '[]'::jsonb, -- Products/services
  unique_value_propositions TEXT[],
  key_differentiators TEXT[],
  pain_points_solved TEXT[],
  target_keywords TEXT[],
  competitor_urls TEXT[],

  -- Brand Identity (Visual)
  brand_colors JSONB DEFAULT '{}'::jsonb, -- {primary, secondary, accent, neutral}
  typography JSONB DEFAULT '{}'::jsonb, -- {heading, body, accent}
  logo_urls JSONB DEFAULT '{}'::jsonb, -- {primary, icon, dark, light}
  design_style TEXT, -- 'modern', 'traditional', 'minimalist', 'bold', etc.

  -- Brand Voice
  brand_voice TEXT[], -- ['professional', 'friendly', 'authoritative']
  tone_attributes TEXT[], -- ['conversational', 'technical', 'empathetic']
  writing_style TEXT, -- 'formal', 'casual', 'technical', 'storytelling'
  vocabulary_level TEXT CHECK (vocabulary_level IN ('simple', 'intermediate', 'advanced', 'technical')),

  -- Content Strategy
  content_pillars TEXT[], -- Main topic categories
  content_formats TEXT[], -- ['blog', 'video', 'infographic', 'podcast']
  publishing_frequency TEXT, -- 'daily', 'weekly', 'monthly'
  seasonal_campaigns JSONB DEFAULT '[]'::jsonb,

  -- Brain Health Metrics
  brain_level TEXT NOT NULL DEFAULT 'starter' CHECK (brain_level IN ('starter', 'enhanced', 'expert')),
  confidence_score DECIMAL(3,2) NOT NULL DEFAULT 0.00 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  total_facts INTEGER NOT NULL DEFAULT 0,
  last_trained_at TIMESTAMP WITH TIME ZONE,
  last_enhanced_at TIMESTAMP WITH TIME ZONE,

  -- Initialization Status
  auto_initialized BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  web_scrape_completed BOOLEAN DEFAULT FALSE,
  brand_colors_extracted BOOLEAN DEFAULT FALSE,
  integrations_connected INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT valid_confidence CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0)
);

-- Indexes for performance
-- CREATE INDEX idx_business_brains_organization ON business_brains(organization_id); -- Uncomment when using organizations
CREATE INDEX idx_business_brains_slug ON business_brains(slug);
CREATE INDEX idx_business_brains_level ON business_brains(brain_level);
CREATE INDEX idx_business_brains_industry ON business_brains(industry);
CREATE INDEX idx_business_brains_created ON business_brains(created_at DESC);

-- Full-text search index
CREATE INDEX idx_business_brains_fts ON business_brains USING gin(
  to_tsvector('english',
    coalesce(name, '') || ' ' ||
    coalesce(business_name, '') || ' ' ||
    coalesce(tagline, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(industry, '')
  )
);

-- =====================================================
-- BRAIN_FACTS TABLE (Enhanced)
-- =====================================================
-- Individual knowledge entries with categorization and vector embeddings

CREATE TABLE IF NOT EXISTS brain_facts (
  -- Primary Keys
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brain_id UUID NOT NULL REFERENCES business_brains(id) ON DELETE CASCADE,

  -- Fact Content
  fact_text TEXT NOT NULL,
  fact_type TEXT NOT NULL CHECK (fact_type IN (
    'service', 'product', 'value_proposition', 'process', 'testimonial',
    'case_study', 'faq', 'pricing', 'location', 'team', 'history',
    'industry_insight', 'brand_rule', 'visual_asset', 'custom'
  )),
  category TEXT NOT NULL, -- Broader categorization
  subcategory TEXT,

  -- Metadata
  source_type TEXT NOT NULL CHECK (source_type IN (
    'web_scrape', 'ai_conversation', 'file_upload', 'integration',
    'manual_entry', 'growth_audit', 'brand_detection'
  )),
  source_url TEXT,
  source_file_id UUID,
  source_integration_id UUID,

  -- Search & Embeddings
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small
  keywords TEXT[],

  -- Quality Metrics
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0.50 CHECK (confidence >= 0.0 AND confidence <= 1.0),
  importance TEXT CHECK (importance IN ('low', 'medium', 'high', 'critical')),
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,

  -- Usage Tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,

  -- Versioning
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES brain_facts(id),
  is_current BOOLEAN DEFAULT TRUE,
  deprecated_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT valid_fact_text CHECK (LENGTH(fact_text) >= 10),
  CONSTRAINT valid_confidence_fact CHECK (confidence >= 0.0 AND confidence <= 1.0)
);

-- Indexes for performance
CREATE INDEX idx_brain_facts_brain ON brain_facts(brain_id);
CREATE INDEX idx_brain_facts_type ON brain_facts(fact_type);
CREATE INDEX idx_brain_facts_category ON brain_facts(category);
CREATE INDEX idx_brain_facts_source ON brain_facts(source_type);
CREATE INDEX idx_brain_facts_confidence ON brain_facts(confidence DESC);
CREATE INDEX idx_brain_facts_current ON brain_facts(is_current) WHERE is_current = TRUE;
CREATE INDEX idx_brain_facts_verified ON brain_facts(verified) WHERE verified = TRUE;

-- Full-text search index
CREATE INDEX idx_brain_facts_fts ON brain_facts USING gin(
  to_tsvector('english',
    coalesce(fact_text, '') || ' ' ||
    coalesce(category, '') || ' ' ||
    coalesce(subcategory, '')
  )
);

-- Vector similarity search index (HNSW for fast approximate nearest neighbor)
CREATE INDEX idx_brain_facts_embedding ON brain_facts USING hnsw (embedding vector_cosine_ops);

-- =====================================================
-- BRAND_RULES TABLE
-- =====================================================
-- Brand voice, tone, style guidelines

CREATE TABLE IF NOT EXISTS brand_rules (
  -- Primary Keys
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brain_id UUID NOT NULL REFERENCES business_brains(id) ON DELETE CASCADE,

  -- Rule Content
  rule_category TEXT NOT NULL CHECK (rule_category IN (
    'voice', 'tone', 'style', 'lexicon', 'taboos', 'examples'
  )),
  rule_type TEXT NOT NULL, -- Specific type within category
  rule_text TEXT NOT NULL,

  -- Context
  applies_to TEXT[], -- ['blog', 'social', 'email', 'ads']
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),

  -- Examples
  good_examples TEXT[],
  bad_examples TEXT[],

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_brand_rules_brain ON brand_rules(brain_id);
CREATE INDEX idx_brand_rules_category ON brand_rules(rule_category);
CREATE INDEX idx_brand_rules_active ON brand_rules(is_active) WHERE is_active = TRUE;

-- =====================================================
-- BRAND_ASSETS TABLE
-- =====================================================
-- Visual brand assets with metadata

CREATE TABLE IF NOT EXISTS brand_assets (
  -- Primary Keys
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brain_id UUID NOT NULL REFERENCES business_brains(id) ON DELETE CASCADE,

  -- Asset Information
  asset_type TEXT NOT NULL CHECK (asset_type IN (
    'logo', 'icon', 'image', 'pattern', 'illustration', 'photo', 'other'
  )),
  asset_url TEXT NOT NULL,
  thumbnail_url TEXT,
  cloudinary_public_id TEXT,

  -- Metadata
  name TEXT NOT NULL,
  description TEXT,
  alt_text TEXT,
  tags TEXT[],

  -- Visual Properties
  dominant_colors TEXT[], -- Hex color codes
  width INTEGER,
  height INTEGER,
  file_size INTEGER, -- bytes
  file_format TEXT, -- 'png', 'jpg', 'svg', 'webp'

  -- Usage Context
  usage_context TEXT[], -- ['website', 'social', 'print', 'email']
  is_primary BOOLEAN DEFAULT FALSE,

  -- Metadata
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_brand_assets_brain ON brand_assets(brain_id);
CREATE INDEX idx_brand_assets_type ON brand_assets(asset_type);
CREATE INDEX idx_brand_assets_primary ON brand_assets(is_primary) WHERE is_primary = TRUE;

-- =====================================================
-- ONBOARDING_SESSIONS TABLE
-- =====================================================
-- AI conversation history for brain training

CREATE TABLE IF NOT EXISTS onboarding_sessions (
  -- Primary Keys
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brain_id UUID NOT NULL REFERENCES business_brains(id) ON DELETE CASCADE,

  -- Session Information
  session_type TEXT NOT NULL CHECK (session_type IN ('initial', 'enhancement', 'refinement')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),

  -- Conversation Data
  messages JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {role, content, timestamp}
  current_question_index INTEGER DEFAULT 0,
  total_questions INTEGER,

  -- Extraction Results
  facts_extracted INTEGER DEFAULT 0,
  rules_extracted INTEGER DEFAULT 0,
  confidence_improvement DECIMAL(3,2),

  -- Metadata
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_onboarding_sessions_brain ON onboarding_sessions(brain_id);
CREATE INDEX idx_onboarding_sessions_status ON onboarding_sessions(status);
CREATE INDEX idx_onboarding_sessions_started ON onboarding_sessions(started_at DESC);

-- =====================================================
-- KNOWLEDGE_SOURCES TABLE
-- =====================================================
-- Integration configurations for live data feeds

CREATE TABLE IF NOT EXISTS knowledge_sources (
  -- Primary Keys
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brain_id UUID NOT NULL REFERENCES business_brains(id) ON DELETE CASCADE,

  -- Source Configuration
  source_type TEXT NOT NULL CHECK (source_type IN (
    'google_analytics', 'google_search_console', 'hubspot', 'mailchimp',
    'shopify', 'woocommerce', 'stripe', 'quickbooks', 'social_media',
    'rss_feed', 'api_endpoint', 'webhook', 'custom'
  )),
  source_name TEXT NOT NULL,

  -- Connection Details
  is_connected BOOLEAN DEFAULT FALSE,
  connection_config JSONB DEFAULT '{}'::jsonb, -- OAuth tokens, API keys (encrypted)
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_frequency TEXT CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'manual')),

  -- Data Mapping
  fact_mapping JSONB DEFAULT '{}'::jsonb, -- Maps source fields to brain facts
  auto_categorize BOOLEAN DEFAULT TRUE,

  -- Sync Status
  sync_status TEXT CHECK (sync_status IN ('active', 'paused', 'error', 'disconnected')),
  last_error TEXT,
  sync_count INTEGER DEFAULT 0,
  facts_created INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_knowledge_sources_brain ON knowledge_sources(brain_id);
CREATE INDEX idx_knowledge_sources_type ON knowledge_sources(source_type);
CREATE INDEX idx_knowledge_sources_connected ON knowledge_sources(is_connected) WHERE is_connected = TRUE;
CREATE INDEX idx_knowledge_sources_status ON knowledge_sources(sync_status);

-- =====================================================
-- POSTS_BRAIN_FACTS TABLE (Junction)
-- =====================================================
-- Tracks which brain facts were used in content generation
-- NOTE: Requires 'posts' table to exist first - uncomment after creating posts table

-- CREATE TABLE IF NOT EXISTS posts_brain_facts (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
--   brain_fact_id UUID NOT NULL REFERENCES brain_facts(id) ON DELETE CASCADE,
--
--   -- Usage Context
--   used_in_section TEXT, -- 'introduction', 'body', 'conclusion', 'faq'
--   relevance_score DECIMAL(3,2),
--
--   -- Metadata
--   used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--
--   CONSTRAINT unique_post_fact UNIQUE (post_id, brain_fact_id)
-- );
--
-- -- Indexes
-- CREATE INDEX idx_posts_brain_facts_post ON posts_brain_facts(post_id);
-- CREATE INDEX idx_posts_brain_facts_fact ON posts_brain_facts(brain_fact_id);

-- =====================================================
-- EXTEND EXISTING POSTS TABLE
-- =====================================================
-- Add brain context fields to existing posts table
-- NOTE: Uncomment after creating posts table

-- ALTER TABLE posts
--   ADD COLUMN IF NOT EXISTS brain_id UUID REFERENCES business_brains(id),
--   ADD COLUMN IF NOT EXISTS brain_facts_used INTEGER DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS brain_confidence_at_generation DECIMAL(3,2),
--   ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT FALSE,
--   ADD COLUMN IF NOT EXISTS generation_model TEXT;
--
-- -- Index
-- CREATE INDEX IF NOT EXISTS idx_posts_brain ON posts(brain_id);
-- CREATE INDEX IF NOT EXISTS idx_posts_auto_generated ON posts(auto_generated) WHERE auto_generated = TRUE;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE business_brains ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE posts_brain_facts ENABLE ROW LEVEL SECURITY; -- Uncomment after creating table

-- Business Brains Policies
-- Simplified: Users can only access brains they created (until organizations table exists)
CREATE POLICY "Users can view their own brains"
  ON business_brains FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can manage their own brains"
  ON business_brains FOR ALL
  USING (created_by = auth.uid());

CREATE POLICY "Service role has full access to business_brains"
  ON business_brains FOR ALL
  TO service_role
  USING (true);

-- Brain Facts Policies
CREATE POLICY "Users can view facts for their own brains"
  ON brain_facts FOR SELECT
  USING (brain_id IN (
    SELECT id FROM business_brains WHERE created_by = auth.uid()
  ));

CREATE POLICY "Users can manage facts for their own brains"
  ON brain_facts FOR ALL
  USING (brain_id IN (
    SELECT id FROM business_brains WHERE created_by = auth.uid()
  ));

CREATE POLICY "Service role has full access to brain_facts"
  ON brain_facts FOR ALL
  TO service_role
  USING (true);

-- Brand Rules Policies
CREATE POLICY "Users can view rules for their own brains"
  ON brand_rules FOR SELECT
  USING (brain_id IN (
    SELECT id FROM business_brains WHERE created_by = auth.uid()
  ));

CREATE POLICY "Users can manage rules for their own brains"
  ON brand_rules FOR ALL
  USING (brain_id IN (
    SELECT id FROM business_brains WHERE created_by = auth.uid()
  ));

CREATE POLICY "Service role has full access to brand_rules"
  ON brand_rules FOR ALL
  TO service_role
  USING (true);

-- Brand Assets Policies
CREATE POLICY "Users can view assets for their own brains"
  ON brand_assets FOR SELECT
  USING (brain_id IN (
    SELECT id FROM business_brains WHERE created_by = auth.uid()
  ));

CREATE POLICY "Users can manage assets for their own brains"
  ON brand_assets FOR ALL
  USING (brain_id IN (
    SELECT id FROM business_brains WHERE created_by = auth.uid()
  ));

CREATE POLICY "Service role has full access to brand_assets"
  ON brand_assets FOR ALL
  TO service_role
  USING (true);

-- Onboarding Sessions Policies
CREATE POLICY "Users can view onboarding sessions for their own brains"
  ON onboarding_sessions FOR SELECT
  USING (brain_id IN (
    SELECT id FROM business_brains WHERE created_by = auth.uid()
  ));

CREATE POLICY "Users can create onboarding sessions for their own brains"
  ON onboarding_sessions FOR INSERT
  WITH CHECK (brain_id IN (
    SELECT id FROM business_brains WHERE created_by = auth.uid()
  ));

CREATE POLICY "Service role has full access to onboarding_sessions"
  ON onboarding_sessions FOR ALL
  TO service_role
  USING (true);

-- Knowledge Sources Policies
CREATE POLICY "Users can view sources for their own brains"
  ON knowledge_sources FOR SELECT
  USING (brain_id IN (
    SELECT id FROM business_brains WHERE created_by = auth.uid()
  ));

CREATE POLICY "Users can manage sources for their own brains"
  ON knowledge_sources FOR ALL
  USING (brain_id IN (
    SELECT id FROM business_brains WHERE created_by = auth.uid()
  ));

CREATE POLICY "Service role has full access to knowledge_sources"
  ON knowledge_sources FOR ALL
  TO service_role
  USING (true);

-- Posts Brain Facts Policies
-- NOTE: Uncomment after creating posts_brain_facts table
-- CREATE POLICY "Users can view fact usage for their own posts"
--   ON posts_brain_facts FOR SELECT
--   USING (post_id IN (
--     SELECT p.id FROM posts p
--     JOIN business_brains bb ON p.brain_id = bb.id
--     WHERE bb.created_by = auth.uid()
--   ));
--
-- CREATE POLICY "Service role has full access to posts_brain_facts"
--   ON posts_brain_facts FOR ALL
--   TO service_role
--   USING (true);

-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function: Search brain facts using full-text search
CREATE OR REPLACE FUNCTION search_brain_facts(
  brain_id UUID,
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
    ts_rank(
      to_tsvector('english', bf.fact_text || ' ' || coalesce(bf.category, '')),
      plainto_tsquery('english', q)
    ) AS relevance
  FROM brain_facts bf
  WHERE
    bf.brain_id = search_brain_facts.brain_id
    AND bf.is_current = TRUE
    AND to_tsvector('english', bf.fact_text || ' ' || coalesce(bf.category, '')) @@ plainto_tsquery('english', q)
  ORDER BY relevance DESC, bf.confidence DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Search brain facts using vector similarity
CREATE OR REPLACE FUNCTION search_brain_facts_vector(
  brain_id UUID,
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
  WHERE
    bf.brain_id = search_brain_facts_vector.brain_id
    AND bf.is_current = TRUE
    AND bf.embedding IS NOT NULL
    AND (1 - (bf.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY bf.embedding <=> query_embedding
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate brain confidence score
CREATE OR REPLACE FUNCTION calculate_brain_confidence(brain_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  fact_count INTEGER;
  verified_count INTEGER;
  avg_fact_confidence DECIMAL;
  sources_connected INTEGER;
  onboarding_complete BOOLEAN;
  final_score DECIMAL;
BEGIN
  -- Get metrics
  SELECT COUNT(*), COUNT(*) FILTER (WHERE verified = TRUE), AVG(confidence)
  INTO fact_count, verified_count, avg_fact_confidence
  FROM brain_facts
  WHERE brain_facts.brain_id = calculate_brain_confidence.brain_id
    AND is_current = TRUE;

  SELECT COUNT(*) INTO sources_connected
  FROM knowledge_sources
  WHERE knowledge_sources.brain_id = calculate_brain_confidence.brain_id
    AND is_connected = TRUE;

  SELECT onboarding_completed INTO onboarding_complete
  FROM business_brains
  WHERE id = calculate_brain_confidence.brain_id;

  -- Calculate weighted score
  final_score := LEAST(1.0,
    (LEAST(fact_count::DECIMAL / 100, 1.0) * 0.3) +  -- 30% weight: fact quantity
    (COALESCE(avg_fact_confidence, 0) * 0.25) +      -- 25% weight: avg fact quality
    (LEAST(verified_count::DECIMAL / 20, 1.0) * 0.2) + -- 20% weight: verified facts
    (LEAST(sources_connected::DECIMAL / 5, 1.0) * 0.15) + -- 15% weight: integrations
    (CASE WHEN onboarding_complete THEN 0.10 ELSE 0 END) -- 10% weight: onboarding
  );

  RETURN ROUND(final_score::NUMERIC, 2);
END;
$$ LANGUAGE plpgsql;

-- Function: Update brain stats (triggered after fact changes)
CREATE OR REPLACE FUNCTION update_brain_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE business_brains
    SET
      total_facts = (
        SELECT COUNT(*)
        FROM brain_facts
        WHERE brain_id = NEW.brain_id AND is_current = TRUE
      ),
      confidence_score = calculate_brain_confidence(NEW.brain_id),
      updated_at = NOW()
    WHERE id = NEW.brain_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE business_brains
    SET
      total_facts = (
        SELECT COUNT(*)
        FROM brain_facts
        WHERE brain_id = OLD.brain_id AND is_current = TRUE
      ),
      confidence_score = calculate_brain_confidence(OLD.brain_id),
      updated_at = NOW()
    WHERE id = OLD.brain_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update brain stats when facts change
DROP TRIGGER IF EXISTS trigger_update_brain_stats ON brain_facts;
CREATE TRIGGER trigger_update_brain_stats
  AFTER INSERT OR UPDATE OR DELETE ON brain_facts
  FOR EACH ROW
  EXECUTE FUNCTION update_brain_stats();

-- Function: Update brain level based on confidence
CREATE OR REPLACE FUNCTION update_brain_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confidence_score >= 0.80 THEN
    NEW.brain_level := 'expert';
  ELSIF NEW.confidence_score >= 0.50 THEN
    NEW.brain_level := 'enhanced';
  ELSE
    NEW.brain_level := 'starter';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update brain level when confidence changes
DROP TRIGGER IF EXISTS trigger_update_brain_level ON business_brains;
CREATE TRIGGER trigger_update_brain_level
  BEFORE UPDATE OF confidence_score ON business_brains
  FOR EACH ROW
  WHEN (OLD.confidence_score IS DISTINCT FROM NEW.confidence_score)
  EXECUTE FUNCTION update_brain_level();

-- Function: Increment fact usage count
CREATE OR REPLACE FUNCTION increment_fact_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE brain_facts
  SET
    usage_count = usage_count + 1,
    last_used_at = NOW()
  WHERE id = NEW.brain_fact_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Track fact usage when used in posts
DROP TRIGGER IF EXISTS trigger_increment_fact_usage ON posts_brain_facts;
CREATE TRIGGER trigger_increment_fact_usage
  AFTER INSERT ON posts_brain_facts
  FOR EACH ROW
  EXECUTE FUNCTION increment_fact_usage();

-- Function: Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers: Auto-update updated_at timestamp
DROP TRIGGER IF EXISTS trigger_business_brains_updated_at ON business_brains;
CREATE TRIGGER trigger_business_brains_updated_at
  BEFORE UPDATE ON business_brains
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_brain_facts_updated_at ON brain_facts;
CREATE TRIGGER trigger_brain_facts_updated_at
  BEFORE UPDATE ON brain_facts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_brand_rules_updated_at ON brand_rules;
CREATE TRIGGER trigger_brand_rules_updated_at
  BEFORE UPDATE ON brand_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_brand_assets_updated_at ON brand_assets;
CREATE TRIGGER trigger_brand_assets_updated_at
  BEFORE UPDATE ON brand_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_knowledge_sources_updated_at ON knowledge_sources;
CREATE TRIGGER trigger_knowledge_sources_updated_at
  BEFORE UPDATE ON knowledge_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant permissions on tables
GRANT SELECT ON business_brains TO authenticated;
GRANT SELECT ON brain_facts TO authenticated;
GRANT SELECT ON brand_rules TO authenticated;
GRANT SELECT ON brand_assets TO authenticated;
GRANT SELECT ON onboarding_sessions TO authenticated;
GRANT SELECT ON knowledge_sources TO authenticated;
GRANT SELECT ON posts_brain_facts TO authenticated;

GRANT ALL ON business_brains TO service_role;
GRANT ALL ON brain_facts TO service_role;
GRANT ALL ON brand_rules TO service_role;
GRANT ALL ON brand_assets TO service_role;
GRANT ALL ON onboarding_sessions TO service_role;
GRANT ALL ON knowledge_sources TO service_role;
GRANT ALL ON posts_brain_facts TO service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION search_brain_facts TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION search_brain_facts_vector TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION calculate_brain_confidence TO authenticated, service_role;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Insert migration record
INSERT INTO migrations (name, executed_at)
VALUES ('20250107_business_brain_infrastructure', NOW())
ON CONFLICT (name) DO NOTHING;
