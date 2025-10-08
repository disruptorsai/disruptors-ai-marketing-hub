/**
 * Apply AI Content Writer Enhancements Migration
 *
 * This script applies the database migration for AI Content Writer enhancements:
 * - Adds editor_notes column to posts table
 * - Creates content_settings table with RLS policies
 * - Adds indexes for performance
 * - Creates triggers and views
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Read migration SQL file
 */
function readMigrationFile() {
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251008_ai_content_writer_enhancements.sql');

  try {
    const sql = readFileSync(migrationPath, 'utf-8');
    console.log('✅ Migration file loaded successfully');
    return sql;
  } catch (error) {
    console.error('❌ Failed to read migration file:', error.message);
    process.exit(1);
  }
}

/**
 * Execute SQL migration
 */
async function executeMigration(sql) {
  console.log('\n📝 Executing migration...');

  try {
    // Execute the SQL migration
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct execution (for local dev)
      console.log('⚠️  exec_sql RPC not found, attempting direct execution...');

      // Split by semicolon and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        const { error: execError } = await supabase.rpc('exec', { sql: statement });
        if (execError) {
          console.error(`❌ Error executing statement: ${execError.message}`);
          console.error(`Statement: ${statement.substring(0, 100)}...`);
          throw execError;
        }
      }
    }

    console.log('✅ Migration executed successfully');
    return true;
  } catch (error) {
    console.error('❌ Migration execution failed:', error.message);
    return false;
  }
}

/**
 * Verify migration results
 */
async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');

  const checks = [];

  // Check 1: Verify editor_notes column exists in posts table
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('editor_notes')
      .limit(1);

    if (!error) {
      console.log('✅ posts.editor_notes column exists');
      checks.push(true);
    } else {
      console.error('❌ posts.editor_notes column missing:', error.message);
      checks.push(false);
    }
  } catch (error) {
    console.error('❌ Error checking posts.editor_notes:', error.message);
    checks.push(false);
  }

  // Check 2: Verify content_settings table exists
  try {
    const { data, error } = await supabase
      .from('content_settings')
      .select('id')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      // PGRST116 = no rows found, which is fine - table exists but empty
      console.log('✅ content_settings table exists (empty)');
      checks.push(true);
    } else if (!error) {
      console.log('✅ content_settings table exists with data');
      checks.push(true);
    } else if (error.code === '42P01') {
      console.error('❌ content_settings table does not exist');
      checks.push(false);
    } else {
      console.error('❌ Error checking content_settings table:', error.message);
      checks.push(false);
    }
  } catch (error) {
    console.error('❌ Error checking content_settings:', error.message);
    checks.push(false);
  }

  // Check 3: Verify content_settings columns
  try {
    const { data, error } = await supabase
      .from('content_settings')
      .select('brain_id, focus_keywords, ai_writing_directives, default_word_count_min, default_word_count_max')
      .limit(1);

    if (!error || error.code === 'PGRST116') {
      console.log('✅ content_settings has all required columns');
      checks.push(true);
    } else {
      console.error('❌ content_settings missing columns:', error.message);
      checks.push(false);
    }
  } catch (error) {
    console.error('❌ Error checking content_settings columns:', error.message);
    checks.push(false);
  }

  const allPassed = checks.every(check => check === true);

  if (allPassed) {
    console.log('\n✅ Migration verification PASSED - All checks successful');
  } else {
    console.log('\n❌ Migration verification FAILED - Some checks failed');
  }

  return allPassed;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 AI Content Writer Migration Script');
  console.log('=====================================\n');

  console.log('📋 This migration will:');
  console.log('   1. Add editor_notes column to posts table');
  console.log('   2. Create content_settings table');
  console.log('   3. Set up RLS policies for content_settings');
  console.log('   4. Create indexes for performance');
  console.log('   5. Add triggers and views\n');

  // Read migration file
  const sql = readMigrationFile();

  // Execute migration
  const success = await executeMigration(sql);

  if (!success) {
    console.error('\n❌ Migration failed');
    process.exit(1);
  }

  // Verify migration
  const verified = await verifyMigration();

  if (!verified) {
    console.error('\n⚠️  Migration executed but verification failed');
    console.error('   Please check your database manually');
    process.exit(1);
  }

  console.log('\n🎉 Migration completed successfully!');
  console.log('\nNext steps:');
  console.log('   1. Open AI Content Writer at /app/content-writer');
  console.log('   2. Test the new Calendar and Settings tabs');
  console.log('   3. Try editing a post and adding editor notes');
  console.log('   4. Configure content settings with keywords and directives\n');
}

// Run the script
main().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
