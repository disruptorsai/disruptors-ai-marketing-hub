/**
 * AI Media Generation Orchestrator
 * Comprehensive service for managing all AI generation across platforms
 *
 * CRITICAL IMAGE GENERATION STANDARDS:
 * - OpenAI: gpt-image-1 ONLY (DALL-E 3 absolutely forbidden)
 * - Google: gemini-2.5-flash-image-preview ONLY (Nano Banana)
 * - These model IDs are HARD-PINNED and validated at runtime
 * - Any attempt to use DALL-E will throw an error
 */

import Replicate from 'replicate';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

// HARD-PINNED MODEL IDS - DO NOT MODIFY
const APPROVED_IMAGE_MODELS = {
  OPENAI: 'gpt-image-1',
  GOOGLE: 'gemini-2.5-flash-image-preview',
  REPLICATE_FLUX: 'black-forest-labs/flux-1.1-pro'
};

// FORBIDDEN MODELS - Will throw runtime errors
const FORBIDDEN_MODELS = ['dall-e-3', 'dall-e-2', 'dall-e', 'DALL-E'];

class AIMediaOrchestrator {
  constructor() {
    // Lazy-initialized clients - only created when actually used
    this._replicate = null;
    this._openai = null;
    this._gemini = null;

    // Default model configurations using APPROVED_IMAGE_MODELS constants
    this.defaultModels = {
      image_generation: {
        primary: APPROVED_IMAGE_MODELS.OPENAI,              // gpt-image-1
        secondary: APPROVED_IMAGE_MODELS.GOOGLE,            // gemini-2.5-flash-image-preview
        budget: APPROVED_IMAGE_MODELS.GOOGLE,               // Gemini for budget option
        editing: APPROVED_IMAGE_MODELS.GOOGLE,              // Gemini has editing capabilities
        specialized: {
          inpainting: APPROVED_IMAGE_MODELS.GOOGLE,
          structural: APPROVED_IMAGE_MODELS.REPLICATE_FLUX,
          depth_guided: APPROVED_IMAGE_MODELS.GOOGLE,
          image_conditioned: APPROVED_IMAGE_MODELS.GOOGLE,
          text_rendering: APPROVED_IMAGE_MODELS.GOOGLE,
          professional_creative: APPROVED_IMAGE_MODELS.REPLICATE_FLUX
        }
      },
      video_generation: {
        primary: "google/veo-2",                          // Google via Replicate/API
        secondary: "kling-ai/kling-v2-1",                // Replicate
        budget: "veo-3-fast",                            // Google
        physics_focused: "hailuo/hailuo-2",              // Replicate
        audio_video: "wan-s2v"                           // Replicate
      },
      audio_generation: {
        primary: "elevenlabs/chatterbox",                 // ElevenLabs via Replicate
        conversational: "openai/realtime-api",           // OpenAI
        voice_cloning: "elevenlabs/instant-voice-clone", // ElevenLabs
        multilingual: "resemble-ai/multilingual-tts",    // Resemble AI
        dialogue: "minimax/speech-02-hd",                // Replicate
        multi_speaker: "dia-tts"                         // Replicate
      }
    };

    // Brand consistency settings
    this.brandConfig = {
      colorPalette: {
        primary: ["#111827", "#1f2937", "#374151"], // gray-900, gray-800, gray-700
        accent: ["#d4af37", "#c9a53b", "#b8960a"], // gold accents (logo)
        neutral: ["#ffffff", "#f9fafb", "#f3f4f6", "#e5e7eb"] // white, gray-50, gray-100, gray-200
      },
      designPrinciples: {
        style: "Professional, modern, technology-focused with timeless elegance",
        aesthetic: "Dark sophisticated design with premium gold accents, clean minimal",
        typography: "Clear, readable, corporate-friendly",
        imagery: "High-tech, AI-forward, business-professional with premium feel"
      }
    };
  }

  // Lazy getters for AI clients - only initialize when first accessed
  get replicate() {
    if (!this._replicate) {
      const token = import.meta.env.VITE_REPLICATE_API_TOKEN;
      if (!token) {
        console.warn('Replicate API token not configured');
        return null;
      }
      this._replicate = new Replicate({ auth: token });
    }
    return this._replicate;
  }

