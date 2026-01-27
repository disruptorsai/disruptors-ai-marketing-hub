#!/usr/bin/env node

/**
 * Compare expected vs. actual database schemas
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Expected schemas from migration
const EXPECTED_SCHEMAS = {
  business_brains: [
    'id', 'slug', 'organization_id', 'name', 'business_name', 'tagline', 'description',
    'industry', 'founded_year', 'company_size', 'primary_website', 'primary_email',
    'primary_phone', 'headquarters_city', 'headquarters_state', 'headquarters_country',
    'service_areas', 'ideal_customer_profile', 'core_offerings', 'unique_value_propositions',
    'key_differentiators', 'pain_points_solved', 'target_keywords', 'competitor_urls',
    'brand_colors', 'typography', 'logo_urls', 'design_style', 'brand_voice',
    'tone_attributes', 'writing_style', 'vocabulary_level', 'content_pillars',
    'content_formats', 'publishing_frequency', 'seasonal_campaigns', 'brain_level',
    'confidence_score', 'total_facts', 'last_trained_at', 'last_enhanced_at',
    'auto_initialized', 'onboarding_completed', 'web_scrape_completed',
    'brand_colors_extracted', 'integrations_connected', 'created_at', 'updated_at', 'created_by'
  ],
  brain_facts: [
    'id', 'brain_id', 'fact_text', 'fact_type', 'category', 'subcategory',
    'source_type', 'source_url', 'source_file_id', 'source_integration_id',
    'embedding', 'keywords', 'confidence', 'importance', 'verified',
    'verified_by', 'verified_at', 'usage_count', 'last_used_at',
    'version', 'previous_version_id', 'is_current', 'deprecated_at',
    'created_at', 'updated_at', 'created_by'
  ],
  brand_rules: [
    'id', 'brain_id', 'rule_type', 'rule_name', 'rule_content',
    'examples', 'priority', 'applies_to', 'created_at', 'updated_at', 'created_by'
  ],
  brand_assets: [
    'id', 'brain_id', 'asset_type', 'asset_category', 'file_url',
    'file_name', 'file_size', 'mime_type', 'width', 'height',
    'alt_text', 'description', 'tags', 'usage_context',
    'metadata', 'created_at', 'updated_at', 'created_by'
  ],
  onboarding_sessions: [
    'id', 'brain_id', 'session_type', 'status', 'current_step',
    'total_steps', 'conversation_history', 'extracted_data',
    'completion_percentage', 'started_at', 'completed_at',
    'created_at', 'updated_at', 'created_by'
  ],
  knowledge_sources: [
    'id', 'brain_id', 'source_type', 'source_name', 'source_url',
    'integration_type', 'api_credentials', 'sync_frequency',
    'last_synced_at', 'next_sync_at', 'facts_imported',
    'is_active', 'sync_errors', 'created_at', 'updated_at', 'created_by'
  ],
  posts_brain_facts: [
    'id', 'post_id', 'brain_fact_id', 'usage_context',
    'confidence_at_use', 'created_at'
  ],
  posts: [
    'id', 'title', 'slug', 'excerpt', 'content', 'content_type',
    'featured_image', 'gallery_images', 'author_id', 'category',
    'tags', 'read_time_minutes', 'is_featured', 'is_published',
    'published_at', 'seo_title', 'seo_description', 'seo_keywords',
    'created_at', 'updated_at', 'status', 'brain_snapshot', 'seo',
    'author_member_id', 'agent_id', 'generation_metadata',
    'scheduled_for', 'word_count', 'reading_time_minutes',
    'brain_id', 'meta_title', 'meta_description', 'scheduled_date',
    'ai_generated', 'editor_notes', 'primary_keyword', 'secondary_keywords',
    'keyword_data' // Expected but may not exist
  ]
};

async function getActualColumns(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  if (error) {
    return null;
  }

  return data && data.length > 0 ? Object.keys(data[0]) : [];
}

async function compareSchemas() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 DATABASE SCHEMA COMPARISON REPORT');
  console.log('═══════════════════════════════════════════════════════════\n');

  for (const [tableName, expectedColumns] of Object.entries(EXPECTED_SCHEMAS)) {
    console.log(`\n🔍 ${tableName.toUpperCase()}`);
    console.log('─────────────────────────────────────────────────────────');

    const actualColumns = await getActualColumns(tableName);

    if (!actualColumns) {
      console.log('❌ TABLE DOES NOT EXIST');
      console.log(`   Expected ${expectedColumns.length} columns`);
      continue;
    }

    if (actualColumns.length === 0) {
      console.log('⚠️  TABLE EXISTS BUT IS EMPTY (cannot determine schema)');
      console.log(`   Expected ${expectedColumns.length} columns`);
      continue;
    }

    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
    const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));

    console.log(`✅ Table exists with ${actualColumns.length} columns`);

    if (missingColumns.length > 0) {
      console.log(`\n⚠️  MISSING COLUMNS (${missingColumns.length}):`);
      missingColumns.forEach(col => console.log(`   - ${col}`));
    }

    if (extraColumns.length > 0) {
      console.log(`\n➕ EXTRA COLUMNS (${extraColumns.length}) - not in expected schema:`);
      extraColumns.forEach(col => console.log(`   + ${col}`));
    }

    if (missingColumns.length === 0 && extraColumns.length === 0) {
      console.log('✅ Schema matches expected migration exactly');
    }

    // Show schema comparison summary
    const matchPercentage = ((actualColumns.length - missingColumns.length - extraColumns.length) / expectedColumns.length * 100).toFixed(1);
    console.log(`\n📊 Schema Match: ${matchPercentage}% (${actualColumns.length - missingColumns.length - extraColumns.length}/${expectedColumns.length} expected columns present)`);
  }

  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('📋 MIGRATION STATUS SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Check each table
  const businessBrainsColumns = await getActualColumns('business_brains');
  const brainFactsColumns = await getActualColumns('brain_facts');
  const brandRulesColumns = await getActualColumns('brand_rules');
  const brandAssetsColumns = await getActualColumns('brand_assets');
  const onboardingSessionsColumns = await getActualColumns('onboarding_sessions');
  const knowledgeSourcesColumns = await getActualColumns('knowledge_sources');
  const postsBrainFactsColumns = await getActualColumns('posts_brain_facts');
  const postsColumns = await getActualColumns('posts');

  let needsMigration = false;

  // Business Brain tables
  if (!businessBrainsColumns || businessBrainsColumns.length < 40) {
    console.log('❌ business_brains: Incomplete schema (expected 48+ columns)');
    needsMigration = true;
  } else {
    console.log('✅ business_brains: Complete schema');
  }

  if (!brainFactsColumns || brainFactsColumns.length < 20) {
    console.log('❌ brain_facts: Incomplete schema (expected 26+ columns)');
    needsMigration = true;
  } else {
    console.log('✅ brain_facts: Complete schema');
  }

  if (!brandRulesColumns || brandRulesColumns.length === 0) {
    console.log('❌ brand_rules: Empty table (cannot verify schema)');
    needsMigration = true;
  } else {
    console.log('✅ brand_rules: Has data');
  }

  if (!brandAssetsColumns) {
    console.log('❌ brand_assets: Table does not exist');
    needsMigration = true;
  } else if (brandAssetsColumns.length === 0) {
    console.log('⚠️  brand_assets: Exists but empty (cannot verify schema)');
  } else {
    console.log('✅ brand_assets: Complete');
  }

  if (!onboardingSessionsColumns) {
    console.log('❌ onboarding_sessions: Table does not exist');
    needsMigration = true;
  } else if (onboardingSessionsColumns.length === 0) {
    console.log('⚠️  onboarding_sessions: Exists but empty (cannot verify schema)');
  } else {
    console.log('✅ onboarding_sessions: Complete');
  }

  if (!knowledgeSourcesColumns) {
    console.log('❌ knowledge_sources: Table does not exist');
    needsMigration = true;
  } else if (knowledgeSourcesColumns.length === 0) {
    console.log('⚠️  knowledge_sources: Exists but empty (cannot verify schema)');
  } else {
    console.log('✅ knowledge_sources: Complete');
  }

  if (!postsBrainFactsColumns) {
    console.log('❌ posts_brain_facts: Table does not exist');
    needsMigration = true;
  } else if (postsBrainFactsColumns.length === 0) {
    console.log('⚠️  posts_brain_facts: Exists but empty (cannot verify schema)');
  } else {
    console.log('✅ posts_brain_facts: Complete');
  }

  // Posts table keyword columns
  if (postsColumns && !postsColumns.includes('keyword_data')) {
    console.log('⚠️  posts: Missing keyword_data column (may need separate migration)');
  } else if (postsColumns) {
    console.log('✅ posts: Has keyword columns');
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  if (needsMigration) {
    console.log('⚠️  RECOMMENDATION: Business Brain migration needs to be applied or re-run');
    console.log('   Some tables are missing or have incomplete schemas');
    console.log('\n   Run: node scripts/apply-business-brain-migration.js');
  } else {
    console.log('✅ Business Brain infrastructure appears to be fully migrated');
    console.log('   All core tables exist with expected schemas');
  }
  console.log('═══════════════════════════════════════════════════════════\n');
}

compareSchemas()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
