/**
 * Netlify Function: Instagram Carousel Generator
 *
 * Intelligent carousel generation with multi-strategy image sourcing
 *
 * Supported actions:
 * - "outline": Generate carousel strategy (research + Claude)
 * - "generate_slide": Process individual slide (download/edit/compose/generate)
 * - "generate_all": Complete carousel generation (Simple Mode)
 * - "export": Export to ZIP/Canva JSON
 *
 * POST /.netlify/functions/module-carousel-generator
 * Body: {
 *   action: string,
 *   topic?: string,
 *   slide_count?: number,
 *   style_template?: string,
 *   advanced_mode?: boolean,
 *   carousel_id?: string,
 *   slide_number?: number,
 *   strategy?: object
 * }
 * Headers: {
 *   Authorization?: "Bearer <jwt_token>"
 * }
 */

import { createClient } from '@supabase/supabase-js';
import { scrapeInstagramCarousels } from './carousel-utils/instagram-scraper.js';
import { generateCarouselStrategy } from './carousel-utils/image-strategy-ai.js';
import { searchAndDownloadImage, downloadMultipleImages } from './carousel-utils/image-downloader.js';
import { processWithRetry } from './carousel-utils/nano-banana-processor.js';
import { exportCompletePackage } from './carousel-utils/carousel-exporter.js';
import OpenAI from 'openai';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;

// Create clients
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Module configuration
const MODULE_ID = 'carousel-generator';
const MODULE_QUOTAS = {
  internal: { limit: -1, period: 'unlimited' },
  client: { limit: 10, period: 'monthly' },
  public: { limit: 0, period: 'none' }
};

/**
 * Main handler
 */
