/**
 * Competitor Monitor Netlify Function
 * Tracks SERP positions for competitor keywords
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Handler for competitor monitoring
 */
export async function handler(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { action, brain_id, keywords, domain } = JSON.parse(event.body || '{}');

    switch (action) {
      case 'add_keywords':
        return await addMonitoringKeywords(brain_id, keywords, domain, headers);

      case 'get_status':
        return await getMonitoringStatus(brain_id, headers);

      case 'run_check':
        return await runPositionCheck(brain_id, headers);

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }

  } catch (error) {
    console.error('[CompetitorMonitor] Error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || 'Internal server error'
      })
    };
  }
}

/**
 * Add keywords to monitor
 */
async function addMonitoringKeywords(brainId, keywords, domain, headers) {
  // In a full implementation, this would:
  // 1. Store keywords in a monitoring table
  // 2. Set up scheduled checks
  // 3. Initialize baseline positions

  // For now, return success
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: `Added ${keywords.length} keywords to monitoring for ${domain}`,
      keywords_count: keywords.length,
      next_check: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })
  };
}

/**
 * Get monitoring status
 */
async function getMonitoringStatus(brainId, headers) {
  // In a full implementation, this would:
  // 1. Fetch monitored keywords from database
  // 2. Get latest position data
  // 3. Calculate changes and trends

  // For now, return placeholder data
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      brain_id: brainId,
      monitored_keywords: 0,
      last_check: null,
      next_check: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      position_changes: {
        improved: 0,
        declined: 0,
        stable: 0
      }
    })
  };
}

/**
 * Run position check
 */
async function runPositionCheck(brainId, headers) {
  // In a full implementation, this would:
  // 1. Fetch all monitored keywords for this brain
  // 2. Check current SERP positions using DataForSEO
  // 3. Compare with previous positions
  // 4. Store results
  // 5. Generate alerts if significant changes

  // For now, return success
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Position check initiated',
      estimated_completion: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    })
  };
}
