// SEO Audit Tool - DataForSEO Integration
// Fetches keyword rankings, competitor data, and traffic estimates

import https from 'https';

const DATAFORSEO_USERNAME = process.env.DATAFORSEO_LOGIN || process.env.DATAFORSEO_USERNAME;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

/**
 * Get comprehensive keyword data for a domain
 * @param {string} domain - Domain to analyze
 * @param {function} onProgress - Progress callback
 * @returns {object} Keyword rankings, competitors, opportunities
 */
export async function getKeywordData(domain, onProgress = null) {
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

  try {
    // Step 1: Get domain overview
    if (onProgress) onProgress({ step: 'fetching_domain_overview', progress: 55 });

    const overview = await dataforSEORequest('/v3/dataforseo_labs/google/domain_metrics_by_categories/live', [{
      target: cleanDomain,
      language_name: 'English',
      location_code: 2840, // United States
      load_rank_absolute: true
    }]);

    const overviewData = overview?.tasks?.[0]?.result?.[0] || null;

    // Step 2: Get ranked keywords
    if (onProgress) onProgress({ step: 'analyzing_ranked_keywords', progress: 60 });

    const keywords = await dataforSEORequest('/v3/dataforseo_labs/google/ranked_keywords/live', [{
      target: cleanDomain,
      language_name: 'English',
      location_code: 2840,
      limit: 100,
      order_by: ['ranked_serp_element.serp_item.rank_group,asc']
    }]);

    const rankedKeywords = keywords?.tasks?.[0]?.result?.[0]?.items || [];

    // Step 3: Get competitors
    if (onProgress) onProgress({ step: 'finding_competitors', progress: 65 });

    const competitors = await dataforSEORequest('/v3/dataforseo_labs/google/competitors_domain/live', [{
      target: cleanDomain,
      language_name: 'English',
      location_code: 2840,
      limit: 20
    }]);

    const competitorData = competitors?.tasks?.[0]?.result?.[0]?.items || [];

    // Step 4: Calculate metrics
    const metrics = calculateMetrics(rankedKeywords, overviewData);

    return {
      domain: cleanDomain,
      analyzedAt: new Date().toISOString(),

      // Overview metrics
      overview: {
        organicKeywords: overviewData?.metrics?.organic?.count || 0,
        organicTraffic: overviewData?.metrics?.organic?.etv || 0,
        organicCost: overviewData?.metrics?.organic?.cost || 0,
        domainRank: overviewData?.metrics?.organic?.rank_absolute || null,
        categories: overviewData?.categories || []
      },

      // Ranked keywords
      rankedKeywords: rankedKeywords.map(kw => ({
        keyword: kw.keyword_data?.keyword || '',
        position: kw.ranked_serp_element?.serp_item?.rank_absolute || null,
        searchVolume: kw.keyword_data?.keyword_info?.search_volume || 0,
        cpc: kw.keyword_data?.keyword_info?.cpc || 0,
        competition: kw.keyword_data?.keyword_info?.competition || null,
        trafficValue: kw.ranked_serp_element?.serp_item?.etv || 0,
        url: kw.ranked_serp_element?.serp_item?.url || '',
        title: kw.ranked_serp_element?.serp_item?.title || ''
      })),

      // Competitors
      competitors: competitorData.map(comp => ({
        domain: comp.domain,
        avgPosition: comp.avg_position || null,
        medianPosition: comp.median_position || null,
        commonKeywords: comp.intersections || 0,
        keywordGap: comp.full_domain_metrics?.organic?.count || 0
      })),

      // Calculated metrics
      metrics: metrics
    };

  } catch (error) {
    console.error('DataForSEO error:', error);
    throw new Error(`Failed to get keyword data: ${error.message}`);
  }
}

/**
 * Get keyword suggestions and opportunities
 * @param {string} domain - Domain to analyze
 * @param {string} industry - Industry/niche (e.g., "marketing agency")
 * @returns {array} Keyword opportunities
 */
export async function getKeywordOpportunities(domain, industry = null) {
  try {
    // If no industry provided, use domain name as seed
    const seed = industry || domain.split('.')[0];

    const suggestions = await dataforSEORequest('/v3/dataforseo_labs/google/keyword_suggestions/live', [{
      keyword: seed,
      language_name: 'English',
      location_code: 2840,
      limit: 50,
      include_seed_keyword: true,
      filters: [
        ['keyword_data.keyword_info.search_volume', '>', 100]
      ],
      order_by: ['keyword_data.keyword_info.search_volume,desc']
    }]);

    const opportunities = suggestions?.tasks?.[0]?.result?.[0]?.items || [];

    return opportunities.map(kw => ({
      keyword: kw.keyword,
      searchVolume: kw.keyword_data?.keyword_info?.search_volume || 0,
      cpc: kw.keyword_data?.keyword_info?.cpc || 0,
      competition: kw.keyword_data?.keyword_info?.competition || null,
      difficulty: calculateKeywordDifficulty(kw.keyword_data?.keyword_info)
    }));

  } catch (error) {
    console.error('Keyword opportunities error:', error);
    return [];
  }
}

