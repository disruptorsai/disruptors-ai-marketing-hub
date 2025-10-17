/**
 * SEO Landing Page Generator
 * Generates AI-enhanced landing pages with Business Brain context
 *
 * Features:
 * - Template-based structure with AI enhancement
 * - Business Brain context injection
 * - Uniqueness scoring (85%+ required)
 * - Keyword density validation (1-3%)
 * - SEO meta generation
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY
})

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

export const handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const {
      keyword,
      keywordId,
      templateId,
      templateContent,
      variables,
      businessBrainId,
      contentType = 'hybrid', // 'template', 'ai', 'hybrid'
      minUniqueness = 85
    } = JSON.parse(event.body || '{}')

    // Validation
    if (!keyword || !templateContent) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: keyword, templateContent' })
      }
    }

    console.log(`Generating landing page for keyword: ${keyword}`)

    // Step 1: Fetch Business Brain context if provided
    let brainContext = ''
    let businessName = 'our company'

    if (businessBrainId) {
      const { data: brain } = await supabase
        .from('business_brains')
        .select('*')
        .eq('id', businessBrainId)
        .single()

      if (brain) {
        businessName = brain.business_name || businessName
        brainContext = `
BUSINESS CONTEXT:
- Business Name: ${brain.business_name}
- Industry: ${brain.industry || 'Not specified'}
- Target Audience: ${brain.target_audience || 'General'}
- Brand Voice: ${brain.brand_voice || 'Professional and informative'}
- Key Services: ${brain.services_offered ? JSON.parse(brain.services_offered).join(', ') : 'Various services'}
- Unique Value Proposition: ${brain.unique_value_proposition || 'Quality and expertise'}

${brain.about_business ? `ABOUT THE BUSINESS:\n${brain.about_business}\n` : ''}
${brain.core_values ? `CORE VALUES:\n${brain.core_values}\n` : ''}
`
      }
    }

    // Step 2: Generate AI-enhanced content
    let generatedContent = ''

    if (contentType === 'ai' || contentType === 'hybrid') {
      const prompt = `You are an expert SEO content writer creating a landing page.

TARGET KEYWORD: ${keyword}
${brainContext}

TEMPLATE STRUCTURE (use as outline):
${templateContent}

VARIABLES PROVIDED:
${Object.entries(variables || {}).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

TASK: Generate a complete, SEO-optimized landing page with the following requirements:

1. **Title (H1)**: Include the target keyword naturally
2. **Introduction (150-200 words)**: Hook the reader, explain the value
3. **Main Content Sections**:
   - Use H2 and H3 headings with keyword variations
   - Include bullet points and lists for readability
   - Provide actionable insights and specific details
   - Natural keyword usage (1-3% density)
4. **Call-to-Action**: Clear, compelling CTA
5. **FAQ Section**: 3-5 common questions related to the keyword
6. **Conclusion**: Summarize key points and reinforce CTA

STYLE GUIDELINES:
- Professional, authoritative tone
- Use the Business Brain context to personalize content
- Write for humans first, search engines second
- Include specific examples and data points
- Avoid generic fluff - provide real value
- Target 1500-2000 words
- Use short paragraphs (2-3 sentences max)
- Include transition words for flow

UNIQUENESS REQUIREMENT: Content must be 85%+ unique. Do NOT use generic templates or filler content.

Generate the complete landing page content in markdown format. Use proper heading hierarchy (# for H1, ## for H2, ### for H3).`

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      generatedContent = response.content[0].text
    } else {
      // Template-only mode: just parse variables
      generatedContent = templateContent
    }

    // Step 3: Parse template variables in AI content (if hybrid mode)
    if (contentType === 'hybrid' && variables) {
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
        generatedContent = generatedContent.replace(regex, value)
      })
    }

    // Step 4: Calculate uniqueness score (simplified - compare against existing pages)
    const { data: existingPages } = await supabase
      .from('posts')
      .select('content')
      .eq('is_landing_page', true)
      .limit(50)

    let uniquenessScore = 100 // Default high score if no existing pages

    if (existingPages && existingPages.length > 0) {
      // Simple uniqueness check: character n-gram comparison
      uniquenessScore = calculateUniquenessScore(generatedContent, existingPages)
    }

    // Step 5: Validate uniqueness threshold
    if (uniquenessScore < minUniqueness) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: `Content uniqueness score (${uniquenessScore}%) is below minimum threshold (${minUniqueness}%)`,
          uniquenessScore,
          suggestion: 'Try regenerating with different variables or more specific instructions'
        })
      }
    }

    // Step 6: Calculate keyword density
    const keywordDensity = calculateKeywordDensity(generatedContent, keyword)

    if (keywordDensity.density > 3) {
      console.warn(`Keyword density too high: ${keywordDensity.density}%`)
    }

    // Step 7: Generate metadata
    const title = generateTitle(keyword, variables, businessName)
    const slug = generateSlug(keyword, variables)
    const metaDescription = generateMetaDescription(keyword, variables, businessName)

    // Step 8: Calculate reading metrics
    const wordCount = generatedContent.split(/\s+/).length
    const readingTimeMinutes = Math.ceil(wordCount / 200) // Average reading speed

    // Step 9: Return generated page data
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        content: generatedContent,
        metadata: {
          title,
          slug,
          metaDescription,
          keyword,
          keywordId,
          templateId,
          variables,
          businessBrainId
        },
        metrics: {
          wordCount,
          readingTimeMinutes,
          uniquenessScore,
          keywordDensity: keywordDensity.density,
          keywordCount: keywordDensity.count,
          keywordOptimal: keywordDensity.optimal
        },
        validation: {
          uniquenessPass: uniquenessScore >= minUniqueness,
          keywordDensityPass: keywordDensity.optimal,
          warnings: [
            uniquenessScore < 90 ? `Uniqueness score is ${uniquenessScore}% (target: 90%+)` : null,
            !keywordDensity.optimal ? `Keyword density is ${keywordDensity.density}% (optimal: 1-3%)` : null
          ].filter(Boolean)
        }
      })
    }

  } catch (error) {
    console.error('Landing page generation error:', error)

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate landing page',
        details: error.message
      })
    }
  }
}

/**
 * Calculate uniqueness score by comparing against existing content
 * Uses character trigrams for similarity detection
 */
