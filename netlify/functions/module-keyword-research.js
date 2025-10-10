/**
 * Netlify Function: Keyword Research Module Executor
 *
 * Executes the Keyword Research module with proper authentication,
 * access control, and telemetry tracking.
 *
 * Three-Level Access System:
 * - Internal: Unlimited searches (admin users)
 * - Client: 10 searches/day (authenticated users)
 * - Public: 3 searches/day (anonymous users)
 *
 * @module module-keyword-research
 */

import { executeModule } from '../../src/lib/modules/module-executor';
import { supabaseAdmin } from '../../src/lib/supabase-client';

/**
 * Main handler for keyword research module execution
 *
 * @param {Object} event - Netlify function event
 * @param {Object} context - Netlify function context
 * @returns {Promise<Object>} HTTP response
 */
export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json'
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

  try {
    // Parse request body
    const { input, context: execContext } = JSON.parse(event.body || '{}');

    if (!input || !input.seed_keyword) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: {
            message: 'Missing required field: seed_keyword',
            code: 'INVALID_INPUT'
          }
        })
      };
    }

    // Extract user authentication
    let userId = null;
    let brainId = null;
    let audience = 'public'; // Default to public

    // Try to get user from JWT token
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        // Verify JWT and get user
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (!error && user) {
          userId = user.id;

          // Check if user is admin (internal access)
          const { data: adminUser } = await supabaseAdmin
            .from('admin_users')
            .select('id')
            .eq('user_id', userId)
            .single();

          if (adminUser) {
            audience = 'internal';
          } else {
            audience = 'client';
          }

          // Get user's brain ID if provided in context
          if (execContext?.brainId) {
            brainId = execContext.brainId;
          }
        }
      } catch (authError) {
        console.warn('[module-keyword-research] Auth error:', authError);
        // Continue as public user
      }
    }

    // Override audience if provided in context (for testing)
    if (execContext?.audience && ['internal', 'client', 'public'].includes(execContext.audience)) {
      audience = execContext.audience;
    }

    // Extract client info
    const ipAddress = event.headers['x-forwarded-for'] || event.headers['x-real-ip'];
    const userAgent = event.headers['user-agent'];
    const sessionId = execContext?.sessionId || `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Execute module
    const result = await executeModule('keyword-research', input, {
      userId,
      brainId,
      audience,
      sessionId,
      ipAddress,
      userAgent
    });

    // Return result
    return {
      statusCode: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('[module-keyword-research] Error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'INTERNAL_ERROR',
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      })
    };
  }
};
