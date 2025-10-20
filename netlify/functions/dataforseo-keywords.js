/**
 * Netlify Function: DataForSEO Keyword Research
 * Securely fetches keyword data from DataForSEO API
 * Supports: basic keyword research, trending keywords
 */

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const requestBody = JSON.parse(event.body);
    const { action, searchTerm, industry, location, language, minVolume, maxDifficulty, count } = requestBody;

    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;

    if (!login || !password) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'DataForSEO credentials not configured' })
      };
    }

    // Handle different actions
    if (action === 'trending_keywords') {
      return await fetchTrendingKeywords({
        login,
        password,
        industry: industry || 'marketing',
        location: location || 'United States',
        minVolume: minVolume || 100,
        maxDifficulty: maxDifficulty || 50,
        count: count || 20
      });
    } else {
      // Default: keyword research for a search term
      if (!searchTerm) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Search term is required' })
        };
      }

      return await fetchKeywordResearch({
        login,
        password,
        searchTerm,
        location: location || 2840,
        language: language || 'en'
      });
    }

  } catch (error) {
    console.error('DataForSEO function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

/**
 * Fetch trending keywords based on industry/topic
 */
async function fetchTrendingKeywords({ login, password, industry, location, minVolume, maxDifficulty, count }) {
  try {
    // Get location code from location name
    const locationCode = getLocationCode(location);

    // Call DataForSEO Trends API (Google Trends for SERP)
    const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        keywords: generateIndustryKeywords(industry),
        location_code: locationCode,
        language_code: 'en',
        search_partners: false,
        date_from: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
        date_to: new Date().toISOString().split('T')[0],
        sort_by: 'search_volume'
      }])
    });

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status_code !== 20000) {
      throw new Error(data.status_message || 'API request failed');
    }

    const results = data.tasks?.[0]?.result || [];

    // Process and filter results
    let keywords = results
      .filter(item => {
        const volume = item.search_volume || 0;
        const competition = item.competition || 0;
        const difficulty = Math.min(100, Math.round((competition * 100)));

        return volume >= minVolume && difficulty <= maxDifficulty;
      })
      .slice(0, count)
      .map(item => {
        const volume = item.search_volume || 0;
        const competition = item.competition || 0;
        const cpc = item.cpc || 0;
        const difficulty = Math.min(100, Math.round((competition * 100)));

        // Calculate opportunity score
        const volumeScore = Math.min(100, (volume / 1000) * 10);
        const opportunityScore = Math.max(0, Math.min(100, volumeScore - (difficulty / 2)));

        // Determine trend from monthly data
        const monthlySearches = item.monthly_searches || [];
        let trend = 0;
        if (monthlySearches.length >= 3) {
          const recent = monthlySearches.slice(0, 3);
          const avg = recent.reduce((sum, m) => sum + (m.search_volume || 0), 0) / 3;
          const oldest = monthlySearches[monthlySearches.length - 1]?.search_volume || 0;
          trend = oldest > 0 ? ((avg - oldest) / oldest * 100).toFixed(1) : 0;
        }

        return {
          keyword: item.keyword,
          search_volume: volume,
          competition: competition,
          competition_level: competition < 0.33 ? 'Low' : competition < 0.66 ? 'Medium' : 'High',
          cpc: parseFloat(cpc).toFixed(2),
          difficulty: difficulty,
          trend: parseFloat(trend),
          opportunity_score: Math.round(opportunityScore),
          monthly_searches: monthlySearches.slice(0, 12)
        };
      });

    // Sort by opportunity score
    keywords.sort((a, b) => b.opportunity_score - a.opportunity_score);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        keywords: keywords,
        count: keywords.length
      })
    };

  } catch (error) {
    throw error;
  }
}

/**
 * Basic keyword research for a search term
 */
