/**
 * Netlify Function: Module AI Content Writer
 *
 * Module-based AI content generation endpoint with:
 * - JWT authentication (optional for public access)
 * - Audience-based access control (internal/client/public)
 * - Business Brain context injection
 * - Telemetry tracking in module_runs table
 * - Quota enforcement
 * - Claude Sonnet 4.5 for content generation
 *
 * POST /.netlify/functions/module-ai-content-writer
 * Body: {
 *   topic: string,
 *   tone?: string (default: 'professional'),
 *   length?: string ('short' | 'medium' | 'long', default: 'medium'),
 *   content_type?: string (default: 'blog_post')
 * }
 * Headers: {
 *   Authorization?: "Bearer <jwt_token>"
 * }
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY;

// Create Supabase admin client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create Anthropic client
const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY
});

/**
 * Extract user from JWT token
 *
 * @param {string} authHeader - Authorization header value
 * @returns {Promise<Object|null>} User object or null if not authenticated
 */
async function getUserFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.warn('[module-ai-content-writer] Invalid token:', error?.message);
      return null;
    }

    return user;
  } catch (error) {
    console.error('[module-ai-content-writer] Error verifying token:', error);
    return null;
  }
}

/**
 * Determine audience level based on authentication
 *
 * @param {Object|null} user - User object from JWT
 * @returns {string} Audience level (internal/client/public)
 */
function determineAudience(user) {
  if (!user) {
    return 'public';
  }

  // Check if user is internal (admin)
  const adminEmails = [
    'will@disruptorsmedia.com',
    'admin@disruptorsmedia.com'
  ];

  if (adminEmails.includes(user.email?.toLowerCase())) {
    return 'internal';
  }

  return 'client';
}

/**
 * Load user's Business Brain
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Business Brain object or null
 */
async function loadUserBrain(userId) {
  try {
    const { data: brain, error } = await supabaseAdmin
      .from('business_brains')
      .select('*')
      .eq('created_by', userId)
      .single();

    if (error || !brain) {
      console.warn('[module-ai-content-writer] No brain found for user:', userId);
      return null;
    }

    return brain;
  } catch (error) {
    console.error('[module-ai-content-writer] Error loading brain:', error);
    return null;
  }
}

/**
 * Check module access and quotas
 *
 * @param {string} moduleId - Module ID
 * @param {string|null} userId - User ID (null for public)
 * @param {string} audience - Audience level
 * @returns {Promise<Object>} Access check result
 */
