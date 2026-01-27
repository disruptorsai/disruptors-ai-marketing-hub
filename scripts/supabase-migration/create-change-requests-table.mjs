// Create change_requests table in NEW project and migrate data
const OLD_PROJECT = {
  url: 'https://ubqxflzuvxowigbjmqfb.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicXhmbHp1dnhvd2lnYmptcWZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODUxMjQzOCwiZXhwIjoyMDc0MDg4NDM4fQ.FnhnaAxWjMo41M7Gmm_bXFXZuegzW5HfitvB1APNDDk'
};

const NEW_PROJECT = {
  url: 'https://ulfnzcniivkjtfaoxfmi.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZm56Y25paXZranRmYW94Zm1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQzNjQ1MSwiZXhwIjoyMDg0MDEyNDUxfQ.kt9Y2zWkz6UV2rbyJnEZBRvaoc58bYdYW--YK5XpvDo'
};

// First, get the schema of change_requests from OLD project
async function getOldSchema() {
  console.log('📋 FETCHING CHANGE_REQUESTS SCHEMA FROM OLD PROJECT');
  console.log('='.repeat(50));

  // Get a sample row to understand the columns
  const response = await fetch(`${OLD_PROJECT.url}/rest/v1/change_requests?select=*&limit=1`, {
    headers: {
      'apikey': OLD_PROJECT.serviceRoleKey,
      'Authorization': `Bearer ${OLD_PROJECT.serviceRoleKey}`
    }
  });

  if (!response.ok) {
    console.log('   Could not fetch sample row');
    return null;
  }

  const data = await response.json();
  if (data.length > 0) {
    console.log('   Columns found:');
    Object.keys(data[0]).forEach(col => {
      const val = data[0][col];
      const type = val === null ? 'null' : typeof val;
      console.log(`   - ${col}: ${type}`);
    });
    return Object.keys(data[0]);
  }
  return null;
}

// Create table via SQL
async function createTable() {
  console.log('\n📝 Creating change_requests table...');

  // Note: We'll need to run this SQL manually in Supabase SQL Editor
  const createSQL = `
-- Create change_requests table
CREATE TABLE IF NOT EXISTS change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  category TEXT,
  page_url TEXT,
  screenshot_url TEXT,
  requested_by TEXT,
  assigned_to TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for authenticated users
CREATE POLICY "Allow all for authenticated users"
  ON change_requests FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policy for service role
CREATE POLICY "Allow all for service role"
  ON change_requests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
`;

  console.log('   SQL to run in NEW project SQL Editor:\n');
  console.log(createSQL);
  console.log('\n   After running the SQL, run migrate-change-requests.mjs');
}

// Export to SQL INSERT statements
async function exportToSQL() {
  console.log('\n📤 EXPORTING CHANGE_REQUESTS AS SQL');
  console.log('='.repeat(50));

  const response = await fetch(`${OLD_PROJECT.url}/rest/v1/change_requests?select=*`, {
    headers: {
      'apikey': OLD_PROJECT.serviceRoleKey,
      'Authorization': `Bearer ${OLD_PROJECT.serviceRoleKey}`
    }
  });

  if (!response.ok) {
    console.log('   Could not fetch change_requests');
    return;
  }

  const data = await response.json();
  console.log(`   Found ${data.length} rows`);

  if (data.length === 0) return;

  // Generate SQL INSERT statements
  let sql = `-- change_requests INSERT statements
-- Run this AFTER creating the table

`;

  for (const row of data) {
    const columns = Object.keys(row).filter(k => row[k] !== null);
    const values = columns.map(k => {
      const v = row[k];
      if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
      if (typeof v === 'number') return v;
      return `'${String(v).replace(/'/g, "''")}'`;
    });

    sql += `INSERT INTO change_requests (${columns.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT (id) DO NOTHING;\n`;
  }

  const { writeFileSync } = await import('fs');
  writeFileSync('scripts/supabase-migration/INSERT_CHANGE_REQUESTS.sql', sql);
  console.log('   ✅ Generated: scripts/supabase-migration/INSERT_CHANGE_REQUESTS.sql');
}

async function main() {
  await getOldSchema();
  await createTable();
  await exportToSQL();
}

main().catch(console.error);
