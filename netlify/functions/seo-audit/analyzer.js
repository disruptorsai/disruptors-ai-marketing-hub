// SEO Audit Tool - AI Content Analyzer
// Uses Claude to analyze website content and generate recommendations

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY
});

/**
 * Analyze website content with AI
 * @param {object} websiteData - Scraped website data
 * @param {object} keywordData - DataForSEO keyword data
 * @param {function} onProgress - Progress callback
 * @returns {object} Content analysis with scores and recommendations
 */
export async function analyzeContent(websiteData, keywordData, onProgress = null) {
  if (onProgress) onProgress({ step: 'ai_analyzing_content', progress: 70 });

  const prompt = buildAnalysisPrompt(websiteData, keywordData);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      temperature: 0.3, // Lower temperature for more consistent analysis
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const analysisText = message.content[0].text;

    // Parse JSON response
    const analysis = parseAnalysis(analysisText);

    if (onProgress) onProgress({ step: 'generating_recommendations', progress: 80 });

    // Generate detailed recommendations
    const recommendations = await generateRecommendations(websiteData, keywordData, analysis);

    return {
      sections: analysis,
      recommendations: recommendations,
      overallScore: calculateOverallScore(analysis),
      analyzedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('AI analysis error:', error);
    throw new Error(`Failed to analyze content: ${error.message}`);
  }
}

/**
 * Build comprehensive analysis prompt for Claude
 */
function buildAnalysisPrompt(websiteData, keywordData) {
  const { domain, homepage, metaTags, headings, schema, technical, contentStats } = websiteData;
  const { rankedKeywords, metrics } = keywordData;

  return `You are an expert SEO auditor. Analyze this website and provide a detailed assessment.

**Website:** ${domain}

**Current SEO Performance:**
- Ranked Keywords: ${metrics?.totalKeywords || 0}
- Average Position: #${metrics?.avgPosition || 'N/A'}
- Top 10 Rankings: ${metrics?.top10Keywords || 0}
- Estimated Traffic: ${metrics?.estimatedTraffic || 0} visits/month

**Top Ranked Keywords:**
${rankedKeywords?.slice(0, 5).map((kw, i) =>
  `${i + 1}. "${kw.keyword}" - Position #${kw.position} (${kw.searchVolume}/mo)`
).join('\n') || 'None'}

**Homepage Content Preview:**
${homepage?.markdown?.substring(0, 3000) || 'No content available'}

**Meta Tags:**
- Title: ${metaTags?.title || 'MISSING'}
- Description: ${metaTags?.description || 'MISSING'}
- OG Tags: ${metaTags?.ogTitle ? 'Present' : 'MISSING'}
- Canonical: ${metaTags?.canonical || 'MISSING'}

**Headings Structure:**
- H1: ${headings?.h1?.length || 0} (${headings?.h1?.[0] || 'None'})
- H2: ${headings?.h2?.length || 0}
- H3: ${headings?.h3?.length || 0}

**Schema Markup:**
${schema?.length > 0 ? `Present (${schema.length} types)` : 'MISSING'}

**Technical Indicators:**
- Canonical Tag: ${technical?.hasCanonical ? '✓' : '✗'}
- Open Graph: ${technical?.hasOGTags ? '✓' : '✗'}
- Schema: ${technical?.hasSchema ? '✓' : '✗'}
- Mobile Viewport: ${technical?.mobileViewport ? '✓' : '✗'}

**Content Statistics:**
- Total Words: ${contentStats?.totalWords || 0}
- Readability Score: ${contentStats?.readabilityScore || 0}/100

---

Analyze the following 7 categories and provide a JSON response with this EXACT structure:

{
  "metaTags": {
    "score": 0-10,
    "strengths": ["strength 1", "strength 2"],
    "issues": ["issue 1", "issue 2"],
    "recommendations": ["rec 1", "rec 2", "rec 3"]
  },
  "contentDepth": {
    "score": 0-10,
    "strengths": [],
    "issues": [],
    "recommendations": []
  },
  "keywordOptimization": {
    "score": 0-10,
    "strengths": [],
    "issues": [],
    "recommendations": []
  },
  "technicalSEO": {
    "score": 0-10,
    "strengths": [],
    "issues": [],
    "recommendations": []
  },
  "eeatSignals": {
    "score": 0-10,
    "strengths": [],
    "issues": [],
    "recommendations": []
  },
  "userExperience": {
    "score": 0-10,
    "strengths": [],
    "issues": [],
    "recommendations": []
  },
  "competitivePosition": {
    "score": 0-10,
    "strengths": [],
    "issues": [],
    "recommendations": []
  }
}

**Scoring Guidelines:**
- 0-3: Critical issues, needs immediate attention
- 4-6: Moderate issues, significant improvement needed
- 7-8: Good, minor improvements recommended
- 9-10: Excellent, best practices followed

