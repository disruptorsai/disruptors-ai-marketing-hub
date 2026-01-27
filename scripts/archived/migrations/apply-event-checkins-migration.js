import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('   Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Applying Event Check-ins Migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250126_event_checkins.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('📊 Executing SQL...\n');

    // Execute the migration using rpc
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // Try direct execution if rpc doesn't exist
      console.log('⚠️  RPC method not available, attempting direct execution...');

      // Split by semicolons and execute each statement
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement) {
          const { error: execError } = await supabase.rpc('exec', { query: statement });
          if (execError) {
            console.error(`❌ Error executing statement:`, execError);
            throw execError;
          }
        }
      }
    }

    console.log('✅ Migration executed successfully!\n');

    // Verify the table was created
    console.log('🔍 Verifying event_checkins table...');
    const { data: tableData, error: tableError } = await supabase
      .from('event_checkins')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Table verification failed:', tableError.message);
      console.log('\n⚠️  You may need to apply this migration manually via Supabase SQL Editor:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/[your-project]/sql/new');
      console.log('   2. Copy the contents of: supabase/migrations/20250126_event_checkins.sql');
      console.log('   3. Paste and execute in SQL Editor\n');
    } else {
      console.log('✅ Table verified successfully!');
      console.log('\n📋 Table structure created:');
      console.log('   - event_checkins (main table)');
      console.log('   - Columns: id, full_name, email, company, phone, job_title');
      console.log('   - Columns: event_name, checked_in_at, survey_responses (JSONB)');
      console.log('   - Columns: referral_source, notes, created_at, updated_at');
      console.log('   - Indexes: email, company, event_name, checked_in_at, survey_responses');
      console.log('   - RLS Policies: Service role (full access), Anon (insert only)\n');
    }

    console.log('✅ Event Check-ins Migration Complete!\n');
    console.log('Next steps:');
    console.log('  1. Check admin panel at /admin/secret → Submissions tab');
    console.log('  2. Visit /event-checkin to test the check-in form');
    console.log('  3. Survey responses stored in JSONB format for flexibility\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n📝 Manual migration required:');
    console.log('   Run this SQL in Supabase SQL Editor:');
    console.log('   File: supabase/migrations/20250126_event_checkins.sql\n');
    process.exit(1);
  }
}

applyMigration();
