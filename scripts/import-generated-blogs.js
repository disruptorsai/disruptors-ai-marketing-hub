#!/usr/bin/env node
/**
 * Import Already-Generated Blogs to Supabase
 * Reads markdown files and inserts them into posts table
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

// Load strategy to get metadata
const strategy = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'comprehensive-blog-content-strategy.json'), 'utf8')
)

const ALL_BLOGS = [
  ...strategy.blog_strategy.set_1_original_10,
  ...strategy.blog_strategy.set_2_additional_10_icp_focused
]

const GENERATED_DIR = path.join(process.cwd(), 'temp', 'generated-blogs')

async function importBlog(slug, index) {
  const filepath = path.join(GENERATED_DIR, `${slug}.md`)

  if (!fs.existsSync(filepath)) {
    return { success: false, error: 'File not found' }
  }

  const content = fs.readFileSync(filepath, 'utf8')
  const wordCount = content.split(/\s+/).length
  const blog = ALL_BLOGS.find(b => b.slug === slug)

  if (!blog) {
    return { success: false, error: 'Blog config not found' }
  }

  console.log(`📤 Importing: ${blog.title}`)

  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: blog.title,
        slug: blog.slug,
        content: content,
        excerpt: blog.meta_description || content.substring(0, 160),
        meta_description: blog.meta_description,
        primary_keyword: blog.primary_keyword,
        secondary_keywords: blog.secondary_keywords || [],
        featured_image: blog.featured_image,

        // Blog metadata
        content_type: 'blog_post',
        word_count: wordCount,
        reading_time_minutes: Math.ceil(wordCount / 200),

        // SEO fields
        seo_title: blog.title,
        seo_description: blog.meta_description,
        seo_keywords: [blog.primary_keyword, ...(blog.secondary_keywords || [])],

        // Status
        status: 'draft',
        approval_status: index === 0 ? 'approved' : 'pending_review',
        is_published: false,
        ai_generated: true,

        // AI metadata
        generation_metadata: {
          model: 'claude-sonnet-4-20250514',
          generated_at: new Date().toISOString(),
          word_count: wordCount
        },

        // Publishing
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    console.log(`   ✅ Inserted: ${data.id} [${data.approval_status}]`)
    return { success: true, data }

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('📚 Importing Generated Blogs to Supabase\n')

  const files = fs.readdirSync(GENERATED_DIR).filter(f => f.endsWith('.md'))
  console.log(`Found ${files.length} markdown files\n`)

  let successCount = 0
  let skipCount = 0

  for (let i = 0; i < files.length; i++) {
    const slug = files[i].replace('.md', '')

    // Check if already exists
    const { data: existing } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      console.log(`⏭️  Skipping ${slug} (already exists)`)
      skipCount++
      continue
    }

    const result = await importBlog(slug, i)
    if (result.success) successCount++
  }

  console.log(`\n✅ Import Complete`)
  console.log(`   Imported: ${successCount}`)
  console.log(`   Skipped: ${skipCount}`)
  console.log(`   Total: ${files.length}`)
}

main().catch(console.error)