For each category:
- List 2-3 strengths (what's working well)
- List 2-5 critical issues (what's broken or missing)
- Provide 3-5 actionable recommendations (specific, measurable)

Focus on:
1. **Meta Tags**: Title, description, OG tags, canonical
2. **Content Depth**: Word count, comprehensiveness, value
3. **Keyword Optimization**: Target keywords, density, semantic relevance
4. **Technical SEO**: Schema, structure, crawlability
5. **E-E-A-T**: Authority signals, trust indicators, expertise
6. **User Experience**: Readability, navigation, engagement
7. **Competitive Position**: Vs competitors, keyword gaps

Respond ONLY with valid JSON, no additional text.`;
}

/**
 * Parse Claude's analysis response
 */
function parseAnalysis(analysisText) {
  try {
    // Extract JSON from response (in case Claude adds explanation)
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate structure
    const requiredSections = [
      'metaTags',
      'contentDepth',
      'keywordOptimization',
      'technicalSEO',
      'eeatSignals',
      'userExperience',
      'competitivePosition'
    ];

    for (const section of requiredSections) {
      if (!analysis[section]) {
        throw new Error(`Missing section: ${section}`);
      }
    }

    return analysis;

  } catch (error) {
    console.error('Parse error:', error);
    // Return fallback structure
    return createFallbackAnalysis();
  }
}

/**
 * Generate detailed, prioritized recommendations
 */
async function generateRecommendations(websiteData, keywordData, analysis) {
  const prompt = `Based on this SEO audit analysis, generate 15-20 prioritized, actionable recommendations.

Website: ${websiteData.domain}
Overall Performance: ${keywordData.metrics?.totalKeywords || 0} keywords, avg position #${keywordData.metrics?.avgPosition || 'N/A'}

Analysis Summary:
- Meta Tags Score: ${analysis.metaTags?.score || 0}/10
- Content Depth Score: ${analysis.contentDepth?.score || 0}/10
- Keyword Optimization Score: ${analysis.keywordOptimization?.score || 0}/10
- Technical SEO Score: ${analysis.technicalSEO?.score || 0}/10
- E-E-A-T Score: ${analysis.eeatSignals?.score || 0}/10

Generate recommendations in this JSON format:

{
  "critical": [
    {
      "title": "Add Meta Descriptions to All Pages",
      "description": "Your site has no meta descriptions, preventing search engines from understanding page content.",
      "impact": "high",
      "effort": "low",
      "category": "meta_tags",
      "implementation": "Add unique 150-155 character meta descriptions to all pages using react-helmet-async",
      "estimatedTime": "2-4 hours"
    }
  ],
  "high": [...],
  "medium": [...],
  "low": [...]
}

Priority Levels:
- **Critical**: Major issues blocking SEO performance (missing meta tags, no schema, broken structure)
- **High**: Significant opportunities (content expansion, keyword targeting, authority building)
- **Medium**: Important improvements (internal linking, content freshness, social optimization)
- **Low**: Nice-to-have enhancements (advanced features, minor tweaks)

For each recommendation:
- Title: Clear, action-oriented (starts with verb)
- Description: Why it matters (1-2 sentences)
- Impact: high/medium/low (business impact)
- Effort: high/medium/low (time/resources required)
- Category: meta_tags, content, technical, authority, ux, etc.
- Implementation: Specific steps to execute
- Estimated Time: Realistic time estimate

Focus on:
1. Quick wins (high impact, low effort) in critical category
2. Foundation fixes (meta tags, schema, structure)
3. Content opportunities (expansion, optimization)
4. Authority building (E-E-A-T, trust signals)

Respond ONLY with valid JSON.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 6000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const jsonMatch = message.content[0].text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON in recommendations response');
    }

    const recommendations = JSON.parse(jsonMatch[0]);
    return recommendations;

  } catch (error) {
    console.error('Recommendations generation error:', error);
    return createFallbackRecommendations();
  }
}

/**
 * Calculate overall SEO score from section scores
 */
function calculateOverallScore(analysis) {
  const scores = [
    analysis.metaTags?.score || 0,
    analysis.contentDepth?.score || 0,
    analysis.keywordOptimization?.score || 0,
    analysis.technicalSEO?.score || 0,
    analysis.eeatSignals?.score || 0,
    analysis.userExperience?.score || 0,
    analysis.competitivePosition?.score || 0
  ];

  const average = scores.reduce((a, b) => a + b, 0) / scores.length;

  // Convert to 0-100 scale
  return Math.round(average * 10);
}

/**
 * Create fallback analysis if AI fails
 */
function createFallbackAnalysis() {
  const fallbackSection = {
    score: 5,
    strengths: ['Site is accessible'],
    issues: ['Analysis incomplete due to error'],
    recommendations: ['Run manual audit', 'Check technical SEO basics', 'Review content strategy']
  };

  return {
    metaTags: { ...fallbackSection },
    contentDepth: { ...fallbackSection },
    keywordOptimization: { ...fallbackSection },
    technicalSEO: { ...fallbackSection },
    eeatSignals: { ...fallbackSection },
    userExperience: { ...fallbackSection },
    competitivePosition: { ...fallbackSection }
  };
}

/**
 * Create fallback recommendations if AI fails
 */
function createFallbackRecommendations() {
  return {
    critical: [
      {
        title: 'Perform Manual SEO Audit',
        description: 'Automated analysis encountered an error. Conduct manual review of site.',
        impact: 'high',
        effort: 'medium',
        category: 'general',
        implementation: 'Use tools like Screaming Frog, Google Search Console, and manual inspection',
        estimatedTime: '4-8 hours'
      }
    ],
    high: [],
    medium: [],
    low: []
  };
}

/**
 * Format analysis for display
 */
export function formatAnalysisForDisplay(analysis) {
  const sections = analysis.sections || {};
  const overallScore = analysis.overallScore || 0;

  let status = 'Critical Issues';
  if (overallScore >= 70) status = 'Good';
  else if (overallScore >= 50) status = 'Needs Improvement';

  return {
    overallScore: overallScore,
    status: status,
    grade: getGrade(overallScore),
    sections: Object.entries(sections).map(([name, data]) => ({
      name: formatSectionName(name),
      score: data.score || 0,
      issues: data.issues?.length || 0,
      recommendations: data.recommendations?.length || 0
    }))
  };
}

/**
 * Convert score to letter grade
 */
function getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Format camelCase section names to title case
 */
function formatSectionName(name) {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}
