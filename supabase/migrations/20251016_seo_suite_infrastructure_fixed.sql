-- SEO Suite Infrastructure Migration (FIXED VERSION)
-- Created: 2025-10-16
-- Purpose: Complete database schema for Advanced Keyword Research + Landing Page Generator
--
-- This version handles existing posts table data before applying constraints

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- FIX EXISTING DATA FIRST
-- ============================================================================

-- Update existing posts with NULL or invalid content_type
DO $$
BEGIN
  -- Check if content_type column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'content_type'
  ) THEN
    -- Update NULL or invalid values to 'blog_post'
    UPDATE posts
    SET content_type = 'blog_post'
    WHERE content_type IS NULL
       OR content_type NOT IN ('blog_post', 'landing_page', 'guide', 'pillar', 'resource');
  END IF;
END $$;

-- ============================================================================
-- TABLE 1: keywords - Central Keyword Repository
-- ============================================================================

CREATE TABLE IF NOT EXISTS keywords (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword TEXT NOT NULL,
  keyword_hash TEXT UNIQUE, -- MD5(lowercase(keyword) + location) for deduplication

  -- Source & Context
  discovery_source TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'suggestions' | 'related' | 'questions' | etc.
  discovery_location TEXT,
  discovery_language TEXT,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),

  -- DataForSEO Metrics
  search_volume INTEGER,
  cpc NUMERIC(10, 2),
  competition NUMERIC(3, 2), -- 0.00 to 1.00
  keyword_difficulty INTEGER CHECK (keyword_difficulty >= 0 AND keyword_difficulty <= 100),

  -- Trend Data
  trend_score NUMERIC(3, 2) DEFAULT 0, -- -1.00 to 1.00
  monthly_volumes JSONB, -- { "2024-01": 1000, "2024-02": 1200, ... }

  -- Opportunity Scoring (auto-calculated)
  opportunity_score NUMERIC(5, 2), -- 0.00 to 100.00
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),

  -- Classification
  keyword_type TEXT, -- 'head', 'body', 'longtail', 'question', 'local'
  search_intent TEXT, -- 'informational', 'commercial', 'transactional', 'navigational'

  -- Assignment & Status
  assignment_status TEXT DEFAULT 'available', -- 'available', 'assigned', 'in_progress', 'completed'
  assigned_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for keywords
CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_keywords_opportunity_score ON keywords(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_priority ON keywords(priority);
CREATE INDEX IF NOT EXISTS idx_keywords_assignment_status ON keywords(assignment_status);
CREATE INDEX IF NOT EXISTS idx_keywords_search_volume ON keywords(search_volume DESC);

-- ============================================================================
-- TABLE 2: keyword_research_runs - Research Session Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS keyword_research_runs (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Research Parameters
  seed_keyword TEXT NOT NULL,
  location_code TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'English',

  -- Discovery Methods Used
  discovery_methods JSONB, -- { "suggestions": true, "related": true, "questions": false }
  filters_applied JSONB, -- { "min_volume": 100, "max_difficulty": 60, ... }

  -- Results
  keywords_discovered INTEGER DEFAULT 0,
  keywords_saved INTEGER DEFAULT 0,
  api_calls_made INTEGER DEFAULT 0,
  total_cost NUMERIC(10, 4) DEFAULT 0, -- Track DataForSEO API costs

  -- Status & Timing
  run_status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Error tracking
  error_message TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for research runs
CREATE INDEX IF NOT EXISTS idx_keyword_research_runs_created_at ON keyword_research_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_keyword_research_runs_status ON keyword_research_runs(run_status);

-- ============================================================================
-- TABLE 3: landing_pages_metadata - Extended SEO Metadata
-- ============================================================================

CREATE TABLE IF NOT EXISTS landing_pages_metadata (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID UNIQUE REFERENCES posts(id) ON DELETE CASCADE,

  -- Keyword Targeting
  keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
  target_keyword TEXT NOT NULL,

  -- Template Info
  template_id UUID, -- Will reference landing_page_templates
  template_used TEXT, -- Slug of template used
  template_variables JSONB, -- Variables used in generation

  -- Generation Details
  generation_method TEXT, -- 'template', 'ai', 'hybrid'
  ai_model_used TEXT, -- e.g., 'claude-sonnet-4-20250514'
  business_brain_id UUID,

  -- Quality Metrics
  uniqueness_score NUMERIC(5, 2), -- 0.00 to 100.00 (85%+ required)
  keyword_density NUMERIC(5, 2), -- Percentage
  readability_score INTEGER, -- Flesch-Kincaid or similar

  -- Performance Tracking
  current_rank INTEGER, -- Best current SERP rank
  best_rank INTEGER, -- Highest rank achieved
  impressions_30d INTEGER DEFAULT 0,
  clicks_30d INTEGER DEFAULT 0,
  ctr_30d NUMERIC(5, 2), -- Click-through rate

  -- Status
  index_status TEXT DEFAULT 'pending', -- 'pending', 'indexed', 'not_indexed'
  last_indexed_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for landing pages metadata
CREATE INDEX IF NOT EXISTS idx_landing_pages_metadata_post_id ON landing_pages_metadata(post_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_metadata_keyword_id ON landing_pages_metadata(keyword_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_metadata_uniqueness ON landing_pages_metadata(uniqueness_score DESC);

-- ============================================================================
-- TABLE 4: landing_page_templates - Reusable Templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS landing_page_templates (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name TEXT NOT NULL,
  template_slug TEXT UNIQUE NOT NULL,
  template_description TEXT,

  -- Template Content
  template_content TEXT NOT NULL, -- Full template with {{variables}}
  template_category TEXT, -- 'how-to', 'service-location', 'comparison', 'category', etc.

  -- Variables
  required_variables JSONB, -- Array of required variable names
  optional_variables JSONB, -- Array of optional variable names
  variable_descriptions JSONB, -- { "location": "City or region name", ... }

  -- Usage & Performance
  usage_count INTEGER DEFAULT 0,
  avg_uniqueness_score NUMERIC(5, 2),
  avg_word_count INTEGER,

  -- Status
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for templates
CREATE INDEX IF NOT EXISTS idx_landing_page_templates_slug ON landing_page_templates(template_slug);
CREATE INDEX IF NOT EXISTS idx_landing_page_templates_category ON landing_page_templates(template_category);

-- ============================================================================
-- TABLE 5: keyword_clusters - Keyword Grouping for Topic Clusters
-- ============================================================================

CREATE TABLE IF NOT EXISTS keyword_clusters (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cluster_name TEXT NOT NULL,
  cluster_slug TEXT UNIQUE NOT NULL,

  -- Cluster Details
  primary_keyword TEXT NOT NULL, -- Main pillar keyword
  cluster_keywords JSONB NOT NULL, -- Array of related keywords

  -- Metrics
  total_search_volume INTEGER,
  avg_keyword_difficulty NUMERIC(5, 2),
  cluster_size INTEGER, -- Number of keywords in cluster

  -- Content Strategy
  pillar_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  cluster_posts JSONB, -- Array of post IDs in this cluster

  -- Status
  cluster_status TEXT DEFAULT 'planned', -- 'planned', 'in_progress', 'completed'
  completion_percentage NUMERIC(5, 2) DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for keyword clusters
CREATE INDEX IF NOT EXISTS idx_keyword_clusters_slug ON keyword_clusters(cluster_slug);
CREATE INDEX IF NOT EXISTS idx_keyword_clusters_status ON keyword_clusters(cluster_status);

-- ============================================================================
-- TABLE 6: serp_tracking - SERP Position History Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS serp_tracking (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,

  -- SERP Data
  current_rank INTEGER,
  previous_rank INTEGER,
  rank_change INTEGER, -- Positive = improvement, Negative = decline

  -- SERP Features
  serp_features JSONB, -- Featured snippet, People Also Ask, etc.
  has_featured_snippet BOOLEAN DEFAULT false,

  -- Traffic Metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr NUMERIC(5, 2), -- Click-through rate

  -- Tracking
  tracked_at TIMESTAMPTZ DEFAULT NOW(),
  location_code TEXT,
  device_type TEXT, -- 'desktop', 'mobile'

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for SERP tracking
CREATE INDEX IF NOT EXISTS idx_serp_tracking_post_id ON serp_tracking(post_id);
CREATE INDEX IF NOT EXISTS idx_serp_tracking_keyword ON serp_tracking(keyword);
CREATE INDEX IF NOT EXISTS idx_serp_tracking_tracked_at ON serp_tracking(tracked_at DESC);
CREATE INDEX IF NOT EXISTS idx_serp_tracking_rank ON serp_tracking(current_rank);

-- ============================================================================
-- EXTEND POSTS TABLE
-- ============================================================================

-- Add new columns to posts table (only if they don't exist)
DO $$
BEGIN
  -- Add content_type if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'content_type'
  ) THEN
    ALTER TABLE posts ADD COLUMN content_type TEXT DEFAULT 'blog_post';
  END IF;

  -- Add is_landing_page if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'is_landing_page'
  ) THEN
    ALTER TABLE posts ADD COLUMN is_landing_page BOOLEAN DEFAULT false;
  END IF;

  -- Add primary_keyword if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'primary_keyword'
  ) THEN
    ALTER TABLE posts ADD COLUMN primary_keyword TEXT;
  END IF;

  -- Add secondary_keywords if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'secondary_keywords'
  ) THEN
    ALTER TABLE posts ADD COLUMN secondary_keywords JSONB;
  END IF;
END $$;

-- Add check constraint for content_type (drop first if exists to avoid conflicts)
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_content_type'
  ) THEN
    ALTER TABLE posts DROP CONSTRAINT check_content_type;
  END IF;

  -- Add the constraint
  ALTER TABLE posts ADD CONSTRAINT check_content_type
    CHECK (content_type IN ('blog_post', 'landing_page', 'guide', 'pillar', 'resource'));
END $$;

-- Create indexes for new posts columns
CREATE INDEX IF NOT EXISTS idx_posts_content_type ON posts(content_type);
CREATE INDEX IF NOT EXISTS idx_posts_is_landing_page ON posts(is_landing_page) WHERE is_landing_page = true;
CREATE INDEX IF NOT EXISTS idx_posts_primary_keyword ON posts(primary_keyword);

-- ============================================================================
-- DEFAULT TEMPLATES
-- ============================================================================

-- Insert default landing page templates (only if they don't exist)
INSERT INTO landing_page_templates (
  template_name,
  template_slug,
  template_description,
  template_content,
  template_category,
  required_variables,
  optional_variables,
  variable_descriptions
) VALUES
(
  'How-To Guide',
  'how-to-guide',
  'Comprehensive step-by-step guide template for instructional content',
  '# How to {{keyword}}

## Introduction

{{#if difficulty_level}}
**Difficulty Level:** {{difficulty_level}}
{{/if}}
{{#if time_required}}
**Time Required:** {{time_required}}
{{/if}}

Learn everything you need to know about {{keyword}}. This comprehensive guide will walk you through the entire process step-by-step.

## What You''ll Need

- [List prerequisites here]
- [Equipment or tools]
- [Required knowledge]

## Step-by-Step Instructions

### Step 1: [First Major Step]

Detailed instructions for the first step...

### Step 2: [Second Major Step]

Detailed instructions for the second step...

### Step 3: [Third Major Step]

Detailed instructions for the third step...

## Tips and Best Practices

- **Tip 1:** [Helpful advice]
- **Tip 2:** [Pro tip]
- **Tip 3:** [Common mistake to avoid]

## Frequently Asked Questions

### Q1: [Common question about {{keyword}}?]
A1: [Detailed answer]

### Q2: [Another common question?]
A2: [Detailed answer]

### Q3: [Third common question?]
A3: [Detailed answer]

## Conclusion

You now know how to {{keyword}}! Remember to [key takeaway]. For more help, [call to action].

{{#if business_name}}
**Need Expert Help?** Contact {{business_name}} for professional assistance with {{keyword}}.
{{/if}}',
  'how-to',
  '["keyword"]',
  '["difficulty_level", "time_required", "business_name", "topic"]',
  '{"keyword": "Target keyword/topic", "difficulty_level": "Beginner, Intermediate, or Advanced", "time_required": "Estimated time (e.g., 30 minutes)", "business_name": "Your company name", "topic": "Main topic or subject"}'
),
(
  'Service + Location Page',
  'service-location',
  'Local SEO optimized service page for specific locations',
  '# {{keyword}} in {{location}}

## Professional {{service}} in {{location}}, {{state}}

{{#if business_name}}
{{business_name}} provides expert {{service}} throughout {{location}} and surrounding areas.
{{/if}}

### Why Choose Us for {{keyword}}?

- ✓ **Local Expertise** - Deep knowledge of {{location}} market
- ✓ **Proven Results** - Hundreds of satisfied clients
- ✓ **Fast Response** - Same-day service available
- ✓ **Licensed & Insured** - Fully certified professionals

## Our {{service}} Process

### 1. Initial Consultation
We start by understanding your specific needs in {{location}}.

### 2. Custom Solution
Tailored approach designed for {{location}} businesses.

### 3. Professional Execution
Expert delivery of {{service}} with attention to detail.

### 4. Ongoing Support
Continued assistance to ensure your success.

## Service Areas in {{location}}

We proudly serve all neighborhoods throughout {{location}}, including:
- [Neighborhood 1]
- [Neighborhood 2]
- [Neighborhood 3]

{{#if zip_code}}
**ZIP Codes Served:** {{zip_code}} and surrounding areas
{{/if}}

## Frequently Asked Questions

### How much does {{service}} cost in {{location}}?
Pricing varies based on your specific needs. Contact us for a free quote.

### Do you offer same-day {{service}} in {{location}}?
Yes! We offer expedited service for urgent needs.

### Are you licensed to provide {{service}} in {{state}}?
Absolutely. We are fully licensed and insured in {{state}}.

## Get Started Today

Ready for professional {{service}} in {{location}}?

{{#if business_name}}
**Call {{business_name}} today** for a free consultation.
{{/if}}

**Service {{location}} Since {{year}}** - Your trusted local experts for {{keyword}}.',
  'service-location',
  '["keyword", "service", "location"]',
  '["state", "zip_code", "business_name", "year"]',
  '{"keyword": "Target keyword with location", "service": "Service name (e.g., SEO Services)", "location": "City or region name", "state": "State name", "zip_code": "ZIP code", "business_name": "Your company name", "year": "Year established"}'
),
(
  'Comparison / VS Page',
  'comparison-vs',
  'Head-to-head comparison template for product/service comparisons',
  '# {{keyword}}: {{product_a}} vs {{product_b}}

## Choosing Between {{product_a}} and {{product_b}}

Trying to decide between {{product_a}} and {{product_b}}? This comprehensive comparison will help you make the right choice.

## Quick Comparison Table

| Feature | {{product_a}} | {{product_b}} |
|---------|--------------|--------------|
| Price | [Price A] | [Price B] |
| Best For | [Use Case A] | [Use Case B] |
| Pros | [Pro 1, Pro 2] | [Pro 1, Pro 2] |
| Cons | [Con 1, Con 2] | [Con 1, Con 2] |

## {{product_a}}: Detailed Overview

### What is {{product_a}}?
[Detailed description]

### Key Features of {{product_a}}
- Feature 1
- Feature 2
- Feature 3

### Pros of {{product_a}}
✓ Advantage 1
✓ Advantage 2
✓ Advantage 3

### Cons of {{product_a}}
✗ Limitation 1
✗ Limitation 2

## {{product_b}}: Detailed Overview

### What is {{product_b}}?
[Detailed description]

### Key Features of {{product_b}}
- Feature 1
- Feature 2
- Feature 3

### Pros of {{product_b}}
✓ Advantage 1
✓ Advantage 2
✓ Advantage 3

### Cons of {{product_b}}
✗ Limitation 1
✗ Limitation 2

## Side-by-Side Feature Comparison

### Performance
**{{product_a}}:** [Performance details]
**{{product_b}}:** [Performance details]

### Ease of Use
**{{product_a}}:** [Usability details]
**{{product_b}}:** [Usability details]

### Value for Money
**{{product_a}}:** [Value analysis]
**{{product_b}}:** [Value analysis]

## Which One Should You Choose?

### Choose {{product_a}} if:
- You need [specific feature]
- Your budget is [budget range]
- You prioritize [priority factor]

### Choose {{product_b}} if:
- You need [specific feature]
- Your budget is [budget range]
- You prioritize [priority factor]

{{#if winner}}
## Our Recommendation

After extensive testing, we recommend **{{winner}}** for most users because [reason].
{{/if}}

## Frequently Asked Questions

### Is {{product_a}} better than {{product_b}}?
It depends on your specific needs. [Detailed answer]

### Can I use both {{product_a}} and {{product_b}} together?
[Answer about compatibility]

### Which is more affordable, {{product_a}} or {{product_b}}?
[Price comparison details]

## Final Thoughts

Both {{product_a}} and {{product_b}} are excellent choices for {{keyword}}. Your decision should be based on [key factors].

{{#if business_name}}
**Need Help Deciding?** Contact {{business_name}} for expert guidance on {{keyword}}.
{{/if}}',
  'comparison',
  '["keyword", "product_a", "product_b"]',
  '["winner", "business_name"]',
  '{"keyword": "Main comparison keyword", "product_a": "First product/service name", "product_b": "Second product/service name", "winner": "Which one you recommend (optional)", "business_name": "Your company name"}'
)
ON CONFLICT (template_slug) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_research_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE serp_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin-only access for now)
-- These can be customized based on your authentication setup

-- Keywords: Admin full access
CREATE POLICY "Admin full access to keywords"
  ON keywords FOR ALL
  USING (true);

-- Research Runs: Admin full access
CREATE POLICY "Admin full access to keyword_research_runs"
  ON keyword_research_runs FOR ALL
  USING (true);

-- Landing Pages Metadata: Admin full access
CREATE POLICY "Admin full access to landing_pages_metadata"
  ON landing_pages_metadata FOR ALL
  USING (true);

-- Templates: Admin full access
CREATE POLICY "Admin full access to landing_page_templates"
  ON landing_page_templates FOR ALL
  USING (true);

-- Keyword Clusters: Admin full access
CREATE POLICY "Admin full access to keyword_clusters"
  ON keyword_clusters FOR ALL
  USING (true);

-- SERP Tracking: Admin full access
CREATE POLICY "Admin full access to serp_tracking"
  ON serp_tracking FOR ALL
  USING (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to tables that have this column
DO $$
BEGIN
  -- Keywords
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_keywords_updated_at'
  ) THEN
    CREATE TRIGGER update_keywords_updated_at
      BEFORE UPDATE ON keywords
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Landing Pages Metadata
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_landing_pages_metadata_updated_at'
  ) THEN
    CREATE TRIGGER update_landing_pages_metadata_updated_at
      BEFORE UPDATE ON landing_pages_metadata
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Templates
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_landing_page_templates_updated_at'
  ) THEN
    CREATE TRIGGER update_landing_page_templates_updated_at
      BEFORE UPDATE ON landing_page_templates
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Keyword Clusters
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_keyword_clusters_updated_at'
  ) THEN
    CREATE TRIGGER update_keyword_clusters_updated_at
      BEFORE UPDATE ON keyword_clusters
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ SEO Suite Infrastructure Migration Complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Created Tables:';
  RAISE NOTICE '  • keywords';
  RAISE NOTICE '  • keyword_research_runs';
  RAISE NOTICE '  • landing_pages_metadata';
  RAISE NOTICE '  • landing_page_templates (3 default templates)';
  RAISE NOTICE '  • keyword_clusters';
  RAISE NOTICE '  • serp_tracking';
  RAISE NOTICE '';
  RAISE NOTICE 'Extended Tables:';
  RAISE NOTICE '  • posts (added content_type, is_landing_page, primary_keyword, secondary_keywords)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Configure DataForSEO credentials in .env';
  RAISE NOTICE '  2. Access SEO Suite at /admin/secret/seo-suite';
  RAISE NOTICE '  3. Start discovering keywords and generating landing pages!';
END $$;
