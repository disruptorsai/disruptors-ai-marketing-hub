import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ubqxflzuvxowigbjmqfb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicXhmbHp1dnhvd2lnYmptcWZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODUxMjQzOCwiZXhwIjoyMDc0MDg4NDM4fQ.FnhnaAxWjMo41M7Gmm_bXFXZuegzW5HfitvB1APNDDk'
);

console.log('🔍 Checking Supabase Storage status...\n');

// Check buckets
const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

if (bucketError) {
  console.error('❌ Error listing buckets:', bucketError.message);
  process.exit(1);
}

console.log(`📦 Found ${buckets.length} storage buckets:\n`);

for (const bucket of buckets) {
  console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);

  // List files in each bucket
  const { data: files, error: filesError } = await supabase.storage
    .from(bucket.name)
    .list('', { limit: 10, sortBy: { column: 'created_at', order: 'desc' } });

  if (filesError) {
    console.log(`    ❌ Error listing files: ${filesError.message}`);
  } else {
    console.log(`    📁 Contains ${files.length}+ files (showing first 10)`);
    if (files.length > 0) {
      files.slice(0, 3).forEach(f => {
        console.log(`       - ${f.name}`);
      });
      if (files.length > 3) {
        console.log(`       ... and ${files.length - 3} more`);
      }
    }
  }
  console.log('');
}

console.log('✅ Storage check complete');
