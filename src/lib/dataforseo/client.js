/**
 * DataForSEO API Client
 *
 * Comprehensive integration with DataForSEO's API ecosystem
 * Supports 15+ endpoints for keyword research, SERP tracking, and competitive analysis
 *
 * @see https://docs.dataforseo.com/v3/
 */

const DATAFORSEO_BASE_URL = 'https://api.dataforseo.com';

/**
 * DataForSEO Client Class
 * Handles authentication, rate limiting, and error handling for all API requests
 */
export class DataForSEOClient {
  constructor(config = {}) {
    this.login = config.login || import.meta.env.VITE_DATAFORSEO_LOGIN;
    this.password = config.password || import.meta.env.VITE_DATAFORSEO_PASSWORD;
    this.baseURL = config.baseURL || DATAFORSEO_BASE_URL;

    if (!this.login || !this.password) {
      throw new Error('DataForSEO credentials not configured. Set VITE_DATAFORSEO_LOGIN and VITE_DATAFORSEO_PASSWORD');
    }

    // Rate limiting
    this.requestQueue = [];
    this.maxConcurrent = 10;
    this.activeRequests = 0;

    // Cost tracking
    this.totalCost = 0;
    this.requestCount = 0;
  }

  /**
   * Make authenticated request to DataForSEO API
   * @private
   */
  async request(endpoint, payload, options = {}) {
    const authString = btoa(`${this.login}:${this.password}`);

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DataForSEO API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // Track costs
    if (data.tasks && data.tasks[0]) {
      const task = data.tasks[0];
      if (task.cost) {
        this.totalCost += task.cost;
      }
    }

    this.requestCount++;

    // Handle DataForSEO response format
    if (data.status_code !== 20000) {
      throw new Error(`DataForSEO Error: ${data.status_message}`);
    }

    return data;
  }

