/**
 * Lead Capture Function
 *
 * Tracks lead magnet signups with UTM parameters and user data.
 * Stores in Supabase for follow-up campaigns and analytics.
 *
 * Endpoint: /.netlify/functions/lead-capture
 * Method: POST
 *
 * Body: {
 *   email: string,
 *   leadMagnetSlug: string,
 *   utmParams: {
 *     utm_source: string,
 *     utm_medium: string,
 *     utm_campaign: string,
 *     utm_content: string,
 *     utm_term: string
 *   },
 *   signupMethod: string ('one_tap' | 'oauth_button'),
 *   timestamp: string
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
    const { email, leadMagnetSlug, utmParams, signupMethod, timestamp } = body;

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

    // Store lead capture in database
    // You may need to create this table in Supabase
    const { data, error } = await supabase
      .from('lead_captures')
      .insert({
        email,
        lead_magnet_slug: leadMagnetSlug,
        utm_source: utmParams?.utm_source,
        utm_medium: utmParams?.utm_medium,
        utm_campaign: utmParams?.utm_campaign,
        utm_content: utmParams?.utm_content,
        utm_term: utmParams?.utm_term,
        signup_method: signupMethod,
        captured_at: timestamp || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist yet, log to console and return success
      // This allows the feature to work even before database migration
      console.warn('⚠️ Lead capture database error (table may not exist yet):', error);
      console.log('📊 Lead Capture Data:', {
        email,
        leadMagnetSlug,
        utmParams,
        signupMethod,
        timestamp
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Lead captured (logged)',
          note: 'Database table not yet created - data logged to console'
        })
      };
    }

    console.log('✅ Lead captured successfully:', data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data
      })
    };

  } catch (error) {
    console.error('❌ Lead capture error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to capture lead',
        message: error.message
      })
    };
  }
}
