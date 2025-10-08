-- =====================================================
-- ADD MISSING COLUMNS TO business_brains TABLE
-- =====================================================
-- This script adds all missing columns from the full Business Brain
-- schema to match the 20250107_business_brain_infrastructure.sql migration
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Adding missing columns to business_brains table...';

  -- Basic Information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'business_name') THEN
    ALTER TABLE business_brains ADD COLUMN business_name TEXT;
    UPDATE business_brains SET business_name = name WHERE business_name IS NULL;
    ALTER TABLE business_brains ALTER COLUMN business_name SET NOT NULL;
    RAISE NOTICE 'Added business_name column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'tagline') THEN
    ALTER TABLE business_brains ADD COLUMN tagline TEXT;
    RAISE NOTICE 'Added tagline column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'industry') THEN
    ALTER TABLE business_brains ADD COLUMN industry TEXT;
    RAISE NOTICE 'Added industry column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'founded_year') THEN
    ALTER TABLE business_brains ADD COLUMN founded_year INTEGER;
    RAISE NOTICE 'Added founded_year column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'company_size') THEN
    ALTER TABLE business_brains ADD COLUMN company_size TEXT CHECK (company_size IN ('solo', '2-10', '11-50', '51-200', '201-1000', '1000+'));
    RAISE NOTICE 'Added company_size column';
  END IF;

  -- Contact & Location
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'primary_website') THEN
    ALTER TABLE business_brains ADD COLUMN primary_website TEXT;
    RAISE NOTICE 'Added primary_website column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'primary_email') THEN
    ALTER TABLE business_brains ADD COLUMN primary_email TEXT;
    RAISE NOTICE 'Added primary_email column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'primary_phone') THEN
    ALTER TABLE business_brains ADD COLUMN primary_phone TEXT;
    RAISE NOTICE 'Added primary_phone column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'headquarters_city') THEN
    ALTER TABLE business_brains ADD COLUMN headquarters_city TEXT;
    RAISE NOTICE 'Added headquarters_city column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'headquarters_state') THEN
    ALTER TABLE business_brains ADD COLUMN headquarters_state TEXT;
    RAISE NOTICE 'Added headquarters_state column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'headquarters_country') THEN
    ALTER TABLE business_brains ADD COLUMN headquarters_country TEXT DEFAULT 'USA';
    RAISE NOTICE 'Added headquarters_country column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'service_areas') THEN
    ALTER TABLE business_brains ADD COLUMN service_areas TEXT[];
    RAISE NOTICE 'Added service_areas column';
  END IF;

  -- Business Intelligence
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'ideal_customer_profile') THEN
    ALTER TABLE business_brains ADD COLUMN ideal_customer_profile JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Added ideal_customer_profile column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'core_offerings') THEN
    ALTER TABLE business_brains ADD COLUMN core_offerings JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Added core_offerings column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'unique_value_propositions') THEN
    ALTER TABLE business_brains ADD COLUMN unique_value_propositions TEXT[];
    RAISE NOTICE 'Added unique_value_propositions column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'key_differentiators') THEN
    ALTER TABLE business_brains ADD COLUMN key_differentiators TEXT[];
    RAISE NOTICE 'Added key_differentiators column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'pain_points_solved') THEN
    ALTER TABLE business_brains ADD COLUMN pain_points_solved TEXT[];
    RAISE NOTICE 'Added pain_points_solved column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'target_keywords') THEN
    ALTER TABLE business_brains ADD COLUMN target_keywords TEXT[];
    RAISE NOTICE 'Added target_keywords column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'competitor_urls') THEN
    ALTER TABLE business_brains ADD COLUMN competitor_urls TEXT[];
    RAISE NOTICE 'Added competitor_urls column';
  END IF;

  -- Brand Identity (Visual) - brand_colors already exists from fix migration
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'typography') THEN
    ALTER TABLE business_brains ADD COLUMN typography JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE 'Added typography column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'logo_urls') THEN
    ALTER TABLE business_brains ADD COLUMN logo_urls JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE 'Added logo_urls column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'design_style') THEN
    ALTER TABLE business_brains ADD COLUMN design_style TEXT;
    RAISE NOTICE 'Added design_style column';
  END IF;

  -- Brand Voice
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'brand_voice') THEN
    ALTER TABLE business_brains ADD COLUMN brand_voice TEXT[];
    RAISE NOTICE 'Added brand_voice column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'tone_attributes') THEN
    ALTER TABLE business_brains ADD COLUMN tone_attributes TEXT[];
    RAISE NOTICE 'Added tone_attributes column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'writing_style') THEN
    ALTER TABLE business_brains ADD COLUMN writing_style TEXT;
    RAISE NOTICE 'Added writing_style column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'vocabulary_level') THEN
    ALTER TABLE business_brains ADD COLUMN vocabulary_level TEXT CHECK (vocabulary_level IN ('simple', 'intermediate', 'advanced', 'technical'));
    RAISE NOTICE 'Added vocabulary_level column';
  END IF;

  -- Content Strategy
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'content_pillars') THEN
    ALTER TABLE business_brains ADD COLUMN content_pillars TEXT[];
    RAISE NOTICE 'Added content_pillars column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'content_formats') THEN
    ALTER TABLE business_brains ADD COLUMN content_formats TEXT[];
    RAISE NOTICE 'Added content_formats column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'publishing_frequency') THEN
    ALTER TABLE business_brains ADD COLUMN publishing_frequency TEXT;
    RAISE NOTICE 'Added publishing_frequency column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'seasonal_campaigns') THEN
    ALTER TABLE business_brains ADD COLUMN seasonal_campaigns JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Added seasonal_campaigns column';
  END IF;

  -- Brain Health Metrics (brain_level, confidence_score already exist from fix migration)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'total_facts') THEN
    ALTER TABLE business_brains ADD COLUMN total_facts INTEGER NOT NULL DEFAULT 0;
    RAISE NOTICE 'Added total_facts column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'last_trained_at') THEN
    ALTER TABLE business_brains ADD COLUMN last_trained_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added last_trained_at column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'last_enhanced_at') THEN
    ALTER TABLE business_brains ADD COLUMN last_enhanced_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added last_enhanced_at column';
  END IF;

  -- Initialization Status (onboarding_completed already exists from fix migration)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'auto_initialized') THEN
    ALTER TABLE business_brains ADD COLUMN auto_initialized BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added auto_initialized column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'web_scrape_completed') THEN
    ALTER TABLE business_brains ADD COLUMN web_scrape_completed BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added web_scrape_completed column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'brand_colors_extracted') THEN
    ALTER TABLE business_brains ADD COLUMN brand_colors_extracted BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added brand_colors_extracted column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'integrations_connected') THEN
    ALTER TABLE business_brains ADD COLUMN integrations_connected INTEGER DEFAULT 0;
    RAISE NOTICE 'Added integrations_connected column';
  END IF;

  -- Add organization_id for future multi-tenant support
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_brains' AND column_name = 'organization_id') THEN
    ALTER TABLE business_brains ADD COLUMN organization_id UUID;
    RAISE NOTICE 'Added organization_id column';
  END IF;

  RAISE NOTICE 'All missing columns added successfully!';
END $$;

-- Create missing indexes
CREATE INDEX IF NOT EXISTS idx_business_brains_slug ON business_brains(slug);
CREATE INDEX IF NOT EXISTS idx_business_brains_industry ON business_brains(industry);
CREATE INDEX IF NOT EXISTS idx_business_brains_created ON business_brains(created_at DESC);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_business_brains_fts ON business_brains USING gin(
  to_tsvector('english',
    coalesce(name, '') || ' ' ||
    coalesce(business_name, '') || ' ' ||
    coalesce(tagline, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(industry, '')
  )
);

-- Add slug constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_slug'
  ) THEN
    ALTER TABLE business_brains ADD CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$');
    RAISE NOTICE 'Added valid_slug constraint';
  END IF;
END $$;

-- Verify the migration
SELECT COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_name = 'business_brains';

-- Should show ~50+ columns if successful
