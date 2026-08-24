/**
 * DataForSEO Unified API Client
 *
 * Handles authentication and requests for all DataForSEO services:
 * - Keywords Data API - Keyword research with search volume, difficulty, CPC
 * - SERP API - Real-time search results and SERP features
 * - Backlinks API - Backlink profiles and domain authority
 * - On-Page API - Technical SEO crawling (replacement for Firecrawl)
 * - Domain Analytics API - Domain metrics and traffic estimates
 * - DataForSEO Labs API - Pre-processed datasets (competitors, ranked keywords)
 * - Content Analysis API - Content quality scoring
 *
 * @see https://dataforseo.com/apis
 * @see docs/DATAFORSEO_STRATEGIC_INTEGRATION_ROADMAP.md
 */

const DATAFORSEO_BASE = 'https://api.dataforseo.com/v3';

class DataForSEOClient {
  constructor() {
    // Support both old and new environment variable names
    this.username = import.meta.env.DATAFORSEO_LOGIN ||
                   import.meta.env.VITE_DATAFORSEO_LOGIN ||
                   import.meta.env.VITE_DATAFORSEO_USERNAME;
    this.password = import.meta.env.DATAFORSEO_PASSWORD ||
                   import.meta.env.VITE_DATAFORSEO_PASSWORD;

    if (!this.username || !this.password) {
      console.warn('[DataForSEO] Credentials not configured. Features will be limited.');
    }
  }

