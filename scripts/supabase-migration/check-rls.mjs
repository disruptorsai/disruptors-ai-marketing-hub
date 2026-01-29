const url = 'https://ulfnzcniivkjtfaoxfmi.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZm56Y25paXZranRmYW94Zm1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQzNjQ1MSwiZXhwIjoyMDg0MDEyNDUxfQ.kt9Y2zWkz6UV2rbyJnEZBRvaoc58bYdYW--YK5XpvDo';

const visible = ['9ffb594b-dbc9-4bc4-9003-1c4c6d90d060', '84136363-9807-4e71-b7ef-1ca158ab1db9', '4574133e-f11c-4316-951a-b623a21b30ab'];

const r = await fetch(url + '/rest/v1/posts?status=eq.published&select=id,title,user_id,is_public', {
  headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
});
const posts = await r.json();

console.log('Published posts analysis:\n');
posts.forEach(p => {
  const v = visible.includes(p.id) ? 'VISIBLE' : 'HIDDEN';
  console.log(v, '| user_id:', p.user_id || 'null', '| is_public:', p.is_public, '|', (p.title || '').substring(0, 40));
});

// Fix: Set is_public to true for all published posts
console.log('\n--- Fixing is_public for all published posts ---');
const fix = await fetch(url + '/rest/v1/posts?status=eq.published', {
  method: 'PATCH',
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  },
  body: JSON.stringify({ is_public: true })
});

if (fix.ok) {
  console.log('✅ Set is_public=true for all published posts');
} else {
  console.log('❌ Failed:', await fix.text());
}
