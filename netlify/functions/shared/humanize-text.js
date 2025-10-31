/**
 * Multi-Provider Text Humanization Service
 *
 * Transforms AI-generated content to sound more natural and human-like.
 * Supports multiple providers with intelligent fallback:
 * 1. EdgeShop.ai (free, undocumented - best effort)
 * 2. Undetectable.ai (paid, reliable - requires API key)
 * 3. Claude Sonnet 4.5 (fallback - uses existing Anthropic key)
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Provider 1: EdgeShop.ai API
 * Free but undocumented - discovered from ai-humanizer-mcp-server
 */
async function humanizeWithEdgeShop(text) {
  try {
    const response = await fetch('https://api.edgeshop.ai/rewrite/text-detection', {
      method: 'POST',
      headers: {
        'User-Agent': 'disruptors-blog-qa/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'original_text',
        text: text,
        detectionTypeList: ['COPYLEAKS', 'HEMINGWAY']
      })
    });

    if (!response.ok) {
      throw new Error(`EdgeShop.ai returned ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      provider: 'edgeshop',
      detectionResults: data,
      humanizedText: text, // EdgeShop only does detection, not humanization
      aiScore: extractAiScore(data),
      cost: 0
    };
  } catch (error) {
    console.error('EdgeShop.ai error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Provider 2: Undetectable.ai API
 * Paid service with full humanization capabilities
 */
async function humanizeWithUndetectable(text) {
  const apiKey = process.env.UNDETECTABLE_API_KEY;

  if (!apiKey) {
    return { success: false, error: 'No API key configured' };
  }

  try {
    // Step 1: Submit text for humanization
    const submitResponse = await fetch('https://api.undetectable.ai/submit', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: text,
        readability: 'High School',
        purpose: 'General Writing',
        strength: 'More Human' // Options: 'More Human', 'Balanced', 'More Readable'
      })
    });

    if (!submitResponse.ok) {
      throw new Error(`Undetectable.ai submit failed: ${submitResponse.status}`);
    }

    const submitData = await submitResponse.json();
    const documentId = submitData.id;

    // Step 2: Poll for results (max 30 seconds)
    let attempts = 0;
    const maxAttempts = 15;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

      const checkResponse = await fetch(`https://api.undetectable.ai/document/${documentId}`, {
        headers: { 'api-key': apiKey }
      });

      if (!checkResponse.ok) {
        throw new Error(`Undetectable.ai check failed: ${checkResponse.status}`);
      }

      const checkData = await checkResponse.json();

      if (checkData.status === 'done') {
        return {
          success: true,
          provider: 'undetectable',
          humanizedText: checkData.output,
          originalText: text,
          aiScore: checkData.score || 0,
          cost: estimateUndetectableCost(text)
        };
      }

      attempts++;
    }

    throw new Error('Timeout waiting for humanization');
  } catch (error) {
    console.error('Undetectable.ai error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Provider 3: Claude Sonnet 4.5
 * Fallback using prompt engineering for humanization
 */
async function humanizeWithClaude(text) {
  const apiKey = process.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    return { success: false, error: 'No Anthropic API key configured' };
  }

  try {
    const anthropic = new Anthropic({
      apiKey: apiKey
    });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: `You are an expert at transforming AI-generated text to sound more natural and human-like.

Your task is to rewrite the following text to:
1. Remove robotic, overly formal phrasing
2. Add natural variations and contractions
3. Use conversational transitions
4. Maintain the original meaning and key facts
5. Keep the same structure and length
6. Preserve all statistics, numbers, and technical terms exactly

IMPORTANT: Output ONLY the humanized text, no explanations or meta-commentary.

Text to humanize:
${text}

Humanized version:`
      }]
    });

    const humanizedText = message.content[0].text;

    // Estimate tokens used (rough: 1 token ≈ 4 chars)
    const inputTokens = Math.ceil(text.length / 4) + 200; // +200 for prompt
    const outputTokens = Math.ceil(humanizedText.length / 4);
    const cost = (inputTokens * 0.000003) + (outputTokens * 0.000015); // Sonnet 4.5 pricing

    return {
      success: true,
      provider: 'claude',
      humanizedText: humanizedText,
      originalText: text,
      aiScore: null, // Claude doesn't provide detection score
      cost: cost
    };
  } catch (error) {
    console.error('Claude humanization error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main humanization function with intelligent provider fallback
 */
export async function humanizeText(text, options = {}) {
  const {
    preferredProvider = 'auto', // 'auto', 'edgeshop', 'undetectable', 'claude'
    maxLength = 50000, // Max text length to process
    detectOnly = false // Only detect AI, don't humanize
  } = options;

  // Validate input
  if (!text || typeof text !== 'string') {
    return { success: false, error: 'Invalid text input' };
  }

  if (text.length > maxLength) {
    return { success: false, error: `Text too long (${text.length} chars, max ${maxLength})` };
  }

  // Track which providers we try
  const attemptLog = [];

  // Provider selection logic
  const providers = preferredProvider === 'auto'
    ? ['edgeshop', 'undetectable', 'claude']
    : [preferredProvider];

  for (const provider of providers) {
    console.log(`Attempting humanization with provider: ${provider}`);
    attemptLog.push(provider);

    let result;

    switch (provider) {
      case 'edgeshop':
        result = await humanizeWithEdgeShop(text);
        break;
      case 'undetectable':
        result = await humanizeWithUndetectable(text);
        break;
      case 'claude':
        result = await humanizeWithClaude(text);
        break;
      default:
        continue;
    }

    if (result.success) {
      return {
        ...result,
        attemptedProviders: attemptLog
      };
    }

    console.log(`Provider ${provider} failed: ${result.error}`);
  }

  // All providers failed
  return {
    success: false,
    error: 'All humanization providers failed',
    attemptedProviders: attemptLog,
    originalText: text
  };
}

/**
 * Batch humanization for multiple text blocks
 */
export async function humanizeBatch(textArray, options = {}) {
  const results = [];

  for (const text of textArray) {
    const result = await humanizeText(text, options);
    results.push(result);

    // Rate limiting: wait 2 seconds between requests
    if (textArray.indexOf(text) < textArray.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return {
    success: true,
    results: results,
    successCount: results.filter(r => r.success).length,
    failCount: results.filter(r => !r.success).length,
    totalCost: results.reduce((sum, r) => sum + (r.cost || 0), 0)
  };
}

/**
 * Humanize blog post by sections
 */
export async function humanizeBlogPost(blogContent, options = {}) {
  // Split blog into sections (by H2 headings)
  const sections = blogContent.split(/(?=^## )/gm);

  console.log(`Humanizing blog post in ${sections.length} sections`);

  const humanizedSections = [];
  let totalCost = 0;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];

    // Skip very short sections (likely headers only)
    if (section.trim().length < 100) {
      humanizedSections.push(section);
      continue;
    }

    console.log(`Humanizing section ${i + 1}/${sections.length}`);

    const result = await humanizeText(section, options);

    if (result.success) {
      humanizedSections.push(result.humanizedText);
      totalCost += result.cost || 0;
    } else {
      console.warn(`Section ${i + 1} humanization failed, using original`);
      humanizedSections.push(section);
    }

    // Rate limiting between sections
    if (i < sections.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return {
    success: true,
    originalContent: blogContent,
    humanizedContent: humanizedSections.join(''),
    sectionsProcessed: sections.length,
    totalCost: totalCost
  };
}

/**
 * Helper: Extract AI detection score from EdgeShop response
 */
function extractAiScore(edgeShopResponse) {
  try {
    // EdgeShop returns detection results for multiple tools
    const copyleaksResult = edgeShopResponse.find(r => r.detectionType === 'COPYLEAKS');
    if (copyleaksResult && copyleaksResult.detectionResult) {
      return parseFloat(copyleaksResult.detectionResult.ai) || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Helper: Estimate Undetectable.ai cost
 * Pricing: ~$0.01 per 100 words
 */
function estimateUndetectableCost(text) {
  const wordCount = text.split(/\s+/).length;
  return (wordCount / 100) * 0.01;
}
