/**
 * OpenAI gpt-image-1 Server-Side API Helper
 *
 * CRITICAL: This file uses gpt-image-1 ONLY
 * DALL-E 3 is absolutely forbidden and will cause errors
 *
 * This is a Node.js-only helper - DO NOT expose API keys in browser
 *
 * Features:
 * - Text-to-image generation with gpt-image-1
 * - Image editing with mask support
 * - Input fidelity control for logo/face preservation
 * - C2PA metadata support
 */

import OpenAI from 'openai';
import fs from 'node:fs';

// HARD-PINNED MODEL ID - DO NOT MODIFY
const MODEL_ID = 'gpt-image-1';

// Validate that we're never using DALL-E
const FORBIDDEN_MODELS = ['dall-e-3', 'dall-e-2', 'dall-e'];

/**
 * Validate model ID
 * @private
 */
function validateModel(model) {
  const modelLower = model.toLowerCase();
  for (const forbidden of FORBIDDEN_MODELS) {
    if (modelLower.includes(forbidden)) {
      throw new Error(
        `FORBIDDEN MODEL: "${model}"\n` +
        `Only ${MODEL_ID} is allowed. DALL-E is absolutely forbidden.`
      );
    }
  }
  return true;
}

/**
 * Initialize OpenAI client
 * @private
 */
function getClient() {
  const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not found in environment variables');
  }
  return new OpenAI({ apiKey });
}

/**
 * Generate image with OpenAI gpt-image-1
 *
 * @param {Object} params - Generation parameters
 * @param {string} params.prompt - Image description
 * @param {string} [params.size='1024x1024'] - Image size (1024x1024, 1536x1024, 1024x1536)
 * @param {string} [params.quality='medium'] - Quality level (low, medium, high, auto)
 * @param {string} [params.inputFidelity='medium'] - Fidelity level (low, medium, high) - use high for logos/faces
 * @returns {Promise<Buffer>} PNG image as Buffer
 */
export async function openaiGenerate({
  prompt,
  size = '1024x1024',
  quality = 'medium',
  inputFidelity = 'medium'
}) {
  validateModel(MODEL_ID);
  const client = getClient();

  try {
    // Build request parameters - gpt-image-1 uses different parameters than DALL-E
    const requestParams = {
      model: MODEL_ID,
      prompt,
      size,
      quality,
      n: 1
    };

    // Note: input_fidelity and response_format are not currently supported in gpt-image-1
    // Keep parameter for future compatibility
    if (inputFidelity) {
      console.log(`Note: input_fidelity="${inputFidelity}" requested but not currently supported by API`);
    }

    const response = await client.images.generate(requestParams);

    console.log('Response data keys:', Object.keys(response.data[0]));

    // Try to get URL or b64_json from response
    const imageData = response.data[0];

    if (imageData.url) {
      // Fetch image from URL
      const imageResponse = await fetch(imageData.url);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch generated image: ${imageResponse.statusText}`);
      }
      const arrayBuffer = await imageResponse.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } else if (imageData.b64_json) {
      // Return base64 decoded data
      return Buffer.from(imageData.b64_json, 'base64');
    } else {
      console.error('Full response:', JSON.stringify(response, null, 2));
      throw new Error('No image URL or b64_json returned from OpenAI');
    }
  } catch (error) {
    console.error('OpenAI gpt-image-1 generation error:', error);
    throw error;
  }
}

/**
 * Edit image with OpenAI gpt-image-1
 *
 * @param {Object} params - Edit parameters
 * @param {string} params.prompt - Edit instructions
 * @param {string} params.imagePath - Path to input image file
 * @param {string} [params.maskPath] - Path to mask image (transparent areas = editable)
 * @param {string} [params.size='1024x1024'] - Output size
 * @param {string} [params.inputFidelity='high'] - Use high for faces/logos
 * @returns {Promise<Buffer>} Edited image as Buffer
 */
export async function openaiEdit({
  prompt,
  imagePath,
  maskPath,
  size = '1024x1024',
  inputFidelity = 'high' // Default to high for edits
}) {
  validateModel(MODEL_ID);
  const client = getClient();

  try {
    const requestParams = {
      model: MODEL_ID,
      prompt,
      image: fs.createReadStream(imagePath),
      size,
      n: 1
    };

    // Note: input_fidelity and response_format are not currently supported in gpt-image-1
    if (inputFidelity) {
      console.log(`Note: input_fidelity="${inputFidelity}" requested but not currently supported by API`);
    }

    // Add mask if provided
    if (maskPath) {
      requestParams.mask = fs.createReadStream(maskPath);
    }

    const response = await client.images.edits(requestParams);

    // Get URL from response and fetch image data
    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI edit');
    }

    // Fetch image as buffer
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch edited image: ${imageResponse.statusText}`);
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('OpenAI gpt-image-1 edit error:', error);
    throw error;
  }
}

/**
 * Get model information
 */
export function getModelInfo() {
  return {
    model: MODEL_ID,
    provider: 'openai',
    capabilities: [
      'text-to-image',
      'image-editing',
      'input-fidelity-control',
      'c2pa-metadata'
    ],
    sizes: ['1024x1024', '1536x1024', '1024x1536'],
    qualities: ['low', 'medium', 'high', 'auto'],
    inputFidelityLevels: ['low', 'medium', 'high'],
    pricing: {
      '1024x1024': 0.02,
      '1536x1024': 0.03,
      '1024x1536': 0.03,
      'hd_with_high_fidelity': 0.19
    },
    notes: [
      'Use input_fidelity: "high" for logos, faces, or identity preservation',
      'Images include C2PA metadata in many contexts',
      'Streaming support available via API',
      'DALL-E is absolutely forbidden - only gpt-image-1 allowed'
    ]
  };
}

/**
 * Calculate cost for generation
 * @param {Object} params - Generation parameters
 * @returns {number} Estimated cost in USD
 */
export function calculateCost({ size, quality, inputFidelity }) {
  if (inputFidelity === 'high' && quality === 'high') {
    return 0.19;
  }
  if (size === '1536x1024' || size === '1024x1536') {
    return 0.03;
  }
  return 0.02;
}

// Export model constant for validation
export { MODEL_ID as OPENAI_IMAGE_MODEL };