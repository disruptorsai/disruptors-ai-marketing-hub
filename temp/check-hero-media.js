import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkHeroMedia() {
  console.log('Checking hero media records...\n');

  const { data, error } = await supabase
    .from('site_media')
    .select('*')
    .eq('page_slug', 'hero');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${data?.length || 0} hero media records:\n`);

  if (data && data.length > 0) {
    data.forEach((record, i) => {
      console.log(`Record ${i + 1}:`);
      console.log(`  ID: ${record.id}`);
      console.log(`  Purpose: ${record.purpose}`);
      console.log(`  Media URL: ${record.media_url}`);
      console.log(`  Alt Text: ${record.alt_text}`);
      console.log(`  Active: ${record.is_active}`);
      console.log('');
    });
  }
}

checkHeroMedia().catch(console.error);