async function checkModuleAccess(moduleId, userId, audience) {
  // Internal users have unlimited access
  if (audience === 'internal') {
    return {
      allowed: true,
      daily_limit: null,
      monthly_limit: null,
      daily_used: 0,
      monthly_used: 0,
      config: {}
    };
  }

  // Public users: Use default module limits (no database record required)
  if (audience === 'public' || !userId) {
    // For public, use reduced limits (3 per day)
    return {
      allowed: true,
      daily_limit: 3,
      monthly_limit: null,
      daily_used: 0,
      monthly_used: 0,
      config: {},
      reason: 'Public access with default quotas'
    };
  }

  // Client users: Check module_access table
  const { data: access, error } = await supabaseAdmin
    .from('module_access')
    .select('*')
    .eq('module_id', moduleId)
    .eq('user_id', userId)
    .eq('audience', audience)
    .single();

  if (error && error.code !== 'PGRST116') {
    // Error other than "not found"
    console.error('[module-ai-content-writer] Error checking access:', error);
    return {
      allowed: false,
      reason: 'Database error checking access'
    };
  }

  // If no access record exists, create one with module defaults
  if (!access) {
    const { data: module } = await supabaseAdmin
      .from('modules')
      .select('default_daily_limit, default_monthly_limit')
      .eq('id', moduleId)
      .single();

    const now = new Date();
    const tomorrow = new Date(now.setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const newAccess = {
      module_id: moduleId,
      user_id: userId,
      enabled: true,
      audience: audience,
      daily_limit: module?.default_daily_limit || 10,
      monthly_limit: module?.default_monthly_limit || 100,
      daily_used: 0,
      monthly_used: 0,
      lifetime_used: 0,
      config: {},
      preferences: {},
      daily_reset_at: tomorrow.toISOString(),
      monthly_reset_at: nextMonth.toISOString()
    };

    await supabaseAdmin.from('module_access').insert(newAccess);

    return {
      allowed: true,
      daily_limit: newAccess.daily_limit,
      monthly_limit: newAccess.monthly_limit,
      daily_used: 0,
      monthly_used: 0,
      config: {}
    };
  }

  // Check if access is enabled
  if (!access.enabled) {
    return {
      allowed: false,
      reason: 'Module access is disabled for this user'
    };
  }

  // Check daily quota
  if (access.daily_limit && access.daily_used >= access.daily_limit) {
    return {
      allowed: false,
      reason: `Daily quota exceeded (${access.daily_used}/${access.daily_limit})`,
      quota_reset_at: access.daily_reset_at
    };
  }

  // Check monthly quota
  if (access.monthly_limit && access.monthly_used >= access.monthly_limit) {
    return {
      allowed: false,
      reason: `Monthly quota exceeded (${access.monthly_used}/${access.monthly_limit})`,
      quota_reset_at: access.monthly_reset_at
    };
  }

  return {
    allowed: true,
    access_id: access.id,
    daily_limit: access.daily_limit,
    monthly_limit: access.monthly_limit,
    daily_used: access.daily_used,
    monthly_used: access.monthly_used,
    config: access.config || {}
  };
}

/**
 * Track module execution in telemetry
 *
 * @param {Object} runData - Module run data
 * @returns {Promise<void>}
 */
async function trackModuleRun(runData) {
  try {
    const inputHash = crypto
      .createHash('md5')
      .update(JSON.stringify(runData.input_data))
      .digest('hex');

    await supabaseAdmin.from('module_runs').insert({
      module_id: runData.module_id,
      user_id: runData.user_id,
      brain_id: runData.brain_id,
      audience: runData.audience,
      input_data: runData.input_data,
      output_data: runData.output_data,
      input_hash: inputHash,
      duration_ms: runData.duration_ms,
      tokens_used: runData.tokens_used || null,
      cost_usd: runData.cost_usd || 0.10,
      status: runData.status,
      error_message: runData.error_message || null,
      error_stack: runData.error_stack || null,
      ip_address: runData.ip_address,
      user_agent: runData.user_agent,
      session_id: runData.session_id,
      run_context: {
        source: runData.audience === 'internal' ? 'admin' : runData.audience === 'client' ? 'app' : 'public',
        model: 'claude-sonnet-4.5-20250929',
        content_type: runData.input_data?.content_type || 'blog_post'
      },
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('[module-ai-content-writer] Error tracking module run:', error);
    // Non-blocking - don't fail execution
  }
}

/**
 * Increment module usage counters
 *
 * @param {string} moduleId - Module ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function incrementModuleUsage(moduleId, userId) {
  try {
    // Increment daily_used, monthly_used, and lifetime_used
    const { data: access } = await supabaseAdmin
      .from('module_access')
      .select('daily_used, monthly_used, lifetime_used')
      .eq('module_id', moduleId)
      .eq('user_id', userId)
      .single();

    if (access) {
      await supabaseAdmin
        .from('module_access')
        .update({
          daily_used: (access.daily_used || 0) + 1,
          monthly_used: (access.monthly_used || 0) + 1,
          lifetime_used: (access.lifetime_used || 0) + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('module_id', moduleId)
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error('[module-ai-content-writer] Error incrementing usage:', error);
    // Non-blocking
  }
}

/**
 * Build system prompt with Business Brain context
 *
 * @param {Object} brain - Business Brain object
 * @param {string} audience - Audience level
 * @param {string} contentType - Type of content being generated
 * @returns {string} System prompt
 */
function buildSystemPrompt(brain, audience, contentType = 'blog') {
  // Blog-specific prompt with comprehensive standards (aligned with BLOG_CONTENT_STANDARDS.md)
  if (contentType === 'blog') {
    let prompt = `You are a top-performing SEO strategist and educator. Write epic, original blog posts that are practical, easy to follow, and consistently optimized for search and generative engines.

Core Output Requirements:
- Write at least 1,200 words in narrative, skimmable, conversational style with H1/H2/H3 formatting
- Output complete Markdown ONLY - no code fences, no backticks, no meta commentary. Start directly with the H1 title
- Begin with one strong hook in the opening paragraph (story, problem, myth vs. reality, or quick scenario)
- Paragraph Structure: Mostly 2-4 sentences with occasional shorter lines for rhythm
- Tone: Bold, attention-grabbing, no fluff, occasionally contrarian
- Audience: non-experts requiring step-by-step explanations
- Use plain English and define jargon briefly on first use

Hard Style Rules (must follow strictly):
- Do not use em dashes (use commas or parentheses instead)
- Use no more than two lists total (bulleted or numbered, each 3-7 items)
- Do not use first-person language unless specified
- Do not use typical blog headings like "Introduction" or "Conclusion" - write natural, descriptive headings
- Output Markdown only - no code fences (\`\`\`), no backticks around the article, no preface text
- Use bold/italics sparingly to emphasize key ideas - avoid over-formatting

FAQ Requirements:
- Include exactly 5 FAQs using ### heading level for each question
- Questions based on real user search intent
- Answers in 2-3 concise sentences
- End with a short CTA line (one sentence) after the FAQ section`;

    // Add Business Brain context for authenticated users
    if (brain) {
      prompt += `\n\n## Business Context`;
      if (brain.business_name) prompt += `\nBusiness: ${brain.business_name}`;
      if (brain.industry) prompt += `\nIndustry: ${brain.industry}`;
      if (brain.brand_voice) prompt += `\nBrand Voice: ${brain.brand_voice}`;
      if (brain.tone_attributes && Array.isArray(brain.tone_attributes)) {
        prompt += `\nTone Attributes: ${brain.tone_attributes.join(', ')}`;
      }
      if (brain.core_offerings && Array.isArray(brain.core_offerings)) {
        prompt += `\nCore Offerings: ${brain.core_offerings.join(', ')}`;
      }
    }

    // Public users get reduced length
    if (audience === 'public') {
      prompt += `\n\n## Length Constraints\nFor public demo users, content must be capped at 300 words maximum (demonstration version).`;
    }

    return prompt;
  }

  // Default prompt for other content types (social, email, etc.)
  let prompt = `You are an expert AI content writer for Disruptors AI, specializing in creating compelling, SEO-optimized content.

Your writing style is:
- Bold, direct, and no-fluff
- Action-oriented with clear takeaways
- Optimized for readability (short paragraphs, bullet points)
- Naturally incorporates keywords without stuffing
- Conversational yet professional`;

  // Add Business Brain context for authenticated users
  if (brain) {
    prompt += `\n\n## Business Context\n`;

    if (brain.business_name) {
      prompt += `\nBusiness: ${brain.business_name}`;
    }

    if (brain.industry) {
      prompt += `\nIndustry: ${brain.industry}`;
    }

    if (brain.brand_voice) {
      prompt += `\nBrand Voice: ${brain.brand_voice}`;
    }

    if (brain.tone_attributes && Array.isArray(brain.tone_attributes)) {
      prompt += `\nTone Attributes: ${brain.tone_attributes.join(', ')}`;
    }

    if (brain.core_offerings && Array.isArray(brain.core_offerings)) {
      prompt += `\nCore Offerings: ${brain.core_offerings.join(', ')}`;
    }

    if (brain.unique_value_propositions && Array.isArray(brain.unique_value_propositions)) {
      prompt += `\nValue Propositions: ${brain.unique_value_propositions.join(', ')}`;
    }

    if (brain.ideal_customer_profile) {
      prompt += `\nIdeal Customer: ${brain.ideal_customer_profile}`;
    }
  }

  // Add length constraints for public users
  if (audience === 'public') {
    prompt += `\n\n## Length Constraints\nFor public demo users, content must be capped at 300 words maximum, regardless of requested length.`;
  }

  return prompt;
}

/**
 * Generate AI content with Claude Sonnet 4.5
 *
 * @param {Object} input - Content generation parameters
 * @param {Object} brain - Business Brain context
 * @param {string} audience - Audience level
 * @param {Object} config - User configuration
 * @returns {Promise<Object>} Generated content
 */
async function generateContent(input, brain, audience, config) {
  const contentType = input.content_type || 'blog';
  const systemPrompt = buildSystemPrompt(brain, audience, contentType);

  // Determine word count based on length and audience
  let targetWords;
  if (audience === 'public') {
    targetWords = 300; // Fixed cap for public
  } else {
    switch (input.length) {
      case 'short':
        targetWords = contentType === 'blog' ? 1200 : 350; // Blog minimum is always 1200+
        break;
      case 'long':
        targetWords = contentType === 'blog' ? 2000 : 1200;
        break;
      case 'medium':
      default:
        targetWords = contentType === 'blog' ? 1500 : 650;
        break;
    }
  }

  // Blog-specific user prompt with comprehensive requirements
  let userPrompt;
  if (contentType === 'blog') {
    userPrompt = `Write a complete blog article about: ${input.topic}

${input.primary_keyword ? `Primary Keyword: ${input.primary_keyword}` : ''}
${input.secondary_keywords && input.secondary_keywords.length > 0 ? `Secondary Keywords: ${input.secondary_keywords.join(', ')}` : ''}
Tone: ${input.tone || 'professional'}
Target Length: ${targetWords} words minimum

Requirements (must follow):
- H1 title that naturally includes the primary keyword
- Strong opening hook (story, problem, myth-busting, or data snapshot)
- Primary keyword appears in first 150 words
- Natural heading hierarchy (H2/H3 for sections)
- 1-2 internal links with descriptive anchor text
- 1-2 external links to authoritative sources
- Exactly 5 FAQ questions using ### heading level
- Short one-sentence CTA after FAQ section
- No em dashes (use commas or parentheses)
- Maximum 2 lists total (3-7 items each)
- Paragraphs mostly 2-4 sentences
- Output pure Markdown (no code fences, no backticks)

${audience === 'public' ? 'IMPORTANT: Public demo limited to 300 words.' : ''}`;
  } else {
    // Default prompt for other content types
    userPrompt = `Write a ${contentType || 'piece of content'} about: ${input.topic}

Tone: ${input.tone || 'professional'}
Target Length: ${targetWords} words

Requirements:
- Create an engaging headline
- Write compelling introduction
- Use clear section headers
- Include actionable takeaways
- Natural keyword usage
- Strong conclusion with CTA

${audience === 'public' ? 'IMPORTANT: Keep under 300 words total.' : ''}`;
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4.5-20250929',
      max_tokens: audience === 'public' ? 1500 : 4000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    const content = message.content[0].text;
    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

    // Extract headline (first line or H1)
    const headlineMatch = content.match(/^#\s+(.+)$/m) || content.match(/^(.+)$/m);
    const headline = headlineMatch ? headlineMatch[1].trim() : 'Untitled';

    // Word count
    const wordCount = content.split(/\s+/).length;

    return {
      headline: headline,
      content: content,
      word_count: wordCount,
      tokens_used: tokensUsed,
      model: 'claude-sonnet-4.5-20250929',
      generated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('[module-ai-content-writer] Claude API error:', error);
    throw new Error(`Content generation failed: ${error.message}`);
  }
}

/**
 * Main handler
 */
export const handler = async (event, context) => {
  const startTime = Date.now();

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: {
          message: 'Method not allowed',
          code: 'METHOD_NOT_ALLOWED'
        }
      })
    };
  }

  let user = null;
  let brain = null;
  let moduleId = null;
  let input = null;

  try {
    // Parse request body
    input = JSON.parse(event.body);

    // Validate required fields
    if (!input.topic) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: {
            message: 'topic is required',
            code: 'INVALID_INPUT'
          }
        })
      };
    }

    // Extract user from JWT token (if present)
    const authHeader = event.headers.authorization || event.headers.Authorization;
    user = await getUserFromToken(authHeader);

    // Determine audience level
    const audience = determineAudience(user);

    // Load module to get ID
    const { data: module } = await supabaseAdmin
      .from('modules')
      .select('id')
      .eq('slug', 'ai-content-writer')
      .single();

    if (!module) {
      throw new Error('Module not found in database');
    }

    moduleId = module.id;

    // Check access and quotas
    const accessCheck = await checkModuleAccess(moduleId, user?.id || null, audience);

    if (!accessCheck.allowed) {
      return {
        statusCode: accessCheck.reason?.includes('quota') ? 429 : 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: {
            message: accessCheck.reason || 'Access denied',
            code: accessCheck.reason?.includes('quota') ? 'QUOTA_EXCEEDED' : 'ACCESS_DENIED'
          },
          metadata: {
            quota_reset_at: accessCheck.quota_reset_at
          }
        })
      };
    }

    // Load Business Brain (if user is authenticated)
    if (user) {
      brain = await loadUserBrain(user.id);
    }

    // Generate content
    const result = await generateContent(
      input,
      brain,
      audience,
      accessCheck.config || {}
    );

    const duration = Date.now() - startTime;

    // Calculate cost (approx $0.003 per 1K tokens for Sonnet 4.5)
    const cost = (result.tokens_used / 1000) * 0.003;

    // Track telemetry
    await trackModuleRun({
      module_id: moduleId,
      user_id: user?.id || null,
      brain_id: brain?.id || null,
      audience: audience,
      input_data: input,
      output_data: result,
      duration_ms: duration,
      tokens_used: result.tokens_used,
      status: 'success',
      cost_usd: cost,
      ip_address: event.headers['x-forwarded-for'] || event.headers['x-real-ip'],
      user_agent: event.headers['user-agent'],
      session_id: event.headers['x-session-id'] || null
    });

    // Increment usage counters (only for authenticated users)
    if (user && accessCheck.access_id) {
      await incrementModuleUsage(moduleId, user.id);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({
        success: true,
        data: result,
        metadata: {
          duration_ms: duration,
          audience: audience,
          quota_remaining: accessCheck.daily_limit
            ? accessCheck.daily_limit - (accessCheck.daily_used + 1)
            : null,
          brain_applied: !!brain
        }
      })
    };

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('[module-ai-content-writer] Error:', error);

    // Track error in telemetry
    if (moduleId) {
      await trackModuleRun({
        module_id: moduleId,
        user_id: user?.id || null,
        brain_id: brain?.id || null,
        audience: determineAudience(user),
        input_data: input || {},
        duration_ms: duration,
        status: 'fail',
        error_message: error.message,
        error_stack: error.stack,
        ip_address: event.headers['x-forwarded-for'] || event.headers['x-real-ip'],
        user_agent: event.headers['user-agent']
      });
    }

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'EXECUTION_ERROR'
        },
        metadata: {
          duration_ms: duration
        }
      })
    };
  }
};
