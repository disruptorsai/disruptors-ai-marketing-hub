import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { BUSINESS_ANALYZER_SYSTEM, buildAnalyzerPrompt } from './prompts.js';

/**
 * Zod schema for BusinessProfile validation
 */
const BusinessProfileSchema = z.object({
  profile: z.object({
    brand: z.object({
      name: z.string().nullable().optional(),
      tagline: z.string().nullable().optional(),
      logoUrl: z.string().nullable().optional(),
      palette: z
        .object({
          primary: z.string().optional(),
          secondary: z.string().optional(),
          neutrals: z.array(z.string()).optional(),
        })
        .optional(),
      fonts: z.array(z.string()).optional(),
      toneKeywords: z.array(z.string()).optional(),
    }),
    site: z.object({
      primaryDomain: z.string(),
      topPages: z.array(
        z.object({
          url: z.string(),
          title: z.string().optional(),
          h1: z.string().optional(),
          og: z.record(z.string()).optional(),
          schemaTypes: z.array(z.string()).optional(),
        })
      ),
      sitemapFound: z.boolean(),
      robots: z.string().nullable(),
    }),
    offerings: z.object({
      products: z.array(z.string()).optional(),
      services: z.array(z.string()).optional(),
      pricingNotes: z.array(z.string()).optional(),
    }),
    icp: z.array(z.string()),
    locations: z.array(z.string()).optional(),
    social: z.object({
      links: z.array(
        z.object({
          platform: z.enum(['linkedin', 'x', 'instagram', 'youtube', 'tiktok', 'facebook', 'other']),
          url: z.string(),
          followers: z.number().optional(),
          postingFrequency: z.string().optional(),
        })
      ),
      summaries: z.record(z.string()).optional(),
    }),
    seo: z.object({
      metaGaps: z.array(z.string()),
      ogPresent: z.boolean(),
      jsonLdTypes: z.array(z.string()).optional(),
      pagespeed: z
        .object({
          mobileScore: z.number().optional(),
          desktopScore: z.number().optional(),
        })
        .optional(),
      webVitals: z
        .object({
          lcp: z.number().optional(),
          inp: z.number().optional(),
          cls: z.number().optional(),
        })
        .optional(),
    }),
    tech: z.object({
      cms: z.string().nullable().optional(),
      framework: z.string().nullable().optional(),
      analytics: z.array(z.string()).optional(),
      hosting: z.string().nullable().optional(),
    }),
    competitors: z.array(z.string()).optional(),
  }),
  confidence: z.number().min(0).max(1),
});

/**
 * @typedef {Object} AnalyzerInput
 * @property {string} domain - Domain being analyzed
 * @property {string[]} siteMarkdown - Array of markdown content from pages
 * @property {Array<{url: string, title?: string, h1?: string}>} topPages - Top pages metadata
 * @property {string} metaSummary - Summary of meta tags
 * @property {string[]} schemaTypes - Detected schema.org types
 * @property {{mobile?: number, desktop?: number}} psiScores - PageSpeed Insights scores
 * @property {{lcp?: number, inp?: number, cls?: number}} webVitals - Core Web Vitals
 * @property {string[]} snippets - Search snippets or additional context
 */

/**
 * Analyze business profile using Claude Sonnet 4.5
 * @param {AnalyzerInput} input - Analysis input data
 * @returns {Promise<import('../types.js').BusinessProfile & {confidence: number}>} Business profile with confidence score
 */
export async function analyzeBusinessProfile(input) {
  const userPrompt = buildAnalyzerPrompt(input);

  const result = await generateObject({
    model: anthropic('claude-sonnet-4-20250514'), // Claude Sonnet 4.5
    system: BUSINESS_ANALYZER_SYSTEM,
    prompt: userPrompt,
    schema: BusinessProfileSchema,
  });

  return {
    ...result.object.profile,
    quickWins: [], // Will be populated by opportunity detector
    confidence: result.object.confidence,
  };
}

/**
 * Analyze business profile using OpenAI GPT-4o (alternative model)
 * @param {AnalyzerInput} input - Analysis input data
 * @returns {Promise<import('../types.js').BusinessProfile & {confidence: number}>} Business profile with confidence score
 */
export async function analyzeBusinessProfileGPT(input) {
  const userPrompt = buildAnalyzerPrompt(input);

  const result = await generateObject({
    model: openai('gpt-4o'),
    system: BUSINESS_ANALYZER_SYSTEM,
    prompt: userPrompt,
    schema: BusinessProfileSchema,
  });

  return {
    ...result.object.profile,
    quickWins: [],
    confidence: result.object.confidence,
  };
}
