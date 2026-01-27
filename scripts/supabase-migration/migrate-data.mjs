// Complete Data Migration Script
// Exports all data from OLD project and imports to NEW project

const OLD_PROJECT = {
  url: 'https://ubqxflzuvxowigbjmqfb.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicXhmbHp1dnhvd2lnYmptcWZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODUxMjQzOCwiZXhwIjoyMDc0MDg4NDM4fQ.FnhnaAxWjMo41M7Gmm_bXFXZuegzW5HfitvB1APNDDk'
};

const NEW_PROJECT = {
  url: 'https://ulfnzcniivkjtfaoxfmi.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZm56Y25paXZranRmYW94Zm1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQzNjQ1MSwiZXhwIjoyMDg0MDEyNDUxfQ.kt9Y2zWkz6UV2rbyJnEZBRvaoc58bYdYW--YK5XpvDo'
};

// Tables to migrate in dependency order (parents before children)
const TABLES_TO_MIGRATE = [
  'site_media',          // No dependencies
  'modules',             // No dependencies
  'settings',            // No dependencies
  'leads',               // No dependencies
  'keywords',            // No dependencies
  'business_brains',     // Parent of brain_*, brand_*, onboarding, knowledge
  'posts',               // May reference business_brains
  'brain_facts',         // Depends on business_brains
  'brand_rules',         // Depends on business_brains
  'brand_assets',        // Depends on business_brains
  'onboarding_sessions', // Depends on business_brains
  'knowledge_sources',   // Depends on business_brains
  'module_runs',         // Depends on modules, business_brains
  'module_access'        // Depends on modules
];

async function fetchAllFromTable(project, tableName) {
  const allData = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const response = await fetch(
      `${project.url}/rest/v1/${tableName}?select=*&limit=${limit}&offset=${offset}`,
      {
        headers: {
          'apikey': project.serviceRoleKey,
          'Authorization': `Bearer ${project.serviceRoleKey}`,
          'Prefer': 'return=representation'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      if (error.code === '42P01') {
        // Table doesn't exist
        return { exists: false, data: [] };
      }
      throw new Error(`Failed to fetch ${tableName}: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    allData.push(...data);

    if (data.length < limit) break;
    offset += limit;
  }

  return { exists: true, data: allData };
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(value) {
  return value && typeof value === 'string' && UUID_REGEX.test(value);
}

async function insertIntoTable(project, tableName, data) {
  if (data.length === 0) return { inserted: 0 };

  // Clean data - remove columns that cause issues
  const cleanedData = data.map(row => {
    const cleaned = { ...row };

    // Remove auto-generated columns
    delete cleaned.search_vector;
    delete cleaned.fts; // Generated tsvector column

    // Fix integer columns with decimal values
    const integerColumns = [
      'semantic_structure_version', 'word_count', 'read_time_minutes',
      'reading_time_minutes', 'display_order', 'width', 'height', 'file_size'
    ];
    for (const col of integerColumns) {
      if (col in cleaned && cleaned[col] !== null) {
        // Convert to integer (floor the value)
        cleaned[col] = Math.floor(Number(cleaned[col])) || null;
      }
    }

    // Null out foreign keys to auth.users (users aren't migrated)
    // Also fix invalid UUID values (like "admin" string)
    const userFkColumns = [
      'created_by', 'author_id', 'verified_by', 'approved_by',
      'granted_by', 'uploaded_by', 'assigned_to', 'last_modified_by',
      'author_member_id', 'agent_id'
    ];

    for (const col of userFkColumns) {
      if (col in cleaned) {
        // Null out if it's not a valid UUID (including auth.users refs)
        if (!isValidUUID(cleaned[col])) {
          cleaned[col] = null;
        } else {
          // It's a valid UUID but references old auth.users - null it
          cleaned[col] = null;
        }
      }
    }

    return cleaned;
  });

  // Insert in batches of 100
  const batchSize = 100;
  let totalInserted = 0;

  for (let i = 0; i < cleanedData.length; i += batchSize) {
    const batch = cleanedData.slice(i, i + batchSize);

    const response = await fetch(
      `${project.url}/rest/v1/${tableName}`,
      {
        method: 'POST',
        headers: {
          'apikey': project.serviceRoleKey,
          'Authorization': `Bearer ${project.serviceRoleKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal,resolution=ignore-duplicates'
        },
        body: JSON.stringify(batch)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error(`  ⚠️  Batch insert error for ${tableName}:`, error.message || error);
      // Continue with next batch
    } else {
      totalInserted += batch.length;
    }
  }

  return { inserted: totalInserted };
}

async function migrateTable(tableName) {
  console.log(`\n📦 Migrating: ${tableName}`);

  // Export from OLD
  console.log(`   Exporting from OLD project...`);
  const { exists, data } = await fetchAllFromTable(OLD_PROJECT, tableName);

  if (!exists) {
    console.log(`   ⏭️  Table doesn't exist in OLD project, skipping`);
    return { table: tableName, exported: 0, imported: 0, status: 'skipped' };
  }

  if (data.length === 0) {
    console.log(`   ⏭️  No data to migrate`);
    return { table: tableName, exported: 0, imported: 0, status: 'empty' };
  }

  console.log(`   ✅ Exported ${data.length} rows`);

  // Import to NEW
  console.log(`   Importing to NEW project...`);
  const { inserted } = await insertIntoTable(NEW_PROJECT, tableName, data);
  console.log(`   ✅ Imported ${inserted} rows`);

  return { table: tableName, exported: data.length, imported: inserted, status: 'success' };
}

async function main() {
  console.log('='.repeat(60));
  console.log('SUPABASE DATA MIGRATION');
  console.log('='.repeat(60));
  console.log(`FROM: ${OLD_PROJECT.url}`);
  console.log(`TO:   ${NEW_PROJECT.url}`);
  console.log('='.repeat(60));

  const results = [];

  for (const table of TABLES_TO_MIGRATE) {
    try {
      const result = await migrateTable(table);
      results.push(result);
    } catch (error) {
      console.error(`   ❌ Error migrating ${table}:`, error.message);
      results.push({ table, exported: 0, imported: 0, status: 'error', error: error.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('MIGRATION SUMMARY');
  console.log('='.repeat(60));

  let totalExported = 0;
  let totalImported = 0;

  for (const r of results) {
    const status = r.status === 'success' ? '✅' : r.status === 'empty' ? '⏭️' : r.status === 'skipped' ? '⏭️' : '❌';
    console.log(`${status} ${r.table.padEnd(25)} ${r.exported} → ${r.imported}`);
    totalExported += r.exported;
    totalImported += r.imported;
  }

  console.log('-'.repeat(60));
  console.log(`TOTAL: ${totalExported} exported, ${totalImported} imported`);
  console.log('='.repeat(60));

  if (totalImported > 0) {
    console.log('\n✅ DATA MIGRATION COMPLETE!');
    console.log('\nNext steps:');
    console.log('1. Update .env with new Supabase credentials');
    console.log('2. Update Netlify environment variables');
    console.log('3. Configure Google OAuth in new project');
    console.log('4. Test the application');
  }
}

main().catch(console.error);
