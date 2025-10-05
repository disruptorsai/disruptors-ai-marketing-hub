import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { QuickWin, BusinessProfile } from '../types';
import { OPPORTUNITY_DETECTOR_SYSTEM, buildOpportunityPrompt } from './prompts';

const OpportunitySchema = z.object({
  opportunities: z.array(
    z.object({
      id: z.string(),
      category: z.enum(['SEO', 'Content', 'Performance', 'CRO', 'Local', 'Social', 'Paid', 'EmailCRM', 'DataTracking', 'AI']),
      title: z.string(),
      whyItMatters: z.string(),
      impactBand: z.object({
        conservative: z.number().min(1).max(10),
        likely: z.number().min(1).max(10),
        aggressive: z.number().min(1).max(10),
      }),
      effort: z.enum(['low', 'med', 'high']),
      confidence: z.number().min(0).max(1),
      steps: z.array(z.string()).min(1).max(6),
      evidence: z.array(
        z.object({
          url: z.string(),
          note: z.string(),
        })
      ),
      affectedUrls: z.array(z.string()),
    })
  ),
  readinessScore: z.number().min(0).max(100),
  assumptions: z.array(z.string()).optional(),
});

export async function detectOpportunities(
  profile: BusinessProfile,
  readinessScore: number = 50
): Promise<{ opportunities: QuickWin[]; readinessScore: number; assumptions?: string[] }> {
  const userPrompt = buildOpportunityPrompt(profile, readinessScore);

  const result = await generateObject({
    model: anthropic('claude-sonnet-4-20250514'),
    system: OPPORTUNITY_DETECTOR_SYSTEM,
    prompt: userPrompt,
    schema: OpportunitySchema,
  });

  return {
    opportunities: result.object.opportunities as QuickWin[],
    readinessScore: result.object.readinessScore,
    assumptions: result.object.assumptions,
  };
}

export function calculateReadinessScore(profile: BusinessProfile): number {
  let score = 0;
  const weights = {
    brand: 15,
    seo: 25,
    performance: 20,
    content: 15,
    social: 10,
    tech: 15,
  };

  // Brand completeness
  if (profile.brand.name) score += weights.brand * 0.3;
  if (profile.brand.logoUrl) score += weights.brand * 0.3;
  if (profile.brand.palette) score += weights.brand * 0.4;

  // SEO fundamentals
  if (profile.seo.ogPresent) score += weights.seo * 0.3;
  if (profile.seo.jsonLdTypes && profile.seo.jsonLdTypes.length > 0) score += weights.seo * 0.3;
  if (profile.site.sitemapFound) score += weights.seo * 0.2;
  if (profile.seo.metaGaps.length === 0) score += weights.seo * 0.2;

  // Performance
  const mobileScore = profile.seo.pagespeed?.mobileScore || 0;
  const desktopScore = profile.seo.pagespeed?.desktopScore || 0;
  score += weights.performance * ((mobileScore + desktopScore) / 200);

  // Content & Offerings
  if (profile.offerings.products && profile.offerings.products.length > 0) score += weights.content * 0.5;
  if (profile.offerings.services && profile.offerings.services.length > 0) score += weights.content * 0.5;

  // Social presence
  const socialLinks = profile.social.links.length;
  score += weights.social * Math.min(socialLinks / 4, 1);

  // Tech stack
  if (profile.tech.cms) score += weights.tech * 0.3;
  if (profile.tech.analytics && profile.tech.analytics.length > 0) score += weights.tech * 0.4;
  if (profile.tech.framework) score += weights.tech * 0.3;

  return Math.round(score);
}

export function prioritizeOpportunities(opportunities: QuickWin[]): QuickWin[] {
  return opportunities.sort((a, b) => {
    // Calculate priority score: (likely impact / effort level) * confidence
    const effortMap = { low: 1, med: 2, high: 3 };

    const aScore = (a.impactBand.likely / effortMap[a.effort]) * a.confidence;
    const bScore = (b.impactBand.likely / effortMap[b.effort]) * b.confidence;

    return bScore - aScore; // Descending order
  });
}
