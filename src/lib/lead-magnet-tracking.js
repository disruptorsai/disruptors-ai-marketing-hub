/**
 * Lead Magnet Tracking Utilities
 *
 * Provides helper functions for tracking lead magnet signups and content access.
 * Integrates with the Supabase lead_captures and lead_accesses tables.
 *
 * @module lead-magnet-tracking
 */

import { supabaseAdmin } from './supabase-client';

/**
 * Extract UTM parameters from URL
 *
 * @param {string} url - URL to extract params from (defaults to current URL)
 * @returns {Object} UTM parameters object
 *
 * @example
 * const utmParams = extractUtmParams(window.location.href);
 * // Returns: { utm_source: 'linkedin', utm_medium: 'social', ... }
 */
export function extractUtmParams(url = typeof window !== 'undefined' ? window.location.href : '') {
  try {
    const searchParams = new URLSearchParams(url.split('?')[1] || '');

    return {
      utm_source: searchParams.get('utm_source') || null,
      utm_medium: searchParams.get('utm_medium') || null,
      utm_campaign: searchParams.get('utm_campaign') || null,
      utm_content: searchParams.get('utm_content') || null,
      utm_term: searchParams.get('utm_term') || null
    };
  } catch (error) {
    console.error('Failed to extract UTM params:', error);
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null
    };
  }
}

/**
 * Track a lead magnet signup
 *
 * Call this when a user completes One-Click Google Signup for a lead magnet.
 * Creates a record in the lead_captures table.
 *
 * @param {Object} params - Tracking parameters
 * @param {string} params.email - User's email address (required)
 * @param {string} params.leadMagnetSlug - Lead magnet identifier (required)
 * @param {Object} [params.utmParams={}] - UTM parameters object
 * @param {string} [params.signupMethod='one_tap'] - Signup method
 *
 * @returns {Promise<Object|null>} Created lead capture record or null on error
 *
 * @example
 * const capture = await trackLeadCapture({
 *   email: 'user@example.com',
 *   leadMagnetSlug: 'keyword-research-tool',
 *   utmParams: extractUtmParams(),
 *   signupMethod: 'one_tap'
 * });
 */
