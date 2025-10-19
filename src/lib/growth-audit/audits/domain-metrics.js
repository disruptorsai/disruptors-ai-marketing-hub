/**
 * Domain Metrics Analyzer
 *
 * Analyzes domain-level SEO metrics using DataForSEO Domain Analytics API
 *
 * Features:
 * - Organic traffic estimates
 * - Top-ranking keywords
 * - Organic competitor discovery
 * - Traffic trend analysis
 * - Keyword visibility score
 *
 * @see https://dataforseo.com/apis/domain-analytics-api
 */

import { dataForSEOClient } from '../../dataforseo-client.js';

export class DomainMetricsAnalyzer {
  /**
   * Analyze domain metrics and organic performance
   * @param {string} url - Website URL or domain
   * @returns {Promise<Object>} Domain metrics results
   */
  async analyze(url) {
    try {
      // Extract domain from URL
      const domain = dataForSEOClient.extractDomain(url);

      console.log('[DomainMetricsAnalyzer] Analyzing domain metrics for:', domain);

      // Get domain overview (traffic estimates, organic keywords count)
      const overview = await dataForSEOClient.getDomainOverview(domain);

      if (!overview) {
        console.warn('[DomainMetricsAnalyzer] No domain data found for:', domain);
        return this.getEmptyMetrics(domain);
      }

      // Get top organic keywords
      const topKeywords = await dataForSEOClient.getOrganicKeywords(domain, 20);

      // Get competitor domains (for competitive context)
      const competitors = await dataForSEOClient.getCompetitors(domain, 5);

      // Calculate derived metrics
      const visibilityScore = this.calculateVisibilityScore(overview, topKeywords);
      const trafficQuality = this.assessTrafficQuality(topKeywords);
      const opportunities = this.identifyOpportunities(overview, topKeywords, competitors);

      return {
        domain,
        organic_traffic_estimate: overview.organic_etv || 0,
        organic_keywords_count: overview.organic_keywords_count || 0,
        paid_keywords_count: overview.paid_keywords_count || 0,
        visibility_score: visibilityScore,
        traffic_quality: trafficQuality,
        top_keywords: this.formatTopKeywords(topKeywords),
        top_competitors: this.formatCompetitors(competitors),
        opportunities,
        status: 'success'
      };
    } catch (error) {
      console.error('[DomainMetricsAnalyzer] Analysis failed:', error);

      // Return partial data on error (don't fail the entire audit)
      return {
        domain: dataForSEOClient.extractDomain(url),
        status: 'error',
        error_message: error.message,
        ...this.getEmptyMetrics(dataForSEOClient.extractDomain(url))
      };
    }
  }

  /**
   * Calculate organic visibility score (0-100)
   * Based on keyword count, rankings, and traffic estimates
   * @param {Object} overview - Domain overview data
   * @param {Array} topKeywords - Top ranking keywords
   * @returns {number} Visibility score
   */
  calculateVisibilityScore(overview, topKeywords) {
    const keywordCount = overview.organic_keywords_count || 0;
    const traffic = overview.organic_etv || 0;

    // Keyword count score (0-40 points)
    let keywordScore = 0;
    if (keywordCount < 100) keywordScore = keywordCount / 10;
    else if (keywordCount < 500) keywordScore = 10 + (keywordCount - 100) / 20;
    else if (keywordCount < 1000) keywordScore = 20 + (keywordCount - 500) / 25;
    else keywordScore = 40;

    // Traffic score (0-40 points)
    let trafficScore = 0;
    if (traffic < 1000) trafficScore = traffic / 100;
    else if (traffic < 10000) trafficScore = 10 + (traffic - 1000) / 450;
    else if (traffic < 50000) trafficScore = 20 + (traffic - 10000) / 2000;
    else trafficScore = 40;

    // Ranking quality score (0-20 points) - average position of top keywords
    let rankingScore = 0;
    if (topKeywords && topKeywords.length > 0) {
      const avgPosition = topKeywords.reduce((sum, kw) => {
        const pos = kw.ranked_serp_element?.serp_item?.rank_absolute || 100;
        return sum + pos;
      }, 0) / topKeywords.length;

      if (avgPosition <= 3) rankingScore = 20;
      else if (avgPosition <= 10) rankingScore = 15;
      else if (avgPosition <= 20) rankingScore = 10;
      else if (avgPosition <= 50) rankingScore = 5;
      else rankingScore = 2;
    }

    return Math.min(Math.round(keywordScore + trafficScore + rankingScore), 100);
  }

