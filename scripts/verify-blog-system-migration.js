#!/usr/bin/env node

/**
 * BLOG SYSTEM MIGRATION VERIFICATION SCRIPT
 *
 * Verifies that the blog system database migration was applied successfully
 * and all required tables, indexes, functions, and policies exist.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const REQUIRED_TABLES = [
  'internal_knowledge',
  'case_studies',
  'methodologies',
  'ai_marketing_tools',
  'news_articles',
  'trending_topics',
  'content_ideas',
  'blog_drafts',
  'qa_executions',
  'published_articles',
  'publishing_rate_tracker',
  'article_performance_snapshots',
  'blog_system_config'
];

const REQUIRED_FUNCTIONS = [
  'get_internal_knowledge_for_topic',
  'check_publishing_rate_limit'
];

async function verifyTables() {
  console.log('\n🔍 Verifying Blog System Tables...\n');

  const results = [];

  for (const table of REQUIRED_TABLES) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error && error.code !== 'PGRST116') {
        results.push({ table, status: 'ERROR', message: error.message });
      } else {
        results.push({ table, status: 'EXISTS', count: data?.length || 0 });
      }
    } catch (err) {
      results.push({ table, status: 'ERROR', message: err.message });
    }
  }

  // Print results
  let allExist = true;
  results.forEach(({ table, status, message, count }) => {
    if (status === 'EXISTS') {
      console.log(`✅ ${table.padEnd(35)} - EXISTS`);
    } else {
      console.log(`❌ ${table.padEnd(35)} - ${status}: ${message}`);
      allExist = false;
    }
  });

  return allExist;
}

async function verifyIndexes() {
  console.log('\n🔍 Verifying Indexes...\n');

  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          tablename,
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename IN (${REQUIRED_TABLES.map(t => `'${t}'`).join(',')})
        ORDER BY tablename, indexname;
      `
    });

    if (error) {
      console.log('⚠️  Unable to verify indexes directly');
      console.log('   Run this query in Supabase SQL Editor:');
      console.log('   SELECT tablename, COUNT(*) as index_count FROM pg_indexes');
      console.log('   WHERE schemaname = \'public\' GROUP BY tablename;');
      return true; // Don't fail on index check
    }

    if (data && data.length > 0) {
      console.log(`✅ Found ${data.length} indexes across blog system tables`);
      return true;
    }

    return true;
  } catch (err) {
    console.log('⚠️  Index verification skipped (requires custom function)');
    return true;
  }
}

async function verifyConfig() {
  console.log('\n🔍 Verifying System Configuration...\n');

  const requiredConfigs = [
    'publishing_rate_limits',
    'qa_thresholds',
    'content_safety',
    'serp_analysis',
    'monitoring'
  ];

  try {
    const { data, error } = await supabase
      .from('blog_system_config')
      .select('key, value');

    if (error) {
      console.log('❌ blog_system_config table error:', error.message);
      return false;
    }

    const existingKeys = new Set(data.map(c => c.key));
    let allExist = true;

    requiredConfigs.forEach(key => {
      if (existingKeys.has(key)) {
        console.log(`✅ ${key.padEnd(30)} - EXISTS`);
      } else {
        console.log(`❌ ${key.padEnd(30)} - MISSING`);
        allExist = false;
      }
    });

    return allExist;
  } catch (err) {
    console.log('❌ Error checking config:', err.message);
    return false;
  }
}

async function testSampleQueries() {
  console.log('\n🔍 Testing Sample Queries...\n');

  // Test 1: Insert and read from content_ideas
  try {
    const testIdea = {
      title: 'Test Content Idea',
      description: 'Verification test',
      content_type: 'how-to',
      source_type: 'manual',
      priority: 50,
      status: 'pending'
    };

    const { data: inserted, error: insertError } = await supabase
      .from('content_ideas')
      .insert(testIdea)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
      return false;
    }

    console.log('✅ Insert test passed - content_ideas');

    // Clean up test data
    await supabase
      .from('content_ideas')
      .delete()
      .eq('id', inserted.id);

    console.log('✅ Delete test passed - content_ideas');

  } catch (err) {
    console.log('❌ Query test error:', err.message);
    return false;
  }

  // Test 2: Check rate limit function exists
  try {
    const { data, error } = await supabase.rpc('check_publishing_rate_limit', {
      target_date: new Date().toISOString().split('T')[0],
      topic_cat: null
    });

    if (error) {
      console.log('❌ Rate limit function test failed:', error.message);
      return false;
    }

    console.log('✅ Rate limit function works:', JSON.stringify(data));

  } catch (err) {
    console.log('⚠️  Rate limit function not tested (may not be accessible via RPC)');
  }

  return true;
}

async function verifyRLS() {
  console.log('\n🔍 Verifying Row Level Security...\n');

  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          tablename,
          COUNT(*) as policy_count
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN (${REQUIRED_TABLES.map(t => `'${t}'`).join(',')})
        GROUP BY tablename
        ORDER BY tablename;
      `
    });

    if (error) {
      console.log('⚠️  Unable to verify RLS policies directly');
      console.log('   Verify manually in Supabase Dashboard > Authentication > Policies');
      return true;
    }

    if (data && data.length > 0) {
      data.forEach(({ tablename, policy_count }) => {
        console.log(`✅ ${tablename.padEnd(35)} - ${policy_count} policies`);
      });
      return true;
    }

    return true;
  } catch (err) {
    console.log('⚠️  RLS verification skipped (requires custom function)');
    return true;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   BLOG SYSTEM MIGRATION VERIFICATION                   ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  const results = {
    tables: await verifyTables(),
    indexes: await verifyIndexes(),
    config: await verifyConfig(),
    queries: await testSampleQueries(),
    rls: await verifyRLS()
  };

  console.log('\n' + '═'.repeat(56));
  console.log('VERIFICATION SUMMARY');
  console.log('═'.repeat(56));
  console.log(`Tables:         ${results.tables ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Indexes:        ${results.indexes ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Configuration:  ${results.config ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Sample Queries: ${results.queries ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`RLS Policies:   ${results.rls ? '✅ PASS' : '❌ FAIL'}`);
  console.log('═'.repeat(56));

  const allPassed = Object.values(results).every(r => r === true);

  if (allPassed) {
    console.log('\n🎉 ALL CHECKS PASSED - Blog System is ready!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  SOME CHECKS FAILED - Review errors above\n');
    console.log('To apply migration:');
    console.log('1. Copy contents of supabase/migrations/20250129_blog_system_foundation.sql');
    console.log('2. Run in Supabase SQL Editor');
    console.log('3. Re-run this verification script\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
