/**
 * Apply Automation Feasibility Migration
 *
 * Applies the automation_feasibility columns to change_requests table
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🔄 Applying automation feasibility migration...\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250131_automation_feasibility.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('📝 SQL length:', migrationSQL.length, 'characters\n');

    // Split into individual statements (rough split, may need adjustment)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`🔧 Executing ${statements.length} statements...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

        if (error) {
          // Check if error is about column/index already existing
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log(`⚠️  Statement ${i + 1}: Already exists (skipping)`);
            successCount++;
          } else {
            throw error;
          }
        } else {
          console.log(`✅ Statement ${i + 1}: Success`);
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Statement ${i + 1}: Failed`);
        console.error(`   Error: ${error.message}`);
        console.error(`   SQL: ${statement.substring(0, 100)}...`);
        errorCount++;
      }
    }

    console.log(`\n📊 Migration Results:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n✅ Migration completed successfully!');
      return true;
    } else {
      console.log('\n⚠️  Migration completed with errors');
      return false;
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    return false;
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...\n');

  try {
    // Try to select the new columns
    const { data, error } = await supabase
      .from('change_requests')
      .select('id, automation_feasibility, automation_confidence, automation_analysis')
      .limit(1);

    if (error) {
      console.error('❌ Verification failed:', error.message);
      return false;
    }

    console.log('✅ New columns verified successfully');
    console.log('📋 Sample record columns:', Object.keys(data[0] || {}));

    return true;

  } catch (error) {
    console.error('❌ Verification error:', error.message);
    return false;
  }
}

// Run migration
applyMigration()
  .then(success => {
    if (success) {
      return verifyMigration();
    }
    return false;
  })
  .then(verified => {
    if (verified) {
      console.log('\n🎉 Migration and verification complete!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Please check the errors above');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
