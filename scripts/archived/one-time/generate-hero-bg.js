#!/usr/bin/env node

/**
 * Generate Hero Background Image Script
 * Uses the existing ImageGenerationService to create a hero background image
 */

import ImageGenerationService from './src/lib/image-generation.js';
import fs from 'fs';
import path from 'path';

const generateHeroBackground = async () => {
  console.log('🎨 Generating hero background image...');

  const imageService = new ImageGenerationService();

  const prompt = "Abstract AI neural network pattern, technological background, subtle blue and purple gradients, clean minimal design, professional corporate aesthetic, digital transformation concept, flowing data streams, geometric patterns, suitable as website background";

  const options = {
    model: 'black-forest-labs/flux-schnell', // Using FLUX for high quality
    width: 1920,
    height: 1080,
    guidance_scale: 7.5,
    num_inference_steps: 50,
    count: 1
  };

  try {
    console.log('📝 Prompt:', prompt);
    console.log('🔧 Using Replicate with FLUX Schnell model');
    console.log('📐 Dimensions: 1920x1080');

    const result = await imageService.generateWithReplicate(prompt, options);

    console.log('✅ Image generated successfully!');
    console.log('🔗 Image URL:', result.imageUrl);
    console.log('📋 Prediction ID:', result.predictionId);
    console.log('🏷️  Provider:', result.provider);
    console.log('⏰ Generated at:', result.metadata.timestamp);

    // Save the result to a JSON file for easy access
    const outputData = {
      imageUrl: result.imageUrl,
      predictionId: result.predictionId,
      metadata: result.metadata,
      usage: {
        description: 'Hero background image for website',
        recommendedOpacity: '10%',
        placement: 'Background layer behind hero content'
      }
    };

    const outputPath = path.join(process.cwd(), 'hero-background-result.json');
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

    console.log('💾 Result saved to:', outputPath);
    console.log('\n🎯 Next steps:');
    console.log('1. Download the image from the URL above');
    console.log('2. Save it to your public/images directory');
    console.log('3. Use it as a background with 10% opacity in your hero component');

    return result;

  } catch (error) {
    console.error('❌ Error generating image:', error.message);

    if (error.message.includes('API')) {
      console.log('\n💡 Troubleshooting:');
      console.log('- Check that VITE_REPLICATE_API_TOKEN is set in your environment');
      console.log('- Verify your Replicate API token has sufficient credits');
      console.log('- Ensure the Replicate API is accessible from your network');
    }

    throw error;
  }
};

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateHeroBackground()
    .then(() => {
      console.log('🎉 Hero background generation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Generation failed:', error);
      process.exit(1);
    });
}

export default generateHeroBackground;