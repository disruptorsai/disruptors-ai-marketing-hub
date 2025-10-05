import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { BusinessProfile } from '../types';
import { BUSINESS_ANALYZER_SYSTEM, buildAnalyzerPrompt } from './prompts';

// Zod schema for BusinessProfile validation
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

export interface AnalyzerInput {
  domain: string;
  siteMarkdown: string[];
  topPages: any[];
  metaSummary: string;
  schemaTypes: string[];
  psiScores: { mobile?: number; desktop?: number };
  webVitals: { lcp?: number; inp?: number; cls?: number };
  snippets: string[];
}

export async function analyzeBusinessProfile(input: AnalyzerInput): Promise<BusinessProfile & { confidence: number }> {
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
  } as BusinessProfile & { confidence: number };
}

// Alternative: Use OpenAI GPT-4
export async function analyzeBusinessProfileGPT(input: AnalyzerInput): Promise<BusinessProfile & { confidence: number }> {
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
  } as BusinessProfile & { confidence: number };
}
