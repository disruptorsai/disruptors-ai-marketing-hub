// Test connectivity to both Supabase projects using fetch
const OLD_PROJECT = {
  name: 'techintegrationlabs (OLD)',
  ref: 'ubqxflzuvxowigbjmqfb',
  url: 'https://ubqxflzuvxowigbjmqfb.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicXhmbHp1dnhvd2lnYmptcWZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODUxMjQzOCwiZXhwIjoyMDc0MDg4NDM4fQ.FnhnaAxWjMo41M7Gmm_bXFXZuegzW5HfitvB1APNDDk'
};

const NEW_PROJECT = {
  name: 'disruptorsai (NEW)',
  ref: 'ulfnzcniivkjtfaoxfmi',
  url: 'https://ulfnzcniivkjtfaoxfmi.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZm56Y25paXZranRmYW94Zm1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQzNjQ1MSwiZXhwIjoyMDg0MDEyNDUxfQ.kt9Y2zWkz6UV2rbyJnEZBRvaoc58bYdYW--YK5XpvDo'
};

async function queryTable(project, tableName) {
  const response = await fetch(`${project.url}/rest/v1/${tableName}?select=*&limit=1`, {
    headers: {
      'apikey': project.serviceRoleKey,
      'Authorization': `Bearer ${project.serviceRoleKey}`,
      'Prefer': 'count=exact'
    }
  });

  const count = response.headers.get('content-range');
  const data = await response.json();

  return {
    exists: response.ok,
    count: count ? parseInt(count.split('/')[1]) || 0 : 0,
    error: !response.ok ? data : null
  };
}

async function testProject(project, label) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Testing ${label}: ${project.name}`);
  console.log(`URL: ${project.url}`);
  console.log('='.repeat(50));

  const tables = ['posts', 'site_media', 'business_brains', 'modules', 'leads', 'keywords', 'brain_facts', 'module_runs', 'brand_rules', 'brand_assets'];
  const existingTables = [];
  const tableCounts = {};

  for (const table of tables) {
    try {
      const result = await queryTable(project, table);
      if (result.exists) {
        existingTables.push(table);
        tableCounts[table] = result.count;
      }
    } catch (err) {
      // Table doesn't exist or error
    }
  }

  if (existingTables.length > 0) {
    console.log(`✅ Connection successful`);
    console.log(`   Found ${existingTables.length} tables:`);
    for (const table of existingTables) {
      console.log(`      - ${table}: ${tableCounts[table]} rows`);
    }
    return { success: true, tables: existingTables, counts: tableCounts };
  } else {
    // Check if we can at least connect
    try {
      const response = await fetch(`${project.url}/rest/v1/`, {
        headers: {
          'apikey': project.serviceRoleKey,
          'Authorization': `Bearer ${project.serviceRoleKey}`
        }
      });
      if (response.ok) {
        console.log(`✅ Connection successful (empty database - no tables found)`);
        return { success: true, tables: [], counts: {} };
      }
    } catch (err) {
      console.log(`❌ Connection failed: ${err.message}`);
      return { success: false, error: err };
    }
  }

  return { success: true, tables: existingTables, counts: tableCounts };
}

async function main() {
  console.log('Supabase Migration - Connectivity Test');
  console.log('======================================\n');

  const oldResult = await testProject(OLD_PROJECT, 'SOURCE');
  const newResult = await testProject(NEW_PROJECT, 'DESTINATION');

  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`OLD Project (SOURCE):      ${oldResult.success ? '✅ Connected' : '❌ Failed'}`);
  console.log(`NEW Project (DESTINATION): ${newResult.success ? '✅ Connected' : '❌ Failed'}`);

  if (oldResult.tables && oldResult.tables.length > 0) {
    const totalRows = Object.values(oldResult.counts).reduce((a, b) => a + b, 0);
    console.log(`\nSOURCE has ${oldResult.tables.length} tables with ~${totalRows} total rows to migrate`);
  }

  if (newResult.tables && newResult.tables.length === 0) {
    console.log(`DESTINATION is empty - ready to receive migration`);
  } else if (newResult.tables && newResult.tables.length > 0) {
    console.log(`⚠️  DESTINATION already has ${newResult.tables.length} tables`);
  }

  if (oldResult.success && newResult.success) {
    console.log('\n✅ Both projects accessible - ready to proceed with migration');
  } else {
    console.log('\n❌ Fix connectivity issues before proceeding');
  }
}

main().catch(console.error);
