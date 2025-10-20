/**
 * DataForSEO SERP API Client
 * Wrapper for SERP analysis and competitive intelligence
 */

const DATAFORSEO_BASE = 'https://api.dataforseo.com/v3';

class SERPClient {
  constructor() {
    this.username = import.meta.env.DATAFORSEO_LOGIN ||
                   import.meta.env.VITE_DATAFORSEO_LOGIN ||
                   import.meta.env.VITE_DATAFORSEO_USERNAME;
    this.password = import.meta.env.DATAFORSEO_PASSWORD ||
                   import.meta.env.VITE_DATAFORSEO_PASSWORD;
  }

  /**
   * Make authenticated request to DataForSEO API
   */
  async request(endpoint, data = []) {
    const credentials = btoa(`${this.username}:${this.password}`);

    const response = await fetch(`${DATAFORSEO_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.status_code !== 20000) {
      throw new Error(`DataForSEO API Error: ${result.status_message || 'Unknown error'}`);
    }

    return result.tasks?.[0] || null;
  }

  /**
   * Get live organic SERP results for a keyword
   */
  async getOrganicResults(keyword, locationCode = 2840, languageCode = 'en', depth = 10) {
    const task = await this.request('/serp/google/organic/live/regular', [{
      keyword,
      location_code: locationCode,
      language_code: languageCode,
      depth
    }]);

    return task?.result?.[0]?.items || [];
  }

  /**
   * Get SERP results for multiple keywords (batch)
   */
  async getBatchOrganicResults(keywords, locationCode = 2840, languageCode = 'en', depth = 10) {
    const requests = keywords.map(keyword => ({
      keyword,
      location_code: locationCode,
      language_code: languageCode,
      depth
    }));

    const task = await this.request('/serp/google/organic/live/regular', requests);

    return task?.result || [];
  }

  /**
   * Analyze SERP for competitive intelligence
   */
  async analyzeSERP(keyword, targetDomain = null) {
    const items = await this.getOrganicResults(keyword, 2840, 'en', 20);

    const organicResults = items.filter(item => item.type === 'organic');
    const serpFeatures = items.filter(item => item.type !== 'organic');

    // Find target domain position
    let targetPosition = null;
    let targetResult = null;

    if (targetDomain) {
      const cleanDomain = this.extractDomain(targetDomain);
      const foundIndex = organicResults.findIndex(item => {
        const itemDomain = this.extractDomain(item.url);
        return itemDomain === cleanDomain;
      });

      if (foundIndex !== -1) {
        targetPosition = foundIndex + 1;
        targetResult = organicResults[foundIndex];
      }
    }

    // Get competitors (domains ranking in top 10)
    const competitors = organicResults
      .slice(0, 10)
      .map((item, index) => ({
        domain: this.extractDomain(item.url),
        position: index + 1,
        title: item.title,
        url: item.url,
        description: item.description
      }))
      .filter(comp => !targetDomain || this.extractDomain(comp.domain) !== this.extractDomain(targetDomain));

    // Detect SERP features
    const features = serpFeatures.map(item => ({
      type: item.type,
      title: item.title,
      domain: item.url ? this.extractDomain(item.url) : null
    }));

    return {
      keyword,
      target_position: targetPosition,
      target_result: targetResult,
      total_results: organicResults.length,
      competitors: competitors.slice(0, 5), // Top 5
      serp_features: features,
      opportunity: !targetPosition || targetPosition > 10 ? 'high' : targetPosition > 3 ? 'medium' : 'low'
    };
  }

  /**
   * Analyze multiple keywords for SERP visibility
   */
  async analyzeMultipleKeywords(keywords, targetDomain) {
    const analyses = [];

    for (const keyword of keywords) {
      try {
        const analysis = await this.analyzeSERP(keyword, targetDomain);
        analyses.push(analysis);
      } catch (err) {
        console.error(`[SERPClient] Error analyzing ${keyword}:`, err.message);
        // Continue with other keywords even if one fails
      }
    }

    return analyses;
  }

  /**
   * Calculate SERP visibility score
   */
  calculateVisibilityScore(analyses) {
    if (!analyses || analyses.length === 0) return 0;

    let score = 0;
    const maxScore = 100;
    const keywordCount = analyses.length;

    analyses.forEach(analysis => {
      if (analysis.target_position) {
        // Position-based scoring
        if (analysis.target_position === 1) score += 20;
        else if (analysis.target_position <= 3) score += 15;
        else if (analysis.target_position <= 5) score += 10;
        else if (analysis.target_position <= 10) score += 5;
        else if (analysis.target_position <= 20) score += 2;
      }
    });

    // Normalize to 0-100 scale
    const normalized = Math.min((score / keywordCount) * 5, maxScore);
    return Math.round(normalized);
  }

  /**
   * Get competitor overlap (domains appearing in multiple SERP results)
   */
  getCompetitorOverlap(analyses) {
    const domainCounts = {};

    analyses.forEach(analysis => {
      analysis.competitors.forEach(comp => {
        if (!domainCounts[comp.domain]) {
          domainCounts[comp.domain] = {
            domain: comp.domain,
            appearances: 0,
            avg_position: 0,
            positions: []
          };
        }
        domainCounts[comp.domain].appearances++;
        domainCounts[comp.domain].positions.push(comp.position);
      });
    });

    // Calculate average positions
    Object.values(domainCounts).forEach(comp => {
      comp.avg_position = comp.positions.reduce((a, b) => a + b, 0) / comp.positions.length;
      comp.avg_position = Math.round(comp.avg_position * 10) / 10;
    });

    // Sort by appearances, then by average position
    return Object.values(domainCounts)
      .sort((a, b) => {
        if (b.appearances !== a.appearances) {
          return b.appearances - a.appearances;
        }
        return a.avg_position - b.avg_position;
      })
      .slice(0, 5);
  }

  /**
   * Identify keyword gaps (keywords competitors rank for but target doesn't)
   */
  identifyKeywordGaps(analyses) {
    return analyses
      .filter(analysis => !analysis.target_position || analysis.target_position > 10)
      .map(analysis => ({
        keyword: analysis.keyword,
        opportunity_level: analysis.opportunity,
        top_competitor: analysis.competitors[0]?.domain || null,
        top_competitor_position: analysis.competitors[0]?.position || null,
        serp_features: analysis.serp_features.map(f => f.type)
      }))
      .slice(0, 10); // Top 10 opportunities
  }

  /**
   * Get SERP features summary
   */
  getSERPFeaturesSummary(analyses) {
    const features = {};

    analyses.forEach(analysis => {
      analysis.serp_features.forEach(feature => {
        if (!features[feature.type]) {
          features[feature.type] = {
            type: feature.type,
            count: 0,
            keywords: []
          };
        }
        features[feature.type].count++;
        features[feature.type].keywords.push(analysis.keyword);
      });
    });

    return Object.values(features)
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Extract domain from URL
   */
  extractDomain(url) {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch (err) {
      return url.replace('www.', '').split('/')[0];
    }
  }
}

// Export singleton instance
export const serpClient = new SERPClient();
