#!/usr/bin/env node

/**
 * Test Single Image Generation
 * Tests the updated AI orchestrator with DALL-E 3 exclusion
 */

import { aiOrchestrator } from '../src/lib/ai-orchestrator.js';
import fs from 'fs/promises';
import path from 'path';

async function testImageGeneration() {
  console.log('🧪 Testing AI Orchestrator - Single Image Generation');
  console.log('✅ DALL-E 3 is explicitly excluded from this system\n');

  const servicePrompt = `Professional AI automation dashboard interface, sleek robotic process automation visualization, workflow diagrams with connected nodes, automated task management system, modern tech workspace, sophisticated blue and purple gradients (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), futuristic digital interface elements, clean minimalist design, high-tech aesthetic, commercial photography style, professional corporate design`;

  const options = {
    width: 1024,
    height: 1024,
    quality: 'premium',
    context: 'ai_automation_service_test'
  };

  try {
    console.log('🎨 Generating image with approved models only...');
    console.log(`📝 Prompt: ${servicePrompt}`);
    console.log(`⚙️  Options: ${JSON.stringify(options, null, 2)}\n`);

    const result = await aiOrchestrator.generateImage(servicePrompt, options);

    console.log('✅ Image generation successful!');
    console.log(`🔧 Provider: ${result.provider}`);
    console.log(`🤖 Model: ${result.model}`);
    console.log(`💰 Estimated cost: $${result.cost}`);
    console.log(`🔗 Image URL: ${result.url}`);

    if (result.stored_url) {
      console.log(`☁️  Stored URL: ${result.stored_url}`);
    }

    if (result.cloudinary_public_id) {
      console.log(`📁 Cloudinary ID: ${result.cloudinary_public_id}`);
    }

    // Save result to file for review
    const timestamp = new Date().toISOString().split('T')[0];
    const resultFile = path.join(process.cwd(), 'generated', `test-ai-automation-${timestamp}.json`);

    await fs.mkdir(path.dirname(resultFile), { recursive: true });
    await fs.writeFile(resultFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      service: 'AI Automation',
      prompt: servicePrompt,
      options,
      result,
      note: 'Generated with DALL-E 3 exclusion policy'
    }, null, 2));

    console.log(`\n📄 Result saved to: ${resultFile}`);
    console.log('\n🎉 Test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  - Service: AI Automation`);
    console.log(`  - Provider: ${result.provider}`);
    console.log(`  - Model: ${result.model} (DALL-E 3 excluded)`);
    console.log(`  - Quality: ${options.quality}`);
    console.log(`  - Size: ${options.width}x${options.height}`);

    return result;

  } catch (error) {
    console.error('❌ Image generation failed:', error.message);
    console.error('📊 Error details:', error);
    throw error;
  }
}

// Run the test
testImageGeneration()
  .then((result) => {
    console.log('\n✅ Test script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test script failed:', error.message);
    process.exit(1);
  });