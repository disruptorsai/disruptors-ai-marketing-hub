-- AI Content Writer - Add missing columns to posts table
-- Migration Date: 2025-01-08
-- Purpose: Ensure posts table has all required columns for AI Content Writer functionality

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add brain_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='posts' AND column_name='brain_id') THEN
        ALTER TABLE posts ADD COLUMN brain_id UUID REFERENCES business_brains(id) ON DELETE CASCADE;
    END IF;

    -- Add meta_title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='posts' AND column_name='meta_title') THEN
        ALTER TABLE posts ADD COLUMN meta_title TEXT;
    END IF;

    -- Add meta_description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='posts' AND column_name='meta_description') THEN
        ALTER TABLE posts ADD COLUMN meta_description TEXT;
    END IF;

    -- Add slug column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='posts' AND column_name='slug') THEN
        ALTER TABLE posts ADD COLUMN slug TEXT UNIQUE;
    END IF;

    -- Add scheduled_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='posts' AND column_name='scheduled_date') THEN
        ALTER TABLE posts ADD COLUMN scheduled_date TIMESTAMPTZ;
    END IF;

    -- Add ai_generated column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='posts' AND column_name='ai_generated') THEN
        ALTER TABLE posts ADD COLUMN ai_generated BOOLEAN DEFAULT false;
    END IF;

    -- Add editor_notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='posts' AND column_name='editor_notes') THEN
        ALTER TABLE posts ADD COLUMN editor_notes TEXT;
    END IF;
END $$;

-- Create index on brain_id for faster queries
CREATE INDEX IF NOT EXISTS idx_posts_brain_id ON posts(brain_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

-- Create index on scheduled_date for calendar queries
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_date ON posts(scheduled_date);

-- Create index on slug for URL lookups
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug) WHERE slug IS NOT NULL;

-- Add comment
COMMENT ON COLUMN posts.brain_id IS 'Reference to the Business Brain used to generate this content';
COMMENT ON COLUMN posts.meta_title IS 'SEO meta title tag';
COMMENT ON COLUMN posts.meta_description IS 'SEO meta description tag';
COMMENT ON COLUMN posts.slug IS 'URL-friendly slug for the post';
COMMENT ON COLUMN posts.scheduled_date IS 'Date and time when post should be published';
COMMENT ON COLUMN posts.ai_generated IS 'Flag indicating if content was AI-generated';
COMMENT ON COLUMN posts.editor_notes IS 'Internal editorial notes';
