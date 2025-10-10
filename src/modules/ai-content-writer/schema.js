import { z } from 'zod';

/**
 * Content type enumeration
 */
export const contentTypes = ['blog', 'social', 'email', 'product_description', 'ad_copy'] as const;

/**
 * Tone options
 */
export const toneOptions = ['professional', 'casual', 'technical', 'friendly', 'bold'] as const;

/**
 * Length options
 */
export const lengthOptions = ['short', 'medium', 'long'] as const;

/**
 * Input schema for AI content generation
 */
export const inputSchema = z.object({
  content_type: z.enum(contentTypes, {
    required_error: 'Content type is required',
    invalid_type_error: 'Invalid content type'
  }),

  topic: z.string()
    .min(1, 'Topic is required')
    .max(200, 'Topic too long (max 200 characters)'),

  primary_keyword: z.string()
    .max(100, 'Primary keyword too long (max 100 characters)')
    .optional(),

  secondary_keywords: z.array(z.string())
    .max(5, 'Maximum 5 secondary keywords allowed')
    .optional()
    .default([]),

  tone: z.enum(toneOptions)
    .default('professional'),

  length: z.enum(lengthOptions)
    .default('medium'),

  target_audience: z.string()
    .max(200, 'Target audience description too long (max 200 characters)')
    .optional(),

  include_meta: z.boolean()
    .default(true),

  use_brain_context: z.boolean()
    .default(true)
});

/**
 * Output schema for AI-generated content
 */
export const outputSchema = z.object({
  content: z.string()
    .min(1, 'Generated content cannot be empty'),

  title: z.string()
    .optional(),

  meta_description: z.string()
    .max(160, 'Meta description should be max 160 characters')
    .optional(),

  word_count: z.number()
    .int()
    .positive(),

  business_context: z.object({
    brain_level: z.enum(['starter', 'enhanced', 'expert']).optional(),
    confidence_score: z.number().min(0).max(1).optional(),
    industry: z.string().optional(),
    brand_voice: z.string().optional(),
    core_offerings: z.array(z.string()).optional()
  }).optional(),

  generation_model: z.string(),

  tokens_used: z.number()
    .int()
    .positive()
    .optional()
});

/**
 * Configuration schema for user preferences
 */
export const configSchema = z.object({
  default_tone: z.enum(toneOptions)
    .default('professional'),

  default_length: z.enum(lengthOptions)
    .default('medium'),

  use_brain_context: z.boolean()
    .default(true),

  auto_save_to_posts: z.boolean()
    .default(false),

  include_meta_by_default: z.boolean()
    .default(true),

  model_preference: z.enum(['claude-sonnet-4.5', 'claude-opus-4.1'])
    .default('claude-sonnet-4.5'),

  word_count_targets: z.object({
    short: z.number().int().positive().default(300),
    medium: z.number().int().positive().default(800),
    long: z.number().int().positive().default(1500)
  }).default({
    short: 300,
    medium: 800,
    long: 1500
  })
});

/**
 * Content type display metadata
 */
export const contentTypeMetadata = {
  blog: {
    label: 'Blog Post',
    description: 'Long-form SEO-optimized article (800-2000 words)',
    icon: '📝',
    minLength: 500,
    recommendedTone: 'professional'
  },
  social: {
    label: 'Social Media Post',
    description: 'Engaging social content for platforms (50-300 characters)',
    icon: '📱',
    minLength: 50,
    maxLength: 300,
    recommendedTone: 'casual'
  },
  email: {
    label: 'Email',
    description: 'Professional email content (200-500 words)',
    icon: '📧',
    minLength: 100,
    recommendedTone: 'friendly'
  },
  product_description: {
    label: 'Product Description',
    description: 'Compelling product copy (100-300 words)',
    icon: '🛍️',
    minLength: 50,
    maxLength: 500,
    recommendedTone: 'professional'
  },
  ad_copy: {
    label: 'Ad Copy',
    description: 'Conversion-focused advertising content (25-150 words)',
    icon: '🎯',
    minLength: 25,
    maxLength: 200,
    recommendedTone: 'bold'
  }
};

/**
 * Tone display metadata
 */
export const toneMetadata = {
  professional: {
    label: 'Professional',
    description: 'Formal, authoritative, business-appropriate',
    example: 'Expert insights and industry best practices'
  },
  casual: {
    label: 'Casual',
    description: 'Conversational, friendly, approachable',
    example: 'Hey there! Let\'s chat about...'
  },
  technical: {
    label: 'Technical',
    description: 'Detailed, precise, industry-specific',
    example: 'Advanced configuration and implementation details'
  },
  friendly: {
    label: 'Friendly',
    description: 'Warm, personable, supportive',
    example: 'We\'re here to help you succeed!'
  },
  bold: {
    label: 'Bold',
    description: 'Assertive, confident, contrarian',
    example: 'Stop wasting time. Here\'s what actually works.'
  }
};

/**
 * Length display metadata with word count targets
 */
export const lengthMetadata = {
  short: {
    label: 'Short',
    description: '~300 words',
    wordCount: 300,
    range: [200, 400]
  },
  medium: {
    label: 'Medium',
    description: '~800 words',
    wordCount: 800,
    range: [600, 1000]
  },
  long: {
    label: 'Long',
    description: '~1500 words',
    wordCount: 1500,
    range: [1200, 2000]
  }
};

/**
 * Validate content generation input
 */
export function validateInput(input) {
  return inputSchema.parse(input);
}

/**
 * Validate content generation output
 */
export function validateOutput(output) {
  return outputSchema.parse(output);
}

/**
 * Validate user configuration
 */
export function validateConfig(config) {
  return configSchema.parse(config);
}

/**
 * Get recommended settings for content type
 */
export function getRecommendedSettings(contentType) {
  const metadata = contentTypeMetadata[contentType];
  if (!metadata) return null;

  return {
    tone: metadata.recommendedTone || 'professional',
    length: contentType === 'social' || contentType === 'ad_copy' ? 'short' :
            contentType === 'blog' ? 'long' : 'medium',
    include_meta: contentType === 'blog' || contentType === 'product_description'
  };
}
