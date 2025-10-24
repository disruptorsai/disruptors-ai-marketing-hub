import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkPollTable() {
  console.log('Checking connect_poll_responses table structure...\n');

  // Try to select all columns
  const { data, error, count } = await supabase
    .from('connect_poll_responses')
    .select('*', { count: 'exact' });

  console.log('Query result:');
  console.log('- Error:', error);
  console.log('- Data:', data);
  console.log('- Count:', count);
  console.log('- Data length:', data?.length);

  if (data && data.length > 0) {
    console.log('\nFirst row columns:', Object.keys(data[0]));
  } else {
    console.log('\nTable is empty - no rows found');
  }

  // Try to get table info via raw SQL
  console.log('\n=== Attempting direct SQL query for table info ===');
  const { data: sqlData, error: sqlError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'connect_poll_responses'
      ORDER BY ordinal_position;
    `
  });

  if (sqlError) {
    console.log('SQL Error (expected if function doesn\'t exist):', sqlError.message);
  } else {
    console.log('Table columns:', sqlData);
  }
}

checkPollTable().catch(console.error);