  /**
   * Execute request with rate limiting
   * @private
   */
  async executeWithRateLimit(fn) {
    // Wait if too many concurrent requests
    while (this.activeRequests >= this.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.activeRequests++;

    try {
      const result = await fn();
      return result;
    } finally {
      this.activeRequests--;
    }
  }

  // ============================================================================
  // KEYWORD DISCOVERY APIs
  // ============================================================================

  /**
   * Get keyword suggestions (question-based longtail keywords)
   *
   * @param {string} keyword - Seed keyword
   * @param {number} location - Location code (2840 = US)
   * @param {Array} filters - Optional filters (e.g., ["keyword", "like", "%how%"])
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Keyword suggestions data
   *
   * @example
   * const suggestions = await client.keywordSuggestions('marketing tools', 2840, ["keyword", "like", "%how%"]);
   */
  async keywordSuggestions(keyword, location = 2840, filters = null, options = {}) {
    return this.executeWithRateLimit(async () => {
      const payload = [{
        keyword,
        location_code: location,
        language_name: options.language || 'English',
        filters: filters || ["keyword", "like", "%how%"],
        limit: options.limit || 500,
        offset: options.offset || 0,
        include_seed_keyword: options.includeSeed !== false,
        include_serp_info: options.includeSerpInfo !== false
      }];

      return this.request('/v3/dataforseo_labs/google/keyword_suggestions/live', payload);
    });
  }

  /**
   * Get keyword ideas (broad expansion from seed list)
   *
   * @param {Array<string>|string} keywords - Seed keyword(s) (up to 200)
   * @param {number} location - Location code
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Keyword ideas data
   *
   * @example
   * const ideas = await client.keywordIdeas(['seo', 'marketing', 'tools'], 2840);
   */
  async keywordIdeas(keywords, location = 2840, options = {}) {
    return this.executeWithRateLimit(async () => {
      const keywordArray = Array.isArray(keywords) ? keywords : [keywords];

      const payload = [{
        keywords: keywordArray,
        location_code: location,
        language_code: options.language || 'en',
        limit: options.limit || 1000,
        offset: options.offset || 0,
        filters: options.filters,
        order_by: options.orderBy || ['search_volume,desc'],
        include_seed_keyword: options.includeSeed !== false
      }];

      return this.request('/v3/dataforseo_labs/google/keyword_ideas/live', payload);
    });
  }

  /**
   * Get keywords for a specific site (reverse-engineer competitor keywords)
   *
   * @param {string} domain - Target domain (e.g., 'competitor.com')
   * @param {number} location - Location code
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Keywords the site ranks for
   *
   * @example
   * const siteKeywords = await client.keywordsForSite('competitor.com', 2840);
   */
  async keywordsForSite(domain, location = 2840, options = {}) {
    return this.executeWithRateLimit(async () => {
      const payload = [{
        target: domain,
        location_code: location,
        language_name: options.language || 'English',
        limit: options.limit || 1000,
        offset: options.offset || 0,
        filters: options.filters,
        order_by: options.orderBy || ['search_volume,desc']
      }];

      return this.request('/v3/dataforseo_labs/google/keywords_for_site/live', payload);
    });
  }

  /**
   * Get related keywords (graph expansion)
   *
   * @param {string} keyword - Seed keyword
   * @param {number} depth - Expansion depth (1-3)
   * @param {number} location - Location code
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Related keywords data
   *
   * @example
   * const related = await client.relatedKeywords('seo tools', 2, 2840);
   */
  async relatedKeywords(keyword, depth = 1, location = 2840, options = {}) {
    return this.executeWithRateLimit(async () => {
      const payload = [{
        keyword,
        depth: Math.min(Math.max(depth, 1), 3), // Clamp to 1-3
        location_code: location,
        language_code: options.language || 'en',
        limit: options.limit || 500,
        offset: options.offset || 0,
        filters: options.filters
      }];

      return this.request('/v3/dataforseo_labs/google/related_keywords/live', payload);
    });
  }

  /**
   * Get top searches in a location
   *
   * @param {number} location - Location code
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Top searches data
   */
  async topSearches(location = 2840, options = {}) {
    return this.executeWithRateLimit(async () => {
      const payload = [{
        location_code: location,
        language_code: options.language || 'en',
        limit: options.limit || 100,
        offset_token: options.offsetToken
      }];

      return this.request('/v3/dataforseo_labs/google/top_searches/live', payload);
    });
  }

  // ============================================================================
  // METRICS & ANALYSIS APIs
  // ============================================================================

  /**
   * Get comprehensive keyword metrics
   *
   * @param {Array<string>|string} keywords - Keywords to analyze
   * @param {number} location - Location code
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Keyword metrics (volume, CPC, competition, intent)
   *
   * @example
   * const metrics = await client.keywordOverview(['seo tools', 'marketing software'], 2840);
   */
  async keywordOverview(keywords, location = 2840, options = {}) {
    return this.executeWithRateLimit(async () => {
      const keywordArray = Array.isArray(keywords) ? keywords : [keywords];

      const payload = [{
        keywords: keywordArray,
        location_code: location,
        language_code: options.language || 'en',
        include_serp_info: options.includeSerpInfo !== false,
        include_clickstream_data: options.includeClickstream !== false
      }];

      return this.request('/v3/dataforseo_labs/google/keyword_overview/live', payload);
    });
  }

  /**
   * Get historical keyword search volume data
   *
   * @param {Array<string>|string} keywords - Keywords to analyze
   * @param {number} location - Location code
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Multi-year search volume history
   *
   * @example
   * const history = await client.historicalKeywordData(['ai tools'], 2840);
   */
  async historicalKeywordData(keywords, location = 2840, options = {}) {
    return this.executeWithRateLimit(async () => {
      const keywordArray = Array.isArray(keywords) ? keywords : [keywords];

      const payload = [{
        keywords: keywordArray,
        location_code: location,
        language_code: options.language || 'en',
        date_from: options.dateFrom, // Format: YYYY-MM
        date_to: options.dateTo
      }];

      return this.request('/v3/dataforseo_labs/google/historical_search_volume/live', payload);
    });
  }

  /**
   * Get keyword ranking difficulty scores
   *
   * @param {Array<string>|string} keywords - Keywords to analyze
   * @param {number} location - Location code
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Difficulty scores (0-100)
   *
   * @example
   * const difficulty = await client.bulkKeywordDifficulty(['competitive keyword'], 2840);
   */
  async bulkKeywordDifficulty(keywords, location = 2840, options = {}) {
    return this.executeWithRateLimit(async () => {
      const keywordArray = Array.isArray(keywords) ? keywords : [keywords];

      const payload = [{
        keywords: keywordArray,
        location_code: location,
        language_name: options.language || 'English'
      }];

      return this.request('/v3/dataforseo_labs/google/bulk_keyword_difficulty/live', payload);
    });
  }

  /**
   * Get ranked keywords for a domain
   *
   * @param {string} target - Domain or URL
   * @param {number} location - Location code
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Keywords the target ranks for with positions
   *
   * @example
   * const ranked = await client.rankedKeywords('mysite.com', 2840);
   */
  async rankedKeywords(target, location = 2840, options = {}) {
    return this.executeWithRateLimit(async () => {
      const payload = [{
        target,
        location_code: location,
        language_code: options.language || 'en',
        limit: options.limit || 1000,
        offset: options.offset || 0,
        filters: options.filters,
        order_by: options.orderBy || ['search_volume,desc'],
        item_types: options.itemTypes // Filter by SERP feature types
      }];

      return this.request('/v3/dataforseo_labs/google/ranked_keywords/live', payload);
    });
  }

  // ============================================================================
  // SERP ANALYSIS APIs
  // ============================================================================

  /**
   * Get live SERP results with advanced features
   *
   * @param {string} keyword - Keyword to check SERP for
   * @param {number} location - Location code
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Complete top-100 SERP data with features
   *
   * @example
   * const serp = await client.serpLive('best seo tools', 2840);
   */
  async serpLive(keyword, location = 2840, options = {}) {
    return this.executeWithRateLimit(async () => {
      const payload = [{
        keyword,
        location_code: location,
        language_name: options.language || 'English',
        device: options.device || 'desktop', // 'desktop' or 'mobile'
        os: options.os, // 'windows', 'macos', etc.
        depth: options.depth || 100, // Number of results to return
        max_crawl_pages: options.maxCrawlPages
      }];

      return this.request('/v3/serp/google/organic/live/advanced', payload);
    });
  }

  // ============================================================================
  // TRENDS APIs
  // ============================================================================

  /**
   * Get keyword trend data over time
   *
   * @param {Array<string>|string} keywords - Keywords to analyze trends for
   * @param {number} location - Location code
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Time-series trend data
   *
   * @example
   * const trends = await client.trendsExplore(['ai marketing'], 2840);
   */
  async trendsExplore(keywords, location = 2840, options = {}) {
    return this.executeWithRateLimit(async () => {
      const keywordArray = Array.isArray(keywords) ? keywords : [keywords];

      const payload = [{
        keywords: keywordArray.map(kw => ({ keyword: kw })),
        location_code: location,
        language_code: options.language || 'en',
        type: options.type || 'web_search', // 'web_search', 'news_search', etc.
        date_from: options.dateFrom, // Format: YYYY-MM-DD
        date_to: options.dateTo,
        time_range: options.timeRange // 'past_hour', 'past_4_hours', etc.
      }];

      return this.request('/v3/dataforseo_trends/google/explore/live', payload);
    });
  }

  /**
   * Get geographic distribution of keyword interest
   *
   * @param {string} keyword - Keyword to analyze
   * @param {number} location - Location code
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Geographic heat map data
   *
   * @example
   * const geoInterest = await client.subregionInterests('pizza delivery', 2840);
   */
  async subregionInterests(keyword, location = 2840, options = {}) {
    return this.executeWithRateLimit(async () => {
      const payload = [{
        keyword,
        location_code: location,
        language_code: options.language || 'en',
        type: options.type || 'web_search',
        date_from: options.dateFrom,
        date_to: options.dateTo
      }];

      return this.request('/v3/dataforseo_trends/google/subregion_interests/live', payload);
    });
  }

  // ============================================================================
  // CONTENT GENERATION APIs (Optional)
  // ============================================================================

  /**
   * Generate text content using DataForSEO AI
   *
   * @param {string} prompt - Content generation prompt
   * @param {string} targetLength - 'short', 'medium', 'long'
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Generated text content
   */
  async generateText(prompt, targetLength = 'medium', options = {}) {
    return this.executeWithRateLimit(async () => {
      const payload = [{
        prompt,
        target_length: targetLength,
        creativity: options.creativity || 0.7, // 0-1
        supplement_token: options.supplementToken
      }];

      return this.request('/v3/content_generation/generate_text/live', payload);
    });
  }

  /**
   * Generate SEO meta tags from content
   *
   * @param {string} content - Page content
   * @param {string} keyword - Target keyword
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Generated meta title and description
   */
  async generateMetaTags(content, keyword, options = {}) {
    return this.executeWithRateLimit(async () => {
      const payload = [{
        content,
        keyword,
        creativity: options.creativity || 0.5
      }];

      return this.request('/v3/content_generation/generate_meta_tags/live', payload);
    });
  }

  /**
   * Generate subtopics for content outlines
   *
   * @param {string} topic - Main topic
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Generated subtopics
   */
  async generateSubtopics(topic, options = {}) {
    return this.executeWithRateLimit(async () => {
      const payload = [{
        topic,
        creativity: options.creativity || 0.7,
        supplement_token: options.supplementToken
      }];

      return this.request('/v3/content_generation/generate_sub_topics/live', payload);
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get cost and request statistics
   * @returns {Object} Cost and usage stats
   */
  getStats() {
    return {
      totalCost: this.totalCost,
      requestCount: this.requestCount,
      averageCostPerRequest: this.requestCount > 0 ? this.totalCost / this.requestCount : 0,
      activeRequests: this.activeRequests
    };
  }

  /**
   * Reset cost tracking
   */
  resetStats() {
    this.totalCost = 0;
    this.requestCount = 0;
  }

  /**
   * Parse DataForSEO response to extract task results
   * @param {Object} response - Raw DataForSEO API response
   * @returns {Array} Results array
   */
  static parseResults(response) {
    if (!response.tasks || response.tasks.length === 0) {
      return [];
    }

    const task = response.tasks[0];

    if (task.status_code !== 20000) {
      throw new Error(`Task error: ${task.status_message}`);
    }

    return task.result || [];
  }

  /**
   * Extract keywords from DataForSEO response with standardized format
   * @param {Object} response - Raw DataForSEO API response
   * @returns {Array} Standardized keyword objects
   */
  static extractKeywords(response) {
    const results = DataForSEOClient.parseResults(response);

    return results.flatMap(result => {
      const items = result.items || [];

      return items.map(item => ({
        keyword: item.keyword,
        search_volume: item.keyword_info?.search_volume || item.search_volume || 0,
        cpc: item.keyword_info?.cpc || item.cpc || 0,
        competition: item.keyword_info?.competition || item.competition || 0,
        competition_level: item.keyword_info?.competition_level || item.competition_level || 'Unknown',
        keyword_difficulty: item.keyword_properties?.keyword_difficulty || item.keyword_difficulty || null,
        search_intent: item.search_intent_info?.main_intent || null,
        monthly_searches: item.keyword_info?.monthly_searches || item.monthly_searches || null,
        trend: item.impressions_info?.se_results_count_change || null,
        serp_features: item.ranked_serp_element?.serp_item?.types || [],
        raw_data: item // Keep original for reference
      }));
    });
  }
}

/**
 * Create a singleton instance
 */
let instance = null;

export function getDataForSEOClient(config) {
  if (!instance) {
    instance = new DataForSEOClient(config);
  }
  return instance;
}

export default DataForSEOClient;
