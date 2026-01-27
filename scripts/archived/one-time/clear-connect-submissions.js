import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create service role client (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function clearConnectSubmissions() {
  console.log('🧹 Connect Event Submission Cleanup');
  console.log('=====================================\n');

  try {
    // Step 1: Count rows before deletion
    console.log('📊 Counting rows in all tables...\n');

    const tables = [
      'connect_poll_responses',
      'connect_classifications',
      'connect_attendances',
      'connect_contacts',
      'connect_audit_logs',
      'connect_events',
      'connect_kiosks'
    ];

    const beforeCounts = {};
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`❌ Error counting ${table}:`, error.message);
        beforeCounts[table] = 'ERROR';
      } else {
        beforeCounts[table] = count || 0;
        console.log(`   ${table}: ${count} rows`);
      }
    }

    console.log('\n⚠️  BEFORE DELETION:');
    console.log('   Tables to CLEAR:');
    console.log(`   - connect_poll_responses: ${beforeCounts.connect_poll_responses} rows`);
    console.log(`   - connect_classifications: ${beforeCounts.connect_classifications} rows`);
    console.log(`   - connect_attendances: ${beforeCounts.connect_attendances} rows`);
    console.log(`   - connect_contacts: ${beforeCounts.connect_contacts} rows`);
    console.log(`   - connect_audit_logs: ${beforeCounts.connect_audit_logs} rows`);
    console.log('\n   Tables to PRESERVE:');
    console.log(`   - connect_events: ${beforeCounts.connect_events} rows (KEEPING)`);
    console.log(`   - connect_kiosks: ${beforeCounts.connect_kiosks} rows (KEEPING)`);

    // Step 2: Delete in correct order (respecting foreign key constraints)
    console.log('\n\n🗑️  Starting deletion process...\n');

    // Delete connect_poll_responses (no FK dependencies)
    console.log('1. Deleting connect_poll_responses...');
    const { error: pollError, count: pollDeleted } = await supabase
      .from('connect_poll_responses')
      .delete()
      .not('id', 'is', null);

    if (pollError) {
      console.error('   ❌ Error:', pollError.message);
    } else {
      console.log(`   ✅ Deleted ${beforeCounts.connect_poll_responses} rows`);
    }

    // Delete connect_classifications (references contacts)
    console.log('2. Deleting connect_classifications...');
    const { error: classError, count: classDeleted } = await supabase
      .from('connect_classifications')
      .delete()
      .not('id', 'is', null);

    if (classError) {
      console.error('   ❌ Error:', classError.message);
    } else {
      console.log(`   ✅ Deleted ${beforeCounts.connect_classifications} rows`);
    }

    // Delete connect_attendances (references contacts and events)
    console.log('3. Deleting connect_attendances...');
    const { error: attendError, count: attendDeleted } = await supabase
      .from('connect_attendances')
      .delete()
      .not('id', 'is', null);

    if (attendError) {
      console.error('   ❌ Error:', attendError.message);
    } else {
      console.log(`   ✅ Deleted ${beforeCounts.connect_attendances} rows`);
    }

    // Delete connect_contacts (referenced by above tables)
    console.log('4. Deleting connect_contacts...');
    const { error: contactError, count: contactDeleted } = await supabase
      .from('connect_contacts')
      .delete()
      .not('id', 'is', null);

    if (contactError) {
      console.error('   ❌ Error:', contactError.message);
    } else {
      console.log(`   ✅ Deleted ${beforeCounts.connect_contacts} rows`);
    }

    // Delete connect_audit_logs (references events and kiosks)
    console.log('5. Deleting connect_audit_logs...');
    const { error: auditError, count: auditDeleted } = await supabase
      .from('connect_audit_logs')
      .delete()
      .not('id', 'is', null);

    if (auditError) {
      console.error('   ❌ Error:', auditError.message);
    } else {
      console.log(`   ✅ Deleted ${beforeCounts.connect_audit_logs} rows`);
    }

    // Step 3: Verify tables are empty
    console.log('\n\n✅ Verifying deletion...\n');

    const afterCounts = {};
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`❌ Error counting ${table}:`, error.message);
        afterCounts[table] = 'ERROR';
      } else {
        afterCounts[table] = count || 0;
      }
    }

    console.log('📊 AFTER DELETION:');
    console.log('   Cleared tables:');
    console.log(`   - connect_poll_responses: ${afterCounts.connect_poll_responses} rows ${afterCounts.connect_poll_responses === 0 ? '✅' : '❌'}`);
    console.log(`   - connect_classifications: ${afterCounts.connect_classifications} rows ${afterCounts.connect_classifications === 0 ? '✅' : '❌'}`);
    console.log(`   - connect_attendances: ${afterCounts.connect_attendances} rows ${afterCounts.connect_attendances === 0 ? '✅' : '❌'}`);
    console.log(`   - connect_contacts: ${afterCounts.connect_contacts} rows ${afterCounts.connect_contacts === 0 ? '✅' : '❌'}`);
    console.log(`   - connect_audit_logs: ${afterCounts.connect_audit_logs} rows ${afterCounts.connect_audit_logs === 0 ? '✅' : '❌'}`);
    console.log('\n   Preserved tables:');
    console.log(`   - connect_events: ${afterCounts.connect_events} rows ✅`);
    console.log(`   - connect_kiosks: ${afterCounts.connect_kiosks} rows ✅`);

    // Summary
    console.log('\n\n📋 DELETION SUMMARY');
    console.log('=====================================');
    console.log(`Total rows deleted: ${beforeCounts.connect_poll_responses + beforeCounts.connect_classifications + beforeCounts.connect_attendances + beforeCounts.connect_contacts + beforeCounts.connect_audit_logs}`);
    console.log(`\nBreakdown:`);
    console.log(`   - Poll responses: ${beforeCounts.connect_poll_responses}`);
    console.log(`   - Classifications: ${beforeCounts.connect_classifications}`);
    console.log(`   - Attendances: ${beforeCounts.connect_attendances}`);
    console.log(`   - Contacts: ${beforeCounts.connect_contacts}`);
    console.log(`   - Audit logs: ${beforeCounts.connect_audit_logs}`);

    console.log('\n✅ Connect event system is now clean and ready for fresh submissions!');

  } catch (error) {
    console.error('\n❌ Fatal error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
clearConnectSubmissions();
