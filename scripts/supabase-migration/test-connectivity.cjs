// Test connectivity to both Supabase projects
const { createClient } = require('@supabase/supabase-js');
const { OLD_PROJECT, NEW_PROJECT } = require('./config.cjs');

async function testProject(project, label) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Testing ${label}: ${project.name}`);
  console.log(`URL: ${project.url}`);
  console.log(`Ref: ${project.ref}`);
  console.log('='.repeat(50));

  const supabase = createClient(project.url, project.serviceRoleKey, {
    auth: { persistSession: false }
  });

  try {
    // Try to get actual table count by checking common tables
    const commonTables = ['posts', 'site_media', 'business_brains', 'modules', 'leads', 'keywords', 'brain_facts', 'module_runs'];
    const existingTables = [];
    const tableCounts = {};

    for (const table of commonTables) {
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (!error) {
        existingTables.push(table);
        tableCounts[table] = count || 0;
      } else if (error.code === 'PGRST116') {
        // PGRST116 = no rows, but table exists
        existingTables.push(table);
        tableCounts[table] = 0;
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
      console.log(`✅ Connection successful (no tables found - empty database)`);
      return { success: true, tables: [], counts: {} };
    }

  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
    return { success: false, error: err };
  }
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
    console.log(`\nSOURCE has ${oldResult.tables.length} tables with data to migrate`);
  }

  if (newResult.tables && newResult.tables.length === 0) {
    console.log(`DESTINATION is empty - ready to receive migration`);
  } else if (newResult.tables && newResult.tables.length > 0) {
    console.log(`⚠️  DESTINATION already has ${newResult.tables.length} tables - may need cleanup first`);
  }

  if (oldResult.success && newResult.success) {
    console.log('\n✅ Both projects accessible - ready to proceed with migration');
  } else {
    console.log('\n❌ Fix connectivity issues before proceeding');
  }
}

main().catch(console.error);
