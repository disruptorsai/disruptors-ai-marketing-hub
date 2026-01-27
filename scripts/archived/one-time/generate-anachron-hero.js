/**
 * ANACHRON Style Image Generator
 * Generates homepage hero image in ancient-tech aesthetic
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

async function generateAnachronHero() {
  console.log('🎨 ANACHRON Art Director: Generating Homepage Hero Image');
  console.log('━'.repeat(80));

  // Context Analysis
  console.log('\n📋 Context Analysis:');
  console.log('Page: Homepage Hero Section');
  console.log('Theme: AI-Powered Marketing Agency + Strategic Growth');
  console.log('Purpose: Discovery & Innovation - AI as tool for strategic insight');
  console.log('Layout: 16:9 panoramic hero banner\n');

  // Scene Blueprint
  console.log('🏛️ Scene Blueprint:');
  console.log('Setting: Seaside stoa with marble colonnade');
  console.log('Subject: Five philosophers/strategists in collaborative discussion');
  console.log('Tech Motif: Monumental mosaic analytics wall with Greek key circuits');
  console.log('Lighting: Golden hour Mediterranean');
  console.log('Medium: Neoclassical academic oil painting with craquelure\n');

  // Final Prompt
  const prompt = `neoclassical academic oil painting, wide panoramic view of an ancient Greek seaside stoa with towering marble columns, five Hellenistic figures in rich terracotta, ivory, and russet togas stand in animated strategic discussion before a colossal mosaic wall (12 feet wide) embedded in weathered colonnade architecture; the mosaic is composed of thousands of tiny tesserae forming a glowing interface—intricate Greek key meander patterns function as circuit paths, displaying abstract data flows and growth analytics in soft cyan and gold light; figures gesture expressively with clean five-fingered hands pointing at mosaic sections, examining patterns, consulting scrolls and wax tablets; golden hour Mediterranean sunlight streams through columns casting dramatic shadows and volumetric god-rays, while the mosaic's glow creates cool reflections on marble floors and faces; azure Aegean Sea stretches to horizon in background with gentle bokeh effect; marble architecture shows salt stains, tool marks, weathered stucco with flaked pigment revealing ancient plaster, bronze bezels around mosaic display green verdigris patina; scrolls, wooden styluses, and geometric instruments rest on nearby stone table; strong anatomical realism with contrapposto poses conveying wisdom and collaboration, detailed Hellenistic drapery with heavy fabric folds, expressive scholarly faces showing curiosity and strategic thinking; fine craquelure across entire painting surface suggesting centuries-old academic masterpiece, subtle varnish sheen catching light; color harmony of cool azure blues vs warm terracotta and gold leaf accents; ultra detailed, cinematic depth of field, volumetric lighting, respectful dignified tone treating technology as sacred instrument of knowledge and strategy`;

  console.log('📝 Generating with OpenAI gpt-image-1...\n');
  console.log(`Model: ${APPROVED_MODEL}`);
  console.log('Size: 1536x1024 (16:9 panoramic)');
  console.log('Quality: High');
  console.log('Input Fidelity: High\n');

  try {
    const response = await openai.images.generate({
      model: APPROVED_MODEL,
      prompt: prompt,
      size: '1536x1024',
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
    const filename = `anachron-hero-${timestamp}.png`;
    const outputDir = path.join(__dirname, '..', 'generated', 'anachron');

    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filepath = path.join(outputDir, filename);

    console.log('\n💾 Saving image...');
    if (imageData) {
      await saveBase64Image(imageData, filepath);
      console.log('✅ Saved base64 image to:', filepath);
    } else {
      console.log('⚠️ Received URL instead of base64:', imageUrl);
    }

    // Save metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      context: {
        page: 'Homepage Hero',
        section: 'Hero Banner',
        theme: 'AI-Powered Marketing + Strategic Growth',
        purpose: 'Discovery & Innovation'
      },
      blueprint: {
        logline: 'Philosophers consult mosaic analytics wall for strategic growth',
        era: 'Greek seaside stoa',
        subject: 'Five strategists in collaborative discussion',
        techMotif: 'Mosaic HUD with Greek key circuits',
        lighting: 'Golden hour Mediterranean',
        camera: 'Wide architectural panorama',
        medium: 'Neoclassical academic oil painting',
        palette: 'Azure + terracotta + ivory + gold + cyan'
      },
      generation: {
        model: APPROVED_MODEL,
        provider: 'openai',
        size: '1536x1024',
        quality: 'high',
        aspectRatio: '16:9'
      },
      prompt: prompt,
      imageUrl: imageUrl || 'base64_data',
      filepath: filepath,
      hasBase64: !!imageData,
      hasUrl: !!imageUrl
    };

    const metadataPath = filepath.replace('.png', '.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log('📄 Metadata saved:', metadataPath);

    console.log('\n🎉 ANACHRON Hero Image Generation Complete!');
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

// Run generation
generateAnachronHero()
  .then(result => {
    console.log('\n✨ Ready to integrate into homepage!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });