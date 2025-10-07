/**
 * Generate App Store-Style Icons for Resources Page
 * Creates 1024x1024 icons using Google Gemini 2.5 Flash Image Preview
 * Mixed styles: Glassmorphism, 3D Clay, Advanced Gradients
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini
const genAI = new GoogleGenAI({
  apiKey: process.env.VITE_GEMINI_API_KEY
});

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'resource-icons');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Sample icons to generate (3 different styles)
const SAMPLE_ICONS = [
  {
    name: 'ai-content-writer',
    title: 'AI Content Writer',
    style: 'glassmorphism',
    prompt: `App store icon, 1024x1024px, rounded square background, centered composition.

Glassmorphism style with frosted glass effect. A glowing pen or quill floating in the center, surrounded by floating text particles and sparkles. Translucent layers with subtle depth.

Color palette: Deep blue gradient background (#2563eb to #1e40af), white/light blue glass elements, gold accent sparkles (#d4af37).

Modern, clean, professional SaaS aesthetic. Soft shadows, subtle blur effects, premium feel. Centered icon with padding.`,
  },
  {
    name: 'growth-audit-tool',
    title: 'Growth Audit Tool',
    style: '3d-clay',
    prompt: `App store icon, 1024x1024px, rounded square background, centered composition.

3D clay aesthetic with soft touchable surfaces. An upward trending arrow or growth chart made of smooth 3D clay material. Playful but professional.

Color palette: Gradient background from teal to green (#14b8a6 to #10b981), clay elements in white and cream tones, gold accents (#c9a53b).

Soft lighting, gentle shadows, depth without being overwhelming. Notion/Linear style minimalism. Premium SaaS look.`,
  },
  {
    name: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    style: 'advanced-gradient',
    prompt: `App store icon, 1024x1024px, rounded square background, centered composition.

Advanced mesh gradient style with sophisticated multi-color blends. Abstract data visualization - flowing lines, bar charts, or pie chart elements that blend into beautiful gradient flows.

Color palette: Purple to blue to pink mesh gradient (#9333ea to #3b82f6 to #ec4899), vibrant but professional. Gold highlight accents (#d4af37).

Modern, dynamic, data-forward aesthetic. Clean geometric shapes, smooth gradient transitions, professional SaaS tool appearance.`,
  }
];

/**
 * Generate a single icon using Gemini
 */
async function generateIcon(config) {
  console.log(`\n🎨 Generating ${config.title} (${config.style} style)...`);

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: config.prompt
    });

    // Extract image data from response
    let imageData = null;
    let mimeType = 'image/png';

    if (response.candidates && response.candidates[0]) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageData = part.inlineData.data;
          mimeType = part.inlineData.mimeType || 'image/png';
          break;
        }
      }
    }

    if (!imageData) {
      throw new Error('No image data returned by Gemini');
    }

    // Determine file extension
    const ext = mimeType.includes('png') ? 'png' : 'jpg';
    const filename = `${config.name}.${ext}`;
    const filepath = path.join(OUTPUT_DIR, filename);

    // Convert base64 to buffer and save
    const buffer = Buffer.from(imageData, 'base64');
    fs.writeFileSync(filepath, buffer);

    console.log(`✅ Saved: ${filename} (${(buffer.length / 1024).toFixed(2)} KB)`);
    return filepath;

  } catch (error) {
    console.error(`❌ Error generating ${config.title}:`, error.message);
    throw error;
  }
}

/**
 * Generate all sample icons
 */
async function generateSamples() {
  console.log('🚀 Starting Resource Icon Generation');
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`📊 Generating ${SAMPLE_ICONS.length} sample icons...\n`);

  const results = [];

  for (const config of SAMPLE_ICONS) {
    try {
      const filepath = await generateIcon(config);
      results.push({
        success: true,
        name: config.name,
        title: config.title,
        style: config.style,
        filepath
      });

      // Wait between requests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      results.push({
        success: false,
        name: config.name,
        title: config.title,
        style: config.style,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}/${SAMPLE_ICONS.length}`);
  console.log(`❌ Failed: ${failed.length}/${SAMPLE_ICONS.length}`);

  if (successful.length > 0) {
    console.log('\n✅ Generated Icons:');
    successful.forEach(r => {
      console.log(`   - ${r.title} (${r.style})`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed Icons:');
    failed.forEach(r => {
      console.log(`   - ${r.title}: ${r.error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📁 Icons saved to: ${OUTPUT_DIR}`);
  console.log('='.repeat(60));
}

// Run the generator
generateSamples().catch(console.error);
