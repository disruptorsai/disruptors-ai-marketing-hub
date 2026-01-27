import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function inspectServicesTable() {
  console.log('='.repeat(60));
  console.log('SERVICES TABLE INSPECTION');
  console.log('='.repeat(60));

  // Get all records
  const { data: records, error: selectError } = await supabase
    .from('services')
    .select('*');

  if (selectError) {
    console.error('Error fetching records:', selectError);
    return;
  }

  console.log(`\nTotal records: ${records?.length || 0}\n`);

  if (records && records.length > 0) {
    console.log('Sample record structure:');
    const sample = records[0];
    Object.keys(sample).forEach(key => {
      const value = sample[key];
      const type = Array.isArray(value) ? 'array' : typeof value;
      console.log(`  - ${key}: ${type}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('EXISTING RECORDS:');
    console.log('='.repeat(60));
    records.forEach((record, idx) => {
      console.log(`\n${idx + 1}. ${record.title || 'Untitled'}`);
      console.log(`   ID: ${record.id}`);
      console.log(`   Slug: ${record.slug || 'N/A'}`);
      console.log(`   Hook: ${record.hook || 'N/A'}`);
      console.log(`   Image: ${record.image || 'N/A'}`);
      console.log(`   Display Order: ${record.display_order ?? 'N/A'}`);
      console.log(`   Active: ${record.is_active ?? 'N/A'}`);
    });
  }

  console.log('\n' + '='.repeat(60));
}

inspectServicesTable().catch(console.error);
