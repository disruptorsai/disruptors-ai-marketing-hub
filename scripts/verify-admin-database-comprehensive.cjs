/**
 * Comprehensive Admin Nexus Database Verification
 * Verifies all tables, views, RPCs, and columns needed by admin modules
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Check if a table exists by trying to query it
 */
async function checkTable(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);

    if (error && error.code === '42P01') {
      // Table does not exist
      return { exists: false, error: 'Table not found' };
    }

    if (error) {
      return { exists: false, error: error.message };
    }

    return { exists: true };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

/**
 * Check if a view exists (views look like tables to Supabase client)
 */
async function checkView(viewName) {
  return await checkTable(viewName);
}

/**
 * Check if an RPC function exists by calling it
 */
async function checkRPC(rpcName) {
  try {
    // Try to call it - it might error but that tells us it exists
    const { data, error } = await supabase.rpc(rpcName);

    if (error && error.code === '42883') {
      // Function does not exist
      return { exists: false, error: 'RPC not found' };
    }

    // Any other error means the function exists
    return { exists: true };
  } catch (err) {
    // Network or other errors
    if (err.message.includes('does not exist')) {
      return { exists: false, error: err.message };
    }
    return { exists: true }; // Assume exists if we got a different error
  }
}

/**
 * Check if a column exists in a table
 */
async function checkColumn(tableName, columnName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);

    if (error && error.message.includes(columnName)) {
      return { exists: false, error: `Column '${columnName}' not found` };
    }

    if (error) {
      return { exists: false, error: error.message };
    }

    return { exists: true };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

/**
 * Main verification function
 */
