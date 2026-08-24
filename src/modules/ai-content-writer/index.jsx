import manifest from './manifest.json';
import { inputSchema, outputSchema, configSchema } from './schema.js';
import AIContentWriterUI from './AIContentWriterUI.jsx';

/**
 * AI Content Writer Module
 *
 * AI-powered content generation with Claude Sonnet 4.5 integration.
 * Generates SEO-optimized content with Business Brain context for
 * brand-consistent, targeted content creation.
 *
 * Three-Level Access:
 * - Internal: Unlimited generations, all content types, advanced options
 * - Client: Quota-limited, all content types, brain context
 * - Public: Limited to 1 content type (blog), max 300 words, lead magnet
 */

export const moduleConfig = {
  manifest,
  component: AIContentWriterUI,

  /**
   * Execute AI content generation
   *
   * @param {Object} params - Execution parameters
   * @param {Object} params.input - User input (content_type, topic, keywords, tone, length, target_audience)
   * @param {Object} params.user - Current user object
   * @param {Object} params.brain - Business Brain context
   * @param {string} params.audience - Access level (internal/client/public)
   * @param {Object} params.config - User configuration
   * @returns {Promise<Object>} Generated content results
   */
  async execute({ input, user, brain, audience, config }) {
    // Merge config defaults
    const mergedInput = {
      ...input,
      tone: input.tone || config?.default_tone || 'professional',
      length: input.length || config?.default_length || 'medium',
      include_meta: config?.include_meta !== false
    };

    // Apply access-level restrictions for public users
    if (audience === 'public') {
      mergedInput.content_type = 'blog'; // Force blog type
      mergedInput.max_words = 300; // Limit word count
      mergedInput.include_meta = false; // No meta descriptions
    }

    // Build request payload with Business Brain context
    const requestBody = {
      content_type: mergedInput.content_type,
      topic: mergedInput.topic,
      primary_keyword: mergedInput.primary_keyword || null,
      secondary_keywords: mergedInput.secondary_keywords || [],
      tone: mergedInput.tone,
      length: mergedInput.length,
      target_audience: mergedInput.target_audience || null,
      max_words: mergedInput.max_words || null,
      include_meta: mergedInput.include_meta,
      // Add Business Brain context
      brain_context: brain ? {
        business_name: brain.business_name,
        industry: brain.industry,
        brand_voice: brain.brand_voice || null,
        tone_attributes: brain.tone_attributes || [],
        target_audience: brain.ideal_customer_profile || null,
        unique_value_props: brain.unique_value_propositions || [],
        core_offerings: brain.core_offerings || []
      } : null
    };

    // Call AI Content Writer Netlify function
    const response = await fetch('/.netlify/functions/module-ai-content-writer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Content generation failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Content generation failed');
    }

    // Add Business Brain context to result
    const businessContext = {};
    if (brain) {
      businessContext.industry = brain.industry;
      businessContext.target_audience = brain.ideal_customer_profile;
      businessContext.brand_voice = brain.brand_voice;
      businessContext.business_name = brain.business_name;
    }

    // Build result
    const result = {
      content: data.content,
      title: data.title || null,
      meta_description: data.meta_description || null,
      word_count: data.word_count || 0,
      content_type: mergedInput.content_type,
      topic: mergedInput.topic,
      business_context: businessContext,
      generated_at: new Date().toISOString()
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
    // Apply brain-based defaults if available
    if (brain) {
      return {
        ...input,
        // Use brain's target audience if not specified
        target_audience: input.target_audience || brain.ideal_customer_profile,
        // Use brain's brand voice as tone if not specified
        tone: input.tone || brain.brand_voice || 'professional'
      };
    }
    return input;
  }
};

export default moduleConfig;