  get openai() {
    if (!this._openai) {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        console.warn('OpenAI API key not configured');
        return null;
      }
      this._openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    }
    return this._openai;
  }

  get gemini() {
    if (!this._gemini) {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('Gemini API key not configured');
        return null;
      }
      this._gemini = new GoogleGenAI({ apiKey });
    }
    return this._gemini;
  }

  /**
   * Intelligent model selection based on context and requirements
   */
  selectOptimalModel(type, context = {}) {
    const {
      quality = 'standard',
      budget = 'medium',
      specialization = null,
    } = context;

    switch (type) {
      case 'image':
        if (specialization) {
          return this.defaultModels.image_generation.specialized[specialization] ||
                 this.defaultModels.image_generation.secondary;
        }
        if (budget === 'low') return this.defaultModels.image_generation.budget;
        if (quality === 'premium') return this.defaultModels.image_generation.primary;
        return this.defaultModels.image_generation.secondary;

      case 'video':
        if (budget === 'low') return this.defaultModels.video_generation.budget;
        if (specialization === 'physics') return this.defaultModels.video_generation.physics_focused;
        if (specialization === 'audio') return this.defaultModels.video_generation.audio_video;
        return this.defaultModels.video_generation.primary;

      case 'audio':
        if (specialization === 'conversation') return this.defaultModels.audio_generation.conversational;
        if (specialization === 'cloning') return this.defaultModels.audio_generation.voice_cloning;
        if (specialization === 'multilingual') return this.defaultModels.audio_generation.multilingual;
        return this.defaultModels.audio_generation.primary;

      default:
        throw new Error(`Unknown generation type: ${type}`);
    }
  }

  /**
   * Generate brand-consistent prompts
   */
  enhancePrompt(basePrompt, type) {
    let enhancedPrompt = basePrompt;

    // Add brand consistency elements
    const brandElements = [
      "professional corporate design",
      "modern technology aesthetic",
      "clean minimal design",
      "sophisticated blue gradients",
      "business-appropriate",
      "high-quality commercial photography style"
    ];

    // Add quality enhancers
    const qualityEnhancers = [
      "high resolution",
      "professional photography",
      "commercial quality",
      "award-winning design",
      "sharp details",
      "optimal lighting",
      "perfect composition"
    ];

    // Add negative prompts
    const negativePrompts = [
      "low quality",
      "blurry",
      "unprofessional",
      "childish",
      "cartoon",
      "amateur"
    ];

    if (type === 'image') {
      enhancedPrompt += `, ${brandElements.join(', ')}, ${qualityEnhancers.join(', ')}`;
      enhancedPrompt += `. Avoid: ${negativePrompts.join(', ')}`;
    }

    return enhancedPrompt;
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
          `- OpenAI: ${APPROVED_IMAGE_MODELS.OPENAI}\n` +
          `- Google: ${APPROVED_IMAGE_MODELS.GOOGLE}\n` +
          `- Replicate: ${APPROVED_IMAGE_MODELS.REPLICATE_FLUX}\n` +
          `DALL-E usage is ABSOLUTELY FORBIDDEN!`
        );
      }
    }
    return true;
  }

  /**
   * Generate image using optimal model with strict validation
   */
  async generateImage(prompt, options = {}) {
    const context = {
      quality: options.quality || 'standard',
      budget: options.budget || 'medium',
      specialization: options.specialization,
      width: options.width || 1024,
      height: options.height || 1024
    };

    const model = this.selectOptimalModel('image', context);
    const enhancedPrompt = this.enhancePrompt(prompt, 'image', context);

    // VALIDATE MODEL - BLOCK ALL FORBIDDEN MODELS
    this._validateModel(model);

    try {
      let result;

      // Route to appropriate provider based on model ID
      if (model === APPROVED_IMAGE_MODELS.OPENAI) {
        result = await this.generateWithOpenAI(enhancedPrompt, context);
      } else if (model === APPROVED_IMAGE_MODELS.GOOGLE) {
        result = await this.generateWithGemini(enhancedPrompt, options);
      } else if (model.includes('flux') || model === APPROVED_IMAGE_MODELS.REPLICATE_FLUX) {
        result = await this.generateWithReplicate(model, enhancedPrompt, options);
      } else {
        // Fallback to Google Gemini (Nano Banana)
        console.warn(`Model ${model} not recognized, using Gemini fallback`);
        result = await this.generateWithGemini(enhancedPrompt, options);
      }

      // Store in Supabase with Cloudinary upload (dynamically import for code splitting)
      try {
        const { supabaseMediaStorage } = await import('./supabase-media-storage.js');
        const storedMedia = await supabaseMediaStorage.storeGeneratedMedia(
          {
            type: 'image',
            prompt: prompt,
            options: options,
            context: options.context || 'manual_generation'
          },
          result
        );

        // Return result with Supabase metadata
        return {
          ...result,
          id: storedMedia.id,
          stored_url: storedMedia.url,
          cloudinary_public_id: storedMedia.cloudinary_public_id
        };
      } catch (storageError) {
        console.error('Failed to store media, returning original result:', storageError);
        return result;
      }

    } catch (error) {
      console.error(`Failed to generate with ${model}, trying fallback:`, error);
      // If original was Replicate and failed due to CORS, use Gemini instead
      if (error.message && error.message.includes('Browser-based Replicate generation not supported')) {
        const fallbackResult = await this.generateWithGemini(enhancedPrompt, options);
        return fallbackResult;
      }
      // Fallback to Gemini only - NEVER DALL-E!
      const fallbackResult = await this.generateWithGemini(enhancedPrompt, options);

      // Try to store fallback result too (dynamically import for code splitting)
      try {
        const { supabaseMediaStorage } = await import('./supabase-media-storage.js');
        const storedMedia = await supabaseMediaStorage.storeGeneratedMedia(
          {
            type: 'image',
            prompt: prompt,
            options: options,
            context: options.context || 'fallback_generation'
          },
          fallbackResult
        );

        return {
          ...fallbackResult,
          id: storedMedia.id,
          stored_url: storedMedia.url,
          cloudinary_public_id: storedMedia.cloudinary_public_id
        };
      } catch (storageError) {
        console.error('Fallback storage failed:', storageError);
        return fallbackResult;
      }
    }
  }

  /**
   * Generate video using optimal model
   */
  async generateVideo(prompt, options = {}) {
    const context = {
      quality: options.quality || 'standard',
      budget: options.budget || 'medium',
      specialization: options.specialization,
      duration: options.duration || 8,
      resolution: options.resolution || '720p'
    };

    const model = this.selectOptimalModel('video', context);
    const enhancedPrompt = this.enhancePrompt(prompt, 'video', context);

    try {
      if (model.includes('veo')) {
        return await this.generateVideoWithVeo(enhancedPrompt, options);
      } else {
        return await this.generateWithReplicate(model, enhancedPrompt, options);
      }
    } catch (error) {
      console.error(`Failed to generate video with ${model}, trying fallback:`, error);
      const fallbackModel = this.defaultModels.video_generation.secondary;
      return await this.generateWithReplicate(fallbackModel, enhancedPrompt, options);
    }
  }

  /**
   * Generate audio using optimal model
   */
  async generateAudio(prompt, options = {}) {
    const context = {
      quality: options.quality || 'standard',
      budget: options.budget || 'medium',
      specialization: options.specialization,
      voice: options.voice || 'professional',
      language: options.language || 'en'
    };

    const model = this.selectOptimalModel('audio', context);

    try {
      if (model === 'openai/realtime-api') {
        return await this.generateAudioWithOpenAI(prompt, options);
      } else {
        return await this.generateWithReplicate(model, prompt, options);
      }
    } catch (error) {
      console.error(`Failed to generate audio with ${model}, trying fallback:`, error);
      const fallbackModel = this.defaultModels.audio_generation.primary;
      return await this.generateWithReplicate(fallbackModel, prompt, options);
    }
  }

  /**
   * OpenAI gpt-image-1 Generation
   * CRITICAL: This uses gpt-image-1 ONLY - DALL-E is completely forbidden
   * @param {string} prompt - Image description
   * @param {Object} context - Generation context with quality, size, inputFidelity
   */
  async generateWithOpenAI(prompt, context = {}) {
    // Check if OpenAI is configured
    if (!this.openai) {
      throw new Error('OpenAI API key not configured. Set VITE_OPENAI_API_KEY environment variable.');
    }

    // Double-check model ID
    const model = APPROVED_IMAGE_MODELS.OPENAI;
    this._validateModel(model);

    try {
      // Map quality to valid OpenAI values: 'low', 'medium', 'high'
      const qualityMap = {
        'standard': 'medium',
        'premium': 'high',
        'budget': 'low'
      };
      const openaiQuality = qualityMap[context.quality] || context.quality || 'medium';

      const response = await this.openai.images.generate({
        model: model, // gpt-image-1
        prompt: prompt,
        size: this._getOpenAISize(context),
        quality: openaiQuality, // Valid values: 'low', 'medium', 'high'
        n: 1
      });

      return {
        url: response.data[0].url,
        provider: 'openai',
        model: model,
        cost: this.calculateCost('openai', 'image', context),
        metadata: {
          prompt: prompt,
          model: model,
          size: this._getOpenAISize(context),
          quality: openaiQuality,
          note: 'Generated with OpenAI gpt-image-1 (natively multimodal, streaming support)'
        }
      };
    } catch (error) {
      console.error('OpenAI gpt-image-1 generation error:', error);
      throw error;
    }
  }

  /**
   * Helper to get OpenAI size format
   * @private
   */
  _getOpenAISize(context) {
    const width = context.width || 1024;
    const height = context.height || 1024;

    // gpt-image-1 supports: 1024x1024, 1536x1024, 1024x1536
    if (width === height) return '1024x1024';
    if (width > height) return '1536x1024';
    return '1024x1536';
  }

  /**
   * Gemini 2.5 Flash Image Generation (Nano Banana)
   * Google's state-of-the-art image generation and editing model
   * Uses new @google/genai SDK
   */
  async generateWithGemini(prompt, options = {}) {
    // Check if Gemini is configured
    if (!this.gemini) {
      throw new Error('Gemini API key not configured. Set VITE_GEMINI_API_KEY environment variable.');
    }

    // Double-check model ID
    const modelId = APPROVED_IMAGE_MODELS.GOOGLE;
    this._validateModel(modelId);

    try {
      // Use new Google Gen AI SDK
      const response = await this.gemini.models.generateContent({
        model: modelId,
        contents: prompt
      });

      // Extract image data from response
      // Note: Actual response format may vary - adjust based on SDK documentation
      let imageData = null;
      if (response.candidates && response.candidates[0]) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            // Image returned as base64 inline data
            imageData = part.inlineData.data;
            break;
          }
        }
      }

      return {
        imageData: imageData, // Base64 image data
        response: response, // Full response for further processing
        provider: 'google',
        model: modelId,
        cost: this.calculateCost('google', 'image', options),
        metadata: {
          prompt: prompt,
          model: modelId,
          capabilities: ['editing', 'composition', 'character_consistency', 'text_rendering'],
          features: ['synthid_watermark', 'conversational_refinement', 'multi_image_composition'],
          note: 'Generated with Gemini 2.5 Flash Image (Nano Banana) - includes SynthID watermark'
        }
      };
    } catch (error) {
      console.error('Gemini 2.5 Flash Image generation error:', error);
      throw error;
    }
  }

  /**
   * Replicate Generation (Images, Videos, Audio)
   */
  async generateWithReplicate(model, prompt, options = {}) {
    // Check if Replicate is configured
    if (!this.replicate) {
      throw new Error('Replicate API token not configured. Set VITE_REPLICATE_API_TOKEN environment variable.');
    }

    try {
      const input = this.buildReplicateInput(model, prompt, options);

      const output = await this.replicate.run(model, { input });

      return {
        url: Array.isArray(output) ? output[0] : output,
        provider: 'replicate',
        model: model,
        cost: this.calculateCost('replicate', this.getMediaType(model), options),
        metadata: {
          prompt: prompt,
          input: input
        }
      };
    } catch (error) {
      // Handle CORS errors for browser-based usage
      if (error.message && error.message.includes('Failed to fetch')) {
        console.warn('Replicate API not available in browser due to CORS policy. Use server-side proxy for production.');
        throw new Error('Browser-based Replicate generation not supported. Please use OpenAI or Gemini models.');
      }
      throw error;
    }
  }

  /**
   * Veo Video Generation
   */
  async generateVideoWithVeo(prompt, options = {}) {
    // This would use Google's Vertex AI or Gemini API for Veo
    // Implementation depends on the specific API endpoint

    return {
      url: 'veo-generated-video-url',
      provider: 'google',
      model: 'veo-2',
      cost: this.calculateCost('google', 'video', options),
      metadata: {
        prompt: prompt,
        duration: options.duration || 8,
        resolution: options.resolution || '720p'
      }
    };
  }

  /**
   * OpenAI Audio Generation
   */
  async generateAudioWithOpenAI(prompt, options = {}) {
    // Implementation for OpenAI Realtime API
    return {
      url: 'openai-audio-url',
      provider: 'openai',
      model: 'realtime-api',
      cost: this.calculateCost('openai', 'audio', options),
      metadata: {
        prompt: prompt,
        voice: options.voice,
        language: options.language
      }
    };
  }

  /**
   * Build Replicate input based on model type
   */
  buildReplicateInput(model, prompt, options) {
    const baseInput = { prompt };

    if (model.includes('flux') || model.includes('sdxl')) {
      return {
        ...baseInput,
        width: options.width || 1024,
        height: options.height || 1024,
        num_inference_steps: options.steps || 50,
        guidance_scale: options.guidance || 7.5
      };
    }

    if (model.includes('veo') || model.includes('kling') || model.includes('hailuo')) {
      return {
        ...baseInput,
        duration: options.duration || 8,
        resolution: options.resolution || '720p'
      };
    }

    if (model.includes('elevenlabs') || model.includes('speech')) {
      return {
        ...baseInput,
        voice: options.voice || 'professional',
        language: options.language || 'en'
      };
    }

    return baseInput;
  }

  /**
   * Determine media type from model name
   */
  getMediaType(model) {
    if (model.includes('flux') || model.includes('sdxl') || model.includes('imagen')) {
      return 'image';
    }
    if (model.includes('veo') || model.includes('kling') || model.includes('hailuo')) {
      return 'video';
    }
    if (model.includes('speech') || model.includes('elevenlabs') || model.includes('tts')) {
      return 'audio';
    }
    return 'unknown';
  }

  /**
   * Calculate estimated cost based on provider and type
   */
  calculateCost(provider, type, options = {}) {
    const costs = {
      openai: {
        // gpt-image-1 pricing based on quality: low (~$0.02), medium (~$0.07), high (~$0.19) per image
        image: () => {
          const quality = options.quality || 'medium';
          if (quality === 'high') return 0.19;
          if (quality === 'medium') return 0.07;
          return 0.02; // low quality
        }
      },
      google: {
        // Gemini 2.5 Flash Image: $30 per 1M output tokens, 1290 tokens per image = $0.039
        image: 0.039,
        video: options.duration ? options.duration * 0.35 : 2.8, // $0.35/sec for Veo 2
        audio: 0.002
      },
      replicate: {
        image: 0.004, // Flux models, per second estimate
        video: 0.1,   // Kling/Hailuo, per second estimate
        audio: 0.002  // per second estimate
      }
    };

    const cost = costs[provider]?.[type];
    if (typeof cost === 'function') {
      return cost();
    }
    return cost || 0.01;
  }

  /**
   * Batch generation for multiple assets
   */
  async generateBatch(requests) {
    const results = await Promise.allSettled(
      requests.map(async (request) => {
        const { type, prompt, options } = request;

        switch (type) {
          case 'image':
            return await this.generateImage(prompt, options);
          case 'video':
            return await this.generateVideo(prompt, options);
          case 'audio':
            return await this.generateAudio(prompt, options);
          default:
            throw new Error(`Unknown generation type: ${type}`);
        }
      })
    );

    return results.map((result, index) => ({
      request: requests[index],
      success: result.status === 'fulfilled',
      result: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }

  /**
   * Get performance metrics and approved models
   */
  getPerformanceMetrics() {
    return {
      totalGenerations: 0,
      successRate: 100,
      averageCost: 0.03, // Average between gpt-image-1 and Gemini
      averageLatency: 15000,
      approvedModels: {
        image: {
          primary: APPROVED_IMAGE_MODELS.OPENAI,
          secondary: APPROVED_IMAGE_MODELS.GOOGLE,
          replicate: APPROVED_IMAGE_MODELS.REPLICATE_FLUX
        },
        video: this.defaultModels.video_generation.primary,
        audio: this.defaultModels.audio_generation.primary
      },
      forbiddenModels: FORBIDDEN_MODELS,
      note: 'DALL-E models are ABSOLUTELY FORBIDDEN and will throw errors'
    };
  }
}

// Export singleton instance with approved model constants
export const aiOrchestrator = new AIMediaOrchestrator();
export { APPROVED_IMAGE_MODELS, FORBIDDEN_MODELS };
export default AIMediaOrchestrator;