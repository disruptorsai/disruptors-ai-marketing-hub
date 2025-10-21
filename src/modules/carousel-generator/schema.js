import { z } from 'zod';

/**
 * Input schema for carousel generation
 */
export const inputSchema = z.object({
  topic: z.string()
    .min(5, 'Topic is too short (minimum 5 characters)')
    .max(200, 'Topic is too long (maximum 200 characters)'),

  slide_count: z.number()
    .min(3, 'Minimum 3 slides required')
    .max(10, 'Maximum 10 slides allowed')
    .default(5),

  style_template: z.enum(['educational', 'promotional', 'storytelling', 'statistical'])
    .default('educational'),

  advanced_mode: z.boolean()
    .default(false)
    .describe('Enable strategy review before generation'),

  brain_id: z.string().uuid().optional(),

  // Optional strategy overrides (for Advanced Mode edits)
  strategy_overrides: z.array(z.object({
    slide: z.number(),
    method: z.enum(['generate', 'download', 'download_modify', 'download_combine']),
    reasoning: z.string().optional()
  })).optional()
});

/**
 * Strategy schema - AI-generated carousel outline
 */
export const strategySchema = z.object({
  slides: z.array(z.object({
    slide: z.number(),
    text: z.string(),
    image_description: z.string(),
    image_strategy: z.object({
      method: z.enum(['generate', 'download', 'download_modify', 'download_combine']),
      reasoning: z.string(),
      sources: z.array(z.string()),
      modifications: z.string().optional(),
      estimated_cost: z.number()
    })
  })),
  total_estimated_cost: z.number(),
  strategy_confidence: z.enum(['low', 'medium', 'high']),
  key_decisions: z.array(z.string())
});

/**
 * Slide generation result schema
 */
export const slideResultSchema = z.object({
  slide: z.number(),
  success: z.boolean(),
  image_url: z.string().url().optional(),
  image_strategy_used: z.string().optional(),
  actual_cost: z.number().optional(),
  generation_time_ms: z.number().optional(),
  error: z.string().optional()
});

/**
 * Output schema for completed carousel
 */
export const outputSchema = z.object({
  carousel_id: z.string().uuid(),
  topic: z.string(),
  slide_count: z.number(),
  slides: z.array(z.object({
    slide: z.number(),
    text: z.string(),
    image_url: z.string().url(),
    image_strategy_used: z.string()
  })),
  total_cost: z.number(),
  generation_duration_ms: z.number(),
  research_examples_count: z.number().optional(),
  exports: z.object({
    individual_slides: z.array(z.object({
      slide: z.number(),
      url: z.string().url(),
      text: z.string()
    })),
    zip_download_url: z.string().url().optional(),
    canva_json: z.any().optional(),
    captions: z.object({
      main: z.string(),
      alternative: z.string(),
      hashtags: z.array(z.string()),
      cta_suggestions: z.array(z.string())
    }).optional()
  }).optional()
});

/**
 * Configuration schema for user preferences
 */
export const configSchema = z.object({
  default_slide_count: z.number()
    .min(3)
    .max(10)
    .default(5),

  default_style: z.enum(['educational', 'promotional', 'storytelling', 'statistical'])
    .default('educational'),

  preferred_mode: z.enum(['simple', 'advanced'])
    .default('simple'),

  auto_export_zip: z.boolean()
    .default(true),

  show_cost_preview: z.boolean()
    .default(true),

  enable_instagram_captions: z.boolean()
    .default(true),

  // Image sourcing preferences
  preferred_image_source: z.enum(['auto', 'google', 'unsplash', 'pexels'])
    .default('auto'),

  avoid_ai_generation: z.boolean()
    .default(false)
    .describe('Prefer downloaded/edited images over AI-generated'),

  // Research preferences
  research_cache_duration_days: z.number()
    .min(1)
    .max(30)
    .default(7),

  max_research_examples: z.number()
    .min(5)
    .max(20)
    .default(10)
});

/**
 * Style template options
 */
