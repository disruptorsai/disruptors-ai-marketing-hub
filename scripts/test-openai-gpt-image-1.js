/**
 * Test OpenAI gpt-image-1 API parameters
 * Minimal test to verify correct API usage
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

async function testGptImage1() {
  console.log('🧪 Testing OpenAI gpt-image-1 API...\n');

  // Test 1: Minimal parameters
  console.log('Test 1: Minimal parameters (standard quality)');
  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: 'A simple blue circle on white background',
      size: '1024x1024',
      quality: 'medium', // Try 'medium' instead of 'standard'
      n: 1
    });
    console.log('✅ Success with quality: medium');
    console.log('   Image URL:', response.data[0].url.substring(0, 50) + '...');
    console.log('   Full response keys:', Object.keys(response));
    console.log('   Data keys:', Object.keys(response.data[0]));
  } catch (error) {
    console.error('❌ Error with quality: medium');
    console.error('   Error message:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
  }

  // Test 2: Try with 'high' quality
  console.log('\nTest 2: High quality');
  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: 'A simple red square on white background',
      size: '1024x1024',
      quality: 'high',
      n: 1
    });
    console.log('✅ Success with quality: high');
    console.log('   Image URL:', response.data[0].url.substring(0, 50) + '...');
  } catch (error) {
    console.error('❌ Error with quality: high');
    console.error('   Error message:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
  }

  // Test 3: Try with 'low' quality
  console.log('\nTest 3: Low quality');
  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: 'A simple green triangle on white background',
      size: '1024x1024',
      quality: 'low',
      n: 1
    });
    console.log('✅ Success with quality: low');
    console.log('   Image URL:', response.data[0].url.substring(0, 50) + '...');
  } catch (error) {
    console.error('❌ Error with quality: low');
    console.error('   Error message:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
  }

  // Test 4: Minimal - no quality parameter
  console.log('\nTest 4: No quality parameter (default)');
  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: 'A simple yellow star on white background',
      size: '1024x1024',
      n: 1
    });
    console.log('✅ Success without quality parameter');
    console.log('   Image URL:', response.data[0].url.substring(0, 50) + '...');
  } catch (error) {
    console.error('❌ Error without quality parameter');
    console.error('   Error message:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
  }

  // Test 5: Check if API key is valid
  console.log('\nTest 5: API Key validation');
  console.log('   API Key length:', process.env.VITE_OPENAI_API_KEY?.length || 0);
  console.log('   API Key prefix:', process.env.VITE_OPENAI_API_KEY?.substring(0, 10) || 'Not set');
}

testGptImage1().catch(console.error);
