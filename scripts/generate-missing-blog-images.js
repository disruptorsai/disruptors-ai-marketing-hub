#!/usr/bin/env node
/**
 * Generate Missing Blog Images
 * Creates images for blogs 11-12 that were generated but lack images
 */

import { openaiGenerate } from '../src/lib/openai-image.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Missing blog image specifications
const MISSING_IMAGES = [
  {
    id: 11,
    title: "How to Use AI for Local SEO: Rank Your Service Business in Google Maps Without an Agency",
    slug: "ai-local-seo-service-business",
    prompt: "Professional local SEO visualization showing Google Maps pin with glowing AI circuits, local service business storefront, and smartphone displaying top search rankings. Modern tech aesthetic with blue and green gradients. Includes location markers, 5-star reviews, and search result snippets. High-quality 3D rendering. Corporate professional style.",
    keywords: ["local SEO", "Google Maps", "rankings", "location"]
  },
  {
    id: 12,
    title: "AI-Powered Social Media Management: How to Create 90 Days of Content in 2 Hours",
    slug: "ai-social-media-content-calendar",
    prompt: "Dynamic social media content calendar visualization showing 90-day grid with AI-generated posts flowing across multiple platforms (Instagram, LinkedIn, Twitter, Facebook). Vibrant icons, colorful post previews, and automated scheduling interface. Modern gradient backgrounds (purple to blue). Futuristic productivity aesthetic. Photorealistic with depth.",
    keywords: ["social media", "content calendar", "automation", "productivity"]
  }
];

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'blog-images', 'generated');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate a single blog post image
 */
async function generateBlogImage(post, index, total) {
  console.log(`\n📸 Generating Image ${index + 1}/${total}`);
  console.log(`   Title: ${post.title}`);
  console.log(`   Slug: ${post.slug}`);
  console.log('-'.repeat(70));

  try {
    console.log('   🎨 Prompt:', post.prompt.substring(0, 100) + '...');
    console.log('   🔄 Calling OpenAI gpt-image-1...');

    const buffer = await openaiGenerate({
      prompt: post.prompt,
      size: '1536x1024', // Wide format perfect for blog headers
      quality: 'high'
    });

    const filename = `${post.slug}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    fs.writeFileSync(filepath, buffer);

    console.log('   ✅ Generated successfully!');
    console.log('   💾 Saved to:', filepath);
    console.log('   📊 Size:', (buffer.length / 1024).toFixed(2), 'KB');

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      filename,
      filepath,
      prompt: post.prompt,
      keywords: post.keywords,
      size: buffer.length,
      generatedAt: new Date().toISOString(),
      model: 'gpt-image-1',
      dimensions: '1536x1024',
      quality: 'high',
      success: true
    };
  } catch (error) {
    console.error('   ❌ Generation failed:', error.message);
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      error: error.message,
      success: false
    };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Generating Missing Blog Images');
  console.log('=' .repeat(70));
  console.log(`📝 Generating ${MISSING_IMAGES.length} images`);
  console.log(`🎨 Provider: OpenAI gpt-image-1`);
  console.log(`📐 Dimensions: 1536x1024 (blog header format)`);
  console.log(`✨ Quality: High`);
  console.log('=' .repeat(70));

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < MISSING_IMAGES.length; i++) {
    const result = await generateBlogImage(MISSING_IMAGES[i], i, MISSING_IMAGES.length);
    results.push(result);

    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }

    // Rate limit protection: wait 2 seconds between requests
    if (i < MISSING_IMAGES.length - 1) {
      console.log('   ⏳ Waiting 2 seconds before next generation...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Generation Complete!');
  console.log('=' .repeat(70));
  console.log(`✅ Success: ${successCount}/${MISSING_IMAGES.length}`);
  console.log(`❌ Failed: ${failCount}/${MISSING_IMAGES.length}`);
  console.log(`💾 Images saved to: ${OUTPUT_DIR}`);

  if (successCount > 0) {
    console.log('\n🎉 Successfully generated images:');
    results.filter(r => r.success).forEach(r => {
      console.log(`   ✓ ${r.filename}`);
    });
  }

  if (failCount > 0) {
    console.log('\n⚠️  Failed generations:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   ✗ ${r.slug}: ${r.error}`);
    });
  }

  console.log('\n✨ Missing blog images are now generated!');
  console.log(`📂 Location: public/blog-images/generated/`);

  process.exit(failCount > 0 ? 1 : 0);
}

// Execute
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
