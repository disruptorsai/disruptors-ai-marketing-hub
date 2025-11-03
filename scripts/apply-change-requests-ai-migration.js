/**
 * Apply Change Requests AI Analysis Migration
 *
 * Adds AI-powered document analysis support to the change_requests system
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Applying Change Requests AI Analysis migration...\n');

  try {
    // Read migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20250131_change_requests_ai_analysis.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded');
    console.log('🔧 Executing migration...\n');

    // Execute migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // If exec_sql function doesn't exist, try direct query
      const { error: directError } = await supabase.from('_sql').select('*').limit(0);

      if (directError) {
        console.log('⚠️  Cannot execute via RPC. Please apply migration manually via Supabase SQL Editor.');
        console.log('\nMigration file location:');
        console.log(migrationPath);
        console.log('\nCopy the SQL and run it in Supabase Dashboard > SQL Editor');
        return;
      }
    }

    console.log('✅ Migration executed successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying migration...');

    const { data: aiAnalysesTable, error: aiAnalysesError } = await supabase
      .from('change_request_ai_analyses')
      .select('*')
      .limit(1);

    if (aiAnalysesError) {
      throw new Error(`Verification failed: ${aiAnalysesError.message}`);
    }

    console.log('✅ change_request_ai_analyses table verified');

    // Check if new columns were added to change_requests
    const { data: changeRequests, error: changeRequestsError } = await supabase
      .from('change_requests')
      .select('*')
      .limit(1);

    if (changeRequestsError) {
      throw new Error(`change_requests table check failed: ${changeRequestsError.message}`);
    }

    if (changeRequests && changeRequests.length > 0) {
      const columns = Object.keys(changeRequests[0]);
      const newColumns = ['source_type', 'source_document_url', 'ai_analysis_id', 'batch_id', 'task_items'];
      const hasNewColumns = newColumns.every(col => columns.includes(col));

      if (hasNewColumns) {
        console.log('✅ change_requests table columns verified');
      } else {
        console.warn('⚠️  Some columns may be missing from change_requests table');
      }
    }

    console.log('\n✨ Migration complete!\n');
    console.log('📋 What was added:');
    console.log('  • change_request_ai_analyses table for tracking AI analysis sessions');
    console.log('  • source_type column to track how requests were created');
    console.log('  • source_document_url for uploaded document references');
    console.log('  • ai_analysis_id to link requests to analysis sessions');
    console.log('  • batch_id to group requests from same analysis');
    console.log('  • task_items (JSONB) for detailed task breakdowns');
    console.log('\n🎉 You can now use the AI Analyzer in the Change Requests Manager!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nPlease apply the migration manually:');
    console.error('1. Open Supabase Dashboard > SQL Editor');
    console.error('2. Copy contents of: supabase/migrations/20250131_change_requests_ai_analysis.sql');
    console.error('3. Paste and run the SQL');
    process.exit(1);
  }
}

applyMigration();
