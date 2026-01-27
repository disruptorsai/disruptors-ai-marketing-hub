// Check what data is missing between OLD and NEW projects
const OLD = {
  url: 'https://ubqxflzuvxowigbjmqfb.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicXhmbHp1dnhvd2lnYmptcWZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODUxMjQzOCwiZXhwIjoyMDc0MDg4NDM4fQ.FnhnaAxWjMo41M7Gmm_bXFXZuegzW5HfitvB1APNDDk'
};

const NEW = {
  url: 'https://ulfnzcniivkjtfaoxfmi.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZm56Y25paXZranRmYW94Zm1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQzNjQ1MSwiZXhwIjoyMDg0MDEyNDUxfQ.kt9Y2zWkz6UV2rbyJnEZBRvaoc58bYdYW--YK5XpvDo'
};

async function checkTable(proj, table) {
  const r = await fetch(`${proj.url}/rest/v1/${table}?select=*&limit=3`, {
    headers: {
      'apikey': proj.key,
      'Authorization': `Bearer ${proj.key}`,
      'Prefer': 'count=exact'
    }
  });

  if (!r.ok) return { exists: false, count: 0 };

  const count = r.headers.get('content-range')?.split('/')[1] || '0';
  const data = await r.json();
  return {
    exists: true,
    count: parseInt(count),
    sample: data[0] ? Object.keys(data[0]) : []
  };
}

async function main() {
  const tables = ['team_members', 'posts', 'site_media', 'business_brains', 'brain_facts'];

  console.log('Comparing OLD vs NEW Supabase projects\n');
  console.log('Table'.padEnd(20) + 'OLD'.padEnd(10) + 'NEW'.padEnd(10) + 'Status');
  console.log('='.repeat(50));

  for (const table of tables) {
    const old = await checkTable(OLD, table);
    const neo = await checkTable(NEW, table);

    let status = '';
    if (!old.exists && !neo.exists) status = 'Neither has table';
    else if (!old.exists) status = 'Only in NEW';
    else if (!neo.exists) status = 'MISSING in NEW!';
    else if (old.count === neo.count) status = 'OK';
    else if (neo.count < old.count) status = `MISSING ${old.count - neo.count} rows`;
    else status = 'OK (NEW has more)';

    console.log(
      table.padEnd(20) +
      (old.exists ? old.count.toString() : 'N/A').padEnd(10) +
      (neo.exists ? neo.count.toString() : 'N/A').padEnd(10) +
      status
    );
  }

  // Check published posts specifically
  console.log('\n--- Published Posts ---');
  const oldPub = await fetch(`${OLD.url}/rest/v1/posts?status=eq.published&select=id`, {
    headers: { 'apikey': OLD.key, 'Authorization': `Bearer ${OLD.key}` }
  });
  const newPub = await fetch(`${NEW.url}/rest/v1/posts?status=eq.published&select=id`, {
    headers: { 'apikey': NEW.key, 'Authorization': `Bearer ${NEW.key}` }
  });

  const oldPubData = await oldPub.json();
  const newPubData = await newPub.json();
  console.log(`OLD published: ${oldPubData.length}`);
  console.log(`NEW published: ${newPubData.length}`);
}

main().catch(console.error);
