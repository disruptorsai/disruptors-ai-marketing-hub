/**
 * ANACHRON Lite Icon Generator
 * Generates vector-style icons with ancient Greco-Roman motifs
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

const APPROVED_MODEL = 'gpt-image-1';

async function saveBase64Image(base64Data, filepath) {
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filepath, buffer);
  return filepath;
}

async function generateAnachronLiteIcon(config = {}) {
  const {
    motif = 'oracle eye',
    concept = 'AI insight and intelligence',
    accentColor = 'gold',
    accentHex = '#C9A53B',
    size = '64px',
    purpose = 'AI service icon'
  } = config;

  console.log('🎨 ANACHRON Lite: Generating Vector Icon');
  console.log('━'.repeat(80));

  // Context Analysis
  console.log('\n📋 Context Analysis:');
  console.log(`Purpose: ${purpose}`);
  console.log(`Concept: ${concept}`);
  console.log(`Motif: ${motif}`);
  console.log(`Accent: ${accentColor} (${accentHex})`);
  console.log(`Size: ${size}\n`);

  // Icon Blueprint
  console.log('🏛️ Icon Blueprint:');
  console.log('Style: ANACHRON Lite - Minimal vector with ancient motifs');
  console.log('Grid: 24×24px base with 2px stroke');
  console.log('Geometry: Sacred geometry, central symmetry');
  console.log('Background: Transparent');
  console.log('Palette: Ink linework + single accent color\n');

  // Build Prompt
  const prompt = `Minimal ancient-style icon of an ${motif}, drawn with consistent 2px ink (#1F1B17) stroke on 24px grid, rounded caps and joins, ${accentColor} (${accentHex}) geometric accent, centered composition with sacred geometry symmetry, flat vector illustration style, subtle ivory paper texture (#F3EFE6), transparent background, clean edges, high contrast, emblematic and timeless, 1:1 aspect ratio. Ancient Greco-Roman aesthetic, geometric simplicity, single iconic symbol, no text, professional icon design`;

  const negativePrompt = `neon, plastic, modern logos, 3D render, gradients, photorealism, cartoon, anime, oversaturation, noisy background, complex scene, multiple elements, text overlays, watermark, shadows, depth`;

  console.log('📝 Generating with OpenAI gpt-image-1...\n');
  console.log(`Model: ${APPROVED_MODEL}`);
  console.log('Size: 1024x1024 (1:1 for icon)');
  console.log('Quality: High\n');

  console.log('Prompt:', prompt.slice(0, 100) + '...');
  console.log('\nNegatives:', negativePrompt.slice(0, 80) + '...\n');

  try {
    const response = await openai.images.generate({
      model: APPROVED_MODEL,
      prompt: `${prompt}. Avoid: ${negativePrompt}`,
      size: '1024x1024',
      quality: 'high',
      n: 1
    });

    console.log('✅ Generation successful!\n');

    const imageData = response.data?.[0]?.b64_json;
    const imageUrl = response.data?.[0]?.url;

    if (!imageData && !imageUrl) {
      throw new Error('No image URL or data returned from API');
    }

    // Save image
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = motif.replace(/\s+/g, '-').toLowerCase();
    const filename = `anachron-lite-${safeName}-${timestamp}.png`;
    const outputDir = path.join(__dirname, '..', 'generated', 'anachron-lite');

    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filepath = path.join(outputDir, filename);

    console.log('💾 Saving image...');
    if (imageData) {
      await saveBase64Image(imageData, filepath);
      console.log('✅ Saved base64 image to:', filepath);
    } else {
      console.log('⚠️ Received URL instead of base64:', imageUrl);
    }

    // Save metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      style: 'ANACHRON Lite',
      context: {
        purpose: purpose,
        concept: concept,
        motif: motif,
        size: size
      },
      blueprint: {
        logline: `${motif} icon representing ${concept}`,
        geometry: 'Sacred geometry with central symmetry',
        grid: '24×24px with 2px stroke',
        stroke: '2px ink (#1F1B17), rounded caps and joins',
        accent: `${accentColor} (${accentHex})`,
        background: 'Transparent',
        style: 'Flat vector illustration'
      },
      generation: {
        model: APPROVED_MODEL,
        provider: 'openai',
        size: '1024x1024',
        quality: 'high',
        aspectRatio: '1:1'
      },
      prompt: prompt,
      negativePrompt: negativePrompt,
      imageUrl: imageUrl || 'base64_data',
      filepath: filepath,
      hasBase64: !!imageData,
      hasUrl: !!imageUrl
    };

    const metadataPath = filepath.replace('.png', '.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log('📄 Metadata saved:', metadataPath);

    console.log('\n🎉 ANACHRON Lite Icon Generation Complete!');
    console.log('━'.repeat(80));

    return {
      success: true,
      filepath,
      imageUrl,
      metadata
    };

  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    throw error;
  }
}

// Command line interface
const args = process.argv.slice(2);
const config = {};

// Parse command line arguments
for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace('--', '');
  const value = args[i + 1];
  config[key] = value;
}

// Default example: Oracle Eye for AI services
if (Object.keys(config).length === 0) {
  config.motif = 'oracle eye';
  config.concept = 'AI insight and intelligence';
  config.accentColor = 'gold';
  config.accentHex = '#C9A53B';
  config.size = '64px';
  config.purpose = 'AI service icon';
}

// Run generation
generateAnachronLiteIcon(config)
  .then(result => {
    console.log('\n✨ Icon ready for integration!');
    console.log('\nExamples of other icons to generate:');
    console.log('  node scripts/generate-anachron-lite-icon.js --motif "scroll" --concept "documentation" --accentColor "terracotta" --accentHex "#C96F4C"');
    console.log('  node scripts/generate-anachron-lite-icon.js --motif "circuit meander" --concept "connectivity" --accentColor "lapis" --accentHex "#2C6BAA"');
    console.log('  node scripts/generate-anachron-lite-icon.js --motif "laurel wreath" --concept "achievement" --accentColor "terracotta" --accentHex "#C96F4C"');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });