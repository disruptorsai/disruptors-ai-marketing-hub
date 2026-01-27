// Complete Migration - Storage Buckets + Remaining Data
const OLD_PROJECT = {
  url: 'https://ubqxflzuvxowigbjmqfb.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicXhmbHp1dnhvd2lnYmptcWZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODUxMjQzOCwiZXhwIjoyMDc0MDg4NDM4fQ.FnhnaAxWjMo41M7Gmm_bXFXZuegzW5HfitvB1APNDDk'
};

const NEW_PROJECT = {
  url: 'https://ulfnzcniivkjtfaoxfmi.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZm56Y25paXZranRmYW94Zm1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQzNjQ1MSwiZXhwIjoyMDg0MDEyNDUxfQ.kt9Y2zWkz6UV2rbyJnEZBRvaoc58bYdYW--YK5XpvDo'
};

const BUCKETS = [
  { name: 'ai-generated-images', public: true },
  { name: 'ai-generated-videos', public: true },
  { name: 'ai-generated-audio', public: true },
  { name: 'team-photos', public: true },
  { name: 'case-study-images', public: true },
  { name: 'blog-images', public: true },
  { name: 'resource-files', public: true },
  { name: 'ai-presenter-files', public: false },
  { name: 'site-images', public: true },
  { name: 'site-videos', public: true },
  { name: 'site-logos', public: true },
  { name: 'site-assets', public: true }
];

async function createBuckets() {
  console.log('\n📦 CREATING STORAGE BUCKETS');
  console.log('='.repeat(50));

  let created = 0;
  for (const bucket of BUCKETS) {
    const response = await fetch(`${NEW_PROJECT.url}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'apikey': NEW_PROJECT.serviceRoleKey,
        'Authorization': `Bearer ${NEW_PROJECT.serviceRoleKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: bucket.name,
        name: bucket.name,
        public: bucket.public
      })
    });

    if (response.ok) {
      console.log(`   ✅ Created: ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      created++;
    } else {
      const error = await response.json();
      if (error.message?.includes('already exists')) {
        console.log(`   ⏭️  Exists: ${bucket.name}`);
      } else {
        console.log(`   ❌ Failed: ${bucket.name} - ${error.message}`);
      }
    }
  }

  return created;
}

async function listFilesInBucket(project, bucketName, prefix = '') {
  const response = await fetch(
    `${project.url}/storage/v1/object/list/${bucketName}`,
    {
      method: 'POST',
      headers: {
        'apikey': project.serviceRoleKey,
        'Authorization': `Bearer ${project.serviceRoleKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prefix, limit: 1000 })
    }
  );

  if (!response.ok) return [];
  return response.json();
}

async function downloadFile(project, bucketName, filePath) {
  const response = await fetch(
    `${project.url}/storage/v1/object/${bucketName}/${filePath}`,
    {
      headers: {
        'apikey': project.serviceRoleKey,
        'Authorization': `Bearer ${project.serviceRoleKey}`
      }
    }
  );

  if (!response.ok) return null;
  return response.arrayBuffer();
}

async function uploadFile(project, bucketName, filePath, data, contentType) {
  const response = await fetch(
    `${project.url}/storage/v1/object/${bucketName}/${filePath}`,
    {
      method: 'POST',
      headers: {
        'apikey': project.serviceRoleKey,
        'Authorization': `Bearer ${project.serviceRoleKey}`,
        'Content-Type': contentType || 'application/octet-stream'
      },
      body: data
    }
  );

  return response.ok;
}

async function migrateStorageFiles() {
  console.log('\n📁 MIGRATING STORAGE FILES');
  console.log('='.repeat(50));

  const bucketsWithFiles = ['site-images', 'site-videos', 'site-assets'];
  let totalMigrated = 0;

  for (const bucketName of bucketsWithFiles) {
    console.log(`\n   Bucket: ${bucketName}`);
    const files = await listFilesInBucket(OLD_PROJECT, bucketName);

    if (files.length === 0) {
      console.log(`   - No files to migrate`);
      continue;
    }

    // Recursively get all files (including in subdirectories)
    const allFiles = [];
    const processItems = async (items, prefix = '') => {
      for (const item of items) {
        if (item.id === null) {
          // It's a folder, recurse
          const subFiles = await listFilesInBucket(OLD_PROJECT, bucketName, prefix + item.name + '/');
          await processItems(subFiles, prefix + item.name + '/');
        } else {
          allFiles.push(prefix + item.name);
        }
      }
    };

    await processItems(files);
    console.log(`   - Found ${allFiles.length} files`);

    let migrated = 0;
    for (const filePath of allFiles) {
      try {
        const data = await downloadFile(OLD_PROJECT, bucketName, filePath);
        if (data) {
          const success = await uploadFile(NEW_PROJECT, bucketName, filePath, data);
          if (success) migrated++;
        }
      } catch (e) {
        // Skip errors
      }
    }

    console.log(`   - Migrated ${migrated}/${allFiles.length} files`);
    totalMigrated += migrated;
  }

  return totalMigrated;
}

async function migrateChangeRequests() {
  console.log('\n📝 MIGRATING CHANGE REQUESTS');
  console.log('='.repeat(50));

  // Fetch from old
  const response = await fetch(`${OLD_PROJECT.url}/rest/v1/change_requests?select=*`, {
    headers: {
      'apikey': OLD_PROJECT.serviceRoleKey,
      'Authorization': `Bearer ${OLD_PROJECT.serviceRoleKey}`
    }
  });

  if (!response.ok) {
    console.log('   Could not fetch change_requests');
    return 0;
  }

  const data = await response.json();
  console.log(`   Exported ${data.length} rows`);

  if (data.length === 0) return 0;

  // Insert to new (in batches)
  const batchSize = 20;
  let inserted = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    const insertResponse = await fetch(`${NEW_PROJECT.url}/rest/v1/change_requests`, {
      method: 'POST',
      headers: {
        'apikey': NEW_PROJECT.serviceRoleKey,
        'Authorization': `Bearer ${NEW_PROJECT.serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal,resolution=ignore-duplicates'
      },
      body: JSON.stringify(batch)
    });

    if (insertResponse.ok) {
      inserted += batch.length;
    } else {
      const err = await insertResponse.json();
      console.log(`   ⚠️  Batch error: ${err.message?.substring(0, 60)}`);
    }
  }

  console.log(`   ✅ Imported ${inserted} rows`);
  return inserted;
}

async function main() {
  console.log('='.repeat(60));
  console.log('COMPLETE SUPABASE MIGRATION');
  console.log('='.repeat(60));

  // 1. Create storage buckets
  const bucketsCreated = await createBuckets();

  // 2. Migrate storage files
  const filesMigrated = await migrateStorageFiles();

  // 3. Migrate change_requests
  const changeRequestsMigrated = await migrateChangeRequests();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`   Storage buckets created: ${bucketsCreated}`);
  console.log(`   Storage files migrated: ${filesMigrated}`);
  console.log(`   Change requests migrated: ${changeRequestsMigrated}`);
  console.log('\n✅ Complete migration finished!');
}

main().catch(console.error);
