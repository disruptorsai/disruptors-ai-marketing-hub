/**
 * Verify Blog Automation System Migration
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

async function verify() {
  console.log('🔍 Verifying Blog Automation System Migration...\n')

  let allGood = true

  // 1. Check new posts columns
  console.log('1️⃣ Checking posts table columns...')
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('scheduled_for, approval_status, image_options, keyword_data, auto_generated')
    .limit(1)

  if (postsError) {
    console.log('   ❌ Posts table missing new columns:', postsError.message)
    allGood = false
  } else {
    console.log('   ✅ Posts table enhanced with new columns')
  }

  // 2. Check blog_schedule table
  console.log('\n2️⃣ Checking blog_schedule table...')
  const { data: schedule, error: scheduleError } = await supabase
    .from('blog_schedule')
    .select('*')
    .limit(1)

  if (scheduleError) {
    console.log('   ❌ blog_schedule table not found:', scheduleError.message)
    allGood = false
  } else {
    console.log('   ✅ blog_schedule table created')
  }

  // 3. Check keyword_blog_mapping table
  console.log('\n3️⃣ Checking keyword_blog_mapping table...')
  const { data: keywords, error: keywordsError } = await supabase
    .from('keyword_blog_mapping')
    .select('*')
    .limit(1)

  if (keywordsError) {
    console.log('   ❌ keyword_blog_mapping table not found:', keywordsError.message)
    allGood = false
  } else {
    console.log('   ✅ keyword_blog_mapping table created')
  }

  // 4. Check blog_generation_queue table
  console.log('\n4️⃣ Checking blog_generation_queue table...')
  const { data: queue, error: queueError } = await supabase
    .from('blog_generation_queue')
    .select('*')
    .limit(1)

  if (queueError) {
    console.log('   ❌ blog_generation_queue table not found:', queueError.message)
    allGood = false
  } else {
    console.log('   ✅ blog_generation_queue table created')
  }

  // 5. Check system_settings table
  console.log('\n5️⃣ Checking system_settings table...')
  const { data: settings, error: settingsError } = await supabase
    .from('system_settings')
    .select('*')

  if (settingsError) {
    console.log('   ❌ system_settings table not found:', settingsError.message)
    allGood = false
  } else {
    console.log('   ✅ system_settings table created')
    console.log(`   📊 Settings configured: ${settings.length}`)
    settings.forEach(s => {
      console.log(`      - ${s.setting_key}`)
    })
  }

  // 6. Check view exists
  console.log('\n6️⃣ Checking blog_management_dashboard view...')
  const { data: view, error: viewError } = await supabase
    .from('blog_management_dashboard')
    .select('*')
    .limit(1)

  if (viewError) {
    console.log('   ❌ blog_management_dashboard view not found:', viewError.message)
    allGood = false
  } else {
    console.log('   ✅ blog_management_dashboard view created')
  }

  // 7. Check buffer count
  console.log('\n7️⃣ Checking current blog buffer...')
  const { data: buffer, error: bufferError } = await supabase
    .from('posts')
    .select('id', { count: 'exact' })
    .in('approval_status', ['approved', 'scheduled'])

  if (!bufferError) {
    const count = buffer?.length || 0
    const minBuffer = settings?.find(s => s.setting_key === 'blog_buffer_size')?.setting_value?.min || 3
    
    if (count < minBuffer) {
      console.log(`   ⚠️  Buffer: ${count}/${minBuffer} (LOW - will trigger auto-generation)`)
    } else {
      console.log(`   ✅ Buffer: ${count}/${minBuffer} (OK)`)
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  if (allGood) {
    console.log('✅ ALL SYSTEMS GO! Blog automation is ready.')
    console.log('\n📍 Next steps:')
    console.log('   1. Access: https://dm4.wjwelsh.com → Ctrl+Shift+D')
    console.log('   2. Click "Blog Management" in sidebar')
    console.log('   3. Click "GET_KEYWORDS" to fetch trending keywords')
    console.log('   4. Generate your first batch of blogs!')
  } else {
    console.log('❌ MIGRATION INCOMPLETE - Please review errors above')
  }
  console.log('='.repeat(60))
}

verify().catch(console.error)
