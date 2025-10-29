-- ============================================================================
-- NEXT-GEN BLOG SYSTEM - FOUNDATION MIGRATION
-- ============================================================================
-- This migration creates the complete database infrastructure for the
-- Google-compliant, AI-powered blog writing system with:
-- - Universal Content Mode (internal knowledge, tools, news)
-- - Enhanced Business Brain integration
-- - Multi-QA pipeline tracking
-- - Publishing automation with safety gates
-- - Post-publish monitoring
-- ============================================================================

-- ============================================================================
-- 1. UNIVERSAL CONTENT MODE - INTERNAL KNOWLEDGE
-- ============================================================================

-- Internal Knowledge Base (current work, roadmap, methodologies)
CREATE TABLE IF NOT EXISTS internal_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'current_work', 'roadmap', 'case_study', 'methodology',
    'tutorial', 'best_practice', 'lesson_learned'
  )),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
    'active', 'draft', 'deprecated', 'archived'
  )),
  tags TEXT[] DEFAULT '{}',
  embedding VECTOR(1536),
  confidence_score DECIMAL(3,2) DEFAULT 1.0 CHECK (confidence_score BETWEEN 0 AND 1),
  source_type VARCHAR(50) CHECK (source_type IN (
    'manual', 'git_commit', 'documentation', 'meeting_notes', 'client_feedback'
  )),
  source_reference TEXT,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', title || ' ' || content)
  ) STORED
);

-- Indexes for internal knowledge
CREATE INDEX IF NOT EXISTS idx_internal_knowledge_category ON internal_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_internal_knowledge_status ON internal_knowledge(status);
CREATE INDEX IF NOT EXISTS idx_internal_knowledge_tags ON internal_knowledge USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_internal_knowledge_embedding ON internal_knowledge
  USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_internal_knowledge_search ON internal_knowledge USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_internal_knowledge_updated ON internal_knowledge(last_updated DESC);

-- Case Studies Database
CREATE TABLE IF NOT EXISTS case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name VARCHAR(200),
  industry VARCHAR(100),
  challenge TEXT NOT NULL,
  solution TEXT NOT NULL,
  results JSONB NOT NULL DEFAULT '{}', -- { "metric": "value", "improvement": "%" }
  tools_used TEXT[] DEFAULT '{}',
  methodology TEXT,
  timeline_months INTEGER,
  publishable BOOLEAN DEFAULT false,
  anonymized BOOLEAN DEFAULT false,
  anonymized_name VARCHAR(200),
  embedding VECTOR(1536),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_case_studies_industry ON case_studies(industry);
CREATE INDEX IF NOT EXISTS idx_case_studies_publishable ON case_studies(publishable) WHERE publishable = true;
CREATE INDEX IF NOT EXISTS idx_case_studies_embedding ON case_studies
  USING ivfflat (embedding vector_cosine_ops);

-- Methodologies (Vibe Marketing, etc.)
CREATE TABLE IF NOT EXISTS methodologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) UNIQUE NOT NULL,
  short_description TEXT,
  full_description TEXT NOT NULL,
  core_principles TEXT[] DEFAULT '{}',
  step_by_step_process JSONB DEFAULT '[]', -- [{ "step": 1, "title": "...", "description": "..." }]
  use_cases TEXT[] DEFAULT '{}',
  examples JSONB DEFAULT '[]',
  embedding VECTOR(1536),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_methodologies_name ON methodologies(name);
CREATE INDEX IF NOT EXISTS idx_methodologies_embedding ON methodologies
  USING ivfflat (embedding vector_cosine_ops);

-- ============================================================================
-- 2. AI MARKETING TOOLS ECOSYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_marketing_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  description TEXT,
  url TEXT,
  pricing JSONB DEFAULT '{}', -- { "model": "freemium|subscription|one-time", "tiers": [...] }
  features TEXT[] DEFAULT '{}',
  our_rating INTEGER CHECK (our_rating BETWEEN 1 AND 5),
  our_experience TEXT,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  alternatives UUID[] DEFAULT '{}', -- References to other tools
  integrations TEXT[] DEFAULT '{}',
  trend_score DECIMAL(3,2) DEFAULT 0 CHECK (trend_score BETWEEN 0 AND 1),
  popularity_score INTEGER DEFAULT 0,
  last_reviewed TIMESTAMP,
  discovered_at TIMESTAMP DEFAULT NOW(),
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', name || ' ' || COALESCE(description, ''))
  ) STORED
);

