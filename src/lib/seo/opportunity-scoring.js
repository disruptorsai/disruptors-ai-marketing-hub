/**
 * Keyword Opportunity Scoring Algorithm
 *
 * Calculates a 0-100 opportunity score for keywords based on:
 * - Search volume (40 points max)
 * - Keyword difficulty (40 points max - inverted, lower is better)
 * - CPC/commercial value (10 points max)
 * - Trend momentum (10 points max)
 *
 * Higher scores = better opportunities
 */

/**
 * Calculate volume score (0-40 points)
 * Uses logarithmic scale to balance high and low volume keywords
 *
 * @param {number} searchVolume - Monthly search volume
 * @returns {number} Score from 0-40
 */
function calculateVolumeScore(searchVolume) {
  if (!searchVolume || searchVolume === 0) return 0;

  // Logarithmic scoring for better distribution
  if (searchVolume < 10) return 5;
  if (searchVolume < 100) return 15;
  if (searchVolume < 1000) return 25;
  if (searchVolume < 10000) return 35;
  return 40;
}

/**
 * Calculate difficulty score (0-40 points)
 * Inverted: lower difficulty = higher score
 *
 * @param {number} keywordDifficulty - Difficulty score 0-100
 * @returns {number} Score from 0-40
 */
function calculateDifficultyScore(keywordDifficulty) {
  if (keywordDifficulty === null || keywordDifficulty === undefined) {
    // Unknown difficulty = neutral score
    return 20;
  }

  // Invert difficulty (0 difficulty = 40 points, 100 difficulty = 0 points)
  return 40 * (1 - (keywordDifficulty / 100));
}

/**
 * Calculate CPC score (0-10 points)
 * Higher CPC = more commercial value
 *
 * @param {number} cpc - Cost per click in USD
 * @returns {number} Score from 0-10
 */
function calculateCPCScore(cpc) {
  if (!cpc || cpc === 0) return 0;

  if (cpc < 0.50) return 2;
  if (cpc < 1.00) return 4;
  if (cpc < 2.00) return 6;
  if (cpc < 5.00) return 8;
  return 10; // $5+ CPC
}

/**
 * Calculate trend bonus (0-10 points)
 * Rising trends get bonus points
 *
 * @param {number} trendScore - Trend score from -1.00 to 1.00
 * @param {Array} monthlyVolumes - Historical monthly search volumes
 * @returns {number} Score from 0-10
 */
function calculateTrendScore(trendScore = 0, monthlyVolumes = null) {
  let score = 0;

  // Base trend score
  // Range from -1.00 (declining 100%) to +1.00 (rising 100%)
  // Convert to 0-10 scale
  score += Math.max(0, Math.min(10, (trendScore + 1) * 5));

  // Bonus for sustained growth from monthly data
  if (monthlyVolumes && Array.isArray(monthlyVolumes) && monthlyVolumes.length >= 3) {
    const recentMonths = monthlyVolumes.slice(-3);
    const isGrowing = recentMonths.every((month, i) => {
      if (i === 0) return true;
      return month.volume >= recentMonths[i - 1].volume;
    });

    if (isGrowing) {
      score += 2; // Bonus for sustained growth
    }
  }

  return Math.min(10, score);
}

/**
 * Main opportunity scoring function
 *
 * @param {Object} keyword - Keyword object with metrics
 * @param {number} keyword.search_volume - Monthly search volume
 * @param {number} keyword.keyword_difficulty - Difficulty score 0-100
 * @param {number} keyword.cpc - Cost per click
 * @param {number} keyword.trend_score - Trend score -1.00 to 1.00
 * @param {Array} keyword.monthly_volumes - Historical monthly volumes
 * @param {Object} options - Scoring options
 * @returns {Object} Opportunity score and breakdown
 *
 * @example
 * const result = calculateOpportunityScore({
 *   search_volume: 1200,
 *   keyword_difficulty: 35,
 *   cpc: 2.50,
 *   trend_score: 0.4
 * });
 * // Returns: { score: 82.5, priority: 'critical', breakdown: {...} }
 */
export function calculateOpportunityScore(keyword, options = {}) {
  const {
    search_volume,
    keyword_difficulty,
    cpc,
    trend_score,
    monthly_volumes
  } = keyword;

  // Calculate component scores
  const volumeScore = calculateVolumeScore(search_volume);
  const difficultyScore = calculateDifficultyScore(keyword_difficulty);
  const cpcScore = calculateCPCScore(cpc);
  const trendBonusScore = calculateTrendScore(trend_score, monthly_volumes);

  // Total score (0-100)
  const totalScore = volumeScore + difficultyScore + cpcScore + trendBonusScore;

  // Round to 2 decimal places
  const score = Math.round(totalScore * 100) / 100;

  // Assign priority based on score
  let priority;
  if (score >= 80) priority = 'critical';
  else if (score >= 60) priority = 'high';
  else if (score >= 40) priority = 'medium';
  else priority = 'low';

  // Determine keyword type based on characteristics
  const keywordType = determineKeywordType(keyword);

  // Determine search intent if not provided
  const searchIntent = keyword.search_intent || inferSearchIntent(keyword.keyword);

  return {
    score,
    priority,
    breakdown: {
      volume: volumeScore,
      difficulty: difficultyScore,
      cpc: cpcScore,
      trend: trendBonusScore
    },
    metadata: {
      keyword_type: keywordType,
      search_intent: searchIntent,
      recommendation: generateRecommendation(score, keyword)
    }
  };
}

/**
 * Determine keyword type based on characteristics
 *
 * @param {Object} keyword - Keyword object
 * @returns {string} Keyword type
 */
