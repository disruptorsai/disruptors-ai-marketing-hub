// SEO Audit Get - Fetch audit results by ID
// Public endpoint for retrieving completed audits

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY // Use anon key for public access
);

/**
 * Get audit by ID (with email verification for security)
 */
export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { id, email } = event.queryStringParameters || {};

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Audit ID is required' })
      };
    }

    // Fetch audit
    let query = supabase
      .from('seo_audits')
      .select(`
        id,
        domain,
        status,
        overall_score,
        ranked_keywords_count,
        average_position,
        organic_traffic_estimate,
        traffic_value_estimate,
        critical_issues_count,
        high_priority_issues_count,
        medium_priority_issues_count,
        low_priority_issues_count,
        created_at,
        completed_at,
        seo_audit_sections (
          section_name,
          section_title,
          score,
          strengths,
          issues,
          recommendations
        ),
        seo_audit_recommendations (
          title,
          description,
          priority,
          impact,
          effort,
          implementation_steps,
          estimated_time,
          category
        )
      `)
      .eq('id', id);

    // If email provided, verify ownership
    if (email) {
      query = query.eq('requester_email', email);
    }

    const { data: audit, error } = await query.single();

    if (error || !audit) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Audit not found or access denied' })
      };
    }

    // Don't expose full report in public API (only in admin or via email)
    // Remove sensitive data
    const publicAudit = {
      ...audit,
      keyword_data: undefined,
      website_data: undefined,
      analysis_data: undefined,
      report_markdown: undefined // Don't send full report via API
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(publicAudit)
    };

  } catch (error) {
    console.error('Get audit error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch audit' })
    };
  }
}