CREATE INDEX IF NOT EXISTS idx_tools_category ON ai_marketing_tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_rating ON ai_marketing_tools(our_rating DESC);
CREATE INDEX IF NOT EXISTS idx_tools_trend ON ai_marketing_tools(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_tools_embedding ON ai_marketing_tools
  USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_tools_search ON ai_marketing_tools USING GIN(search_vector);

-- ============================================================================
-- 3. REAL-TIME NEWS & TRENDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  url TEXT UNIQUE NOT NULL,
  published_at TIMESTAMP NOT NULL,
  author VARCHAR(200),
  summary TEXT,
  full_content TEXT,
  relevance_score DECIMAL(3,2) DEFAULT 0 CHECK (relevance_score BETWEEN 0 AND 1),
  topics TEXT[] DEFAULT '{}',
  entities JSONB DEFAULT '[]', -- Extracted entities (companies, people, technologies)
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  embedding VECTOR(1536),
  used_in_articles UUID[] DEFAULT '{}', -- References to blog articles that cited this
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_news_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_relevance ON news_articles(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_news_topics ON news_articles USING GIN(topics);
CREATE INDEX IF NOT EXISTS idx_news_embedding ON news_articles
  USING ivfflat (embedding vector_cosine_ops);
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_url ON news_articles(url);

-- Trending Topics Tracking
CREATE TABLE IF NOT EXISTS trending_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  trend_velocity DECIMAL(5,2) DEFAULT 0, -- Rate of growth
  current_volume INTEGER DEFAULT 0,
  peak_volume INTEGER DEFAULT 0,
  first_detected TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'rising' CHECK (status IN (
    'rising', 'peak', 'declining', 'stable', 'dead'
  )),
  related_news_count INTEGER DEFAULT 0,
  related_tools UUID[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  UNIQUE(topic, category)
);

CREATE INDEX IF NOT EXISTS idx_trending_velocity ON trending_topics(trend_velocity DESC);
CREATE INDEX IF NOT EXISTS idx_trending_status ON trending_topics(status);
CREATE INDEX IF NOT EXISTS idx_trending_updated ON trending_topics(last_updated DESC);

-- ============================================================================
-- 4. BLOG CONTENT PIPELINE
-- ============================================================================

-- Content Ideas Queue
CREATE TABLE IF NOT EXISTS content_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  target_audience VARCHAR(100),
  content_type VARCHAR(50) CHECK (content_type IN (
    'how-to', 'guide', 'news', 'opinion', 'case-study',
    'tool-review', 'comparison', 'tutorial', 'trend-analysis'
  )),
  source_type VARCHAR(50) CHECK (source_type IN (
    'internal_work', 'trending_topic', 'news_event', 'tool_discovery',
    'case_study', 'methodology', 'manual', 'ai_generated'
  )),
  source_references JSONB DEFAULT '[]', -- Array of { "type": "news|tool|case_study", "id": "uuid" }
  priority INTEGER DEFAULT 0 CHECK (priority BETWEEN 0 AND 100),
  estimated_traffic INTEGER DEFAULT 0,
  keyword_difficulty INTEGER CHECK (keyword_difficulty BETWEEN 0 AND 100),
  search_volume INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'in_progress', 'completed', 'rejected', 'archived'
  )),
  assigned_to UUID, -- Future: assign to specific writers
  target_publish_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_ideas_status ON content_ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_priority ON content_ideas(priority DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_type ON content_ideas(content_type);
CREATE INDEX IF NOT EXISTS idx_ideas_source ON content_ideas(source_type);

-- Blog Drafts (in-progress articles)
CREATE TABLE IF NOT EXISTS blog_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES content_ideas(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE,
  content TEXT,
  excerpt TEXT,
  target_keyword VARCHAR(200),
  secondary_keywords TEXT[] DEFAULT '{}',
  outline JSONB DEFAULT '[]', -- [{ "heading": "...", "subheadings": [...] }]

  -- Context Sources
  business_brain_context JSONB DEFAULT '{}',
  internal_knowledge_refs UUID[] DEFAULT '{}',
  case_study_refs UUID[] DEFAULT '{}',
  methodology_refs UUID[] DEFAULT '{}',
  tool_refs UUID[] DEFAULT '{}',
  news_refs UUID[] DEFAULT '{}',

  -- Generation Metadata
  generation_model VARCHAR(50),
  generation_params JSONB DEFAULT '{}',

  -- Pipeline Status
  pipeline_stage VARCHAR(50) DEFAULT 'planning' CHECK (pipeline_stage IN (
    'planning', 'drafting', 'qa_fact_check', 'qa_grammar',
    'qa_toxicity', 'qa_plagiarism', 'ready_to_publish', 'published', 'failed'
  )),

  -- QA Results
  qa_results JSONB DEFAULT '{}', -- { "fact_check": {...}, "grammar": {...}, etc. }
  qa_passed BOOLEAN DEFAULT false,
  qa_issues TEXT[] DEFAULT '{}',

  -- Publishing Metadata
  author_name VARCHAR(200),
  author_bio TEXT,
  featured_image_url TEXT,
  meta_title VARCHAR(200),
  meta_description VARCHAR(300),
  canonical_url TEXT,

  -- Schema & SEO
  schema_markup JSONB DEFAULT '{}',
  ai_disclosure TEXT,
  citations JSONB DEFAULT '[]', -- [{ "text": "...", "url": "..." }]

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_qa_run TIMESTAMP,
  published_at TIMESTAMP,

  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_drafts_stage ON blog_drafts(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_drafts_idea ON blog_drafts(idea_id);
CREATE INDEX IF NOT EXISTS idx_drafts_qa_passed ON blog_drafts(qa_passed);
CREATE INDEX IF NOT EXISTS idx_drafts_created ON blog_drafts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drafts_slug ON blog_drafts(slug);

-- QA Pipeline Execution Log
CREATE TABLE IF NOT EXISTS qa_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES blog_drafts(id) ON DELETE CASCADE,
  stage VARCHAR(50) NOT NULL CHECK (stage IN (
    'fact_check', 'grammar', 'toxicity', 'plagiarism', 'originality', 'schema_validation'
  )),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'running', 'passed', 'failed', 'warning'
  )),
  tool_used VARCHAR(100),
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  issues_found JSONB DEFAULT '[]',
  severity_score INTEGER CHECK (severity_score BETWEEN 0 AND 10),
  execution_time_ms INTEGER,
  cost_usd DECIMAL(10,6),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_qa_draft ON qa_executions(draft_id);
CREATE INDEX IF NOT EXISTS idx_qa_stage ON qa_executions(stage);
CREATE INDEX IF NOT EXISTS idx_qa_status ON qa_executions(status);
CREATE INDEX IF NOT EXISTS idx_qa_started ON qa_executions(started_at DESC);

-- ============================================================================
-- 5. PUBLISHING & MONITORING
-- ============================================================================

-- Published Articles Registry
CREATE TABLE IF NOT EXISTS published_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES blog_drafts(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  url TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,

  -- SEO Data
  target_keyword VARCHAR(200),
  secondary_keywords TEXT[] DEFAULT '{}',
  meta_title VARCHAR(200),
  meta_description VARCHAR(300),
  canonical_url TEXT,
  schema_markup JSONB DEFAULT '{}',

  -- Author & Disclosure
  author_name VARCHAR(200) NOT NULL,
  author_bio TEXT,
  ai_disclosure TEXT NOT NULL,

  -- Publishing Metadata
  published_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'live' CHECK (status IN (
    'live', 'draft', 'archived', 'removed'
  )),

  -- Performance Tracking (populated by monitoring system)
  initial_rank INTEGER,
  current_rank INTEGER,
  total_impressions BIGINT DEFAULT 0,
  total_clicks BIGINT DEFAULT 0,
  avg_ctr DECIMAL(5,4),
  avg_position DECIMAL(5,2),

  -- Compliance Monitoring
  last_compliance_check TIMESTAMP,
  compliance_status VARCHAR(20) CHECK (compliance_status IN (
    'compliant', 'warning', 'violation', 'pending_review'
  )),
  compliance_issues JSONB DEFAULT '[]',

  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_published_slug ON published_articles(slug);
CREATE INDEX IF NOT EXISTS idx_published_status ON published_articles(status);
CREATE INDEX IF NOT EXISTS idx_published_date ON published_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_published_compliance ON published_articles(compliance_status);
CREATE INDEX IF NOT EXISTS idx_published_performance ON published_articles(current_rank, avg_ctr);

-- Publishing Rate Limiter
CREATE TABLE IF NOT EXISTS publishing_rate_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  topic_category VARCHAR(100),
  articles_published INTEGER DEFAULT 1,
  UNIQUE(date, topic_category)
);

CREATE INDEX IF NOT EXISTS idx_rate_tracker_date ON publishing_rate_tracker(date DESC);

-- Performance Monitoring Snapshots
CREATE TABLE IF NOT EXISTS article_performance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES published_articles(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,

  -- SERP Data
  rank_position INTEGER,
  featured_snippet BOOLEAN DEFAULT false,

  -- GSC Data
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5,4),
  avg_position DECIMAL(5,2),

  -- External Metrics
  backlinks_count INTEGER DEFAULT 0,
  social_shares INTEGER DEFAULT 0,

  -- Compliance Check
  compliance_check_passed BOOLEAN DEFAULT true,
  compliance_notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',

  UNIQUE(article_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_article ON article_performance_snapshots(article_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON article_performance_snapshots(snapshot_date DESC);

-- ============================================================================
-- 6. SYSTEM CONFIGURATION & SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS blog_system_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by VARCHAR(200)
);

-- Insert default configuration
INSERT INTO blog_system_config (key, value, description) VALUES
  ('publishing_rate_limits', '{"daily": 5, "weekly": 20, "monthly": 80}', 'Max articles to publish per period'),
  ('qa_thresholds', '{"fact_check": 0.9, "grammar": 0.95, "toxicity": 0.1, "plagiarism": 0.15}', 'QA passing thresholds'),
  ('content_safety', '{"require_ai_disclosure": true, "require_citations": true, "min_original_content": 0.8}', 'Content safety requirements'),
  ('serp_analysis', '{"top_n_competitors": 10, "min_content_gap_score": 0.7}', 'SERP analysis configuration'),
  ('monitoring', '{"check_frequency_days": 7, "alert_rank_drop": 5, "alert_ctr_drop": 0.02}', 'Performance monitoring settings')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 7. ENHANCED BUSINESS BRAIN INTEGRATION
-- ============================================================================

-- Add blog_context_enabled flag to existing business_brain_facts if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_brain_facts') THEN
    ALTER TABLE business_brain_facts ADD COLUMN IF NOT EXISTS blog_context_enabled BOOLEAN DEFAULT true;
    ALTER TABLE business_brain_facts ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;
    ALTER TABLE business_brain_facts ADD COLUMN IF NOT EXISTS last_used_in_blog TIMESTAMP;

    CREATE INDEX IF NOT EXISTS idx_brain_facts_blog_enabled ON business_brain_facts(blog_context_enabled)
      WHERE blog_context_enabled = true;
  END IF;
END $$;

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE internal_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE methodologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_marketing_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishing_rate_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_performance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_system_config ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for serverless functions)
CREATE POLICY "Service role full access - internal_knowledge" ON internal_knowledge FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access - case_studies" ON case_studies FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access - methodologies" ON methodologies FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access - ai_marketing_tools" ON ai_marketing_tools FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access - news_articles" ON news_articles FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access - trending_topics" ON trending_topics FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access - content_ideas" ON content_ideas FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access - blog_drafts" ON blog_drafts FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access - qa_executions" ON qa_executions FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access - published_articles" ON published_articles FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access - publishing_rate_tracker" ON publishing_rate_tracker FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access - article_performance_snapshots" ON article_performance_snapshots FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access - blog_system_config" ON blog_system_config FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Admin users can read/write everything (conditional on admin_users table existing)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    -- Admin policies only if admin_users table exists
    EXECUTE 'CREATE POLICY "Admin full access - internal_knowledge" ON internal_knowledge FOR ALL USING (
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role IN (''admin'', ''super_admin''))
    )';
    EXECUTE 'CREATE POLICY "Admin full access - case_studies" ON case_studies FOR ALL USING (
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role IN (''admin'', ''super_admin''))
    )';
    EXECUTE 'CREATE POLICY "Admin full access - methodologies" ON methodologies FOR ALL USING (
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role IN (''admin'', ''super_admin''))
    )';
    EXECUTE 'CREATE POLICY "Admin full access - ai_marketing_tools" ON ai_marketing_tools FOR ALL USING (
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role IN (''admin'', ''super_admin''))
    )';
    EXECUTE 'CREATE POLICY "Admin full access - content_ideas" ON content_ideas FOR ALL USING (
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role IN (''admin'', ''super_admin''))
    )';
    EXECUTE 'CREATE POLICY "Admin full access - blog_drafts" ON blog_drafts FOR ALL USING (
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role IN (''admin'', ''super_admin''))
    )';
    EXECUTE 'CREATE POLICY "Admin read access - published_articles" ON published_articles FOR SELECT USING (
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    )';
  END IF;
