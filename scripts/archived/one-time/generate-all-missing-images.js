#!/usr/bin/env node
/**
 * Generate All Missing Blog Images
 * Automatically generates featured images for any blog posts that need them
 *
 * Features:
 * - Scans database for posts without images
 * - Generates professional 1536x1024 images using OpenAI gpt-image-1
 * - Updates database with image paths
 * - Works for both old and new posts
 *
 * Usage: node scripts/generate-all-missing-images.js
 */

import { createClient } from '@supabase/supabase-js';
import { openaiGenerate } from '../src/lib/openai-image.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Output directory for generated images
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'blog-images', 'generated');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📁 Created output directory: ${OUTPUT_DIR}\n`);
}

/**
 * Check if image file exists on disk
 */
function imageFileExists(imagePath) {
  if (!imagePath) return false;
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  const fullPath = path.join(PUBLIC_DIR, cleanPath);
  return fs.existsSync(fullPath);
}

/**
 * Generate AI prompt for blog header image
 */
function generateImagePrompt(post) {
  const category = post.category || 'Marketing';
  const keywords = [
    post.primary_keyword,
    ...(post.secondary_keywords || [])
  ].filter(Boolean).slice(0, 4).join(', ');

  // Create a professional prompt based on the blog title and keywords
  return `Professional blog header image for "${post.title}". Modern corporate style with vibrant gradients (blue, purple, gold accents). Include abstract tech elements, AI circuits, data visualizations, and ${category.toLowerCase()} iconography. Keywords to visualize: ${keywords}. High-quality 3D rendering with depth and polish. Photorealistic. Corporate professional aesthetic. Wide format 16:9.`;
}

/**
 * Generate image for a single blog post
 */
async function generateImageForPost(post, index, total) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📸 GENERATING IMAGE ${index + 1}/${total}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Title: ${post.title}`);
  console.log(`Slug: ${post.slug}`);
  console.log(`Category: ${post.category || 'Uncategorized'}`);

  try {
    // Generate AI prompt
    const prompt = generateImagePrompt(post);
    console.log(`\n🎨 Prompt: ${prompt.substring(0, 150)}...`);

    // Generate image using OpenAI gpt-image-1
    console.log('\n🔄 Calling OpenAI gpt-image-1...');
    const buffer = await openaiGenerate({
      prompt: prompt,
      size: '1536x1024', // Wide format perfect for blog headers
      quality: 'high'
    });

    // Save image to disk
    const filename = `${post.slug}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, buffer);
    console.log(`✅ Image saved: ${filepath}`);

    // Update database with image path
    const imagePath = `/blog-images/generated/${filename}`;
    const { error: updateError } = await supabase
      .from('posts')
      .update({ featured_image: imagePath })
      .eq('id', post.id);

    if (updateError) {
      console.error(`❌ Failed to update database:`, updateError);
      return false;
    }

    console.log(`✅ Database updated with path: ${imagePath}`);
    console.log(`\n✅ SUCCESS - Image generated and linked!\n`);

    // Rate limiting - wait 2 seconds between images
    if (index < total - 1) {
      console.log('⏳ Waiting 2 seconds before next image...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return true;
  } catch (error) {
    console.error(`\n❌ ERROR generating image:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function generateAllMissingImages() {
  console.log('\n' + '='.repeat(80));
  console.log('🎨 GENERATE ALL MISSING BLOG IMAGES');
  console.log('='.repeat(80) + '\n');

  // Fetch all published posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, featured_image, category, primary_keyword, secondary_keywords, is_published')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching posts:', error);
    process.exit(1);
  }

  console.log(`Found ${posts.length} published posts\n`);

  // Filter posts that need images
  const postsNeedingImages = posts.filter(post => {
    const hasPath = post.featured_image && post.featured_image.trim() !== '';
    const fileExists = hasPath && imageFileExists(post.featured_image);
    return !hasPath || !fileExists;
  });

  if (postsNeedingImages.length === 0) {
    console.log('✅ All posts already have featured images!\n');
    console.log('No images need to be generated.\n');
    console.log('='.repeat(80) + '\n');
    return;
  }

  console.log(`📋 Posts needing images: ${postsNeedingImages.length}\n`);

  // Show list of posts
  postsNeedingImages.forEach((post, index) => {
    console.log(`${index + 1}. ${post.title}`);
    console.log(`   Slug: ${post.slug}`);
    console.log(`   Current Image: ${post.featured_image || 'NONE'}`);
    console.log('');
  });

  console.log('\n🚀 Starting image generation...\n');

  // Generate images
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < postsNeedingImages.length; i++) {
    const success = await generateImageForPost(
      postsNeedingImages[i],
      i,
      postsNeedingImages.length
    );

    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Successfully generated: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📝 Total processed: ${postsNeedingImages.length}`);
  console.log('\n' + '='.repeat(80) + '\n');
}

// Run script
generateAllMissingImages().catch(error => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
