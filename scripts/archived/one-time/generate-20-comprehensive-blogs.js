#!/usr/bin/env node
/**
 * Comprehensive Blog Generation Script
 * Generates 20 full blog posts (2,500+ words each) with FAQs
 * Using Claude Sonnet 4.5 and inserts into Supabase posts table
 *
 * Usage: node scripts/generate-20-comprehensive-blogs.js
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { openaiGenerate } from '../src/lib/openai-image.js'
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

// Combine all 20 blogs
const ALL_BLOGS = [
  ...strategy.blog_strategy.set_1_original_10,
  ...strategy.blog_strategy.set_2_additional_10_icp_focused
]

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

    // Extract FAQ section for schema
    const faqMatch = content.match(/## (Frequently Asked Questions|FAQ)[\s\S]*$/i)
    const faqContent = faqMatch ? faqMatch[0] : ''

    return {
      blog,
      content,
      wordCount,
      faqContent,
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
 * Generate featured image for blog post
 */
async function generateFeaturedImage(blog, postId) {
  try {
    console.log(`🎨 Generating featured image...`)

    const category = blog.category || 'Marketing'
    const keywords = [
      blog.primary_keyword,
      ...(blog.secondary_keywords || [])
    ].filter(Boolean).slice(0, 4).join(', ')

    // Create professional AI prompt
    const prompt = `Professional blog header image for "${blog.title}". Modern corporate style with vibrant gradients (blue, purple, gold accents). Include abstract tech elements, AI circuits, data visualizations, and ${category.toLowerCase()} iconography. Keywords to visualize: ${keywords}. High-quality 3D rendering with depth and polish. Photorealistic. Corporate professional aesthetic. Wide format 16:9.`

    console.log(`   Prompt: ${prompt.substring(0, 100)}...`)

    // Generate image
    const buffer = await openaiGenerate({
      prompt: prompt,
      size: '1536x1024',
      quality: 'high'
    })

    // Save to disk
    const outputDir = path.join(process.cwd(), 'public', 'blog-images', 'generated')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const filename = `${blog.slug}.png`
    const filepath = path.join(outputDir, filename)
    fs.writeFileSync(filepath, buffer)
    console.log(`✅ Image saved: /blog-images/generated/${filename}`)

    // Update database with correct path
    const imagePath = `/blog-images/generated/${filename}`
    const { error } = await supabase
      .from('posts')
      .update({ featured_image: imagePath })
      .eq('id', postId)

    if (error) {
      console.error(`⚠️  Failed to update image path in database:`, error)
      return { success: false, error }
    }

    console.log(`✅ Database updated with image path`)
    return { success: true, path: imagePath }

  } catch (error) {
    console.error(`⚠️  Image generation failed:`, error.message)
    console.log(`   Blog will use fallback gradient hero`)
    return { success: false, error: error.message }
  }
}

/**
 * Insert blog post into Supabase
 */
async function insertBlogToSupabase(result, index) {
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
        approval_status: index === 0 ? 'approved' : 'pending_review', // First one approved for today
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
  console.log('🚀 COMPREHENSIVE BLOG GENERATION SYSTEM')
  console.log('=' .repeat(80))
  console.log(`📊 Total blogs to generate: ${ALL_BLOGS.length}`)
  console.log(`📝 Estimated total words: ${strategy.blog_strategy.metadata.total_word_count_estimated}`)
  console.log(`🤖 Model: Claude Sonnet 4.5`)
  console.log(`📅 First blog will be approved for publishing today`)
  console.log('='.repeat(80))
  console.log('')

  const results = []
  const insertResults = []

  // Generate all blogs
  for (let i = 0; i < ALL_BLOGS.length; i++) {
    const result = await generateBlogPost(ALL_BLOGS[i], i, ALL_BLOGS.length)
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

      // Generate featured image if insert was successful
      if (insertResult.success && insertResult.postId) {
        console.log('')
        const imageResult = await generateFeaturedImage(result.blog, insertResult.postId)
        insertResult.imageGenerated = imageResult.success
        insertResult.imagePath = imageResult.path
      }
    }

    // Rate limit: wait 3 seconds between requests
    if (i < ALL_BLOGS.length - 1) {
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
  const imagesGeneratedCount = insertResults.filter(r => r.imageGenerated).length

  console.log(`✅ Successfully generated: ${successCount}/${ALL_BLOGS.length}`)
  console.log(`❌ Failed: ${failCount}/${ALL_BLOGS.length}`)
  console.log(`📝 Total words written: ${totalWords.toLocaleString()}`)
  console.log(`📤 Inserted to Supabase: ${insertSuccessCount}/${successCount}`)
  console.log(`🎨 Featured images generated: ${imagesGeneratedCount}/${insertSuccessCount}`)
  console.log(`💾 Backup location: temp/generated-blogs/`)

  console.log('\n📋 Blog Status:')
  insertResults.forEach((result, i) => {
    if (result.success) {
      const blog = ALL_BLOGS[i]
      console.log(`   ${i + 1}. ${blog.title}`)
      console.log(`      Status: ${i === 0 ? '✅ APPROVED FOR TODAY' : '📋 Pending Review'}`)
      console.log(`      ID: ${result.postId}`)
    }
  })

  console.log('\n🎯 NEXT STEPS:')
  console.log('1. Review all blogs in Admin Nexus → Blog Management')
  console.log('2. The first blog is pre-approved and ready to publish')
  console.log('3. Featured images have been automatically generated (OpenAI gpt-image-1)')
  console.log('4. Approve remaining blogs to activate auto-scheduling')
  console.log('5. Publishing schedule: 3x/week (Mon/Wed/Fri) for 90 days, then 2x/week')
  console.log('')
  console.log('📝 Note: If any images failed to generate, run:')
  console.log('   node scripts/generate-all-missing-images.js')

  console.log('\n✨ Blog generation complete!')

  // Write summary report
  const reportPath = path.join(process.cwd(), 'temp', 'blog-generation-report.json')
  fs.writeFileSync(reportPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    total_blogs: ALL_BLOGS.length,
    success_count: successCount,
    fail_count: failCount,
    total_words: totalWords,
    inserted_count: insertSuccessCount,
    results,
    insert_results: insertResults
  }, null, 2))
  console.log(`\n📄 Full report: temp/blog-generation-report.json`)

  process.exit(failCount > 0 ? 1 : 0)
}

// Execute
main().catch(error => {
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})
