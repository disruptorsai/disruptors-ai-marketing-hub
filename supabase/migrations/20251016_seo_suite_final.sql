-- SEO Suite Infrastructure Migration (FINAL - SAFE VERSION)
-- This version safely handles ALL existing constraints and data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 1: DROP ALL EXISTING CONSTRAINTS THAT MIGHT CONFLICT
-- ============================================================================

DO $$
BEGIN
  -- Drop ANY existing content_type constraints on posts table
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'posts'::regclass
    AND conname LIKE '%content_type%'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE posts DROP CONSTRAINT ' || conname || ';'
      FROM pg_constraint
      WHERE conrelid = 'posts'::regclass
      AND conname LIKE '%content_type%'
    );
    RAISE NOTICE 'Dropped existing content_type constraints';
  END IF;
END $$;

-- ============================================================================
-- STEP 2: ADD NEW COLUMNS TO POSTS (IF NOT EXISTS)
-- ============================================================================

DO $$
BEGIN
  -- Add content_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'content_type'
  ) THEN
    ALTER TABLE posts ADD COLUMN content_type TEXT;
    RAISE NOTICE 'Added content_type column';
  END IF;

  -- Add is_landing_page
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'is_landing_page'
  ) THEN
    ALTER TABLE posts ADD COLUMN is_landing_page BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_landing_page column';
  END IF;

  -- Add primary_keyword
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'primary_keyword'
  ) THEN
    ALTER TABLE posts ADD COLUMN primary_keyword TEXT;
    RAISE NOTICE 'Added primary_keyword column';
  END IF;

  -- Add secondary_keywords
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'secondary_keywords'
  ) THEN
    ALTER TABLE posts ADD COLUMN secondary_keywords JSONB;
    RAISE NOTICE 'Added secondary_keywords column';
  END IF;
END $$;

-- ============================================================================
-- STEP 3: UPDATE EXISTING DATA TO VALID VALUES
-- ============================================================================

-- Set default content_type for all existing posts
UPDATE posts
SET content_type = 'blog_post'
WHERE content_type IS NULL OR content_type = '';

-- Ensure is_landing_page has a value
UPDATE posts
SET is_landing_page = false
WHERE is_landing_page IS NULL;

-- ============================================================================
-- STEP 4: ADD NEW CHECK CONSTRAINT
-- ============================================================================

ALTER TABLE posts
ADD CONSTRAINT check_content_type
CHECK (content_type IN ('blog_post', 'landing_page', 'guide', 'pillar', 'resource'));

-- ============================================================================
-- STEP 5: CREATE INDEXES ON POSTS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_posts_content_type ON posts(content_type);
CREATE INDEX IF NOT EXISTS idx_posts_is_landing_page ON posts(is_landing_page) WHERE is_landing_page = true;
CREATE INDEX IF NOT EXISTS idx_posts_primary_keyword ON posts(primary_keyword);

-- ============================================================================
-- TABLE 1: keywords
-- ============================================================================

