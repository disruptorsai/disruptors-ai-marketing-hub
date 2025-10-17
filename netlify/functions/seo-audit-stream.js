// SEO Audit Stream - Real-time Progress Updates
// Server-Sent Events (SSE) for live progress tracking

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
 * Stream handler for real-time audit progress
 */
export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { domain, email, name, source = 'public' } = JSON.parse(event.body);

    if (!domain) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Domain is required' })
      };
    }

    // Create readable stream
    const encoder = new TextEncoder();
    let streamClosed = false;

    const stream = new ReadableStream({
      async start(controller) {
        // Helper to send SSE messages
        const send = (data) => {
          if (streamClosed) return;
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
            );
          } catch (e) {
            streamClosed = true;
          }
        };

        try {
          // Step 0: Initialize
          send({
            step: 'initializing',
            progress: 0,
            message: 'Starting SEO audit...',
            typing: 'Initializing audit system...'
          });

          // Create audit record
          const { data: audit, error: createError } = await supabase
            .from('seo_audits')
            .insert({
              domain: cleanDomain(domain),
              status: 'processing',
              source: source,
              requester_email: email,
              requester_name: name,
              started_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) throw createError;

          const auditId = audit.id;

          send({
            step: 'created',
            progress: 5,
            message: 'Audit initialized',
            auditId: auditId,
            typing: `Audit ID: ${auditId}`
          });

          // Step 1: Scraping website
          send({
            step: 'scraping_homepage',
            progress: 10,
            message: 'Analyzing your website structure...',
            typing: 'Connecting to your website...'
          });

          const websiteData = await scrapeWebsite(domain, (progress) => {
            send({
              step: progress.step,
              progress: progress.progress,
              message: getStepMessage(progress.step),
              typing: getStepTypingMessage(progress.step)
            });
          });

          await supabase
            .from('seo_audits')
            .update({ website_data: websiteData })
            .eq('id', auditId);

          send({
            step: 'website_analyzed',
            progress: 50,
            message: 'Website structure analyzed',
            typing: `Found ${websiteData.crawledPages?.length || 0} pages, ${websiteData.headings?.h1?.length || 0} H1 tags`,
            data: {
              pageCount: websiteData.crawledPages?.length || 0,
              hasMetaTags: !!websiteData.metaTags?.title,
              hasSchema: websiteData.schema?.length > 0
            }
          });

          // Step 2: Keyword rankings
          send({
            step: 'fetching_keyword_data',
            progress: 55,
            message: 'Analyzing keyword rankings...',
            typing: 'Querying DataForSEO database...'
          });

          const keywordData = await getKeywordData(domain, (progress) => {
            send({
              step: progress.step,
              progress: progress.progress,
              message: getStepMessage(progress.step),
              typing: getStepTypingMessage(progress.step)
            });
          });

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

          send({
            step: 'keywords_analyzed',
            progress: 70,
            message: 'Keyword analysis complete',
            typing: `Found ${keywordData.rankedKeywords?.length || 0} ranked keywords`,
            data: {
              totalKeywords: keywordData.rankedKeywords?.length || 0,
              avgPosition: keywordData.metrics?.avgPosition || 0,
              top10: keywordData.metrics?.top10Keywords || 0
            }
          });

          // Step 3: AI Content Analysis
          send({
            step: 'ai_analyzing_content',
            progress: 75,
            message: 'AI is analyzing your content quality...',
            typing: 'Running Claude Sonnet 4.5 analysis...'
          });

          const analysis = await analyzeContent(websiteData, keywordData, (progress) => {
            send({
              step: progress.step,
              progress: progress.progress,
              message: getStepMessage(progress.step),
              typing: getStepTypingMessage(progress.step)
            });
          });

          await supabase
            .from('seo_audits')
            .update({
              analysis_data: analysis,
              overall_score: analysis.overallScore
            })
            .eq('id', auditId);

          send({
            step: 'analysis_complete',
            progress: 85,
            message: 'Content analysis complete',
            typing: `Overall SEO score: ${analysis.overallScore}/100`,
            data: {
              overallScore: analysis.overallScore,
              sectionsAnalyzed: Object.keys(analysis.sections || {}).length
            }
          });

          // Step 4: Store detailed data
          send({
            step: 'storing_results',
            progress: 90,
            message: 'Saving detailed analysis...',
            typing: 'Storing recommendations in database...'
          });

          await storeAuditSections(auditId, analysis.sections);
          await storeRecommendations(auditId, analysis.recommendations);

          // Step 5: Generate report
          send({
            step: 'generating_report',
            progress: 95,
            message: 'Generating comprehensive report...',
            typing: 'Compiling findings and recommendations...'
          });

          const report = generateReport({
            domain: domain,
            websiteData: websiteData,
            keywordData: keywordData,
            analysis: analysis,
            recommendations: analysis.recommendations
          });

          // Step 6: Finalize
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

          // Create lead record for public audits
          if (source === 'public' && email) {
            const interestLevel = analysis.overallScore < 50 ? 'high' :
              analysis.overallScore < 70 ? 'medium' : 'low';

            await supabase
              .from('seo_leads')
              .insert({
                audit_id: auditId,
                email: email,
                name: name,
                domain: cleanDomain(domain),
                seo_score: analysis.overallScore,
                critical_issues_count: analysis.recommendations?.critical?.length || 0,
                interest_level: interestLevel,
                status: 'new'
              });
          }

          // Final completion message
          send({
            step: 'complete',
            progress: 100,
            message: 'Analysis complete!',
            typing: 'Your comprehensive SEO report is ready',
            auditId: auditId,
            data: {
              overallScore: analysis.overallScore,
              totalKeywords: keywordData.rankedKeywords?.length || 0,
              criticalIssues: analysis.recommendations?.critical?.length || 0,
              reportLength: report.length
            }
          });

          controller.close();

        } catch (error) {
          console.error('Stream error:', error);

          send({
            step: 'error',
            progress: 0,
            message: 'Analysis failed',
            typing: error.message,
            error: error.message
          });

          controller.close();
        }
      }
    });

    return {
      statusCode: 200,
      headers: headers,
      body: stream
    };

  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}

