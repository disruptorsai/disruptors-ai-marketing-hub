-- Enhanced Blog Management System Migration
-- Adds auto-scheduling, keyword tracking, image options, and approval workflow

-- ============================================================================
-- 1. Enhance posts table with new columns
-- ============================================================================

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending_review',
ADD COLUMN IF NOT EXISTS image_options JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS keyword_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS generation_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS approved_by TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_modified_by TEXT,
ADD COLUMN IF NOT EXISTS modification_notes TEXT;

-- Add check constraint for approval_status
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS posts_approval_status_check;

ALTER TABLE posts
ADD CONSTRAINT posts_approval_status_check
CHECK (approval_status IN ('pending_review', 'approved', 'rejected', 'scheduled', 'published', 'needs_revision'));

-- Add index for scheduled posts
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_for ON posts(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_approval_status ON posts(approval_status);
CREATE INDEX IF NOT EXISTS idx_posts_auto_generated ON posts(auto_generated) WHERE auto_generated = true;

-- ============================================================================
-- 2. Create blog_schedule table for calendar tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS blog_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,

  -- Schedule details
  scheduled_date TIMESTAMPTZ NOT NULL,
  schedule_type TEXT NOT NULL, -- 'auto' or 'manual'
  frequency_period TEXT, -- 'phase_1_90_days' or 'phase_2_ongoing'

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'published', 'failed', 'cancelled'
  published_at TIMESTAMPTZ,

  -- Metadata
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT,

  CONSTRAINT blog_schedule_status_check CHECK (status IN ('pending', 'published', 'failed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_blog_schedule_date ON blog_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_blog_schedule_status ON blog_schedule(status);
CREATE INDEX IF NOT EXISTS idx_blog_schedule_post ON blog_schedule(post_id);

-- ============================================================================
-- 3. Create keyword_blog_mapping table
-- ============================================================================

CREATE TABLE IF NOT EXISTS keyword_blog_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,

  -- Keyword data from DataForSEO
  keyword TEXT NOT NULL,
  keyword_type TEXT, -- 'primary', 'secondary', 'related'
  search_volume INTEGER,
  keyword_difficulty INTEGER,
  cpc NUMERIC(10,2),
  competition NUMERIC(3,2),

  -- Tracking
  dataforseo_task_id TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),

  -- Performance
  current_rank INTEGER,
  last_rank_check TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(post_id, keyword, keyword_type)
);

CREATE INDEX IF NOT EXISTS idx_keyword_mapping_post ON keyword_blog_mapping(post_id);
CREATE INDEX IF NOT EXISTS idx_keyword_mapping_keyword ON keyword_blog_mapping(keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_mapping_volume ON keyword_blog_mapping(search_volume DESC);

-- ============================================================================
-- 4. Create blog_generation_queue table for auto-generation pipeline
-- ============================================================================

CREATE TABLE IF NOT EXISTS blog_generation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Generation request
  keyword TEXT NOT NULL,
  topic TEXT NOT NULL,
  priority INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'queued', -- 'queued', 'generating', 'completed', 'failed'
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,

  -- Generation details
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  -- AI metadata
  model_used TEXT,
  tokens_used INTEGER,
  cost_usd NUMERIC(10,4),

  -- Error tracking
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT blog_queue_status_check CHECK (status IN ('queued', 'generating', 'completed', 'failed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_blog_queue_status ON blog_generation_queue(status);
CREATE INDEX IF NOT EXISTS idx_blog_queue_priority ON blog_generation_queue(priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_blog_queue_keyword ON blog_generation_queue(keyword);

-- ============================================================================
-- 5. Create system_settings table for configuration
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES
  ('blog_schedule_phase_1', '{"days": ["Monday", "Wednesday", "Friday"], "time": "09:00:00", "timezone": "America/New_York", "duration_days": 90}'::jsonb, 'First 90 days: 3 posts per week'),
  ('blog_schedule_phase_2', '{"days": ["Tuesday", "Thursday"], "time": "09:00:00", "timezone": "America/New_York"}'::jsonb, 'After 90 days: 2 posts per week'),
  ('blog_buffer_size', '{"min": 3, "target": 5, "max": 10}'::jsonb, 'Minimum and target buffer sizes'),
  ('dataforseo_settings', '{"max_daily_calls": 100, "industries": ["AI marketing", "SEO", "digital marketing"], "min_search_volume": 100, "max_keyword_difficulty": 50}'::jsonb, 'DataForSEO API configuration'),
  ('image_generation', '{"count_per_blog": 3, "model": "gpt-image-1", "size": "1024x1024", "quality": "standard"}'::jsonb, 'Image generation settings')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- 6. Create view for blog management dashboard
-- ============================================================================

CREATE OR REPLACE VIEW blog_management_dashboard AS
SELECT
  p.id,
  p.title,
  p.slug,
  p.excerpt,
  p.content,
  p.featured_image,
  p.image_options,
  p.category,
  p.tags,
  p.seo_keywords,
  p.approval_status,
  p.is_published,
  p.published_at,
  p.scheduled_for,
  p.auto_generated,
  p.keyword_data,
  p.generation_metadata,
  p.approved_by,
  p.approved_at,
  p.created_at,
  p.updated_at,
  p.read_time_minutes,

  -- Scheduled publish info
  bs.scheduled_date as next_publish_date,
  bs.status as schedule_status,

  -- Keyword info (aggregate)
  COALESCE(
    json_agg(
      json_build_object(
        'keyword', kbm.keyword,
        'type', kbm.keyword_type,
        'volume', kbm.search_volume,
        'difficulty', kbm.keyword_difficulty
      ) ORDER BY kbm.keyword_type, kbm.search_volume DESC
    ) FILTER (WHERE kbm.keyword IS NOT NULL),
    '[]'::json
  ) as keywords,

  -- Image count
  jsonb_array_length(COALESCE(p.image_options, '[]'::jsonb)) as image_count

FROM posts p
LEFT JOIN blog_schedule bs ON bs.post_id = p.id AND bs.status = 'pending'
LEFT JOIN keyword_blog_mapping kbm ON kbm.post_id = p.id
GROUP BY
  p.id, p.title, p.slug, p.excerpt, p.content, p.featured_image, p.image_options,
  p.category, p.tags, p.seo_keywords, p.approval_status, p.is_published,
  p.published_at, p.scheduled_for, p.auto_generated, p.keyword_data,
  p.generation_metadata, p.approved_by, p.approved_at, p.created_at,
  p.updated_at, p.read_time_minutes, bs.scheduled_date, bs.status;

-- ============================================================================
-- 7. Create function to get next available schedule slot
-- ============================================================================

CREATE OR REPLACE FUNCTION get_next_schedule_slot()
RETURNS TIMESTAMPTZ AS $$
DECLARE
  next_slot TIMESTAMPTZ;
  phase_1_end TIMESTAMPTZ;
  current_time TIMESTAMPTZ := NOW();
  schedule_days TEXT[];
  schedule_time TIME;
BEGIN
  -- Determine if we're in phase 1 or phase 2
  -- Assuming phase 1 starts from first system setting creation
  SELECT (setting_value->>'duration_days')::INTEGER INTO phase_1_end
  FROM system_settings
  WHERE setting_key = 'blog_schedule_phase_1';

  -- Calculate phase 1 end date (90 days from first scheduled post or now)
  SELECT COALESCE(MIN(scheduled_date), current_time) + INTERVAL '90 days' INTO phase_1_end
  FROM blog_schedule;

  -- Get appropriate schedule based on current phase
  IF current_time < phase_1_end THEN
    -- Phase 1: Mon/Wed/Fri
    SELECT
      json_array_elements_text(setting_value->'days'),
      (setting_value->>'time')::TIME
    INTO schedule_days, schedule_time
    FROM system_settings
    WHERE setting_key = 'blog_schedule_phase_1';
  ELSE
    -- Phase 2: Tue/Thu
    SELECT
      json_array_elements_text(setting_value->'days'),
      (setting_value->>'time')::TIME
    INTO schedule_days, schedule_time
    FROM system_settings
    WHERE setting_key = 'blog_schedule_phase_2';
  END IF;

  -- Find next available slot (simplified - just return next valid day)
  -- This is a basic implementation; production version would check for existing scheduled posts
  next_slot := current_time + INTERVAL '1 day';

  RETURN next_slot;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. Create function to auto-schedule approved posts
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_schedule_approved_posts()
RETURNS TABLE(post_id UUID, scheduled_date TIMESTAMPTZ) AS $$
DECLARE
  approved_post RECORD;
  next_slot TIMESTAMPTZ;
BEGIN
  -- Get all approved but not scheduled posts
  FOR approved_post IN
    SELECT id, title
    FROM posts
    WHERE approval_status = 'approved'
      AND scheduled_for IS NULL
    ORDER BY approved_at ASC
  LOOP
    -- Get next available schedule slot
    next_slot := get_next_schedule_slot();

    -- Update post with schedule
    UPDATE posts
    SET
      scheduled_for = next_slot,
      approval_status = 'scheduled',
      updated_at = NOW()
    WHERE id = approved_post.id;

    -- Insert into blog_schedule table
    INSERT INTO blog_schedule (post_id, scheduled_date, schedule_type, status)
    VALUES (approved_post.id, next_slot, 'auto', 'pending');

    -- Return result
    post_id := approved_post.id;
    scheduled_date := next_slot;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. RLS Policies (Admin access only)
-- ============================================================================

ALTER TABLE blog_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_blog_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_generation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Admin-only access (service role bypasses these)
CREATE POLICY "Service role only" ON blog_schedule FOR ALL USING (false);
CREATE POLICY "Service role only" ON keyword_blog_mapping FOR ALL USING (false);
CREATE POLICY "Service role only" ON blog_generation_queue FOR ALL USING (false);
CREATE POLICY "Service role only" ON system_settings FOR ALL USING (false);

-- Grant permissions to service role
GRANT ALL ON blog_schedule TO service_role;
GRANT ALL ON keyword_blog_mapping TO service_role;
GRANT ALL ON blog_generation_queue TO service_role;
GRANT ALL ON system_settings TO service_role;

-- ============================================================================
-- 10. Create updated_at trigger for new tables
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_schedule_updated_at
  BEFORE UPDATE ON blog_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_queue_updated_at
  BEFORE UPDATE ON blog_generation_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE blog_schedule IS 'Tracks scheduled publish dates for blog posts';
COMMENT ON TABLE keyword_blog_mapping IS 'Maps DataForSEO keywords to blog posts';
COMMENT ON TABLE blog_generation_queue IS 'Queue for auto-generating blog posts';
COMMENT ON TABLE system_settings IS 'System-wide configuration for blog automation';
COMMENT ON VIEW blog_management_dashboard IS 'Comprehensive view for Admin Nexus blog management';
