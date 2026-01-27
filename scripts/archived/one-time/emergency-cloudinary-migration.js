/**
 * EMERGENCY CLOUDINARY TO SUPABASE MIGRATION
 *
 * This script migrates all Cloudinary assets to Supabase Storage
 * to resolve credit limit issues and restore site functionality.
 *
 * Features:
 * - Downloads all images/videos from Cloudinary
 * - Uploads to Supabase Storage buckets
 * - Generates URL mapping for codebase updates
 * - Progress tracking and error recovery
 *
 * Usage:
 * node scripts/emergency-cloudinary-migration.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dvcvxhzmt';

// Initialize Supabase Admin Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Storage buckets
const BUCKETS = {
  images: 'site-images',
  videos: 'site-videos',
  logos: 'site-logos'
};

// Cloudinary URLs extracted from codebase
const CLOUDINARY_URLS = [
  // Images
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/brand/logos/logo.svg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755697002/disruptors-media/brand/logos/gold-logo.png',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755696782/disruptors-media/brand/logos/gold-logo-banner.png',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758752837/logo_a4toul.png',

  // Hero/Background Images
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/ui/backgrounds/main-bg.jpg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755696782/disruptors-media/about/about-hero-background.jpg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755696782/disruptors-media/work/work-hero-background.jpg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755697023/disruptors-media/ui/backgrounds/loader-lft.jpg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/v1/disruptors-media/hero-poster.jpg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/v1/disruptors-media/3d-fallback.jpg',

  // Service Graphics
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/services/graphics/services-img.png',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/services/graphics/hand-human.png',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755697014/disruptors-media/services/graphics/hand-srv.png',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/services/graphics/phone.png',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/services/graphics/after-phone-sec.png',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/services/graphics/what-we-do-bx.png',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/services/graphics/what-we-do-bx-1.png',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/services/graphics/what-we-do-bx-2.png',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/services/graphics/what-we-do-bx-3.png',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/q_auto:good/v1/dmsite/services/fractional-cmo.jpg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto:good/v1/dmsite/services/fractional-cmo?_a=BAMAK+eC0',

  // Studio Images
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1757712352/disruptors-media/content/studio/gl3a0022.jpg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1757712357/disruptors-media/content/studio/gl3a0026.jpg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1757712362/disruptors-media/content/studio/gl3a0030.jpg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1757712366/disruptors-media/content/studio/gl3a0042.jpg',

  // Case Study Logos
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167805/case-studies/case-studies/autotrimutah_logo.png',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167806/case-studies/case-studies/granitepaving_logo.png',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167807/case-studies/case-studies/neuromastery_logo.webp',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167808/case-studies/case-studies/segpro_logo.png',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167809/case-studies/case-studies/soundcorrections_logo.svg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167810/case-studies/case-studies/thewellnessway_logo.webp',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167811/case-studies/case-studies/timberviewfinancial_logo.webp',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167812/case-studies/case-studies/tradeworxusa_logo.svg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759862158/case-studies/case-studies/muscleworks_logo.png',

  // Podcast Images
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/content/podcast/podcast-new-lg.jpg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/content/podcast/podcast-new-lg-1.jpg',

  // Misc Images
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1737507200/saas-content-engine-dashboard.webp',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759258609/send-proposal_eptrcp.jpg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759258609/website-design-optimization_a0vafx.jpg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759258610/discovery-call_sier9m.jpg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759258611/scope-of-work_hoqqrj.jpg',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759258612/footer_amtdwc.png',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759862401/Our_approach_is_simple_yet_impactful._We_combine_strategic_thinking_with_creative_flair_to_enhance_your_digital_presence_and_drive_real_results._Whether_expanding_your_audience_or_boosting_your_on_bal2jf.png',

  // Service Videos (8 critical videos)
  'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1/dmsite/services/ai-automation.mp4',
  'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1/dmsite/services/crm-management.mp4',
  'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1/dmsite/services/custom-apps.mp4',
  'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1/dmsite/services/lead-generation.mp4',
  'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1/dmsite/services/paid-advertising.mp4',
  'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1760046521/dmsite/services/podcasting.mp4',
  'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1/dmsite/services/seo-geo.mp4',
  'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1/dmsite/services/social-media-marketing.mp4',

  // Other Videos
  'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1758645813/Website_Demo_Reel_edited_udorcp.mp4',
  'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1760046691/dmsite/home/handshake-landscape.mp4',
  'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1758170556/dm-abt_ypkipj.mp4',
  'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1758170550/gallery-bg_e0bwdz.mp4',
];

/**
 * Download file from URL
 */
