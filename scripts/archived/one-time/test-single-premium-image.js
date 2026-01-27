#!/usr/bin/env node

/**
 * Test Single Premium Image Generation
 * Debug GPT-Image-1 response format
 */

import OpenAI from 'openai';

async function testSingleImage() {
  console.log('🧪 Testing single premium image generation');

  const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ No OpenAI API key found');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey });

  const prompt = `Abstract AI automation workflow network, floating dashboard interfaces with interconnected nodes and data streams, robotic process automation visualization, workflow diagrams with flowing connections, automated task management system, subtle gear and circuit elements integrated, modern tech workspace aesthetic, sophisticated blue to purple gradient background (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), professional corporate design, clean minimalist composition, sophisticated lighting with soft shadows, high-end SaaS aesthetic, modern geometric elements, floating interface components, strategic negative space, commercial photography quality, award-winning design, high resolution`;

  try {
    console.log('🎨 Generating AI Automation image...');
    console.log('🚫 Using GPT-Image-1 only - DALL-E 3 excluded');

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      n: 1,
      size: "1536x1024",
      quality: "high"
    });

    console.log('📊 Full response structure:');
    console.log(JSON.stringify(response, null, 2));

    const imageData = response.data[0];
    console.log('\n📊 Image data structure:');
    console.log(JSON.stringify(imageData, null, 2));

    // Try different ways to get the image
    const imageUrl = imageData.url || imageData.b64_json || 'No image found';
    console.log(`\n🔗 Image URL: ${imageUrl}`);

    if (imageData.b64_json) {
      console.log('✅ Base64 data found - image generated successfully');
      console.log(`📏 Base64 length: ${imageData.b64_json.length} characters`);
    }

    return {
      success: true,
      imageUrl: imageUrl,
      hasBase64: !!imageData.b64_json,
      hasUrl: !!imageData.url
    };

  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

testSingleImage()
  .then(result => {
    console.log('\n📋 Test Result:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  });