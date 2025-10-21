/**
 * Image Strategy AI Decision Engine
 *
 * Uses Claude Sonnet 4.5 to analyze Instagram research data and determine
 * the optimal image sourcing strategy for each carousel slide:
 * - generate: Create from scratch with AI
 * - download: Find and use existing image
 * - download_modify: Download then edit with Nano Banana
 * - download_combine: Composite multiple images with Nano Banana
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Generate carousel outline with intelligent image strategy
 *
 * @param {Object} params
 * @param {string} params.topic - Carousel topic
 * @param {number} params.slideCount - Number of slides (3-10)
 * @param {string} params.styleTemplate - 'educational', 'promotional', 'storytelling', 'statistical'
 * @param {Object} params.brainContext - Business Brain data
 * @param {Object} params.researchData - Instagram carousel research data
 * @returns {Promise<Object>} Carousel outline with image strategies
 */
export async function generateCarouselStrategy({
  topic,
  slideCount,
  styleTemplate,
  brainContext,
  researchData
}) {
  const anthropic = new Anthropic({
    apiKey: process.env.VITE_ANTHROPIC_API_KEY
  });

  // Build comprehensive prompt
  const systemPrompt = buildSystemPrompt(styleTemplate, researchData);
  const userPrompt = buildUserPrompt(topic, slideCount, brainContext);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4.5-20250929',
      max_tokens: 8000,
      temperature: 1.0,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    });

    // Parse JSON response
    const content = response.content[0].text;
    const strategy = JSON.parse(content);

    // Validate and enrich strategy
    const validatedStrategy = validateAndEnrichStrategy(strategy, slideCount);

    return {
      success: true,
      strategy: validatedStrategy,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cost: calculateClaudeCost(response.usage)
      }
    };

  } catch (error) {
    console.error('Strategy generation error:', error);

    return {
      success: false,
      error: error.message,
      fallback: generateFallbackStrategy(topic, slideCount, styleTemplate, brainContext)
    };
  }
}

/**
 * Build system prompt with research insights and image strategy guidelines
 */
function buildSystemPrompt(styleTemplate, researchData) {
  const researchInsights = researchData?.analysis || {};
  const topCarousels = researchData?.carousels?.slice(0, 5) || [];

  return `You are an expert Instagram carousel strategist with deep knowledge of visual content performance.

**Your Mission:**
Analyze successful carousel patterns and determine the optimal image sourcing strategy for each slide.

**Research Insights:**
${JSON.stringify(researchInsights, null, 2)}

**Top Performing Carousels:**
${topCarousels.map((c, i) => `
Carousel ${i + 1}:
- Engagement Rate: ${c.engagement_rate || 'N/A'}
- Slides: ${c.slide_count || 'N/A'}
- Slide 1 Type: ${c.slides?.[0]?.type || 'N/A'}
- Text Overlay: ${c.slides?.[0]?.has_text_overlay ? 'Yes' : 'No'}
`).join('\n')}

**Image Strategy Decision Matrix:**

1. **GENERATE** - Use when:
   - Concept is abstract or metaphorical
   - Need custom brand-specific illustration
   - No suitable real-world reference exists
   - Want complete creative control
   - Cost: $0.02-$0.19 per image

2. **DOWNLOAD** - Use when:
   - Real-world reference photo is ideal (faces, products, locations)
   - Authentic, unedited imagery performs better
   - Stock photo perfectly matches need
   - Cost: $0.00

3. **DOWNLOAD_MODIFY** - Use when:
   - Real photo needs enhancement (color grade, text overlay, cropping)
   - Need to add brand elements to authentic image
   - Existing image is 80% perfect, needs finishing touches
   - Cost: $0.039 (Nano Banana edit)

4. **DOWNLOAD_COMBINE** - Use when:
   - Multiple elements need composition (UI screenshot + branding)
   - Before/after comparisons
   - Product mockups with context images
   - Blending stock photos with graphics
   - Cost: $0.039 (Nano Banana compose)

**Carousel Style: ${styleTemplate}**

Style Guidelines:
- Educational: Focus on clarity, step-by-step visuals, diagrams
- Promotional: Bold hooks, product shots, social proof
- Storytelling: Character consistency, narrative flow, emotional imagery
- Statistical: Data visualizations, charts, infographics

**Output Format:**
Return ONLY valid JSON with this exact structure:

{
  "slides": [
    {
      "slide": 1,
      "text": "Hook headline ONLY (no paragraph, max 8 words)",
      "image_description": "Detailed description for image generation or search",
      "image_strategy": {
        "method": "download_modify",
        "reasoning": "Detailed explanation of why this strategy is optimal based on research data",
        "sources": ["google_image_search:exact search query"],
        "modifications": "Specific Nano Banana instructions (for modify/combine methods)",
        "estimated_cost": 0.039
      }
    },
    {
      "slide": 2,
      "text": "Bold headline\\n\\n2-3 sentence paragraph explaining the point",
      "image_description": "Image description",
      "image_strategy": {
        "method": "download_combine",
        "reasoning": "Why this approach",
        "sources": ["google_image_search:query1", "brand_assets:logo"],
        "modifications": "Composite instructions",
        "estimated_cost": 0.039
      }
    }
  ],
  "total_estimated_cost": 0.15,
  "strategy_confidence": "high",
  "key_decisions": [
    "Slide 1 uses real face based on 80% of top carousels",
    "Text overlays on all slides per research insights"
  ]
}

**Critical Rules:**
1. Slide 1 is ALWAYS a hook headline only (no paragraph)
2. Slides 2-N have headline + 2-3 sentence paragraph
3. Choose image strategy based on research data performance
4. Provide exact search queries for download methods
5. Be specific with Nano Banana modification instructions
6. Calculate accurate cost estimates
7. Explain reasoning for each strategy decision`;
}

