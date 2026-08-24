import { z } from 'zod';

/**
 * Input schema for keyword research
 */
export const inputSchema = z.object({
  seed_keyword: z.string()
    .min(1, 'Keyword is required')
    .max(100, 'Keyword too long'),

  location: z.string()
    .default('2840'), // United States

  language: z.string()
    .default('en'),

  limit: z.number()
    .min(10)
    .max(100)
    .default(50)
    .optional()
});

/**
 * Output schema for keyword research results
 */
export const outputSchema = z.object({
  keywords: z.array(z.object({
    keyword: z.string(),
    search_volume: z.number(),
    competition: z.number(),
    competition_level: z.enum(['Low', 'Medium', 'High']),
    cpc: z.number(),
    difficulty: z.number(),
    trend: z.number(),
    opportunity_score: z.number()
  })),
  count: z.number(),
  search_term: z.string(),
  location: z.string(),
  business_context: z.object({
    industry: z.string().optional(),
    location: z.string().optional(),
    core_offerings: z.array(z.string()).optional()
  }).optional()
});

/**
 * Configuration schema for user preferences
 */
export const configSchema = z.object({
  default_location: z.string()
    .default('2840'),

  default_language: z.string()
    .default('en'),

  results_limit: z.number()
    .min(10)
    .max(100)
    .default(50),

  auto_save_to_posts: z.boolean()
    .default(false),

  show_trends: z.boolean()
    .default(true),

  min_search_volume: z.number()
    .default(0)
});

/**
 * Location options
 */
export const locationOptions = [
  { value: '2840', label: 'United States' },
  { value: '2826', label: 'United Kingdom' },
  { value: '2124', label: 'Canada' },
  { value: '2036', label: 'Australia' },
  { value: '2554', label: 'New Zealand' }
];