  /**
   * Assess traffic quality based on keyword metrics
   * @param {Array} topKeywords - Top ranking keywords
   * @returns {Object} Traffic quality assessment
   */
  assessTrafficQuality(topKeywords) {
    if (!topKeywords || topKeywords.length === 0) {
      return {
        score: 0,
        label: 'Unknown',
        high_value_keywords: 0,
        avg_search_volume: 0
      };
    }

    // Calculate average search volume
    const avgSearchVolume = topKeywords.reduce((sum, kw) => {
      return sum + (kw.keyword_data?.keyword_info?.search_volume || 0);
    }, 0) / topKeywords.length;

    // Count high-value keywords (top 10 position + >100 monthly searches)
    const highValueKeywords = topKeywords.filter(kw => {
      const position = kw.ranked_serp_element?.serp_item?.rank_absolute || 100;
      const volume = kw.keyword_data?.keyword_info?.search_volume || 0;
      return position <= 10 && volume >= 100;
    }).length;

    // Calculate quality score
    let qualityScore = 0;
    if (avgSearchVolume >= 1000) qualityScore += 40;
    else if (avgSearchVolume >= 500) qualityScore += 30;
    else if (avgSearchVolume >= 100) qualityScore += 20;
    else qualityScore += 10;

    qualityScore += Math.min(highValueKeywords * 6, 60);

    return {
      score: Math.min(qualityScore, 100),
      label: this.getQualityLabel(qualityScore),
      high_value_keywords: highValueKeywords,
      avg_search_volume: Math.round(avgSearchVolume)
    };
  }

