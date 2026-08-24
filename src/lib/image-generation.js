/**
 * Image Generation Service
 * Integrates with OpenAI gpt-image-1 and Google Gemini 2.5 Flash Image (Nano Banana)
 *
 * CRITICAL STANDARDS:
 * - OpenAI: gpt-image-1 ONLY (DALL-E is absolutely forbidden)
 * - Google: gemini-2.5-flash-image-preview ONLY (Nano Banana)
 * - Model IDs are hard-pinned and validated
 */

// APPROVED MODEL IDS - Hard-pinned constants
const APPROVED_MODELS = {
  OPENAI: 'gpt-image-1',
  GOOGLE: 'gemini-2.5-flash-image-preview'
};

// FORBIDDEN MODELS - Will cause validation errors
const FORBIDDEN_MODELS = ['dall-e-3', 'dall-e-2', 'dall-e', 'DALL-E'];

// API Configuration
const API_ENDPOINTS = {
  openai: 'https://api.openai.com/v1/images/generations',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models'
};

class ImageGenerationService {
  constructor() {
    this.apiKeys = {
      gemini: import.meta.env.VITE_GEMINI_API_KEY || '',
      openai: import.meta.env.VITE_OPENAI_API_KEY || ''
    };
  }

  /**
   * Validate model ID against forbidden list
   * @private
   */
  _validateModel(model) {
    const modelLower = model.toLowerCase();
    for (const forbidden of FORBIDDEN_MODELS) {
      if (modelLower.includes(forbidden.toLowerCase())) {
        throw new Error(
          `FORBIDDEN MODEL DETECTED: "${model}"\n` +
          `Only these models are approved:\n` +
          `- OpenAI: ${APPROVED_MODELS.OPENAI}\n` +
          `- Google: ${APPROVED_MODELS.GOOGLE}\n` +
          `DALL-E usage is ABSOLUTELY FORBIDDEN!`
        );
      }
    }
    return true;
  }

  /**
   * Generate image using OpenAI gpt-image-1
   * @param {string} prompt - Text description for image generation
   * @param {Object} options - Additional options (size, quality, inputFidelity, etc.)
   * @returns {Promise<Object>} Generated image data
   */
  async generateWithOpenAI(prompt, options = {}) {
    const model = APPROVED_MODELS.OPENAI;
    this._validateModel(model);

    try {
      const size = options.size || '1024x1024';
      const quality = options.quality || 'standard';
      const inputFidelity = options.inputFidelity || 'medium';

      const response = await fetch(API_ENDPOINTS.openai, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKeys.openai}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model, // gpt-image-1
          prompt,
          n: 1,
          size,
          quality,
          input_fidelity: inputFidelity
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.statusText}. ${errorData.error?.message || ''}`);
      }

      const data = await response.json();
      return {
        provider: 'openai',
        model: model,
        imageUrl: data.data[0]?.url,
        metadata: {
          model: model,
          prompt,
          size,
          quality,
          inputFidelity,
          timestamp: new Date().toISOString(),
          note: 'Generated with OpenAI gpt-image-1 (natively multimodal with streaming support)'
        }
      };
    } catch (error) {
      console.error('OpenAI gpt-image-1 generation error:', error);
      throw error;
    }
  }

  /**
   * Generate image using Google Gemini 2.5 Flash Image (Nano Banana)
   * @param {string} prompt - Text description for image generation
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Generated image data
   */
  async generateWithGemini(prompt, options = {}) {
    const model = APPROVED_MODELS.GOOGLE;
    this._validateModel(model);

    try {
      const endpoint = `${API_ENDPOINTS.gemini}/${model}:generateContent?key=${this.apiKeys.gemini}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.statusText}. ${errorData.error?.message || ''}`);
      }

      const data = await response.json();

      // Extract image data from response
      let imageData = null;
      if (data.candidates && data.candidates[0]) {
        for (const part of data.candidates[0].content.parts) {
          if (part.inlineData) {
            imageData = part.inlineData.data;
            break;
          }
        }
      }

      return {
        provider: 'google',
        model: model,
        imageData: imageData, // Base64 encoded image
        imageUrl: imageData ? `data:image/png;base64,${imageData}` : null,
        metadata: {
          model: model,
          prompt,
          timestamp: new Date().toISOString(),
          capabilities: ['editing', 'composition', 'character_consistency', 'text_rendering'],
          features: ['synthid_watermark', 'conversational_refinement', 'multi_image_composition'],
          note: 'Generated with Gemini 2.5 Flash Image (Nano Banana) - includes SynthID watermark'
        }
      };
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw error;
    }
  }

  /**
   * Generate image using the optimal provider based on requirements
   * @param {string} prompt - Text description
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated image data
   */
  async generate(prompt, options = {}) {
    const {
      provider = 'openai', // Default to OpenAI gpt-image-1
      fallback = true
    } = options;

    try {
      if (provider === 'openai') {
        return await this.generateWithOpenAI(prompt, options);
      } else if (provider === 'google' || provider === 'gemini') {
        return await this.generateWithGemini(prompt, options);
      } else {
        throw new Error(`Unknown provider: ${provider}. Use 'openai' or 'google'`);
      }
    } catch (error) {
      if (fallback) {
        console.warn(`Primary provider ${provider} failed, trying fallback...`);
        // If OpenAI fails, try Gemini; if Gemini fails, try OpenAI
        const fallbackProvider = provider === 'openai' ? 'google' : 'openai';
        return await this.generate(prompt, { ...options, provider: fallbackProvider, fallback: false });
      }
      throw error;
    }
  }

  /**
   * Get list of approved models
   */
  getApprovedModels() {
    return {
      openai: APPROVED_MODELS.OPENAI,
      google: APPROVED_MODELS.GOOGLE,
      note: 'DALL-E models are absolutely forbidden'
    };
  }

  /**
   * Check if a model is approved
   */
  isModelApproved(model) {
    return Object.values(APPROVED_MODELS).includes(model);
  }
}

// Export singleton instance and constants
export const imageGenerationService = new ImageGenerationService();
export { APPROVED_MODELS, FORBIDDEN_MODELS };
export default ImageGenerationService;