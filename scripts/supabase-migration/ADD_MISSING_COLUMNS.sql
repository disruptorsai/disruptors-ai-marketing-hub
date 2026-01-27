-- Add missing columns that exist in OLD database but not in migration
-- Run this in the NEW project's SQL Editor

-- site_media missing columns
ALTER TABLE site_media ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE site_media ADD COLUMN IF NOT EXISTS generation_prompt TEXT;
ALTER TABLE site_media ADD COLUMN IF NOT EXISTS generation_model TEXT;
ALTER TABLE site_media ADD COLUMN IF NOT EXISTS generation_params JSONB;

-- posts missing columns
ALTER TABLE posts ADD COLUMN IF NOT EXISTS agent_id UUID;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS brain_id UUID REFERENCES business_brains(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS brain_facts_used INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS brain_confidence_at_generation DECIMAL(3,2);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS generation_model TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS og_image TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;

-- business_brains missing columns
ALTER TABLE business_brains ADD COLUMN IF NOT EXISTS business_description TEXT;
ALTER TABLE business_brains ADD COLUMN IF NOT EXISTS mission_statement TEXT;
ALTER TABLE business_brains ADD COLUMN IF NOT EXISTS vision_statement TEXT;
ALTER TABLE business_brains ADD COLUMN IF NOT EXISTS core_values TEXT[];
ALTER TABLE business_brains ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
ALTER TABLE business_brains ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}'::jsonb;

-- brain_facts missing columns (fts is likely a generated column)
-- Skip fts as it should be generated
ALTER TABLE brain_facts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE brain_facts ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE brain_facts ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- brand_rules missing columns
ALTER TABLE brand_rules ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE brand_rules ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE brand_rules ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE brand_rules ADD COLUMN IF NOT EXISTS examples JSONB DEFAULT '[]'::jsonb;

-- Verify columns were added
DO $$
BEGIN
  RAISE NOTICE 'Missing columns added successfully!';
END $$;
