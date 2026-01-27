// Test connectivity to both Supabase projects
const { createClient } = require('@supabase/supabase-js');
const { OLD_PROJECT, NEW_PROJECT } = require('./config');

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
    // Test basic connectivity by querying system tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(100);

    if (tablesError) {
      // Try a different approach - list tables via RPC or direct query
      console.log('Direct table query failed, trying alternative...');

      // Try to list any table
      const { data, error } = await supabase.rpc('version');
      if (error) {
        // Last resort - try a simple select
        const testResult = await supabase.from('posts').select('id').limit(1);
        if (testResult.error && testResult.error.code !== 'PGRST116') {
          console.log(`❌ Connection failed: ${testResult.error.message}`);
          return { success: false, tables: [], error: testResult.error };
        }
      }
    }

    // Get list of tables in public schema
    const { data: tableList, error: listError } = await supabase
      .rpc('get_table_list')
      .catch(() => ({ data: null, error: { message: 'RPC not available' } }));

    // Alternative: query pg_tables
    const response = await fetch(`${project.url}/rest/v1/`, {
      headers: {
        'apikey': project.serviceRoleKey,
        'Authorization': `Bearer ${project.serviceRoleKey}`
      }
    });

    if (response.ok) {
      const apiInfo = await response.json();
      console.log(`✅ REST API responding`);
      console.log(`   Available endpoints: ${Object.keys(apiInfo?.definitions || {}).length || 'unknown'}`);
    }

    // Try to get actual table count by checking common tables
    const commonTables = ['posts', 'site_media', 'business_brains', 'modules', 'leads', 'keywords'];
    const existingTables = [];

    for (const table of commonTables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (!error || error.code === 'PGRST116') { // PGRST116 = no rows, but table exists
        existingTables.push(table);
      }
    }

    console.log(`✅ Connection successful`);
    console.log(`   Found tables: ${existingTables.length > 0 ? existingTables.join(', ') : 'none detected'}`);

    return { success: true, tables: existingTables };

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

  if (oldResult.success && newResult.success) {
    console.log('\n✅ Both projects accessible - ready to proceed with migration');
  } else {
    console.log('\n❌ Fix connectivity issues before proceeding');
  }
}

main().catch(console.error);