export const styleTemplateOptions = [
  {
    value: 'educational',
    label: 'Educational',
    description: 'Teach something valuable - tips, how-tos, step-by-step guides',
    icon: '📚',
    examples: ['5 Tips to X', 'How to X in Y Steps', 'Complete Guide to X']
  },
  {
    value: 'promotional',
    label: 'Promotional',
    description: 'Promote a product, service, or offer with clear value proposition',
    icon: '🎯',
    examples: ['Why Choose X', 'Introducing X', 'X vs Y Comparison']
  },
  {
    value: 'storytelling',
    label: 'Storytelling',
    description: 'Share a journey, transformation, or before/after narrative',
    icon: '📖',
    examples: ['My Journey from X to Y', 'How I Achieved X', 'Client Success Story']
  },
  {
    value: 'statistical',
    label: 'Data/Stats',
    description: 'Present data, statistics, research findings with visual impact',
    icon: '📊',
    examples: ['X Statistics You Need to Know', 'Industry Report 2025', 'By the Numbers']
  }
];

/**
 * Image strategy method options (for Advanced Mode)
 */
export const imageStrategyMethods = [
  {
    value: 'generate',
    label: 'Generate from Scratch',
    description: 'Create image using AI (OpenAI gpt-image-1)',
    cost: '$0.02-$0.19',
    pros: ['Fully custom', 'Perfect brand alignment', 'No licensing concerns'],
    cons: ['Higher cost', 'May look AI-generated', 'Less realistic for people']
  },
  {
    value: 'download',
    label: 'Download Existing',
    description: 'Find and download from Google/Unsplash/Pexels',
    cost: '$0.00',
    pros: ['Free', 'Real photos', 'High quality'],
    cons: ['May not be perfect match', 'Licensing limits', 'Generic']
  },
  {
    value: 'download_modify',
    label: 'Download + Edit',
    description: 'Download image and edit with Nano Banana',
    cost: '$0.039',
    pros: ['Best of both worlds', 'Real base + custom edits', 'Cost effective'],
    cons: ['Depends on base image quality', 'Edit results vary']
  },
  {
    value: 'download_combine',
    label: 'Download + Compose',
    description: 'Download multiple images and blend with Nano Banana',
    cost: '$0.039',
    pros: ['Unique compositions', 'Combine UI + branding', 'Professional look'],
    cons: ['More complex', 'Requires good composition prompt', 'Depends on sources']
  }
];

/**
 * Validation helpers
 */
export function validateCarouselInput(data) {
  try {
    return {
      success: true,
      data: inputSchema.parse(data)
    };
  } catch (error) {
    return {
      success: false,
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    };
  }
}

export function validateStrategy(data) {
  try {
    return {
      success: true,
      data: strategySchema.parse(data)
    };
  } catch (error) {
    return {
      success: false,
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    };
  }
}

/**
 * Default values
 */
export const defaults = {
  slide_count: 5,
  style_template: 'educational',
  advanced_mode: false,
  research_cache_duration_days: 7,
  max_research_examples: 10,
  preferred_image_source: 'auto'
};

/**
 * Cost estimation helpers
 */
export const costEstimates = {
  base_research_and_strategy: 0.07,
  generated_image_min: 0.02,
  generated_image_max: 0.19,
  generated_image_avg: 0.08,
  downloaded_image: 0.00,
  nano_banana_edit: 0.039,
  nano_banana_compose: 0.039,

  /**
   * Estimate total cost based on strategy
   */
  estimateCarouselCost(strategy) {
    let total = this.base_research_and_strategy;

    for (const slide of strategy.slides) {
      const method = slide.image_strategy?.method;

      switch (method) {
        case 'generate':
          total += this.generated_image_avg;
          break;
        case 'download':
          total += this.downloaded_image;
          break;
        case 'download_modify':
        case 'download_combine':
          total += this.nano_banana_edit;
          break;
      }
    }

    return parseFloat(total.toFixed(4));
  },

  /**
   * Get cost range for slide count
   */
  getCarouselCostRange(slideCount) {
    const minCost = this.base_research_and_strategy + (slideCount * this.downloaded_image);
    const maxCost = this.base_research_and_strategy + (slideCount * this.generated_image_max);
    const avgCost = this.base_research_and_strategy + (slideCount * ((this.generated_image_avg + this.nano_banana_edit) / 2));

    return {
      min: parseFloat(minCost.toFixed(2)),
      max: parseFloat(maxCost.toFixed(2)),
      avg: parseFloat(avgCost.toFixed(2))
    };
  }
};

/**
 * Quota limits by access level
 */
export const quotaLimits = {
  internal: {
    limit: -1, // unlimited
    period: 'unlimited'
  },
  client: {
    limit: 10,
    period: 'monthly'
  },
  public: {
    limit: 0,
    period: 'none'
  }
};