/**
 * Get user-friendly message for each step
 */
function getStepMessage(step) {
  const messages = {
    scraping_homepage: 'Analyzing your website structure...',
    extracting_metadata: 'Extracting meta tags and SEO data...',
    checking_sitemap: 'Checking for sitemap.xml...',
    crawling_pages: 'Discovering additional pages...',
    analyzing_content: 'Analyzing content quality...',
    fetching_domain_overview: 'Fetching domain metrics...',
    analyzing_ranked_keywords: 'Finding your keyword rankings...',
    finding_competitors: 'Identifying top competitors...',
    ai_analyzing_content: 'AI is analyzing your content...',
    generating_recommendations: 'Creating actionable recommendations...',
    storing_results: 'Saving detailed analysis...',
    generating_report: 'Generating comprehensive report...'
  };

  return messages[step] || 'Processing...';
}

/**
 * Get typing animation message for each step
 */
function getStepTypingMessage(step) {
  const messages = {
    scraping_homepage: 'Connecting to your website and extracting HTML...',
    extracting_metadata: 'Parsing title tags, meta descriptions, Open Graph data...',
    checking_sitemap: 'Looking for sitemap.xml at root directory...',
    crawling_pages: 'Following internal links to map site structure...',
    analyzing_content: 'Calculating word count, readability, keyword density...',
    fetching_domain_overview: 'Querying DataForSEO API for organic metrics...',
    analyzing_ranked_keywords: 'Scanning Google rankings for your domain...',
    finding_competitors: 'Identifying competing domains in your niche...',
    ai_analyzing_content: 'Claude Sonnet 4.5 is evaluating content depth, E-E-A-T, technical SEO...',
    generating_recommendations: 'Prioritizing critical fixes, high-impact opportunities...',
    storing_results: 'Writing analysis data to Supabase database...',
    generating_report: 'Building 15,000+ word comprehensive report with charts...'
  };

  return messages[step] || 'Processing data...';
}

/**
 * Store audit sections
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

  await supabase
    .from('seo_audit_sections')
    .insert(sectionRecords);
}

/**
 * Store recommendations
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

  await supabase
    .from('seo_audit_recommendations')
    .insert(recRecords);
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