CREATE TABLE IF NOT EXISTS keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword TEXT NOT NULL,
  keyword_hash TEXT UNIQUE,

  discovery_source TEXT NOT NULL DEFAULT 'manual',
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
CREATE INDEX IF NOT EXISTS idx_keywords_opportunity_score ON keywords(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_priority ON keywords(priority);
CREATE INDEX IF NOT EXISTS idx_keywords_assignment_status ON keywords(assignment_status);
CREATE INDEX IF NOT EXISTS idx_keywords_search_volume ON keywords(search_volume DESC);

-- ============================================================================
-- TABLE 2: keyword_research_runs
-- ============================================================================

CREATE TABLE IF NOT EXISTS keyword_research_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seed_keyword TEXT NOT NULL,
  location_code TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'English',
  discovery_methods JSONB,
  filters_applied JSONB,
  keywords_discovered INTEGER DEFAULT 0,
  keywords_saved INTEGER DEFAULT 0,
  api_calls_made INTEGER DEFAULT 0,
  total_cost NUMERIC(10, 4) DEFAULT 0,
  run_status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keyword_research_runs_created_at ON keyword_research_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_keyword_research_runs_status ON keyword_research_runs(run_status);

-- ============================================================================
-- TABLE 3: landing_pages_metadata
-- ============================================================================

CREATE TABLE IF NOT EXISTS landing_pages_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
  keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
  target_keyword TEXT NOT NULL,
  template_id UUID,
  template_used TEXT,
  template_variables JSONB,
  generation_method TEXT,
  ai_model_used TEXT,
  business_brain_id UUID,
  uniqueness_score NUMERIC(5, 2),
  keyword_density NUMERIC(5, 2),
  readability_score INTEGER,
  current_rank INTEGER,
  best_rank INTEGER,
  impressions_30d INTEGER DEFAULT 0,
  clicks_30d INTEGER DEFAULT 0,
  ctr_30d NUMERIC(5, 2),
  index_status TEXT DEFAULT 'pending',
  last_indexed_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_landing_pages_metadata_post_id ON landing_pages_metadata(post_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_metadata_keyword_id ON landing_pages_metadata(keyword_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_metadata_uniqueness ON landing_pages_metadata(uniqueness_score DESC);

-- ============================================================================
-- TABLE 4: landing_page_templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS landing_page_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name TEXT NOT NULL,
  template_slug TEXT UNIQUE NOT NULL,
  template_description TEXT,
  template_content TEXT NOT NULL,
  template_category TEXT,
  required_variables JSONB,
  optional_variables JSONB,
  variable_descriptions JSONB,
  usage_count INTEGER DEFAULT 0,
  avg_uniqueness_score NUMERIC(5, 2),
  avg_word_count INTEGER,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_landing_page_templates_slug ON landing_page_templates(template_slug);
CREATE INDEX IF NOT EXISTS idx_landing_page_templates_category ON landing_page_templates(template_category);

-- ============================================================================
-- TABLE 5: keyword_clusters
-- ============================================================================

CREATE TABLE IF NOT EXISTS keyword_clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cluster_name TEXT NOT NULL,
  cluster_slug TEXT UNIQUE NOT NULL,
  primary_keyword TEXT NOT NULL,
  cluster_keywords JSONB NOT NULL,
  total_search_volume INTEGER,
  avg_keyword_difficulty NUMERIC(5, 2),
  cluster_size INTEGER,
  pillar_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  cluster_posts JSONB,
  cluster_status TEXT DEFAULT 'planned',
  completion_percentage NUMERIC(5, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keyword_clusters_slug ON keyword_clusters(cluster_slug);
CREATE INDEX IF NOT EXISTS idx_keyword_clusters_status ON keyword_clusters(cluster_status);

-- ============================================================================
-- TABLE 6: serp_tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS serp_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  current_rank INTEGER,
  previous_rank INTEGER,
  rank_change INTEGER,
  serp_features JSONB,
  has_featured_snippet BOOLEAN DEFAULT false,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr NUMERIC(5, 2),
  tracked_at TIMESTAMPTZ DEFAULT NOW(),
  location_code TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_serp_tracking_post_id ON serp_tracking(post_id);
CREATE INDEX IF NOT EXISTS idx_serp_tracking_keyword ON serp_tracking(keyword);
CREATE INDEX IF NOT EXISTS idx_serp_tracking_tracked_at ON serp_tracking(tracked_at DESC);
CREATE INDEX IF NOT EXISTS idx_serp_tracking_rank ON serp_tracking(current_rank);

-- ============================================================================
-- DEFAULT TEMPLATES
-- ============================================================================

INSERT INTO landing_page_templates (
  template_name, template_slug, template_description, template_content, template_category,
  required_variables, optional_variables, variable_descriptions
) VALUES
(
  'How-To Guide',
  'how-to-guide',
  'Comprehensive step-by-step guide template for instructional content',
  '# How to {{keyword}}

## Introduction

{{#if difficulty_level}}**Difficulty Level:** {{difficulty_level}}{{/if}}
{{#if time_required}}**Time Required:** {{time_required}}{{/if}}

Learn everything you need to know about {{keyword}}. This comprehensive guide will walk you through the entire process step-by-step.

## What You''ll Need
- Prerequisites and tools needed

## Step-by-Step Instructions

### Step 1: Getting Started
Detailed instructions...

### Step 2: Main Process
Continue with detailed steps...

### Step 3: Finishing Up
Final steps and verification...

## Tips and Best Practices
- Pro tips for success
- Common mistakes to avoid

## Frequently Asked Questions

### Q1: Common question?
Detailed answer...

## Conclusion
Summary and next steps.

{{#if business_name}}**Need Expert Help?** Contact {{business_name}} for assistance.{{/if}}',
  'how-to',
  '["keyword"]',
  '["difficulty_level", "time_required", "business_name"]',
  '{"keyword": "Target keyword", "difficulty_level": "Beginner/Intermediate/Advanced", "time_required": "Estimated time", "business_name": "Company name"}'
),
(
  'Service + Location Page',
  'service-location',
  'Local SEO optimized service page',
  '# {{keyword}} in {{location}}

## Professional {{service}} in {{location}}, {{state}}

{{#if business_name}}{{business_name}} provides expert {{service}} throughout {{location}}.{{/if}}

### Why Choose Us?
- Local expertise in {{location}}
- Proven results
- Licensed & insured

## Our Process
Step-by-step service delivery...

## Service Areas
We serve all of {{location}} including surrounding areas.

## Get Started Today
Ready for {{service}} in {{location}}? Contact us!',
  'service-location',
  '["keyword", "service", "location"]',
  '["state", "business_name"]',
  '{"keyword": "Target keyword with location", "service": "Service name", "location": "City/region", "state": "State name", "business_name": "Company name"}'
),
(
  'Comparison / VS Page',
  'comparison-vs',
  'Product/service comparison template',
  '# {{keyword}}: {{product_a}} vs {{product_b}}

## Quick Comparison

| Feature | {{product_a}} | {{product_b}} |
|---------|--------------|--------------|
| Price | [A] | [B] |
| Best For | [A Use] | [B Use] |

## {{product_a}} Overview
Features, pros, and cons...

## {{product_b}} Overview
Features, pros, and cons...

## Which Should You Choose?
Recommendations based on use case...

{{#if winner}}## Our Recommendation: {{winner}}{{/if}}',
  'comparison',
  '["keyword", "product_a", "product_b"]',
  '["winner", "business_name"]',
  '{"keyword": "Comparison keyword", "product_a": "First option", "product_b": "Second option", "winner": "Recommended choice"}'
)
ON CONFLICT (template_slug) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_research_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE serp_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access keywords" ON keywords FOR ALL USING (true);
CREATE POLICY "Admin access research_runs" ON keyword_research_runs FOR ALL USING (true);
CREATE POLICY "Admin access metadata" ON landing_pages_metadata FOR ALL USING (true);
CREATE POLICY "Admin access templates" ON landing_page_templates FOR ALL USING (true);
CREATE POLICY "Admin access clusters" ON keyword_clusters FOR ALL USING (true);
CREATE POLICY "Admin access serp" ON serp_tracking FOR ALL USING (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_keywords_updated_at ON keywords;
CREATE TRIGGER update_keywords_updated_at
  BEFORE UPDATE ON keywords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_landing_pages_metadata_updated_at ON landing_pages_metadata;
CREATE TRIGGER update_landing_pages_metadata_updated_at
  BEFORE UPDATE ON landing_pages_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_landing_page_templates_updated_at ON landing_page_templates;
CREATE TRIGGER update_landing_page_templates_updated_at
  BEFORE UPDATE ON landing_page_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_keyword_clusters_updated_at ON keyword_clusters;
CREATE TRIGGER update_keyword_clusters_updated_at
  BEFORE UPDATE ON keyword_clusters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SEO SUITE MIGRATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables Created:';
  RAISE NOTICE '  ✓ keywords';
  RAISE NOTICE '  ✓ keyword_research_runs';
  RAISE NOTICE '  ✓ landing_pages_metadata';
  RAISE NOTICE '  ✓ landing_page_templates';
  RAISE NOTICE '  ✓ keyword_clusters';
  RAISE NOTICE '  ✓ serp_tracking';
  RAISE NOTICE '';
  RAISE NOTICE 'Posts Table Extended:';
  RAISE NOTICE '  ✓ content_type';
  RAISE NOTICE '  ✓ is_landing_page';
  RAISE NOTICE '  ✓ primary_keyword';
  RAISE NOTICE '  ✓ secondary_keywords';
  RAISE NOTICE '';
  RAISE NOTICE 'Default Templates: 3 loaded';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Add to .env:';
  RAISE NOTICE '   DATAFORSEO_LOGIN=your_email';
  RAISE NOTICE '   DATAFORSEO_PASSWORD=your_password';
  RAISE NOTICE '2. Access: /admin/secret/seo-suite';
  RAISE NOTICE '3. Start generating landing pages!';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
