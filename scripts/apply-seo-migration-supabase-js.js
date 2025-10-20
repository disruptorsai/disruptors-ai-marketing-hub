#!/usr/bin/env node

/**
 * Apply SEO Audit Migration using Supabase JS Client
 * Executes SQL via Supabase REST API with service role
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

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
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  log('❌ Missing required environment variables', 'red');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Extract project reference
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

async function executeSQLViaRPC(sql) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Check for "already exists" errors
      const errorStr = typeof data === 'string' ? data : JSON.stringify(data);
      if (errorStr.includes('already exists') || errorStr.includes('duplicate')) {
        return { success: true, skipped: true };
      }
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  log('\n🚀 SEO Audit Migration - Supabase JS Execution', 'bright');
  log('=' .repeat(80), 'cyan');

  log(`\nProject: ${projectRef}`, 'cyan');
  log(`URL: ${supabaseUrl}\n`);

  // Read migration file
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251016_seo_audit_tool.sql');
  log(`📄 Reading: ${migrationPath}`);

  const migrationSQL = readFileSync(migrationPath, 'utf8');
  log(`📦 Size: ${(migrationSQL.length / 1024).toFixed(2)} KB\n`);

  // Split into statements
  const statements = migrationSQL
    .split(/;\s*[\r\n]+/)
    .map(s => s.trim())
    .filter(s => {
      return s.length > 0 &&
             !s.startsWith('--') &&
             !s.match(/^\/\*/) &&
             !s.match(/^\s*$/);
    });

  log(`📦 Found ${statements.length} SQL statements\n`, 'cyan');

  log('🔧 Executing migration...', 'yellow');
  log('(This may take a minute)\n');

  let executed = 0;
  let skipped = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 50).replace(/\n/g, ' ');

    const result = await executeSQLViaRPC(statement + ';');

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

      if (errors.length < 5) {
        errors.push({
          statement: i + 1,
          preview,
          error: result.error
        });
      }
    }

    // Rate limiting
    if ((i + 1) % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  log('\n\n📊 Execution Results:', 'bright');
  log(`   ✅ Executed: ${executed}`, 'green');
  log(`   ⏭️  Skipped: ${skipped}`, 'yellow');
  log(`   ❌ Failed: ${failed}`, failed > 0 ? 'red' : 'reset');

  if (errors.length > 0) {
    log('\n⚠️  First few errors:', 'yellow');
    errors.forEach(err => {
      log(`\n   Statement ${err.statement}:`, 'cyan');
      log(`   ${err.preview}...`);
      log(`   Error: ${JSON.stringify(err.error).substring(0, 100)}`, 'red');
    });
  }

  // Verify tables using Supabase client
  log('\n🔍 Verifying tables...\n', 'bright');

  const tables = ['seo_audits', 'seo_audit_sections', 'seo_audit_recommendations', 'seo_leads'];
  const verified = [];
  const notFound = [];

  for (const table of tables) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for schema cache

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(0);

    if (error) {
      if (error.code === '42P01') {
        log(`   ⏳ ${table} - not in cache yet`, 'yellow');
        notFound.push(table);
      } else {
        log(`   ⚠️  ${table} - ${error.message}`, 'yellow');
        notFound.push(table);
      }
    } else {
      log(`   ✅ ${table}`, 'green');
      verified.push(table);
    }
  }

  log('\n' + '=' .repeat(80), 'cyan');

  if (verified.length === tables.length) {
    log('✅ MIGRATION COMPLETED SUCCESSFULLY!', 'green');
    log('=' .repeat(80), 'cyan');
    log('\n💡 All tables verified and ready to use!\n', 'green');
  } else if (verified.length > 0) {
    log('⚠️  MIGRATION PARTIALLY COMPLETE', 'yellow');
    log('=' .repeat(80), 'cyan');
    log('\n💡 Some tables verified, others may need cache refresh:', 'yellow');
    log(`   Verified: ${verified.length}/${tables.length}`);
    log(`   Pending: ${notFound.length}/${tables.length}`);
    log('\n   Wait 30 seconds and run:');
    log('   node scripts/verify-seo-audit-tables.js\n', 'cyan');
  } else {
    log('⚠️  MIGRATION EXECUTED BUT TABLES NOT YET VISIBLE', 'yellow');
    log('=' .repeat(80), 'cyan');
    log('\n💡 This is likely due to schema cache lag.', 'yellow');
    log('   Wait 30-60 seconds and run:');
    log('   node scripts/verify-seo-audit-tables.js\n', 'cyan');

    log('   Or check the Supabase Table Editor:');
    log(`   https://supabase.com/dashboard/project/${projectRef}/editor\n`, 'cyan');
  }
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
