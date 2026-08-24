/**
 * Centralized Image Model Configuration
 *
 * CRITICAL: These models are hard-pinned and validated at runtime
 * Any attempt to use DALL-E will throw errors
 *
 * This file serves as the single source of truth for all image generation models
 * across the entire application.
 */

/**
 * Approved image generation models
 * These are the ONLY models allowed for image generation
 */
export const APPROVED_IMAGE_MODELS = {
  OPENAI: 'gpt-image-1',
  GOOGLE: 'gemini-2.5-flash-image-preview',
  REPLICATE_FLUX: 'black-forest-labs/flux-1.1-pro'
};

/**
 * Forbidden models that will cause runtime errors
 * These models are blocked at the code level
 */
export const FORBIDDEN_MODELS = [
  'dall-e-3',
  'dall-e-2',
  'dall-e',
  'DALL-E'
];

/**
 * Detailed model information and capabilities
 */
export const MODEL_INFO = {
  [APPROVED_IMAGE_MODELS.OPENAI]: {
    name: 'OpenAI gpt-image-1',
    provider: 'openai',
    tier: 'primary',
    capabilities: [
      'text-to-image',
      'image-editing',
      'input-fidelity-control',
      'c2pa-metadata',
      'streaming-support'
    ],
    sizes: ['1024x1024', '1536x1024', '1024x1536'],
    qualities: ['standard', 'hd'],
    inputFidelityLevels: ['low', 'medium', 'high'],
    pricing: {
      '1024x1024_standard': 0.02,
      '1536x1024_standard': 0.03,
      '1024x1536_standard': 0.03,
      'hd_high_fidelity': 0.19
    },
    features: [
      'Natively multimodal (images + text)',
      'Progressive streaming support',
      'C2PA content authenticity metadata',
      'Input fidelity control for logo/face preservation'
    ],
    bestFor: [
      'General purpose image generation',
      'Logo and face preservation (high fidelity)',
      'Commercial photography style',
      'Content that requires authenticity metadata'
    ],
    documentation: 'https://platform.openai.com/docs/guides/images'
  },

  [APPROVED_IMAGE_MODELS.GOOGLE]: {
    name: 'Google Gemini 2.5 Flash Image (Nano Banana)',
    provider: 'google',
    tier: 'secondary',
    capabilities: [
      'text-to-image',
      'image-editing',
      'multi-image-composition',
      'character-consistency',
      'conversational-refinement',
      'high-quality-text-rendering'
    ],
    pricing: {
      perImage: 0.039,
      perMillionTokens: 30.00,
      tokensPerImage: 1290
    },
    features: [
      'SynthID invisible watermarking (automatic)',
      'Natural language image editing',
      'Multi-image composition (up to 3 recommended)',
      'Character consistency across generations',
      'Conversational refinement for iterations',
      'High-quality text rendering in images'
    ],
    bestFor: [
      'Image editing with natural language',
      'Multi-image composition',
      'Character-consistent series',
      'Budget-conscious generation (fixed $0.039)',
      'Content requiring watermarking'
    ],
    documentation: 'https://ai.google.dev/gemini-api/docs/image-generation',
    sdk: '@google/genai v1.21.0+'
  },

  [APPROVED_IMAGE_MODELS.REPLICATE_FLUX]: {
    name: 'Replicate Flux 1.1 Pro',
    provider: 'replicate',
    tier: 'tertiary',
    capabilities: [
      'text-to-image',
      'high-detail-generation',
      'creative-workflows'
    ],
    pricing: {
      perSecond: 0.004
    },
    features: [
      'High-quality creative image generation',
      'Fine detail control',
      'Specialized creative workflows'
    ],
    bestFor: [
      'Specialized creative use cases',
      'High-detail professional imagery',
      'Artistic and creative content'
    ],
    documentation: 'https://replicate.com/black-forest-labs/flux-1.1-pro'
  }
};

/**
 * Model selection recommendations based on use case
 */
