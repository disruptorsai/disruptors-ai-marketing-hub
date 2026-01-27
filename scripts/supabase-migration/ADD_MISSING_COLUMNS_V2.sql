-- ============================================================================
-- ADD MISSING COLUMNS TO NEW PROJECT
-- Run this in the NEW project's SQL Editor before data migration
-- ============================================================================

-- site_media: Add missing columns
ALTER TABLE site_media ADD COLUMN IF NOT EXISTS generated_by_workflow_id UUID;
ALTER TABLE site_media ADD COLUMN IF NOT EXISTS generated_by_agent_id UUID;
ALTER TABLE site_media ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE site_media ADD COLUMN IF NOT EXISTS generation_prompt TEXT;
ALTER TABLE site_media ADD COLUMN IF NOT EXISTS generation_metadata JSONB;
ALTER TABLE site_media ADD COLUMN IF NOT EXISTS usage_rights TEXT;
ALTER TABLE site_media ADD COLUMN IF NOT EXISTS indexed_for_search BOOLEAN DEFAULT FALSE;

-- posts: Add missing columns
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS brain_snapshot JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS seo JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_member_id UUID;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS agent_id UUID;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS generation_metadata JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS word_count INTEGER;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS brain_id UUID;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMPTZ;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS editor_notes TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_options JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS keyword_data JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS last_modified_by UUID;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS modification_notes TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS key_takeaways JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS table_of_contents JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS cta_config JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS semantic_structure_version INTEGER;

-- business_brains: Add missing column
ALTER TABLE business_brains ADD COLUMN IF NOT EXISTS business_description TEXT;

-- brain_facts: Completely different schema - need to recreate
-- Source has: id, brain_id, key, value, source, confidence, last_verified_at, created_at, updated_at, fts
-- Current has complex schema, need to drop and recreate

DROP TABLE IF EXISTS brain_facts CASCADE;
CREATE TABLE brain_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brain_id UUID NOT NULL REFERENCES business_brains(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT,
  source TEXT,
  confidence DECIMAL(3,2) DEFAULT 0.50,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  fts tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(key, '') || ' ' || coalesce(value, ''))) STORED
);

CREATE INDEX IF NOT EXISTS idx_brain_facts_brain ON brain_facts(brain_id);
CREATE INDEX IF NOT EXISTS idx_brain_facts_key ON brain_facts(key);
CREATE INDEX IF NOT EXISTS idx_brain_facts_fts ON brain_facts USING GIN(fts);

-- brand_rules: Different schema - need to recreate
DROP TABLE IF EXISTS brand_rules CASCADE;
CREATE TABLE brand_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brain_id UUID NOT NULL REFERENCES business_brains(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_rules_brain ON brand_rules(brain_id);
CREATE INDEX IF NOT EXISTS idx_brand_rules_type ON brand_rules(rule_type);

-- Re-enable RLS
ALTER TABLE brain_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_rules ENABLE ROW LEVEL SECURITY;

-- Service role policies
CREATE POLICY "Service role full access brain_facts" ON brain_facts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access brand_rules" ON brand_rules FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated user policies
CREATE POLICY "Auth users read brain facts" ON brain_facts FOR SELECT TO authenticated
  USING (brain_id IN (SELECT id FROM business_brains WHERE created_by = auth.uid()));
CREATE POLICY "Auth users manage brain facts" ON brain_facts FOR ALL TO authenticated
  USING (brain_id IN (SELECT id FROM business_brains WHERE created_by = auth.uid()));
CREATE POLICY "Auth users read brand rules" ON brand_rules FOR SELECT TO authenticated
  USING (brain_id IN (SELECT id FROM business_brains WHERE created_by = auth.uid()));
CREATE POLICY "Auth users manage brand rules" ON brand_rules FOR ALL TO authenticated
  USING (brain_id IN (SELECT id FROM business_brains WHERE created_by = auth.uid()));

-- Triggers
DROP TRIGGER IF EXISTS update_brain_facts_updated_at ON brain_facts;
CREATE TRIGGER update_brain_facts_updated_at BEFORE UPDATE ON brain_facts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brand_rules_updated_at ON brand_rules;
CREATE TRIGGER update_brand_rules_updated_at BEFORE UPDATE ON brand_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DONE! Now run migrate-data.mjs again
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Missing columns added successfully!';
  RAISE NOTICE 'Now run: node scripts/supabase-migration/migrate-data.mjs';
END $$;
