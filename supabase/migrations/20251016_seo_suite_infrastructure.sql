-- SEO Suite Infrastructure Migration
-- Created: 2025-10-16
-- Purpose: Complete database schema for Advanced Keyword Research + Landing Page Generator
--
-- Tables Created:
-- 1. keywords - Central keyword repository with DataForSEO metrics
-- 2. keyword_research_runs - Research session tracking
-- 3. landing_pages_metadata - Extended SEO metadata for landing pages
-- 4. landing_page_templates - Reusable content templates
-- 5. keyword_clusters - Keyword grouping for topic clusters
-- 6. serp_tracking - SERP position history tracking
--
-- Also extends posts table with landing page support

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: keywords - Central Keyword Repository
-- ============================================================================

CREATE TABLE IF NOT EXISTS keywords (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword TEXT NOT NULL,
  keyword_hash TEXT UNIQUE, -- MD5(lowercase(keyword) + location) for deduplication

  -- Source & Context
  source TEXT NOT NULL, -- 'manual' | 'dataforseo_suggestions' | 'dataforseo_ideas' | etc.
  brain_id UUID REFERENCES business_brains(id) ON DELETE CASCADE,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  discovered_by UUID, -- Admin user who found it

  -- Location & Language
  location_code INTEGER NOT NULL DEFAULT 2840, -- DataForSEO location code (2840 = US)
  location_name TEXT DEFAULT 'United States',
  language_code TEXT DEFAULT 'en',

  -- DataForSEO Metrics (from Keyword Overview API)
  search_volume INTEGER,
  cpc NUMERIC(10, 2),
  competition NUMERIC(3, 2), -- 0.00 to 1.00
  competition_level TEXT CHECK (competition_level IN ('Low', 'Medium', 'High')),
  keyword_difficulty INTEGER CHECK (keyword_difficulty >= 0 AND keyword_difficulty <= 100),

  -- Trend Data (from Historical/Trends APIs)
  trend_direction TEXT CHECK (trend_direction IN ('rising', 'stable', 'declining')),
  trend_score NUMERIC(3, 2), -- -1.00 to 1.00
  seasonal BOOLEAN DEFAULT FALSE,
  monthly_volumes JSONB, -- { "2024-01": 1000, "2024-02": 1200, ... }

  -- Intent & Classification
  search_intent TEXT CHECK (search_intent IN (
    'informational', 'commercial', 'transactional', 'navigational'
  )),
  keyword_type TEXT CHECK (keyword_type IN (
    'head', 'body', 'longtail', 'question', 'local'
  )),

  -- Opportunity Scoring
  opportunity_score NUMERIC(5, 2) CHECK (opportunity_score >= 0 AND opportunity_score <= 100),
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',

  -- SERP Features (from SERP API)
  has_featured_snippet BOOLEAN DEFAULT FALSE,
  has_people_also_ask BOOLEAN DEFAULT FALSE,
  has_local_pack BOOLEAN DEFAULT FALSE,
  has_ai_overview BOOLEAN DEFAULT FALSE,
  serp_features JSONB, -- Full SERP feature details

  -- Content Assignment
  assigned_to_landing_page_id UUID, -- Which landing page uses this keyword
  assigned_to_post_id UUID,
  assignment_status TEXT CHECK (assignment_status IN (
    'available', 'assigned', 'published', 'archived'
  )) DEFAULT 'available',

  -- Metadata
  tags TEXT[],
  notes TEXT,
  custom_data JSONB,

  -- DataForSEO Raw Data
  dataforseo_raw JSONB, -- Complete API response for reference

  -- Tracking
  last_refreshed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for keywords table
CREATE INDEX idx_keywords_keyword ON keywords(keyword);
CREATE INDEX idx_keywords_brain_id ON keywords(brain_id);
CREATE INDEX idx_keywords_opportunity_score ON keywords(opportunity_score DESC);
CREATE INDEX idx_keywords_assignment_status ON keywords(assignment_status);
CREATE INDEX idx_keywords_search_volume ON keywords(search_volume DESC);
CREATE INDEX idx_keywords_difficulty ON keywords(keyword_difficulty);
CREATE INDEX idx_keywords_type ON keywords(keyword_type);
CREATE INDEX idx_keywords_intent ON keywords(search_intent);
CREATE INDEX idx_keywords_priority ON keywords(priority);
CREATE INDEX idx_keywords_location ON keywords(location_code);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_keywords_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER keywords_updated_at_trigger
BEFORE UPDATE ON keywords
FOR EACH ROW
EXECUTE FUNCTION update_keywords_updated_at();

-- Function to generate keyword_hash
CREATE OR REPLACE FUNCTION generate_keyword_hash()
RETURNS TRIGGER AS $$
BEGIN
  NEW.keyword_hash = MD5(LOWER(NEW.keyword) || NEW.location_code::TEXT);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER keywords_hash_trigger
BEFORE INSERT OR UPDATE ON keywords
FOR EACH ROW
EXECUTE FUNCTION generate_keyword_hash();

COMMENT ON TABLE keywords IS 'Central repository for all discovered keywords with complete DataForSEO metrics';

-- ============================================================================
-- TABLE 2: keyword_research_runs - Research Session Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS keyword_research_runs (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Context
  brain_id UUID REFERENCES business_brains(id) ON DELETE CASCADE,
  admin_user_id UUID,
  run_type TEXT CHECK (run_type IN (
    'suggestions', 'ideas', 'related', 'site_keywords',
    'top_searches', 'trends', 'manual'
  )),

  -- Input Parameters
  seed_keywords TEXT[],
  location_code INTEGER DEFAULT 2840,
  language_code TEXT DEFAULT 'en',
  filters JSONB, -- User-specified filters

  -- Results
  keywords_discovered INTEGER DEFAULT 0,
  keywords_saved INTEGER DEFAULT 0,
  top_opportunities JSONB, -- Top 10 keywords by opportunity score

  -- DataForSEO Costs
  api_calls_made INTEGER DEFAULT 0,
  api_cost_usd NUMERIC(10, 4),

  -- Performance
  duration_ms INTEGER,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_research_runs_brain ON keyword_research_runs(brain_id);
CREATE INDEX idx_research_runs_created ON keyword_research_runs(created_at DESC);
CREATE INDEX idx_research_runs_type ON keyword_research_runs(run_type);

COMMENT ON TABLE keyword_research_runs IS 'Track each keyword research session for analytics and cost management';

-- ============================================================================
-- TABLE 3: landing_pages_metadata - Landing Page SEO Data
-- ============================================================================

CREATE TABLE IF NOT EXISTS landing_pages_metadata (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL UNIQUE, -- References posts table

  -- Target Keyword
  target_keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL NOT NULL,

  -- Secondary Keywords (up to 5 per page)
  secondary_keyword_ids UUID[],

  -- Page Generation
  generation_method TEXT CHECK (generation_method IN (
    'template', 'ai', 'hybrid', 'manual'
  )),
  generation_template TEXT, -- Which template was used
  ai_model TEXT, -- 'claude-sonnet-4.5-20250929' if AI used
  generation_cost_usd NUMERIC(10, 4),
  generation_duration_ms INTEGER,

  -- Content Quality Scores
  uniqueness_score NUMERIC(3, 2) CHECK (uniqueness_score >= 0 AND uniqueness_score <= 1), -- 0.00 to 1.00
  readability_score INTEGER CHECK (readability_score >= 0 AND readability_score <= 100),
  keyword_density NUMERIC(3, 2) CHECK (keyword_density >= 0), -- Primary keyword density percentage
  content_length_words INTEGER,

  -- SEO Elements
  h1_tag TEXT,
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  schema_markup JSONB, -- FAQ, HowTo, Article schemas
  internal_links TEXT[], -- URLs of internal links added

  -- SERP Tracking
  target_serp_features TEXT[], -- Which SERP features to target
  current_position INTEGER CHECK (current_position >= 1 AND current_position <= 100),
  best_position INTEGER CHECK (best_position >= 1 AND best_position <= 100),
  position_history JSONB, -- { "2025-01-15": 45, "2025-01-22": 38, ... }
  last_rank_check_at TIMESTAMPTZ,

  -- Performance Metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr NUMERIC(5, 4) CHECK (ctr >= 0 AND ctr <= 1), -- Click-through rate
  avg_position NUMERIC(5, 2),

  -- Page Status
  quality_gate_passed BOOLEAN DEFAULT FALSE,
  quality_issues TEXT[], -- Array of issues if quality gate failed
  published_status TEXT CHECK (published_status IN (
    'draft', 'review', 'published', 'archived', 'needs_refresh'
  )) DEFAULT 'draft',

  -- Iteration Tracking
  version INTEGER DEFAULT 1,
  last_refreshed_at TIMESTAMPTZ,
  refresh_reason TEXT, -- Why was page refreshed

  -- Metadata
  notes TEXT,
  custom_data JSONB,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_landing_meta_post ON landing_pages_metadata(post_id);
CREATE INDEX idx_landing_meta_keyword ON landing_pages_metadata(target_keyword_id);
CREATE INDEX idx_landing_meta_position ON landing_pages_metadata(current_position);
CREATE INDEX idx_landing_meta_status ON landing_pages_metadata(published_status);
CREATE INDEX idx_landing_meta_quality ON landing_pages_metadata(quality_gate_passed);

-- Auto-update updated_at
CREATE TRIGGER landing_pages_metadata_updated_at_trigger
BEFORE UPDATE ON landing_pages_metadata
FOR EACH ROW
EXECUTE FUNCTION update_keywords_updated_at();

COMMENT ON TABLE landing_pages_metadata IS 'Extended SEO metadata for landing pages beyond what posts table provides';

-- ============================================================================
-- TABLE 4: landing_page_templates - Content Templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS landing_page_templates (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Template Definition
  template_name TEXT NOT NULL,
  template_slug TEXT UNIQUE NOT NULL,
  description TEXT,

  -- Template Type
  page_type TEXT CHECK (page_type IN (
    'how_to', 'service_location', 'product_category',
    'comparison', 'listicle', 'guide', 'landing'
  )),

  -- Template Structure (JSONB with complete page structure)
  structure JSONB NOT NULL,

  -- Required Variables
  required_variables TEXT[], -- ['keyword', 'industry', 'location', ...]
  optional_variables TEXT[],

  -- AI Enhancement Rules
  ai_enhancement_enabled BOOLEAN DEFAULT TRUE,
  ai_enhancement_sections TEXT[], -- Which sections to enhance with AI
  ai_prompt_template TEXT, -- Prompt for AI enhancement

  -- SEO Configuration
  schema_types TEXT[], -- ['Article', 'FAQPage', 'HowTo']
  target_word_count_min INTEGER DEFAULT 800,
  target_word_count_max INTEGER DEFAULT 2000,
  internal_link_count INTEGER DEFAULT 3,

  -- Quality Gates
  min_uniqueness_score NUMERIC(3, 2) DEFAULT 0.85,
  max_keyword_density NUMERIC(3, 2) DEFAULT 0.03,
  required_headings TEXT[], -- Must have h1, h2, h3, etc.

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,

  -- Metadata
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_slug ON landing_page_templates(template_slug);
CREATE INDEX idx_templates_type ON landing_page_templates(page_type);
CREATE INDEX idx_templates_active ON landing_page_templates(is_active);

-- Auto-update updated_at
CREATE TRIGGER landing_page_templates_updated_at_trigger
BEFORE UPDATE ON landing_page_templates
FOR EACH ROW
EXECUTE FUNCTION update_keywords_updated_at();

COMMENT ON TABLE landing_page_templates IS 'Reusable templates for rapid landing page generation with AI enhancement';

-- ============================================================================
-- TABLE 5: keyword_clusters - Keyword Grouping
-- ============================================================================

CREATE TABLE IF NOT EXISTS keyword_clusters (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Cluster Definition
  cluster_name TEXT NOT NULL,
  cluster_slug TEXT UNIQUE NOT NULL,
  brain_id UUID REFERENCES business_brains(id) ON DELETE CASCADE,

  -- Cluster Analysis
  primary_topic TEXT,
  search_intent TEXT CHECK (search_intent IN (
    'informational', 'commercial', 'transactional', 'navigational'
  )),
  total_search_volume INTEGER DEFAULT 0,
  avg_difficulty NUMERIC(5, 2),

  -- Content Strategy
  content_strategy TEXT,
  recommended_content_types TEXT[], -- ['blog', 'landing_page', 'guide', ...]
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',

  -- Keywords in Cluster
  keyword_ids UUID[], -- Array of keyword IDs
  keyword_count INTEGER DEFAULT 0,

  -- Assignments
  pillar_page_id UUID, -- Main hub page for this cluster
  cluster_pages UUID[], -- All pages targeting this cluster

  -- Metadata
  tags TEXT[],
  notes TEXT,
  custom_data JSONB,

  -- Tracking
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clusters_brain ON keyword_clusters(brain_id);
CREATE INDEX idx_clusters_priority ON keyword_clusters(priority);
CREATE INDEX idx_clusters_slug ON keyword_clusters(cluster_slug);

-- Auto-update updated_at
CREATE TRIGGER keyword_clusters_updated_at_trigger
BEFORE UPDATE ON keyword_clusters
FOR EACH ROW
EXECUTE FUNCTION update_keywords_updated_at();

COMMENT ON TABLE keyword_clusters IS 'Group related keywords for topic cluster SEO strategy';

-- ============================================================================
-- TABLE 6: serp_tracking - SERP Position History
-- ============================================================================

CREATE TABLE IF NOT EXISTS serp_tracking (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- What's being tracked
  keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
  page_id UUID, -- Post ID from posts table
  url TEXT, -- Actual URL being tracked

  -- SERP Data
  position INTEGER CHECK (position >= 1 AND position <= 100),
  serp_features TEXT[], -- Features on page: ['featured_snippet', 'people_also_ask', ...]
  has_our_featured_snippet BOOLEAN DEFAULT FALSE,
  has_our_paa BOOLEAN DEFAULT FALSE,

  -- Competition
  top_10_urls TEXT[], -- URLs ranking in top 10
  competitor_positions JSONB, -- { "competitor.com": 3, "other.com": 7 }

  -- Performance
  estimated_traffic INTEGER, -- Based on CTR curve and volume

  -- DataForSEO Raw
  serp_raw JSONB, -- Complete SERP API response

  -- Tracking
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_serp_keyword ON serp_tracking(keyword_id);
CREATE INDEX idx_serp_page ON serp_tracking(page_id);
CREATE INDEX idx_serp_checked ON serp_tracking(checked_at DESC);
CREATE INDEX idx_serp_position ON serp_tracking(position);
CREATE INDEX idx_serp_keyword_checked ON serp_tracking(keyword_id, checked_at DESC);

COMMENT ON TABLE serp_tracking IS 'Historical SERP position tracking for rank monitoring';

-- ============================================================================
-- EXTEND posts TABLE - Add Landing Page Support
-- ============================================================================

-- Add new columns to posts table if they don't exist
DO $$
BEGIN
  -- content_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'posts' AND column_name = 'content_type') THEN
    ALTER TABLE posts ADD COLUMN content_type TEXT DEFAULT 'blog_post';
  END IF;

  -- is_landing_page flag
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'posts' AND column_name = 'is_landing_page') THEN
    ALTER TABLE posts ADD COLUMN is_landing_page BOOLEAN DEFAULT FALSE;
  END IF;

  -- keyword_data JSONB (full DataForSEO data)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'posts' AND column_name = 'keyword_data') THEN
    ALTER TABLE posts ADD COLUMN keyword_data JSONB;
  END IF;

  -- target_serp_features array
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'posts' AND column_name = 'target_serp_features') THEN
    ALTER TABLE posts ADD COLUMN target_serp_features TEXT[];
  END IF;

  -- internal_link_strategy JSONB
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'posts' AND column_name = 'internal_link_strategy') THEN
    ALTER TABLE posts ADD COLUMN internal_link_strategy JSONB;
  END IF;
END $$;

-- Add check constraint for content_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_content_type'
  ) THEN
    ALTER TABLE posts ADD CONSTRAINT check_content_type
      CHECK (content_type IN ('blog_post', 'landing_page', 'guide', 'pillar', 'resource'));
  END IF;
