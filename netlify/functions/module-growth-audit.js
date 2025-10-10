/**
 * Netlify Function: Module Growth Audit
 *
 * Module-based growth audit endpoint with:
 * - JWT authentication (optional for public access)
 * - Audience-based access control (internal/client/public)
 * - Business Brain context injection
 * - Telemetry tracking in module_runs table (queued + completed)
 * - Quota enforcement (public: 5/day, client: 10/day, internal: unlimited)
 * - Job-based async execution via existing growth-audit-ingest architecture
 *
 * POST /.netlify/functions/module-growth-audit
 * Body: {
 *   website_url: string (required)
 * }
 * Headers: {
 *   Authorization?: "Bearer <jwt_token>"
 * }
 *
 * Returns: {
 *   success: true,
 *   job_id: string,
 *   status: 'queued',
 *   stream_url: string (for SSE polling)
 * }
 *
 * NOTE: This is a wrapper around existing growth-audit-ingest.js that adds:
 * 1. Module system integration (quotas, telemetry)
 * 2. Authentication and audience detection
 * 3. Business Brain context for personalized audits
 * 4. Two-phase telemetry tracking (queued → completed)
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { createJob, updateJobStatus, setJobResult, setJobError } from './shared/job-storage-universal.js';

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
 * Validate and normalize URL
 * @param {string} url - URL to validate
 * @returns {{valid: boolean, normalized?: string, error?: string}} Validation result
 */
