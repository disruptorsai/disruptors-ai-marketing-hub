#!/usr/bin/env node

/**
 * SEO Audit Tool - Direct PostgreSQL Migration
 * Uses direct database connection to apply schema
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

require('dotenv').config();

async function applyMigration() {
  console.log('🚀 SEO Audit Tool - Direct PostgreSQL Migration\n');

  // Parse Supabase URL to get connection details
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL) {
    console.error('❌ VITE_SUPABASE_URL not found in environment');
    process.exit(1);
  }

  // Extract project ref from Supabase URL
  // Format: https://PROJECT_REF.supabase.co
  const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

  // Supabase database connection details
  const connectionString = `postgresql://postgres.${projectRef}:${process.env.SUPABASE_DB_PASSWORD || '[YOUR_DB_PASSWORD]'}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

  console.log('📡 Connection details:');
  console.log(`   Project: ${projectRef}`);
  console.log(`   Host: aws-0-us-east-1.pooler.supabase.com`);
  console.log(`   Port: 6543\n`);

  // Check if database password is available
  if (!process.env.SUPABASE_DB_PASSWORD) {
    console.log('⚠️  Database password not found in environment.');
    console.log('');
    console.log('To apply migration via direct connection:');
    console.log('1. Get your database password from Supabase Dashboard → Settings → Database');
    console.log('2. Add to .env file: SUPABASE_DB_PASSWORD=your_password_here');
    console.log('3. Run this script again\n');
    console.log('OR apply manually via Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/' + projectRef + '/sql/new\n');

    // Copy SQL to clipboard as fallback
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251016_seo_audit_tool.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    if (process.platform === 'darwin') {
      const { execSync } = require('child_process');
      try {
        execSync('pbcopy', { input: migrationSQL });
        console.log('✅ Migration SQL copied to clipboard!');
        console.log('   Just paste (Cmd+V) into the SQL Editor and click Run\n');
      } catch (e) {
        console.log('❌ Could not copy to clipboard\n');
      }
    }

    return;
  }

  // Create PostgreSQL client
  const client = new Client({ connectionString });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251016_seo_audit_tool.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log(`📝 Executing migration (${migrationSQL.length} bytes)...\n`);

    // Execute the migration
    await client.query(migrationSQL);

    console.log('✅ Migration applied successfully!\n');

    // Verify tables
    console.log('🔍 Verifying tables...\n');

    const result = await client.query(`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'seo_%'
      ORDER BY table_name;
    `);

    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name} (${row.table_type})`);
    });

    // Check RLS
    console.log('\n🔒 Verifying Row Level Security...\n');

    const rlsResult = await client.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename LIKE 'seo_%';
    `);

    rlsResult.rows.forEach(row => {
      const status = row.rowsecurity ? '✓ ENABLED' : '❌ DISABLED';
      console.log(`   ${status}: ${row.tablename}`);
    });

    console.log('\n✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);

    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Tables already exist - migration may have been applied previously');
      console.log('   Run verification: node scripts/verify-seo-audit-tables.js\n');
    } else {
      console.log('\n📋 Please apply manually via Supabase SQL Editor\n');
    }

  } finally {
    await client.end();
  }
}

applyMigration().catch(console.error);
