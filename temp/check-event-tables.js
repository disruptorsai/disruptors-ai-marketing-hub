import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkEventTables() {
  console.log('🔍 Searching for event/survey related tables...\n');

  // Try common event-related table names
  const possibleTables = [
    'event_checkins',
    'event_check_ins',
    'event_registrations',
    'event_attendees',
    'event_surveys',
    'survey_responses',
    'event_signups',
    'attendees',
    'checkins',
    'check_ins',
    'surveys',
    'event_submissions',
    'lead_captures'
  ];

  console.log('🎯 Checking possible event/survey tables:\n');

  for (const tableName of possibleTables) {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: false })
      .limit(1);

    if (!error && data !== null) {
      console.log(`✅ Found table: ${tableName}`);

      // Get count
      const { count: totalCount } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      console.log(`   📊 Total records: ${totalCount || 0}`);

      if (data.length > 0) {
        console.log(`   📋 Columns: ${Object.keys(data[0]).join(', ')}`);

        // Get all records for this table
        const { data: allData } = await supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (allData && allData.length > 0) {
          console.log(`   📝 Recent records (${allData.length}):`);
          allData.forEach((record, idx) => {
            console.log(`\n   Record ${idx + 1}:`, JSON.stringify(record, null, 4));
          });
        }
      }
      console.log('\n');
    }
  }
}

checkEventTables().catch(console.error);
