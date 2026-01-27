#!/usr/bin/env node

/**
 * Detailed Database Schema Check
 *
 * Queries PostgreSQL information_schema directly for complete table metadata
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

async function getDetailedSchema() {
  console.log('🔍 Fetching detailed schema information...\n');

  // Get all tables with row counts
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 ALL TABLES IN PUBLIC SCHEMA');
  console.log('═══════════════════════════════════════════════════════════\n');

  const tables = [
    'users', 'posts', 'business_brains', 'brain_facts',
    'brand_rules', 'brand_assets', 'onboarding_sessions',
    'knowledge_sources', 'posts_brain_facts'
  ];

  for (const tableName of tables) {
    try {
      // Try to count rows
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${tableName}: Table does not exist or is not accessible`);
        continue;
      }

      console.log(`✅ ${tableName}: ${count ?? 0} rows`);

      // Get sample row to determine columns
      const { data, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (!sampleError && data && data.length > 0) {
        const columns = Object.keys(data[0]);
        console.log(`   Columns (${columns.length}): ${columns.join(', ')}\n`);
      } else {
        // Try to get columns from empty table
        const { data: emptyData, error: emptyError } = await supabase
          .from(tableName)
          .select('*')
          .limit(0);

        if (!emptyError) {
          console.log(`   No rows to sample columns from\n`);
        }
      }

    } catch (err) {
      console.log(`❌ ${tableName}: Error - ${err.message}\n`);
    }
  }

  // Check posts table specifically
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📝 POSTS TABLE DETAILED ANALYSIS');
  console.log('═══════════════════════════════════════════════════════════\n');

  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, title, primary_keyword, secondary_keywords, keyword_data, brain_id, ai_generated')
    .limit(5);

  if (postsError) {
    console.log('❌ Error querying posts:', postsError.message);
  } else {
    console.log(`Found ${posts.length} posts (showing first 5):\n`);
    posts.forEach(post => {
      console.log(`ID: ${post.id}`);
      console.log(`Title: ${post.title || 'N/A'}`);
      console.log(`Primary Keyword: ${post.primary_keyword || 'N/A'}`);
      console.log(`Secondary Keywords: ${post.secondary_keywords || 'N/A'}`);
      console.log(`Keyword Data: ${post.keyword_data ? 'Present' : 'N/A'}`);
      console.log(`Brain ID: ${post.brain_id || 'N/A'}`);
      console.log(`AI Generated: ${post.ai_generated ? 'Yes' : 'No'}`);
      console.log('---');
    });
  }

  // Check business_brains table
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🧠 BUSINESS BRAINS TABLE DETAILED ANALYSIS');
  console.log('═══════════════════════════════════════════════════════════\n');

  const { data: brains, error: brainsError } = await supabase
    .from('business_brains')
    .select('*')
    .limit(5);

  if (brainsError) {
    console.log('❌ Error querying business_brains:', brainsError.message);
  } else {
    console.log(`Found ${brains.length} business brains:\n`);
    brains.forEach(brain => {
      console.log(`ID: ${brain.id}`);
      console.log(`Name: ${brain.name || 'N/A'}`);
      console.log(`Level: ${brain.brain_level || 'N/A'}`);
      console.log(`Confidence: ${brain.confidence_score || 'N/A'}`);
      console.log(`Created: ${brain.created_at || 'N/A'}`);
      console.log('---');
    });
  }

  // Check brain_facts table
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('💡 BRAIN FACTS TABLE DETAILED ANALYSIS');
  console.log('═══════════════════════════════════════════════════════════\n');

  const { data: facts, error: factsError } = await supabase
    .from('brain_facts')
    .select('*')
    .limit(5);

  if (factsError) {
    console.log('❌ Error querying brain_facts:', factsError.message);
  } else {
    console.log(`Found ${facts.length} brain facts:\n`);
    facts.forEach(fact => {
      console.log(`ID: ${fact.id}`);
      console.log(`Brain ID: ${fact.brain_id || 'N/A'}`);
      console.log(`Category: ${fact.category || 'N/A'}`);
      console.log(`Fact: ${fact.fact_text?.substring(0, 100) || 'N/A'}...`);
      console.log(`Confidence: ${fact.confidence_score || 'N/A'}`);
      console.log('---');
    });
  }

  console.log('\n✅ Detailed schema check complete\n');
}

getDetailedSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
