/**
 * Brand Voice Validator
 *
 * Validates content against Brand DNA rules to ensure consistency with brand voice,
 * tone, style, lexicon, and taboos.
 *
 * @module BrandVoiceValidator
 */

/**
 * Validate content against Brand DNA rules
 *
 * @param {string} content - Content to validate
 * @param {Object} brandDNA - Brand DNA rules object
 * @param {Array<string>} brandDNA.voice - Voice characteristics
 * @param {Array<string>} brandDNA.tone - Tone attributes
 * @param {Array<string>} brandDNA.style - Style guidelines
 * @param {Array<string>} brandDNA.lexicon - Preferred terms
 * @param {Array<string>} brandDNA.taboos - Words/phrases to avoid
 * @param {Array<string>} brandDNA.examples - Good examples
 * @returns {Object} Validation result
 */
export async function validateBrandVoice(content, brandDNA) {
  if (!content || !brandDNA) {
    return {
      isValid: true,
      score: 100,
      issues: [],
      suggestions: [],
      compliance: {
        voice: { score: 100, issues: [] },
        tone: { score: 100, issues: [] },
        style: { score: 100, issues: [] },
        lexicon: { score: 100, issues: [] },
        taboos: { score: 100, issues: [] }
      }
    };
  }

  const issues = [];
  const suggestions = [];
  const contentLower = content.toLowerCase();

  // Check for taboo words/phrases
  const tabooViolations = [];
  if (brandDNA.taboos && brandDNA.taboos.length > 0) {
    brandDNA.taboos.forEach(taboo => {
      const tabooLower = taboo.toLowerCase();
      if (contentLower.includes(tabooLower)) {
        tabooViolations.push({
          term: taboo,
          severity: 'high',
          message: `Avoid using "${taboo}" - it's on the brand taboo list`
        });
        issues.push(`❌ Contains taboo term: "${taboo}"`);
      }
    });
  }

  // Check for preferred terms usage
  const lexiconUsage = [];
  if (brandDNA.lexicon && brandDNA.lexicon.length > 0) {
    brandDNA.lexicon.forEach(term => {
      const termLower = term.toLowerCase();
      if (contentLower.includes(termLower)) {
        lexiconUsage.push(term);
      }
    });
  }

  // Analyze tone consistency (basic sentiment analysis)
  const toneScore = analyzeToneConsistency(content, brandDNA.tone || []);

  // Analyze style consistency
  const styleScore = analyzeStyleConsistency(content, brandDNA.style || []);

  // Calculate scores
  const tabooScore = tabooViolations.length === 0 ? 100 : Math.max(0, 100 - (tabooViolations.length * 20));
  const lexiconScore = brandDNA.lexicon && brandDNA.lexicon.length > 0
    ? Math.min(100, (lexiconUsage.length / brandDNA.lexicon.length) * 150) // Bonus for using preferred terms
    : 100;

  // Overall score (weighted average)
  const overallScore = Math.round(
    (tabooScore * 0.4) + // Taboos most important (40%)
    (lexiconScore * 0.2) + // Lexicon usage (20%)
    (toneScore * 0.2) + // Tone consistency (20%)
    (styleScore * 0.2) // Style consistency (20%)
  );

  // Generate suggestions
  if (tabooViolations.length === 0 && lexiconUsage.length < (brandDNA.lexicon?.length || 0) / 2) {
    suggestions.push({
      type: 'lexicon',
      message: `Consider using more brand-preferred terms: ${brandDNA.lexicon?.slice(0, 3).join(', ')}`
    });
  }

  if (toneScore < 70) {
    suggestions.push({
      type: 'tone',
      message: `Adjust tone to align with brand attributes: ${brandDNA.tone?.join(', ')}`
    });
  }

  if (styleScore < 70) {
    suggestions.push({
      type: 'style',
      message: `Follow brand style guidelines: ${brandDNA.style?.join(', ')}`
    });
  }

  return {
    isValid: tabooViolations.length === 0,
    score: overallScore,
    issues,
    suggestions,
    violations: tabooViolations,
    compliance: {
      voice: {
        score: 100, // Voice is subjective, difficult to score automatically
        issues: []
      },
      tone: {
        score: toneScore,
        issues: toneScore < 70 ? [`Tone doesn't fully align with: ${brandDNA.tone?.join(', ')}`] : []
      },
      style: {
        score: styleScore,
        issues: styleScore < 70 ? [`Style doesn't fully match: ${brandDNA.style?.join(', ')}`] : []
      },
      lexicon: {
        score: lexiconScore,
        issues: lexiconScore < 70 ? [`Use more brand-preferred terms`] : [],
        termsUsed: lexiconUsage,
        termsAvailable: brandDNA.lexicon || []
      },
      taboos: {
        score: tabooScore,
        issues: tabooViolations.map(v => v.message),
        violations: tabooViolations
      }
    }
  };
}

/**
 * Analyze tone consistency (basic implementation)
 *
 * @param {string} content - Content to analyze
 * @param {Array<string>} toneAttributes - Expected tone attributes
 * @returns {number} Score 0-100
 */