export async function trackLeadCapture({
  email,
  leadMagnetSlug,
  utmParams = {},
  signupMethod = 'one_tap'
}) {
  try {
    // Validate required fields
    if (!email || !leadMagnetSlug) {
      throw new Error('email and leadMagnetSlug are required');
    }

    // Insert lead capture record
    const { data, error } = await supabaseAdmin
      .from('lead_captures')
      .insert({
        email,
        lead_magnet_slug: leadMagnetSlug,
        utm_source: utmParams.utm_source || null,
        utm_medium: utmParams.utm_medium || null,
        utm_campaign: utmParams.utm_campaign || null,
        utm_content: utmParams.utm_content || null,
        utm_term: utmParams.utm_term || null,
        signup_method: signupMethod
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to track lead capture:', error);
      return null;
    }

    console.log('Lead capture tracked:', {
      email,
      leadMagnetSlug,
      captureId: data.id
    });

    return data;
  } catch (error) {
    console.error('Error tracking lead capture:', error);
    return null;
  }
}

/**
 * Track lead magnet content access
 *
 * Call this when a user views or downloads lead magnet content.
 * Creates a record in lead_accesses and updates lead_captures.
 *
 * @param {Object} params - Tracking parameters
 * @param {string} params.email - User's email address (required)
 * @param {string} params.leadMagnetSlug - Lead magnet identifier (required)
 * @param {string} [params.userId=null] - Supabase auth user ID
 * @param {Object} [params.utmParams={}] - UTM parameters object
 *
 * @returns {Promise<Object|null>} Created lead access record or null on error
 *
 * @example
 * const access = await trackLeadAccess({
 *   email: 'user@example.com',
 *   leadMagnetSlug: 'keyword-research-tool',
 *   userId: 'user-uuid',
 *   utmParams: extractUtmParams()
 * });
 */
export async function trackLeadAccess({
  email,
  leadMagnetSlug,
  userId = null,
  utmParams = {}
}) {
  try {
    // Validate required fields
    if (!email || !leadMagnetSlug) {
      throw new Error('email and leadMagnetSlug are required');
    }

    // Insert access record
    const { data: accessData, error: accessError } = await supabaseAdmin
      .from('lead_accesses')
      .insert({
        email,
        user_id: userId,
        lead_magnet_slug: leadMagnetSlug,
        utm_source: utmParams.utm_source || null,
        utm_medium: utmParams.utm_medium || null,
        utm_campaign: utmParams.utm_campaign || null
      })
      .select()
      .single();

    if (accessError) {
      console.error('Failed to track lead access:', accessError);
      return null;
    }

    // Update lead_captures to mark as accessed
    const { error: updateError } = await supabaseAdmin
      .from('lead_captures')
      .update({
        accessed: true,
        accessed_at: new Date().toISOString()
      })
      .eq('email', email)
      .eq('lead_magnet_slug', leadMagnetSlug)
      .eq('accessed', false); // Only update if not already accessed

    if (updateError) {
      console.warn('Failed to update lead capture:', updateError);
      // Don't fail the entire operation if update fails
    }

    console.log('Lead access tracked:', {
      email,
      leadMagnetSlug,
      accessId: accessData.id
    });

    return accessData;
  } catch (error) {
    console.error('Error tracking lead access:', error);
    return null;
  }
}

/**
 * Get lead magnet stats
 *
 * Retrieves aggregated performance stats for a specific lead magnet or all lead magnets.
 *
 * @param {string} [leadMagnetSlug=null] - Optional lead magnet slug to filter by
 * @returns {Promise<Array|null>} Array of stats objects or null on error
 *
 * @example
 * // Get all lead magnet stats
 * const allStats = await getLeadMagnetStats();
 *
 * // Get stats for specific lead magnet
 * const toolStats = await getLeadMagnetStats('keyword-research-tool');
 */
export async function getLeadMagnetStats(leadMagnetSlug = null) {
  try {
    let query = supabaseAdmin
      .from('lead_magnet_stats')
      .select('*')
      .order('total_signups', { ascending: false });

    if (leadMagnetSlug) {
      query = query.eq('lead_magnet_slug', leadMagnetSlug);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to get lead magnet stats:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting lead magnet stats:', error);
    return null;
  }
}

/**
 * Get recent lead activity
 *
 * Retrieves the most recent lead magnet activity.
 *
 * @param {number} [limit=50] - Maximum number of records to return
 * @returns {Promise<Array|null>} Array of activity objects or null on error
 *
 * @example
 * const recentActivity = await getRecentLeadActivity(20);
 */
export async function getRecentLeadActivity(limit = 50) {
  try {
    const { data, error } = await supabaseAdmin
      .from('recent_lead_activity')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('Failed to get recent lead activity:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting recent lead activity:', error);
    return null;
  }
}

/**
 * Get lead conversion funnel
 *
 * Calculates conversion funnel for a specific lead magnet over a time period.
 *
 * @param {string} leadMagnetSlug - Lead magnet identifier (required)
 * @param {number} [daysBack=30] - Number of days to analyze
 * @returns {Promise<Array|null>} Array of funnel steps or null on error
 *
 * @example
 * const funnel = await getLeadFunnel('keyword-research-tool', 7);
 * // Returns: [
 * //   { step: 'Signed Up', count: 100, percentage: 100 },
 * //   { step: 'Accessed Content', count: 75, percentage: 75 }
 * // ]
 */
export async function getLeadFunnel(leadMagnetSlug, daysBack = 30) {
  try {
    if (!leadMagnetSlug) {
      throw new Error('leadMagnetSlug is required');
    }

    const { data, error } = await supabaseAdmin
      .rpc('get_lead_funnel', {
        p_lead_magnet_slug: leadMagnetSlug,
        p_days_back: daysBack
      });

    if (error) {
      console.error('Failed to get lead funnel:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting lead funnel:', error);
    return null;
  }
}

/**
 * Get abandoned leads
 *
 * Retrieves leads who signed up but haven't accessed content after 24 hours.
 * Useful for email follow-up campaigns.
 *
 * @param {number} [hoursAgo=24] - Hours since signup
 * @param {number} [maxDaysAgo=7] - Maximum days to look back
 * @returns {Promise<Array|null>} Array of abandoned lead objects or null on error
 *
 * @example
 * const abandoned = await getAbandonedLeads(24, 7);
 * // Send follow-up emails to these leads
 */
export async function getAbandonedLeads(hoursAgo = 24, maxDaysAgo = 7) {
  try {
    const { data, error } = await supabaseAdmin
      .from('lead_captures')
      .select('*')
      .eq('accessed', false)
      .lt('captured_at', new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString())
      .gt('captured_at', new Date(Date.now() - maxDaysAgo * 24 * 60 * 60 * 1000).toISOString())
      .order('captured_at', { ascending: false });

    if (error) {
      console.error('Failed to get abandoned leads:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting abandoned leads:', error);
    return null;
  }
}

/**
 * Get UTM attribution report
 *
 * Aggregates lead captures by UTM source for attribution analysis.
 *
 * @param {number} [daysBack=30] - Number of days to analyze
 * @returns {Promise<Array|null>} Array of source attribution objects or null on error
 *
 * @example
 * const attribution = await getUtmAttribution(30);
 * // Returns: [
 * //   { utm_source: 'linkedin', signups: 50, accessed: 40, conversion_rate: 80 },
 * //   { utm_source: 'twitter', signups: 30, accessed: 20, conversion_rate: 66.67 }
 * // ]
 */
export async function getUtmAttribution(daysBack = 30) {
  try {
    // This would be better as a database view, but for now we'll query directly
    const { data, error } = await supabaseAdmin
      .from('lead_captures')
      .select('utm_source, accessed')
      .gte('captured_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
      .not('utm_source', 'is', null);

    if (error) {
      console.error('Failed to get UTM attribution:', error);
      return null;
    }

    // Aggregate in JavaScript
    const attribution = {};

    for (const row of data) {
      const source = row.utm_source;
      if (!attribution[source]) {
        attribution[source] = { utm_source: source, signups: 0, accessed: 0 };
      }
      attribution[source].signups++;
      if (row.accessed) {
        attribution[source].accessed++;
      }
    }

    // Calculate conversion rates
    const result = Object.values(attribution).map(source => ({
      ...source,
      conversion_rate: source.signups > 0
        ? Math.round((source.accessed / source.signups) * 100 * 100) / 100
        : 0
    }));

    // Sort by signups descending
    result.sort((a, b) => b.signups - a.signups);

    return result;
  } catch (error) {
    console.error('Error getting UTM attribution:', error);
    return null;
  }
}

/**
 * Batch tracking helper
 *
 * Tracks both capture and access in a single call (for immediate access scenarios).
 *
 * @param {Object} params - Tracking parameters
 * @param {string} params.email - User's email address (required)
 * @param {string} params.leadMagnetSlug - Lead magnet identifier (required)
 * @param {string} [params.userId=null] - Supabase auth user ID
 * @param {Object} [params.utmParams={}] - UTM parameters object
 * @param {string} [params.signupMethod='one_tap'] - Signup method
 *
 * @returns {Promise<Object>} Object with capture and access data
 *
 * @example
 * const result = await trackLeadComplete({
 *   email: 'user@example.com',
 *   leadMagnetSlug: 'keyword-research-tool',
 *   userId: 'user-uuid',
 *   utmParams: extractUtmParams(),
 *   signupMethod: 'one_tap'
 * });
 */
export async function trackLeadComplete({
  email,
  leadMagnetSlug,
  userId = null,
  utmParams = {},
  signupMethod = 'one_tap'
}) {
  try {
    // Track capture
    const capture = await trackLeadCapture({
      email,
      leadMagnetSlug,
      utmParams,
      signupMethod
    });

    // Track access
    const access = await trackLeadAccess({
      email,
      leadMagnetSlug,
      userId,
      utmParams
    });

    return {
      capture,
      access,
      success: !!(capture && access)
    };
  } catch (error) {
    console.error('Error tracking complete lead flow:', error);
    return {
      capture: null,
      access: null,
      success: false
    };
  }
}

// Default export with all functions
export default {
  extractUtmParams,
  trackLeadCapture,
  trackLeadAccess,
  trackLeadComplete,
  getLeadMagnetStats,
  getRecentLeadActivity,
  getLeadFunnel,
  getAbandonedLeads,
  getUtmAttribution
};
