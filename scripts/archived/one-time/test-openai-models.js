/**
 * Test OpenAI image generation models
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

async function testModels() {
  console.log('Testing OpenAI Image Generation Models\n');
  console.log('=' .repeat(60));

  // Test 1: DALL-E 3 (current production model)
  console.log('\n1. Testing DALL-E 3...');
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: "Simple red circle on white background",
      n: 1,
      size: "1024x1024",
    });
    console.log('✅ DALL-E 3 works!');
    console.log('   URL:', response.data[0].url);
  } catch (error) {
    console.log('❌ DALL-E 3 failed:', error.message);
  }

  // Test 2: DALL-E 2
  console.log('\n2. Testing DALL-E 2...');
  try {
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: "Simple red circle on white background",
      n: 1,
      size: "1024x1024",
    });
    console.log('✅ DALL-E 2 works!');
    console.log('   URL:', response.data[0].url);
  } catch (error) {
    console.log('❌ DALL-E 2 failed:', error.message);
  }

  // Test 3: Check if gpt-image-1 exists
  console.log('\n3. Testing gpt-image-1 (experimental)...');
  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: "Simple red circle on white background",
      n: 1,
      size: "1024x1024",
    });
    console.log('✅ gpt-image-1 works!');
    console.log('   URL:', response.data[0].url);
  } catch (error) {
    console.log('❌ gpt-image-1 failed:', error.message);
  }

  // Test 4: List available models
  console.log('\n4. Listing all available models...');
  try {
    const models = await openai.models.list();
    const imageModels = models.data.filter(m =>
      m.id.includes('dall-e') ||
      m.id.includes('image') ||
      m.id.includes('gpt-image')
    );

    if (imageModels.length > 0) {
      console.log('Available image generation models:');
      imageModels.forEach(m => {
        console.log(`   - ${m.id}`);
      });
    } else {
      console.log('No image generation models found in list.');
      console.log('(DALL-E models may not appear in the models list)');
    }
  } catch (error) {
    console.log('❌ Failed to list models:', error.message);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('\nSummary:');
  console.log('- DALL-E 3 is the current production model');
  console.log('- DALL-E 2 is available for simpler use cases');
  console.log('- gpt-image-1 may not be publicly released yet');
  console.log('\nNote: Your CLAUDE.md explicitly forbids DALL-E usage.');
  console.log('This restriction may need to be reconsidered.');
}

testModels().catch(console.error);