/**
 * Google Gemini 2.5 Flash Image (Nano Banana) Server-Side API Helper
 *
 * CRITICAL: This file uses gemini-2.5-flash-image-preview ONLY
 *
 * This is a Node.js-only helper - DO NOT expose API keys in browser
 *
 * Features:
 * - Text-to-image generation
 * - Image editing with natural language
 * - Multi-image composition
 * - Character consistency
 * - Conversational refinement
 * - SynthID watermarking (automatic)
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';

// HARD-PINNED MODEL ID - DO NOT MODIFY
const MODEL_ID = 'gemini-2.5-flash-image-preview';

/**
 * Initialize Google Gen AI client
 * @private
 */
function getClient() {
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Google API key not found in environment variables');
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Generate image with Gemini 2.5 Flash Image (Nano Banana)
 *
 * @param {Object} params - Generation parameters
 * @param {string} params.prompt - Image description
 * @returns {Promise<Buffer>} PNG image as Buffer
 */
export async function geminiGenerate({ prompt }) {
  const client = getClient();

  try {
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: prompt
    });

    // Extract image data from response
    let imageData = null;
    if (response.candidates && response.candidates[0]) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageData = part.inlineData.data;
          break;
        }
      }
    }

    if (!imageData) {
      throw new Error('No image data returned by Gemini');
    }

    return Buffer.from(imageData, 'base64');
  } catch (error) {
    console.error('Gemini 2.5 Flash Image generation error:', error);
    throw error;
  }
}

/**
 * Edit image with Gemini 2.5 Flash Image
 * Supply an input image and editing instructions
 *
 * @param {Object} params - Edit parameters
 * @param {string} params.prompt - Edit instructions
 * @param {string} params.imagePath - Path to input image file
 * @returns {Promise<Buffer>} Edited image as Buffer
 */
export async function geminiEdit({ prompt, imagePath }) {
  const client = getClient();

  try {
    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Detect MIME type from file extension
    const ext = imagePath.toLowerCase().split('.').pop();
    const mimeTypes = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'webp': 'image/webp'
    };
    const mimeType = mimeTypes[ext] || 'image/png';

    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: [
        { text: prompt },
        { inlineData: { mimeType, data: base64Image } }
      ]
    });

    // Extract edited image data
    let imageData = null;
    if (response.candidates && response.candidates[0]) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageData = part.inlineData.data;
          break;
        }
      }
    }

    if (!imageData) {
      throw new Error('No image returned by Gemini edit');
    }

    return Buffer.from(imageData, 'base64');
  } catch (error) {
    console.error('Gemini 2.5 Flash Image edit error:', error);
    throw error;
  }
}

/**
 * Multi-image composition with Gemini
 * Blend multiple input images into a single image
 *
 * @param {Object} params - Composition parameters
 * @param {string} params.prompt - Composition instructions
 * @param {string[]} params.imagePaths - Array of input image paths (up to 3 recommended)
 * @returns {Promise<Buffer>} Composed image as Buffer
 */
export async function geminiCompose({ prompt, imagePaths }) {
  const client = getClient();

  try {
    if (!imagePaths || imagePaths.length === 0) {
      throw new Error('At least one image path is required');
    }

    if (imagePaths.length > 3) {
      console.warn('More than 3 images may impact performance. Recommended: up to 3 images');
    }

    // Build contents array with prompt and all images
    const contents = [{ text: prompt }];

    for (const imagePath of imagePaths) {
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const ext = imagePath.toLowerCase().split('.').pop();
      const mimeTypes = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'webp': 'image/webp'
      };
      const mimeType = mimeTypes[ext] || 'image/png';

      contents.push({
        inlineData: { mimeType, data: base64Image }
      });
    }

    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents
    });

    // Extract composed image data
    let imageData = null;
    if (response.candidates && response.candidates[0]) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageData = part.inlineData.data;
          break;
        }
      }
    }

    if (!imageData) {
      throw new Error('No image returned by Gemini composition');
    }

    return Buffer.from(imageData, 'base64');
  } catch (error) {
    console.error('Gemini multi-image composition error:', error);
    throw error;
  }
}

/**
 * Get model information
 */
export function getModelInfo() {
  return {
    model: MODEL_ID,
    provider: 'google',
    nickname: 'Nano Banana',
    capabilities: [
      'text-to-image',
      'image-editing',
      'multi-image-composition',
      'character-consistency',
      'conversational-refinement',
      'high-quality-text-rendering'
    ],
    features: [
      'synthid-watermark (automatic)',
      'iterative-improvement',
      'natural-language-editing',
      'context-aware-generation'
    ],
    pricing: {
      perImage: 0.039, // $30 per 1M output tokens, 1290 tokens per image
      perMillionTokens: 30.00
    },
    limits: {
      tokensPerImage: 1290,
      recommendedInputImages: 3, // For multi-image composition
      maxInputImages: 'No hard limit, but 3 recommended for best performance'
    },
    notes: [
      'All generated images include SynthID invisible watermark',
      'Supports conversational refinement for iterative improvements',
      'Excellent for character consistency across generations',
      'Best practices: be hyper-specific with prompts',
      'Use up to 3 input images for optimal multi-image composition'
    ]
  };
}

/**
 * Calculate cost for generation
 * Fixed cost of $0.039 per image (1290 tokens @ $30 per 1M tokens)
 * @returns {number} Cost in USD
 */
export function calculateCost() {
  return 0.039;
}

// Export model constant for validation
export { MODEL_ID as GEMINI_IMAGE_MODEL };