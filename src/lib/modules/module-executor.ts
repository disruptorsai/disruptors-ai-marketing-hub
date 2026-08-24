/**
 * Module Executor
 *
 * Handles module execution with:
 * - Access control and quota checking
 * - Telemetry tracking
 * - Error handling
 * - Business Brain context injection
 *
 * @module ModuleExecutor
 */

import { supabaseAdmin } from '@/lib/supabase-client';
import { BrainAPI } from '@/lib/brain-api';
import ModuleRegistry from './module-registry';
import type {
  ModuleExecutionContext,
  ModuleExecutionResult,
  ModuleRun,
  ModuleAudience
} from './types';
import crypto from 'crypto';

/**
 * Execute a module
 *
 * @param {string} slug - Module slug
 * @param {Object} input - Module input
 * @param {Object} context - Execution context
 * @returns {Promise<ModuleExecutionResult>}
 */
export async function executeModule(
  slug: string,
  input: Record<string, any>,
  context: {
    userId?: string;
    brainId?: string;
    audience: ModuleAudience;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<ModuleExecutionResult> {
  const startTime = Date.now();
  let moduleId: string | undefined;
  let accessId: string | undefined;

  try {
    // 1. Load module
    const module = await ModuleRegistry.loadModule(slug);
    if (!module) {
      return {
        success: false,
        error: {
          message: `Module not found: ${slug}`,
          code: 'MODULE_NOT_FOUND'
        }
      };
    }

    moduleId = module.id;

    // 2. Check access
    const accessCheck = await ModuleRegistry.checkModuleAccess(
      slug,
      context.userId || null,
      context.audience
    );

    if (!accessCheck.allowed) {
      return {
        success: false,
        error: {
          message: accessCheck.reason || 'Access denied',
          code: accessCheck.reason?.includes('quota')
            ? 'QUOTA_EXCEEDED'
            : 'ACCESS_DENIED'
        },
        metadata: {
          quota_reset_at: accessCheck.quota_reset_at
        }
      };
    }

    accessId = accessCheck.access_id;

    // 3. Load Business Brain context (if required)
    let brain = undefined;
    if (module.requires_brain && context.brainId) {
      try {
        brain = await BrainAPI.getBrainById(context.brainId);
      } catch (error) {
        console.warn('[ModuleExecutor] Failed to load brain:', error);
        // Continue without brain if it fails (non-blocking)
      }
    } else if (module.requires_brain && context.userId) {
      try {
        brain = await BrainAPI.getBrainByUser(context.userId);
      } catch (error) {
        console.warn('[ModuleExecutor] Failed to load brain:', error);
      }
    }

    // 4. Import module config
    const moduleConfig = await ModuleRegistry.importModuleConfig(slug);

    // 5. Validate input (if validation function provided)
    if (moduleConfig.validateInput) {
      const validation = moduleConfig.validateInput(input);
      if (!validation.valid) {
        return {
          success: false,
          error: {
            message: 'Invalid input: ' + validation.errors.join(', '),
            code: 'INVALID_INPUT'
          }
        };
      }
    }

    // 6. Transform input (if transform function provided)
    let transformedInput = input;
    if (moduleConfig.transformInput) {
      transformedInput = moduleConfig.transformInput(input, brain);
    }

    // 7. Build execution context
    const execContext: ModuleExecutionContext = {
      input: transformedInput,
      user: context.userId ? { id: context.userId } : undefined,
      brain,
      audience: context.audience,
      config: accessCheck.config || {},
      session_id: context.sessionId,
      ip_address: context.ipAddress,
      user_agent: context.userAgent
    };

    // 8. Execute module
    const output = await moduleConfig.execute(execContext);

    // 9. Transform output (if transform function provided)
    let transformedOutput = output;
    if (moduleConfig.transformOutput) {
      transformedOutput = moduleConfig.transformOutput(output, brain);
    }

    const duration = Date.now() - startTime;

    // 10. Track telemetry
    await trackModuleRun({
      module_id: moduleId,
      user_id: context.userId || null,
      brain_id: context.brainId || null,
      audience: context.audience,
      input_data: input,
      output_data: transformedOutput,
      duration_ms: duration,
      status: 'success',
      session_id: context.sessionId,
      ip_address: context.ipAddress,
      user_agent: context.userAgent
    });

    // 11. Increment usage (if user is authenticated)
    if (context.userId && accessId) {
      try {
        await ModuleRegistry.incrementModuleUsage(moduleId, context.userId);
      } catch (error) {
        console.error('[ModuleExecutor] Failed to increment usage:', error);
        // Non-blocking error
      }
    }

    return {
      success: true,
      data: transformedOutput,
      metadata: {
        duration_ms: duration
      }
    };

  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Track error in telemetry
    if (moduleId) {
      await trackModuleRun({
        module_id: moduleId,
        user_id: context.userId || null,
        brain_id: context.brainId || null,
        audience: context.audience,
        input_data: input,
        duration_ms: duration,
        status: 'fail',
        error_message: error.message || 'Unknown error',
        error_stack: error.stack,
        session_id: context.sessionId,
        ip_address: context.ipAddress,
        user_agent: context.userAgent
      });
    }

    return {
      success: false,
      error: {
        message: error.message || 'Module execution failed',
        code: error.code || 'EXECUTION_ERROR',
        stack: error.stack
      },
      metadata: {
        duration_ms: duration
      }
    };
  }
}

/**
 * Track a module run in telemetry
 *
 * @param {Partial<ModuleRun>} runData - Module run data
 * @returns {Promise<void>}
 */
async function trackModuleRun(runData: Partial<ModuleRun>): Promise<void> {
  try {
    // Generate input hash for deduplication
    const input_hash = runData.input_data
      ? crypto
          .createHash('md5')
          .update(JSON.stringify(runData.input_data))
          .digest('hex')
      : undefined;

    const { error } = await supabaseAdmin.from('module_runs').insert({
      ...runData,
      input_hash,
      run_context: {
        source: runData.audience === 'internal' ? 'admin' : runData.audience === 'client' ? 'app' : 'public',
        ip_address: runData.ip_address,
        user_agent: runData.user_agent
      },
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    });

    if (error) {
      console.error('[ModuleExecutor] Error tracking module run:', error);
      // Non-blocking error - don't fail the execution
    }
  } catch (error) {
    console.error('[ModuleExecutor] Error in trackModuleRun:', error);
    // Non-blocking error
  }
}

/**
 * Execute a module function (for Netlify functions)
 *
 * This is a helper for Netlify functions to execute modules
 * via HTTP requests.
 *
 * @param {Object} event - Netlify function event
 * @returns {Promise<Object>} HTTP response
 */
export async function executeModuleFunction(event: any) {
  try {
    const { slug, input, context } = JSON.parse(event.body);

    // Extract context from event
    const ipAddress = event.headers['x-forwarded-for'] || event.headers['x-real-ip'];
    const userAgent = event.headers['user-agent'];

    const result = await executeModule(slug, input, {
      ...context,
      ipAddress,
      userAgent
    });

    return {
      statusCode: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify(result)
    };

  } catch (error: any) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      })
    };
  }
}

