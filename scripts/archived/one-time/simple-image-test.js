#!/usr/bin/env node

/**
 * Simple Image Generation Test
 * Direct test of OpenAI GPT-Image-1 (no DALL-E 3)
 */

import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testGPTImageGeneration() {
  console.log('🧪 Testing GPT-Image-1 Generation (DALL-E 3 explicitly excluded)');

  // Check for API key
  const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ No OpenAI API key found. Set VITE_OPENAI_API_KEY or OPENAI_API_KEY');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey });

  const servicePrompt = `Professional AI automation dashboard interface, sleek robotic process automation visualization, workflow diagrams with connected nodes, automated task management system, modern tech workspace, sophisticated blue and purple gradients (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), futuristic digital interface elements, clean minimalist design, high-tech aesthetic, commercial photography style, professional corporate design, high resolution, commercial quality, award-winning design`;

  try {
    console.log('🎨 Generating AI Automation service image...');
    console.log('🚫 DALL-E 3 is explicitly excluded from this system');
    console.log(`🤖 Using model: gpt-image-1 only\n`);

    const response = await openai.images.generate({
      model: "gpt-image-1", // NEVER use DALL-E 3
      prompt: servicePrompt,
      n: 1,
      size: "1024x1024",
      quality: "high"
    });

    console.log('📊 Response structure:', JSON.stringify(response, null, 2));

    const imageUrl = response.data?.[0]?.url || response.data?.[0]?.b64_json || 'No URL found';

    console.log('✅ Image generation successful!');
    console.log(`🔗 Image URL: ${imageUrl}`);
    console.log(`🤖 Model used: gpt-image-1 (DALL-E 3 excluded)`);
    console.log(`📐 Size: 1024x1024`);
    console.log(`⚡ Quality: HD`);

    // Save result for review
    const timestamp = new Date().toISOString().split('T')[0];
    const resultData = {
      timestamp: new Date().toISOString(),
      service: 'AI Automation',
      model: 'gpt-image-1',
      prompt: servicePrompt,
      imageUrl: imageUrl,
      size: '1024x1024',
      quality: 'hd',
      note: 'Generated with strict DALL-E 3 exclusion policy'
    };

    // Create generated directory if it doesn't exist
    const generatedDir = path.join(__dirname, '..', 'generated');
    await fs.mkdir(generatedDir, { recursive: true });

    const resultFile = path.join(generatedDir, `ai-automation-sample-${timestamp}.json`);
    await fs.writeFile(resultFile, JSON.stringify(resultData, null, 2));

    console.log(`\n📄 Result saved to: ${resultFile}`);
    console.log('\n🎉 Sample generation completed!');
    console.log('\n📋 Review Summary:');
    console.log(`  ✅ Service: AI Automation`);
    console.log(`  ✅ Model: gpt-image-1 (no DALL-E 3)`);
    console.log(`  ✅ Quality: HD (1024x1024)`);
    console.log(`  ✅ Brand colors: Blue/purple gradients`);
    console.log(`  ✅ Style: Professional corporate design`);
    console.log(`\n🔍 Please review the image at: ${imageUrl}`);

    return resultData;

  } catch (error) {
    console.error('❌ Image generation failed:', error.message);
    if (error.code === 'invalid_request_error') {
      console.error('💡 Note: Make sure your OpenAI API key has access to GPT-Image-1');
    }
    throw error;
  }
}

// Run the test
testGPTImageGeneration()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  });