END $$;

-- Index for landing pages
CREATE INDEX IF NOT EXISTS idx_posts_landing_pages ON posts(is_landing_page) WHERE is_landing_page = TRUE;
CREATE INDEX IF NOT EXISTS idx_posts_content_type ON posts(content_type);

-- ============================================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_research_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE serp_tracking ENABLE ROW LEVEL SECURITY;

-- Service role has full access to all tables
CREATE POLICY "Service role has full access to keywords"
  ON keywords FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to keyword_research_runs"
  ON keyword_research_runs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to landing_pages_metadata"
  ON landing_pages_metadata FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to landing_page_templates"
  ON landing_page_templates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to keyword_clusters"
  ON keyword_clusters FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to serp_tracking"
  ON serp_tracking FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can view their brain's keywords (read-only for now)
CREATE POLICY "Users can view keywords for their brains"
  ON keywords FOR SELECT
  TO authenticated
  USING (
    brain_id IN (
      SELECT id FROM business_brains WHERE created_by = auth.uid()
    )
  );

-- Similar read-only policies for other tables
CREATE POLICY "Users can view their research runs"
  ON keyword_research_runs FOR SELECT
  TO authenticated
  USING (
    brain_id IN (
      SELECT id FROM business_brains WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view their landing pages metadata"
  ON landing_pages_metadata FOR SELECT
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM posts WHERE author_id = auth.uid()
    )
  );

