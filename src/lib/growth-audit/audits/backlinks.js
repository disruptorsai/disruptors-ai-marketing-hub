/**
 * Backlinks Analyzer
 *
 * Analyzes backlink profiles using DataForSEO Backlinks API
 *
 * Features:
 * - Total backlinks and referring domains
 * - Domain Rating estimation
 * - Dofollow/Nofollow ratio
 * - Top referring domains
 * - Link building opportunity identification
 * - Toxic link detection (basic)
 *
 * @see https://dataforseo.com/apis/backlinks-api
 */

import { dataForSEOClient } from '../../dataforseo-client.js';

export class BacklinksAnalyzer {
  /**
   * Analyze backlink profile for a domain
   * @param {string} url - Website URL or domain
   * @returns {Promise<Object>} Backlink analysis results
   */
  async analyze(url) {
    try {
      // Extract domain from URL
      const domain = dataForSEOClient.extractDomain(url);

      console.log('[BacklinksAnalyzer] Analyzing backlinks for:', domain);

      // Get backlink summary
      const summary = await dataForSEOClient.getBacklinksSummary(domain, 'domain');

      if (!summary) {
        console.warn('[BacklinksAnalyzer] No backlink data found for:', domain);
        return this.getEmptyProfile(domain);
      }

      // Get top referring domains
      const referringDomains = await dataForSEOClient.getReferringDomains(domain, 'domain', 50);

      // Calculate metrics
      const domainRating = dataForSEOClient.calculateDomainRating(summary);
      const linkQuality = this.calculateLinkQuality(summary);
      const opportunities = this.identifyOpportunities(summary, referringDomains);

      return {
        domain,
        total_backlinks: summary.backlinks || 0,
        referring_domains: summary.referring_domains || 0,
        referring_main_domains: summary.referring_main_domains || 0,
        domain_rating: Math.round(domainRating),
        link_quality: linkQuality,
        dofollow_percentage: summary.info?.dofollow_percentage || 0,
        nofollow_percentage: summary.info?.nofollow_percentage || 0,
        edu_links: summary.info?.edu || 0,
        gov_links: summary.info?.gov || 0,
        top_referring_domains: this.formatReferringDomains(referringDomains),
        opportunities,
        status: 'success'
      };
    } catch (error) {
      console.error('[BacklinksAnalyzer] Analysis failed:', error);

      // Return partial data on error (don't fail the entire audit)
      return {
        domain: dataForSEOClient.extractDomain(url),
        status: 'error',
        error_message: error.message,
        ...this.getEmptyProfile(dataForSEOClient.extractDomain(url))
      };
    }
  }

