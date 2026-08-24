/**
 * SERP Content Analyzer
 * Analyzes top-ranking content to provide insights for content creation
 */

import { serpClient } from './serp-client';

export class SERPContentAnalyzer {
  /**
   * Generate a comprehensive content brief based on SERP analysis
   */
  async generateContentBrief(keyword, targetDomain = null) {
    try {
      console.log(`[SERPContentAnalyzer] Generating content brief for: ${keyword}`);

      // Get SERP results
      const serpResults = await serpClient.getOrganicResults(keyword, 2840, 'en', 10);

      // Separate organic from features
      const organicResults = serpResults.filter(item => item.type === 'organic').slice(0, 5);
      const serpFeatures = serpResults.filter(item => item.type !== 'organic');

      // Analyze top-ranking pages
      const topPages = this.analyzeTopPages(organicResults);
      const titlePatterns = this.analyzeTitlePatterns(organicResults);
      const serpOpportunities = this.analyzeSERPFeatures(serpFeatures);
      const contentRecommendations = this.generateRecommendations(
        topPages,
        titlePatterns,
        serpOpportunities,
        keyword
      );

      return {
        keyword,
        search_volume: null, // Would need Keywords API call to get this
        competition: this.estimateCompetition(organicResults),
        top_pages: topPages,
        title_patterns: titlePatterns,
        serp_features: serpOpportunities,
        recommendations: contentRecommendations,
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('[SERPContentAnalyzer] Error:', error);
      throw error;
    }
  }

  /**
   * Analyze top-ranking pages
   */
  analyzeTopPages(results) {
    return results.map((result, index) => ({
      position: index + 1,
      domain: new URL(result.url).hostname,
      title: result.title || '',
      description: result.description || '',
      url: result.url,
      title_length: (result.title || '').length,
      description_length: (result.description || '').length,
      // Estimate based on description
      has_numbers: /\d+/.test(result.title || ''),
      has_year: /20\d{2}/.test(result.title || ''),
      has_how_to: /(how to|guide|tutorial)/i.test(result.title || ''),
      has_list: /(top|best|\d+\s+(ways|tips|ideas))/i.test(result.title || '')
    }));
  }

  /**
   * Analyze title patterns from top-ranking pages
   */
  analyzeTitlePatterns(results) {
    const titles = results.map(r => r.title || '').filter(Boolean);

    if (titles.length === 0) {
      return {
        avg_length: 0,
        common_words: [],
        patterns: []
      };
    }

    // Calculate average length
    const avgLength = Math.round(
      titles.reduce((sum, title) => sum + title.length, 0) / titles.length
    );

    // Find common patterns
    const patterns = [];
    const hasYearCount = titles.filter(t => /20\d{2}/.test(t)).length;
    const hasNumbersCount = titles.filter(t => /\d+/.test(t)).length;
    const hasHowToCount = titles.filter(t => /(how to|guide|tutorial)/i.test(t)).length;
    const hasListCount = titles.filter(t => /(top|best|\d+\s+(ways|tips|ideas))/i.test(t)).length;

    if (hasYearCount >= 2) {
      patterns.push({
        type: 'year',
        frequency: hasYearCount,
        example: titles.find(t => /20\d{2}/.test(t)),
        recommendation: 'Include current year in title'
      });
    }

    if (hasNumbersCount >= 3) {
      patterns.push({
        type: 'numbers',
        frequency: hasNumbersCount,
        recommendation: 'Use specific numbers in title (e.g., "7 Ways", "15 Tips")'
      });
    }

    if (hasHowToCount >= 2) {
      patterns.push({
        type: 'how-to',
        frequency: hasHowToCount,
        recommendation: 'Use "How To" or "Guide" format'
      });
    }

    if (hasListCount >= 2) {
      patterns.push({
        type: 'list',
        frequency: hasListCount,
        recommendation: 'Use list format ("Best", "Top", "X Ways")'
      });
    }

    return {
      avg_length: avgLength,
      patterns,
      recommendation: `Target title length: ${avgLength - 5} to ${avgLength + 5} characters`
    };
  }

  /**
   * Analyze SERP features for opportunities
   */
  analyzeSERPFeatures(features) {
    const opportunities = [];

    features.forEach(feature => {
      const featureType = feature.type;

      if (featureType.includes('featured_snippet')) {
        opportunities.push({
          type: 'Featured Snippet',
          description: 'Featured snippet opportunity detected',
          recommendation: 'Structure content with clear, concise answers. Use lists, tables, or step-by-step formats.',
          priority: 'high'
        });
      }

      if (featureType.includes('people_also_ask')) {
        opportunities.push({
          type: 'People Also Ask',
          description: 'PAA questions present in SERP',
          recommendation: 'Include FAQ section addressing related questions users are asking.',
          priority: 'medium'
        });
      }

      if (featureType.includes('video')) {
        opportunities.push({
          type: 'Video Results',
          description: 'Video content ranking in SERP',
          recommendation: 'Consider creating video content or embedding relevant videos.',
          priority: 'medium'
        });
      }

      if (featureType.includes('local_pack')) {
        opportunities.push({
          type: 'Local Pack',
          description: 'Local results showing in SERP',
          recommendation: 'Optimize for local SEO if applicable to your business.',
          priority: 'high'
        });
      }
    });

    return opportunities;
  }

  /**
   * Generate content recommendations
   */
  generateRecommendations(topPages, titlePatterns, serpFeatures, keyword) {
    const recommendations = [];

    // Title recommendations
    if (titlePatterns.patterns.length > 0) {
      const dominantPattern = titlePatterns.patterns[0];
      recommendations.push({
        category: 'Title',
        suggestion: dominantPattern.recommendation,
        reasoning: `${dominantPattern.frequency} of top 5 results use this pattern`,
        priority: 'high'
      });
    }

    // Content format recommendations
    const listCount = topPages.filter(p => p.has_list).length;
    const howToCount = topPages.filter(p => p.has_how_to).length;

    if (listCount >= 3) {
      recommendations.push({
        category: 'Format',
        suggestion: 'Use list-based format (numbered or bulleted)',
        reasoning: `${listCount} of top 5 use list format`,
        priority: 'high'
      });
    } else if (howToCount >= 2) {
      recommendations.push({
        category: 'Format',
        suggestion: 'Use how-to/guide format with step-by-step instructions',
        reasoning: `${howToCount} of top 5 are how-to guides`,
        priority: 'high'
      });
    }

    // SERP feature recommendations
    serpFeatures.forEach(feature => {
      recommendations.push({
        category: 'SERP Features',
        suggestion: feature.recommendation,
        reasoning: `${feature.type} opportunity detected`,
        priority: feature.priority
      });
    });

    // Length recommendations (estimated from descriptions)
    const avgDescLength = Math.round(
      topPages.reduce((sum, p) => sum + p.description_length, 0) / topPages.length
    );

    recommendations.push({
      category: 'Content Length',
      suggestion: `Target comprehensive content (meta description suggests detailed pages)`,
      reasoning: `Average description length: ${avgDescLength} characters`,
      priority: 'medium'
    });

    return recommendations;
  }

  /**
   * Estimate competition level
   */
  estimateCompetition(results) {
    // Simple heuristic: count established domains (com, org, .edu, .gov)
    const establishedDomains = results.filter(r => {
      const domain = new URL(r.url).hostname;
      return /\.(com|org|edu|gov)$/.test(domain);
    });

    const ratio = establishedDomains.length / results.length;

    if (ratio >= 0.8) return { level: 'High', score: 85 };
    if (ratio >= 0.5) return { level: 'Medium', score: 60 };
    return { level: 'Low', score: 30 };
  }
}

// Export singleton instance
export const serpContentAnalyzer = new SERPContentAnalyzer();
