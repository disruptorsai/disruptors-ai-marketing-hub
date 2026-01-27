/**
 * Check business_brains table schema
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  console.log('🔍 Checking business_brains table schema...\n');

  try {
    // Try to select one record to see what columns exist
    const { data, error } = await supabase
      .from('business_brains')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error:', error.message);

      if (error.code === '42P01') {
        console.log('\n⚠️  Table "business_brains" does not exist!');
        console.log('You need to run the full migration.');
      }
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Table exists with data. Columns found:');
      Object.keys(data[0]).forEach(col => console.log(`   - ${col}`));
    } else {
      // Table exists but is empty, try to get column info from metadata
      console.log('✅ Table exists (empty)');
      console.log('\nAttempting to get column info by inserting empty object...');

      const { error: insertError } = await supabase
        .from('business_brains')
        .insert({});

      if (insertError) {
        console.log('\n📋 Required columns (from error):');
        // Parse error message to find required columns
        const match = insertError.message.match(/column "([^"]+)"/);
        if (match) {
          console.log(`   - ${match[1]} (and possibly others)`);
        }
        console.log('\nError:', insertError.message);
      }
    }

    // Check what migration files need to be run
    console.log('\n📂 Available migration files:');
    console.log('   - supabase/migrations/20250107_business_brain_infrastructure.sql (FULL)');
    console.log('   - supabase/migrations/FIX_BRAIN_LEVEL_ERROR.sql (PARTIAL FIX)');
    console.log('   - supabase/migrations/VERIFY_DATABASE_COMPLETE.sql (VERIFICATION)');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkSchema();
