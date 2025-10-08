/**
 * Apply Business Brain Migration - Fixed Order
 *
 * Executes the migration in correct dependency order via Supabase Management API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!PROJECT_REF || !SUPABASE_ACCESS_TOKEN) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  BUSINESS BRAIN INFRASTRUCTURE MIGRATION (FIXED)           ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');
console.log(`📍 Project: ${PROJECT_REF}\n`);

/**
 * Execute SQL query via Management API
 */
function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data || '[]'));
          } catch {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Migration steps in correct order
 */
const migrationSteps = [
  {
    name: 'Extensions',
    sql: `
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    `
  },
  {
    name: 'business_brains table',
    sql: `
-- business_brains table
CREATE TABLE IF NOT EXISTS business_brains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  organization_id UUID,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  industry TEXT,
  founded_year INTEGER,
  company_size TEXT CHECK (company_size IN ('solo', '2-10', '11-50', '51-200', '201-1000', '1000+')),
  primary_website TEXT,
  primary_email TEXT,
  primary_phone TEXT,
  headquarters_city TEXT,
  headquarters_state TEXT,
  headquarters_country TEXT DEFAULT 'USA',
  service_areas TEXT[],
  ideal_customer_profile JSONB DEFAULT '[]'::jsonb,
  core_offerings JSONB DEFAULT '[]'::jsonb,
  unique_value_propositions TEXT[],
  key_differentiators TEXT[],
  pain_points_solved TEXT[],
  target_keywords TEXT[],
  competitor_urls TEXT[],
  brand_colors JSONB DEFAULT '{}'::jsonb,
  typography JSONB DEFAULT '{}'::jsonb,
  logo_urls JSONB DEFAULT '{}'::jsonb,
  design_style TEXT,
  brand_voice TEXT[],
  tone_attributes TEXT[],
  writing_style TEXT,
  vocabulary_level TEXT CHECK (vocabulary_level IN ('simple', 'intermediate', 'advanced', 'technical')),
  content_pillars TEXT[],
  content_formats TEXT[],
  publishing_frequency TEXT,
  seasonal_campaigns JSONB DEFAULT '[]'::jsonb,
  brain_level TEXT NOT NULL DEFAULT 'starter' CHECK (brain_level IN ('starter', 'enhanced', 'expert')),
  confidence_score DECIMAL(3,2) NOT NULL DEFAULT 0.00 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  total_facts INTEGER NOT NULL DEFAULT 0,
  last_trained_at TIMESTAMP WITH TIME ZONE,
  last_enhanced_at TIMESTAMP WITH TIME ZONE,
  auto_initialized BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  web_scrape_completed BOOLEAN DEFAULT FALSE,
  brand_colors_extracted BOOLEAN DEFAULT FALSE,
  integrations_connected INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE INDEX IF NOT EXISTS idx_business_brains_slug ON business_brains(slug);
CREATE INDEX IF NOT EXISTS idx_business_brains_level ON business_brains(brain_level);
CREATE INDEX IF NOT EXISTS idx_business_brains_industry ON business_brains(industry);
CREATE INDEX IF NOT EXISTS idx_business_brains_created ON business_brains(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_business_brains_fts ON business_brains USING gin(
  to_tsvector('english',
    coalesce(name, '') || ' ' ||
    coalesce(business_name, '') || ' ' ||
    coalesce(tagline, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(industry, '')
  )
);
    `
  },
  {
    name: 'brain_facts table',
    sql: `
-- brain_facts table
CREATE TABLE IF NOT EXISTS brain_facts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brain_id UUID NOT NULL REFERENCES business_brains(id) ON DELETE CASCADE,
  fact_text TEXT NOT NULL,
  fact_type TEXT NOT NULL CHECK (fact_type IN (
    'service', 'product', 'value_proposition', 'process', 'testimonial',
    'case_study', 'faq', 'pricing', 'location', 'team', 'history',
    'industry_insight', 'brand_rule', 'visual_asset', 'custom'
  )),
  category TEXT NOT NULL,
  subcategory TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'web_scrape', 'ai_conversation', 'file_upload', 'integration',
    'manual_entry', 'growth_audit', 'brand_detection'
  )),
  source_url TEXT,
  source_file_id UUID,
  source_integration_id UUID,
  embedding VECTOR(1536),
  keywords TEXT[],
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0.50 CHECK (confidence >= 0.0 AND confidence <= 1.0),
  importance TEXT CHECK (importance IN ('low', 'medium', 'high', 'critical')),
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES brain_facts(id),
  is_current BOOLEAN DEFAULT TRUE,
  deprecated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT valid_fact_text CHECK (LENGTH(fact_text) >= 10)
);

CREATE INDEX IF NOT EXISTS idx_brain_facts_brain ON brain_facts(brain_id);
CREATE INDEX IF NOT EXISTS idx_brain_facts_type ON brain_facts(fact_type);
CREATE INDEX IF NOT EXISTS idx_brain_facts_category ON brain_facts(category);
CREATE INDEX IF NOT EXISTS idx_brain_facts_source ON brain_facts(source_type);
CREATE INDEX IF NOT EXISTS idx_brain_facts_confidence ON brain_facts(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_brain_facts_current ON brain_facts(is_current) WHERE is_current = TRUE;
CREATE INDEX IF NOT EXISTS idx_brain_facts_verified ON brain_facts(verified) WHERE verified = TRUE;

CREATE INDEX IF NOT EXISTS idx_brain_facts_fts ON brain_facts USING gin(
  to_tsvector('english',
    coalesce(fact_text, '') || ' ' ||
    coalesce(category, '') || ' ' ||
    coalesce(subcategory, '')
  )
);

CREATE INDEX IF NOT EXISTS idx_brain_facts_embedding ON brain_facts USING hnsw (embedding vector_cosine_ops);
    `
  },
  {
    name: 'brand_rules table',
    sql: `
-- brand_rules table
CREATE TABLE IF NOT EXISTS brand_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brain_id UUID NOT NULL REFERENCES business_brains(id) ON DELETE CASCADE,
  rule_category TEXT NOT NULL CHECK (rule_category IN ('voice', 'tone', 'style', 'lexicon', 'taboos', 'examples')),
  rule_type TEXT NOT NULL,
  rule_text TEXT NOT NULL,
  applies_to TEXT[],
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  good_examples TEXT[],
  bad_examples TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_brand_rules_brain ON brand_rules(brain_id);
CREATE INDEX IF NOT EXISTS idx_brand_rules_category ON brand_rules(rule_category);
CREATE INDEX IF NOT EXISTS idx_brand_rules_active ON brand_rules(is_active) WHERE is_active = TRUE;
    `
  },
  {
    name: 'brand_assets table',
    sql: `
-- brand_assets table
CREATE TABLE IF NOT EXISTS brand_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brain_id UUID NOT NULL REFERENCES business_brains(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('logo', 'icon', 'image', 'pattern', 'illustration', 'photo', 'other')),
  asset_url TEXT NOT NULL,
  thumbnail_url TEXT,
  cloudinary_public_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  alt_text TEXT,
  tags TEXT[],
  dominant_colors TEXT[],
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  file_format TEXT,
  usage_context TEXT[],
  is_primary BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_assets_brain ON brand_assets(brain_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_type ON brand_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_brand_assets_primary ON brand_assets(is_primary) WHERE is_primary = TRUE;
    `
  },
  {
    name: 'onboarding_sessions table',
    sql: `
-- onboarding_sessions table
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brain_id UUID NOT NULL REFERENCES business_brains(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('initial', 'enhancement', 'refinement')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_question_index INTEGER DEFAULT 0,
  total_questions INTEGER,
  facts_extracted INTEGER DEFAULT 0,
  rules_extracted INTEGER DEFAULT 0,
  confidence_improvement DECIMAL(3,2),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_brain ON onboarding_sessions(brain_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_status ON onboarding_sessions(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_started ON onboarding_sessions(started_at DESC);
    `
  },
  {
    name: 'knowledge_sources table',
    sql: `
-- knowledge_sources table
CREATE TABLE IF NOT EXISTS knowledge_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brain_id UUID NOT NULL REFERENCES business_brains(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'google_analytics', 'google_search_console', 'hubspot', 'mailchimp',
    'shopify', 'woocommerce', 'stripe', 'quickbooks', 'social_media',
    'rss_feed', 'api_endpoint', 'webhook', 'custom'
  )),
  source_name TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT FALSE,
  connection_config JSONB DEFAULT '{}'::jsonb,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_frequency TEXT CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'manual')),
  fact_mapping JSONB DEFAULT '{}'::jsonb,
  auto_categorize BOOLEAN DEFAULT TRUE,
  sync_status TEXT CHECK (sync_status IN ('active', 'paused', 'error', 'disconnected')),
  last_error TEXT,
  sync_count INTEGER DEFAULT 0,
  facts_created INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_sources_brain ON knowledge_sources(brain_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_type ON knowledge_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_connected ON knowledge_sources(is_connected) WHERE is_connected = TRUE;
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_status ON knowledge_sources(sync_status);
    `
  },
  {
    name: 'RLS Policies',
    sql: `
-- Enable RLS
ALTER TABLE business_brains ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;

-- business_brains policies
CREATE POLICY "Users can view their own brains" ON business_brains FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can manage their own brains" ON business_brains FOR ALL USING (created_by = auth.uid());
CREATE POLICY "Service role has full access to business_brains" ON business_brains FOR ALL TO service_role USING (true);

-- brain_facts policies
CREATE POLICY "Users can view facts for their own brains" ON brain_facts FOR SELECT USING (brain_id IN (SELECT id FROM business_brains WHERE created_by = auth.uid()));
CREATE POLICY "Users can manage facts for their own brains" ON brain_facts FOR ALL USING (brain_id IN (SELECT id FROM business_brains WHERE created_by = auth.uid()));
CREATE POLICY "Service role has full access to brain_facts" ON brain_facts FOR ALL TO service_role USING (true);

-- brand_rules policies
CREATE POLICY "Users can view rules for their own brains" ON brand_rules FOR SELECT USING (brain_id IN (SELECT id FROM business_brains WHERE created_by = auth.uid()));
CREATE POLICY "Users can manage rules for their own brains" ON brand_rules FOR ALL USING (brain_id IN (SELECT id FROM business_brains WHERE created_by = auth.uid()));
CREATE POLICY "Service role has full access to brand_rules" ON brand_rules FOR ALL TO service_role USING (true);

-- brand_assets policies
CREATE POLICY "Users can view assets for their own brains" ON brand_assets FOR SELECT USING (brain_id IN (SELECT id FROM business_brains WHERE created_by = auth.uid()));
CREATE POLICY "Users can manage assets for their own brains" ON brand_assets FOR ALL USING (brain_id IN (SELECT id FROM business_brains WHERE created_by = auth.uid()));
CREATE POLICY "Service role has full access to brand_assets" ON brand_assets FOR ALL TO service_role USING (true);

-- onboarding_sessions policies
CREATE POLICY "Users can view onboarding sessions for their own brains" ON onboarding_sessions FOR SELECT USING (brain_id IN (SELECT id FROM business_brains WHERE created_by = auth.uid()));
CREATE POLICY "Users can create onboarding sessions for their own brains" ON onboarding_sessions FOR INSERT WITH CHECK (brain_id IN (SELECT id FROM business_brains WHERE created_by = auth.uid()));
CREATE POLICY "Service role has full access to onboarding_sessions" ON onboarding_sessions FOR ALL TO service_role USING (true);

-- knowledge_sources policies
CREATE POLICY "Users can view sources for their own brains" ON knowledge_sources FOR SELECT USING (brain_id IN (SELECT id FROM business_brains WHERE created_by = auth.uid()));
CREATE POLICY "Users can manage sources for their own brains" ON knowledge_sources FOR ALL USING (brain_id IN (SELECT id FROM business_brains WHERE created_by = auth.uid()));
CREATE POLICY "Service role has full access to knowledge_sources" ON knowledge_sources FOR ALL TO service_role USING (true);
    `
  },
  {
    name: 'Database Functions',
    sql: `
-- Function: Search brain facts using full-text search
CREATE OR REPLACE FUNCTION search_brain_facts(
  brain_id_param UUID,
  q TEXT,
  limit_count INTEGER DEFAULT 15
)
RETURNS TABLE (
  id UUID,
  fact_text TEXT,
  fact_type TEXT,
  category TEXT,
  confidence DECIMAL,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bf.id,
    bf.fact_text,
    bf.fact_type,
    bf.category,
    bf.confidence,
    ts_rank(
      to_tsvector('english', bf.fact_text || ' ' || coalesce(bf.category, '')),
      plainto_tsquery('english', q)
    ) AS relevance
  FROM brain_facts bf
  WHERE
    bf.brain_id = brain_id_param
    AND bf.is_current = TRUE
    AND to_tsvector('english', bf.fact_text || ' ' || coalesce(bf.category, '')) @@ plainto_tsquery('english', q)
  ORDER BY relevance DESC, bf.confidence DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Search brain facts using vector similarity
CREATE OR REPLACE FUNCTION search_brain_facts_vector(
  brain_id_param UUID,
  query_embedding VECTOR(1536),
  limit_count INTEGER DEFAULT 15,
  similarity_threshold REAL DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  fact_text TEXT,
  fact_type TEXT,
  category TEXT,
  confidence DECIMAL,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bf.id,
    bf.fact_text,
    bf.fact_type,
    bf.category,
    bf.confidence,
    1 - (bf.embedding <=> query_embedding) AS similarity
  FROM brain_facts bf
  WHERE
    bf.brain_id = brain_id_param
    AND bf.is_current = TRUE
    AND bf.embedding IS NOT NULL
    AND (1 - (bf.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY bf.embedding <=> query_embedding
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate brain confidence score
CREATE OR REPLACE FUNCTION calculate_brain_confidence(brain_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
  fact_count INTEGER;
  verified_count INTEGER;
  avg_fact_confidence DECIMAL;
  sources_connected INTEGER;
  onboarding_complete BOOLEAN;
  final_score DECIMAL;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE verified = TRUE), AVG(confidence)
  INTO fact_count, verified_count, avg_fact_confidence
  FROM brain_facts
  WHERE brain_id = brain_id_param AND is_current = TRUE;

  SELECT COUNT(*) INTO sources_connected
  FROM knowledge_sources
  WHERE brain_id = brain_id_param AND is_connected = TRUE;

  SELECT onboarding_completed INTO onboarding_complete
  FROM business_brains
  WHERE id = brain_id_param;

  final_score := LEAST(1.0,
    (LEAST(fact_count::DECIMAL / 100, 1.0) * 0.3) +
    (COALESCE(avg_fact_confidence, 0) * 0.25) +
    (LEAST(verified_count::DECIMAL / 20, 1.0) * 0.2) +
    (LEAST(sources_connected::DECIMAL / 5, 1.0) * 0.15) +
    (CASE WHEN onboarding_complete THEN 0.10 ELSE 0 END)
  );

  RETURN ROUND(final_score::NUMERIC, 2);
END;
$$ LANGUAGE plpgsql;
    `
  },
  {
    name: 'Triggers and Update Functions',
    sql: `
-- Function: Update brain stats
CREATE OR REPLACE FUNCTION update_brain_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE business_brains
    SET
      total_facts = (SELECT COUNT(*) FROM brain_facts WHERE brain_id = NEW.brain_id AND is_current = TRUE),
      confidence_score = calculate_brain_confidence(NEW.brain_id),
      updated_at = NOW()
    WHERE id = NEW.brain_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE business_brains
    SET
      total_facts = (SELECT COUNT(*) FROM brain_facts WHERE brain_id = OLD.brain_id AND is_current = TRUE),
      confidence_score = calculate_brain_confidence(OLD.brain_id),
      updated_at = NOW()
    WHERE id = OLD.brain_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_brain_stats ON brain_facts;
CREATE TRIGGER trigger_update_brain_stats
  AFTER INSERT OR UPDATE OR DELETE ON brain_facts
  FOR EACH ROW
  EXECUTE FUNCTION update_brain_stats();

-- Function: Update brain level
CREATE OR REPLACE FUNCTION update_brain_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confidence_score >= 0.80 THEN
    NEW.brain_level := 'expert';
  ELSIF NEW.confidence_score >= 0.50 THEN
    NEW.brain_level := 'enhanced';
  ELSE
    NEW.brain_level := 'starter';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_brain_level ON business_brains;
CREATE TRIGGER trigger_update_brain_level
  BEFORE UPDATE OF confidence_score ON business_brains
  FOR EACH ROW
  WHEN (OLD.confidence_score IS DISTINCT FROM NEW.confidence_score)
  EXECUTE FUNCTION update_brain_level();

-- Function: Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_business_brains_updated_at ON business_brains;
CREATE TRIGGER trigger_business_brains_updated_at BEFORE UPDATE ON business_brains FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_brain_facts_updated_at ON brain_facts;
CREATE TRIGGER trigger_brain_facts_updated_at BEFORE UPDATE ON brain_facts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_brand_rules_updated_at ON brand_rules;
CREATE TRIGGER trigger_brand_rules_updated_at BEFORE UPDATE ON brand_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_brand_assets_updated_at ON brand_assets;
CREATE TRIGGER trigger_brand_assets_updated_at BEFORE UPDATE ON brand_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_knowledge_sources_updated_at ON knowledge_sources;
CREATE TRIGGER trigger_knowledge_sources_updated_at BEFORE UPDATE ON knowledge_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    `
  },
  {
    name: 'Permissions',
    sql: `
-- Grant permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT SELECT ON business_brains TO authenticated;
GRANT SELECT ON brain_facts TO authenticated;
GRANT SELECT ON brand_rules TO authenticated;
GRANT SELECT ON brand_assets TO authenticated;
GRANT SELECT ON onboarding_sessions TO authenticated;
GRANT SELECT ON knowledge_sources TO authenticated;

GRANT ALL ON business_brains TO service_role;
GRANT ALL ON brain_facts TO service_role;
GRANT ALL ON brand_rules TO service_role;
GRANT ALL ON brand_assets TO service_role;
GRANT ALL ON onboarding_sessions TO service_role;
GRANT ALL ON knowledge_sources TO service_role;

GRANT EXECUTE ON FUNCTION search_brain_facts TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION search_brain_facts_vector TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION calculate_brain_confidence TO authenticated, service_role;
    `
  }
];

/**
 * Execute migration
 */
async function executeMigration() {
  let successCount = 0;
  let errorCount = 0;

  for (const step of migrationSteps) {
    console.log(`🔄 ${step.name}...`);

    try {
      await executeSQL(step.sql.trim());
      console.log(`✅ ${step.name} - Success\n`);
      successCount++;
    } catch (err) {
      console.error(`❌ ${step.name} - Failed:`);
      console.error(`   ${err.message}\n`);
      errorCount++;

      // Continue with other steps even if one fails
    }
  }

  return { successCount, errorCount };
}

/**
 * Verify tables
 */
async function verifyTables() {
  const tablesToCheck = [
    'business_brains',
    'brain_facts',
    'brand_rules',
    'brand_assets',
    'onboarding_sessions',
    'knowledge_sources'
  ];

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  VERIFICATION                                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const results = [];

  for (const table of tablesToCheck) {
    try {
      const checkQuery = `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${table}');`;
      const result = await executeSQL(checkQuery);

      if (result && result[0]?.exists) {
        console.log(`✅ ${table.padEnd(25)} - Table exists`);
        results.push({ table, exists: true });
      } else {
        console.log(`❌ ${table.padEnd(25)} - Not found`);
        results.push({ table, exists: false });
      }
    } catch (err) {
      console.log(`❌ ${table.padEnd(25)} - Error: ${err.message}`);
      results.push({ table, exists: false });
    }
  }

  const existsCount = results.filter(r => r.exists).length;

  console.log(`\n${existsCount}/${tablesToCheck.length} tables created`);

  return existsCount;
}

/**
 * Main
 */
async function main() {
  const { successCount, errorCount } = await executeMigration();

  const tablesCreated = await verifyTables();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  MIGRATION SUMMARY                                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`Steps executed: ${successCount + errorCount}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`\nTables created: ${tablesCreated}/6\n`);

  if (tablesCreated === 6 && errorCount === 0) {
    console.log('🎉 Migration completed successfully!\n');
  } else if (tablesCreated === 6) {
    console.log('⚠️  Migration completed with warnings\n');
  } else {
    console.log('❌ Migration incomplete. Please check errors above.\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});
