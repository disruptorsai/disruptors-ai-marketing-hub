#!/usr/bin/env node

/**
 * Direct SQL Execution for SEO Audit Migration
 * Uses Supabase REST API to execute SQL directly
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

async function executeSQLDirect(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ query: sql })
  });

  const text = await response.text();

  if (!response.ok) {
    // Try alternative endpoint
    const pgResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (!pgResponse.ok) {
      throw new Error(`Failed to execute SQL: ${response.status} - ${text}`);
    }
  }

  return text;
}

async function main() {
  console.log('🚀 Applying SEO Audit Migration Directly\n');

  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251016_seo_audit_tool.sql');
  console.log(`📄 Reading: ${migrationPath}`);

  const migrationSQL = readFileSync(migrationPath, 'utf8');

  // Split SQL into statements
  const statements = migrationSQL
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  console.log(`📦 Found ${statements.length} SQL statements\n`);
  console.log('🔧 Executing migration...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 60).replace(/\n/g, ' ') + '...';

    try {
      await executeSQLDirect(statement + ';');
      process.stdout.write('.');
      successCount++;
    } catch (error) {
      // Check if it's an "already exists" error
      if (error.message.includes('already exists') ||
          error.message.includes('duplicate') ||
          error.message.includes('relation') && error.message.includes('exists')) {
        process.stdout.write('s');
        skipCount++;
      } else {
        process.stdout.write('E');
        errorCount++;
        console.log(`\n⚠️  Statement ${i + 1} error: ${error.message}`);
        console.log(`    ${preview}`);
      }
    }

    // Small delay to avoid rate limiting
    if (i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n\n📊 Results:');
  console.log(`   ✅ Executed: ${successCount}`);
  console.log(`   ⏭️  Skipped (already exists): ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);

  if (errorCount === 0) {
    console.log('\n✅ Migration completed successfully!');
  } else {
    console.log('\n⚠️  Migration completed with some errors');
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
