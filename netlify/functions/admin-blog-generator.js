/**
 * Admin Blog Generator
 * Handles batch blog generation, regeneration, and keyword-based creation
 */

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY
})

// Enhanced system prompt for blog generation
const BLOG_SYSTEM_PROMPT = `Role: You are a top-performing SEO strategist and educator. Write epic, original blog posts that are practical, easy to follow, and consistently optimized for search and generative engines.

Core Output Requirements:
- Write at least 1,200 words in narrative style with H1/H2/H3 formatting
- Optimize for {{PRIMARY_KEYWORD}} and support with {{SECONDARY_KEYWORD}}
- Add 1–2 internal links to relevant pages within {{TARGET_URL}}
- Add 1–2 external links to reputable, authoritative sources
- Include 5 FAQs driven by real user search intent
- Tone: Disruptors & Co — bold, attention-grabbing, no fluff, occasionally contrarian
- Audience: non-experts in skilled trades and service businesses
- Reading level: roughly 12th grade

Hard Style Rules:
- Do not use em dashes
- Use no more than two lists total
- Do not use first-person language
- Do not use typical blog headings like "Introduction" or "Conclusion"

Article Structure:
1. H1: {{TITLE}}
2. H2: Answer Box — 3–5 sentence direct answer for {{PRIMARY_KEYWORD}}
3. Key Facts mini-table or brief list
4. H2: Core Strategy (mapped to search intent)
   - H3: Step-by-Step Process
   - H3: Tools & Setup (Ahrefs-focused)
   - H3: Troubleshooting & Edge Cases
5. H2: Local SEO Block (if {{PRIMARY_LOCATION}} provided)
6. H2: Measurement Plan (3 KPIs)
7. H2: FAQs (5)
8. H2: Schema Hint (which types to implement)

Write compelling, original, SEO-optimized content that ranks well and engages readers.`

/**
 * Generate a single blog article
 */
