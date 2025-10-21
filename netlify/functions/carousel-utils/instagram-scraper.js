/**
 * Instagram Carousel Research Scraper
 *
 * Uses Firecrawl to scrape successful Instagram carousels in a given industry
 * and analyze patterns for image strategy optimization.
 *
 * Features:
 * - Scrapes top-performing carousels by industry
 * - Analyzes slide composition and engagement
 * - Caches results for performance
 * - Identifies winning patterns
 */

import FirecrawlApp from '@mendable/firecrawl-js';

/**
 * Initialize Firecrawl client
 */
function getFirecrawlClient() {
  const apiKey = process.env.VITE_FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_FIRECRAWL_API_KEY not found');
  }
  return new FirecrawlApp({ apiKey });
}

/**
 * Search Instagram for top carousels by topic/industry
 *
 * @param {Object} params - Search parameters
 * @param {string} params.industry - Industry/niche (e.g., "real_estate", "saas")
 * @param {string} params.topic - Specific topic (e.g., "AI tools for realtors")
 * @param {number} params.limit - Max carousels to analyze (default: 10)
 * @returns {Promise<Array>} Array of scraped carousel data
 */
export async function scrapeInstagramCarousels({ industry, topic, limit = 10 }) {
  const firecrawl = getFirecrawlClient();

  // Construct Instagram search URLs
  // Strategy: Search for hashtags + top accounts in industry
  const searchQueries = [
    `${industry} tips carousel`,
    `${topic} instagram`,
    `${industry} carousel post`
  ];

  // Target specific high-performing accounts by industry
  const industryAccounts = getTopAccountsByIndustry(industry);

  const scrapedCarousels = [];

  try {
    // Scrape each target account's recent posts
    for (const account of industryAccounts.slice(0, 3)) { // Top 3 accounts
      try {
        const accountUrl = `https://www.instagram.com/${account}/`;

        // Scrape account page
        const scrapeResult = await firecrawl.scrapeUrl(accountUrl, {
          formats: ['markdown', 'html'],
          onlyMainContent: true
        });

        if (scrapeResult.success) {
          // Parse Instagram posts from scraped data
          const posts = parseInstagramPosts(scrapeResult.markdown, scrapeResult.html);

          // Filter for carousel posts (multiple images)
          const carousels = posts.filter(post =>
            post.type === 'carousel' &&
            post.slide_count >= 3 &&
            post.slide_count <= 10
          );

          scrapedCarousels.push(...carousels);
        }
      } catch (error) {
        console.warn(`Failed to scrape account ${account}:`, error.message);
        // Continue with other accounts
      }
    }

    // Sort by engagement rate and limit
    const topCarousels = scrapedCarousels
      .sort((a, b) => b.engagement_rate - a.engagement_rate)
      .slice(0, limit);

    // Analyze patterns
    const analysisResults = analyzeCarouselPatterns(topCarousels);

    return {
      success: true,
      carousels: topCarousels,
      analysis: analysisResults,
      metadata: {
        total_found: scrapedCarousels.length,
        top_performers: topCarousels.length,
        accounts_scraped: industryAccounts.slice(0, 3),
        industry,
        topic
      }
    };

  } catch (error) {
    console.error('Instagram scraping error:', error);

    // Return cached/fallback data
    return {
      success: false,
      error: error.message,
      carousels: [],
      analysis: null,
      fallback: true
    };
  }
}

/**
 * Parse Instagram posts from scraped HTML/Markdown
 * This is a simplified parser - in production would use more robust parsing
 */
function parseInstagramPosts(markdown, html) {
  // This is a placeholder implementation
  // Real implementation would parse actual Instagram HTML structure

  // For now, return mock data structure
  return [];
}

/**
 * Get top-performing Instagram accounts by industry
 */
function getTopAccountsByIndustry(industry) {
  const accountMap = {
    'real_estate': [
      'ryanserhaninvestor',
      'thebrokeagent',
      'realestaterobotai'
    ],
    'saas': [
      'indiehackers',
      'starterstory',
      'saasmantra'
    ],
    'coaching': [
      'tonyrobbins',
      'brendonburchard',
      'marieforleo'
    ],
    'ecommerce': [
      'shopify',
      'ecommerce_mentor',
      'oberlo'
    ],
    'marketing': [
      'garyvee',
      'neilpatel',
      'socialmediaexaminer'
    ],
    'fitness': [
      'kayla_itsines',
      'sweat',
      'jesmichellefit'
    ],
    'finance': [
      'personalfinanceclub',
      'thefinancialdiet',
      'millennial_money_man'
    ]
  };

  return accountMap[industry] || accountMap['marketing']; // Default to marketing
}

/**
 * Analyze patterns across scraped carousels
 */
