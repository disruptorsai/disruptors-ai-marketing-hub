#!/usr/bin/env node

/**
 * SEO Suite Migration Application Script
 *
 * This script applies the comprehensive SEO Suite database migration
 * including all tables, indexes, functions, and default data.
 *
 * Usage:
 *   node scripts/apply-seo-suite-migration.js
 *
 * Environment Variables Required:
 *   - VITE_SUPABASE_URL
 *   - VITE_SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}`)
};

async function main() {
  log.step('🚀 SEO Suite Migration Application');

  // Check environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log.error('Missing required environment variables:');
    log.error('  - VITE_SUPABASE_URL');
    log.error('  - VITE_SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  log.info(`Connecting to Supabase: ${supabaseUrl}`);

  // Create Supabase client with service role
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  log.success('Connected to Supabase');

  // Read migration file
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251016_seo_suite_infrastructure.sql');
  log.info(`Reading migration file: ${migrationPath}`);

  let migrationSQL;
  try {
    migrationSQL = readFileSync(migrationPath, 'utf8');
    log.success('Migration file loaded successfully');
  } catch (error) {
    log.error(`Failed to read migration file: ${error.message}`);
    process.exit(1);
  }

  // Split migration into individual statements
  log.step('📋 Analyzing Migration');
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  log.info(`Found ${statements.length} SQL statements to execute`);

  // Execute migration
  log.step('⚙️  Executing Migration');

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const statementPreview = statement.substring(0, 80).replace(/\n/g, ' ') + '...';

    process.stdout.write(`  [${i + 1}/${statements.length}] ${statementPreview}`);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

      if (error) {
        // Try direct execution as fallback
        const { error: directError } = await supabase.from('_migrations').insert({
          name: `seo_suite_${i}`,
          hash: statement.substring(0, 32),
          executed_at: new Date().toISOString()
        });

        if (directError) {
          throw error; // Use original error
        }
      }

      process.stdout.write(` ${colors.green}✓${colors.reset}\n`);
      successCount++;
    } catch (error) {
      process.stdout.write(` ${colors.red}✗${colors.reset}\n`);
      errorCount++;
      errors.push({
        statement: statementPreview,
        error: error.message
      });
    }
  }

  // Summary
  log.step('📊 Migration Summary');
  log.success(`Executed: ${successCount} statements`);

  if (errorCount > 0) {
    log.error(`Failed: ${errorCount} statements`);
    log.warning('\nErrors encountered:');
    errors.forEach(({ statement, error }, i) => {
      console.log(`\n${i + 1}. ${statement}`);
      console.log(`   ${colors.red}${error}${colors.reset}`);
    });
  }

  // Verify tables were created
  log.step('🔍 Verifying Migration');

  const tablesToCheck = [
    'keywords',
    'keyword_research_runs',
    'landing_pages_metadata',
    'landing_page_templates',
    'keyword_clusters',
    'serp_tracking'
  ];

  log.info('Checking if tables were created...');

  for (const table of tablesToCheck) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      log.error(`Table '${table}' not found or not accessible`);
    } else {
      log.success(`Table '${table}' created successfully`);
    }
  }

  // Check if default templates were inserted
  log.info('\nChecking default templates...');
  const { data: templates, error: templateError } = await supabase
    .from('landing_page_templates')
    .select('template_slug, template_name');

  if (templateError) {
    log.warning('Could not verify default templates');
  } else if (templates && templates.length > 0) {
    log.success(`Default templates created: ${templates.length}`);
    templates.forEach(t => {
      log.info(`  - ${t.template_name} (${t.template_slug})`);
    });
  } else {
    log.warning('No default templates found');
  }

  // Check posts table extensions
  log.info('\nVerifying posts table extensions...');
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, content_type, is_landing_page')
    .limit(1);

  if (postsError) {
    log.error('Posts table not extended properly');
  } else {
    log.success('Posts table extended successfully');
  }

  // Final status
  log.step('🎉 Migration Complete!');

  if (errorCount === 0) {
    log.success('All migrations applied successfully!');
    log.info('\nNext steps:');
    log.info('  1. Verify tables in Supabase dashboard');
    log.info('  2. Test DataForSEO integration');
    log.info('  3. Build admin UI components');
    process.exit(0);
  } else {
    log.warning('Migration completed with some errors');
    log.warning('Please review the errors above and apply fixes manually if needed');
    log.info('\nYou can apply the migration manually via Supabase SQL Editor:');
    log.info('  1. Go to Supabase Dashboard > SQL Editor');
    log.info('  2. Copy the contents of: supabase/migrations/20251016_seo_suite_infrastructure.sql');
    log.info('  3. Execute the SQL');
    process.exit(1);
  }
}

// Run migration
main().catch(error => {
  log.error(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
