/**
 * Test OpenAI API connectivity and diagnose connection issues
 */

import OpenAI from 'openai';
import https from 'https';

console.log('🔍 Diagnosing OpenAI API Connection...\n');

// Check API key
console.log('1. API Key Check:');
console.log('   VITE_OPENAI_API_KEY:', process.env.VITE_OPENAI_API_KEY ? '✅ Set' : '❌ Not set');
console.log('   Length:', process.env.VITE_OPENAI_API_KEY?.length || 0);
console.log('   Prefix:', process.env.VITE_OPENAI_API_KEY?.substring(0, 10) || 'N/A');

// Check raw HTTPS connection to OpenAI
console.log('\n2. Raw HTTPS Connection Test:');
const testUrl = 'https://api.openai.com/v1/models';
https.get(testUrl, {
  headers: {
    'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`
  }
}, (res) => {
  console.log('   Status:', res.statusCode);
  console.log('   ✅ Can reach OpenAI API');

  // Test with OpenAI SDK
  console.log('\n3. OpenAI SDK Test:');
  const openai = new OpenAI({
    apiKey: process.env.VITE_OPENAI_API_KEY
  });

  openai.models.list()
    .then((models) => {
      console.log('   ✅ SDK working correctly');
      console.log('   Available models count:', models.data.length);

      // Find gpt-image-1
      const gptImage = models.data.find(m => m.id === 'gpt-image-1');
      if (gptImage) {
        console.log('   ✅ gpt-image-1 available');
      } else {
        console.log('   ⚠️  gpt-image-1 not found in models list');
        console.log('   Note: This might be normal if the API key doesn\'t have image generation enabled');
      }

      // Now test actual image generation
      console.log('\n4. Image Generation Test:');
      return openai.images.generate({
        model: 'gpt-image-1',
        prompt: 'A simple red circle',
        size: '1024x1024',
        quality: 'low', // Use low quality for faster/cheaper test
        n: 1
      });
    })
    .then((response) => {
      console.log('   ✅ Image generation successful!');
      console.log('   Image URL:', response.data[0].url.substring(0, 60) + '...');
    })
    .catch((error) => {
      console.error('   ❌ Error:', error.message);
      if (error.code) console.error('   Error code:', error.code);
      if (error.type) console.error('   Error type:', error.type);
    });

}).on('error', (error) => {
  console.error('   ❌ Cannot reach OpenAI API');
  console.error('   Error:', error.message);
  console.error('   Error code:', error.code);

  if (error.code === 'ECONNREFUSED') {
    console.log('\n⚠️  CONNECTION REFUSED - Possible causes:');
    console.log('   1. Firewall blocking outbound HTTPS to api.openai.com');
    console.log('   2. Corporate proxy requiring configuration');
    console.log('   3. VPN or network restrictions');
    console.log('   4. Local proxy settings interfering');
    console.log('\nSolutions:');
    console.log('   - Check Windows Firewall settings');
    console.log('   - Disable VPN temporarily and retry');
    console.log('   - Check proxy settings: echo %HTTP_PROXY% and %HTTPS_PROXY%');
    console.log('   - Try from a different network');
  }
});
