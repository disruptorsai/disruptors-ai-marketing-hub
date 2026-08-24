import manifest from './manifest.json';
import { inputSchema, outputSchema, configSchema } from './schema.js';
import KeywordResearchUI from './KeywordResearchUI.jsx';

/**
 * Keyword Research Module
 *
 * AI-powered keyword research with DataForSEO integration.
 * Provides real search volume, competition, and CPC data with
 * intelligent opportunity scoring.
 *
 * Three-Level Access:
 * - Internal: Unlimited searches, all features
 * - Client: 10 searches/day, full results
 * - Public: 3 searches/day, limited results (lead magnet)
 */

export const moduleConfig = {
  manifest,
  component: KeywordResearchUI,

  /**
   * Execute keyword research
   *
   * @param {Object} params - Execution parameters
   * @param {Object} params.input - User input (seed_keyword, location, language, limit)
   * @param {Object} params.user - Current user object
   * @param {Object} params.brain - Business Brain context
   * @param {string} params.audience - Access level (internal/client/public)
   * @param {Object} params.config - User configuration
   * @returns {Promise<Object>} Keyword research results
   */
  async execute({ input, user, brain, audience, config }) {
    // Merge config defaults
    const mergedInput = {
      ...input,
      location: input.location || config?.default_location || '2840',
      language: input.language || config?.default_language || 'en',
      limit: input.limit || config?.results_limit || 50
    };

    // Limit results for public access
    if (audience === 'public') {
      mergedInput.limit = Math.min(mergedInput.limit, 10); // Max 10 for public
    }

    // Call DataForSEO API via Netlify function
    const response = await fetch('/.netlify/functions/dataforseo-keywords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        searchTerm: mergedInput.seed_keyword,
        location: mergedInput.location,
        language: mergedInput.language
      })
    });

    if (!response.ok) {
      throw new Error(`Keyword research failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Keyword research failed');
    }

    // Add Business Brain context
    const businessContext = {};
    if (brain) {
      businessContext.industry = brain.industry;
      businessContext.location = brain.primary_location;

      // Add core offerings for context
      if (brain.core_offerings && Array.isArray(brain.core_offerings)) {
        businessContext.core_offerings = brain.core_offerings;
      }
    }

    // Filter by minimum search volume if configured
    let keywords = data.keywords || [];
    if (config?.min_search_volume > 0) {
      keywords = keywords.filter(kw => kw.search_volume >= config.min_search_volume);
    }

    // Limit number of results
    keywords = keywords.slice(0, mergedInput.limit);

    // Build result
    const result = {
      keywords: keywords,
      count: keywords.length,
      search_term: mergedInput.seed_keyword,
      location: mergedInput.location,
      business_context: businessContext
    };

    return result;
  },

  /**
   * Validate input before execution
   *
   * @param {Object} input - Raw input from user
   * @returns {Object} Validated input
   * @throws {Error} If validation fails
   */
  validateInput(input) {
    return inputSchema.parse(input);
  },

  /**
   * Transform input with Business Brain context
   *
   * @param {Object} input - Validated input
   * @param {Object} brain - Business Brain object
   * @returns {Object} Transformed input with brain context
   */
  transformInput(input, brain) {
    // Don't modify input, just pass through
    // Brain context is added in execute()
    return input;
  }
};

export default moduleConfig;
