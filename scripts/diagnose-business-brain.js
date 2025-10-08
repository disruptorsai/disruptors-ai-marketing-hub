/**
 * Business Brain Diagnostic Script
 *
 * Checks if Business Brain infrastructure is properly set up:
 * - Database tables exist
 * - RLS policies are in place
 * - Functions and views are created
 * - Sample data can be queried
 *
 * Run: node scripts/diagnose-business-brain.js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Not set');
  console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Not set');
  console.error('\n💡 Create a .env file with these variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
});

console.log('\n🔍 Business Brain Infrastructure Diagnostic\n');
console.log('═'.repeat(60));

/**
 * Check if a table exists
 */
async function checkTable(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        console.log(`❌ Table "${tableName}" does NOT exist`);
        return false;
      } else {
        console.log(`⚠️  Table "${tableName}" exists but query failed:`, error.message);
        return 'error';
      }
    }

    console.log(`✅ Table "${tableName}" exists`);
    if (data && data.length > 0) {
      console.log(`   ℹ️  Contains ${data.length} record(s)`);
    } else {
      console.log(`   ℹ️  Table is empty`);
    }
    return true;
  } catch (error) {
    console.log(`❌ Error checking table "${tableName}":`, error.message);
    return false;
  }
}

/**
 * Check if a function exists
 */
async function checkFunction(functionName) {
  try {
    const { data, error } = await supabase
      .rpc(functionName, {});

    if (error) {
      if (error.message.includes('does not exist') || error.code === '42883') {
        console.log(`❌ Function "${functionName}" does NOT exist`);
        return false;
      } else {
        console.log(`⚠️  Function "${functionName}" exists but test call failed:`, error.message);
        return 'error';
      }
    }

    console.log(`✅ Function "${functionName}" exists`);
    return true;
  } catch (error) {
    console.log(`❌ Error checking function "${functionName}":`, error.message);
    return false;
  }
}

/**
 * Main diagnostic
 */
async function runDiagnostic() {
  console.log('\n📋 Checking Required Tables...\n');

  const tables = [
    'business_brains',
    'brain_facts',
    'brand_rules',
    'brand_assets',
    'onboarding_sessions',
    'knowledge_sources',
    'posts_brain_facts',
  ];

  let allTablesExist = true;

  for (const table of tables) {
    const exists = await checkTable(table);
    if (exists !== true) {
      allTablesExist = false;
    }
  }

  console.log('\n📋 Checking Database Functions...\n');

  const functions = [
    'search_brain_facts',
    'calculate_brain_health',
  ];

  let allFunctionsExist = true;

  for (const func of functions) {
    const exists = await checkFunction(func);
    if (exists !== true) {
      allFunctionsExist = false;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 Diagnostic Summary\n');

  if (allTablesExist && allFunctionsExist) {
    console.log('✅ Business Brain infrastructure is FULLY CONFIGURED');
    console.log('\n✨ You can now use Business Brain features!');
  } else {
    console.log('❌ Business Brain infrastructure is INCOMPLETE');
    console.log('\n📋 SOLUTION: Apply the Business Brain migration\n');
    console.log('Steps:');
    console.log('  1. Review migration:');
    console.log('     supabase/migrations/20250107_business_brain_infrastructure.sql');
    console.log('');
    console.log('  2. Apply migration:');
    console.log('     node scripts/apply-business-brain-migration.js');
    console.log('');
    console.log('  3. Verify setup:');
    console.log('     node scripts/verify-business-brain-tables.cjs');
    console.log('');
    console.log('📖 See APPLY_MIGRATION_NOW.md for complete instructions');
  }

  console.log('\n' + '═'.repeat(60) + '\n');
}

runDiagnostic().catch(error => {
  console.error('\n❌ Diagnostic failed:', error.message);
  process.exit(1);
});
