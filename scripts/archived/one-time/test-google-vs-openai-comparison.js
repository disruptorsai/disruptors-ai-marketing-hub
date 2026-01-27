#!/usr/bin/env node

/**
 * Comprehensive Test: Google Gemini 2.5 Flash Image vs OpenAI GPT-Image-1
 * Theme: Ancient Art meets Futuristic Tech Concept Art
 *
 * This script tests both providers with the same prompt to compare:
 * - Google's newest model (Gemini 2.5 Flash Image via Replicate)
 * - OpenAI's GPT-Image-1 (NOT DALL-E 3 per project requirements)
 */

import Replicate from 'replicate';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  prompt: "ancient art meets futuristic tech concept art: Egyptian hieroglyphics seamlessly integrated with holographic displays, ancient stone tablets with glowing circuit patterns, mystical symbols transforming into digital code, Renaissance-style portraits with cyberpunk augmentations, classical marble statues enhanced with neon fiber optics, ancient scrolls displaying AI neural networks, temple architecture merged with sleek modern tech interfaces",
  options: {
    width: 1024,
    height: 1024,
    quality: 'standard',
    steps: 50,
    guidance: 7.5
  }
};

class ImageGenerationComparison {
  constructor() {
    // Initialize API clients
    this.replicate = new Replicate({
      auth: process.env.VITE_REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN,
    });

    this.openai = new OpenAI({
      apiKey: process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    });

    this.results = [];
  }

  /**
   * Enhance prompt with quality and brand consistency elements
   */
  enhancePrompt(basePrompt) {
    const brandElements = [
      "professional commercial quality",
      "high resolution 4K",
      "award-winning concept art",
      "dramatic lighting",
      "perfect composition",
      "cinematic quality"
    ];

    const negativePrompts = [
      "low quality",
      "blurry",
      "amateur",
      "pixelated",
      "distorted"
    ];

    return `${basePrompt}, ${brandElements.join(', ')}. Avoid: ${negativePrompts.join(', ')}`;
  }

  /**
   * Test Google Gemini 2.5 Flash Image via Replicate
   */
  async testGoogleGemini() {
    console.log('🔵 Testing Google Gemini 2.5 Flash Image via Replicate...');

    const startTime = Date.now();
    const enhancedPrompt = this.enhancePrompt(TEST_CONFIG.prompt);

    try {
      console.log('📝 Enhanced Prompt:', enhancedPrompt);

      const output = await this.replicate.run(
        "google/gemini-2.5-flash-image",
        {
          input: {
            prompt: enhancedPrompt,
            width: TEST_CONFIG.options.width,
            height: TEST_CONFIG.options.height,
            num_inference_steps: TEST_CONFIG.options.steps,
            guidance_scale: TEST_CONFIG.options.guidance
          }
        }
      );

      const generationTime = Date.now() - startTime;

      const result = {
        provider: 'Google',
        model: 'Gemini 2.5 Flash Image',
        access_method: 'Replicate',
        success: true,
        url: Array.isArray(output) ? output[0] : output,
        generation_time_ms: generationTime,
        cost_estimate: 0.039, // $0.039 per image as per Google pricing
        prompt_used: enhancedPrompt,
        parameters: TEST_CONFIG.options,
        capabilities: [
          'multi-image fusion',
          'character consistency',
          'conversational editing',
          'natural language transformations',
          'SynthID watermarking'
        ],
        limitations: [
          'Requires Replicate proxy for browser access',
          'Fixed pricing per image',
          'Limited direct API access'
        ]
      };

      console.log('✅ Google Gemini Success!');
      console.log(`⏱️  Generation time: ${generationTime}ms`);
      console.log(`🔗 Image URL: ${result.url}`);

      return result;

    } catch (error) {
      console.error('❌ Google Gemini failed:', error.message);

      return {
        provider: 'Google',
        model: 'Gemini 2.5 Flash Image',
        access_method: 'Replicate',
        success: false,
        error: error.message,
        generation_time_ms: Date.now() - startTime,
        note: 'Failed - check API keys and Replicate access'
      };
    }
  }

