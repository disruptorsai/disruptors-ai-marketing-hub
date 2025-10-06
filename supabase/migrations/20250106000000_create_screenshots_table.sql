-- Create page_screenshots table for screenshot capture system
-- This table stores metadata for all screenshots captured during development

CREATE TABLE IF NOT EXISTS page_screenshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_route TEXT NOT NULL,
  change_description TEXT NOT NULL,
  screenshot_url TEXT NOT NULL,
  viewport_size TEXT NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT now(),
  captured_before_change BOOLEAN DEFAULT true,
  related_change_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_page_screenshots_page_route ON page_screenshots(page_route);
CREATE INDEX IF NOT EXISTS idx_page_screenshots_captured_at ON page_screenshots(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_screenshots_viewport_size ON page_screenshots(viewport_size);
CREATE INDEX IF NOT EXISTS idx_page_screenshots_related_change_id ON page_screenshots(related_change_id);
CREATE INDEX IF NOT EXISTS idx_page_screenshots_captured_before_change ON page_screenshots(captured_before_change);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_page_screenshots_page_viewport_date
  ON page_screenshots(page_route, viewport_size, captured_at DESC);

-- Enable Row Level Security
ALTER TABLE page_screenshots ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view screenshots (public read)
CREATE POLICY "Allow public read access to page_screenshots"
  ON page_screenshots
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert screenshots
CREATE POLICY "Allow authenticated users to insert page_screenshots"
  ON page_screenshots
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Policy: Only authenticated users can update screenshots
CREATE POLICY "Allow authenticated users to update page_screenshots"
  ON page_screenshots
  FOR UPDATE
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Policy: Only service role can delete screenshots (admin only)
CREATE POLICY "Allow service role to delete page_screenshots"
  ON page_screenshots
  FOR DELETE
  USING (auth.role() = 'service_role');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_page_screenshots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_page_screenshots_updated_at
  BEFORE UPDATE ON page_screenshots
  FOR EACH ROW
  EXECUTE FUNCTION update_page_screenshots_updated_at();

-- Add helpful comments
COMMENT ON TABLE page_screenshots IS 'Stores screenshot metadata for visual change tracking and before/after comparisons';
COMMENT ON COLUMN page_screenshots.page_route IS 'URL path of the page (e.g., /home, /about)';
COMMENT ON COLUMN page_screenshots.change_description IS 'Description of the change being made';
COMMENT ON COLUMN page_screenshots.screenshot_url IS 'Cloudinary URL of the screenshot';
COMMENT ON COLUMN page_screenshots.viewport_size IS 'Viewport size used for screenshot (desktop, tablet, mobile, large-desktop)';
COMMENT ON COLUMN page_screenshots.captured_at IS 'Timestamp when screenshot was captured';
COMMENT ON COLUMN page_screenshots.captured_before_change IS 'Whether this screenshot was taken before or after the change';
COMMENT ON COLUMN page_screenshots.related_change_id IS 'ID linking before and after screenshots for the same change';
COMMENT ON COLUMN page_screenshots.metadata IS 'Additional metadata (browser info, dimensions, etc.)';

-- Create view for before/after pairs
CREATE OR REPLACE VIEW screenshot_pairs AS
SELECT
  before.id as before_id,
  after.id as after_id,
  before.page_route,
  before.change_description,
  before.screenshot_url as before_url,
  after.screenshot_url as after_url,
  before.viewport_size,
  before.captured_at as before_captured_at,
  after.captured_at as after_captured_at,
  before.related_change_id
FROM page_screenshots before
LEFT JOIN page_screenshots after
  ON before.related_change_id = after.related_change_id
  AND before.viewport_size = after.viewport_size
  AND after.captured_before_change = false
WHERE before.captured_before_change = true
ORDER BY before.captured_at DESC;

COMMENT ON VIEW screenshot_pairs IS 'Pairs of before/after screenshots for easy comparison';

-- Create function to get latest screenshots by page
CREATE OR REPLACE FUNCTION get_latest_screenshots_by_page(page_path TEXT, limit_count INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  page_route TEXT,
  change_description TEXT,
  screenshot_url TEXT,
  viewport_size TEXT,
  captured_at TIMESTAMPTZ,
  captured_before_change BOOLEAN,
  related_change_id TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ps.id,
    ps.page_route,
    ps.change_description,
    ps.screenshot_url,
    ps.viewport_size,
    ps.captured_at,
    ps.captured_before_change,
    ps.related_change_id
  FROM page_screenshots ps
  WHERE ps.page_route = page_path
  ORDER BY ps.captured_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_latest_screenshots_by_page IS 'Get the most recent screenshots for a specific page';

-- Create function to get screenshots by date range
CREATE OR REPLACE FUNCTION get_screenshots_by_date_range(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  page_path TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  page_route TEXT,
  change_description TEXT,
  screenshot_url TEXT,
  viewport_size TEXT,
  captured_at TIMESTAMPTZ,
  captured_before_change BOOLEAN,
  related_change_id TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ps.id,
    ps.page_route,
    ps.change_description,
    ps.screenshot_url,
    ps.viewport_size,
    ps.captured_at,
    ps.captured_before_change,
    ps.related_change_id
  FROM page_screenshots ps
  WHERE ps.captured_at BETWEEN start_date AND end_date
    AND (page_path IS NULL OR ps.page_route = page_path)
  ORDER BY ps.captured_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_screenshots_by_date_range IS 'Get screenshots within a date range, optionally filtered by page';

-- Create function to cleanup old screenshots
CREATE OR REPLACE FUNCTION cleanup_old_screenshots(days_old INT DEFAULT 90)
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  WITH deleted AS (
    DELETE FROM page_screenshots
    WHERE captured_at < (now() - (days_old || ' days')::INTERVAL)
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_screenshots IS 'Delete screenshots older than specified number of days';
