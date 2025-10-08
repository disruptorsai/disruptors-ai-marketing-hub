/**
 * Test Google Gemini API quota and connectivity
 */

import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({
  apiKey: process.env.VITE_GEMINI_API_KEY
});

async function testGeminiQuota() {
  console.log('🧪 Testing Google Gemini API...\n');
  console.log('API Key length:', process.env.VITE_GEMINI_API_KEY?.length || 0);
  console.log('API Key prefix:', process.env.VITE_GEMINI_API_KEY?.substring(0, 10) || 'Not set');

  console.log('\nAttempting simple text generation (to check quota)...');
  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: 'Generate a small 256x256 pixel red circle on white background'
    });

    console.log('✅ Success! API is working.');
    console.log('Response:', JSON.stringify(response, null, 2).substring(0, 500));
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }

    // Check if it's a quota error
    if (error.message?.includes('quota') || error.message?.includes('exceeded')) {
      console.log('\n⚠️  QUOTA EXCEEDED - This is a free tier limitation');
      console.log('Solutions:');
      console.log('1. Wait for quota to reset (usually daily or monthly)');
      console.log('2. Upgrade to paid tier: https://ai.google.dev/pricing');
      console.log('3. Use OpenAI gpt-image-1 instead (already working)');
    }
  }
}

testGeminiQuota().catch(console.error);