async function verifyDatabase() {
  console.log('🔍 Admin Nexus Database Verification\n');
  console.log('=' .repeat(70));

  const results = {
    tables: {},
    views: {},
    rpcs: {},
    columns: {},
    summary: {
      total: 0,
      exists: 0,
      missing: 0
    }
  };

  // Core tables (we know these exist from previous verification)
  const coreTables = [
    'posts', 'team_members', 'services', 'case_studies',
    'testimonials', 'contact_submissions', 'leads',
    'settings', 'site_media', 'agents', 'telemetry_events'
  ];

  console.log('\n📋 CORE TABLES (Should exist):\n');
  for (const tableName of coreTables) {
    const result = await checkTable(tableName);
    results.tables[tableName] = result;
    results.summary.total++;

    if (result.exists) {
      console.log(`  ✅ ${tableName}`);
      results.summary.exists++;
    } else {
      console.log(`  ❌ ${tableName} - ${result.error}`);
      results.summary.missing++;
    }
  }

  // SEO Suite tables
  const seoTables = [
    'keywords',
    'keyword_research_runs',
    'landing_pages_metadata',
    'landing_page_templates',
    'serp_tracking'
  ];

  console.log('\n📋 SEO SUITE TABLES:\n');
  for (const tableName of seoTables) {
    const result = await checkTable(tableName);
    results.tables[tableName] = result;
    results.summary.total++;

    if (result.exists) {
      console.log(`  ✅ ${tableName}`);
      results.summary.exists++;
    } else {
      console.log(`  ❌ ${tableName} - ${result.error}`);
      results.summary.missing++;
    }
  }

  // SEO Audit Tool tables
  const seoAuditTables = [
    'seo_audits',
    'seo_leads',
    'seo_audit_sections',
    'seo_audit_recommendations'
  ];

  console.log('\n📋 SEO AUDIT TOOL TABLES:\n');
  for (const tableName of seoAuditTables) {
    const result = await checkTable(tableName);
    results.tables[tableName] = result;
    results.summary.total++;

    if (result.exists) {
      console.log(`  ✅ ${tableName}`);
      results.summary.exists++;
    } else {
      console.log(`  ❌ ${tableName} - ${result.error}`);
      results.summary.missing++;
    }
  }

  // Blog Management table
  const blogTables = ['system_settings'];

  console.log('\n📋 BLOG MANAGEMENT TABLES:\n');
  for (const tableName of blogTables) {
    const result = await checkTable(tableName);
    results.tables[tableName] = result;
    results.summary.total++;

    if (result.exists) {
      console.log(`  ✅ ${tableName}`);
      results.summary.exists++;
    } else {
      console.log(`  ❌ ${tableName} - ${result.error}`);
      results.summary.missing++;
    }
  }

  // Lead Magnet Manager table
  const leadMagnetTables = ['downloadable_resources'];

  console.log('\n📋 LEAD MAGNET MANAGER TABLES:\n');
  for (const tableName of leadMagnetTables) {
    const result = await checkTable(tableName);
    results.tables[tableName] = result;
    results.summary.total++;

    if (result.exists) {
      console.log(`  ✅ ${tableName}`);
      results.summary.exists++;
    } else {
      console.log(`  ❌ ${tableName} - ${result.error}`);
      results.summary.missing++;
    }
  }

  // Database views
  const views = [
    'blog_management_dashboard',
    'posts_with_authors'
  ];

  console.log('\n👁️  DATABASE VIEWS:\n');
  for (const viewName of views) {
    const result = await checkView(viewName);
    results.views[viewName] = result;
    results.summary.total++;

    if (result.exists) {
      console.log(`  ✅ ${viewName}`);
      results.summary.exists++;
    } else {
      console.log(`  ❌ ${viewName} - ${result.error}`);
      results.summary.missing++;
    }
  }

  // RPC functions
  const rpcs = [
    'auto_schedule_approved_posts'
  ];

  console.log('\n⚙️  RPC FUNCTIONS:\n');
  for (const rpcName of rpcs) {
    const result = await checkRPC(rpcName);
    results.rpcs[rpcName] = result;
    results.summary.total++;

    if (result.exists) {
      console.log(`  ✅ ${rpcName}`);
      results.summary.exists++;
    } else {
      console.log(`  ❌ ${rpcName} - ${result.error}`);
      results.summary.missing++;
    }
  }

  // Special columns
  const columnsToCheck = [
    { table: 'posts', column: 'is_landing_page' },
    { table: 'posts', column: 'primary_keyword' },
    { table: 'posts', column: 'secondary_keywords' }
  ];

  console.log('\n🔧 SPECIAL COLUMNS:\n');
  for (const { table, column } of columnsToCheck) {
    const result = await checkColumn(table, column);
    const key = `${table}.${column}`;
    results.columns[key] = result;
    results.summary.total++;

    if (result.exists) {
      console.log(`  ✅ ${table}.${column}`);
      results.summary.exists++;
    } else {
      console.log(`  ❌ ${table}.${column} - ${result.error}`);
      results.summary.missing++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 VERIFICATION SUMMARY:\n');
  console.log(`  Total Objects Checked: ${results.summary.total}`);
  console.log(`  ✅ Exists: ${results.summary.exists} (${Math.round(results.summary.exists / results.summary.total * 100)}%)`);
  console.log(`  ❌ Missing: ${results.summary.missing} (${Math.round(results.summary.missing / results.summary.total * 100)}%)`);

  if (results.summary.missing === 0) {
    console.log('\n🎉 All database objects exist! Admin Nexus is ready to deploy!\n');
    return { success: true, results };
  } else {
    console.log('\n⚠️  Some database objects are missing. See details above.\n');

    // List missing objects
    console.log('📋 MISSING OBJECTS:\n');

    for (const [name, result] of Object.entries(results.tables)) {
      if (!result.exists) {
        console.log(`  • Table: ${name}`);
      }
    }

    for (const [name, result] of Object.entries(results.views)) {
      if (!result.exists) {
        console.log(`  • View: ${name}`);
      }
    }

    for (const [name, result] of Object.entries(results.rpcs)) {
      if (!result.exists) {
        console.log(`  • RPC: ${name}`);
      }
    }

    for (const [name, result] of Object.entries(results.columns)) {
      if (!result.exists) {
        console.log(`  • Column: ${name}`);
      }
    }

    console.log('\n💡 Next Steps:');
    console.log('   1. Create migrations for missing objects');
    console.log('   2. Apply migrations via Supabase dashboard');
    console.log('   3. Re-run this verification script');
    console.log('   4. Test affected modules in browser\n');

    return { success: false, results };
  }
}

// Run verification
verifyDatabase()
  .then(({ success }) => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Verification failed with error:', err.message);
    process.exit(1);
  });
