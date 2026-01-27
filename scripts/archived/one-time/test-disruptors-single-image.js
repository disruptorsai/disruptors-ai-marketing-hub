/**
 * Test script to generate a single Disruptors service image
 * Quick test before running the full batch
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

// Disruptors Ancient Style System Prompt
const DISRUPTORS_STYLE_PROMPT = `DISRUPTORS ANCIENT STYLE: Professional corporate design with sophisticated blue-to-purple gradients (#1e3a8a, #3730a3, #7c3aed, #8b5cf6), clean minimalist composition, floating dashboard interfaces with interconnected nodes and data streams, abstract technology visualization, modern geometric elements, strategic negative space, soft professional lighting with subtle shadows, high-end SaaS aesthetic inspired by Stripe/Notion/Figma, futuristic digital interface elements, commercial photography quality, award-winning design standards, business-appropriate sophistication, AI-forward design philosophy emphasizing automation and intelligence, sophisticated tech-forward aesthetic, modern data visualization, professional workspace ambiance. Focus on abstract conceptual visualization over literal representation, with floating interface mockups, analytics dashboards, workflow networks, and technology iconography subtly integrated.`;

async function generateAIAutomationImage() {
  try {
    console.log('🎯 Testing AI Automation service image generation...');

    const prompt = `${DISRUPTORS_STYLE_PROMPT}

SPECIFIC SERVICE: AI Automation - Automate repetitive tasks and workflows
FOCUS ELEMENTS: Tech dashboard interfaces, automation workflows, AI processing visualization

Create a professional service card image that visualizes AI automation through abstract dashboard interfaces and technology visualization. The composition should feature floating UI mockups, data visualization elements, and workflow networks that conceptually represent automation and intelligent processing. Maintain the sophisticated blue-to-purple gradient color scheme and high-end SaaS aesthetic throughout. The image should be suitable for a marketing website service card, emphasizing professionalism and technological sophistication.

Dimensions: 1536x1024 pixels (16:9 aspect ratio)
Style: Abstract, conceptual, dashboard-focused visualization`;

    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: prompt,
      n: 1,
      size: '1536x1024',
      quality: 'high'
    });

    console.log('✅ Generation successful!');

    // Handle both URL and base64 responses
    let buffer;
    if (response.data[0].url) {
      console.log('📷 Image URL:', response.data[0].url);
      const imageResponse = await fetch(response.data[0].url);
      buffer = await imageResponse.arrayBuffer();
    } else if (response.data[0].b64_json) {
      console.log('📷 Image as base64 (first 50 chars):', response.data[0].b64_json.substring(0, 50) + '...');
      buffer = Buffer.from(response.data[0].b64_json, 'base64');
    } else {
      throw new Error('No image URL or base64 data in response');
    }

    const outputDir = path.join(__dirname, '..', 'generated');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `ai-automation-disruptors-test-${Date.now()}.png`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, Buffer.from(buffer));
    console.log('💾 Saved to:', filename);

    // Save result info
    const result = {
      service: 'AI Automation',
      provider: 'OpenAI GPT-Image-1',
      url: response.data[0].url || 'base64_data',
      local_path: filepath,
      revised_prompt: response.data[0].revised_prompt,
      has_base64: !!response.data[0].b64_json,
      timestamp: new Date().toISOString()
    };

    const resultFile = path.join(outputDir, `ai-automation-test-result-${Date.now()}.json`);
    fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));
    console.log('📄 Result saved to:', path.basename(resultFile));

    return result;

  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    throw error;
  }
}

// Execute
generateAIAutomationImage().catch(console.error);