/**
 * Build user prompt with specific carousel request
 */
function buildUserPrompt(topic, slideCount, brainContext) {
  return `Create a ${slideCount}-slide Instagram carousel about: "${topic}"

**Brand Context:**
- Business: ${brainContext.business_name || 'Unknown'}
- Industry: ${brainContext.industry || 'General'}
- Brand Voice: ${brainContext.brand_voice || 'Professional'}
- Target Audience: ${brainContext.target_audience || 'General business owners'}
- Key Facts: ${brainContext.key_facts?.slice(0, 5).join(', ') || 'None provided'}
${brainContext.brand_colors ? `- Brand Colors: ${brainContext.brand_colors}` : ''}

**Requirements:**
1. Analyze the research data to determine best image strategy for each slide
2. Prioritize authentic, high-performing visual patterns from research
3. Balance cost-effectiveness with quality
4. Ensure brand consistency across all slides
5. Optimize for Instagram engagement

Return the carousel strategy as JSON.`;
}

/**
 * Validate and enrich generated strategy
 */
function validateAndEnrichStrategy(strategy, expectedSlideCount) {
  // Ensure correct number of slides
  if (!strategy.slides || strategy.slides.length !== expectedSlideCount) {
    throw new Error(`Expected ${expectedSlideCount} slides, got ${strategy.slides?.length || 0}`);
  }

  // Validate each slide
  strategy.slides.forEach((slide, index) => {
    // Ensure required fields
    if (!slide.slide || !slide.text || !slide.image_description || !slide.image_strategy) {
      throw new Error(`Slide ${index + 1} missing required fields`);
    }

    // Validate method
    const validMethods = ['generate', 'download', 'download_modify', 'download_combine'];
    if (!validMethods.includes(slide.image_strategy.method)) {
      throw new Error(`Invalid method "${slide.image_strategy.method}" on slide ${index + 1}`);
    }

    // Ensure sources exist for download methods
    if (slide.image_strategy.method !== 'generate' && !slide.image_strategy.sources?.length) {
      throw new Error(`Slide ${index + 1} using "${slide.image_strategy.method}" but no sources provided`);
    }

    // Set default cost if missing
    if (!slide.image_strategy.estimated_cost) {
      slide.image_strategy.estimated_cost = estimateCostByMethod(slide.image_strategy.method);
    }
  });

  // Calculate total cost if missing
  if (!strategy.total_estimated_cost) {
    strategy.total_estimated_cost = strategy.slides.reduce(
      (sum, slide) => sum + (slide.image_strategy.estimated_cost || 0),
      0.07 // Base research + strategy cost
    );
    strategy.total_estimated_cost = Math.round(strategy.total_estimated_cost * 100) / 100;
  }

  return strategy;
}

