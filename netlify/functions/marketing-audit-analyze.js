const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY,
});

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const formData = JSON.parse(event.body);

    // Create detailed prompt for Claude
    const prompt = `You are a senior marketing consultant analyzing a business's marketing audit. Provide a comprehensive, actionable analysis.

BUSINESS INFORMATION:
- Business Name: ${formData.businessName}
- Website: ${formData.website}
- Industry: ${formData.industry}
- Monthly Revenue: ${formData.monthlyRevenue}
- Marketing Budget: ${formData.monthlyMarketingBudget}

CURRENT MARKETING ACTIVITIES:
- Website: ${formData.hasWebsite}
- SEO: ${formData.hasSEO}
- Social Media Platforms: ${formData.socialPlatforms?.join(', ') || 'None'}
- Paid Advertising: ${formData.paidPlatforms?.join(', ') || 'None'}
- Content Types: ${formData.contentTypes?.join(', ') || 'None'}

GOALS & CHALLENGES:
- Primary Goal: ${formData.primaryGoal}
- Secondary Goals: ${formData.secondaryGoals?.join(', ') || 'None'}
- Biggest Challenge: ${formData.biggestChallenge}
- Target Audience: ${formData.targetAudience || 'Not specified'}

DIGITAL PRESENCE:
- Website Age: ${formData.websiteAge}
- Monthly Traffic: ${formData.websiteTraffic}
- Analytics: ${formData.hasAnalytics}
- Conversion Tracking: ${formData.conversionTracking}
- Main Competitors: ${formData.mainCompetitors || 'Not specified'}

ANALYSIS REQUIREMENTS:
1. Calculate an overall marketing maturity score (0-100)
2. Determine maturity level: Beginner (0-40), Growing (41-65), Advanced (66-85), or Expert (86-100)
3. Identify 3-5 key strengths
4. Identify 3-5 key opportunities for improvement
5. Provide 3-4 recommendation categories with specific, actionable items
6. Suggest 2-3 immediate next steps

Format your response as JSON with this structure:
{
  "overallScore": number,
  "maturityLevel": string,
  "strengths": [string array of 3-5 strengths],
  "weaknesses": [string array of 3-5 opportunities],
  "recommendations": [
    {
      "category": string,
      "priority": "High" | "Medium" | "Low",
      "items": [string array of 2-4 specific recommendations]
    }
  ],
  "nextSteps": [string array of 2-3 immediate actions]
}

Be specific, actionable, and focus on high-impact recommendations. Consider the business's industry, budget, and current capabilities.`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parse Claude's response
    const responseText = message.content[0].text;

    // Extract JSON from response (Claude might wrap it in markdown)
    let analysisResults;
    try {
      // Try to find JSON in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResults = JSON.parse(jsonMatch[0]);
      } else {
        analysisResults = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      // Return fallback results if parsing fails
      analysisResults = generateFallbackResults(formData);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(analysisResults),
    };
  } catch (error) {
    console.error('Error in marketing audit analysis:', error);

    // Return fallback results on error
    const fallbackResults = generateFallbackResults(JSON.parse(event.body));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(fallbackResults),
    };
  }
};

function generateFallbackResults(formData) {
  // Calculate basic score based on activities
  let score = 50; // Base score

  // Add points for positive activities
  if (formData.hasWebsite === 'Yes') score += 10;
  if (formData.hasSEO === 'Yes - Actively') score += 10;
  if (formData.hasSEO === 'Yes - Basic') score += 5;
  if (formData.socialPlatforms?.length > 0) score += 5;
  if (formData.paidPlatforms?.length > 0) score += 5;
  if (formData.contentTypes?.length > 0) score += 5;
  if (formData.hasAnalytics === 'Yes') score += 10;
  if (formData.conversionTracking === 'Yes') score += 5;

  const maturityLevel = score >= 80 ? 'Expert' : score >= 66 ? 'Advanced' : score >= 41 ? 'Growing' : 'Beginner';

  return {
    overallScore: Math.min(score, 100),
    maturityLevel,
    strengths: [
      formData.hasWebsite === 'Yes' ? 'Professional website established' : 'Awareness of digital presence needs',
      formData.socialPlatforms?.length > 0 ? `Active on ${formData.socialPlatforms.length} social platform(s)` : 'Clear business goals defined',
      formData.targetAudience ? 'Clear target audience understanding' : 'Open to growth opportunities',
    ].slice(0, 4),
    weaknesses: [
      formData.hasSEO === 'No' || formData.hasSEO === 'Not Sure' ? 'SEO strategy needs development' : null,
      formData.hasAnalytics !== 'Yes' ? 'Missing critical analytics tracking' : null,
      formData.conversionTracking !== 'Yes' ? 'Conversion tracking not implemented' : null,
      formData.paidPlatforms?.length === 0 ? 'Not utilizing paid advertising opportunities' : null,
      formData.contentTypes?.length === 0 ? 'Limited content marketing activity' : null,
    ].filter(Boolean).slice(0, 5),
    recommendations: [
      {
        category: 'SEO & Content Strategy',
        priority: 'High',
        items: [
          'Conduct comprehensive keyword research for your industry',
          'Optimize website technical SEO (speed, mobile, structure)',
          'Create pillar content targeting high-value keywords',
          'Build quality backlinks through outreach and partnerships',
        ],
      },
      {
        category: 'Analytics & Tracking',
        priority: 'High',
        items: [
          'Implement Google Analytics 4 and Google Tag Manager',
          'Set up conversion tracking for all key actions',
          'Create custom dashboards for key metrics',
          'Establish monthly reporting and optimization processes',
        ],
      },
      {
        category: 'Lead Generation',
        priority: 'Medium',
        items: [
          'Optimize landing pages with clear value propositions',
          'Add lead magnets and content upgrades',
          'Implement exit-intent popups and CTAs',
          'Create retargeting campaigns for website visitors',
        ],
      },
    ],
    nextSteps: [
      'Schedule a free strategy call to discuss your custom growth roadmap',
      'Request a detailed competitive analysis report',
      'Explore our Core or Scale packages for comprehensive support',
    ],
  };
}
