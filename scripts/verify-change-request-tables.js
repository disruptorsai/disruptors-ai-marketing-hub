/**
 * Verify Change Request AI Analysis Tables
 *
 * Checks if the required database tables and columns exist
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
  console.log('🔍 Verifying Change Request AI Analysis tables...\n');

  try {
    // Check change_request_ai_analyses table
    console.log('1️⃣ Checking change_request_ai_analyses table...');
    const { data: analysisData, error: analysisError } = await supabase
      .from('change_request_ai_analyses')
      .select('*')
      .limit(1);

    if (analysisError) {
      if (analysisError.code === '42P01') {
        console.error('   ❌ Table does not exist');
        console.log('\n📝 Migration needed: Run migration 20250131_change_requests_ai_analysis.sql');
        return false;
      }
      throw analysisError;
    }

    console.log('   ✅ Table exists');
    console.log(`   📊 Sample record count: ${analysisData?.length || 0}`);

    // Check change_requests table with new columns
    console.log('\n2️⃣ Checking change_requests table columns...');
    const { data: requestData, error: requestError } = await supabase
      .from('change_requests')
      .select('id, source_type, source_document_url, ai_analysis_id, batch_id, task_items')
      .limit(1);

    if (requestError) {
      console.error('   ❌ Error:', requestError.message);
      if (requestError.message.includes('column') && requestError.message.includes('does not exist')) {
        console.log('\n📝 Migration needed: Run migration 20250131_change_requests_ai_analysis.sql');
        return false;
      }
      throw requestError;
    }

    console.log('   ✅ All required columns exist');
    console.log('   - source_type ✓');
    console.log('   - source_document_url ✓');
    console.log('   - ai_analysis_id ✓');
    console.log('   - batch_id ✓');
    console.log('   - task_items ✓');

    console.log('\n✅ All tables and columns verified successfully!');
    console.log('\n📌 Next steps:');
    console.log('   1. Deploy the updated netlify.toml configuration');
    console.log('   2. Test the change-request-analyze function');

    return true;

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    return false;
  }
}

verifyTables()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