function calculateUniquenessScore(content, existingPages) {
  const trigrams = extractTrigrams(content)
  let maxSimilarity = 0

  existingPages.forEach(page => {
    const existingTrigrams = extractTrigrams(page.content || '')
    const similarity = calculateCosineSimilarity(trigrams, existingTrigrams)
    maxSimilarity = Math.max(maxSimilarity, similarity)
  })

  // Uniqueness is inverse of similarity
  const uniqueness = (1 - maxSimilarity) * 100
  return Math.round(uniqueness)
}

/**
 * Extract character trigrams from text
 */
function extractTrigrams(text) {
  const normalized = text.toLowerCase().replace(/\s+/g, '')
  const trigrams = new Map()

  for (let i = 0; i < normalized.length - 2; i++) {
    const trigram = normalized.substring(i, i + 3)
    trigrams.set(trigram, (trigrams.get(trigram) || 0) + 1)
  }

  return trigrams
}

/**
 * Calculate cosine similarity between two trigram maps
 */
function calculateCosineSimilarity(trigramsA, trigramsB) {
  const allTrigrams = new Set([...trigramsA.keys(), ...trigramsB.keys()])

  let dotProduct = 0
  let magnitudeA = 0
  let magnitudeB = 0

  allTrigrams.forEach(trigram => {
    const countA = trigramsA.get(trigram) || 0
    const countB = trigramsB.get(trigram) || 0

    dotProduct += countA * countB
    magnitudeA += countA * countA
    magnitudeB += countB * countB
  })

  if (magnitudeA === 0 || magnitudeB === 0) return 0

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
}

/**
 * Calculate keyword density
 */
function calculateKeywordDensity(content, keyword) {
  const normalizedContent = content.toLowerCase()
  const normalizedKeyword = keyword.toLowerCase()

  const keywordRegex = new RegExp(`\\b${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
  const matches = content.match(keywordRegex) || []
  const count = matches.length

  const words = content.match(/\b\w+\b/g) || []
  const wordCount = words.length

  const density = wordCount > 0 ? (count / wordCount) * 100 : 0

  return {
    density: Math.round(density * 100) / 100,
    count,
    wordCount,
    optimal: density >= 1 && density <= 3
  }
}

/**
 * Generate title with keyword
 */
function generateTitle(keyword, variables = {}, businessName = '') {
  const { location, service } = variables
  const year = new Date().getFullYear()

  if (location && service) {
    return `${keyword} in ${location} | ${service} | ${businessName}`
  }

  if (location) {
    return `${keyword} in ${location} | Expert Guide ${year}`
  }

  const capitalized = keyword
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return `${capitalized} | ${businessName} ${year}`
}

/**
 * Generate URL slug
 */
function generateSlug(keyword, variables = {}) {
  const { location } = variables

  let slug = keyword
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  if (location) {
    const locationSlug = location
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    slug = `${slug}-${locationSlug}`
  }

  return slug
}

/**
 * Generate meta description
 */
function generateMetaDescription(keyword, variables = {}, businessName = '') {
  const { location, service } = variables
  const year = new Date().getFullYear()

  let description = ''

  if (location && service) {
    description = `Looking for ${keyword} in ${location}? ${businessName} provides expert ${service}. Get started today with our proven solutions.`
  } else if (location) {
    description = `Complete guide to ${keyword} in ${location}. Expert insights and proven strategies from ${businessName}. Updated ${year}.`
  } else {
    description = `${keyword} - Comprehensive guide with expert tips and best practices. Learn from ${businessName} in ${year}.`
  }

  if (description.length > 160) {
    description = description.substring(0, 157) + '...'
  }

  return description
}
