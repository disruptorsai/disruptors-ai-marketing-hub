-- Blog Content Backups Table
-- Stores backups of blog content before regeneration for safety and rollback capability

CREATE TABLE IF NOT EXISTS blog_content_backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,

  -- Original content snapshot
  original_content TEXT,
  original_title TEXT,
  original_excerpt TEXT,
  original_word_count INTEGER,

  -- Backup metadata
  backed_up_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  backup_reason TEXT, -- 'batch_regeneration', 'manual_edit', 'admin_update'

  -- Restoration tracking
  restored_at TIMESTAMPTZ,
  restored_by TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_backups_post_id ON blog_content_backups(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_backups_backed_up_at ON blog_content_backups(backed_up_at DESC);

-- Row Level Security (RLS)
ALTER TABLE blog_content_backups ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access backups (admin operations)
CREATE POLICY "Service role full access to backups"
  ON blog_content_backups
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE blog_content_backups IS 'Stores backups of blog post content before regeneration or major edits';
COMMENT ON COLUMN blog_content_backups.post_id IS 'Reference to the blog post';
COMMENT ON COLUMN blog_content_backups.original_content IS 'Full markdown content before change';
COMMENT ON COLUMN blog_content_backups.backup_reason IS 'Why this backup was created';
