/**
 * SERP Visibility Analyzer
 * Analyzes search engine rankings and competitive positioning
 * Replaces backlinks analyzer with actionable SERP data
 */

import { serpClient } from '@/lib/serp-client';
import { dataForSEOClient } from '@/lib/dataforseo-client';

export class SERPVisibilityAnalyzer {
  constructor() {
    this.serpClient = serpClient;
    this.keywordsClient = dataForSEOClient;
  }

  /**
   * Main analysis function
   */
  async analyze(url) {
    console.log(`[SERPVisibilityAnalyzer] Analyzing SERP visibility for: ${url}`);

    try {
      const domain = this.extractDomain(url);

      // Step 1: Get seed keywords for the domain
      const seedKeywords = await this.getSeedKeywords(domain);

      if (seedKeywords.length === 0) {
        return this.getEmptyProfile(domain);
      }

      // Step 2: Analyze SERP positions for seed keywords
      const serpAnalyses = await this.serpClient.analyzeMultipleKeywords(
        seedKeywords.slice(0, 5), // Limit to 5 keywords to control costs
        domain
      );

      // Step 3: Calculate visibility metrics
      const visibilityScore = this.serpClient.calculateVisibilityScore(serpAnalyses);
      const rankingKeywords = serpAnalyses.filter(a => a.target_position).length;
      const avgPosition = this.calculateAveragePosition(serpAnalyses);

      // Step 4: Identify competitors
      const competitors = this.serpClient.getCompetitorOverlap(serpAnalyses);

      // Step 5: Find keyword gaps
      const keywordGaps = this.serpClient.identifyKeywordGaps(serpAnalyses);

      // Step 6: Get SERP features summary
      const serpFeatures = this.serpClient.getSERPFeaturesSummary(serpAnalyses);

      // Step 7: Generate opportunities
      const opportunities = this.identifyOpportunities({
        visibilityScore,
        rankingKeywords,
        avgPosition,
        keywordGaps,
        serpFeatures
      });

      return {
        domain,
        visibility_score: visibilityScore,
        ranking_keywords: rankingKeywords,
        total_keywords_analyzed: serpAnalyses.length,
        avg_position: avgPosition,
        competitors,
        keyword_gaps: keywordGaps.slice(0, 5),
        serp_features: serpFeatures.slice(0, 5),
        opportunities,
        raw_analyses: serpAnalyses, // For debugging
        status: 'success',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('[SERPVisibilityAnalyzer] Error:', error);

      return {
        domain: this.extractDomain(url),
        status: 'error',
        error_message: error.message,
        ...this.getEmptyProfile(this.extractDomain(url))
      };
    }
  }

  /**
   * Get seed keywords for domain analysis
   */
  async getSeedKeywords(domain) {
    try {
      // Get brand/company name from domain
      const brandName = domain.split('.')[0].replace(/-/g, ' ');

      // Get keyword suggestions for brand
      const keywords = await this.keywordsClient.getKeywordSuggestions(
        brandName,
        2840, // USA
        'en',
        20 // Get 20 suggestions
      );

      // Return top keywords by search volume
      return keywords
        .sort((a, b) => (b.search_volume || 0) - (a.search_volume || 0))
        .map(k => k.keyword)
        .slice(0, 10);

    } catch (error) {
      console.error('[SERPVisibilityAnalyzer] Error getting seed keywords:', error);

      // Fallback: use domain name variations
      const brandName = domain.split('.')[0].replace(/-/g, ' ');
      return [
        brandName,
        `${brandName} software`,
        `${brandName} platform`,
        `${brandName} tool`,
        `best ${brandName}`
      ];
    }
  }

  /**
   * Calculate average position from analyses
   */
  calculateAveragePosition(analyses) {
    const positions = analyses
      .filter(a => a.target_position)
      .map(a => a.target_position);

    if (positions.length === 0) return null;

    const sum = positions.reduce((a, b) => a + b, 0);
    return Math.round((sum / positions.length) * 10) / 10;
  }

  /**
   * Identify improvement opportunities
   */
  identifyOpportunities(metrics) {
    const opportunities = [];

    // Low visibility score
    if (metrics.visibilityScore < 30) {
      opportunities.push({
        type: 'visibility',
        priority: 'high',
        title: 'Improve SERP Visibility',
        description: `Your visibility score is ${metrics.visibilityScore}/100. Focus on ranking for high-value keywords.`,
        action: 'Create targeted content for keyword gaps and optimize existing pages.'
      });
    }

    // Few ranking keywords
    if (metrics.rankingKeywords < 5) {
      opportunities.push({
        type: 'keyword_expansion',
        priority: 'high',
        title: 'Expand Keyword Rankings',
        description: `Only ${metrics.rankingKeywords} keywords are ranking in top 20. You need more keyword coverage.`,
        action: 'Identify and target more relevant keywords with content creation.'
      });
    }

    // Poor average position
    if (metrics.avgPosition && metrics.avgPosition > 10) {
      opportunities.push({
        type: 'position_improvement',
        priority: 'medium',
        title: 'Improve Ranking Positions',
        description: `Average position is ${metrics.avgPosition}. Focus on moving into top 10.`,
        action: 'Optimize existing ranking pages with better content and on-page SEO.'
      });
    }

    // Keyword gaps
    if (metrics.keywordGaps && metrics.keywordGaps.length > 0) {
      opportunities.push({
        type: 'keyword_gap',
        priority: 'high',
        title: 'Target Competitor Keywords',
        description: `${metrics.keywordGaps.length} keywords where competitors rank but you don't.`,
        action: `Create content targeting: ${metrics.keywordGaps.slice(0, 3).map(g => g.keyword).join(', ')}`
      });
    }

    // SERP features
    if (metrics.serpFeatures && metrics.serpFeatures.length > 0) {
      const hasSnippet = metrics.serpFeatures.some(f => f.type.includes('featured_snippet'));
      if (hasSnippet) {
        opportunities.push({
          type: 'serp_feature',
          priority: 'medium',
          title: 'Target Featured Snippets',
          description: 'Featured snippets detected in your keyword SERPs.',
          action: 'Structure content with clear answers, tables, and lists to win snippets.'
        });
      }
    }

    return opportunities.slice(0, 5); // Top 5 opportunities
  }

  /**
   * Get empty profile for error cases
   */
  getEmptyProfile(domain) {
    return {
      domain,
      visibility_score: 0,
      ranking_keywords: 0,
      total_keywords_analyzed: 0,
      avg_position: null,
      competitors: [],
      keyword_gaps: [],
      serp_features: [],
      opportunities: [{
        type: 'no_data',
        priority: 'high',
        title: 'Start Ranking',
        description: 'No SERP visibility detected for your domain.',
        action: 'Begin with keyword research and create optimized content.'
      }],
      status: 'empty',
      timestamp: new Date().toISOString()
    };
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