async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        return downloadFile(response.headers.location).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Extract filename from Cloudinary URL
 */
function extractFilename(url) {
  // Remove transformations and extract the actual filename
  const parts = url.split('/');
  let filename = parts[parts.length - 1];

  // Remove query parameters
  filename = filename.split('?')[0];

  // If filename is just a Cloudinary ID, create a meaningful name
  if (!filename.includes('.')) {
    const pathParts = url.split('/upload/');
    if (pathParts[1]) {
      const assetPath = pathParts[1].split('/').filter(p => !p.startsWith('v') && !p.includes(','));
      filename = assetPath.join('_') + '.jpg';
    }
  }

  return filename;
}

/**
 * Determine which bucket to use
 */
function getBucketName(url, filename) {
  if (url.includes('/video/') || filename.endsWith('.mp4') || filename.endsWith('.webm')) {
    return BUCKETS.videos;
  }
  if (url.includes('/logos/') || filename.includes('logo')) {
    return BUCKETS.logos;
  }
  return BUCKETS.images;
}

/**
 * Create storage buckets if they don't exist
 */
async function createBuckets() {
  console.log('📦 Creating/verifying Supabase Storage buckets...\n');

  for (const [key, bucketName] of Object.entries(BUCKETS)) {
    try {
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const exists = buckets?.some(b => b.name === bucketName);

      if (!exists) {
        const { data, error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: key === 'videos'
            ? ['video/mp4', 'video/webm', 'video/quicktime']
            : ['image/*']
        });

        if (error) throw error;
        console.log(`✅ Created bucket: ${bucketName}`);
      } else {
        console.log(`✓ Bucket exists: ${bucketName}`);
      }
    } catch (error) {
      console.error(`❌ Error with bucket ${bucketName}:`, error.message);
    }
  }

  console.log('');
}

/**
 * Migrate a single asset
 */
async function migrateAsset(url, index, total) {
  const filename = extractFilename(url);
  const bucketName = getBucketName(url, filename);

  console.log(`[${index + 1}/${total}] Migrating: ${filename}`);
  console.log(`  Source: ${url}`);

  try {
    // Download from Cloudinary
    console.log(`  ⬇️  Downloading...`);
    const fileBuffer = await downloadFile(url);
    console.log(`  ✓ Downloaded (${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

    // Upload to Supabase
    console.log(`  ⬆️  Uploading to ${bucketName}...`);
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filename, fileBuffer, {
        contentType: url.includes('/video/') ? 'video/mp4' : 'image/jpeg',
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filename);

    console.log(`  ✅ Uploaded to: ${publicUrl}\n`);

    return {
      cloudinaryUrl: url,
      supabaseUrl: publicUrl,
      filename,
      bucket: bucketName,
      size: fileBuffer.length,
      success: true
    };

  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}\n`);
    return {
      cloudinaryUrl: url,
      filename,
      error: error.message,
      success: false
    };
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚨 EMERGENCY CLOUDINARY TO SUPABASE MIGRATION\n');
  console.log(`Found ${CLOUDINARY_URLS.length} assets to migrate\n`);

  // Create buckets
  await createBuckets();

  // Migrate assets
  console.log('🔄 Starting migration...\n');
  const results = [];

  for (let i = 0; i < CLOUDINARY_URLS.length; i++) {
    const result = await migrateAsset(CLOUDINARY_URLS[i], i, CLOUDINARY_URLS.length);
    results.push(result);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Save mapping
  const mapping = results.filter(r => r.success).reduce((acc, r) => {
    acc[r.cloudinaryUrl] = r.supabaseUrl;
    return acc;
  }, {});

  const mappingPath = path.join(__dirname, '../temp/cloudinary-to-supabase-mapping.json');
  await fs.mkdir(path.dirname(mappingPath), { recursive: true });
  await fs.writeFile(mappingPath, JSON.stringify({
    migrationDate: new Date().toISOString(),
    totalAssets: CLOUDINARY_URLS.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    mapping,
    results
  }, null, 2));

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Assets: ${CLOUDINARY_URLS.length}`);
  console.log(`✅ Successful: ${results.filter(r => r.success).length}`);
  console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);
  console.log(`\n💾 Mapping saved to: ${mappingPath}`);
  console.log('\n📋 Next Steps:');
  console.log('1. Review the mapping file');
  console.log('2. Run: node scripts/update-cloudinary-urls.js');
  console.log('3. Test on dev site');
  console.log('4. Deploy to production\n');

  if (results.some(r => !r.success)) {
    console.log('⚠️  Some assets failed to migrate. Review the errors above.\n');
  }
}

// Run migration
migrate().catch(console.error);