  /**
   * Get quality label from score
   * @param {number} score - Quality score (0-100)
   * @returns {string} Quality label
   */
  getQualityLabel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Poor';
    return 'Very Poor';
  }

  /**
   * Identify SEO opportunities based on domain metrics
   * @param {Object} overview - Domain overview
   * @param {Array} topKeywords - Top keywords
   * @param {Array} competitors - Competitor domains
   * @returns {Array<Object>} Opportunity recommendations
   */
  identifyOpportunities(overview, topKeywords, competitors) {
    const opportunities = [];
    const keywordCount = overview.organic_keywords_count || 0;
    const traffic = overview.organic_etv || 0;

    // Low keyword count - content opportunity
    if (keywordCount < 100) {
      opportunities.push({
        category: 'Content',
        priority: 'High',
        title: 'Expand Keyword Portfolio',
        description: `You're ranking for ${keywordCount} keywords. Target 500+ to increase organic visibility.`,
        impact: 'High',
        effort: 'High',
        actions: [
          'Create content targeting long-tail keywords',
          'Optimize existing pages for multiple keywords',
          'Build topical authority with comprehensive guides',
          'Target question-based keywords (PAA opportunities)'
        ]
      });
    }

    // Low traffic despite keywords - ranking improvement needed
    if (keywordCount > 100 && traffic < 1000) {
      opportunities.push({
        category: 'SEO',
        priority: 'High',
        title: 'Improve Keyword Rankings',
        description: 'You have keywords but low traffic. Focus on improving rankings for high-volume terms.',
        impact: 'High',
        effort: 'Medium',
        actions: [
          'Optimize title tags and meta descriptions',
          'Build internal linking to key pages',
          'Earn backlinks to improve page authority',
          'Improve content quality and comprehensiveness'
        ]
      });
    }

    // Competitors found - competitive analysis opportunity
    if (competitors && competitors.length > 0) {
      const topCompetitor = competitors[0];
      opportunities.push({
        category: 'Competitive Analysis',
        priority: 'Medium',
        title: 'Analyze Top Competitor',
        description: `${topCompetitor.domain || 'Top competitor'} competes for similar keywords. Study their strategy for insights.`,
        impact: 'Medium',
        effort: 'Low',
        actions: [
          'Identify keyword gaps using DataForSEO Labs',
          'Analyze their top-performing content',
          'Study their backlink profile for opportunities',
          'Monitor their ranking changes weekly'
        ]
      });
    }

    // High keyword count but missing top rankings
    if (keywordCount > 500 && topKeywords.length > 0) {
      const top3Count = topKeywords.filter(kw =>
        (kw.ranked_serp_element?.serp_item?.rank_absolute || 100) <= 3
      ).length;

      if (top3Count < 5) {
        opportunities.push({
          category: 'SEO',
          priority: 'Medium',
          title: 'Target Featured Snippets',
          description: 'Focus on earning top 3 rankings and featured snippets for high-value keywords.',
          impact: 'High',
          effort: 'Medium',
          actions: [
            'Identify keywords with featured snippets',
            'Format content for snippet optimization (lists, tables, Q&A)',
            'Improve existing top 10 rankings to top 3',
            'Target "what is," "how to," and definition queries'
          ]
        });
      }
    }

    // No paid keywords - PPC opportunity
    if ((overview.paid_keywords_count || 0) === 0 && traffic > 1000) {
      opportunities.push({
        category: 'Paid',
        priority: 'Low',
        title: 'Consider Paid Search',
        description: 'No paid keyword activity found. PPC can complement your organic strategy.',
        impact: 'Medium',
        effort: 'High',
        actions: [
          'Start with small budget Google Ads campaign',
          'Target high-intent commercial keywords',
          'Test ads for keywords ranking #4-10 organically',
          'Use PPC data to inform SEO strategy'
        ]
      });
    }

    return opportunities;
  }

  /**
   * Format top keywords for UI display
   * @param {Array} keywords - Raw keywords from API
   * @returns {Array<Object>} Formatted keywords
   */
  formatTopKeywords(keywords) {
    if (!keywords || keywords.length === 0) {
      return [];
    }

    return keywords.slice(0, 10).map((kw, index) => ({
      rank: index + 1,
      keyword: kw.keyword || 'Unknown',
      position: kw.ranked_serp_element?.serp_item?.rank_absolute || null,
      search_volume: kw.keyword_data?.keyword_info?.search_volume || 0,
      cpc: kw.keyword_data?.keyword_info?.cpc || 0,
      competition: kw.keyword_data?.keyword_info?.competition || 0,
      url: kw.ranked_serp_element?.serp_item?.url || null
    }));
  }

  /**
   * Format competitor domains for UI display
   * @param {Array} competitors - Raw competitors from API
   * @returns {Array<Object>} Formatted competitors
   */
  formatCompetitors(competitors) {
    if (!competitors || competitors.length === 0) {
      return [];
    }

    return competitors.slice(0, 5).map((comp, index) => ({
      rank: index + 1,
      domain: comp.domain || 'Unknown',
      avg_position: Math.round(comp.avg_position || 0),
      sum_position: comp.sum_position || 0,
      intersections: comp.intersections || 0
    }));
  }

  /**
   * Get empty metrics structure (used when no data or on error)
   * @param {string} domain - Domain name
   * @returns {Object} Empty metrics structure
   */
  getEmptyMetrics(domain) {
    return {
      domain,
      organic_traffic_estimate: 0,
      organic_keywords_count: 0,
      paid_keywords_count: 0,
      visibility_score: 0,
      traffic_quality: {
        score: 0,
        label: 'Unknown',
        high_value_keywords: 0,
        avg_search_volume: 0
      },
      top_keywords: [],
      top_competitors: [],
      opportunities: [{
        category: 'SEO',
        priority: 'High',
        title: 'Build Organic Presence',
        description: 'No organic keyword data found. Focus on creating SEO-optimized content to start ranking.',
        impact: 'High',
        effort: 'High',
        actions: [
          'Conduct keyword research for your industry',
          'Create high-quality, optimized content',
          'Build internal linking structure',
          'Submit sitemap to Google Search Console'
        ]
      }]
    };
  }

  /**
   * Check if domain has metrics data available
   * @param {string} url - Website URL
   * @returns {Promise<boolean>} True if metrics data exists
   */
  async hasMetricsData(url) {
    try {
      const domain = dataForSEOClient.extractDomain(url);
      const overview = await dataForSEOClient.getDomainOverview(domain);
      return overview && (overview.organic_keywords_count || 0) > 0;
    } catch {
      return false;
    }
  }
}

export default DomainMetricsAnalyzer;
