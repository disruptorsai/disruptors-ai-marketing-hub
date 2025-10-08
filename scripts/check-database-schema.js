#!/usr/bin/env node

/**
 * Database Schema Inspection Script
 *
 * This script connects to the production Supabase database and inspects:
 * 1. All tables in the public schema
 * 2. Business Brain table existence
 * 3. Posts table schema (keyword columns)
 * 4. Users table schema
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔍 Inspecting database schema at:', SUPABASE_URL);
console.log('');

/**
 * Get all tables in the public schema
 */
async function getAllTables() {
  const { data, error } = await supabase.rpc('get_all_tables', {});

  if (error) {
    // If function doesn't exist, query information_schema directly
    const { data: tables, error: queryError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (queryError) {
      // Try raw SQL query via REST API
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          query: `
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
          `
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to query tables: ${response.statusText}`);
      }

      const result = await response.json();
      return result.map(row => row.table_name);
    }

    return tables.map(t => t.table_name);
  }

  return data;
}

/**
 * Get table schema (columns and types)
 */
async function getTableSchema(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(0);

  if (error) {
    return { error: error.message };
  }

  // Get column information from a single row query
  const { data: singleRow, error: rowError } = await supabase
    .from(tableName)
    .select('*')
    .limit(1)
    .maybeSingle();

  if (rowError && rowError.code !== 'PGRST116') {
    return { error: rowError.message };
  }

  const columns = singleRow ? Object.keys(singleRow) : [];

  return { columns };
}

/**
 * Check specific table existence and schema
 */
async function checkTable(tableName, expectedColumns = []) {
  const schema = await getTableSchema(tableName);

  if (schema.error) {
    return {
      exists: false,
      error: schema.error
    };
  }

  const missingColumns = expectedColumns.filter(col => !schema.columns.includes(col));

  return {
    exists: true,
    columns: schema.columns,
    missingColumns,
    complete: missingColumns.length === 0
  };
}

/**
 * Main inspection function
 */
async function inspectDatabase() {
  try {
    // 1. Get all tables
    console.log('📋 Fetching all tables in public schema...\n');

    let allTables = [];
    try {
      // Direct query to get table list
      const { data, error } = await supabase.rpc('exec_sql', {
        query: `
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `
      });

      if (error) {
        // Try getting a sample from known tables
        const knownTables = [
          'users', 'posts', 'business_brains', 'brain_facts',
          'brand_rules', 'brand_assets', 'onboarding_sessions',
          'knowledge_sources', 'posts_brain_facts'
        ];

        const tableChecks = await Promise.all(
          knownTables.map(async (table) => {
            const result = await getTableSchema(table);
            return { table, exists: !result.error };
          })
        );

        allTables = tableChecks.filter(t => t.exists).map(t => t.table);
      } else {
        allTables = data.map(row => row.table_name);
      }
    } catch (err) {
      console.error('Error fetching tables:', err.message);
      // Fallback: check known tables
      const knownTables = [
        'users', 'posts', 'business_brains', 'brain_facts',
        'brand_rules', 'brand_assets', 'onboarding_sessions',
        'knowledge_sources', 'posts_brain_facts'
      ];

      for (const table of knownTables) {
        const result = await getTableSchema(table);
        if (!result.error) {
          allTables.push(table);
        }
      }
    }

    console.log(`✅ Found ${allTables.length} tables:\n`);
    allTables.forEach(table => console.log(`   - ${table}`));
    console.log('');

    // 2. Check Business Brain tables
    console.log('🧠 Checking Business Brain tables...\n');

    const businessBrainTables = [
      'business_brains',
      'brain_facts',
      'brand_rules',
      'brand_assets',
      'onboarding_sessions',
      'knowledge_sources',
      'posts_brain_facts'
    ];

    const bbResults = {};
    for (const table of businessBrainTables) {
      const result = await checkTable(table);
      bbResults[table] = result;

      if (result.exists) {
        console.log(`   ✅ ${table} EXISTS (${result.columns.length} columns)`);
      } else {
        console.log(`   ❌ ${table} MISSING`);
      }
    }
    console.log('');

    // 3. Check posts table for keyword columns
    console.log('📝 Checking posts table schema...\n');

    const postsResult = await checkTable('posts', [
      'id', 'title', 'content', 'slug',
      'primary_keyword', 'secondary_keywords', 'keyword_data'
    ]);

    if (postsResult.exists) {
      console.log(`   ✅ posts table EXISTS with ${postsResult.columns.length} columns`);
      console.log(`   Columns: ${postsResult.columns.join(', ')}`);

      if (postsResult.columns.includes('primary_keyword')) {
        console.log('   ✅ primary_keyword column EXISTS');
      } else {
        console.log('   ❌ primary_keyword column MISSING');
      }

      if (postsResult.columns.includes('secondary_keywords')) {
        console.log('   ✅ secondary_keywords column EXISTS');
      } else {
        console.log('   ❌ secondary_keywords column MISSING');
      }

      if (postsResult.columns.includes('keyword_data')) {
        console.log('   ✅ keyword_data column EXISTS');
      } else {
        console.log('   ❌ keyword_data column MISSING');
      }
    } else {
      console.log('   ❌ posts table MISSING');
    }
    console.log('');

    // 4. Check users table
    console.log('👥 Checking users table schema...\n');

    const usersResult = await checkTable('users');

    if (usersResult.exists) {
      console.log(`   ✅ users table EXISTS with ${usersResult.columns.length} columns`);
      console.log(`   Columns: ${usersResult.columns.join(', ')}`);
    } else {
      console.log('   ❌ users table MISSING');
    }
    console.log('');

    // 5. Generate summary report
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 DATABASE SCHEMA SUMMARY REPORT');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`Total tables found: ${allTables.length}\n`);

    // Business Brain status
    const bbTablesExist = businessBrainTables.filter(t => bbResults[t]?.exists).length;
    const bbTablesTotal = businessBrainTables.length;

    console.log('🧠 Business Brain Migration Status:');
    if (bbTablesExist === 0) {
      console.log('   ❌ NOT APPLIED - No Business Brain tables exist');
      console.log('   ⚠️  ACTION REQUIRED: Run migration to enable Business Brain features');
      console.log('   📋 Command: node scripts/apply-business-brain-migration.js');
    } else if (bbTablesExist < bbTablesTotal) {
      console.log(`   ⚠️  PARTIAL - ${bbTablesExist}/${bbTablesTotal} tables exist`);
      console.log('   Missing tables:');
      businessBrainTables.forEach(t => {
        if (!bbResults[t]?.exists) {
          console.log(`      - ${t}`);
        }
      });
      console.log('   ⚠️  ACTION REQUIRED: Re-run migration to complete Business Brain setup');
    } else {
      console.log(`   ✅ COMPLETE - All ${bbTablesTotal} Business Brain tables exist`);
    }
    console.log('');

    // Keyword Research status
    console.log('🔍 Keyword Research System Status:');
    if (postsResult.exists) {
      const hasKeywordColumns = postsResult.columns.includes('primary_keyword') &&
                                postsResult.columns.includes('secondary_keywords');
      if (hasKeywordColumns) {
        console.log('   ✅ READY - posts table has keyword columns');
      } else {
        console.log('   ⚠️  INCOMPLETE - posts table missing keyword columns');
        console.log('   Missing: primary_keyword, secondary_keywords, keyword_data');
      }
    } else {
      console.log('   ❌ NOT READY - posts table does not exist');
    }
    console.log('');

    // Core tables status
    console.log('📋 Core Tables Status:');
    console.log(`   users: ${usersResult.exists ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`   posts: ${postsResult.exists ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log('');

    console.log('═══════════════════════════════════════════════════════════\n');

    // Return structured data
    return {
      allTables,
      businessBrain: {
        status: bbTablesExist === bbTablesTotal ? 'complete' :
                bbTablesExist === 0 ? 'not_applied' : 'partial',
        tablesExist: bbTablesExist,
        tablesTotal: bbTablesTotal,
        results: bbResults
      },
      posts: postsResult,
      users: usersResult
    };

  } catch (error) {
    console.error('❌ Error inspecting database:', error);
    throw error;
  }
}

// Run inspection
inspectDatabase()
  .then(() => {
    console.log('✅ Database inspection complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database inspection failed:', error);
    process.exit(1);
  });
