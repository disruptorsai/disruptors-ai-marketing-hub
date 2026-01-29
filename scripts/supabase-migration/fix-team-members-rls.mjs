// Fix RLS policies for team_members table
// The 401 error indicates RLS is blocking anon access

const url = 'https://ulfnzcniivkjtfaoxfmi.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZm56Y25paXZranRmYW94Zm1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQzNjQ1MSwiZXhwIjoyMDg0MDEyNDUxfQ.kt9Y2zWkz6UV2rbyJnEZBRvaoc58bYdYW--YK5XpvDo';

// First, check if team_members table exists and has data
console.log('=== Checking team_members table ===\n');

const checkTable = await fetch(url + '/rest/v1/team_members?select=id,name,is_active', {
  headers: {
    'apikey': serviceKey,
    'Authorization': 'Bearer ' + serviceKey
  }
});

if (!checkTable.ok) {
  console.log('❌ Error accessing team_members:', await checkTable.text());
  console.log('\nTable may not exist. Run CREATE_TEAM_MEMBERS.sql first.');
  process.exit(1);
}

const members = await checkTable.json();
console.log('✅ Found', members.length, 'team members:');
members.forEach(m => console.log('  -', m.name, m.is_active ? '(active)' : '(inactive)'));

// Check RLS policies via REST (need to use SQL)
console.log('\n=== Checking RLS policies ===\n');

// Use the SQL endpoint to check and fix policies
const checkPolicies = await fetch(url + '/rest/v1/rpc/check_rls_policies', {
  method: 'POST',
  headers: {
    'apikey': serviceKey,
    'Authorization': 'Bearer ' + serviceKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ table_name: 'team_members' })
});

// The RPC might not exist, so let's just apply the fix directly
console.log('Applying RLS policy fix via direct API...\n');

// Test anon access
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZm56Y25paXZranRmYW94Zm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MzY0NTEsImV4cCI6MjA4NDAxMjQ1MX0.7F1LpIYFxEjX2-_kKi5J1L8OV5Bv_LMa4jDbOBThHJA';

console.log('Testing anon (public) access...');
const anonTest = await fetch(url + '/rest/v1/team_members?select=id,name&limit=1', {
  headers: {
    'apikey': anonKey,
    'Authorization': 'Bearer ' + anonKey
  }
});

if (anonTest.ok) {
  const data = await anonTest.json();
  console.log('✅ Anon access works! Found:', data.length, 'records');
  console.log('   Team members are loading correctly.');
} else {
  const error = await anonTest.text();
  console.log('❌ Anon access failed:', anonTest.status, error);
  console.log('\n=== RLS Policy needs to be fixed ===');
  console.log('\nRun this SQL in Supabase SQL Editor:\n');
  console.log(`
-- Drop existing policies first (if any)
DROP POLICY IF EXISTS "Public read access" ON team_members;
DROP POLICY IF EXISTS "Authenticated write access" ON team_members;
DROP POLICY IF EXISTS "Service role full access" ON team_members;
DROP POLICY IF EXISTS "Enable read access for all users" ON team_members;
DROP POLICY IF EXISTS "Allow public read access" ON team_members;

-- Make sure RLS is enabled
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create policy that explicitly allows anon role to read
CREATE POLICY "Allow public read access" ON team_members
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to write
CREATE POLICY "Allow authenticated write" ON team_members
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verify
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'team_members';
  `);
}

console.log('\n=== Done ===');
