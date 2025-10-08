-- =====================================================================================
-- Migration: Add AI Content Writer Columns to Posts Table (Minimal Version)
-- =====================================================================================
-- This migration only adds columns that don't already exist in the posts table.
-- Existing columns with different names (ai_generated, editor_notes) are preserved.
-- =====================================================================================

-- Add only the missing columns
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS primary_keyword TEXT,
  ADD COLUMN IF NOT EXISTS secondary_keywords TEXT[];

-- Create indexes for keyword search performance
CREATE INDEX IF NOT EXISTS idx_posts_primary_keyword ON posts(primary_keyword);
CREATE INDEX IF NOT EXISTS idx_posts_secondary_keywords ON posts USING GIN(secondary_keywords);

-- Add comment to document the schema
COMMENT ON COLUMN posts.primary_keyword IS 'Primary SEO keyword for this post';
COMMENT ON COLUMN posts.secondary_keywords IS 'Array of secondary SEO keywords for this post';

-- =====================================================================================
-- NOTES:
-- =====================================================================================
-- Existing columns that are already present (no action needed):
--   - brain_id (UUID REFERENCES business_brains(id))
--   - meta_title (TEXT)
--   - meta_description (TEXT)
--   - slug (TEXT UNIQUE)
--   - status (TEXT DEFAULT 'draft')
--   - scheduled_date (TIMESTAMPTZ)
--   - word_count (INTEGER)
--   - ai_generated (BOOLEAN) - exists as ai_generated, not is_ai_generated
--   - editor_notes (TEXT) - exists as editor_notes, not editorial_notes
--
-- This migration is safe to run multiple times due to IF NOT EXISTS clauses.
-- =====================================================================================