async function fetchKeywordResearch({ login, password, searchTerm, location, language }) {
  const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      keywords: [searchTerm],
      location_code: parseInt(location),
      language_code: language,
      include_seed_keyword: true,
      include_serp_info: true,
      sort_by: 'search_volume',
      date_from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      date_to: new Date().toISOString().split('T')[0]
    }])
  });

  if (!response.ok) {
    throw new Error(`DataForSEO API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.status_code !== 20000) {
    throw new Error(data.status_message || 'API request failed');
  }

  const results = data.tasks?.[0]?.result?.[0]?.items || [];

  // Format results
  const formattedKeywords = results.slice(0, 50).map(item => {
    const volume = item.search_volume || 0;
    const competition = item.competition || 0;
    const cpc = item.cpc || 0;
    const difficulty = Math.min(100, Math.round((competition * 100 + (cpc * 2))));
    const volumeScore = Math.min(100, (volume / 1000) * 10);
    const opportunityScore = Math.max(0, Math.min(100, volumeScore - (difficulty / 2)));

    const monthlySearches = item.monthly_searches || [];
    const trend = monthlySearches.length >= 2 &&
                 monthlySearches[0]?.search_volume > monthlySearches[1]?.search_volume
                 ? 0.5 : -0.3;

    return {
      keyword: item.keyword,
      search_volume: volume,
      competition: competition,
      competition_level: competition < 0.33 ? 'Low' : competition < 0.66 ? 'Medium' : 'High',
      cpc: cpc.toFixed(2),
      difficulty: difficulty,
      trend: trend.toFixed(2),
      opportunity_score: Math.round(opportunityScore)
    };
  });

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: true,
      keywords: formattedKeywords,
      count: formattedKeywords.length
    })
  };
}

/**
 * Generate seed keywords for an industry
 */
function generateIndustryKeywords(industry) {
  const baseKeywords = {
    'AI marketing': [
      'AI marketing tools',
      'artificial intelligence marketing',
      'AI content marketing',
      'marketing automation AI',
      'AI for social media',
      'AI email marketing',
      'AI marketing software',
      'AI digital marketing',
      'machine learning marketing',
      'AI SEO tools'
    ],
    'marketing': [
      'digital marketing',
      'content marketing',
      'social media marketing',
      'email marketing',
      'SEO marketing',
      'marketing automation',
      'inbound marketing',
      'marketing strategy',
      'marketing tools',
      'online marketing'
    ],
    'SEO': [
      'SEO tools',
      'SEO services',
      'local SEO',
      'SEO optimization',
      'SEO keywords',
      'SEO ranking',
      'SEO strategy',
      'on-page SEO',
      'technical SEO',
      'SEO agency'
    ],
    'default': [
      industry,
      `${industry} tips`,
      `${industry} tools`,
      `${industry} software`,
      `${industry} services`,
      `${industry} guide`,
      `best ${industry}`,
      `${industry} strategy`,
      `${industry} solutions`,
      `${industry} business`
    ]
  };

  return baseKeywords[industry] || baseKeywords['default'];
}

/**
 * Get DataForSEO location code from location name
 */
function getLocationCode(location) {
  const locationCodes = {
    'United States': 2840,
    'United Kingdom': 2826,
    'Canada': 2124,
    'Australia': 2036,
    'Germany': 2276,
    'France': 2250,
    'India': 2356,
    'Japan': 2392,
    'China': 2156,
    'Brazil': 2076,
    'Mexico': 2484,
    'Spain': 2724,
    'Italy': 2380,
    'Netherlands': 2528,
    'Sweden': 2752,
    'Norway': 2578,
    'Denmark': 2208,
    'Finland': 2246,
    'Ireland': 2372,
    'New Zealand': 2554,
    'Singapore': 2702,
    'South Africa': 2710,
    'South Korea': 2410,
    'Switzerland': 2756,
    'Belgium': 2056,
    'Austria': 2040,
    'Poland': 2616,
    'Portugal': 2620
  };

  return locationCodes[location] || 2840; // Default to US
}
