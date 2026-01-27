#!/usr/bin/env node

/**
 * Verify site_media table structure and get detailed information
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'ubqxflzuvxowigbjmqfb';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

async function executeSQL(sql, description) {
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`✗ ${description}: ${error}`);
      return null;
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error(`✗ ${description}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('Verifying site_media table...\n');

  // 1. Check if table exists
  console.log('1. Checking table existence...');
  const tableCheck = await executeSQL(
    "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'site_media');",
    'Table existence check'
  );

  if (tableCheck && tableCheck[0]?.exists) {
    console.log('✓ Table site_media exists\n');
  } else {
    console.log('✗ Table site_media does not exist\n');
    return;
  }

  // 2. Get column information
  console.log('2. Getting column structure...');
  const columns = await executeSQL(
    `SELECT
      column_name,
      data_type,
      character_maximum_length,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'site_media'
    ORDER BY ordinal_position;`,
    'Column information'
  );

  if (columns && columns.length > 0) {
    console.log(`✓ Found ${columns.length} columns:\n`);
    columns.forEach(col => {
      console.log(`  - ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    console.log();
  }

  // 3. Get indexes
  console.log('3. Getting indexes...');
  const indexes = await executeSQL(
    `SELECT
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'site_media';`,
    'Index information'
  );

  if (indexes && indexes.length > 0) {
    console.log(`✓ Found ${indexes.length} indexes:\n`);
    indexes.forEach(idx => {
      console.log(`  - ${idx.indexname}`);
    });
    console.log();
  }

  // 4. Get constraints
  console.log('4. Getting constraints...');
  const constraints = await executeSQL(
    `SELECT
      conname AS constraint_name,
      contype AS constraint_type
    FROM pg_constraint
    WHERE conrelid = 'public.site_media'::regclass;`,
    'Constraint information'
  );

  if (constraints && constraints.length > 0) {
    console.log(`✓ Found ${constraints.length} constraints:\n`);
    constraints.forEach(con => {
      const type = con.constraint_type === 'p' ? 'PRIMARY KEY' :
                   con.constraint_type === 'u' ? 'UNIQUE' :
                   con.constraint_type === 'c' ? 'CHECK' :
                   con.constraint_type === 'f' ? 'FOREIGN KEY' : con.constraint_type;
      console.log(`  - ${con.constraint_name.padEnd(40)} ${type}`);
    });
    console.log();
  }

  // 5. Get RLS policies
  console.log('5. Getting RLS policies...');
  const policies = await executeSQL(
    `SELECT
      polname AS policy_name,
      polcmd AS command,
      polroles::regrole[] AS roles,
      polqual AS qual
    FROM pg_policy
    WHERE polrelid = 'public.site_media'::regclass;`,
    'RLS policy information'
  );

  if (policies && policies.length > 0) {
    console.log(`✓ Found ${policies.length} RLS policies:\n`);
    policies.forEach(pol => {
      const cmd = pol.command === '*' ? 'ALL' :
                  pol.command === 'r' ? 'SELECT' :
                  pol.command === 'a' ? 'INSERT' :
                  pol.command === 'w' ? 'UPDATE' :
                  pol.command === 'd' ? 'DELETE' : pol.command;
      console.log(`  - ${pol.policy_name.padEnd(45)} ${cmd}`);
    });
    console.log();
  }

  // 6. Get triggers
  console.log('6. Getting triggers...');
  const triggers = await executeSQL(
    `SELECT
      trigger_name,
      event_manipulation,
      action_timing
    FROM information_schema.triggers
    WHERE event_object_schema = 'public'
      AND event_object_table = 'site_media';`,
    'Trigger information'
  );

  if (triggers && triggers.length > 0) {
    console.log(`✓ Found ${triggers.length} triggers:\n`);
    triggers.forEach(trig => {
      console.log(`  - ${trig.trigger_name.padEnd(40)} ${trig.action_timing} ${trig.event_manipulation}`);
    });
    console.log();
  }

  // 7. Test query
  console.log('7. Testing table access...');
  const testQuery = await executeSQL(
    `SELECT COUNT(*) as count FROM site_media;`,
    'Test query'
  );

  if (testQuery) {
    console.log(`✓ Table is accessible. Current row count: ${testQuery[0]?.count || 0}\n`);
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✓ VERIFICATION COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('Table site_media is ready for use!');
  console.log('\nView in Supabase Dashboard:');
  console.log(`https://supabase.com/dashboard/project/${PROJECT_REF}/editor/site_media`);
}

main();
