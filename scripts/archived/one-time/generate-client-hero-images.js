/**
 * Generate Client Hero Background Images
 *
 * Creates unique, contextually appropriate hero images for client cards on Work page
 * Uses OpenAI gpt-image-1 for professional, photorealistic results
 */

import { createClient } from '@supabase/supabase-js';
import { openaiGenerate } from '../src/lib/openai-image.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🎨 CLIENT HERO IMAGES GENERATION');
console.log('================================\n');

// Client hero image specifications
const heroImages = [
  {
    client: 'Granite Paving',
    filename: 'granite-paving-hero.jpg',
    prompt: 'Professional photograph of a smooth, newly paved asphalt road stretching into the distance, fresh black asphalt surface with perfect lines, construction equipment in background, golden hour lighting, wide angle shot, high quality, photorealistic, 4k',
    description: 'Asphalt road for Granite Paving (construction/landscaping)'
  },
  {
    client: 'SegPro Solutions',
    filename: 'segpro-hero.jpg',
    prompt: 'Professional photograph of a modern financial calculator and tax spreadsheet on a sleek desk, calculator displaying numbers, spreadsheet with financial data, organized office environment, professional lighting, business setting, high quality, photorealistic, 4k',
    description: 'Financial calculator/tax spreadsheet for SegPro (industrial safety)'
  },
  {
    client: 'Financial Haus',
    filename: 'financial-haus-updated-hero.jpg',
    prompt: 'Professional photograph of stacks of money and gold coins arranged artistically, US dollar bills neatly stacked, gleaming gold coins scattered, wealth and prosperity theme, dramatic lighting, luxury setting, high quality, photorealistic, 4k',
    description: 'Money and coins for Financial Haus (financial planning)'
  },
  {
    client: 'GetEducated',
    filename: 'geteducated-updated-hero.jpg',
    prompt: 'Professional photograph of a modern online classroom setting, laptop displaying virtual learning interface, books and digital tablet on desk, minimalist workspace, bright natural lighting, educational atmosphere, clean and professional, high quality, photorealistic, 4k',
    description: 'Online classroom/educational setting for GetEducated (education technology)'
  }
];

const results = {
  success: [],
  failed: [],
  urlMapping: []
};

// Process each image
for (let i = 0; i < heroImages.length; i++) {
  const image = heroImages[i];
  const progress = `[${i + 1}/${heroImages.length}]`;

  console.log(`\n${progress} Generating: ${image.client}`);
  console.log(`   Description: ${image.description}`);
  console.log(`   Prompt: ${image.prompt.substring(0, 100)}...`);

  try {
    // Step 1: Generate image with OpenAI gpt-image-1
    console.log(`   🎨 Calling OpenAI gpt-image-1...`);
    const fileBuffer = await openaiGenerate({
      prompt: image.prompt,
      size: '1536x1024', // Wide hero format (max supported by gpt-image-1)
      quality: 'high' // gpt-image-1 uses 'low', 'medium', 'high', or 'auto'
    });

    const fileSizeKB = (fileBuffer.length / 1024).toFixed(2);
    console.log(`   ✅ Image generated: ${fileSizeKB} KB`);

    // Step 2: Upload to Supabase Storage
    const storagePath = `work/heros/${image.filename}`;
    console.log(`   ⬆️  Uploading to site-images/${storagePath}...`);

    const { data, error } = await supabase.storage
      .from('site-images')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/png', // openaiGenerate returns PNG
        upsert: true,
        cacheControl: '31536000' // 1 year cache
      });

    if (error) {
      throw error;
    }

    // Step 3: Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('site-images')
      .getPublicUrl(storagePath);

    console.log(`   ✅ Uploaded: ${publicUrl}`);

    // Store mapping
    results.urlMapping.push({
      client: image.client,
      filename: image.filename,
      url: publicUrl,
      description: image.description,
      prompt: image.prompt
    });

    results.success.push({
      client: image.client,
      filename: image.filename,
      url: publicUrl
    });

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    results.failed.push({
      client: image.client,
      error: error.message,
      description: image.description
    });
  }
}

// Save generation report
const reportPath = path.join(__dirname, '../temp/client-hero-images-report.json');
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

// Summary
console.log('\n\n📊 GENERATION SUMMARY');
console.log('====================');
console.log(`✅ Successful: ${results.success.length} / ${heroImages.length}`);
console.log(`❌ Failed: ${results.failed.length}`);
console.log(`\n📝 Generation report saved: temp/client-hero-images-report.json`);

if (results.success.length > 0) {
  console.log('\n✅ Generated Images:');
  results.success.forEach(r => {
    console.log(`   - ${r.client}: ${r.url}`);
  });
}

if (results.failed.length > 0) {
  console.log('\n⚠️  FAILED IMAGES:');
  results.failed.forEach(f => {
    console.log(`   - ${f.client}: ${f.error}`);
  });
}

console.log('\n✅ Hero image generation complete!');
console.log('\nNext steps:');
console.log('1. Review generated images in Supabase Storage');
console.log('2. Update caseStudies.js with new URLs');
console.log('3. Test Work page: npm run dev');