/**
 * Calculate SEO metrics from keyword data
 */
function calculateMetrics(rankedKeywords, overviewData) {
  if (!rankedKeywords || rankedKeywords.length === 0) {
    return {
      totalKeywords: 0,
      avgPosition: 0,
      top3Keywords: 0,
      top10Keywords: 0,
      top20Keywords: 0,
      top50Keywords: 0,
      estimatedTraffic: 0,
      trafficValue: 0
    };
  }

  const positions = rankedKeywords
    .map(kw => kw.ranked_serp_element?.serp_item?.rank_absolute)
    .filter(pos => pos !== null && pos !== undefined);

  const avgPosition = positions.length > 0
    ? positions.reduce((a, b) => a + b, 0) / positions.length
    : 0;

  const top3 = rankedKeywords.filter(kw =>
    kw.ranked_serp_element?.serp_item?.rank_absolute <= 3
  ).length;

  const top10 = rankedKeywords.filter(kw =>
    kw.ranked_serp_element?.serp_item?.rank_absolute <= 10
  ).length;

  const top20 = rankedKeywords.filter(kw =>
    kw.ranked_serp_element?.serp_item?.rank_absolute <= 20
  ).length;

  const top50 = rankedKeywords.filter(kw =>
    kw.ranked_serp_element?.serp_item?.rank_absolute <= 50
  ).length;

  const estimatedTraffic = overviewData?.metrics?.organic?.etv || 0;
  const trafficValue = overviewData?.metrics?.organic?.cost || 0;

  return {
    totalKeywords: rankedKeywords.length,
    avgPosition: Math.round(avgPosition * 10) / 10,
    top3Keywords: top3,
    top10Keywords: top10,
    top20Keywords: top20,
    top50Keywords: top50,
    estimatedTraffic: Math.round(estimatedTraffic),
    trafficValue: Math.round(trafficValue)
  };
}

/**
 * Calculate keyword difficulty (0-100, higher is harder)
 */
function calculateKeywordDifficulty(keywordInfo) {
  if (!keywordInfo) return 50;

  const competition = keywordInfo.competition || 0.5;
  const cpc = keywordInfo.cpc || 0;

  // Simple heuristic: high competition + high CPC = difficult
  const difficulty = (competition * 60) + (Math.min(cpc / 10, 1) * 40);

  return Math.round(difficulty);
}

/**
 * Make authenticated request to DataForSEO API
 */
async function dataforSEORequest(path, data) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${DATAFORSEO_USERNAME}:${DATAFORSEO_PASSWORD}`).toString('base64');

    const postData = JSON.stringify(data);

    const options = {
      hostname: 'api.dataforseo.com',
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000 // 30 second timeout
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(body);

          // Check for API errors
          if (response.status_code !== 20000) {
            reject(new Error(`DataForSEO API error: ${response.status_message}`));
            return;
          }

          resolve(response);
        } catch (e) {
          reject(new Error(`Failed to parse DataForSEO response: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`DataForSEO request failed: ${e.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('DataForSEO request timed out'));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Format keyword data for display
 */
export function formatKeywordData(keywordData) {
  if (!keywordData || !keywordData.rankedKeywords) {
    return {
      summary: 'No keyword data available',
      topKeywords: [],
      metrics: {}
    };
  }

  const { rankedKeywords, metrics, competitors } = keywordData;

  return {
    summary: `Ranking for ${metrics.totalKeywords} keywords with average position #${metrics.avgPosition}`,

    topKeywords: rankedKeywords
      .filter(kw => kw.position && kw.position <= 50)
      .slice(0, 10)
      .map(kw => `"${kw.keyword}" - #${kw.position} (${kw.searchVolume}/mo)`),

    metrics: {
      'Total Keywords': metrics.totalKeywords,
      'Average Position': `#${metrics.avgPosition}`,
      'Top 3 Rankings': metrics.top3Keywords,
      'Top 10 Rankings': metrics.top10Keywords,
      'Estimated Traffic': `${metrics.estimatedTraffic} visits/mo`,
      'Traffic Value': `$${metrics.trafficValue}/mo`
    },

    competitors: competitors.slice(0, 5).map(comp =>
      `${comp.domain} (${comp.commonKeywords} common keywords)`
    )
  };
}
