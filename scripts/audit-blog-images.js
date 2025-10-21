#!/usr/bin/env node
/**
 * Blog Images Audit Script
 * Comprehensive audit of all blog posts to identify missing featured images
 *
 * Checks:
 * 1. Database featured_image paths
 * 2. Actual file existence on disk
 * 3. Generates detailed report
 *
 * Usage: node scripts/audit-blog-images.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Public directory path (where images should be)
const PUBLIC_DIR = path.join(process.cwd(), 'public');

/**
 * Check if a file exists at the given path
 */
function fileExists(imagePath) {
  if (!imagePath) return false;

  // Remove leading slash for filesystem check
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  const fullPath = path.join(PUBLIC_DIR, cleanPath);

  return fs.existsSync(fullPath);
}

/**
 * Main audit function
 */
async function auditBlogImages() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 BLOG IMAGES AUDIT REPORT');
  console.log('='.repeat(80) + '\n');

  // Fetch all published posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, featured_image, is_published, created_at, category')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching posts:', error);
    process.exit(1);
  }

  console.log(`Total Published Posts: ${posts.length}\n`);

  // Categorize posts
  const postsWithImages = [];
  const postsWithMissingPaths = [];
  const postsWithMissingFiles = [];

  posts.forEach(post => {
    if (!post.featured_image || post.featured_image.trim() === '') {
      postsWithMissingPaths.push(post);
    } else if (!fileExists(post.featured_image)) {
      postsWithMissingFiles.push(post);
    } else {
      postsWithImages.push(post);
    }
  });

  // Display summary
  console.log('📈 SUMMARY');
  console.log('-'.repeat(80));
  console.log(`✅ Posts with valid images:     ${postsWithImages.length}`);
  console.log(`⚠️  Posts with missing paths:    ${postsWithMissingPaths.length}`);
  console.log(`❌ Posts with broken image links: ${postsWithMissingFiles.length}`);
  console.log('');

  // Display details for posts with missing paths
  if (postsWithMissingPaths.length > 0) {
    console.log('\n⚠️  POSTS WITH NO FEATURED_IMAGE PATH');
    console.log('-'.repeat(80));
    postsWithMissingPaths.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Category: ${post.category || 'Uncategorized'}`);
      console.log(`   Database Value: ${post.featured_image || 'NULL'}`);
      console.log('');
    });
  }

  // Display details for posts with missing files
  if (postsWithMissingFiles.length > 0) {
    console.log('\n❌ POSTS WITH MISSING IMAGE FILES');
    console.log('-'.repeat(80));
    postsWithMissingFiles.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Category: ${post.category || 'Uncategorized'}`);
      console.log(`   Expected Path: ${post.featured_image}`);
      const cleanPath = post.featured_image.startsWith('/') ? post.featured_image.slice(1) : post.featured_image;
      console.log(`   Filesystem Path: ${path.join(PUBLIC_DIR, cleanPath)}`);
      console.log('');
    });
  }

  // Display posts with valid images
  if (postsWithImages.length > 0) {
    console.log('\n✅ POSTS WITH VALID IMAGES');
    console.log('-'.repeat(80));
    postsWithImages.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   Image: ${post.featured_image}`);
      console.log('');
    });
  }

  // Action items
  console.log('\n🔧 ACTION ITEMS');
  console.log('='.repeat(80));

  const totalMissing = postsWithMissingPaths.length + postsWithMissingFiles.length;

  if (totalMissing > 0) {
    console.log(`\n${totalMissing} posts need featured images.\n`);
    console.log('Next steps:');
    console.log('1. Generate missing images:');
    console.log('   node scripts/generate-all-missing-images.js');
    console.log('');
    console.log('2. Update database paths (if needed):');
    console.log('   node scripts/update-blog-image-paths.js');
    console.log('');
  } else {
    console.log('\n✅ All published posts have valid featured images!');
    console.log('   No action needed.\n');
  }

  // Generate JSON report
  const report = {
    audit_date: new Date().toISOString(),
    total_posts: posts.length,
    posts_with_images: postsWithImages.length,
    posts_missing_paths: postsWithMissingPaths.length,
    posts_missing_files: postsWithMissingFiles.length,
    missing_posts: [
      ...postsWithMissingPaths.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        issue: 'no_path',
        featured_image: p.featured_image
      })),
      ...postsWithMissingFiles.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        issue: 'file_not_found',
        featured_image: p.featured_image
      }))
    ]
  };

  const reportPath = path.join(process.cwd(), 'temp', 'blog-images-audit-report.json');

  // Ensure temp directory exists
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Detailed JSON report saved to: ${reportPath}\n`);

  console.log('='.repeat(80) + '\n');
}

// Run audit
auditBlogImages().catch(error => {
  console.error('❌ Audit failed:', error);
  process.exit(1);
});