export async function handler(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { action, topic, slide_count, style_template, advanced_mode, carousel_id, slide_number, strategy, strategy_overrides } = body;

    // Authenticate user
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const user = await getUserFromToken(authHeader);
    const audience = determineAudience(user);

    // Check module access
    const accessCheck = await checkModuleAccess(MODULE_ID, user?.id, audience);
    if (!accessCheck.allowed) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          error: 'Quota exceeded',
          quota: accessCheck
        })
      };
    }

    // Load Business Brain if authenticated
    let brainContext = null;
    if (user) {
      brainContext = await loadUserBrain(user.id);
    }

    // Route to action handlers
    let result;

    switch (action) {
      case 'outline':
        result = await handleOutline({ topic, slide_count, style_template, brainContext, user, audience });
        break;

      case 'generate_slide':
        result = await handleGenerateSlide({ carousel_id, slide_number, strategy, brainContext, user });
        break;

      case 'generate_all':
        result = await handleGenerateAll({ topic, slide_count, style_template, advanced_mode, strategy_overrides, brainContext, user, audience });
        break;

      case 'export':
        result = await handleExport({ carousel_id, user });
        break;

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Unknown action: ${action}` })
        };
    }

    // Track usage in module_runs
    if (action === 'generate_all' || action === 'outline') {
      await trackModuleRun({
        module_id: MODULE_ID,
        user_id: user?.id,
        audience,
        input_data: { topic, slide_count, style_template },
        output_data: result,
        success: result.success !== false,
        cost: result.total_cost || 0
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('[module-carousel-generator] Error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
}

/**
 * Handle "outline" action - Generate strategy
 */
async function handleOutline({ topic, slide_count = 5, style_template = 'educational', brainContext, user, audience }) {
  const startTime = Date.now();

  try {
    // Create carousel generation record
    const carouselId = crypto.randomUUID();

    const { data: carouselRecord, error: insertError } = await supabaseAdmin
      .from('carousel_generations')
      .insert({
        id: carouselId,
        user_id: user?.id || null,
        brain_id: brainContext?.id || null,
        topic,
        slide_count,
        style_template,
        advanced_mode: true, // outline action is Advanced Mode
        status: 'researching'
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create carousel record: ${insertError.message}`);
    }

    // Step 1: Research Instagram carousels (with caching)
    console.log(`[outline] Researching Instagram carousels for: ${brainContext?.industry || 'general'}`);

    const research = await scrapeInstagramCarousels({
      industry: brainContext?.industry || 'general',
      topic,
      limit: 10,
      supabaseClient: supabaseAdmin
    });

    // Step 2: Generate strategy with Claude
    console.log(`[outline] Generating carousel strategy...`);

    await supabaseAdmin
      .from('carousel_generations')
      .update({ status: 'strategy_generation', research_examples: research })
      .eq('id', carouselId);

    const strategy = await generateCarouselStrategy({
      topic,
      slideCount: slide_count,
      styleTemplate: style_template,
      brainContext: brainContext || {},
      researchData: research
    });

    // Update record with strategy
    await supabaseAdmin
      .from('carousel_generations')
      .update({
        status: 'strategy_ready',
        strategy_json: strategy,
        research_examples: research
      })
      .eq('id', carouselId);

    const duration = Date.now() - startTime;

    return {
      success: true,
      carousel_id: carouselId,
      strategy,
      research_examples_count: research?.carousels?.length || 0,
      generation_time_ms: duration,
      status: 'strategy_ready'
    };

  } catch (error) {
    console.error('[outline] Error:', error);

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Handle "generate_slide" action - Process single slide
 */
async function handleGenerateSlide({ carousel_id, slide_number, strategy, brainContext, user }) {
  const startTime = Date.now();

  try {
    // Get slide strategy
    const slideStrategy = strategy.slides.find(s => s.slide === slide_number);
    if (!slideStrategy) {
      throw new Error(`Slide ${slide_number} not found in strategy`);
    }

    const { method, sources, modifications } = slideStrategy.image_strategy;

    let imageBuffer;
    let actualCost = 0;

    // Execute based on method
    if (method === 'generate') {
      // Generate with OpenAI gpt-image-1
      console.log(`[generate_slide] Generating slide ${slide_number} with OpenAI...`);

      const prompt = buildGenerationPrompt(slideStrategy, brainContext);

      const response = await openai.images.generate({
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json'
      });

      imageBuffer = Buffer.from(response.data[0].b64_json, 'base64');
      actualCost = 0.08; // Average cost for gpt-image-1

    } else if (method === 'download') {
      // Download only
      console.log(`[generate_slide] Downloading image for slide ${slide_number}...`);

      const query = sources[0];
      imageBuffer = await searchAndDownloadImage({ query, source: 'auto' });
      actualCost = 0.00;

    } else if (method === 'download_modify' || method === 'download_combine') {
      // Download + process with Nano Banana
      console.log(`[generate_slide] Download and ${method === 'download_modify' ? 'edit' : 'compose'} for slide ${slide_number}...`);

      if (method === 'download_modify') {
        // Single image edit
        const query = sources[0];
        const sourceImage = await searchAndDownloadImage({ query, source: 'auto' });

        const processed = await processWithRetry({
          slide: slideStrategy,
          strategy: slideStrategy.image_strategy,
          imageBuffer: sourceImage,
          brainContext: brainContext || {},
          maxRetries: 2
        });

        if (!processed.success) {
          throw new Error(`Nano Banana processing failed: ${processed.error}`);
        }

        imageBuffer = processed.buffer;

      } else {
        // Multi-image composition
        const sourceImages = await downloadMultipleImages(
          sources.map(src => ({ query: src, source: 'auto' }))
        );

        const processed = await processWithRetry({
          slide: slideStrategy,
          strategy: slideStrategy.image_strategy,
          imageBuffer: sourceImages,
          brainContext: brainContext || {},
          maxRetries: 2
        });

        if (!processed.success) {
          throw new Error(`Nano Banana composition failed: ${processed.error}`);
        }

        imageBuffer = processed.buffer;
      }

      actualCost = 0.039; // Nano Banana cost
    }

    // Upload to Supabase Storage
    const storagePath = `${user?.id || 'public'}/${carousel_id}/slide_${String(slide_number).padStart(2, '0')}.png`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('carousel-images')
      .upload(storagePath, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('carousel-images')
      .getPublicUrl(storagePath);

    const duration = Date.now() - startTime;

    return {
      success: true,
      slide: slide_number,
      image_url: urlData.publicUrl,
      image_strategy_used: method,
      actual_cost: actualCost,
      generation_time_ms: duration
    };

  } catch (error) {
    console.error(`[generate_slide] Error on slide ${slide_number}:`, error);

    return {
      success: false,
      slide: slide_number,
      error: error.message
    };
  }
}

/**
 * Handle "generate_all" action - Complete carousel (Simple Mode)
 */
async function handleGenerateAll({ topic, slide_count = 5, style_template = 'educational', advanced_mode = false, strategy_overrides, brainContext, user, audience }) {
  const startTime = Date.now();

  try {
    // Step 1: Generate outline/strategy
    const outlineResult = await handleOutline({
      topic,
      slide_count,
      style_template,
      brainContext,
      user,
      audience
    });

    if (!outlineResult.success) {
      throw new Error(`Outline generation failed: ${outlineResult.error}`);
    }

    const { carousel_id, strategy } = outlineResult;

    // Apply strategy overrides if provided (Advanced Mode edits)
    let finalStrategy = strategy;
    if (strategy_overrides && Array.isArray(strategy_overrides)) {
      finalStrategy = applyStrategyOverrides(strategy, strategy_overrides);
    }

    // Update status
    await supabaseAdmin
      .from('carousel_generations')
      .update({ status: 'generating', strategy_json: finalStrategy })
      .eq('id', carousel_id);

    // Step 2: Generate all slides
    const slideResults = [];
    let totalCost = outlineResult.strategy.total_estimated_cost || 0.07;

    for (const slideStrategy of finalStrategy.slides) {
      const slideResult = await handleGenerateSlide({
        carousel_id,
        slide_number: slideStrategy.slide,
        strategy: finalStrategy,
        brainContext,
        user
      });

      slideResults.push(slideResult);

      if (slideResult.success && slideResult.actual_cost) {
        totalCost += slideResult.actual_cost;
      }
    }

    // Check if all slides succeeded
    const allSuccess = slideResults.every(r => r.success);

    if (!allSuccess) {
      await supabaseAdmin
        .from('carousel_generations')
        .update({
          status: 'failed',
          error_message: 'One or more slides failed to generate'
        })
        .eq('id', carousel_id);

      return {
        success: false,
        carousel_id,
        error: 'Carousel generation incomplete',
        slide_results: slideResults,
        failed_count: slideResults.filter(r => !r.success).length
      };
    }

    // Step 3: Finalize carousel record
    const slides = slideResults.map(r => ({
      slide: r.slide,
      text: finalStrategy.slides.find(s => s.slide === r.slide)?.text || '',
      image_url: r.image_url,
      image_strategy_used: r.image_strategy_used
    }));

    const duration = Date.now() - startTime;

    await supabaseAdmin
      .from('carousel_generations')
      .update({
        status: 'complete',
        slides_json: { slides },
        total_cost: totalCost,
        generation_duration_ms: duration,
        completed_at: new Date().toISOString()
      })
      .eq('id', carousel_id);

    return {
      success: true,
      carousel_id,
      topic,
      slide_count,
      slides,
      total_cost: totalCost,
      generation_duration_ms: duration,
      research_examples_count: outlineResult.research_examples_count
    };

  } catch (error) {
    console.error('[generate_all] Error:', error);

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Handle "export" action - Generate export package
 */
async function handleExport({ carousel_id, user }) {
  try {
    // Get carousel record
    const { data: carousel, error } = await supabaseAdmin
      .from('carousel_generations')
      .select('*')
      .eq('id', carousel_id)
      .single();

    if (error || !carousel) {
      throw new Error('Carousel not found');
    }

    // Generate complete export package
    const exportResult = await exportCompletePackage(carousel, supabaseAdmin);

    if (!exportResult.success) {
      throw new Error(exportResult.error);
    }

    // Store ZIP in storage
    const zipPath = `${user?.id || 'public'}/${carousel_id}/export.zip`;

    await supabaseAdmin.storage
      .from('carousel-images')
      .upload(zipPath, exportResult.exports.zip.buffer, {
        contentType: 'application/zip',
        upsert: true
      });

    const { data: zipUrl } = supabaseAdmin.storage
      .from('carousel-images')
      .getPublicUrl(zipPath);

    return {
      success: true,
      carousel_id,
      exports: {
        ...exportResult.exports,
        zip: {
          ...exportResult.exports.zip,
          download_url: zipUrl.publicUrl
        }
      },
      metadata: exportResult.metadata
    };

  } catch (error) {
    console.error('[export] Error:', error);

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Helper: Build generation prompt for gpt-image-1
 */
function buildGenerationPrompt(slideStrategy, brainContext) {
  const { text, image_description } = slideStrategy;

  return `Create a professional Instagram carousel slide (1080x1080px square format).

Image Description: ${image_description}

Text Overlay:
${text}

Style: ${brainContext?.brand_voice || 'Professional'} ${brainContext?.industry || 'business'} aesthetic, modern, clean, high-impact visual

Brand Context:
- Business: ${brainContext?.business_name || 'Unknown'}
- Industry: ${brainContext?.industry || 'General'}
- Target Audience: ${brainContext?.target_audience || 'Business professionals'}
${brainContext?.brand_colors ? `- Brand Colors: ${brainContext.brand_colors}` : ''}

Text Requirements:
- Bold, modern sans-serif font (like Montserrat, Inter, or similar)
- Large headline text that's easily readable
- High contrast between text and background
- Professional text layout with adequate spacing

Output: Polished Instagram carousel slide, ready to post, 1080x1080px.`;
}

/**
 * Helper: Apply strategy overrides from Advanced Mode
 */
function applyStrategyOverrides(strategy, overrides) {
  const modifiedStrategy = { ...strategy };

  for (const override of overrides) {
    const slideIndex = modifiedStrategy.slides.findIndex(s => s.slide === override.slide);
    if (slideIndex >= 0) {
      modifiedStrategy.slides[slideIndex].image_strategy.method = override.method;
      if (override.reasoning) {
        modifiedStrategy.slides[slideIndex].image_strategy.reasoning = override.reasoning;
      }
    }
  }

  return modifiedStrategy;
}

/**
 * Helper: Get user from JWT
 */
async function getUserFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('[getUserFromToken] Error:', error);
    return null;
  }
}

/**
 * Helper: Determine audience level
 */
function determineAudience(user) {
  if (!user) {
    return 'public';
  }

  const adminEmails = [
    'will@disruptorsmedia.com',
    'admin@disruptorsmedia.com'
  ];

  if (adminEmails.includes(user.email?.toLowerCase())) {
    return 'internal';
  }

  return 'client';
}

/**
 * Helper: Load user's Business Brain
 */
async function loadUserBrain(userId) {
  try {
    const { data: brain, error } = await supabaseAdmin
      .from('business_brains')
      .select('*')
      .eq('created_by', userId)
      .single();

    if (error || !brain) {
      return null;
    }

    return brain;
  } catch (error) {
    console.error('[loadUserBrain] Error:', error);
    return null;
  }
}

/**
 * Helper: Check module access and quotas
 */
async function checkModuleAccess(moduleId, userId, audience) {
  if (audience === 'internal') {
    return {
      allowed: true,
      daily_limit: null,
      monthly_limit: null,
      daily_used: 0,
      monthly_used: 0
    };
  }

  if (audience === 'public') {
    // Carousel generator not available for public
    return {
      allowed: false,
      reason: 'Carousel generator requires authentication'
    };
  }

  // Check client quotas (10 per month)
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabaseAdmin
      .from('carousel_generations')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    const monthlyUsed = count || 0;
    const monthlyLimit = MODULE_QUOTAS.client.limit;

    return {
      allowed: monthlyUsed < monthlyLimit,
      daily_limit: null,
      monthly_limit: monthlyLimit,
      daily_used: 0,
      monthly_used: monthlyUsed,
      remaining: Math.max(0, monthlyLimit - monthlyUsed)
    };

  } catch (error) {
    console.error('[checkModuleAccess] Error:', error);
    return { allowed: true }; // Fail open
  }
}

/**
 * Helper: Track module run in telemetry
 */
async function trackModuleRun({ module_id, user_id, audience, input_data, output_data, success, cost }) {
  try {
    await supabaseAdmin
      .from('module_runs')
      .insert({
        module_id,
        user_id: user_id || null,
        audience,
        input_data,
        output_data,
        success,
        cost,
        duration_ms: output_data?.generation_duration_ms || 0
      });
  } catch (error) {
    console.error('[trackModuleRun] Error:', error);
    // Non-fatal
  }
}
