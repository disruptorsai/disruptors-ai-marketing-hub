/**
 * Netlify Function: AI Wizard Auto-Populate
 *
 * Intelligent form field population using OpenAI GPT-4o-mini.
 * Integrates with Business Brain for brand-consistent content generation.
 *
 * POST /.netlify/functions/ai-wizard-populate
 * Body: {
 *   moduleType: string ('lead_magnet' | 'blog_post' | 'content_page' | 'media' | 'team_bio'),
 *   currentFields: object (existing form data for context),
 *   businessBrainId: string (UUID),
 *   targetField?: string (optional - generate only specific field)
 * }
 */

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY

// Validate environment
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  throw new Error('Missing required environment variables')
}

// Create clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
})

/**
 * Generate module-specific prompt
 */
function generatePrompt(moduleType, currentFields, brain) {
  const prompts = {
    lead_magnet: () => {
      const topic = currentFields.topic || currentFields.title || 'marketing resource'
      return `You are a marketing expert creating a lead magnet resource for ${brain.company_name || 'a business'}.

**Brand Context:**
- Industry: ${brain.industry || 'general business'}
- Tone: ${brain.brand_voice || 'professional and approachable'}
- Target Audience: ${brain.target_audience || 'business owners'}

**Current Input:**
Topic: ${topic}
Resource Type: ${currentFields.file_type || 'PDF guide'}

**Required JSON Structure:**
{
  "title": "Catchy, benefit-focused title (max 60 characters)",
  "subtitle": "One-sentence value proposition",
  "description": "2-3 persuasive paragraphs explaining the resource value",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "category": "automation|content|seo|analytics|strategy",
  "whats_inside": ["Deliverable 1", "Deliverable 2", "Deliverable 3", "Deliverable 4", "Deliverable 5"],
  "seo_title": "SEO-optimized title (50-60 characters)",
  "seo_description": "Meta description (150-160 characters)",
  "seo_keywords": ["keyword1", "keyword2", "keyword3"]
}

Make it actionable, benefit-driven, and aligned with the brand voice.
Return ONLY valid JSON.`
    },

    blog_post: () => {
      const topic = currentFields.topic || currentFields.headline || 'blog post'
      return `You are creating blog metadata for ${brain.company_name || 'a business'}.

**Brand Context:**
- Industry: ${brain.industry || 'general'}
- Tone: ${brain.brand_voice || 'professional'}

**Topic:** ${topic}

**Required JSON:**
{
  "headline": "SEO-optimized headline",
  "excerpt": "2-3 sentence summary",
  "meta_description": "150-160 character meta",
  "tags": ["tag1", "tag2", "tag3"],
  "primary_keyword": "main keyword",
  "secondary_keywords": ["keyword1", "keyword2"],
  "seo_title": "50-60 character title tag",
  "category": "news|tutorial|case-study|thought-leadership"
}

Return ONLY valid JSON.`
    },

    content_page: () => {
      const pageName = currentFields.page_name || 'page'
      return `Create page metadata for ${brain.company_name || 'a business'}.

**Page:** ${pageName}
**Industry:** ${brain.industry || 'general'}

**Required JSON:**
{
  "page_title": "Clear page title",
  "meta_description": "150-160 char meta",
  "og_title": "Social title (60 chars)",
  "og_description": "Social description (200 chars)",
  "heading_suggestions": ["H2 1", "H2 2", "H2 3"],
  "cta_text": "CTA button text"
}

Return ONLY valid JSON.`
    },
  }

  const generator = prompts[moduleType]
  if (!generator) {
    throw new Error(`Unsupported module type: ${moduleType}`)
  }

  return generator()
}

/**
 * Calculate cost estimate based on token usage
 */
function calculateCost(tokens, model = 'gpt-4o-mini') {
  const pricing = {
    'gpt-4o-mini': {
      input: 0.00000015,  // $0.15 per 1M input tokens
      output: 0.0000006,  // $0.60 per 1M output tokens
    },
    'gpt-4o': {
      input: 0.0000025,   // $2.50 per 1M input tokens
      output: 0.00001,    // $10.00 per 1M output tokens
    },
  }

  const rates = pricing[model] || pricing['gpt-4o-mini']

  // Estimate 70% input, 30% output
  const inputTokens = Math.floor(tokens * 0.7)
  const outputTokens = Math.floor(tokens * 0.3)

  return (inputTokens * rates.input) + (outputTokens * rates.output)
}

/**
 * Main handler
 */
export async function handler(event) {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    // Parse request body
    const { moduleType, currentFields, businessBrainId, targetField } = JSON.parse(event.body)

    // Validate required fields
    if (!moduleType || !businessBrainId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields: moduleType and businessBrainId',
        }),
      }
    }

    // Fetch Business Brain for context
    const { data: brain, error: brainError } = await supabase
      .from('business_brains')
      .select('*')
      .eq('id', businessBrainId)
      .single()

    if (brainError || !brain) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Business Brain not found. Please set up your Business Brain first.',
        }),
      }
    }

    // Generate prompt
    const prompt = generatePrompt(moduleType, currentFields || {}, brain)

    console.log('AI Wizard Request:', {
      moduleType,
      brainId: businessBrainId,
      targetField,
    })

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a marketing expert helping generate high-quality content for business admin panels. Always respond with valid JSON matching the requested structure.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    })

    // Parse response
    const generated = JSON.parse(response.choices[0].message.content)
    const tokensUsed = response.usage.total_tokens
    const costEstimate = calculateCost(tokensUsed)

    // If targetField specified, return only that field
    const fields = targetField && generated[targetField]
      ? { [targetField]: generated[targetField] }
      : generated

    // Log usage for analytics
    console.log('AI Wizard Success:', {
      moduleType,
      tokensUsed,
      costEstimate: `$${costEstimate.toFixed(4)}`,
      fieldsGenerated: Object.keys(fields).length,
    })

    // Optional: Log to database for cost tracking
    try {
      await supabase.from('ai_usage_logs').insert({
        module_type: moduleType,
        model_used: 'gpt-4o-mini',
        tokens_used: tokensUsed,
        cost_estimate: costEstimate,
        fields_generated: Object.keys(fields).length,
        created_at: new Date().toISOString(),
      })
    } catch (logError) {
      // Don't fail if logging fails
      console.error('Failed to log usage:', logError)
    }

    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        fields,
        tokensUsed,
        costEstimate: `$${costEstimate.toFixed(4)}`,
        model: 'gpt-4o-mini',
      }),
    }

  } catch (error) {
    console.error('AI Wizard Error:', error)

    // Handle specific OpenAI errors
    if (error.code === 'rate_limit_exceeded') {
      return {
        statusCode: 429,
        body: JSON.stringify({
          error: 'Rate limit exceeded. Please wait a moment and try again.',
        }),
      }
    }

    if (error.code === 'invalid_api_key') {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'OpenAI API configuration error. Please contact support.',
        }),
      }
    }

    // Generic error
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Failed to generate content',
      }),
    }
  }
}
