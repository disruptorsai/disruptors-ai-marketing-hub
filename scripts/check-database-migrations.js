/**
 * Check Database Migration Status
 *
 * Verifies which migrations have been applied to the database
 * and identifies missing schema elements
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

async function checkTableExists(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })
    .limit(1);

  return !error;
}

async function checkColumnExists(tableName, columnName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);

    return !error;
  } catch {
    return false;
  }
}

async function getTableCount(tableName) {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    return error ? 'N/A' : count;
  } catch {
    return 'N/A';
  }
}

async function main() {
  console.log(`\n${colors.bright}${colors.cyan}=== DATABASE MIGRATION STATUS CHECK ===${colors.reset}\n`);

  // Check core tables
  const tables = {
    'users': ['id', 'email', 'full_name', 'role', 'created_at', 'updated_at'],
    'business_brains': ['id', 'slug', 'organization_id', 'name', 'business_name', 'brain_level', 'confidence_score'],
    'brain_assets': ['id', 'brain_id', 'asset_type', 'url', 'metadata'],
    'brain_themes': ['id', 'brain_id', 'primary_color', 'secondary_color'],
    'posts': ['id', 'title', 'slug', 'content', 'status', 'author', 'created_at'],
    'services': ['id', 'title', 'slug', 'description', 'icon'],
    'team_members': ['id', 'name', 'role', 'bio', 'photo_url'],
    'case_study': ['id', 'title', 'client_name', 'description'],
    'site_media': ['id', 'type', 'url', 'alt_text'],
    'modules': ['id', 'slug', 'name', 'status', 'audience', 'requires_brain'],
    'module_runs': ['id', 'module_id', 'user_id', 'brain_id', 'status', 'created_at'],
    'user_module_access': ['id', 'user_id', 'module_slug', 'access_granted'],
  };

  console.log(`${colors.bright}Checking Core Tables:${colors.reset}\n`);

  for (const [tableName, requiredColumns] of Object.entries(tables)) {
    const exists = await checkTableExists(tableName);

    if (exists) {
      const count = await getTableCount(tableName);
      console.log(`${colors.green}✓${colors.reset} ${tableName} (${count} records)`);

      // Check required columns
      const missingColumns = [];
      for (const col of requiredColumns) {
        const colExists = await checkColumnExists(tableName, col);
        if (!colExists) {
          missingColumns.push(col);
        }
      }

      if (missingColumns.length > 0) {
        console.log(`  ${colors.yellow}⚠ Missing columns: ${missingColumns.join(', ')}${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}✗${colors.reset} ${tableName} (table does not exist)`);
    }
  }

  // Check for migration history table
  console.log(`\n${colors.bright}Checking Migration History:${colors.reset}\n`);

  const migrationTables = [
    'schema_migrations',
    'supabase_migrations.schema_migrations',
    '_migrations',
  ];

  let migrationHistoryFound = false;
  for (const table of migrationTables) {
    try {
      const { data, error } = await supabase
        .from(table.replace('supabase_migrations.', ''))
        .select('*')
        .limit(5);

      if (!error && data) {
        console.log(`${colors.green}✓${colors.reset} Found migration history in: ${table}`);
        console.log(`  Applied migrations: ${data.length}`);
        migrationHistoryFound = true;
        break;
      }
    } catch {}
  }

  if (!migrationHistoryFound) {
    console.log(`${colors.yellow}⚠${colors.reset} No migration history table found - migrations may be managed manually`);
  }

  // List migration files
  console.log(`\n${colors.bright}Available Migration Files:${colors.reset}\n`);

  try {
    const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');
    const files = await readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

    for (const file of sqlFiles) {
      console.log(`  - ${file}`);
    }

    console.log(`\n  Total: ${sqlFiles.length} migration files`);
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Could not read migrations directory`);
  }

  console.log(`\n${colors.cyan}=== END OF REPORT ===${colors.reset}\n`);
}

main().catch(console.error);
