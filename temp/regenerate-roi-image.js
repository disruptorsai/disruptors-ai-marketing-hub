#!/usr/bin/env node
/**
 * Regenerate Image for AI Marketing ROI 2025 Blog Post
 * Uses OpenAI gpt-image-1 to create a professional marketing image
 */

import { openaiGenerate } from '../src/lib/openai-image.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_POST = {
  title: "AI Marketing Automation in 2025: Why 51% of Marketers Still Can't Measure ROI (And How to Fix It)",
  slug: "ai-marketing-roi-2025",
  prompt: "Modern business analytics command center with holographic ROI dashboards floating in 3D space. Split composition: left side shows confused marketer looking at scattered data (51% gap), right side shows organized AI-powered metrics with clear upward trending graphs. Professional corporate aesthetic with deep blue, electric cyan, and gold accents. Photorealistic 3D rendering with dramatic lighting. High-tech futuristic boardroom setting. Emphasize the contrast between chaos and clarity. Ultra-detailed with volumetric fog and lens flare effects.",
  keywords: ["ROI", "analytics", "metrics", "dashboard", "AI"]
};

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'blog-images', 'generated');

async function generateImage() {
  console.log('🚀 Regenerating AI Marketing ROI 2025 Blog Image');
  console.log('='.repeat(70));
  console.log(`📝 Title: ${BLOG_POST.title}`);
  console.log(`🎨 Slug: ${BLOG_POST.slug}`);
  console.log('='.repeat(70));

  try {
    console.log('\n📋 Enhanced Prompt:');
    console.log('   ' + BLOG_POST.prompt.substring(0, 150) + '...');
    console.log('\n🔄 Calling OpenAI gpt-image-1...');

    const buffer = await openaiGenerate({
      prompt: BLOG_POST.prompt,
      size: '1536x1024',
      quality: 'high',
      inputFidelity: 'high'
    });

    const filename = `${BLOG_POST.slug}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    fs.writeFileSync(filepath, buffer);

    console.log('\n✅ Generation successful!');
    console.log(`💾 Saved to: ${filepath}`);
    console.log(`📊 Size: ${(buffer.length / 1024).toFixed(2)} KB`);
    console.log(`📐 Dimensions: 1536x1024`);
    console.log(`🎨 Model: gpt-image-1 (OpenAI)`);
    console.log('\n🎉 New image is ready!');
    console.log(`🔗 Use in blog: /blog-images/generated/${filename}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Generation failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

generateImage();
