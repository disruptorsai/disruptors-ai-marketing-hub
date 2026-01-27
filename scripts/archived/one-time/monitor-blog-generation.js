#!/usr/bin/env node
/**
 * Blog Generation Monitor
 * Checks progress every 2 minutes and reports when complete
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

const TOTAL_BLOGS = 20
const CHECK_INTERVAL = 120000 // 2 minutes
const GENERATED_BLOGS_DIR = path.join(process.cwd(), 'temp', 'generated-blogs')

let lastCount = 0

async function checkProgress() {
  console.log('\n' + '='.repeat(70))
  console.log(`📊 Blog Generation Status Check - ${new Date().toLocaleTimeString()}`)
  console.log('='.repeat(70))

  // Check markdown files
  let markdownCount = 0
  try {
    const files = fs.readdirSync(GENERATED_BLOGS_DIR).filter(f => f.endsWith('.md'))
    markdownCount = files.length
  } catch (error) {
    markdownCount = 0
  }

  // Check Supabase
  const { data: posts, count } = await supabase
    .from('posts')
    .select('id, title, approval_status', { count: 'exact' })
    .eq('ai_generated', true)
    .order('created_at', { ascending: false })

  console.log(`\n📝 Markdown Files: ${markdownCount}/${TOTAL_BLOGS}`)
  console.log(`📤 Inserted to Supabase: ${count || 0}/${TOTAL_BLOGS}`)

  if (markdownCount > lastCount) {
    console.log(`\n✨ Progress: +${markdownCount - lastCount} new blogs generated`)
    lastCount = markdownCount
  }

  const percentage = Math.round((markdownCount / TOTAL_BLOGS) * 100)
  const progressBar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5))
  console.log(`\n[${progressBar}] ${percentage}%`)

  if (markdownCount === TOTAL_BLOGS && count === TOTAL_BLOGS) {
    console.log('\n' + '='.repeat(70))
    console.log('🎉 BLOG GENERATION COMPLETE!')
    console.log('='.repeat(70))
    console.log('\n✅ All 20 blogs generated and inserted into Supabase')

    if (posts && posts.length > 0) {
      console.log('\n📋 First 5 blogs:')
      posts.slice(0, 5).forEach((p, i) => {
        console.log(`   ${i + 1}. [${p.approval_status}] ${p.title}`)
      })
    }

    console.log('\n🎯 NEXT STEPS:')
    console.log('1. Run: node scripts/configure-blog-publishing-schedule.js')
    console.log('2. Review blogs in Admin Nexus (/admin/secret → Blog Management)')
    console.log('3. First blog is pre-approved and ready to publish!')

    process.exit(0)
  }

  console.log(`\n⏳ Estimated time remaining: ${Math.ceil(((TOTAL_BLOGS - markdownCount) * 2.5))} minutes`)
  console.log('   (Next check in 2 minutes...)')
}

// Initial check
checkProgress()

// Check every 2 minutes
const interval = setInterval(checkProgress, CHECK_INTERVAL)

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Monitoring stopped. Blog generation continues in background.')
  clearInterval(interval)
  process.exit(0)
})