async function generateBlogArticle({ title, primaryKeyword, secondaryKeyword, targetUrl = 'https://dm4.wjwelsh.com', primaryLocation = '' }) {
  const customizedPrompt = BLOG_SYSTEM_PROMPT
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{PRIMARY_KEYWORD\}\}/g, primaryKeyword)
    .replace(/\{\{SECONDARY_KEYWORD\}\}/g, secondaryKeyword)
    .replace(/\{\{TARGET_URL\}\}/g, targetUrl)
    .replace(/\{\{PRIMARY_LOCATION\}\}/g, primaryLocation)

  const userPrompt = `Write a complete blog article with the following details:

Title: ${title}
Primary Keyword: ${primaryKeyword}
Secondary Keyword: ${secondaryKeyword}
Target URL for internal links: ${targetUrl}
${primaryLocation ? `Primary Location: ${primaryLocation}` : ''}

Write the article now following all requirements.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: customizedPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  })

  return message.content[0].text
}

/**
 * Generate blog title from keyword
 */
function generateTitleFromKeyword(keyword) {
  const templates = [
    `The Ultimate Guide to ${keyword}`,
    `How to Master ${keyword} in 2025`,
    `${keyword}: Everything You Need to Know`,
    `Why ${keyword} is Critical for Your Business`,
    `${keyword} Strategies That Actually Work`,
    `The Complete ${keyword} Playbook`,
    `${keyword}: Best Practices and Expert Tips`
  ]
  return templates[Math.floor(Math.random() * templates.length)]
}

/**
 * Generate slug from title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Main handler
 */
export async function handler(event) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { action, blogId, keyword, keywords, count = 3 } = JSON.parse(event.body)

    // ========================================================================
    // Action: Regenerate single blog
    // ========================================================================
    if (action === 'regenerate') {
      // Get existing blog
      const { data: blog, error: fetchError } = await supabaseAdmin
        .from('posts')
        .select('*, keyword_blog_mapping(*)')
        .eq('id', blogId)
        .single()

      if (fetchError || !blog) {
        throw new Error('Blog not found')
      }

      // Use existing keywords or provided keyword
      const keywords = blog.keyword_blog_mapping || []
      const primaryKeyword = keyword || keywords.find(k => k.keyword_type === 'primary')?.keyword || blog.title
      const secondaryKeyword = keywords.find(k => k.keyword_type === 'secondary')?.keyword || primaryKeyword

      // Generate new content
      const content = await generateBlogArticle({
        title: blog.title,
        primaryKeyword,
        secondaryKeyword
      })

      // Calculate read time
      const wordCount = content.split(/\s+/).length
      const readTime = Math.ceil(wordCount / 200)

      // Update blog
      const { error: updateError } = await supabaseAdmin
        .from('posts')
        .update({
          content,
          read_time_minutes: readTime,
          approval_status: 'pending_review',
          auto_generated: true,
          generation_metadata: {
            model: 'claude-sonnet-4-20250514',
            generated_at: new Date().toISOString(),
            word_count: wordCount,
            primary_keyword: primaryKeyword,
            secondary_keyword: secondaryKeyword
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', blogId)

      if (updateError) throw updateError

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          blogId,
          wordCount
        })
      }
    }

    // ========================================================================
    // Action: Generate batch of blogs
    // ========================================================================
    if (action === 'generate_batch') {
      // Get trending keywords or use random topics
      const { data: settings } = await supabaseAdmin
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'dataforseo_settings')
        .single()

      const industries = settings?.setting_value?.industries || ['AI marketing', 'SEO', 'digital marketing']
      const results = []

      for (let i = 0; i < count; i++) {
        try {
          // Generate random keyword from industries
          const industry = industries[Math.floor(Math.random() * industries.length)]
          const baseKeywords = [
            `${industry} strategies`,
            `${industry} tools`,
            `${industry} trends`,
            `${industry} best practices`,
            `${industry} automation`,
            `how to improve ${industry}`,
            `${industry} for small business`
          ]

          const primaryKeyword = baseKeywords[Math.floor(Math.random() * baseKeywords.length)]
          const title = generateTitleFromKeyword(primaryKeyword)
          const slug = generateSlug(title)

          // Check if slug already exists
          const { data: existing } = await supabaseAdmin
            .from('posts')
            .select('id')
            .eq('slug', slug)
            .single()

          if (existing) {
            console.log(`Slug already exists: ${slug}, skipping...`)
            continue
          }

          // Generate content
          const content = await generateBlogArticle({
            title,
            primaryKeyword,
            secondaryKeyword: primaryKeyword
          })

          const wordCount = content.split(/\s+/).length
          const readTime = Math.ceil(wordCount / 200)
          const excerpt = content.substring(0, 200).replace(/<[^>]*>/g, '') + '...'

          // Create blog post
          const { data: newPost, error: createError } = await supabaseAdmin
            .from('posts')
            .insert({
              title,
              slug,
              content,
              excerpt,
              category: industry,
              approval_status: 'pending_review',
              is_published: false,
              auto_generated: true,
              read_time_minutes: readTime,
              seo_title: title,
              seo_description: excerpt,
              generation_metadata: {
                model: 'claude-sonnet-4-20250514',
                generated_at: new Date().toISOString(),
                word_count: wordCount,
                primary_keyword: primaryKeyword
              }
            })
            .select()
            .single()

          if (createError) throw createError

          // Add keyword mapping
          await supabaseAdmin
            .from('keyword_blog_mapping')
            .insert({
              post_id: newPost.id,
              keyword: primaryKeyword,
              keyword_type: 'primary',
              fetched_at: new Date().toISOString()
            })

          results.push({
            id: newPost.id,
            title,
            wordCount
          })

          // Rate limiting: 2 second delay between generations
          if (i < count - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000))
          }

        } catch (error) {
          console.error(`Failed to generate blog ${i + 1}:`, error)
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          generated: results.length,
          blogs: results
        })
      }
    }

    // ========================================================================
    // Action: Create blogs from keywords (DataForSEO import)
    // ========================================================================
    if (action === 'create_from_keywords') {
      const results = []

      for (const kw of keywords) {
        try {
          const title = generateTitleFromKeyword(kw.keyword)
          const slug = generateSlug(title)

          // Check if slug exists
          const { data: existing } = await supabaseAdmin
            .from('posts')
            .select('id')
            .eq('slug', slug)
            .single()

          if (existing) {
            console.log(`Slug already exists: ${slug}, skipping...`)
            continue
          }

          // Generate content
          const content = await generateBlogArticle({
            title,
            primaryKeyword: kw.keyword,
            secondaryKeyword: kw.related_keywords?.[0] || kw.keyword
          })

          const wordCount = content.split(/\s+/).length
          const readTime = Math.ceil(wordCount / 200)
          const excerpt = content.substring(0, 200).replace(/<[^>]*>/g, '') + '...'

          // Create blog
          const { data: newPost, error: createError } = await supabaseAdmin
            .from('posts')
            .insert({
              title,
              slug,
              content,
              excerpt,
              category: kw.industry || 'SEO',
              approval_status: 'pending_review',
              is_published: false,
              auto_generated: true,
              read_time_minutes: readTime,
              seo_title: title,
              seo_description: excerpt,
              keyword_data: kw,
              generation_metadata: {
                model: 'claude-sonnet-4-20250514',
                generated_at: new Date().toISOString(),
                word_count: wordCount,
                dataforseo_keyword: kw.keyword,
                search_volume: kw.search_volume,
                keyword_difficulty: kw.keyword_difficulty
              }
            })
            .select()
            .single()

          if (createError) throw createError

          // Add keyword mapping
          await supabaseAdmin
            .from('keyword_blog_mapping')
            .insert([
              {
                post_id: newPost.id,
                keyword: kw.keyword,
                keyword_type: 'primary',
                search_volume: kw.search_volume,
                keyword_difficulty: kw.keyword_difficulty,
                cpc: kw.cpc,
                competition: kw.competition,
                dataforseo_task_id: kw.task_id,
                fetched_at: new Date().toISOString()
              }
            ])

          results.push({
            id: newPost.id,
            title,
            keyword: kw.keyword
          })

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000))

        } catch (error) {
          console.error(`Failed to create blog for keyword "${kw.keyword}":`, error)
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          created: results.length,
          blogs: results
        })
      }
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' })
    }

  } catch (error) {
    console.error('Blog generation error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    }
  }
}