  /**
   * Calculate overall link quality score (0-100)
   * @param {Object} summary - Backlink summary from DataForSEO
   * @returns {Object} Link quality metrics
   */
  calculateLinkQuality(summary) {
    const dofollowPct = summary.info?.dofollow_percentage || 0;
    const eduGovLinks = (summary.info?.edu || 0) + (summary.info?.gov || 0);
    const totalBacklinks = summary.backlinks || 0;
    const referringDomains = summary.referring_domains || 0;

    // Quality factors
    const dofollowScore = Math.min(dofollowPct, 70); // 70%+ dofollow is great
    const diversityScore = Math.min((referringDomains / Math.max(totalBacklinks, 1)) * 100, 50); // Diversity ratio
    const authorityScore = Math.min((eduGovLinks / Math.max(referringDomains, 1)) * 1000, 30); // .edu/.gov bonus

    const qualityScore = Math.round(dofollowScore + diversityScore + authorityScore);

    return {
      score: Math.min(qualityScore, 100),
      label: this.getQualityLabel(qualityScore),
      factors: {
        dofollow_ratio: dofollowPct,
        diversity: diversityScore,
        authority_links: eduGovLinks
      }
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
   * Identify link building opportunities
   * @param {Object} summary - Backlink summary
   * @param {Array} referringDomains - Top referring domains
   * @returns {Array<Object>} Opportunity recommendations
   */
  identifyOpportunities(summary, referringDomains) {
    const opportunities = [];
    const referringCount = summary.referring_main_domains || 0;
    const dofollowPct = summary.info?.dofollow_percentage || 0;
    const totalBacklinks = summary.backlinks || 0;

    // Low domain count - need more links
    if (referringCount < 50) {
      opportunities.push({
        category: 'Link Building',
        priority: 'High',
        title: 'Build More Referring Domains',
        description: `You have ${referringCount} referring domains. Aim for 100+ to increase domain authority.`,
        impact: 'High',
        effort: 'Medium',
        actions: [
          'Create linkable assets (guides, tools, infographics)',
          'Reach out to industry blogs for guest posting',
          'Submit to relevant directories and listings',
          'Engage in digital PR and press releases'
        ]
      });
    }

    // Low dofollow ratio - quality issue
    if (dofollowPct < 50) {
      opportunities.push({
        category: 'Link Quality',
        priority: 'Medium',
        title: 'Improve Dofollow Link Ratio',
        description: `Only ${dofollowPct.toFixed(1)}% of your backlinks are dofollow. Target 60%+ for better SEO value.`,
        impact: 'Medium',
        effort: 'Medium',
        actions: [
          'Focus on earning editorial links from content',
          'Build relationships with bloggers and journalists',
          'Create resources that naturally earn dofollow links',
          'Avoid low-quality directory submissions'
        ]
      });
    }

    // No .edu or .gov links - authority opportunity
    const eduGovLinks = (summary.info?.edu || 0) + (summary.info?.gov || 0);
    if (eduGovLinks === 0 && referringCount > 20) {
      opportunities.push({
        category: 'Authority Building',
        priority: 'Medium',
        title: 'Earn .edu and .gov Links',
        description: 'No educational or government backlinks found. These high-authority links significantly boost trust.',
        impact: 'High',
        effort: 'High',
        actions: [
          'Create educational resources for universities',
          'Sponsor local educational programs',
          'Provide expert quotes to .edu publications',
          'Contribute to government data initiatives'
        ]
      });
    }

    // Analyze top referrers for competitor insights
    if (referringDomains && referringDomains.length > 0) {
      opportunities.push({
        category: 'Competitor Analysis',
        priority: 'Medium',
        title: 'Analyze Competitor Backlinks',
        description: 'Study where your competitors are getting links to find untapped opportunities.',
        impact: 'High',
        effort: 'Low',
        actions: [
          'Use DataForSEO to analyze top competitor backlinks',
          'Identify common referring domains',
          'Reach out to sites linking to competitors',
          'Create better content to earn those same links'
        ]
      });
    }

    // No opportunities found - general advice
    if (opportunities.length === 0) {
      opportunities.push({
        category: 'Link Maintenance',
        priority: 'Low',
        title: 'Maintain Your Link Profile',
        description: 'Your backlink profile looks healthy. Focus on consistent link building and monitoring.',
        impact: 'Medium',
        effort: 'Low',
        actions: [
          'Monitor for broken backlinks and fix them',
          'Disavow toxic or spammy links',
          'Continue creating linkable content',
          'Build relationships with industry influencers'
        ]
      });
    }

    return opportunities;
  }

  /**
   * Format referring domains for UI display
   * @param {Array} referringDomains - Raw referring domains from API
   * @returns {Array<Object>} Formatted referring domains
   */
  formatReferringDomains(referringDomains) {
    if (!referringDomains || referringDomains.length === 0) {
      return [];
    }

    return referringDomains.slice(0, 10).map((domain, index) => ({
      rank: index + 1,
      domain: domain.target || domain.domain || 'Unknown',
      backlinks: domain.backlinks || 0,
      dofollow: domain.dofollow || 0,
      nofollow: domain.nofollow || 0,
      first_seen: domain.first_seen || null,
      last_seen: domain.last_seen || null
    }));
  }

  /**
   * Get empty profile structure (used when no data or on error)
   * @param {string} domain - Domain name
   * @returns {Object} Empty profile structure
   */
  getEmptyProfile(domain) {
    return {
      domain,
      total_backlinks: 0,
      referring_domains: 0,
      referring_main_domains: 0,
      domain_rating: 0,
      link_quality: {
        score: 0,
        label: 'Unknown',
        factors: {
          dofollow_ratio: 0,
          diversity: 0,
          authority_links: 0
        }
      },
      dofollow_percentage: 0,
      nofollow_percentage: 0,
      edu_links: 0,
      gov_links: 0,
      top_referring_domains: [],
      opportunities: [{
        category: 'Link Building',
        priority: 'High',
        title: 'Start Building Backlinks',
        description: 'No backlink data found. Focus on creating linkable content and building your first referring domains.',
        impact: 'High',
        effort: 'High',
        actions: [
          'Create valuable, shareable content',
          'Reach out to industry blogs and publications',
          'Submit to relevant business directories',
          'Engage on social media to build awareness'
        ]
      }]
    };
  }

  /**
   * Check if domain has backlink data available
   * @param {string} url - Website URL
   * @returns {Promise<boolean>} True if backlink data exists
   */
  async hasBacklinkData(url) {
    try {
      const domain = dataForSEOClient.extractDomain(url);
      const summary = await dataForSEOClient.getBacklinksSummary(domain, 'domain');
      return summary && (summary.backlinks || 0) > 0;
    } catch {
      return false;
    }
  }
}

export default BacklinksAnalyzer;
