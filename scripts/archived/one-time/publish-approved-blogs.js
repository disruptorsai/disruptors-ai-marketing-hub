#!/usr/bin/env node
/**
 * Publish Approved Blog Posts
 * Sets is_published=true for all approved blogs
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  console.log('📢 Publishing Approved Blog Posts\n')

  // Get all approved but not published blogs
  const { data: blogs, error: fetchError } = await supabase
    .from('posts')
    .select('id, title, slug, featured_image')
    .eq('approval_status', 'approved')
    .eq('is_published', false)

  if (fetchError) {
    console.error('❌ Error fetching blogs:', fetchError.message)
    return
  }

  if (!blogs || blogs.length === 0) {
    console.log('✅ No approved blogs waiting to be published')
    return
  }

  console.log(`Found ${blogs.length} approved blogs to publish:\n`)

  let successCount = 0

  for (const blog of blogs) {
    console.log(`📤 Publishing: ${blog.title}`)
    console.log(`   Slug: ${blog.slug}`)
    console.log(`   Image: ${blog.featured_image}`)

    const { error: updateError } = await supabase
      .from('posts')
      .update({
        is_published: true,
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', blog.id)

    if (updateError) {
      console.error(`   ❌ Failed: ${updateError.message}`)
    } else {
      console.log(`   ✅ Published!`)
      console.log(`   🔗 View at: /blog-detail?slug=${blog.slug}`)
      successCount++
    }
    console.log('')
  }

  console.log(`\n✅ Publishing Complete`)
  console.log(`   Published: ${successCount} of ${blogs.length}`)
}

main().catch(console.error)