  /**
   * Test OpenAI GPT-Image-1 (NOT DALL-E 3)
   */
  async testOpenAI() {
    console.log('🟠 Testing OpenAI GPT-Image-1...');

    const startTime = Date.now();
    const enhancedPrompt = this.enhancePrompt(TEST_CONFIG.prompt);

    try {
      console.log('📝 Enhanced Prompt:', enhancedPrompt);

      // CRITICAL: Only use GPT-Image-1, never DALL-E 3
      const response = await this.openai.images.generate({
        model: "gpt-image-1",
        prompt: enhancedPrompt,
        n: 1,
        size: `${TEST_CONFIG.options.width}x${TEST_CONFIG.options.height}`,
        quality: TEST_CONFIG.options.quality,
        response_format: 'b64_json'
      });

      const generationTime = Date.now() - startTime;
      const imageData = response.data[0];

      const result = {
        provider: 'OpenAI',
        model: 'GPT-Image-1',
        access_method: 'Direct API',
        success: true,
        url: `data:image/png;base64,${imageData.b64_json}`,
        generation_time_ms: generationTime,
        cost_estimate: TEST_CONFIG.options.quality === 'premium' ? 0.08 : 0.04,
        prompt_used: enhancedPrompt,
        parameters: TEST_CONFIG.options,
        capabilities: [
          'direct browser API access',
          'flexible quality options',
          'base64 or URL responses',
          'consistent style control'
        ],
        limitations: [
          'DALL-E 3 explicitly excluded per project requirements',
          'Limited to GPT-Image-1 model only',
          'Cost scales with quality settings'
        ],
        note: 'Using GPT-Image-1 exclusively (DALL-E 3 excluded)'
      };

      console.log('✅ OpenAI GPT-Image-1 Success!');
      console.log(`⏱️  Generation time: ${generationTime}ms`);
      console.log(`💰 Estimated cost: $${result.cost_estimate}`);

      return result;

    } catch (error) {
      console.error('❌ OpenAI failed:', error.message);

      return {
        provider: 'OpenAI',
        model: 'GPT-Image-1',
        access_method: 'Direct API',
        success: false,
        error: error.message,
        generation_time_ms: Date.now() - startTime,
        note: 'Failed - check API key and model availability'
      };
    }
  }

  /**
   * Run comprehensive comparison test
   */
  async runComparison() {
    console.log('🚀 Starting Google vs OpenAI Image Generation Comparison');
    console.log('🎨 Theme: Ancient Art meets Futuristic Tech Concept Art');
    console.log('=' .repeat(70));
    console.log();

    // Test both providers
    const [googleResult, openaiResult] = await Promise.allSettled([
      this.testGoogleGemini(),
      this.testOpenAI()
    ]);

    const results = {
      google: googleResult.status === 'fulfilled' ? googleResult.value : {
        success: false,
        error: googleResult.reason?.message || 'Test failed to complete'
      },
      openai: openaiResult.status === 'fulfilled' ? openaiResult.value : {
        success: false,
        error: openaiResult.reason?.message || 'Test failed to complete'
      }
    };

    return results;
  }

  /**
   * Generate comprehensive analysis
   */
  generateAnalysis(results) {
    const analysis = {
      test_summary: {
        theme: "Ancient Art meets Futuristic Tech Concept Art",
        models_tested: [
          "Google Gemini 2.5 Flash Image (via Replicate)",
          "OpenAI GPT-Image-1 (Direct API)"
        ],
        test_date: new Date().toISOString(),
        success_rate: {
          google: results.google.success,
          openai: results.openai.success,
          overall: results.google.success || results.openai.success
        }
      },

      model_comparison: {
        google_gemini: {
          model: "Gemini 2.5 Flash Image",
          status: results.google.success ? 'Available' : 'Failed',
          access_method: 'Replicate proxy',
          generation_time: results.google.generation_time_ms,
          cost: '$0.039 per image',
          key_features: [
            'State-of-the-art image generation (Aug 2025)',
            'Multi-image fusion capabilities',
            'Character consistency for storytelling',
            'Conversational editing with natural language',
            'SynthID digital watermarking',
            'Fast conversational workflows'
          ],
          limitations: [
            'Requires Replicate for browser access',
            'No direct Gemini API image generation yet',
            'Fixed pricing model'
          ]
        },

        openai_gpt_image: {
          model: "GPT-Image-1",
          status: results.openai.success ? 'Available' : 'Failed',
          access_method: 'Direct OpenAI API',
          generation_time: results.openai.generation_time_ms,
          cost: results.openai.success ? `$${results.openai.cost_estimate} per image` : 'N/A',
          key_features: [
            'Direct browser API access',
            'Flexible quality settings (standard/premium)',
            'Base64 and URL response formats',
            'Established workflow integration',
            'DALL-E 3 explicitly excluded per project requirements'
          ],
          limitations: [
            'Limited to GPT-Image-1 model only',
            'Cost scales with quality settings',
            'Model restrictions per project guidelines'
          ]
        }
      },

      accessibility_comparison: {
        browser_compatibility: {
          google: 'Requires Replicate proxy (CORS limitations)',
          openai: 'Direct browser access available'
        },
        api_complexity: {
          google: 'Simple via Replicate, complex via direct API',
          openai: 'Direct and straightforward'
        },
        cost_structure: {
          google: 'Fixed $0.039 per image',
          openai: 'Variable ($0.04 standard, $0.08 premium)'
        }
      },

      recommendations: {
        immediate_use: results.openai.success ?
          'OpenAI GPT-Image-1 for immediate production use' :
          'API key configuration needed',

        future_consideration: 'Google Gemini 2.5 Flash Image for advanced features when direct API becomes available',

        current_best_option: this.determineBestOption(results),

        integration_strategy: [
          'Use AI orchestrator for intelligent model selection',
          'Implement Replicate for Google models access',
          'Maintain OpenAI as reliable fallback',
          'Monitor Google direct API availability'
        ]
      }
    };

    return analysis;
  }