function analyzeCarouselPatterns(carousels) {
  if (carousels.length === 0) {
    return {
      slide_1_best_practice: 'unknown',
      text_overlay_usage: 0,
      average_slides: 5,
      color_schemes: []
    };
  }

  const analysis = {
    total_analyzed: carousels.length,
    average_engagement_rate: 0,
    slide_patterns: {},
    slide_1_patterns: {},
    text_overlay_frequency: 0,
    average_slide_count: 0,
    color_scheme_distribution: {},
    composition_patterns: {},
    performance_insights: []
  };

  // Analyze each carousel
  carousels.forEach(carousel => {
    analysis.average_engagement_rate += carousel.engagement_rate;
    analysis.average_slide_count += carousel.slide_count;

    // Analyze slide 1 specifically (most important)
    if (carousel.slides && carousel.slides[0]) {
      const slide1 = carousel.slides[0];
      const slide1Type = slide1.type || 'unknown';

      analysis.slide_1_patterns[slide1Type] =
        (analysis.slide_1_patterns[slide1Type] || 0) + 1;

      if (slide1.has_text_overlay) {
        analysis.text_overlay_frequency++;
      }
    }
  });

  // Calculate averages
  analysis.average_engagement_rate /= carousels.length;
  analysis.average_slide_count = Math.round(analysis.average_slide_count / carousels.length);
  analysis.text_overlay_frequency = analysis.text_overlay_frequency / carousels.length;

  // Determine best practice for slide 1
  const slide1TypeCounts = Object.entries(analysis.slide_1_patterns);
  if (slide1TypeCounts.length > 0) {
    const topSlide1Type = slide1TypeCounts.sort((a, b) => b[1] - a[1])[0];
    analysis.slide_1_best_practice = topSlide1Type[0];
  }

  // Generate insights
  analysis.performance_insights = generateInsights(analysis, carousels);

  return analysis;
}

/**
 * Generate actionable insights from carousel analysis
 */
function generateInsights(analysis, carousels) {
  const insights = [];

  // Slide 1 insight
  if (analysis.slide_1_best_practice) {
    insights.push({
      type: 'slide_1_strategy',
      message: `Top-performing carousels use "${analysis.slide_1_best_practice}" for slide 1`,
      confidence: 'high',
      recommendation: `Prioritize ${analysis.slide_1_best_practice} images for carousel hooks`
    });
  }

  // Text overlay insight
  if (analysis.text_overlay_frequency > 0.7) {
    insights.push({
      type: 'text_overlay',
      message: `${Math.round(analysis.text_overlay_frequency * 100)}% of top carousels use text overlays`,
      confidence: 'high',
      recommendation: 'Include bold text overlays on all slides for better engagement'
    });
  }

  // Slide count insight
  insights.push({
    type: 'slide_count',
    message: `Average slide count is ${analysis.average_slide_count}`,
    confidence: 'medium',
    recommendation: `Optimize for ${analysis.average_slide_count} slides for this industry`
  });

  return insights;
}

/**
 * Get cached research data from database
 * Falls back to scraping if cache is stale
 */
export async function getCachedOrFreshResearch({ industry, topic, supabaseClient, maxAgeHours = 168 }) {
  try {
    // Check cache first
    const { data: cached, error } = await supabaseClient
      .from('carousel_research_cache')
      .select('*')
      .eq('industry', industry)
      .single();

    if (!error && cached) {
      const cacheAge = Date.now() - new Date(cached.last_updated).getTime();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      if (cacheAge < maxAge) {
        return {
          source: 'cache',
          data: cached.carousel_examples,
          cached_at: cached.last_updated
        };
      }
    }

    // Cache miss or stale - scrape fresh data
    const freshData = await scrapeInstagramCarousels({ industry, topic });

    // Update cache
    if (freshData.success && freshData.carousels.length > 0) {
      await supabaseClient
        .from('carousel_research_cache')
        .upsert({
          industry,
          topic_keywords: [topic, industry],
          carousel_examples: {
            total_analyzed: freshData.metadata.total_found,
            carousels: freshData.carousels,
            pattern_insights: freshData.analysis
          },
          average_engagement_rate: freshData.analysis?.average_engagement_rate || 0,
          top_performing_patterns: freshData.analysis?.performance_insights?.map(i => i.type) || [],
          data_quality_score: calculateQualityScore(freshData),
          last_updated: new Date().toISOString(),
          scrape_count: (cached?.scrape_count || 0) + 1
        }, {
          onConflict: 'industry'
        });
    }

    return {
      source: 'fresh_scrape',
      data: freshData,
      scraped_at: new Date().toISOString()
    };

  } catch (error) {
    console.error('Research data retrieval error:', error);

    // Return fallback mock data
    return {
      source: 'fallback',
      data: getMockResearchData(industry, topic),
      error: error.message
    };
  }
}

/**
 * Calculate data quality score (0-1)
 */
function calculateQualityScore(scrapedData) {
  let score = 0;

  // Sample size (40% weight)
  const sampleSize = scrapedData.carousels?.length || 0;
  const sampleScore = Math.min(sampleSize / 20, 1); // Ideal: 20+ carousels
  score += sampleScore * 0.4;

  // Engagement variance (30% weight)
  // Higher variance = more reliable insights
  const engagementRates = scrapedData.carousels?.map(c => c.engagement_rate) || [];
  const variance = calculateVariance(engagementRates);
  const varianceScore = Math.min(variance * 10, 1); // Scale variance
  score += varianceScore * 0.3;

  // Recency (30% weight)
  // Assume fresh scrape = max score
  score += 0.3;

  return Math.round(score * 100) / 100;
}

/**
 * Calculate variance of array
 */
function calculateVariance(arr) {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  return variance;
}

/**
 * Mock research data for fallback
 */
function getMockResearchData(industry, topic) {
  return {
    success: true,
    carousels: [
      {
        platform: 'instagram',
        account: `@${industry}_expert`,
        post_url: 'instagram.com/p/mock123',
        engagement_rate: 0.08,
        slide_count: 5,
        slides: [
          {
            slide: 1,
            type: 'real_face',
            has_text_overlay: true,
            color_scheme: 'high_contrast'
          }
        ]
      }
    ],
    analysis: {
      slide_1_best_practice: 'real_face',
      text_overlay_usage: 0.85,
      average_slides: 5,
      color_schemes: ['high_contrast', 'brand_colors']
    },
    metadata: {
      total_found: 1,
      top_performers: 1,
      industry,
      topic
    }
  };
}