/**
 * Estimate cost by generation method
 */
function estimateCostByMethod(method) {
  const costs = {
    'generate': 0.02, // gpt-image-1 standard
    'download': 0.00,
    'download_modify': 0.039, // Nano Banana edit
    'download_combine': 0.039  // Nano Banana compose
  };
  return costs[method] || 0;
}

/**
 * Calculate Claude API cost
 */
function calculateClaudeCost(usage) {
  const inputCost = (usage.input_tokens / 1_000_000) * 3.00; // $3 per 1M input tokens
  const outputCost = (usage.output_tokens / 1_000_000) * 15.00; // $15 per 1M output tokens
  return Math.round((inputCost + outputCost) * 1000) / 1000; // Round to 3 decimals
}

/**
 * Generate fallback strategy if AI fails
 */
function generateFallbackStrategy(topic, slideCount, styleTemplate, brainContext) {
  const slides = [];

  for (let i = 1; i <= slideCount; i++) {
    const isFirstSlide = i === 1;

    slides.push({
      slide: i,
      text: isFirstSlide
        ? `${topic.split(' ').slice(0, 6).join(' ')}`
        : `Point ${i - 1}\n\nExplanation of this point goes here with 2-3 sentences providing value.`,
      image_description: isFirstSlide
        ? `Professional ${brainContext.industry || 'business'} expert looking confident`
        : `Visual representation of point ${i - 1} for ${topic}`,
      image_strategy: {
        method: isFirstSlide ? 'download_modify' : 'generate',
        reasoning: 'Fallback strategy due to AI generation failure',
        sources: isFirstSlide ? [`google_image_search:${brainContext.industry} professional confident`] : [],
        modifications: isFirstSlide ? 'Add dramatic color grade and text overlay' : '',
        estimated_cost: isFirstSlide ? 0.039 : 0.02
      }
    });
  }

  return {
    slides,
    total_estimated_cost: Math.round((0.07 + slides.reduce((sum, s) => sum + s.image_strategy.estimated_cost, 0)) * 100) / 100,
    strategy_confidence: 'low',
    key_decisions: ['Fallback strategy - AI generation failed'],
    fallback: true
  };
}

/**
 * Regenerate strategy for a single slide
 *
 * @param {Object} params
 * @param {Object} params.originalStrategy - Full carousel strategy
 * @param {number} params.slideNumber - Slide to regenerate (1-indexed)
 * @param {string} params.userFeedback - Why user wants regeneration
 * @returns {Promise<Object>} Updated slide strategy
 */
export async function regenerateSlideStrategy({
  originalStrategy,
  slideNumber,
  userFeedback
}) {
  const anthropic = new Anthropic({
    apiKey: process.env.VITE_ANTHROPIC_API_KEY
  });

  const prompt = `You are regenerating slide ${slideNumber} of an Instagram carousel.

**Original Slide:**
${JSON.stringify(originalStrategy.slides[slideNumber - 1], null, 2)}

**Full Carousel Context:**
${JSON.stringify(originalStrategy, null, 2)}

**User Feedback:**
${userFeedback}

**Task:**
Generate a NEW strategy for slide ${slideNumber} that addresses the user's feedback while maintaining consistency with the rest of the carousel.

Return ONLY the updated slide object as JSON (same structure as original).`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4.5-20250929',
      max_tokens: 2000,
      temperature: 1.0,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const updatedSlide = JSON.parse(response.content[0].text);

    return {
      success: true,
      slide: updatedSlide,
      usage: {
        cost: calculateClaudeCost(response.usage)
      }
    };

  } catch (error) {
    console.error('Slide regeneration error:', error);

    return {
      success: false,
      error: error.message,
      slide: originalStrategy.slides[slideNumber - 1] // Return original
    };
  }
}