CREATE POLICY "All can view active templates"
  ON landing_page_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can view their keyword clusters"
  ON keyword_clusters FOR SELECT
  TO authenticated
  USING (
    brain_id IN (
      SELECT id FROM business_brains WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view serp tracking for their pages"
  ON serp_tracking FOR SELECT
  TO authenticated
  USING (
    page_id IN (
      SELECT id FROM posts WHERE author_id = auth.uid()
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate opportunity score
CREATE OR REPLACE FUNCTION calculate_opportunity_score(
  p_search_volume INTEGER,
  p_keyword_difficulty INTEGER,
  p_cpc NUMERIC DEFAULT NULL,
  p_trend_score NUMERIC DEFAULT 0
)
RETURNS NUMERIC AS $$
DECLARE
  v_volume_score NUMERIC;
  v_difficulty_score NUMERIC;
  v_cpc_score NUMERIC;
  v_trend_bonus NUMERIC;
  v_final_score NUMERIC;
BEGIN
  -- Volume score (0-40 points): logarithmic scale
  IF p_search_volume IS NULL OR p_search_volume = 0 THEN
    v_volume_score := 0;
  ELSIF p_search_volume < 10 THEN
    v_volume_score := 5;
  ELSIF p_search_volume < 100 THEN
    v_volume_score := 15;
  ELSIF p_search_volume < 1000 THEN
    v_volume_score := 25;
  ELSIF p_search_volume < 10000 THEN
    v_volume_score := 35;
  ELSE
    v_volume_score := 40;
  END IF;

  -- Difficulty score (0-40 points): inverted (lower difficulty = higher score)
  IF p_keyword_difficulty IS NULL THEN
    v_difficulty_score := 20; -- Neutral if unknown
  ELSE
    v_difficulty_score := 40 * (1 - (p_keyword_difficulty::NUMERIC / 100));
  END IF;

  -- CPC score (0-10 points): higher CPC = more commercial value
  IF p_cpc IS NULL OR p_cpc = 0 THEN
    v_cpc_score := 0;
  ELSIF p_cpc < 0.50 THEN
    v_cpc_score := 2;
  ELSIF p_cpc < 1.00 THEN
    v_cpc_score := 4;
  ELSIF p_cpc < 2.00 THEN
    v_cpc_score := 6;
  ELSIF p_cpc < 5.00 THEN
    v_cpc_score := 8;
  ELSE
    v_cpc_score := 10;
  END IF;

  -- Trend bonus (0-10 points): rising trends get bonus
  v_trend_bonus := GREATEST(0, LEAST(10, (p_trend_score + 1) * 5));

  -- Calculate final score (0-100)
  v_final_score := v_volume_score + v_difficulty_score + v_cpc_score + v_trend_bonus;

  RETURN ROUND(v_final_score, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_opportunity_score IS 'Calculate keyword opportunity score (0-100) based on volume, difficulty, CPC, and trend';

-- Function to auto-calculate opportunity score on insert/update
CREATE OR REPLACE FUNCTION auto_calculate_opportunity_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Only calculate if we have the necessary data
  IF NEW.search_volume IS NOT NULL OR NEW.keyword_difficulty IS NOT NULL THEN
    NEW.opportunity_score := calculate_opportunity_score(
      NEW.search_volume,
      NEW.keyword_difficulty,
      NEW.cpc,
      COALESCE(NEW.trend_score, 0)
    );

    -- Auto-assign priority based on opportunity score
    IF NEW.opportunity_score >= 80 THEN
      NEW.priority := 'critical';
    ELSIF NEW.opportunity_score >= 60 THEN
      NEW.priority := 'high';
    ELSIF NEW.opportunity_score >= 40 THEN
      NEW.priority := 'medium';
    ELSE
      NEW.priority := 'low';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER keywords_opportunity_score_trigger
BEFORE INSERT OR UPDATE ON keywords
FOR EACH ROW
EXECUTE FUNCTION auto_calculate_opportunity_score();

-- ============================================================================
-- DEFAULT DATA - Insert Sample Templates
-- ============================================================================

-- Insert default landing page templates
INSERT INTO landing_page_templates (
  template_name,
  template_slug,
  description,
  page_type,
  structure,
  required_variables,
  optional_variables,
  schema_types,
  target_word_count_min,
  target_word_count_max,
  is_active
) VALUES
(
  'How-To Guide',
  'how-to-guide',
  'Step-by-step instructional content optimized for featured snippets and how-to schema',
  'how_to',
  '{
    "sections": [
      {
        "type": "hero",
        "template": "How to {{keyword}} - Complete Guide",
        "variables": ["keyword"]
      },
      {
        "type": "intro",
        "template": "Learn how to {{keyword}} with this comprehensive guide. Whether you are in {{industry}} or just getting started, this guide will walk you through everything you need to know.",
        "variables": ["keyword", "industry"]
      },
      {
        "type": "steps",
        "count": 5,
        "template": "### Step {{step_number}}: {{step_title}}\n\n{{step_description}}"
      },
      {
        "type": "faq",
        "questions": 4
      },
      {
        "type": "cta",
        "template": "Ready to {{keyword}}? Contact {{business_name}} today for expert assistance.",
        "variables": ["keyword", "business_name"]
      }
    ]
  }'::JSONB,
  ARRAY['keyword', 'industry', 'business_name'],
  ARRAY['location', 'author_name'],
  ARRAY['HowTo', 'FAQPage', 'Article'],
  1000,
  2000,
  true
),
(
  'Service + Location',
  'service-location',
  'Local service pages optimized for "service + location" queries',
  'service_location',
  '{
    "sections": [
      {
        "type": "hero",
        "template": "{{service}} in {{location}} - {{business_name}}",
        "variables": ["service", "location", "business_name"]
      },
      {
        "type": "intro",
        "template": "Looking for professional {{service}} in {{location}}? {{business_name}} has been serving {{location}} for {{years_in_business}} years.",
        "variables": ["service", "location", "business_name", "years_in_business"]
      },
      {
        "type": "benefits",
        "count": 4,
        "template": "### {{benefit_title}}\n{{benefit_description}}"
      },
      {
        "type": "service_area_map"
      },
      {
        "type": "testimonials",
        "count": 3
      },
      {
        "type": "cta",
        "template": "Get Your Free {{service}} Quote in {{location}} Today",
        "variables": ["service", "location"]
      }
    ]
  }'::JSONB,
  ARRAY['service', 'location', 'business_name'],
  ARRAY['years_in_business', 'phone', 'email'],
  ARRAY['LocalBusiness', 'Service', 'Article'],
  800,
  1500,
  true
),
(
  'Comparison Guide',
  'comparison-guide',
  'Head-to-head comparison content for "X vs Y" queries',
  'comparison',
  '{
    "sections": [
      {
        "type": "hero",
        "template": "{{option_a}} vs {{option_b}}: Which is Better for {{use_case}}?",
        "variables": ["option_a", "option_b", "use_case"]
      },
      {
        "type": "comparison_table"
      },
      {
        "type": "pros_cons",
        "option": "a"
      },
      {
        "type": "pros_cons",
        "option": "b"
      },
      {
        "type": "verdict",
        "template": "Best for {{use_case}}: Our Recommendation"
      },
      {
        "type": "faq",
        "questions": 3
      }
    ]
  }'::JSONB,
  ARRAY['option_a', 'option_b', 'use_case'],
  ARRAY['industry', 'budget'],
  ARRAY['Article', 'FAQPage'],
  1200,
  2000,
  true
);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON SCHEMA public IS 'SEO Suite Infrastructure - Migration completed 2025-10-16';