export const USE_CASE_RECOMMENDATIONS = {
  'logo-preservation': {
    model: APPROVED_IMAGE_MODELS.OPENAI,
    options: { inputFidelity: 'high', quality: 'hd' }
  },
  'face-preservation': {
    model: APPROVED_IMAGE_MODELS.OPENAI,
    options: { inputFidelity: 'high' }
  },
  'image-editing': {
    model: APPROVED_IMAGE_MODELS.GOOGLE,
    options: {}
  },
  'multi-image-composition': {
    model: APPROVED_IMAGE_MODELS.GOOGLE,
    options: {}
  },
  'budget-generation': {
    model: APPROVED_IMAGE_MODELS.GOOGLE,
    options: {}
  },
  'general-purpose': {
    model: APPROVED_IMAGE_MODELS.OPENAI,
    options: { quality: 'standard' }
  },
  'creative-specialized': {
    model: APPROVED_IMAGE_MODELS.REPLICATE_FLUX,
    options: {}
  }
};

/**
 * Validate model ID against approved list
 * @param {string} model - Model ID to validate
 * @throws {Error} If model is forbidden or not approved
 * @returns {boolean} True if model is approved
 */
export function validateModel(model) {
  // Check if model is forbidden
  const modelLower = model.toLowerCase();
  for (const forbidden of FORBIDDEN_MODELS) {
    if (modelLower.includes(forbidden.toLowerCase())) {
      throw new Error(
        `FORBIDDEN MODEL DETECTED: "${model}"\n` +
        `\nOnly these models are approved:\n` +
        `  - OpenAI: ${APPROVED_IMAGE_MODELS.OPENAI}\n` +
        `  - Google: ${APPROVED_IMAGE_MODELS.GOOGLE}\n` +
        `  - Replicate: ${APPROVED_IMAGE_MODELS.REPLICATE_FLUX}\n` +
        `\nDALL-E usage is ABSOLUTELY FORBIDDEN!`
      );
    }
  }

  // Check if model is approved
  const approvedModels = Object.values(APPROVED_IMAGE_MODELS);
  if (!approvedModels.includes(model)) {
    console.warn(
      `Warning: Model "${model}" is not in the approved list. ` +
      `Approved models: ${approvedModels.join(', ')}`
    );
  }

  return true;
}

/**
 * Get model information
 * @param {string} model - Model ID
 * @returns {Object} Model information or null
 */
export function getModelInfo(model) {
  return MODEL_INFO[model] || null;
}

/**
 * Get recommended model for use case
 * @param {string} useCase - Use case identifier
 * @returns {Object} Recommendation object with model and options
 */
export function getRecommendedModel(useCase) {
  return USE_CASE_RECOMMENDATIONS[useCase] || {
    model: APPROVED_IMAGE_MODELS.OPENAI,
    options: {}
  };
}

/**
 * Calculate estimated cost for generation
 * @param {string} model - Model ID
 * @param {Object} options - Generation options
 * @returns {number} Estimated cost in USD
 */
export function calculateCost(model, options = {}) {
  const info = MODEL_INFO[model];
  if (!info) return 0;

  switch (model) {
    case APPROVED_IMAGE_MODELS.OPENAI: {
      const { size = '1024x1024', quality = 'standard', inputFidelity } = options;
      if (quality === 'hd' && inputFidelity === 'high') {
        return 0.19;
      }
      if (size === '1536x1024' || size === '1024x1536') {
        return 0.03;
      }
      return 0.02;
    }

    case APPROVED_IMAGE_MODELS.GOOGLE:
      return 0.039;

    case APPROVED_IMAGE_MODELS.REPLICATE_FLUX:
      return 0.004; // per second estimate

    default:
      return 0;
  }
}

/**
 * Get all approved models as array
 * @returns {string[]} Array of approved model IDs
 */
export function getApprovedModels() {
  return Object.values(APPROVED_IMAGE_MODELS);
}

/**
 * Check if model is approved
 * @param {string} model - Model ID to check
 * @returns {boolean} True if approved
 */
export function isModelApproved(model) {
  return Object.values(APPROVED_IMAGE_MODELS).includes(model);
}

// Default export for convenience
export default {
  APPROVED_IMAGE_MODELS,
  FORBIDDEN_MODELS,
  MODEL_INFO,
  USE_CASE_RECOMMENDATIONS,
  validateModel,
  getModelInfo,
  getRecommendedModel,
  calculateCost,
  getApprovedModels,
  isModelApproved
};