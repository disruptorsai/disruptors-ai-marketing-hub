// Audit OLD Supabase project for complete migration
const OLD_PROJECT = {
  url: 'https://ubqxflzuvxowigbjmqfb.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicXhmbHp1dnhvd2lnYmptcWZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODUxMjQzOCwiZXhwIjoyMDc0MDg4NDM4fQ.FnhnaAxWjMo41M7Gmm_bXFXZuegzW5HfitvB1APNDDk'
};

async function listStorageBuckets() {
  console.log('\n📦 STORAGE BUCKETS');
  console.log('='.repeat(50));

  const response = await fetch(`${OLD_PROJECT.url}/storage/v1/bucket`, {
    headers: {
      'apikey': OLD_PROJECT.serviceRoleKey,
      'Authorization': `Bearer ${OLD_PROJECT.serviceRoleKey}`
    }
  });

  if (!response.ok) {
    console.log('   Could not fetch buckets:', response.status);
    return [];
  }

  const buckets = await response.json();

  if (buckets.length === 0) {
    console.log('   No storage buckets found');
    return [];
  }

  for (const bucket of buckets) {
    console.log(`\n   Bucket: ${bucket.name}`);
    console.log(`   - ID: ${bucket.id}`);
    console.log(`   - Public: ${bucket.public}`);
    console.log(`   - Created: ${bucket.created_at}`);

    // List files in bucket
    const filesResponse = await fetch(
      `${OLD_PROJECT.url}/storage/v1/object/list/${bucket.name}`,
      {
        method: 'POST',
        headers: {
          'apikey': OLD_PROJECT.serviceRoleKey,
          'Authorization': `Bearer ${OLD_PROJECT.serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prefix: '', limit: 100 })
      }
    );

    if (filesResponse.ok) {
      const files = await filesResponse.json();
      console.log(`   - Files: ${files.length}`);
      if (files.length > 0 && files.length <= 10) {
        files.forEach(f => console.log(`     • ${f.name}`));
      } else if (files.length > 10) {
        files.slice(0, 5).forEach(f => console.log(`     • ${f.name}`));
        console.log(`     ... and ${files.length - 5} more`);
      }
    }
  }

  return buckets;
}

async function listAllTables() {
  console.log('\n📊 DATABASE TABLES');
  console.log('='.repeat(50));

  // Common tables to check
  const tables = [
    'site_media', 'posts', 'business_brains', 'brain_facts', 'brand_rules',
    'brand_assets', 'onboarding_sessions', 'knowledge_sources', 'modules',
    'module_runs', 'module_access', 'leads', 'settings', 'keywords',
    'screenshots', 'seo_audits', 'change_requests', 'event_checkins',
    'downloadable_resources', 'blog_settings', 'archived_sections',
    'connect_submissions', 'lead_magnet_downloads', 'carousel_projects'
  ];

  const existing = [];

  for (const table of tables) {
    const response = await fetch(
      `${OLD_PROJECT.url}/rest/v1/${table}?select=*&limit=1`,
      {
        headers: {
          'apikey': OLD_PROJECT.serviceRoleKey,
          'Authorization': `Bearer ${OLD_PROJECT.serviceRoleKey}`,
          'Prefer': 'count=exact'
        }
      }
    );

    if (response.ok) {
      const count = response.headers.get('content-range');
      const total = count ? count.split('/')[1] : '?';
      existing.push({ table, count: total });
      console.log(`   ✅ ${table}: ${total} rows`);
    }
  }

  return existing;
}

async function checkAuthProviders() {
  console.log('\n🔐 AUTH CONFIGURATION');
  console.log('='.repeat(50));
  console.log('   Note: Auth provider settings must be configured manually');
  console.log('   in the new project dashboard under Authentication > Providers');
  console.log('');
  console.log('   Common providers to check:');
  console.log('   - Google OAuth (Client ID & Secret)');
  console.log('   - Email/Password settings');
  console.log('   - Email templates');
  console.log('   - Redirect URLs');
}

async function checkEdgeFunctions() {
  console.log('\n⚡ EDGE FUNCTIONS');
  console.log('='.repeat(50));

  // Check local edge functions
  const { existsSync, readdirSync } = await import('fs');
  const edgeFunctionsPath = 'supabase/functions';

  if (existsSync(edgeFunctionsPath)) {
    const functions = readdirSync(edgeFunctionsPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    if (functions.length > 0) {
      console.log(`   Found ${functions.length} edge functions:`);
      functions.forEach(f => console.log(`   - ${f}`));
      console.log('\n   These need to be deployed to the new project with:');
      console.log('   supabase functions deploy --project-ref ulfnzcniivkjtfaoxfmi');
    } else {
      console.log('   No edge functions found');
    }
  } else {
    console.log('   No supabase/functions directory found');
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('SUPABASE PROJECT AUDIT - OLD PROJECT');
  console.log('='.repeat(60));
  console.log(`Project: ${OLD_PROJECT.url}`);

  const buckets = await listStorageBuckets();
  const tables = await listAllTables();
  await checkAuthProviders();
  await checkEdgeFunctions();

  console.log('\n' + '='.repeat(60));
  console.log('MIGRATION CHECKLIST');
  console.log('='.repeat(60));

  console.log('\n✅ Already Migrated:');
  console.log('   - Database schema (tables, indexes, RLS policies)');
  console.log('   - site_media: 57 rows');
  console.log('   - posts: 19 rows');
  console.log('   - modules: 4 rows');
  console.log('   - settings: 6 rows');

  console.log('\n⚠️  Still Needed:');
  console.log('   - Business Brain data (run INSERT_BRAIN_DATA.sql)');
  if (buckets.length > 0) {
    console.log(`   - Storage buckets: ${buckets.length} to create`);
    console.log('   - Storage files: Need to migrate');
  }
  console.log('   - Auth providers: Configure in new project');
  console.log('   - Netlify env vars: Update with new keys');

  console.log('\n');
}

main().catch(console.error);
