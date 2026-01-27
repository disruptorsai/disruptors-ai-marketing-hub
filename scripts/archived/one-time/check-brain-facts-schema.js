#!/usr/bin/env node

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

async function checkBrainFactsSchema() {
  console.log('🔍 Checking brain_facts table schema...\n');

  // Get actual data with all columns
  const { data: facts, error } = await supabase
    .from('brain_facts')
    .select('*')
    .limit(3);

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`Found ${facts.length} facts\n`);

  if (facts.length > 0) {
    console.log('Sample fact (full data):');
    console.log(JSON.stringify(facts[0], null, 2));
    console.log('\n');

    console.log('Columns found:');
    Object.keys(facts[0]).forEach(col => {
      const value = facts[0][col];
      const type = typeof value;
      console.log(`  - ${col}: ${type} ${value !== null ? `(value: ${JSON.stringify(value).substring(0, 50)})` : '(null)'}`);
    });
  }

  // Check posts table without keyword_data
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📝 Posts table (without keyword_data column)');
  console.log('═══════════════════════════════════════════════════════════\n');

  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, title, primary_keyword, secondary_keywords, brain_id, ai_generated')
    .limit(3);

  if (postsError) {
    console.error('❌ Error:', postsError.message);
  } else {
    posts.forEach(post => {
      console.log(`\nPost: ${post.title || 'Untitled'}`);
      console.log(`  ID: ${post.id}`);
      console.log(`  Primary Keyword: ${post.primary_keyword || 'N/A'}`);
      console.log(`  Secondary Keywords: ${post.secondary_keywords || 'N/A'}`);
      console.log(`  Brain ID: ${post.brain_id || 'N/A'}`);
      console.log(`  AI Generated: ${post.ai_generated}`);
    });
  }

  // Check posts_brain_facts table structure
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🔗 posts_brain_facts junction table');
  console.log('═══════════════════════════════════════════════════════════\n');

  const { count, error: countError } = await supabase
    .from('posts_brain_facts')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.log('❌ Error checking posts_brain_facts:', countError.message);
  } else {
    console.log(`✅ Table exists with ${count} rows`);
  }
}

checkBrainFactsSchema()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