/**
 * Get module run history for a user
 *
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<ModuleRun[]>}
 */
export async function getModuleRunHistory(
  userId: string,
  {
    limit = 50,
    moduleSlug,
    status
  }: {
    limit?: number;
    moduleSlug?: string;
    status?: string;
  } = {}
): Promise<ModuleRun[]> {
  let query = supabaseAdmin
    .from('module_runs')
    .select(`
      *,
      module:modules(slug, name, icon_url, category)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  if (moduleSlug) {
    // Need to join with modules table
    const { data: module } = await supabaseAdmin
      .from('modules')
      .select('id')
      .eq('slug', moduleSlug)
      .single();

    if (module) {
      query = query.eq('module_id', module.id);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('[ModuleExecutor] Error getting run history:', error);
    throw error;
  }

  return (data || []) as ModuleRun[];
}

/**
 * Get module usage statistics
 *
 * @param {string} moduleId - Module ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Usage statistics
 */
export async function getModuleUsageStats(
  moduleId: string,
  {
    startDate,
    endDate,
    audience
  }: {
    startDate?: string;
    endDate?: string;
    audience?: ModuleAudience;
  } = {}
): Promise<{
  total_runs: number;
  success_rate: number;
  avg_duration_ms: number;
  total_cost_usd: number;
  total_tokens: number;
}> {
  let query = supabaseAdmin
    .from('module_runs')
    .select('status, duration_ms, cost_usd, tokens_used')
    .eq('module_id', moduleId);

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  if (audience) {
    query = query.eq('audience', audience);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[ModuleExecutor] Error getting usage stats:', error);
    throw error;
  }

  const runs = data || [];
  const total_runs = runs.length;
  const success_runs = runs.filter((r: any) => r.status === 'success').length;
  const success_rate = total_runs > 0 ? (success_runs / total_runs) * 100 : 0;
  const avg_duration_ms = runs.length > 0
    ? runs.reduce((sum: number, r: any) => sum + (r.duration_ms || 0), 0) / runs.length
    : 0;
  const total_cost_usd = runs.reduce((sum: number, r: any) => sum + (r.cost_usd || 0), 0);
  const total_tokens = runs.reduce((sum: number, r: any) => sum + (r.tokens_used || 0), 0);

  return {
    total_runs,
    success_rate: Math.round(success_rate * 10) / 10,
    avg_duration_ms: Math.round(avg_duration_ms),
    total_cost_usd: Math.round(total_cost_usd * 1000) / 1000,
    total_tokens
  };
}
