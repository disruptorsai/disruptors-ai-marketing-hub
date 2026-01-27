/**
 * ANACHRON Lite Icon Generator - OpenAI gpt-image-1
 * Generates simple vector service icons using OpenAI's gpt-image-1 model
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'generated', 'anachron-lite');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const services = [
  {
    slug: 'ai-automation',
    title: 'AI Automation',
    prompt: 'Simple flat vector icon: single Greek astrolabe outline, 2px black stroke, minimal geometric design, blue accent color #2C6BAA, white background, extremely simple, clean lines, centered, icon style, no details, no texture'
  },
  {
    slug: 'social-media-marketing',
    title: 'Social Media Marketing',
    prompt: 'Simple flat vector icon: three connected circles in triangle formation, 2px black stroke, minimal geometric design, terracotta accent color #C96F4C, white background, extremely simple, clean lines, centered, icon style, no details, no texture'
  },
  {
    slug: 'seo-geo',
    title: 'SEO & GEO',
    prompt: 'Simple flat vector icon: single compass rose outline, 2px black stroke, minimal geometric design, green accent color #3C7A6A, white background, extremely simple, clean lines, centered, icon style, no details, no texture'
  },
  {
    slug: 'lead-generation',
    title: 'Lead Generation',
    prompt: 'Simple flat vector icon: inverted triangle funnel shape, 2px black stroke, minimal geometric design, blue accent color #2C6BAA, white background, extremely simple, clean lines, centered, icon style, no details, no texture'
  },
  {
    slug: 'paid-advertising',
    title: 'Paid Advertising',
    prompt: 'Simple flat vector icon: target with three concentric circles, 2px black stroke, minimal geometric design, gold accent color #C9A53B, white background, extremely simple, clean lines, centered, icon style, no details, no texture'
  },
  {
    slug: 'podcasting',
    title: 'Podcasting',
    prompt: 'Simple flat vector icon: single microphone outline, 2px black stroke, minimal geometric design, terracotta accent color #C96F4C, white background, extremely simple, clean lines, centered, icon style, no details, no texture'
  },
  {
    slug: 'custom-apps',
    title: 'Custom Apps',
    prompt: 'Simple flat vector icon: four squares in grid pattern, 2px black stroke, minimal geometric design, green accent color #3C7A6A, white background, extremely simple, clean lines, centered, icon style, no details, no texture'
  },
  {
    slug: 'crm-management',
    title: 'CRM Management',
    prompt: 'Simple flat vector icon: three connected person silhouettes, 2px black stroke, minimal geometric design, blue accent color #2C6BAA, white background, extremely simple, clean lines, centered, icon style, no details, no texture'
  },
  {
    slug: 'fractional-cmo',
    title: 'Fractional CMO',
    prompt: 'Simple flat vector icon: single Greek column outline, 2px black stroke, minimal geometric design, gold accent color #C9A53B, white background, extremely simple, clean lines, centered, icon style, no details, no texture'
  }
];

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

async function saveBase64Image(b64Data, filepath) {
  const buffer = Buffer.from(b64Data, 'base64');
  fs.writeFileSync(filepath, buffer);
}

async function generateIcon(service, index) {
  console.log(`\n[${index + 1}/${services.length}] Generating: ${service.title}`);
  console.log(`Prompt: ${service.prompt.substring(0, 80)}...`);

  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: service.prompt,
      n: 1,
      size: "1024x1024"
    });

    const imageData = response.data[0];
    const filename = `${service.slug}-icon-anachron-lite.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    console.log(`Saving to: ${filename}`);

    // gpt-image-1 returns base64 data, not URLs
    if (imageData.b64_json) {
      console.log('Saving from base64 data');
      await saveBase64Image(imageData.b64_json, filepath);
    } else if (imageData.url) {
      console.log(`Downloading from URL: ${imageData.url}`);
      await downloadImage(imageData.url, filepath);
    } else {
      throw new Error(`No image data returned from OpenAI. Keys: ${Object.keys(imageData).join(', ')}`);
    }

    // Save metadata
    const metadata = {
      service: service.title,
      slug: service.slug,
      prompt: service.prompt,
      model: 'gpt-image-1',
      timestamp: new Date().toISOString(),
      filepath: `/generated/anachron-lite/${filename}`,
      revised_prompt: response.data[0].revised_prompt || null
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${service.slug}-metadata.json`),
      JSON.stringify(metadata, null, 2)
    );

    console.log(`✅ Success: ${service.title}`);
    if (response.data[0].revised_prompt) {
      console.log(`   Revised: ${response.data[0].revised_prompt.substring(0, 80)}...`);
    }
    return { success: true, service: service.title, filepath };

  } catch (error) {
    console.error(`❌ Failed: ${service.title}`);
    console.error(`Error: ${error.message}`);
    return { success: false, service: service.title, error: error.message };
  }
}

async function generateAllIcons() {
  console.log('🎨 ANACHRON Lite Icon Generator - OpenAI gpt-image-1');
  console.log('=' .repeat(60));
  console.log(`Output Directory: ${OUTPUT_DIR}`);
  console.log(`Total Icons: ${services.length}`);
  console.log('=' .repeat(60));

  const results = [];

  for (let i = 0; i < services.length; i++) {
    const result = await generateIcon(services[i], i);
    results.push(result);

    // Rate limiting - wait 1 second between requests
    if (i < services.length - 1) {
      console.log('⏳ Waiting 1 second before next generation...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Generation Summary');
  console.log('=' .repeat(60));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}/${services.length}`);
  console.log(`❌ Failed: ${failed}/${services.length}`);

  if (failed > 0) {
    console.log('\nFailed icons:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.service}: ${r.error}`);
    });
  }

  // Save generation report
  const report = {
    timestamp: new Date().toISOString(),
    model: 'gpt-image-1',
    total: services.length,
    successful,
    failed,
    results
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'generation-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\n📄 Report saved: ${path.join(OUTPUT_DIR, 'generation-report.json')}`);
  console.log('\n✨ Icon generation complete!');
}

// Run generation
generateAllIcons().catch(console.error);