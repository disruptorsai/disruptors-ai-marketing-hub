import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { BusinessProfile, QuickWin } from '../types';
import { COPY_STYLIST_SYSTEM, buildCopyPrompt } from './prompts';

const SalesCopySchema = z.object({
  elevator: z.string().max(150),
  valueProps: z.array(z.string().max(50)).length(3),
  benefitLines: z.array(
    z.object({
      opId: z.string(),
      line: z.string(),
    })
  ),
  emailSubject: z.string(),
  emailBody: z.string(),
});

export interface SalesCopy {
  elevator: string;
  valueProps: string[];
  benefitLines: Array<{ opId: string; line: string }>;
  emailSubject: string;
  emailBody: string;
}

export async function generateSalesCopy(
  profile: BusinessProfile,
  opportunities: QuickWin[],
  tone: string = 'professional'
): Promise<SalesCopy> {
  const userPrompt = buildCopyPrompt(profile, opportunities, tone);

  const result = await generateObject({
    model: anthropic('claude-sonnet-4-20250514'),
    system: COPY_STYLIST_SYSTEM,
    prompt: userPrompt,
    schema: SalesCopySchema,
  });

  return result.object as SalesCopy;
}

export function formatEmailBody(
  businessName: string,
  elevator: string,
  topOpportunities: QuickWin[],
  calendarLink: string
): string {
  const opportunityList = topOpportunities
    .slice(0, 5)
    .map((op) => `• ${op.title} - ${op.whyItMatters}`)
    .join('\n');

  return `Hi there,

We just completed an AI-powered growth audit of ${businessName} and found some exciting opportunities.

${elevator}

Here are the top 5 quick wins we identified:

${opportunityList}

I'd love to walk you through the full analysis and show you our 30/60/90 day plan to implement these improvements.

${calendarLink ? `Book a 15-minute strategy call: ${calendarLink}` : 'Reply to this email to schedule a quick call.'}

Best regards,
Growth Audit Team`;
}