  /**
   * Determine the best option based on test results
   */
  determineBestOption(results) {
    if (results.google.success && results.openai.success) {
      return 'Both models available - use AI orchestrator for intelligent selection';
    } else if (results.openai.success) {
      return 'OpenAI GPT-Image-1 - reliable direct API access';
    } else if (results.google.success) {
      return 'Google Gemini 2.5 Flash Image via Replicate';
    } else {
      return 'Both models failed - check API configuration';
    }
  }

  /**
   * Save comprehensive test results
   */
  async saveResults(results, analysis) {
    const outputDir = path.join(__dirname, '..', 'generated');
    await fs.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `google-vs-openai-comparison-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);

    const output = {
      metadata: {
        test_type: 'Google Gemini vs OpenAI Image Generation Comparison',
        theme: 'Ancient Art meets Futuristic Tech Concept Art',
        timestamp: new Date().toISOString(),
        models_tested: ['Google Gemini 2.5 Flash Image', 'OpenAI GPT-Image-1']
      },
      test_results: results,
      analysis: analysis,
      raw_prompts: {
        base_prompt: TEST_CONFIG.prompt,
        enhanced_prompt: this.enhancePrompt(TEST_CONFIG.prompt),
        test_parameters: TEST_CONFIG.options
      }
    };

    await fs.writeFile(filepath, JSON.stringify(output, null, 2));
    console.log(`📄 Comprehensive results saved to: ${filepath}`);

    return filepath;
  }
}

// Main execution function
async function runTest() {
  const tester = new ImageGenerationComparison();

  try {
    // Run the comparison
    const results = await tester.runComparison();

    console.log('\n📊 TEST RESULTS');
    console.log('=' .repeat(50));
    console.log(`🔵 Google Gemini 2.5 Flash: ${results.google.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`🟠 OpenAI GPT-Image-1: ${results.openai.success ? '✅ SUCCESS' : '❌ FAILED'}`);

    if (results.google.success) {
      console.log(`   Google Time: ${results.google.generation_time_ms}ms`);
      console.log(`   Google Cost: $${results.google.cost_estimate}`);
    }

    if (results.openai.success) {
      console.log(`   OpenAI Time: ${results.openai.generation_time_ms}ms`);
      console.log(`   OpenAI Cost: $${results.openai.cost_estimate}`);
    }

    // Generate analysis
    const analysis = tester.generateAnalysis(results);

    // Save comprehensive results
    const savedPath = await tester.saveResults(results, analysis);

    console.log('\n🎯 KEY FINDINGS');
    console.log('=' .repeat(50));
    console.log('📋 Models Tested:');
    console.log('  • Google Gemini 2.5 Flash Image (released Aug 2025)');
    console.log('  • OpenAI GPT-Image-1 (DALL-E 3 excluded per project requirements)');

    console.log('\n🔍 Accessibility:');
    console.log(`  • Google: ${analysis.accessibility_comparison.browser_compatibility.google}`);
    console.log(`  • OpenAI: ${analysis.accessibility_comparison.browser_compatibility.openai}`);

    console.log('\n💰 Cost Comparison:');
    console.log(`  • Google: ${analysis.accessibility_comparison.cost_structure.google}`);
    console.log(`  • OpenAI: ${analysis.accessibility_comparison.cost_structure.openai}`);

    console.log('\n🏆 Recommendation:');
    console.log(`  ${analysis.recommendations.current_best_option}`);

    console.log('\n✅ Test completed successfully!');
    return savedPath;

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    console.error('🔍 Details:', error);
    process.exit(1);
  }
}

// Check for required environment variables
function checkEnvironment() {
  const requiredVars = [
    'VITE_REPLICATE_API_TOKEN',
    'VITE_OPENAI_API_KEY'
  ];

  const missing = requiredVars.filter(varName =>
    !process.env[varName] && !process.env[varName.replace('VITE_', '')]
  );

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   ${varName} or ${varName.replace('VITE_', '')}`);
    });
    console.error('\n💡 Set these variables in your .env file or environment');
    process.exit(1);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Starting test script...');
  checkEnvironment();
  runTest().catch(console.error);
} else {
  console.log('Script imported as module');
}

export default ImageGenerationComparison;