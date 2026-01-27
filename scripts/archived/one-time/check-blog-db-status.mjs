import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔍 Checking Blog Automation Database Status\n')
console.log('=' .repeat(60))

// Check if blog tables exist
const tables = ['blog_schedule', 'keyword_blog_mapping', 'blog_generation_queue', 'system_settings']

console.log('\n📊 Database Tables:\n')

for (const table of tables) {
  const { data, error } = await supabase.from(table).select('*').limit(1)

  if (error) {
    console.log(`❌ ${table}: NOT FOUND`)
  } else {
    console.log(`✅ ${table}: EXISTS`)
  }
}

// Check system_settings specifically for blog settings
const { data: settings, error: settingsError } = await supabase
  .from('system_settings')
  .select('setting_key')
  .like('setting_key', 'blog_%')

if (!settingsError && settings) {
  console.log(`\n⚙️  Blog Settings (${settings.length} found):\n`)
  settings.forEach(s => console.log(`   - ${s.setting_key}`))
} else {
  console.log('\n❌ No blog settings found in system_settings')
}

// Check posts table for blog automation columns
const { data: posts, error: postsError } = await supabase
  .from('posts')
  .select('*')
  .limit(1)

if (!postsError && posts && posts.length > 0) {
  const cols = Object.keys(posts[0])
  const blogCols = ['scheduled_for', 'approval_status', 'image_options', 'keyword_data', 'auto_generated']

  console.log('\n📋 Posts Table Blog Columns:\n')
  blogCols.forEach(col => {
    const present = cols.includes(col)
    console.log(`   ${present ? '✅' : '❌'} ${col}`)
  })
} else {
  console.log('\n❌ Could not check posts table')
}

console.log('\n' + '='.repeat(60))

process.exit(0)
