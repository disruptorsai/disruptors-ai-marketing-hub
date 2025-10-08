/**
 * Vercel API Route: DataForSEO Keyword Research
 * Securely fetches keyword data from DataForSEO API
 */

export default async function handler(request, response) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { searchTerm, location, language } = request.body;

    if (!searchTerm) {
      return response.status(400).json({ error: 'Search term is required' });
    }

    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;

    if (!login || !password) {
      return response.status(500).json({ error: 'DataForSEO credentials not configured' });
    }

    // Call DataForSEO API
    const apiResponse = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        keywords: [searchTerm],
        location_code: parseInt(location || 2840),
        language_code: language || 'en',
        include_seed_keyword: true,
        include_serp_info: true,
        sort_by: 'search_volume',
        date_from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        date_to: new Date().toISOString().split('T')[0]
      }])
    });

    if (!apiResponse.ok) {
      throw new Error(`DataForSEO API error: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    if (data.status_code !== 20000) {
      throw new Error(data.status_message || 'API request failed');
    }

    const results = data.tasks?.[0]?.result?.[0]?.items || [];

    // Format results
    const formattedKeywords = results.slice(0, 50).map(item => {
      const volume = item.search_volume || 0;
      const competition = item.competition || 0;
      const cpc = item.cpc || 0;

      // Calculate difficulty (0-100) based on competition and CPC
      const difficulty = Math.min(100, Math.round((competition * 100 + (cpc * 2))));

      // Calculate opportunity score (high volume + low difficulty = high score)
      const volumeScore = Math.min(100, (volume / 1000) * 10);
      const difficultyPenalty = difficulty;
      const opportunityScore = Math.max(0, Math.min(100, volumeScore - (difficultyPenalty / 2)));

      // Get trend data if available
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

    return response.status(200).json({
      success: true,
      keywords: formattedKeywords,
      count: formattedKeywords.length
    });

  } catch (error) {
    console.error('DataForSEO function error:', error);
    return response.status(500).json({
      success: false,
      error: error.message
    });
  }
}