END $$;

-- Public can read published articles and tools (for public display)
CREATE POLICY "Public read published articles" ON published_articles FOR SELECT USING (status = 'live');
CREATE POLICY "Public read tools" ON ai_marketing_tools FOR SELECT USING (true);
CREATE POLICY "Public read methodologies" ON methodologies FOR SELECT USING (true);

-- ============================================================================
-- 9. UTILITY FUNCTIONS
-- ============================================================================

-- Function to get relevant internal knowledge for a topic
CREATE OR REPLACE FUNCTION get_internal_knowledge_for_topic(
  topic_embedding VECTOR(1536),
  max_results INTEGER DEFAULT 10,
  min_confidence DECIMAL DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  category VARCHAR(50),
  title VARCHAR(500),
  content TEXT,
  confidence_score DECIMAL(3,2),
  similarity DECIMAL(5,4)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ik.id,
    ik.category,
    ik.title,
    ik.content,
    ik.confidence_score,
    (1 - (ik.embedding <=> topic_embedding))::DECIMAL(5,4) as similarity
  FROM internal_knowledge ik
  WHERE ik.status = 'active'
    AND ik.confidence_score >= min_confidence
  ORDER BY ik.embedding <=> topic_embedding
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Function to check publishing rate limit
CREATE OR REPLACE FUNCTION check_publishing_rate_limit(
  target_date DATE DEFAULT CURRENT_DATE,
  topic_cat VARCHAR(100) DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  daily_limit INTEGER;
  weekly_limit INTEGER;
  monthly_limit INTEGER;
  daily_count INTEGER;
  weekly_count INTEGER;
  monthly_count INTEGER;
  result JSONB;
BEGIN
  -- Get limits from config
  SELECT (value->>'daily')::INTEGER, (value->>'weekly')::INTEGER, (value->>'monthly')::INTEGER
  INTO daily_limit, weekly_limit, monthly_limit
  FROM blog_system_config
  WHERE key = 'publishing_rate_limits';

  -- Count articles published today
  SELECT COALESCE(SUM(articles_published), 0)::INTEGER
  INTO daily_count
  FROM publishing_rate_tracker
  WHERE date = target_date
    AND (topic_cat IS NULL OR topic_category = topic_cat);

  -- Count articles published this week
  SELECT COALESCE(SUM(articles_published), 0)::INTEGER
  INTO weekly_count
  FROM publishing_rate_tracker
  WHERE date >= target_date - INTERVAL '7 days'
    AND date <= target_date
    AND (topic_cat IS NULL OR topic_category = topic_cat);

  -- Count articles published this month
  SELECT COALESCE(SUM(articles_published), 0)::INTEGER
  INTO monthly_count
  FROM publishing_rate_tracker
  WHERE date >= DATE_TRUNC('month', target_date)
    AND date <= target_date
    AND (topic_cat IS NULL OR topic_category = topic_cat);

  -- Build result
  result := jsonb_build_object(
    'allowed', (daily_count < daily_limit AND weekly_count < weekly_limit AND monthly_count < monthly_limit),
    'limits', jsonb_build_object(
      'daily', daily_limit,
      'weekly', weekly_limit,
      'monthly', monthly_limit
    ),
    'current', jsonb_build_object(
      'daily', daily_count,
      'weekly', weekly_count,
      'monthly', monthly_count
    )
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_internal_knowledge_updated_at BEFORE UPDATE ON internal_knowledge
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_studies_updated_at BEFORE UPDATE ON case_studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_methodologies_updated_at BEFORE UPDATE ON methodologies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_ideas_updated_at BEFORE UPDATE ON content_ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_drafts_updated_at BEFORE UPDATE ON blog_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Add migration record
INSERT INTO schema_migrations (version, description) VALUES
  ('20250129_blog_system_foundation', 'Next-Gen Blog System Foundation - Universal Content Mode, QA Pipeline, Publishing Automation')
ON CONFLICT (version) DO NOTHING;