  /**
   * Make authenticated request to DataForSEO API
   * @param {string} endpoint - API endpoint
   * @param {Array} data - Request data array
   * @returns {Promise<Array>} API response
   */
  async request(endpoint, data = []) {
    const credentials = btoa(`${this.username}:${this.password}`);

    try {
      const response = await fetch(`${DATAFORSEO_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`DataForSEO HTTP Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      // Check API response status
      if (result.status_code !== 20000) {
        throw new Error(`DataForSEO API Error: ${result.status_message || 'Unknown error'}`);
      }

      // Return results from first task (most common pattern)
      return result.tasks?.[0]?.result || [];
    } catch (error) {
      console.error('[DataForSEO] API Error:', error);
      throw error;
    }
  }

  // ============================================================================
  // LEGACY KEYWORD RESEARCH METHODS (Preserved for backward compatibility)
  // ============================================================================

  /**
   * Make authenticated request (legacy method name)
   * @deprecated Use request() instead
   */
  async makeRequest(endpoint, method = 'POST', data = null) {
    // Wrap old format to new format
    if (method !== 'POST') {
      throw new Error('Only POST requests are supported');
    }
    return await this.request(endpoint, data || []);
  }

  /**
   * Get keyword ideas and search volume data
   * @param {string} keyword - Seed keyword to research
   * @param {string} location - Location code (default: US)
   * @param {string} language - Language code (default: English)
   */
  async getKeywordIdeas(keyword, location = 2840, language = 'en') {
    const endpoint = '/keywords_data/google_ads/search_volume/live';

    const requestData = [{
      keywords: [keyword],
      location_code: location,
      language_code: language,
      search_partners: false,
      date_from: new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString().split('T')[0],
      date_to: new Date().toISOString().split('T')[0]
    }];

    return await this.makeRequest(endpoint, 'POST', requestData);
  }

  /**
   * Get keyword suggestions based on seed keyword
   * @param {string} keyword - Seed keyword
   * @param {number} limit - Number of suggestions (default: 100)
   */
  async getKeywordSuggestions(keyword, location = 2840, language = 'en', limit = 100) {
    const endpoint = '/keywords_data/google_ads/keywords_for_keywords/live';

    const requestData = [{
      keywords: [keyword],
      location_code: location,
      language_code: language,
      search_partners: false,
      sort_by: 'search_volume',
      limit: limit
    }];

    const result = await this.makeRequest(endpoint, 'POST', requestData);

    // Format results for easier consumption
    if (result && result[0] && result[0].items) {
      return result[0].items.map(item => ({
        keyword: item.keyword,
        searchVolume: item.search_volume || 0,
        competition: item.competition || 0,
        competitionLevel: this.getCompetitionLevel(item.competition),
        cpc: item.cpc || 0,
        lowTopBid: item.low_top_of_page_bid || 0,
        highTopBid: item.high_top_of_page_bid || 0,
        monthlySearches: item.monthly_searches || [],
        trend: this.calculateTrend(item.monthly_searches || [])
      }));
    }

    return [];
  }

  /**
   * Get related keywords with detailed metrics
   * @param {string} keyword - Target keyword
   */
  async getRelatedKeywords(keyword, location = 2840, language = 'en') {
    const endpoint = '/keywords_data/google_ads/keywords_for_site/live';

    const requestData = [{
      target: keyword,
      location_code: location,
      language_code: language,
      search_partners: false,
      sort_by: 'relevance'
    }];

    const result = await this.makeRequest(endpoint, 'POST', requestData);

    if (result && result[0] && result[0].items) {
      return result[0].items.map(item => ({
        keyword: item.keyword,
        searchVolume: item.search_volume || 0,
        competition: item.competition || 0,
        competitionLevel: this.getCompetitionLevel(item.competition),
        cpc: item.cpc || 0,
        relevance: item.relevance || 0
      }));
    }

    return [];
  }

  /**
   * Get keyword difficulty and SERP data
   * @param {string[]} keywords - Array of keywords to analyze
   */
  async getKeywordDifficulty(keywords, location = 2840, language = 'en') {
    const endpoint = '/dataforseo_labs/google/keyword_ideas/live';

    const requestData = [{
      keywords: keywords,
      location_code: location,
      language_code: language,
      include_seed_keyword: true,
      include_serp_info: true
    }];

    const result = await this.makeRequest(endpoint, 'POST', requestData);

    if (result && result[0] && result[0].items) {
      return result[0].items.map(item => ({
        keyword: item.keyword,
        searchVolume: item.keyword_info?.search_volume || 0,
        difficulty: item.keyword_properties?.keyword_difficulty || 0,
        cpc: item.keyword_info?.cpc || 0,
        competition: item.keyword_info?.competition || 0,
        serpInfo: {
          paidResults: item.serp_info?.paid_results || 0,
          organicResults: item.serp_info?.organic_results || 0,
          featuredSnippet: item.serp_info?.featured_snippet || false
        },
        impressions: item.impressions_info?.monthly_impressions || 0
      }));
    }

    return [];
  }

  /**
   * Batch keyword research - combines multiple API calls
   * @param {string} seedKeyword - Starting keyword
   * @param {number} limit - Number of suggestions to return
   */
  async comprehensiveKeywordResearch(seedKeyword, limit = 50) {
    try {
      // Get keyword suggestions
      const suggestions = await this.getKeywordSuggestions(seedKeyword, 2840, 'en', limit);

      // Sort by search volume and competition score
      const sortedKeywords = suggestions
        .sort((a, b) => {
          const scoreA = this.calculateKeywordScore(a);
          const scoreB = this.calculateKeywordScore(b);
          return scoreB - scoreA;
        })
        .slice(0, limit);

      return {
        seedKeyword,
        totalResults: suggestions.length,
        keywords: sortedKeywords,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Comprehensive keyword research error:', error);
      throw error;
    }
  }

  /**
   * Calculate keyword opportunity score
   * Higher score = better opportunity (high volume, low competition)
   */
  calculateKeywordScore(keyword) {
    const volumeScore = Math.log10(keyword.searchVolume + 1) * 10;
    const competitionPenalty = keyword.competition * 20;
    const trendBonus = keyword.trend === 'rising' ? 10 : 0;

    return volumeScore - competitionPenalty + trendBonus;
  }

  /**
   * Get competition level label
   */
  getCompetitionLevel(competition) {
    if (competition < 0.33) return 'Low';
    if (competition < 0.66) return 'Medium';
    return 'High';
  }

  /**
   * Calculate trend from monthly searches
   */
  calculateTrend(monthlySearches) {
    if (!monthlySearches || monthlySearches.length < 3) return 'stable';

    const recent = monthlySearches.slice(-3);
    const older = monthlySearches.slice(0, 3);

    const recentAvg = recent.reduce((sum, m) => sum + (m.search_volume || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + (m.search_volume || 0), 0) / older.length;

    if (recentAvg > olderAvg * 1.2) return 'rising';
    if (recentAvg < olderAvg * 0.8) return 'falling';
    return 'stable';
  }

  /**
   * Format keyword data for UI display
   */
  formatKeywordForUI(keyword) {
    return {
      keyword: keyword.keyword,
      volume: keyword.searchVolume?.toLocaleString() || '0',
      difficulty: keyword.competition ? Math.round(keyword.competition * 100) : 0,
      difficultyLabel: keyword.competitionLevel || this.getCompetitionLevel(keyword.competition || 0),
      cpc: keyword.cpc ? `$${keyword.cpc.toFixed(2)}` : '$0.00',
      trend: keyword.trend || 'stable',
      score: this.calculateKeywordScore(keyword),
      raw: keyword
    };
  }

  // ============================================================================
  // SERP API - Real-time search engine results
  // ============================================================================

  /**
   * Get live SERP results for a keyword
   * @param {string} keyword - Search keyword
   * @param {number} locationCode - DataForSEO location code (default: 2840 = US)
   * @param {string} languageCode - Language code (default: 'en')
   * @param {string} device - Device type (default: 'desktop')
   * @returns {Promise<Array>} SERP results
   */
  async getSERP(keyword, locationCode = 2840, languageCode = 'en', device = 'desktop') {
    return this.request('/serp/google/organic/live/advanced', [{
      keyword,
      location_code: locationCode,
      language_code: languageCode,
      device,
      os: device === 'desktop' ? 'windows' : 'ios',
      depth: 100 // Get top 100 results
    }]);
  }

  /**
   * Get SERP features for a keyword (Featured Snippets, PAA, etc.)
   * @param {string} keyword - Search keyword
   * @param {number} locationCode - Location code
   * @returns {Promise<Object>} SERP features summary
   */
  async getSERPFeatures(keyword, locationCode = 2840) {
    const results = await this.getSERP(keyword, locationCode);
    const items = results[0]?.items || [];

    const features = {
      featured_snippet: items.some(i => i.type === 'featured_snippet'),
      people_also_ask: items.some(i => i.type === 'people_also_ask'),
      local_pack: items.some(i => i.type === 'local_pack'),
      knowledge_graph: items.some(i => i.type === 'knowledge_graph'),
      video_results: items.some(i => i.type === 'video'),
      images: items.some(i => i.type === 'images'),
      top_stories: items.some(i => i.type === 'top_stories')
    };

    return {
      keyword,
      features,
      total_results: results[0]?.se_results_count || 0,
      top_10: items.filter(i => i.type === 'organic').slice(0, 10).map(i => ({
        url: i.url,
        title: i.title,
        rank: i.rank_absolute
      }))
    };
  }

  // ============================================================================
  // Backlinks API - Backlink analysis
  // ============================================================================

  /**
   * Get backlink summary for a domain/page
   * @param {string} target - Domain or URL
   * @param {string} mode - 'domain', 'subdomain', or 'page'
   * @returns {Promise<Object>} Backlink summary
   */
  async getBacklinksSummary(target, mode = 'domain') {
    const results = await this.request('/backlinks/summary/live', [{
      target,
      mode,
      internal_list_limit: 10
    }]);

    return results[0] || null;
  }

  /**
   * Get referring domains for a target
   * @param {string} target - Domain or URL
   * @param {string} mode - 'domain', 'subdomain', or 'page'
   * @param {number} limit - Max referring domains to return
   * @returns {Promise<Array>} Referring domains
   */
  async getReferringDomains(target, mode = 'domain', limit = 100) {
    const results = await this.request('/backlinks/referring_domains/live', [{
      target,
      mode,
      limit,
      order_by: ['rank,desc']
    }]);

    return results || [];
  }

  /**
   * Get detailed backlinks for analysis
   * @param {string} target - Domain or URL
   * @param {string} mode - 'domain', 'subdomain', or 'page'
   * @param {number} limit - Max backlinks to return
   * @returns {Promise<Array>} Backlinks with details
   */
  async getBacklinks(target, mode = 'domain', limit = 1000) {
    const results = await this.request('/backlinks/backlinks/live', [{
      target,
      mode,
      limit,
      order_by: ['rank,desc']
    }]);

    return results || [];
  }

  /**
   * Calculate estimated Domain Rating based on backlink metrics
   * @param {Object} backlinkSummary - Result from getBacklinksSummary
   * @returns {number} Estimated DR (0-100)
   */
  calculateDomainRating(backlinkSummary) {
    if (!backlinkSummary) return 0;

    const domains = backlinkSummary.referring_main_domains || 0;

    // Simple DR estimation (approximation based on referring domains)
    if (domains === 0) return 0;
    if (domains < 10) return Math.min(20, domains * 2);
    if (domains < 50) return 20 + Math.min(20, (domains - 10) / 2);
    if (domains < 100) return 40 + Math.min(15, (domains - 50) / 3);
    if (domains < 500) return 55 + Math.min(15, (domains - 100) / 25);
    if (domains < 1000) return 70 + Math.min(10, (domains - 500) / 50);
    return 80 + Math.min(20, (domains - 1000) / 100);
  }

  // ============================================================================
  // On-Page API - Technical SEO crawler (Firecrawl replacement)
  // ============================================================================

  /**
   * Create a crawl task for a website
   * @param {string} target - Website URL
   * @param {number} maxPages - Max pages to crawl
   * @param {Object} options - Additional crawl options
   * @returns {Promise<string>} Task ID
   */
  async createCrawlTask(target, maxPages = 100, options = {}) {
    const results = await this.request('/on_page/task_post', [{
      target,
      max_crawl_pages: maxPages,
      load_resources: options.loadResources !== false,
      enable_javascript: options.enableJavascript || false,
      enable_browser_rendering: options.enableBrowserRendering || false,
      store_raw_html: options.storeRawHtml || false,
      ...options
    }]);

    return results[0]?.id || null;
  }

  /**
   * Get crawl task status
   * @param {string} taskId - Task ID from createCrawlTask
   * @returns {Promise<Object>} Task status
   */
  async getCrawlStatus(taskId) {
    const results = await this.request(`/on_page/summary/${taskId}`, []);
    return results[0] || null;
  }

  /**
   * Get crawled pages from completed task
   * @param {string} taskId - Task ID
   * @param {number} limit - Max pages to return
   * @returns {Promise<Array>} Crawled pages with SEO data
   */
  async getCrawledPages(taskId, limit = 100) {
    const results = await this.request(`/on_page/pages/${taskId}`, [{
      limit,
      order_by: ['page_score,desc']
    }]);

    return results[0]?.items || [];
  }

  /**
   * Crawl a website and wait for completion
   * @param {string} target - Website URL
   * @param {number} maxPages - Max pages to crawl
   * @param {Object} options - Crawl options
   * @returns {Promise<Array>} Crawled pages
   */
  async crawlSite(target, maxPages = 100, options = {}) {
    // Create task
    const taskId = await this.createCrawlTask(target, maxPages, options);
    if (!taskId) {
      throw new Error('Failed to create crawl task');
    }

    // Poll for completion (max 2 minutes)
    const maxAttempts = 24; // 24 * 5s = 2 minutes
    let attempts = 0;
    let complete = false;

    while (!complete && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s

      const status = await this.getCrawlStatus(taskId);
      complete = status?.crawl_progress === 'finished';
      attempts++;

      if (status?.crawl_status?.error) {
        throw new Error(`Crawl failed: ${status.crawl_status.error}`);
      }
    }

    if (!complete) {
      throw new Error('Crawl timeout - task did not complete in 2 minutes');
    }

    // Get results
    return this.getCrawledPages(taskId, maxPages);
  }

  // ============================================================================
  // Domain Analytics API - Domain metrics and traffic
  // ============================================================================

  /**
   * Get domain overview metrics
   * @param {string} target - Domain
   * @returns {Promise<Object>} Domain metrics
   */
  async getDomainOverview(target) {
    const results = await this.request('/domain_analytics/overview/live', [{
      target
    }]);

    return results[0] || null;
  }

  /**
   * Get organic keywords for a domain
   * @param {string} target - Domain
   * @param {number} limit - Max keywords to return
   * @returns {Promise<Array>} Organic keywords
   */
  async getOrganicKeywords(target, limit = 100) {
    const results = await this.request('/domain_analytics/keywords/live', [{
      target,
      limit,
      order_by: ['ranked_serp_element.serp_item.rank_absolute,asc']
    }]);

    return results || [];
  }

  // ============================================================================
  // DataForSEO Labs API - Pre-processed datasets
  // ============================================================================

  /**
   * Get all ranked keywords for a domain
   * @param {string} target - Domain
   * @param {number} limit - Max keywords to return
   * @returns {Promise<Array>} Ranked keywords with positions
   */
  async getRankedKeywords(target, limit = 1000) {
    const results = await this.request('/dataforseo_labs/google/ranked_keywords/live', [{
      target,
      limit,
      order_by: ['ranked_serp_element.serp_item.rank_absolute,asc']
    }]);

    return results[0]?.items || [];
  }

  /**
   * Get competitor domains
   * @param {string} target - Domain
   * @param {number} limit - Max competitors to return
   * @returns {Promise<Array>} Competitor domains
   */
  async getCompetitors(target, limit = 10) {
    const results = await this.request('/dataforseo_labs/google/competitors_domain/live', [{
      target,
      limit,
      order_by: ['avg_position,asc']
    }]);

    return results[0]?.items || [];
  }

  /**
   * Find keyword gaps between domains
   * @param {string} target - Your domain
   * @param {string} competitor - Competitor domain
   * @param {number} limit - Max keywords to return
   * @returns {Promise<Array>} Keywords competitor ranks for but target doesn't
   */
  async getKeywordGaps(target, competitor, limit = 100) {
    const results = await this.request('/dataforseo_labs/google/domain_intersection/live', [{
      target1: competitor,
      target2: target,
      exclude_target2: true, // Only keywords competitor has
      limit,
      order_by: ['keyword_data.keyword_info.search_volume,desc']
    }]);

    return results[0]?.items || [];
  }

  // ============================================================================
  // Content Analysis API - Content quality scoring
  // ============================================================================

  /**
   * Analyze content quality for a URL
   * @param {string} url - Page URL
   * @returns {Promise<Object>} Content analysis
   */
  async analyzeContent(url) {
    const results = await this.request('/content_analysis/summary/live', [{
      target: url
    }]);

    return results[0] || null;
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Extract domain from URL
   * @param {string} url - Full URL
   * @returns {string} Domain only
   */
  extractDomain(url) {
    try {
      const urlObj = new URL(url.match(/^https?:\/\//) ? url : `https://${url}`);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }
}

// Export singleton instance
export const dataForSEOClient = new DataForSEOClient();
export default dataForSEOClient;
