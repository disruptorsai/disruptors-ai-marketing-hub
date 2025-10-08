import Anthropic from '@anthropic-ai/sdk';
import { SERVICE_MAPPER_SYSTEM, buildServiceMappingPrompt } from './prompts.js';

/**
 * Map opportunities to service packages and create 30/60/90 day plan
 * @param {import('../types.js').QuickWin[]} opportunities - All detected opportunities
 * @param {string[]} selectedIds - IDs of selected opportunities to map
 * @returns {Promise<import('../types.js').ServicePlan>} Service plan with packages and timeline
 */
export async function mapToServicePlan(opportunities, selectedIds) {
  const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  });

  const userPrompt = buildServiceMappingPrompt(opportunities, selectedIds);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: SERVICE_MAPPER_SYSTEM,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  // Extract JSON from response
  const content = message.content[0].text;
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse service plan from AI response');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Auto-select top opportunities based on priority score
 * @param {import('../types.js').QuickWin[]} opportunities - All opportunities
 * @returns {string[]} IDs of auto-selected opportunities
 */
export function autoSelectOpportunities(opportunities) {
  // Auto-select top opportunities based on priority score
  const effortMap = { low: 1, med: 2, high: 3 };

  const sorted = opportunities.sort((a, b) => {
    const aScore = (a.impactBand.likely / effortMap[a.effort]) * a.confidence;
    const bScore = (b.impactBand.likely / effortMap[b.effort]) * b.confidence;
    return bScore - aScore;
  });

  // Select top 8-12 opportunities, prioritizing quick wins
  return sorted.slice(0, 12).map((op) => op.id);
}

/**
 * Calculate total impact for a package
 * @param {import('../types.js').QuickWin[]} opportunities - All opportunities
 * @param {string} packageName - Package name (Starter, Core, Scale)
 * @returns {{ conservative: number, likely: number, aggressive: number }} Impact bands
 */
export function calculatePackageImpact(opportunities, packageName) {
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