function analyzeToneConsistency(content, toneAttributes) {
  if (!toneAttributes || toneAttributes.length === 0) return 100;

  const contentLower = content.toLowerCase();
  let score = 70; // Base score

  // Simple keyword matching for tone analysis
  const toneKeywords = {
    professional: ['professional', 'expertise', 'quality', 'proven', 'certified'],
    casual: ['hey', 'awesome', 'cool', 'fun', 'easy'],
    friendly: ['we', 'you', 'together', 'help', 'support'],
    authoritative: ['must', 'should', 'proven', 'fact', 'research'],
    conversational: ['you', 'your', 'we', 'let\'s', 'together'],
    technical: ['technical', 'system', 'process', 'data', 'analysis'],
    empathetic: ['understand', 'feel', 'know', 'care', 'support']
  };

  toneAttributes.forEach(tone => {
    const keywords = toneKeywords[tone.toLowerCase()] || [];
    const matches = keywords.filter(keyword => contentLower.includes(keyword)).length;

    if (matches > 0) {
      score += 10; // Bonus for matching tone indicators
    }
  });

  return Math.min(100, score);
}

/**
 * Analyze style consistency (basic implementation)
 *
 * @param {string} content - Content to analyze
 * @param {Array<string>} styleGuidelines - Style guidelines
 * @returns {number} Score 0-100
 */
function analyzeStyleConsistency(content, styleGuidelines) {
  if (!styleGuidelines || styleGuidelines.length === 0) return 100;

  let score = 70; // Base score
  const contentLower = content.toLowerCase();

  // Check for style guideline compliance
  const styleChecks = {
    'short sentences': content.split('.').filter(s => s.trim().split(' ').length <= 15).length / Math.max(1, content.split('.').length),
    'active voice': !contentLower.includes('was') && !contentLower.includes('were'), // Very basic check
    'bullet points': content.includes('-') || content.includes('•') || content.includes('*'),
    'conversational': contentLower.includes('you') || contentLower.includes('your'),
    'technical': contentLower.includes('system') || contentLower.includes('process'),
    'clear headings': content.includes('#') || content.includes('\n\n')
  };

  styleGuidelines.forEach(guideline => {
    const guidelineLower = guideline.toLowerCase();

    // Check if guideline matches any style checks
    Object.keys(styleChecks).forEach(checkKey => {
      if (guidelineLower.includes(checkKey)) {
        const passes = styleChecks[checkKey];
        if (passes) {
          score += 10;
        }
      }
    });
  });

  return Math.min(100, score);
}

/**
 * Get brand voice validation summary
 *
 * @param {Object} validationResult - Result from validateBrandVoice
 * @returns {string} Human-readable summary
 */
export function getValidationSummary(validationResult) {
  const { score, isValid, issues, suggestions } = validationResult;

  let summary = `Brand Voice Score: ${score}/100\n\n`;

  if (isValid) {
    summary += '✅ No taboo violations detected\n';
  } else {
    summary += '❌ Brand voice issues detected:\n';
    issues.forEach(issue => {
      summary += `  ${issue}\n`;
    });
  }

  if (suggestions.length > 0) {
    summary += '\n💡 Suggestions for improvement:\n';
    suggestions.forEach(suggestion => {
      summary += `  • ${suggestion.message}\n`;
    });
  }

  return summary;
}

/**
 * Get suggested rewrites to fix brand voice issues
 *
 * @param {string} content - Original content
 * @param {Object} brandDNA - Brand DNA rules
 * @param {Object} validationResult - Validation result
 * @returns {Array<Object>} Suggested rewrites
 */
export async function getSuggestedRewrites(content, brandDNA, validationResult) {
  const rewrites = [];

  if (!validationResult.violations || validationResult.violations.length === 0) {
    return rewrites;
  }

  // For each taboo violation, suggest an alternative
  validationResult.violations.forEach(violation => {
    const tabooTerm = violation.term;

    // Find alternative from lexicon if available
    const alternative = brandDNA.lexicon && brandDNA.lexicon.length > 0
      ? brandDNA.lexicon[0] // Use first preferred term as example
      : '[preferred term]';

    rewrites.push({
      original: tabooTerm,
      suggested: alternative,
      reason: violation.message,
      context: extractContext(content, tabooTerm)
    });
  });

  return rewrites;
}

/**
 * Extract context around a term in content
 *
 * @param {string} content - Full content
 * @param {string} term - Term to find context for
 * @returns {string} Context snippet
 */
function extractContext(content, term) {
  const termIndex = content.toLowerCase().indexOf(term.toLowerCase());
  if (termIndex === -1) return '';

  const start = Math.max(0, termIndex - 50);
  const end = Math.min(content.length, termIndex + term.length + 50);

  return '...' + content.substring(start, end) + '...';
}

export default {
  validateBrandVoice,
  getValidationSummary,
  getSuggestedRewrites
};
