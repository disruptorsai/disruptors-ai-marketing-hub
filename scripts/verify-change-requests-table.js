/**
 * Verify Change Requests Table
 * Checks if the change_requests table exists and is properly configured
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyTable() {
  console.log('🔍 Verifying change_requests table...\n');

  try {
    // Check if table exists by trying to query it
    const { data, error } = await supabase
      .from('change_requests')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ Table does not exist');
        console.log('\n📝 To create the table, run:');
        console.log('   node scripts/apply-change-requests-migration.js\n');
        console.log('Or manually apply the migration in Supabase SQL Editor:');
        console.log('   supabase/migrations/20250126_change_requests.sql\n');
        process.exit(1);
      }
      throw error;
    }

    console.log('✅ Table exists');

    // Check the structure
    if (data !== null) {
      console.log('✅ Table is accessible');

      // Try to get count
      const { count, error: countError } = await supabase
        .from('change_requests')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.log('⚠️  Warning: Could not get count');
      } else {
        console.log(`✅ Current records: ${count || 0}`);
      }

      console.log('\n🎉 Change Requests table is properly configured!');
      console.log('\nYou can now use the Change Requests Manager in your admin panel:');
      console.log('   /admin/secret → Change Requests tab\n');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verifyTable();
