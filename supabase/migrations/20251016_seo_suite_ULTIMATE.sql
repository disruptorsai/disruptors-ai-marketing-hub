-- SEO Suite Infrastructure Migration (ULTIMATE SAFE VERSION)
-- This handles ALL constraint conflicts by dropping constraints FIRST

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CRITICAL: DROP ALL CONTENT_TYPE CONSTRAINTS FIRST
-- ============================================================================

DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  -- Drop every single constraint that mentions content_type
  FOR constraint_record IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'posts'::regclass
    AND (conname LIKE '%content_type%' OR conname LIKE '%check_content%')
  LOOP
    EXECUTE 'ALTER TABLE posts DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_record.conname) || ' CASCADE';
    RAISE NOTICE 'Dropped constraint: %', constraint_record.conname;
  END LOOP;
END $$;

-- ============================================================================
-- ADD COLUMNS (IF NOT EXISTS)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'content_type') THEN
    ALTER TABLE posts ADD COLUMN content_type TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'is_landing_page') THEN
    ALTER TABLE posts ADD COLUMN is_landing_page BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'primary_keyword') THEN
    ALTER TABLE posts ADD COLUMN primary_keyword TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'secondary_keywords') THEN
    ALTER TABLE posts ADD COLUMN secondary_keywords JSONB;
  END IF;
END $$;

-- ============================================================================
-- UPDATE DATA (NOW SAFE - NO CONSTRAINTS)
-- ============================================================================

-- Fix all posts to have valid content_type
UPDATE posts SET content_type = 'blog_post' WHERE content_type IS NULL OR content_type = '';
UPDATE posts SET content_type = 'blog_post' WHERE content_type NOT IN ('blog_post', 'landing_page', 'guide', 'pillar', 'resource');
UPDATE posts SET is_landing_page = false WHERE is_landing_page IS NULL;

-- ============================================================================
-- NOW ADD THE CONSTRAINT (DATA IS CLEAN)
-- ============================================================================

ALTER TABLE posts ADD CONSTRAINT check_content_type
  CHECK (content_type IN ('blog_post', 'landing_page', 'guide', 'pillar', 'resource'));

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_posts_content_type ON posts(content_type);
CREATE INDEX IF NOT EXISTS idx_posts_is_landing_page ON posts(is_landing_page) WHERE is_landing_page = true;
CREATE INDEX IF NOT EXISTS idx_posts_primary_keyword ON posts(primary_keyword);

-- ============================================================================
-- CREATE SEO TABLES
-- ============================================================================

-- TABLE: keywords
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
CREATE INDEX IF NOT EXISTS idx_keywords_opportunity_score ON keywords(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_priority ON keywords(priority);
CREATE INDEX IF NOT EXISTS idx_keywords_assignment_status ON keywords(assignment_status);
CREATE INDEX IF NOT EXISTS idx_keywords_search_volume ON keywords(search_volume DESC);

-- TABLE: keyword_research_runs
CREATE TABLE IF NOT EXISTS keyword_research_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seed_keyword TEXT NOT NULL,
  location_code TEXT NOT NULL,
  language TEXT DEFAULT 'English',
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

-- TABLE: landing_pages_metadata
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

-- TABLE: landing_page_templates
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

-- TABLE: keyword_clusters
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

-- TABLE: serp_tracking
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
-- INSERT DEFAULT TEMPLATES
-- ============================================================================

INSERT INTO landing_page_templates (template_name, template_slug, template_description, template_content, template_category, required_variables, optional_variables, variable_descriptions)
VALUES
('How-To Guide', 'how-to-guide', 'Step-by-step instructional guide', '# How to {{keyword}}

Learn {{keyword}} with this comprehensive guide.

## Step-by-Step Instructions
1. First step
2. Second step
3. Third step

## Tips & Best Practices
Expert advice for success.

## FAQ
Common questions answered.

{{#if business_name}}Contact {{business_name}} for help.{{/if}}', 'how-to', '["keyword"]', '["business_name", "difficulty_level"]', '{"keyword": "Target keyword"}'),

('Service + Location', 'service-location', 'Local SEO service page', '# {{keyword}} in {{location}}

Professional {{service}} in {{location}}.

## Why Choose Us
- Local expertise
- Proven results
- Licensed professionals

## Get Started
Contact us for {{service}} in {{location}}!', 'service-location', '["keyword", "service", "location"]', '["state", "business_name"]', '{"keyword": "Target keyword", "service": "Service name", "location": "City name"}'),

('Comparison', 'comparison-vs', 'Product comparison page', '# {{keyword}}: {{product_a}} vs {{product_b}}

Compare {{product_a}} and {{product_b}}.

## Quick Comparison
| Feature | {{product_a}} | {{product_b}} |
|---------|--------------|--------------|
| Price | TBD | TBD |

## Our Recommendation
{{#if winner}}We recommend {{winner}}.{{/if}}', 'comparison', '["keyword", "product_a", "product_b"]', '["winner"]', '{"keyword": "Comparison keyword", "product_a": "First option", "product_b": "Second option"}')
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

DROP POLICY IF EXISTS "Admin access keywords" ON keywords;
DROP POLICY IF EXISTS "Admin access research_runs" ON keyword_research_runs;
DROP POLICY IF EXISTS "Admin access metadata" ON landing_pages_metadata;
DROP POLICY IF EXISTS "Admin access templates" ON landing_page_templates;
DROP POLICY IF EXISTS "Admin access clusters" ON keyword_clusters;
DROP POLICY IF EXISTS "Admin access serp" ON serp_tracking;

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
CREATE TRIGGER update_keywords_updated_at BEFORE UPDATE ON keywords FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_landing_pages_metadata_updated_at ON landing_pages_metadata;
CREATE TRIGGER update_landing_pages_metadata_updated_at BEFORE UPDATE ON landing_pages_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_landing_page_templates_updated_at ON landing_page_templates;
CREATE TRIGGER update_landing_page_templates_updated_at BEFORE UPDATE ON landing_page_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_keyword_clusters_updated_at ON keyword_clusters;
CREATE TRIGGER update_keyword_clusters_updated_at BEFORE UPDATE ON keyword_clusters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SUCCESS!
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '✅ SEO SUITE MIGRATION SUCCESSFUL!';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables Created: 6';
  RAISE NOTICE '  • keywords';
  RAISE NOTICE '  • keyword_research_runs';
  RAISE NOTICE '  • landing_pages_metadata';
  RAISE NOTICE '  • landing_page_templates';
  RAISE NOTICE '  • keyword_clusters';
  RAISE NOTICE '  • serp_tracking';
  RAISE NOTICE '';
  RAISE NOTICE 'Posts Extended: 4 new columns';
  RAISE NOTICE 'Templates: 3 loaded';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT: Add to .env';
  RAISE NOTICE '  DATAFORSEO_LOGIN=your_email';
  RAISE NOTICE '  DATAFORSEO_PASSWORD=your_password';
  RAISE NOTICE '';
  RAISE NOTICE 'Access: /admin/secret/seo-suite';
  RAISE NOTICE '==========================================';
END $$;
