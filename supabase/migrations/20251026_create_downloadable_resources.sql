-- Migration: Create Downloadable Resources Table
-- Date: 2025-10-26
-- Purpose: Enable Lead Magnet Manager functionality

-- ====================
-- DOWNLOADABLE RESOURCES TABLE
-- ====================
CREATE TABLE IF NOT EXISTS public.downloadable_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identifiers
  slug TEXT NOT NULL UNIQUE,

  -- Basic Info
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,

  -- Categorization
  category TEXT NOT NULL DEFAULT 'guides' CHECK (category IN ('automation', 'templates', 'guides', 'tools', 'reports')),
  tags JSONB DEFAULT '[]'::JSONB,

  -- Visual Elements
  icon_name TEXT DEFAULT 'FileText',
  icon_color TEXT DEFAULT 'text-blue-500',
  preview_image_url TEXT,

  -- File Details
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf' CHECK (file_type IN ('pdf', 'zip', 'docx', 'xlsx', 'pptx', 'json', 'csv')),
  file_size TEXT,

  -- Status & Features
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords JSONB DEFAULT '[]'::JSONB,

  -- Content Details
  whats_inside JSONB DEFAULT '[]'::JSONB,
  related_resources JSONB DEFAULT '[]'::JSONB,

  -- Analytics
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_downloadable_resources_slug ON public.downloadable_resources(slug);
CREATE INDEX IF NOT EXISTS idx_downloadable_resources_category ON public.downloadable_resources(category);
CREATE INDEX IF NOT EXISTS idx_downloadable_resources_is_active ON public.downloadable_resources(is_active);
CREATE INDEX IF NOT EXISTS idx_downloadable_resources_is_featured ON public.downloadable_resources(is_featured);
CREATE INDEX IF NOT EXISTS idx_downloadable_resources_created_at ON public.downloadable_resources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_downloadable_resources_tags ON public.downloadable_resources USING GIN (tags);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_downloadable_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER downloadable_resources_updated_at
  BEFORE UPDATE ON public.downloadable_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_downloadable_resources_updated_at();

-- ====================
-- ROW LEVEL SECURITY
-- ====================

-- Enable RLS
ALTER TABLE public.downloadable_resources ENABLE ROW LEVEL SECURITY;

-- Admin full access policy
CREATE POLICY "Admins have full access to downloadable_resources"
  ON public.downloadable_resources
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Public can read active resources (for public download pages)
CREATE POLICY "Public can view active downloadable_resources"
  ON public.downloadable_resources
  FOR SELECT
  USING (is_active = true);

-- ====================
-- COMMENTS
-- ====================

COMMENT ON TABLE public.downloadable_resources IS 'Downloadable resources for lead magnets (PDFs, templates, guides)';
COMMENT ON COLUMN public.downloadable_resources.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN public.downloadable_resources.tags IS 'Array of tags for categorization';
COMMENT ON COLUMN public.downloadable_resources.seo_keywords IS 'Array of SEO keywords';
COMMENT ON COLUMN public.downloadable_resources.whats_inside IS 'Array of bullet points describing contents';
COMMENT ON COLUMN public.downloadable_resources.related_resources IS 'Array of related resource IDs';

-- Migration complete
