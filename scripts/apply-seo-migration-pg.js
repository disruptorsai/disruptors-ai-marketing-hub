#!/usr/bin/env node

/**
 * Apply SEO Audit Migration using PostgreSQL Direct Connection
 * This uses the pg library to execute SQL directly against the database
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD;

if (!supabaseUrl) {
  log('❌ Missing VITE_SUPABASE_URL', 'red');
  process.exit(1);
}

// Extract project reference from URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  log('❌ Could not parse Supabase URL', 'red');
  process.exit(1);
}

// Check for database password
if (!dbPassword) {
  log('\n⚠️  DATABASE PASSWORD REQUIRED', 'yellow');
  log('=' .repeat(80), 'cyan');
  log('\nThis script requires direct database access via PostgreSQL.', 'yellow');
  log('Please add your database password to .env:\n');
  log('  SUPABASE_DB_PASSWORD=your_database_password', 'cyan');
  log('\nYou can find your database password in:');
  log(`  https://supabase.com/dashboard/project/${projectRef}/settings/database\n`);
  log('Alternatively, use the Supabase SQL Editor:', 'yellow');
  log(`  https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);
  log('And paste the contents of:');
  log(`  ${join(__dirname, '..', 'supabase', 'migrations', '20251016_seo_audit_tool.sql')}\n`, 'cyan');

  log('=' .repeat(80), 'cyan');
  process.exit(1);
}

// Construct connection string
const connectionString = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

async function executeSQL(client, sql) {
  try {
    const result = await client.query(sql);
    return { success: true, result };
  } catch (error) {
    // Check if it's a "already exists" error
    if (error.message.includes('already exists') ||
        error.message.includes('duplicate key') ||
        error.code === '42P07' || // relation already exists
        error.code === '42710') {  // object already exists
      return { success: true, skipped: true, message: 'Already exists' };
    }
    return { success: false, error };
  }
}

async function main() {
  log('\n🚀 SEO Audit Migration - PostgreSQL Direct Execution', 'bright');
  log('=' .repeat(80), 'cyan');

  log(`\nProject: ${projectRef}`, 'cyan');
  log(`Connection: postgresql://postgres.${projectRef}:***@aws-0-us-west-1.pooler.supabase.com:6543/postgres\n`);

  // Read migration file
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251016_seo_audit_tool.sql');
  log(`📄 Reading: ${migrationPath}`);

  const migrationSQL = readFileSync(migrationPath, 'utf8');
  log(`📦 Size: ${(migrationSQL.length / 1024).toFixed(2)} KB\n`);

  // Connect to database
  log('🔌 Connecting to database...', 'yellow');
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    log('✅ Connected to database!\n', 'green');

    // Execute migration as a single transaction
    log('🔧 Executing migration SQL...\n', 'yellow');

    await client.query('BEGIN');

    // Split into statements for better error handling
    const statements = migrationSQL
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => {
        return s.length > 0 &&
               !s.startsWith('--') &&
               !s.match(/^\/\*/) &&
               !s.match(/^\s*$/);
      });

    log(`Found ${statements.length} SQL statements\n`, 'cyan');

    let executed = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 60).replace(/\n/g, ' ') + '...';

      const result = await executeSQL(client, statement + ';');

      if (result.success) {
        if (result.skipped) {
          process.stdout.write('s');
          skipped++;
        } else {
          process.stdout.write('.');
          executed++;
        }
      } else {
        process.stdout.write('E');
        failed++;

        if (failed <= 5) {
          log(`\n⚠️  Statement ${i + 1} error:`, 'yellow');
          log(`   ${preview}`);
          log(`   Error: ${result.error.message}`, 'red');
        }
      }
    }

    await client.query('COMMIT');

    log('\n\n📊 Execution Results:', 'bright');
    log(`   ✅ Executed: ${executed}`, 'green');
    log(`   ⏭️  Skipped (already exists): ${skipped}`, 'yellow');
    log(`   ❌ Failed: ${failed}`, failed > 0 ? 'red' : 'reset');

    // Verify tables
    log('\n🔍 Verifying tables...\n', 'bright');

    const verifyQuery = `
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('seo_audits', 'seo_audit_sections', 'seo_audit_recommendations', 'seo_leads')
      ORDER BY table_name;
    `;

    const verifyResult = await client.query(verifyQuery);

    if (verifyResult.rows.length > 0) {
      log('✅ Tables created successfully:', 'green');
      verifyResult.rows.forEach(row => {
        log(`   • ${row.table_name}`, 'green');
      });
    } else {
      log('⚠️  No tables found!', 'yellow');
    }

    // Check RLS
    log('\n🔒 Verifying Row Level Security...\n', 'bright');

    const rlsQuery = `
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('seo_audits', 'seo_audit_sections', 'seo_audit_recommendations', 'seo_leads')
      ORDER BY tablename;
    `;

    const rlsResult = await client.query(rlsQuery);

    rlsResult.rows.forEach(row => {
      if (row.rowsecurity) {
        log(`   ✅ ${row.tablename} - RLS enabled`, 'green');
      } else {
        log(`   ⚠️  ${row.tablename} - RLS not enabled`, 'yellow');
      }
    });

    // Check indexes
    log('\n📇 Verifying indexes...\n', 'bright');

    const indexQuery = `
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('seo_audits', 'seo_audit_sections', 'seo_audit_recommendations', 'seo_leads')
      AND indexname LIKE 'idx_%'
      ORDER BY indexname;
    `;

    const indexResult = await client.query(indexQuery);

    if (indexResult.rows.length > 0) {
      log(`✅ ${indexResult.rows.length} indexes created:`, 'green');
      indexResult.rows.forEach(row => {
        log(`   • ${row.indexname}`, 'cyan');
      });
    }

    // Check functions
    log('\n⚙️  Verifying functions...\n', 'bright');

    const funcQuery = `
      SELECT proname, pronargs
      FROM pg_proc
      WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND proname IN ('update_seo_leads_updated_at', 'calculate_seo_audit_overall_score')
      ORDER BY proname;
    `;

    const funcResult = await client.query(funcQuery);

    if (funcResult.rows.length > 0) {
      log(`✅ ${funcResult.rows.length} functions created:`, 'green');
      funcResult.rows.forEach(row => {
        log(`   • ${row.proname}()`, 'cyan');
      });
    }

    // Check views
    log('\n👁️  Verifying views...\n', 'bright');

    const viewQuery = `
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      AND table_name = 'admin_seo_audit_summary';
    `;

    const viewResult = await client.query(viewQuery);

    if (viewResult.rows.length > 0) {
      log(`✅ Views created:`, 'green');
      viewResult.rows.forEach(row => {
        log(`   • ${row.table_name}`, 'cyan');
      });
    }

    log('\n' + '=' .repeat(80), 'cyan');
    log('✅ MIGRATION COMPLETED SUCCESSFULLY!', 'green');
    log('=' .repeat(80), 'cyan');

    log('\n💡 Next steps:', 'cyan');
    log('   1. Run verification: node scripts/verify-seo-audit-tables.js');
    log('   2. Test CRUD operations');
    log('   3. Verify RLS policies are working\n');

  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    await client.query('ROLLBACK');
    process.exit(1);
  } finally {
    await client.end();
    log('🔌 Database connection closed\n');
  }
}

main();
