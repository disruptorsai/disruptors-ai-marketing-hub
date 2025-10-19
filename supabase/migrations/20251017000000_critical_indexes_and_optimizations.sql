-- Critical Database Indexes and Optimizations
-- Created: 2025-10-17
-- Purpose: Add missing indexes for performance optimization and enable brain-fact linkage

-- ============================================================================
-- ARRAY CONTAINMENT INDEXES (High Impact)
-- ============================================================================

-- Posts table: tags array queries
CREATE INDEX IF NOT EXISTS idx_posts_tags
ON posts USING GIN(tags);

-- Case studies table: services_provided array queries
CREATE INDEX IF NOT EXISTS idx_case_studies_services
ON case_studies USING GIN(services_provided);

-- Case studies table: technologies_used array queries
CREATE INDEX IF NOT EXISTS idx_case_studies_tech
ON case_studies USING GIN(technologies_used);

-- ============================================================================
-- JSONB INDEXES (High Impact)
-- ============================================================================

-- Leads table: metadata JSONB queries
CREATE INDEX IF NOT EXISTS idx_leads_metadata
ON leads USING GIN(metadata);

-- Module access table: config JSONB queries
CREATE INDEX IF NOT EXISTS idx_module_access_config
ON module_access USING GIN(config);

-- Module runs table: input/output data queries
CREATE INDEX IF NOT EXISTS idx_module_runs_input_data
ON module_runs USING GIN(input_data);

CREATE INDEX IF NOT EXISTS idx_module_runs_output_data
ON module_runs USING GIN(output_data);

-- ============================================================================
-- FULL-TEXT SEARCH INDEXES (Medium Impact)
-- ============================================================================

-- Posts table: full-text search on title + content + excerpt
CREATE INDEX IF NOT EXISTS idx_posts_fts
ON posts USING GIN(
  to_tsvector('english',
    coalesce(title, '') || ' ' ||
    coalesce(content, '') || ' ' ||
    coalesce(excerpt, '')
  )
);

-- Case studies table: full-text search
CREATE INDEX IF NOT EXISTS idx_case_studies_fts
ON case_studies USING GIN(
  to_tsvector('english',
    coalesce(title, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(challenge, '') || ' ' ||
    coalesce(solution, '')
  )
);

-- ============================================================================
-- POSTS-BRAIN FACTS JUNCTION TABLE (Enable Content-Fact Linkage)
-- ============================================================================

-- Create the junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS posts_brain_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  fact_id UUID NOT NULL REFERENCES brain_facts(id) ON DELETE CASCADE,
  relevance_score DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, fact_id)
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_posts_brain_facts_post
ON posts_brain_facts(post_id);

CREATE INDEX IF NOT EXISTS idx_posts_brain_facts_fact
ON posts_brain_facts(fact_id);

CREATE INDEX IF NOT EXISTS idx_posts_brain_facts_relevance
ON posts_brain_facts(relevance_score DESC);

-- Enable RLS
ALTER TABLE posts_brain_facts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can link facts from their own brains to their posts
CREATE POLICY "Users can link facts to their posts"
ON posts_brain_facts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM posts p
    JOIN business_brains bb ON bb.id = (
      SELECT brain_id FROM posts WHERE id = p.id
    )
    WHERE p.id = posts_brain_facts.post_id
    AND (bb.created_by = auth.uid() OR auth.uid() IS NULL)
  )
);

-- Service role has full access
CREATE POLICY "Service role has full access to posts_brain_facts"
ON posts_brain_facts
FOR ALL
USING (auth.role() = 'service_role');

-- ============================================================================
-- BUSINESS BRAIN ENHANCEMENTS
-- ============================================================================

-- Add brain_dna_rules column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_brains'
    AND column_name = 'brand_dna_rules'
  ) THEN
    ALTER TABLE business_brains
    ADD COLUMN brand_dna_rules JSONB DEFAULT NULL;
  END IF;
END $$;

-- Index for brand DNA rules queries
CREATE INDEX IF NOT EXISTS idx_business_brains_brand_dna
ON business_brains USING GIN (brand_dna_rules);

-- Add brain_dna_version column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_brains'
    AND column_name = 'brand_dna_version'
  ) THEN
    ALTER TABLE business_brains
    ADD COLUMN brand_dna_version INTEGER DEFAULT 1;
  END IF;
END $$;

-- ============================================================================
-- ADDITIONAL PERFORMANCE INDEXES
-- ============================================================================

-- Lead captures: email lookups
CREATE INDEX IF NOT EXISTS idx_lead_captures_email
ON lead_captures(email);

-- Lead captures: lead_magnet_slug lookups
CREATE INDEX IF NOT EXISTS idx_lead_captures_slug
ON lead_captures(lead_magnet_slug);

-- Module runs: composite index for user+module queries
CREATE INDEX IF NOT EXISTS idx_module_runs_user_module
ON module_runs(user_id, module_id, created_at DESC);

-- Module runs: brain_id queries
CREATE INDEX IF NOT EXISTS idx_module_runs_brain
ON module_runs(brain_id);

-- Posts: composite index for published posts by date
CREATE INDEX IF NOT EXISTS idx_posts_published_date
ON posts(is_published, published_at DESC)
WHERE is_published = true;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON INDEX idx_posts_tags IS 'GIN index for tag array containment queries';
COMMENT ON INDEX idx_case_studies_services IS 'GIN index for services array containment';
COMMENT ON INDEX idx_case_studies_tech IS 'GIN index for technologies array containment';
COMMENT ON INDEX idx_leads_metadata IS 'GIN index for metadata JSONB queries';
COMMENT ON INDEX idx_module_access_config IS 'GIN index for config JSONB queries';
COMMENT ON INDEX idx_posts_fts IS 'Full-text search index for posts';
COMMENT ON TABLE posts_brain_facts IS 'Junction table linking blog posts to brain facts for content tracking';
COMMENT ON COLUMN business_brains.brand_dna_rules IS 'Cached Brand DNA rules from brand_rules table for performance';
COMMENT ON COLUMN business_brains.brand_dna_version IS 'Version number for Brand DNA cache invalidation';
