-- AI Content Writer Enhancements Migration
-- Date: October 8, 2025
--
-- Adds:
-- 1. content_settings table for AI configuration
-- 2. editor_notes column to posts table
-- 3. RLS policies for content_settings

-- ============================================================================
-- 1. Add editor_notes to posts table
-- ============================================================================

ALTER TABLE posts ADD COLUMN IF NOT EXISTS editor_notes TEXT;

COMMENT ON COLUMN posts.editor_notes IS 'Internal notes and comments for editors and team collaboration';

-- ============================================================================
-- 2. Create content_settings table
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brain_id UUID NOT NULL REFERENCES business_brains(id) ON DELETE CASCADE,
  focus_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  ai_writing_directives TEXT,
  default_word_count_min INTEGER DEFAULT 1500 CHECK (default_word_count_min >= 500 AND default_word_count_min <= 10000),
  default_word_count_max INTEGER DEFAULT 3000 CHECK (default_word_count_max >= 500 AND default_word_count_max <= 10000),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brain_id),
  CONSTRAINT word_count_range CHECK (default_word_count_max >= default_word_count_min)
);

COMMENT ON TABLE content_settings IS 'AI content generation settings for each business brain';
COMMENT ON COLUMN content_settings.brain_id IS 'Reference to business brain - one settings record per brain';
COMMENT ON COLUMN content_settings.focus_keywords IS 'Array of SEO keywords to target in generated content';
COMMENT ON COLUMN content_settings.ai_writing_directives IS 'Custom instructions for AI tone, style, and voice';
COMMENT ON COLUMN content_settings.default_word_count_min IS 'Minimum target word count for generated articles';
COMMENT ON COLUMN content_settings.default_word_count_max IS 'Maximum target word count for generated articles';

-- ============================================================================
-- 3. Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_content_settings_brain_id ON content_settings(brain_id);
CREATE INDEX IF NOT EXISTS idx_posts_editor_notes ON posts USING gin(to_tsvector('english', editor_notes)) WHERE editor_notes IS NOT NULL;

-- ============================================================================
-- 4. Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE content_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view settings for their own brains
CREATE POLICY "Users can view their own content settings"
  ON content_settings
  FOR SELECT
  USING (
    brain_id IN (
      SELECT id FROM business_brains WHERE created_by = auth.uid()
    )
  );

-- Policy: Users can insert settings for their own brains
CREATE POLICY "Users can create content settings for their brains"
  ON content_settings
  FOR INSERT
  WITH CHECK (
    brain_id IN (
      SELECT id FROM business_brains WHERE created_by = auth.uid()
    )
  );

-- Policy: Users can update settings for their own brains
CREATE POLICY "Users can update their own content settings"
  ON content_settings
  FOR UPDATE
  USING (
    brain_id IN (
      SELECT id FROM business_brains WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    brain_id IN (
      SELECT id FROM business_brains WHERE created_by = auth.uid()
    )
  );

-- Policy: Users can delete settings for their own brains
CREATE POLICY "Users can delete their own content settings"
  ON content_settings
  FOR DELETE
  USING (
    brain_id IN (
      SELECT id FROM business_brains WHERE created_by = auth.uid()
    )
  );

-- ============================================================================
-- 5. Create trigger for updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_content_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_content_settings_updated_at ON content_settings;
CREATE TRIGGER set_content_settings_updated_at
  BEFORE UPDATE ON content_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_content_settings_updated_at();

-- ============================================================================
-- 6. Grant permissions
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON content_settings TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE content_settings_id_seq TO authenticated;

-- ============================================================================
-- 7. Add helpful view for content settings with brain info
-- ============================================================================

CREATE OR REPLACE VIEW content_settings_with_brain AS
SELECT
  cs.*,
  bb.business_name,
  bb.industry,
  bb.brand_voice,
  bb.tone_attributes
FROM content_settings cs
JOIN business_brains bb ON cs.brain_id = bb.id;

COMMENT ON VIEW content_settings_with_brain IS 'Content settings joined with business brain information';

GRANT SELECT ON content_settings_with_brain TO authenticated;

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Verification queries (commented out, run manually if needed)
-- SELECT COUNT(*) FROM content_settings;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'content_settings';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'editor_notes';
