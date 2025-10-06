import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixHeroMedia() {
  console.log('Deactivating invalid hero background record...\n');

  const { data, error } = await supabase
    .from('site_media')
    .update({ is_active: false })
    .eq('id', '77faea82-ba2b-49c7-9580-4bb5df5baeda')
    .select();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('✓ Successfully deactivated invalid background record');
  console.log('  ID:', data[0].id);
  console.log('  Purpose:', data[0].purpose);
  console.log('  Active:', data[0].is_active);
}

fixHeroMedia().catch(console.error);
