/**
 * Generate Keyword Research Icon - ANACHRON Lite Style
 * Uses Replicate Flux 1.1 Pro for simple flat vector icon
 */

import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replicate = new Replicate({
  auth: process.env.VITE_REPLICATE_API_TOKEN,
});

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'generated', 'anachron-lite');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const service = {
  slug: 'keyword-research',
  title: 'Keyword Research',
  prompt: 'Simple flat vector icon: magnifying glass with three horizontal lines inside lens, 2px black stroke, minimal geometric design, blue accent color #2C6BAA, white background, extremely simple, clean lines, centered, icon style, no details, no texture'
};

const negativePrompt = 'neon, plastic, modern logos, cars, 3D render, gradients, photorealism, cartoon, oversaturation, noisy background, busy details, cluttered composition, complex details, patterns, textures, shading, shadows, 3d effects, realistic, ornate, decorative';

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function generateIcon() {
  console.log('🎨 ANACHRON Lite Icon Generator');
  console.log('='.repeat(60));
  console.log(`Generating: ${service.title}`);
  console.log(`Prompt: ${service.prompt}`);
  console.log('='.repeat(60));

  try {
    console.log('\n🚀 Running Flux 1.1 Pro generation...');

    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro",
      {
        input: {
          prompt: service.prompt,
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 100,
          safety_tolerance: 2,
          prompt_upsampling: false,
          negative_prompt: negativePrompt
        }
      }
    );

    // Replicate returns a FileOutput object with a url() method
    let imageUrl;
    if (typeof output === 'string') {
      imageUrl = output;
    } else if (Array.isArray(output)) {
      imageUrl = output[0];
    } else if (output && typeof output.url === 'function') {
      imageUrl = await output.url();
    } else if (output && typeof output.url === 'string') {
      imageUrl = output.url;
    }

    if (!imageUrl) {
      throw new Error(`No output URL received from Replicate. Output type: ${typeof output}`);
    }

    const filename = `${service.slug}-icon-anachron-lite.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    console.log(`\n📥 Downloading icon...`);
    console.log(`URL: ${imageUrl}`);
    console.log(`Saving to: ${filename}`);

    await downloadImage(imageUrl, filepath);

    // Save metadata
    const metadata = {
      service: service.title,
      slug: service.slug,
      prompt: service.prompt,
      negativePrompt,
      model: 'black-forest-labs/flux-1.1-pro',
      timestamp: new Date().toISOString(),
      filepath: `/generated/anachron-lite/${filename}`
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${service.slug}-metadata.json`),
      JSON.stringify(metadata, null, 2)
    );

    console.log(`\n✅ Success! Icon generated.`);
    console.log(`📄 Metadata saved: ${service.slug}-metadata.json`);
    console.log(`\n📍 File location: ${filepath}`);
    console.log(`\n🎉 Ready to use in components!`);

    return { success: true, filepath };

  } catch (error) {
    console.error(`\n❌ Generation failed: ${error.message}`);
    throw error;
  }
}

// Run generation
generateIcon().catch(console.error);
