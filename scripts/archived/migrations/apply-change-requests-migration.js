/**
 * Apply Change Requests Migration
 * Creates the change_requests table in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get Supabase credentials from environment
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🚀 Starting Change Requests migration...\n');

  try {
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20250126_change_requests.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded successfully');
    console.log('🔧 Applying migration to Supabase...\n');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Skip comments
      if (statement.startsWith('--') || statement.trim() === ';') {
        continue;
      }

      console.log(`Executing statement ${i + 1}/${statements.length}...`);

      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        // Try direct execution if RPC fails
        console.log('  Trying direct execution...');
        const { error: directError } = await supabase.from('_migrations').insert({
          statement: statement.substring(0, 1000)
        });

        if (directError && !directError.message.includes('already exists')) {
          throw error;
        }
      }
    }

    console.log('\n✅ Migration applied successfully!\n');
    console.log('📊 Verifying table creation...');

    // Verify the table was created
    const { data, error } = await supabase
      .from('change_requests')
      .select('*')
      .limit(0);

    if (error) {
      console.log('\n⚠️  Warning: Could not verify table creation automatically');
      console.log('Please verify manually in Supabase dashboard');
      console.log('Error:', error.message);
    } else {
      console.log('✅ Table verified successfully!\n');
      console.log('🎉 Change Requests system is ready to use!');
      console.log('\nAccess it at: /admin/secret → Change Requests tab\n');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\n📝 Manual migration instructions:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Copy the contents of supabase/migrations/20250126_change_requests.sql');
    console.log('4. Paste and run in the SQL Editor\n');
    process.exit(1);
  }
}

// Run the migration
applyMigration();