function determineKeywordType(keyword) {
  const kw = keyword.keyword.toLowerCase();
  const wordCount = kw.split(' ').length;

  // Question keyword
  if (/^(how|what|why|when|where|who|which|can|does|is|are)\b/i.test(kw)) {
    return 'question';
  }

  // Local keyword
  if (/(near me|in \w+|city|local|nearby|[0-9]{5})/i.test(kw)) {
    return 'local';
  }

  // Word count classification
  if (wordCount === 1) return 'head';
  if (wordCount === 2) return 'body';
  if (wordCount >= 3) return 'longtail';

  return 'body';
}

/**
 * Infer search intent from keyword text
 *
 * @param {string} keyword - Keyword text
 * @returns {string} Search intent
 */
function inferSearchIntent(keyword) {
  const kw = keyword.toLowerCase();

  // Transactional intent
  if (/(buy|purchase|order|discount|deal|cheap|price|cost|for sale)/i.test(kw)) {
    return 'transactional';
  }

  // Commercial investigation
  if (/(best|top|review|compare|vs|alternative|tool|service|software)/i.test(kw)) {
    return 'commercial';
  }

  // Navigational intent
  if (/(login|sign in|official|website|app)/i.test(kw)) {
    return 'navigational';
  }

  // Default to informational
  return 'informational';
}

/**
 * Generate recommendation text based on score and keyword
 *
 * @param {number} score - Opportunity score
 * @param {Object} keyword - Keyword object
 * @returns {string} Recommendation
 */
function generateRecommendation(score, keyword) {
  const { search_volume, keyword_difficulty, cpc } = keyword;

  if (score >= 80) {
    return `High-priority opportunity: Strong search volume (${search_volume}) with manageable difficulty (${keyword_difficulty}). Create content immediately.`;
  }

  if (score >= 60) {
    if (keyword_difficulty < 40) {
      return `Good opportunity: Low competition makes this keyword winnable. Create optimized content.`;
    }
    return `Solid opportunity: Balanced metrics make this keyword worth targeting with quality content.`;
  }

  if (score >= 40) {
    if (search_volume < 100) {
      return `Medium priority: Low volume but could be valuable for long-tail strategy.`;
    }
    if (keyword_difficulty > 70) {
      return `Challenging keyword: High difficulty requires exceptional content and strong backlink profile.`;
    }
    return `Medium opportunity: Consider as part of broader content strategy.`;
  }

  return `Low priority: Consider only if highly relevant to core offering or has strategic value.`;
}

/**
 * Batch calculate opportunity scores for multiple keywords
 *
 * @param {Array<Object>} keywords - Array of keyword objects
 * @param {Object} options - Scoring options
 * @returns {Array<Object>} Keywords with opportunity scores
 */
export function batchCalculateOpportunityScores(keywords, options = {}) {
  return keywords.map(keyword => ({
    ...keyword,
    ...calculateOpportunityScore(keyword, options)
  })).sort((a, b) => b.score - a.score); // Sort by score descending
}

/**
 * Filter keywords by opportunity score threshold
 *
 * @param {Array<Object>} keywords - Keywords with opportunity scores
 * @param {number} minScore - Minimum score threshold (default: 60)
 * @returns {Array<Object>} Filtered keywords
 */
export function filterByOpportunityScore(keywords, minScore = 60) {
  return keywords.filter(kw => kw.score >= minScore);
}

/**
 * Group keywords by priority
 *
 * @param {Array<Object>} keywords - Keywords with opportunity scores
 * @returns {Object} Keywords grouped by priority
 */
export function groupByPriority(keywords) {
  return {
    critical: keywords.filter(kw => kw.priority === 'critical'),
    high: keywords.filter(kw => kw.priority === 'high'),
    medium: keywords.filter(kw => kw.priority === 'medium'),
    low: keywords.filter(kw => kw.priority === 'low')
  };
}

/**
 * Get top N opportunities
 *
 * @param {Array<Object>} keywords - Keywords with opportunity scores
 * @param {number} n - Number of top opportunities to return
 * @returns {Array<Object>} Top N keywords
 */
export function getTopOpportunities(keywords, n = 10) {
  return keywords
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

/**
 * Calculate aggregate statistics for a keyword set
 *
 * @param {Array<Object>} keywords - Keywords with opportunity scores
 * @returns {Object} Statistics
 */
export function calculateKeywordStats(keywords) {
  if (!keywords || keywords.length === 0) {
    return {
      total: 0,
      avgScore: 0,
      avgVolume: 0,
      avgDifficulty: 0,
      avgCPC: 0,
      totalVolume: 0,
      byPriority: { critical: 0, high: 0, medium: 0, low: 0 }
    };
  }

  const total = keywords.length;
  const totalScore = keywords.reduce((sum, kw) => sum + (kw.score || 0), 0);
  const totalVolume = keywords.reduce((sum, kw) => sum + (kw.search_volume || 0), 0);
  const totalDifficulty = keywords.reduce((sum, kw) => sum + (kw.keyword_difficulty || 0), 0);
  const totalCPC = keywords.reduce((sum, kw) => sum + (kw.cpc || 0), 0);

  const grouped = groupByPriority(keywords);

  return {
    total,
    avgScore: Math.round((totalScore / total) * 100) / 100,
    avgVolume: Math.round(totalVolume / total),
    avgDifficulty: Math.round(totalDifficulty / total),
    avgCPC: Math.round((totalCPC / total) * 100) / 100,
    totalVolume,
    byPriority: {
      critical: grouped.critical.length,
      high: grouped.high.length,
      medium: grouped.medium.length,
      low: grouped.low.length
    }
  };
}

export default {
  calculateOpportunityScore,
  batchCalculateOpportunityScores,
  filterByOpportunityScore,
  groupByPriority,
  getTopOpportunities,
  calculateKeywordStats
};
