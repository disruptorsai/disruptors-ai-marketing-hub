const fs = require('fs');
const path = require('path');

/**
 * Generate Hero Background Image using Replicate API
 * Standalone Node.js script that can be run directly
 */

// API Configuration
const REPLICATE_API_ENDPOINT = 'https://api.replicate.com/v1/predictions';

class SimpleImageGenerator {
  constructor() {
    this.apiToken = process.env.VITE_REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN;

    if (!this.apiToken) {
      throw new Error('Missing Replicate API token. Set VITE_REPLICATE_API_TOKEN or REPLICATE_API_TOKEN environment variable.');
    }
  }

  async generateImage(prompt, options = {}) {
    const model = options.model || 'black-forest-labs/flux-schnell';

    console.log(`🚀 Starting prediction with model: ${model}`);

    const response = await fetch(REPLICATE_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: options.version || 'latest',
        input: {
          prompt,
          width: options.width || 1920,
          height: options.height || 1080,
          num_outputs: options.count || 1,
          guidance_scale: options.guidance_scale || 7.5,
          num_inference_steps: options.steps || 50
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Replicate API error: ${response.statusText} - ${errorText}`);
    }

    const prediction = await response.json();
    console.log(`⏳ Prediction created with ID: ${prediction.id}`);

    // Poll for completion
    const result = await this.waitForCompletion(prediction.id);

    return {
      imageUrl: result.output?.[0],
      predictionId: prediction.id,
      metadata: {
        model,
        prompt,
        parameters: options,
        timestamp: new Date().toISOString()
      }
    };
  }

  async waitForCompletion(predictionId) {
    const pollInterval = 2000; // 2 seconds
    const maxWaitTime = 300000; // 5 minutes
    const startTime = Date.now();

    console.log('⏱️  Waiting for image generation to complete...');

    while (Date.now() - startTime < maxWaitTime) {
      const response = await fetch(`${REPLICATE_API_ENDPOINT}/${predictionId}`, {
        headers: {
          'Authorization': `Token ${this.apiToken}`,
        },
      });

      const prediction = await response.json();

      console.log(`📊 Status: ${prediction.status}`);

      if (prediction.status === 'succeeded') {
        console.log('✅ Generation completed successfully!');
        return prediction;
      } else if (prediction.status === 'failed') {
        throw new Error(`Replicate prediction failed: ${prediction.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Replicate prediction timed out after 5 minutes');
  }
}

async function generateHeroBackground() {
  console.log('🎨 Generating hero background image for Disruptors AI...\n');

  const prompt = "Abstract AI neural network pattern, technological background, subtle blue and purple gradients, clean minimal design, professional corporate aesthetic, digital transformation concept, flowing data streams, geometric patterns, suitable as website background";

  const options = {
    model: 'black-forest-labs/flux-schnell',
    width: 1920,
    height: 1080,
    guidance_scale: 7.5,
    num_inference_steps: 50,
    count: 1
  };

  try {
    console.log('📝 Prompt:', prompt);
    console.log('🔧 Model: FLUX Schnell (black-forest-labs/flux-schnell)');
    console.log('📐 Dimensions: 1920×1080 (widescreen)');
    console.log('🎛️  Guidance Scale: 7.5');
    console.log('🔄 Inference Steps: 50\n');

    const generator = new SimpleImageGenerator();
    const result = await generator.generateImage(prompt, options);

    console.log('\n🎉 Hero background generated successfully!');
    console.log('🔗 Image URL:', result.imageUrl);
    console.log('🆔 Prediction ID:', result.predictionId);
    console.log('⏰ Generated at:', result.metadata.timestamp);

    // Save the result
    const outputData = {
      imageUrl: result.imageUrl,
      predictionId: result.predictionId,
      metadata: result.metadata,
      usage: {
        description: 'Hero background image for Disruptors AI website',
        recommendedOpacity: '10%',
        placement: 'Background layer behind hero content',
        cssExample: `background-image: url('${result.imageUrl}'); opacity: 0.1;`
      }
    };

    const outputPath = path.join(process.cwd(), 'hero-background-result.json');
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

    console.log('💾 Result saved to:', outputPath);
    console.log('\n🎯 Integration Steps:');
    console.log('1. Copy the image URL above');
    console.log('2. Add it to your hero component with 10% opacity');
    console.log('3. Consider downloading and hosting locally for better performance');
    console.log('\n📋 CSS Example:');
    console.log(`background-image: url('${result.imageUrl}');`);
    console.log('opacity: 0.1;');
    console.log('background-size: cover;');
    console.log('background-position: center;');

    return result;

  } catch (error) {
    console.error('\n❌ Error generating hero background:', error.message);

    if (error.message.includes('Missing Replicate API token')) {
      console.log('\n💡 Setup Instructions:');
      console.log('1. Get a Replicate API token from https://replicate.com/account/api-tokens');
      console.log('2. Set the environment variable:');
      console.log('   - Windows: set REPLICATE_API_TOKEN=your_token_here');
      console.log('   - macOS/Linux: export REPLICATE_API_TOKEN=your_token_here');
      console.log('3. Or add it to your .env file as VITE_REPLICATE_API_TOKEN=your_token_here');
    }

    throw error;
  }
}

// Run the script
if (require.main === module) {
  generateHeroBackground()
    .then(() => {
      console.log('\n🎉 Hero background generation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Generation failed');
      process.exit(1);
    });
}

module.exports = { generateHeroBackground, SimpleImageGenerator };