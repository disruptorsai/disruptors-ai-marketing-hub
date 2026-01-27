#!/usr/bin/env node
/**
 * Check Blog Posts in Database
 * Quick script to see what blog posts exist and their featured_image paths
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  console.log('📊 Checking Blog Posts in Database\n')

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, featured_image, is_published, status, approval_status, created_at')
    .eq('content_type', 'blog_post')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching posts:', error.message)
    return
  }

  if (!posts || posts.length === 0) {
    console.log('⚠️  No blog posts found in database')
    console.log('\n💡 To import generated blogs, run:')
    console.log('   node scripts/import-generated-blogs.js')
    return
  }

  console.log(`✅ Found ${posts.length} blog posts\n`)

  posts.forEach((post, i) => {
    console.log(`${i + 1}. ${post.title}`)
    console.log(`   Slug: ${post.slug}`)
    console.log(`   Image: ${post.featured_image || '❌ MISSING'}`)
    console.log(`   Status: ${post.status} | ${post.approval_status}`)
    console.log(`   Published: ${post.is_published ? '✅ Yes' : '❌ No'}`)
    console.log(`   Created: ${new Date(post.created_at).toLocaleDateString()}`)
    console.log('')
  })

  // Check for posts with missing images
  const missingImages = posts.filter(p => !p.featured_image)
  if (missingImages.length > 0) {
    console.log(`⚠️  ${missingImages.length} posts missing featured images:`)
    missingImages.forEach(p => console.log(`   - ${p.slug}`))
  }

  // Check for published posts
  const published = posts.filter(p => p.is_published)
  console.log(`\n📢 Published posts: ${published.length}`)

  // Check for approved posts
  const approved = posts.filter(p => p.approval_status === 'approved')
  console.log(`✅ Approved posts: ${approved.length}`)
}

main().catch(console.error)
