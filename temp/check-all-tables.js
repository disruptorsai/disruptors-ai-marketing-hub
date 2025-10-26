import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllTables() {
  console.log('🔍 Checking ALL tables for potential event data...\n');

  // Try to list all tables by attempting common table names
  const possibleTables = [
    'event_checkins',
    'event_submissions',
    'event_responses',
    'form_submissions',
    'form_responses',
    'survey_responses',
    'contact_submissions',
    'lead_captures',
    'submissions',
    'responses',
    'attendees',
    'registrations',
    'signups'
  ];

  for (const tableName of possibleTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: false })
        .limit(3);

      if (!error && data !== null) {
        const { count: totalCount } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        console.log(`✅ FOUND: ${tableName}`);
        console.log(`   📊 Total records: ${totalCount || 0}`);

        if (data.length > 0) {
          console.log(`   📋 Columns: ${Object.keys(data[0]).join(', ')}`);
          console.log(`   📝 Sample data (first 3 records):\n`);
          data.forEach((record, idx) => {
            console.log(`   Record ${idx + 1}:`);
            console.log(JSON.stringify(record, null, 4));
            console.log('');
          });
        } else {
          console.log(`   ℹ️  Table exists but is empty\n`);
        }
        console.log('---\n');
      }
    } catch (err) {
      // Silently skip tables that don't exist
    }
  }
}

checkAllTables().catch(console.error);
