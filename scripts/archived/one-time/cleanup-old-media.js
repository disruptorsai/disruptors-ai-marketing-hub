import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupOldMedia() {
  console.log('Cleaning up old media records without section data...\n');

  try {
    // Delete records where section_name is null
    const { data, error, count } = await supabase
      .from('site_media')
      .delete()
      .is('section_name', null)
      .select();

    if (error) {
      console.error('✗ Error:', error.message);
      process.exit(1);
    }

    console.log(`✓ Deleted ${data?.length || 0} old records without section data`);

    // Verify final state
    const { count: finalCount, error: countError } = await supabase
      .from('site_media')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('✗ Error getting count:', countError.message);
    } else {
      console.log(`✓ Final record count: ${finalCount}`);
    }

    // Show sample records with sections
    const { data: sample, error: sampleError } = await supabase
      .from('site_media')
      .select('page_slug, section_name, purpose')
      .not('section_name', 'is', null)
      .limit(10);

    if (!sampleError && sample) {
      console.log('\nSample records with sections:');
      sample.forEach((record, idx) => {
        console.log(`  ${idx + 1}. ${record.page_slug} / ${record.section_name}`);
        console.log(`     ${record.purpose}`);
      });
    }

  } catch (error) {
    console.error('✗ Fatal error:', error.message);
    process.exit(1);
  }
}

cleanupOldMedia();
