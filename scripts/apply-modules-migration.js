/**
 * Apply Modules Infrastructure Migration
 *
 * This script applies the modules system migration to the Supabase database.
 * It reads the SQL migration file and executes it using a direct PostgreSQL connection.
 *
 * Usage: node scripts/apply-modules-migration.js
 *
 * Requires environment variables:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(dirname(__dirname), '.env') });

// Initialize Supabase client with service role
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ ERROR: Missing environment variables');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

console.log('═══════════════════════════════════════════════════');
console.log('  Disruptors AI - Modules Migration Script');
console.log('═══════════════════════════════════════════════════\n');

/**
 * Parse connection string from Supabase URL
 */
function getPostgresConnectionString() {
  // Extract project ref from Supabase URL
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match) {
    throw new Error('Invalid Supabase URL format');
  }

  const projectRef = match[1];

  // Construct direct PostgreSQL connection string
  // Note: This requires the database password which is not in the JWT
  // For now, we'll use Supabase's REST API approach instead
  return null;
}

/**
 * Apply migration using Supabase client
 *
 * Since Supabase doesn't support executing raw SQL via the client library,
 * we'll need to use the SQL Editor in the dashboard or use pg library with connection string
 */
async function applyMigrationManually() {
  const migrationPath = join(dirname(__dirname), 'supabase', 'migrations', '20251010_modules_infrastructure.sql');
  const migrationSql = readFileSync(migrationPath, 'utf8');

  console.log('📋 Migration file loaded successfully');
  console.log(`📄 File: ${migrationPath}`);
  console.log(`📊 Size: ${(migrationSql.length / 1024).toFixed(2)} KB\n`);

  console.log('⚠️  MANUAL MIGRATION REQUIRED\n');
  console.log('Supabase client does not support executing raw SQL migrations.');
  console.log('Please apply this migration manually:\n');
  console.log('1. Open Supabase Dashboard SQL Editor:');
  console.log(`   https://supabase.com/dashboard/project/${supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1]}/sql/new\n`);
  console.log('2. Copy the contents of this file:');
  console.log(`   ${migrationPath}\n`);
  console.log('3. Paste into the SQL Editor');
  console.log('4. Click "Run" button\n');
  console.log('5. Verify the migration:');
  console.log('   node scripts/verify-modules-migration.js\n');

  // Test connection to ensure credentials work
  console.log('Testing database connection...');
  const { error } = await supabase.from('business_brains').select('count').limit(1);

  if (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\nPlease check your environment variables:\n');
    console.log('- VITE_SUPABASE_URL');
    console.log('- VITE_SUPABASE_SERVICE_ROLE_KEY\n');
  } else {
    console.log('✅ Database connection successful\n');
  }
}

/**
 * Verify if migration is already applied
 */
async function verifyMigration() {
  console.log('Checking if migration is already applied...\n');

  try {
    const { data, error } = await supabase
      .from('modules')
      .select('count')
      .limit(1);

    if (error) {
      // Check for table not found errors
      if (
        error.message.includes('does not exist') ||
        error.message.includes('schema cache') ||
        error.code === '42P01' ||
        error.code === 'PGRST204'
      ) {
        return false;
      }
      // Other errors should be thrown
      throw error;
    }

    return true;
  } catch (err) {
    // Catch any other errors and treat as "not applied"
    if (
      err.message.includes('does not exist') ||
      err.message.includes('schema cache') ||
      err.code === '42P01'
    ) {
      return false;
    }
    throw err;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const isApplied = await verifyMigration();

    if (isApplied) {
      console.log('✅ Migration is already applied!');
      console.log('   The modules table exists and is ready to use.\n');
      console.log('Next step: Seed initial modules data');
      console.log('  node scripts/seed-modules.js\n');
    } else {
      console.log('❌ Migration not yet applied\n');
      await applyMigrationManually();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════');
  console.log('  Done!');
  console.log('═══════════════════════════════════════════════════\n');
}

main();
