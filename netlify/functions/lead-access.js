/**
 * Lead Access Tracking Function
 *
 * Tracks when users actually access/download lead magnet content.
 * Used for analytics and to trigger follow-up campaigns.
 *
 * Endpoint: /.netlify/functions/lead-access
 * Method: POST
 *
 * Body: {
 *   email: string,
 *   userId: string,
 *   leadMagnetSlug: string,
 *   accessedAt: string,
 *   utmParams: object
 * }
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

export async function handler(event, context) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { email, userId, leadMagnetSlug, accessedAt, utmParams } = body;

    // Validate required fields
    if (!email || !leadMagnetSlug) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: email, leadMagnetSlug' })
      };
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Track content access
    const { data, error } = await supabase
      .from('lead_accesses')
      .insert({
        email,
        user_id: userId,
        lead_magnet_slug: leadMagnetSlug,
        utm_source: utmParams?.utm_source,
        utm_medium: utmParams?.utm_medium,
        utm_campaign: utmParams?.utm_campaign,
        accessed_at: accessedAt || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist yet, log to console
      console.warn('⚠️ Lead access tracking error (table may not exist yet):', error);
      console.log('📊 Lead Access Data:', {
        email,
        userId,
        leadMagnetSlug,
        accessedAt,
        utmParams
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Access tracked (logged)'
        })
      };
    }

    console.log('✅ Lead access tracked:', data);

    // Update the original lead_captures record with access info
    await supabase
      .from('lead_captures')
      .update({
        accessed: true,
        accessed_at: accessedAt || new Date().toISOString()
      })
      .eq('email', email)
      .eq('lead_magnet_slug', leadMagnetSlug);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data
      })
    };

  } catch (error) {
    console.error('❌ Lead access tracking error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to track access',
        message: error.message
      })
    };
  }
}
