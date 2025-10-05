import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { Package, ServicePlan, QuickWin } from '../types';
import { SERVICE_MAPPER_SYSTEM, buildServiceMappingPrompt } from './prompts';

const ServicePlanSchema = z.object({
  packages: z.array(
    z.object({
      name: z.enum(['Starter', 'Core', 'Scale']),
      monthlyRangeUsd: z.tuple([z.number(), z.number()]),
      lineItems: z.array(
        z.object({
          title: z.string(),
          opIds: z.array(z.string()),
          deliverables: z.array(z.string()),
        })
      ),
    })
  ),
  plan30_60_90: z.array(
    z.object({
      phase: z.string(),
      milestones: z.array(z.string()),
      requiredInputs: z.array(z.string()),
      risks: z.array(z.string()).optional(),
    })
  ),
  notes: z.array(z.string()).optional(),
});

export async function mapToServicePlan(
  opportunities: QuickWin[],
  selectedIds: string[]
): Promise<ServicePlan> {
  const userPrompt = buildServiceMappingPrompt(opportunities, selectedIds);

  const result = await generateObject({
    model: anthropic('claude-sonnet-4-20250514'),
    system: SERVICE_MAPPER_SYSTEM,
    prompt: userPrompt,
    schema: ServicePlanSchema,
  });

  return result.object as ServicePlan;
}

export function autoSelectOpportunities(opportunities: QuickWin[]): string[] {
  // Auto-select top opportunities based on priority score
  const sorted = opportunities.sort((a, b) => {
    const effortMap = { low: 1, med: 2, high: 3 };
    const aScore = (a.impactBand.likely / effortMap[a.effort]) * a.confidence;
    const bScore = (b.impactBand.likely / effortMap[b.effort]) * b.confidence;
    return bScore - aScore;
  });

  // Select top 8-12 opportunities, prioritizing quick wins
  return sorted.slice(0, 12).map((op) => op.id);
}

export function calculatePackageImpact(opportunities: QuickWin[], packageName: string): {
  conservative: number;
  likely: number;
  aggressive: number;
} {
  const relevantOps = opportunities.filter((op) => {
    if (packageName === 'Starter') return op.effort === 'low' || op.category === 'SEO';
    if (packageName === 'Core') return op.effort !== 'high';
    return true; // Scale includes all
  });

  return relevantOps.reduce(
    (acc, op) => ({
      conservative: acc.conservative + op.impactBand.conservative,
      likely: acc.likely + op.impactBand.likely,
      aggressive: acc.aggressive + op.impactBand.aggressive,
    }),
    { conservative: 0, likely: 0, aggressive: 0 }
  );
}
