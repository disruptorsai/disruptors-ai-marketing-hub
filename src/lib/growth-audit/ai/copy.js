import Anthropic from '@anthropic-ai/sdk';
import { COPY_STYLIST_SYSTEM, buildCopyPrompt } from './prompts.js';

/**
 * @typedef {Object} SalesCopy
 * @property {string} elevator - Elevator pitch (≤150 chars)
 * @property {string[]} valueProps - Three value propositions (≤50 chars each)
 * @property {Array<{opId: string, line: string}>} benefitLines - Benefit lines per opportunity
 * @property {string} emailSubject - Email subject line
 * @property {string} emailBody - Email body copy
 */

/**
 * Generate sales copy for growth audit results
 * @param {import('../types.js').BusinessProfile} profile - Business profile
 * @param {import('../types.js').QuickWin[]} opportunities - Top opportunities
 * @param {string} [tone='professional'] - Desired tone
 * @returns {Promise<SalesCopy>} Generated sales copy
 */
export async function generateSalesCopy(profile, opportunities, tone = 'professional') {
  const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  });

  const userPrompt = buildCopyPrompt(profile, opportunities, tone);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: COPY_STYLIST_SYSTEM,
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
    throw new Error('Failed to parse sales copy from AI response');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Format email body with opportunities
 * @param {string} businessName - Business name
 * @param {string} elevator - Elevator pitch
 * @param {import('../types.js').QuickWin[]} topOpportunities - Top 5 opportunities
 * @param {string} [calendarLink=''] - Calendar booking link
 * @returns {string} Formatted email body
 */
export function formatEmailBody(businessName, elevator, topOpportunities, calendarLink = '') {
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
