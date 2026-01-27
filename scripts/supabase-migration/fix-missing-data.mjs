// Fix missing team_members and published posts
const OLD = {
  url: 'https://ubqxflzuvxowigbjmqfb.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicXhmbHp1dnhvd2lnYmptcWZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODUxMjQzOCwiZXhwIjoyMDc0MDg4NDM4fQ.FnhnaAxWjMo41M7Gmm_bXFXZuegzW5HfitvB1APNDDk'
};

const NEW = {
  url: 'https://ulfnzcniivkjtfaoxfmi.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZm56Y25paXZranRmYW94Zm1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQzNjQ1MSwiZXhwIjoyMDg0MDEyNDUxfQ.kt9Y2zWkz6UV2rbyJnEZBRvaoc58bYdYW--YK5XpvDo'
};

async function createTeamMembersTable() {
  console.log('Creating team_members table...');

  // First get the schema from OLD by fetching a row
  const sample = await fetch(`${OLD.url}/rest/v1/team_members?select=*&limit=1`, {
    headers: { 'apikey': OLD.key, 'Authorization': `Bearer ${OLD.key}` }
  });
  const sampleData = await sample.json();

  if (sampleData.length > 0) {
    console.log('Columns:', Object.keys(sampleData[0]).join(', '));
  }

  // The table needs to be created via SQL - let's generate it
  const createSQL = `
-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  title TEXT,
  bio TEXT,
  image_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  email TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access" ON team_members FOR SELECT USING (true);

-- Authenticated write access
CREATE POLICY "Authenticated write access" ON team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
`;

  console.log('\n--- SQL to create team_members table ---');
  console.log(createSQL);

  return createSQL;
}

async function migrateTeamMembers() {
  console.log('\n--- Migrating team_members data ---');

  // Fetch from OLD
  const response = await fetch(`${OLD.url}/rest/v1/team_members?select=*`, {
    headers: { 'apikey': OLD.key, 'Authorization': `Bearer ${OLD.key}` }
  });

  const data = await response.json();
  console.log(`Found ${data.length} team members in OLD`);

  if (data.length === 0) return;

  // Try to insert into NEW
  const insertResponse = await fetch(`${NEW.url}/rest/v1/team_members`, {
    method: 'POST',
    headers: {
      'apikey': NEW.key,
      'Authorization': `Bearer ${NEW.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(data)
  });

  if (insertResponse.ok) {
    console.log(`✅ Inserted ${data.length} team members`);
  } else {
    const error = await insertResponse.json();
    console.log('❌ Insert failed:', error.message);

    // Generate SQL instead
    console.log('\n--- SQL INSERT statements ---');
    for (const member of data) {
      const cols = Object.keys(member).filter(k => member[k] !== null);
      const vals = cols.map(k => {
        const v = member[k];
        if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
        if (typeof v === 'number') return v;
        return `'${String(v).replace(/'/g, "''")}'`;
      });
      console.log(`INSERT INTO team_members (${cols.join(', ')}) VALUES (${vals.join(', ')}) ON CONFLICT (id) DO NOTHING;`);
    }
  }
}

async function fixPublishedPosts() {
  console.log('\n--- Fixing published posts ---');

  // Get published post IDs from OLD
  const oldPosts = await fetch(`${OLD.url}/rest/v1/posts?status=eq.published&select=id,title,status`, {
    headers: { 'apikey': OLD.key, 'Authorization': `Bearer ${OLD.key}` }
  });
  const published = await oldPosts.json();
  console.log(`Found ${published.length} published posts in OLD`);

  // Check status of same posts in NEW
  for (const post of published) {
    const newPost = await fetch(`${NEW.url}/rest/v1/posts?id=eq.${post.id}&select=id,title,status`, {
      headers: { 'apikey': NEW.key, 'Authorization': `Bearer ${NEW.key}` }
    });
    const newData = await newPost.json();

    if (newData.length > 0) {
      console.log(`  ${post.title.substring(0, 40)}... OLD: ${post.status}, NEW: ${newData[0].status}`);

      // Update status if different
      if (newData[0].status !== post.status) {
        const update = await fetch(`${NEW.url}/rest/v1/posts?id=eq.${post.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': NEW.key,
            'Authorization': `Bearer ${NEW.key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: post.status })
        });

        if (update.ok) {
          console.log(`    ✅ Updated to ${post.status}`);
        } else {
          console.log(`    ❌ Failed to update`);
        }
      }
    }
  }
}

async function main() {
  await createTeamMembersTable();
  await migrateTeamMembers();
  await fixPublishedPosts();

  console.log('\n✅ Done!');
}

main().catch(console.error);
