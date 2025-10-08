-- =====================================================
-- FIX: Add Missing brain_level Column
-- =====================================================
-- Run this if you got error: column "brain_level" does not exist
--
-- This adds the brain_level column and other potentially missing
-- columns to an existing business_brains table.
-- =====================================================

-- First, check if business_brains table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_brains') THEN
    RAISE NOTICE 'business_brains table exists - adding missing columns';

    -- Add brain_level if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'business_brains' AND column_name = 'brain_level'
    ) THEN
      ALTER TABLE business_brains
        ADD COLUMN brain_level TEXT NOT NULL DEFAULT 'starter'
        CHECK (brain_level IN ('starter', 'enhanced', 'expert'));
      RAISE NOTICE 'Added brain_level column';
    END IF;

    -- Add confidence_score if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'business_brains' AND column_name = 'confidence_score'
    ) THEN
      ALTER TABLE business_brains
        ADD COLUMN confidence_score DECIMAL(3,2) NOT NULL DEFAULT 0.30
        CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0);
      RAISE NOTICE 'Added confidence_score column';
    END IF;

    -- Add onboarding_completed if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'business_brains' AND column_name = 'onboarding_completed'
    ) THEN
      ALTER TABLE business_brains
        ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
      RAISE NOTICE 'Added onboarding_completed column';
    END IF;

    -- Add brand_colors if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'business_brains' AND column_name = 'brand_colors'
    ) THEN
      ALTER TABLE business_brains
        ADD COLUMN brand_colors JSONB DEFAULT '{}'::jsonb;
      RAISE NOTICE 'Added brand_colors column';
    END IF;

    -- Add business_description if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'business_brains' AND column_name = 'business_description'
    ) THEN
      ALTER TABLE business_brains
        ADD COLUMN business_description TEXT;
      RAISE NOTICE 'Added business_description column';
    END IF;

    -- Add created_by if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'business_brains' AND column_name = 'created_by'
    ) THEN
      ALTER TABLE business_brains
        ADD COLUMN created_by UUID REFERENCES auth.users(id);
      RAISE NOTICE 'Added created_by column';
    END IF;

  ELSE
    RAISE NOTICE 'business_brains table does not exist - you need to run the full migration first';
  END IF;
END $$;

-- Create index on brain_level if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_business_brains_level ON business_brains(brain_level);

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'business_brains'
  AND column_name IN ('brain_level', 'confidence_score', 'onboarding_completed', 'brand_colors', 'business_description', 'created_by')
ORDER BY column_name;

-- You should see 6 rows returned if all columns were added successfully
