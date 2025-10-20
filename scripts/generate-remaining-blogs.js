#!/usr/bin/env node
/**
 * Generate Remaining Blogs (7-20)
 * Continues from where the previous generation stopped
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load strategy
const strategy = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'comprehensive-blog-content-strategy.json'), 'utf8')
)

// Initialize clients
const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY
})

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

// All 20 blogs
const ALL_BLOGS = [
  ...strategy.blog_strategy.set_1_original_10,
  ...strategy.blog_strategy.set_2_additional_10_icp_focused
]

// Check which blogs already exist
const GENERATED_DIR = path.join(process.cwd(), 'temp', 'generated-blogs')
const existingSlugs = fs.existsSync(GENERATED_DIR)
  ? fs.readdirSync(GENERATED_DIR).filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''))
  : []

// Filter to only remaining blogs
const REMAINING_BLOGS = ALL_BLOGS.filter(b => !existingSlugs.includes(b.slug))

console.log(`\n📊 Already generated: ${existingSlugs.length}`)
console.log(`📝 Remaining to generate: ${REMAINING_BLOGS.length}`)
console.log(`\nExisting blogs:`)
existingSlugs.forEach(s => console.log(`  ✓ ${s}`))
console.log(`\nTo generate:`)
REMAINING_BLOGS.forEach(b => console.log(`  ○ ${b.slug}`))
console.log('')

/**
 * Generate a single comprehensive blog post
 */
async function generateBlogPost(blog, index, total) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`📝 GENERATING BLOG ${index + 1}/${total}`)
  console.log(`${'='.repeat(80)}`)
  console.log(`Title: ${blog.title}`)
  console.log(`Slug: ${blog.slug}`)
  console.log(`Target: ${blog.word_count} words`)
  console.log(`Primary Keyword: ${blog.primary_keyword}`)
  console.log(`${'='.repeat(80)}\n`)

  const systemPrompt = `You are an expert AI marketing content writer for Disruptors AI, a cutting-edge AI marketing platform. Your task is to write comprehensive, SEO-optimized blog posts that are:

1. **Data-Driven**: Include real statistics, market data, and research findings
2. **Actionable**: Provide step-by-step instructions and practical frameworks
3. **Authority-Building**: Demonstrate deep expertise in AI marketing
4. **Engaging**: Professional but conversational tone - you're the expert guide
5. **SEO-Optimized**: Natural keyword integration, structured for featured snippets
6. **Comprehensive**: ${blog.word_count}+ words with examples and case studies

**BRAND VOICE (Disruptors AI)**:
- Bold and attention-grabbing (no generic corporate speak)
- Data-backed and authoritative
- Occasionally contrarian (challenge conventional wisdom)
- Every sentence adds value (no fluff)
- Target audience: B2B businesses, marketing directors, service business owners

**REQUIRED STRUCTURE**:
1. **Hook/Introduction** (100-150 words)
   - Compelling statistic or problem statement
   - Preview what they'll learn
   - Set up the unique angle

2. **Main Content Sections** (5-7 H2 sections, each 400-600 words)
   - Use descriptive H2 headings (not generic)
   - Include H3 subheadings for detailed steps
   - Examples, case studies, or scenarios in each section
   - Bullet points and numbered lists for scannability

3. **Actionable Framework/Checklist** (300-400 words)
   - Step-by-step implementation guide
   - OR decision framework/matrix
   - OR self-assessment tool

4. **Frequently Asked Questions** (500-700 words)
   - 7-10 questions based on search intent
   - Direct, quotable answers (50-100 words each)
   - Address objections and edge cases
   - Include cost/ROI questions
   - Format as H3 questions with detailed answers

5. **Strong Call-to-Action** (100-150 words)
   - Connect to Disruptors AI platform features
   - Specific next step (not generic "contact us")
   - Value proposition reminder

**SEO BEST PRACTICES**:
- Primary keyword in first 100 words, H1, and conclusion
- Secondary keywords naturally distributed
- Short paragraphs (2-4 sentences)
- Include semantic variations and LSI keywords
- Answer Box format in introduction (3-5 sentence direct answer)
- Internal linking opportunities mentioned
- Schema.org structured data hints

**RESEARCH INTEGRATION**:
Use these 2025 AI marketing statistics naturally:
- $47.32B AI marketing market, 36.6% CAGR
- 60% of marketers use AI daily (up from 37%)
- 90% use AI for content, only 29% are "advanced"
- 51% can't measure AI ROI
- 79% want automation workflow training
- ChatGPT dominates at 90% usage, Claude at 33%

**FORMATTING**:
- Use Markdown formatting
- H1 for title, H2 for main sections, H3 for subsections
- Bold key phrases and statistics
- Use > for important callouts
- Code blocks for technical examples if relevant
- Tables for comparisons or data
- Bullet points for lists

Write in a professional yet engaging tone. You're the expert guide helping businesses navigate AI marketing. Be authoritative but not condescending. Challenge assumptions. Back everything with data or examples.

**IMPORTANT**: Write the COMPLETE blog post in one response. Do not summarize or abbreviate. This is the final published version.`

  const userPrompt = `Write a comprehensive ${blog.word_count}+ word blog post with the following specifications:

**Title**: ${blog.title}

**Meta Description**: ${blog.meta_description || 'Create an engaging 155-character meta description'}

**Primary Keyword**: ${blog.primary_keyword}

**Secondary Keywords**: ${blog.secondary_keywords?.join(', ')}

${blog.unique_angle ? `**Unique Angle**: ${blog.unique_angle}` : ''}

${blog.target_icp ? `**Target Audience**: ${blog.target_icp}` : ''}

Remember:
- ${blog.word_count}+ words minimum
- Include 7-10 FAQ questions at the end
- Provide actionable steps and frameworks
- Use real data and examples
- Professional but conversational tone
- SEO-optimized for featured snippets

Write the complete blog post now in Markdown format.`

  try {
    console.log('⏳ Calling Claude Sonnet 4.5...')

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    })

    const content = message.content[0].text
    const wordCount = content.split(/\s+/).length

    console.log(`✅ Generated ${wordCount} words`)
    console.log(`💰 Tokens: ${message.usage.input_tokens} in, ${message.usage.output_tokens} out`)

    return {
      blog,
      content,
      wordCount,
      metadata: {
        model: 'claude-sonnet-4-20250514',
        tokens_used: message.usage.input_tokens + message.usage.output_tokens,
        generated_at: new Date().toISOString()
      },
      success: true
    }

  } catch (error) {
    console.error(`❌ Failed to generate blog: ${error.message}`)
    return {
      blog,
      error: error.message,
      success: false
    }
  }
}

