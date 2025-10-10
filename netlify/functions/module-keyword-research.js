/**
 * Netlify Function: Module Keyword Research
 *
 * Module-based keyword research endpoint with:
 * - JWT authentication (optional for public access)
 * - Audience-based access control (internal/client/public)
 * - Business Brain context injection
 * - Telemetry tracking in module_runs table
 * - Quota enforcement
 *
 * POST /.netlify/functions/module-keyword-research
 * Body: {
 *   seed_keyword: string,
 *   location?: string,
 *   language?: string,
 *   limit?: number
 * }
 * Headers: {
 *   Authorization?: "Bearer <jwt_token>"
 * }
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase admin client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
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
      console.warn('[module-keyword-research] Invalid token:', error?.message);
      return null;
    }

    return user;
  } catch (error) {
    console.error('[module-keyword-research] Error verifying token:', error);
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
  // Customize this logic based on your admin user detection
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
      console.warn('[module-keyword-research] No brain found for user:', userId);
      return null;
    }

    return brain;
  } catch (error) {
    console.error('[module-keyword-research] Error loading brain:', error);
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
    console.error('[module-keyword-research] Error checking access:', error);
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
      cost_usd: runData.cost_usd || 0.05,
      status: runData.status,
      error_message: runData.error_message || null,
      error_stack: runData.error_stack || null,
      ip_address: runData.ip_address,
      user_agent: runData.user_agent,
      session_id: runData.session_id,
      run_context: {
        source: runData.audience === 'internal' ? 'admin' : runData.audience === 'client' ? 'app' : 'public'
      },
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('[module-keyword-research] Error tracking module run:', error);
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
    console.error('[module-keyword-research] Error incrementing usage:', error);
    // Non-blocking
  }
}

/**
 * Execute keyword research via DataForSEO
 *
 * @param {Object} input - Keyword research parameters
 * @param {Object} brain - Business Brain context
 * @param {string} audience - Audience level
 * @param {Object} config - User configuration
 * @returns {Promise<Object>} Keyword research results
 */
async function executeKeywordResearch(input, brain, audience, config) {
  // Merge config defaults
  const mergedInput = {
    ...input,
    location: input.location || config?.default_location || '2840',
    language: input.language || config?.default_language || 'en',
    limit: input.limit || config?.results_limit || 50
  };

  // Limit results for public access
  if (audience === 'public') {
    mergedInput.limit = Math.min(mergedInput.limit, 10);
  }

  // Call DataForSEO function
  const dataforSeoUrl = process.env.URL
    ? `${process.env.URL}/.netlify/functions/dataforseo-keywords`
    : 'http://localhost:8888/.netlify/functions/dataforseo-keywords';

  const response = await fetch(dataforSeoUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      searchTerm: mergedInput.seed_keyword,
      location: mergedInput.location,
      language: mergedInput.language
    })
  });

  if (!response.ok) {
    throw new Error(`DataForSEO request failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Keyword research failed');
  }

  // Add Business Brain context
  const businessContext = {};
  if (brain) {
    businessContext.industry = brain.industry;
    businessContext.location = brain.primary_location;

    if (brain.core_offerings && Array.isArray(brain.core_offerings)) {
      businessContext.core_offerings = brain.core_offerings;
    }
  }

  // Filter by minimum search volume if configured
  let keywords = data.keywords || [];
  if (config?.min_search_volume > 0) {
    keywords = keywords.filter(kw => kw.search_volume >= config.min_search_volume);
  }

  // Limit number of results
  keywords = keywords.slice(0, mergedInput.limit);

  return {
    keywords: keywords,
    count: keywords.length,
    search_term: mergedInput.seed_keyword,
    location: mergedInput.location,
    business_context: businessContext
  };
}

/**
 * Main handler
 */
export const handler = async (event, context) => {
  const startTime = Date.now();

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
    if (!input.seed_keyword) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: {
            message: 'seed_keyword is required',
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
      .eq('slug', 'keyword-research')
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

    // Execute keyword research
    const result = await executeKeywordResearch(
      input,
      brain,
      audience,
      accessCheck.config || {}
    );

    const duration = Date.now() - startTime;

    // Track telemetry
    await trackModuleRun({
      module_id: moduleId,
      user_id: user?.id || null,
      brain_id: brain?.id || null,
      audience: audience,
      input_data: input,
      output_data: result,
      duration_ms: duration,
      status: 'success',
      cost_usd: 0.05,
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
            : null
        }
      })
    };

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('[module-keyword-research] Error:', error);

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
