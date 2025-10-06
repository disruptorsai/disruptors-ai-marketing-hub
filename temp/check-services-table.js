import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkServicesTable() {
  console.log('Checking services table...\n');

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .limit(5);

  if (error) {
    if (error.code === 'PGRST204' || error.message.includes('does not exist')) {
      console.log('❌ Services table does NOT exist');
      console.log('   Migration needs to be applied');
      return;
    }
    console.error('Error:', error);
    return;
  }

  console.log(`✓ Services table exists with ${data?.length || 0} records\n`);

  if (data && data.length > 0) {
    console.log('Sample records:');
    data.forEach((record, i) => {
      console.log(`  ${i + 1}. ${record.title} (${record.slug})`);
    });
  } else {
    console.log('⚠ Table exists but has no data');
    console.log('  Migration data needs to be inserted');
  }
}

checkServicesTable().catch(console.error);
