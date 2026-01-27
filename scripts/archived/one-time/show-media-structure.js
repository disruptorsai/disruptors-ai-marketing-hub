import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function showStructure() {
  const { data, error } = await supabase
    .from('site_media')
    .select('page_slug, section_name, purpose, media_type')
    .order('page_slug')
    .order('section_name');

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log('\n' + '='.repeat(70));
  console.log('MEDIA RECORDS - PAGE & SECTION STRUCTURE');
  console.log('='.repeat(70) + '\n');

  let lastPage = '';
  let lastSection = '';

  data.forEach(record => {
    if (record.page_slug !== lastPage) {
      console.log(`\n📄 PAGE: ${record.page_slug.toUpperCase()}`);
      lastPage = record.page_slug;
      lastSection = '';
    }

    if (record.section_name !== lastSection) {
      console.log(`\n   📍 SECTION: ${record.section_name || 'General'}`);
      lastSection = record.section_name;
    }

    const purposeShort = record.purpose?.substring(0, 65) || 'N/A';
    console.log(`      • ${record.media_type.toUpperCase().padEnd(5)} | ${purposeShort}`);
  });

  console.log('\n' + '='.repeat(70));
  console.log(`Total: ${data.length} media records with page & section data`);
  console.log('='.repeat(70) + '\n');
}

showStructure();
