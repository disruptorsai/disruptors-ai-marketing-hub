-- Lead Magnet Resources Management System
-- Migration: 20250117000000_lead_magnet_resources.sql

-- Create lead_magnet_resources table
CREATE TABLE IF NOT EXISTS lead_magnet_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  icon_name TEXT DEFAULT 'FileText',
  icon_color TEXT DEFAULT 'text-blue-500',
  preview_image_url TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size TEXT,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[] DEFAULT '{}',
  whats_inside JSONB DEFAULT '[]',
  related_resources UUID[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_magnet_resources_slug ON lead_magnet_resources(slug);
CREATE INDEX IF NOT EXISTS idx_lead_magnet_resources_category ON lead_magnet_resources(category);
CREATE INDEX IF NOT EXISTS idx_lead_magnet_resources_is_active ON lead_magnet_resources(is_active);
CREATE INDEX IF NOT EXISTS idx_lead_magnet_resources_is_featured ON lead_magnet_resources(is_featured);
CREATE INDEX IF NOT EXISTS idx_lead_magnet_resources_tags ON lead_magnet_resources USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_lead_magnet_resources_created_at ON lead_magnet_resources(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_lead_magnet_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lead_magnet_resources_updated_at
  BEFORE UPDATE ON lead_magnet_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_magnet_resources_updated_at();

-- RLS Policies
ALTER TABLE lead_magnet_resources ENABLE ROW LEVEL SECURITY;

-- Public: Read access to active resources
CREATE POLICY "Public can view active resources"
  ON lead_magnet_resources
  FOR SELECT
  USING (is_active = TRUE);

-- Admin: Check if user has admin role in raw_app_meta_data
CREATE POLICY "Admin users have full access"
  ON lead_magnet_resources
  FOR ALL
  USING (
    auth.uid() IS NOT NULL AND
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
     auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  );

-- View: Popular Resources (Top 10 by downloads)
CREATE OR REPLACE VIEW popular_resources AS
  SELECT *
  FROM lead_magnet_resources
  WHERE is_active = TRUE
  ORDER BY download_count DESC
  LIMIT 10;

-- View: Featured Resources
CREATE OR REPLACE VIEW featured_resources AS
  SELECT *
  FROM lead_magnet_resources
  WHERE is_active = TRUE AND is_featured = TRUE
  ORDER BY created_at DESC;

-- View: Resource Stats (Aggregated analytics)
CREATE OR REPLACE VIEW resource_stats AS
  SELECT
    category,
    COUNT(*) as total_resources,
    SUM(download_count) as total_downloads,
    SUM(view_count) as total_views,
    AVG(download_count) as avg_downloads,
    AVG(view_count) as avg_views
  FROM lead_magnet_resources
  WHERE is_active = TRUE
  GROUP BY category;

-- Grant access to views
GRANT SELECT ON popular_resources TO anon, authenticated;
GRANT SELECT ON featured_resources TO anon, authenticated;
GRANT SELECT ON resource_stats TO authenticated;

-- Comments for documentation
COMMENT ON TABLE lead_magnet_resources IS 'Stores downloadable lead magnet resources with analytics and SEO metadata';
COMMENT ON COLUMN lead_magnet_resources.slug IS 'URL-friendly identifier used in routes (e.g., /l/n8n-workflows)';
COMMENT ON COLUMN lead_magnet_resources.whats_inside IS 'JSON array of bullet points describing resource contents';
COMMENT ON COLUMN lead_magnet_resources.related_resources IS 'Array of UUIDs pointing to related resources';
COMMENT ON COLUMN lead_magnet_resources.download_count IS 'Incremented each time resource is downloaded';
COMMENT ON COLUMN lead_magnet_resources.view_count IS 'Incremented each time resource page is viewed';
