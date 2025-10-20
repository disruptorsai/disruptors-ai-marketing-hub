// SEO Audit Analyzer - Main Orchestrator
// Runs complete SEO audit and stores results in database

import { createClient } from '@supabase/supabase-js';
import { scrapeWebsite } from './seo-audit/scraper.js';
import { getKeywordData } from './seo-audit/dataforseo.js';
import { analyzeContent } from './seo-audit/analyzer.js';
import { generateReport } from './seo-audit/report-generator.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Main handler for SEO audit requests
 */
export async function handler(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { domain, email, name, source = 'public', requestedBy = null } = JSON.parse(event.body);

    if (!domain) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Domain is required' })
      };
    }

    console.log(`Starting SEO audit for: ${domain}`);

    // Step 1: Create audit record
    const { data: audit, error: createError } = await supabase
      .from('seo_audits')
      .insert({
        domain: cleanDomain(domain),
        status: 'processing',
        source: source,
        requester_email: email,
        requester_name: name,
        requested_by: requestedBy,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create audit record:', createError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create audit record' })
      };
    }

    console.log(`Audit record created: ${audit.id}`);

    // Step 2: Run audit in background (don't wait for completion)
    runAudit(audit.id, domain).catch(error => {
      console.error('Audit error:', error);
      updateAuditStatus(audit.id, 'failed', error.message);
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        auditId: audit.id,
        status: 'processing',
        message: 'Audit started successfully'
      })
    };

  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}

/**
 * Run complete SEO audit (async)
 */
async function runAudit(auditId, domain) {
  try {
    console.log(`[${auditId}] Starting audit for ${domain}`);

    // Step 1: Scrape website
    console.log(`[${auditId}] Step 1: Scraping website...`);
    const websiteData = await scrapeWebsite(domain);

    // Store website data
    await supabase
      .from('seo_audits')
      .update({ website_data: websiteData })
      .eq('id', auditId);

    // Step 2: Get keyword data
    console.log(`[${auditId}] Step 2: Fetching keyword data...`);
    const keywordData = await getKeywordData(domain);

    // Store keyword data + update metrics
    await supabase
      .from('seo_audits')
      .update({
        keyword_data: keywordData,
        ranked_keywords_count: keywordData.rankedKeywords?.length || 0,
        average_position: keywordData.metrics?.avgPosition || null,
        organic_traffic_estimate: keywordData.metrics?.estimatedTraffic || 0,
        traffic_value_estimate: keywordData.metrics?.trafficValue || 0,
        competitor_data: keywordData.competitors || []
      })
      .eq('id', auditId);

    // Step 3: AI analysis
    console.log(`[${auditId}] Step 3: Running AI analysis...`);
    const analysis = await analyzeContent(websiteData, keywordData);

    // Store analysis data
    await supabase
      .from('seo_audits')
      .update({
        analysis_data: analysis,
        overall_score: analysis.overallScore
      })
      .eq('id', auditId);

    // Step 4: Store detailed sections
    console.log(`[${auditId}] Step 4: Storing section details...`);
    await storeAuditSections(auditId, analysis.sections);

    // Step 5: Store recommendations
    console.log(`[${auditId}] Step 5: Storing recommendations...`);
    await storeRecommendations(auditId, analysis.recommendations);

    // Step 6: Generate report
    console.log(`[${auditId}] Step 6: Generating report...`);
    const report = generateReport({
      domain: domain,
      websiteData: websiteData,
      keywordData: keywordData,
      analysis: analysis,
      recommendations: analysis.recommendations
    });

    // Step 7: Mark as completed
    console.log(`[${auditId}] Step 7: Finalizing...`);
    await supabase
      .from('seo_audits')
      .update({
        status: 'completed',
        report_markdown: report,
        completed_at: new Date().toISOString(),
        critical_issues_count: analysis.recommendations?.critical?.length || 0,
        high_priority_issues_count: analysis.recommendations?.high?.length || 0,
        medium_priority_issues_count: analysis.recommendations?.medium?.length || 0,
        low_priority_issues_count: analysis.recommendations?.low?.length || 0
      })
      .eq('id', auditId);

    console.log(`[${auditId}] Audit completed successfully!`);

    // If this is a public lead, create lead record
    const auditRecord = await supabase
      .from('seo_audits')
      .select('source, requester_email, requester_name, overall_score, critical_issues_count')
      .eq('id', auditId)
      .single();

    if (auditRecord.data?.source === 'public' && auditRecord.data.requester_email) {
      await createLeadRecord(auditId, auditRecord.data);
    }

  } catch (error) {
    console.error(`[${auditId}] Audit failed:`, error);
    await updateAuditStatus(auditId, 'failed', error.message);
    throw error;
  }
}

/**
 * Store audit sections in database
 */
async function storeAuditSections(auditId, sections) {
  if (!sections) return;

  const sectionRecords = Object.entries(sections).map(([name, data]) => ({
    audit_id: auditId,
    section_name: name,
    section_title: formatSectionName(name),
    score: data.score || 0,
    strengths: data.strengths || [],
    issues: data.issues || [],
    recommendations: data.recommendations || []
  }));

  const { error } = await supabase
    .from('seo_audit_sections')
    .insert(sectionRecords);

  if (error) {
    console.error('Failed to store sections:', error);
  }
}

/**
 * Store recommendations in database
 */
async function storeRecommendations(auditId, recommendations) {
  if (!recommendations) return;

  const allRecs = [
    ...(recommendations.critical || []).map(r => ({ ...r, priority: 'critical' })),
    ...(recommendations.high || []).map(r => ({ ...r, priority: 'high' })),
    ...(recommendations.medium || []).map(r => ({ ...r, priority: 'medium' })),
    ...(recommendations.low || []).map(r => ({ ...r, priority: 'low' }))
  ];

  const recRecords = allRecs.map(rec => ({
    audit_id: auditId,
    title: rec.title,
    description: rec.description,
    priority: rec.priority,
    impact: rec.impact,
    effort: rec.effort,
    implementation_steps: rec.implementation,
    estimated_time: rec.estimatedTime,
    category: rec.category
  }));

  const { error } = await supabase
    .from('seo_audit_recommendations')
    .insert(recRecords);

  if (error) {
    console.error('Failed to store recommendations:', error);
  }
}

/**
 * Create lead record for public audits
 */
async function createLeadRecord(auditId, auditData) {
  const interestLevel = auditData.overall_score < 50 ? 'high' :
    auditData.overall_score < 70 ? 'medium' : 'low';

  const { error } = await supabase
    .from('seo_leads')
    .insert({
      audit_id: auditId,
      email: auditData.requester_email,
      name: auditData.requester_name,
      domain: auditData.domain,
      seo_score: auditData.overall_score,
      critical_issues_count: auditData.critical_issues_count,
      interest_level: interestLevel,
      status: 'new'
    });

  if (error) {
    console.error('Failed to create lead record:', error);
  }
}

/**
 * Update audit status
 */
async function updateAuditStatus(auditId, status, errorMessage = null) {
  const updates = {
    status: status
  };

  if (status === 'failed') {
    updates.error_message = errorMessage;
  } else if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  await supabase
    .from('seo_audits')
    .update(updates)
    .eq('id', auditId);
}

/**
 * Helper: Clean domain name
 */
function cleanDomain(domain) {
  return domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase();
}

/**
 * Helper: Format section name
 */
function formatSectionName(name) {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}