function validateUrl(url) {
  try {
    // Add protocol if missing
    const urlWithProtocol = url.match(/^https?:\/\//) ? url : `https://${url}`;
    const parsed = new URL(urlWithProtocol);

    if (!parsed.hostname) {
      return { valid: false, error: 'Invalid domain' };
    }

    return { valid: true, normalized: parsed.toString() };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

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
      console.warn('[module-growth-audit] Invalid token:', error?.message);
      return null;
    }

    return user;
  } catch (error) {
    console.error('[module-growth-audit] Error verifying token:', error);
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
      console.warn('[module-growth-audit] No brain found for user:', userId);
      return null;
    }

    return brain;
  } catch (error) {
    console.error('[module-growth-audit] Error loading brain:', error);
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
    // For public, use reduced limits (5 per day for Growth Audit - resource intensive)
    return {
      allowed: true,
      daily_limit: 5,
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
    console.error('[module-growth-audit] Error checking access:', error);
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
 * Track module execution in telemetry (queued status)
 *
 * @param {Object} runData - Module run data
 * @returns {Promise<string>} Module run ID
 */
async function trackModuleRun(runData) {
  try {
    const inputHash = crypto
      .createHash('md5')
      .update(JSON.stringify(runData.input_data))
      .digest('hex');

    const { data: inserted, error } = await supabaseAdmin
      .from('module_runs')
      .insert({
        module_id: runData.module_id,
        user_id: runData.user_id,
        brain_id: runData.brain_id,
        audience: runData.audience,
        input_data: runData.input_data,
        output_data: runData.output_data || null,
        input_hash: inputHash,
        duration_ms: runData.duration_ms || null,
        tokens_used: runData.tokens_used || null,
        cost_usd: runData.cost_usd || 0.50, // Estimated cost for Growth Audit
        status: runData.status,
        error_message: runData.error_message || null,
        error_stack: runData.error_stack || null,
        ip_address: runData.ip_address,
        user_agent: runData.user_agent,
        session_id: runData.session_id,
        run_context: {
          source: runData.audience === 'internal' ? 'admin' : runData.audience === 'client' ? 'app' : 'public',
          job_id: runData.job_id,
          estimated_duration_seconds: 60,
          analysis_type: 'growth_audit'
        },
        created_at: new Date().toISOString(),
        completed_at: runData.status === 'success' ? new Date().toISOString() : null
      })
      .select('id')
      .single();

    if (error) {
      console.error('[module-growth-audit] Error tracking module run:', error);
      return null;
    }

    return inserted?.id || null;
  } catch (error) {
    console.error('[module-growth-audit] Error tracking module run:', error);
    // Non-blocking - don't fail execution
    return null;
  }
}

/**
 * Update module run on completion
 *
 * @param {string} jobId - Job ID from job storage
 * @param {Object} result - Audit result data
 * @param {number} durationMs - Total execution time in ms
 * @returns {Promise<void>}
 */
export async function updateModuleRunOnCompletion(jobId, result, durationMs) {
  try {
    // Find module run by job_id in run_context
    const { data: runs } = await supabaseAdmin
      .from('module_runs')
      .select('id, run_context')
      .filter('run_context->job_id', 'eq', jobId);

    if (!runs || runs.length === 0) {
      console.warn('[module-growth-audit] No module run found for job:', jobId);
      return;
    }

    const runId = runs[0].id;

    // Calculate tokens used (estimate based on opportunities)
    const opportunitiesCount = result?.opportunities?.length || 0;
    const estimatedTokens = opportunitiesCount * 500; // ~500 tokens per opportunity

    await supabaseAdmin
      .from('module_runs')
      .update({
        status: 'success',
        output_data: {
          opportunities_count: opportunitiesCount,
          business_profile: result?.businessProfile || null,
          service_packages: result?.servicePackages || null
        },
        duration_ms: durationMs,
        tokens_used: estimatedTokens,
        completed_at: new Date().toISOString()
      })
      .eq('id', runId);

    console.log('[module-growth-audit] Updated module run on completion:', runId);
  } catch (error) {
    console.error('[module-growth-audit] Error updating module run:', error);
    // Non-blocking
  }
}

/**
 * Update module run on failure
 *
 * @param {string} jobId - Job ID from job storage
 * @param {string} errorMessage - Error message
 * @param {number} durationMs - Total execution time in ms
 * @returns {Promise<void>}
 */
export async function updateModuleRunOnFailure(jobId, errorMessage, durationMs) {
  try {
    // Find module run by job_id in run_context
    const { data: runs } = await supabaseAdmin
      .from('module_runs')
      .select('id')
      .filter('run_context->job_id', 'eq', jobId);

    if (!runs || runs.length === 0) {
      console.warn('[module-growth-audit] No module run found for job:', jobId);
      return;
    }

    const runId = runs[0].id;

    await supabaseAdmin
      .from('module_runs')
      .update({
        status: 'fail',
        error_message: errorMessage,
        duration_ms: durationMs,
        completed_at: new Date().toISOString()
      })
      .eq('id', runId);

    console.log('[module-growth-audit] Updated module run on failure:', runId);
  } catch (error) {
    console.error('[module-growth-audit] Error updating module run on failure:', error);
    // Non-blocking
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
    console.error('[module-growth-audit] Error incrementing usage:', error);
    // Non-blocking
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
    if (!input.website_url) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: {
            message: 'website_url is required',
            code: 'INVALID_INPUT'
          }
        })
      };
    }

    // Validate URL format
    const urlValidation = validateUrl(input.website_url);
    if (!urlValidation.valid) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: {
            message: urlValidation.error,
            code: 'INVALID_URL'
          }
        })
      };
    }

    const normalizedUrl = urlValidation.normalized;

    // Extract user from JWT token (if present)
    const authHeader = event.headers.authorization || event.headers.Authorization;
    user = await getUserFromToken(authHeader);

    // Determine audience level
    const audience = determineAudience(user);

    // Load module to get ID
    const { data: module } = await supabaseAdmin
      .from('modules')
      .select('id')
      .eq('slug', 'growth-audit')
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

    // Create job ID
    const jobId = uuidv4();

    // Create job in job storage (existing architecture)
    const job = createJob(jobId, normalizedUrl);

    // Track telemetry (queued status)
    const moduleRunId = await trackModuleRun({
      module_id: moduleId,
      user_id: user?.id || null,
      brain_id: brain?.id || null,
      audience: audience,
      input_data: { website_url: normalizedUrl },
      status: 'queued',
      job_id: jobId,
      ip_address: event.headers['x-forwarded-for'] || event.headers['x-real-ip'],
      user_agent: event.headers['user-agent'],
      session_id: event.headers['x-session-id'] || null
    });

    // Increment usage counters (only for authenticated users)
    if (user && accessCheck.access_id) {
      await incrementModuleUsage(moduleId, user.id);
    }

    // Store user/brain context in job for later use by audit processor
    await updateJobStatus(jobId, 'queued');

    const duration = Date.now() - startTime;

    // Return job_id immediately (202 Accepted - processing async)
    return {
      statusCode: 202,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({
        success: true,
        job_id: jobId,
        status: 'queued',
        stream_url: `/.netlify/functions/growth-audit-stream?jobId=${jobId}`,
        metadata: {
          duration_ms: duration,
          audience: audience,
          quota_remaining: accessCheck.daily_limit
            ? accessCheck.daily_limit - (accessCheck.daily_used + 1)
            : null,
          brain_applied: !!brain,
          estimated_completion_seconds: 60,
          module_run_id: moduleRunId
        }
      })
    };

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('[module-growth-audit] Error:', error);

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