/**
 * Insert blog post into Supabase
 */
async function insertBlogToSupabase(result, originalIndex) {
  if (!result.success) return { success: false, error: result.error }

  const blog = result.blog

  try {
    console.log(`📤 Inserting into Supabase...`)

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: blog.title,
        slug: blog.slug,
        content: result.content,
        excerpt: blog.meta_description || result.content.substring(0, 160),
        meta_description: blog.meta_description,
        primary_keyword: blog.primary_keyword,
        secondary_keywords: blog.secondary_keywords || [],
        featured_image: blog.featured_image,

        // Blog metadata
        content_type: 'blog_post',
        word_count: result.wordCount,
        reading_time_minutes: Math.ceil(result.wordCount / 200),

        // SEO fields
        seo_title: blog.title,
        seo_description: blog.meta_description,
        seo_keywords: [blog.primary_keyword, ...(blog.secondary_keywords || [])],

        // Status
        status: 'draft',
        approval_status: 'pending_review',
        is_published: false,
        ai_generated: true,

        // AI metadata (model stored in generation_metadata)
        generation_metadata: result.metadata,

        // Publishing
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    console.log(`✅ Inserted: ${data.id}`)
    console.log(`   Status: ${data.approval_status}`)

    return { success: true, data, postId: data.id }

  } catch (error) {
    console.error(`❌ Failed to insert: ${error.message}`)
    return { success: false, error: error.message }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 GENERATING REMAINING BLOGS')
  console.log('=' .repeat(80))
  console.log(`📊 Blogs to generate: ${REMAINING_BLOGS.length}`)
  console.log(`🤖 Model: Claude Sonnet 4.5`)
  console.log('='.repeat(80))

  if (REMAINING_BLOGS.length === 0) {
    console.log('\n✅ All blogs already generated!')
    process.exit(0)
  }

  const results = []
  const insertResults = []

  // Generate remaining blogs
  for (let i = 0; i < REMAINING_BLOGS.length; i++) {
    const result = await generateBlogPost(REMAINING_BLOGS[i], i, REMAINING_BLOGS.length)
    results.push(result)

    // Save to file for backup
    if (result.success) {
      const outputDir = path.join(process.cwd(), 'temp', 'generated-blogs')
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      const filename = `${result.blog.slug}.md`
      fs.writeFileSync(
        path.join(outputDir, filename),
        result.content
      )
      console.log(`💾 Saved to: temp/generated-blogs/${filename}`)

      // Insert to Supabase
      const insertResult = await insertBlogToSupabase(result, i)
      insertResults.push(insertResult)
    }

    // Rate limit: wait 3 seconds between requests
    if (i < REMAINING_BLOGS.length - 1) {
      console.log('\n⏳ Waiting 3 seconds before next generation...\n')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('📊 GENERATION COMPLETE')
  console.log('='.repeat(80))

  const successCount = results.filter(r => r.success).length
  const failCount = results.length - successCount
  const totalWords = results.filter(r => r.success).reduce((sum, r) => sum + r.wordCount, 0)
  const insertSuccessCount = insertResults.filter(r => r.success).length

  console.log(`✅ Successfully generated: ${successCount}/${REMAINING_BLOGS.length}`)
  console.log(`❌ Failed: ${failCount}/${REMAINING_BLOGS.length}`)
  console.log(`📝 Total words written: ${totalWords.toLocaleString()}`)
  console.log(`📤 Inserted to Supabase: ${insertSuccessCount}/${successCount}`)

  console.log('\n📋 Generated Blogs:')
  insertResults.forEach((result, i) => {
    if (result.success) {
      const blog = REMAINING_BLOGS[i]
      console.log(`   ${i + 1}. ${blog.title}`)
      console.log(`      ID: ${result.postId}`)
    }
  })

  console.log('\n🎯 ALL BLOGS NOW COMPLETE!')
  console.log(`Total blogs in system: ${existingSlugs.length + successCount}/20`)
  console.log('\nNext: Run "node scripts/configure-blog-publishing-schedule.js"')

  process.exit(failCount > 0 ? 1 : 0)
}

// Execute
main().catch(error => {
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})
