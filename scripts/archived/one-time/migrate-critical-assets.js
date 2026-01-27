/**
 * CRITICAL ASSETS MIGRATION SCRIPT
 *
 * Migrates essential Cloudinary assets to Supabase Storage:
 * - Home page videos and logo (5 assets)
 * - Case study logos (9 assets)
 * - Onboarding logos (2 instances, 1 unique asset)
 *
 * Total: 15 unique assets
 */

import { createClient } from '@supabase/supabase-js';
import https from 'https';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const TEMP_DIR = path.join(__dirname, '../temp/critical-assets-migration');

// Initialize Supabase Admin Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Critical assets to migrate
const CRITICAL_ASSETS = [
  // Home Page Assets
  {
    cloudinaryUrl: 'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1760046691/dmsite/home/handshake-landscape.mp4',
    supabasePath: 'dmsite/home/handshake-landscape.mp4',
    bucket: 'site-videos',
    category: 'home-page'
  },
  {
    cloudinaryUrl: 'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1758645813/Website_Demo_Reel_edited_udorcp.mp4',
    supabasePath: 'dmsite/home/website-demo-reel.mp4',
    bucket: 'site-videos',
    category: 'home-page'
  },
  {
    cloudinaryUrl: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755696782/disruptors-media/brand/logos/gold-logo-banner.png',
    supabasePath: 'disruptors-media/brand/logos/gold-logo-banner.png',
    bucket: 'site-images',
    category: 'home-page'
  },
  {
    cloudinaryUrl: 'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759269831/social_u4455988764_a_michealangelo_painting_of_the_roman_army_in_a_w_c2966bc6-6ae4-4a6c-a3a0-10417b7e23ee_0_vnc9jx.mp4',
    supabasePath: 'dmsite/home/roman-army-painting.mp4',
    bucket: 'site-videos',
    category: 'home-page'
  },
  {
    cloudinaryUrl: 'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1758170550/gallery-bg_e0bwdz.mp4',
    supabasePath: 'dmsite/home/gallery-bg.mp4',
    bucket: 'site-videos',
    category: 'home-page'
  },

  // Case Study Logos
  {
    cloudinaryUrl: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167812/case-studies/case-studies/tradeworxusa_logo.svg',
    supabasePath: 'case-studies/logos/tradeworxusa-logo.svg',
    bucket: 'site-images',
    category: 'case-study-logos'
  },
  {
    cloudinaryUrl: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167811/case-studies/case-studies/timberviewfinancial_logo.webp',
    supabasePath: 'case-studies/logos/timberviewfinancial-logo.webp',
    bucket: 'site-images',
    category: 'case-study-logos'
  },
  {
    cloudinaryUrl: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167810/case-studies/case-studies/thewellnessway_logo.webp',
    supabasePath: 'case-studies/logos/thewellnessway-logo.webp',
    bucket: 'site-images',
    category: 'case-study-logos'
  },
  {
    cloudinaryUrl: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167809/case-studies/case-studies/soundcorrections_logo.svg',
    supabasePath: 'case-studies/logos/soundcorrections-logo.svg',
    bucket: 'site-images',
    category: 'case-study-logos'
  },
  {
    cloudinaryUrl: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167808/case-studies/case-studies/segpro_logo.png',
    supabasePath: 'case-studies/logos/segpro-logo.png',
    bucket: 'site-images',
    category: 'case-study-logos'
  },
  {
    cloudinaryUrl: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167807/case-studies/case-studies/neuromastery_logo.webp',
    supabasePath: 'case-studies/logos/neuromastery-logo.webp',
    bucket: 'site-images',
    category: 'case-study-logos'
  },
  {
    cloudinaryUrl: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759862158/case-studies/case-studies/muscleworks_logo.png',
    supabasePath: 'case-studies/logos/muscleworks-logo.png',
    bucket: 'site-images',
    category: 'case-study-logos'
  },
  {
    cloudinaryUrl: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167806/case-studies/case-studies/granitepaving_logo.png',
    supabasePath: 'case-studies/logos/granitepaving-logo.png',
    bucket: 'site-images',
    category: 'case-study-logos'
  },
  {
    cloudinaryUrl: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758167805/case-studies/case-studies/autotrimutah_logo.png',
    supabasePath: 'case-studies/logos/autotrimutah-logo.png',
    bucket: 'site-images',
    category: 'case-study-logos'
  },

  // Onboarding Logo
  {
    cloudinaryUrl: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1755697002/disruptors-media/brand/logos/gold-logo.png',
    supabasePath: 'disruptors-media/brand/logos/gold-logo.png',
    bucket: 'site-images',
    category: 'onboarding'
  }
];

/**
 * Download file from URL
 */
async function downloadFile(url, localPath) {
  await fs.mkdir(path.dirname(localPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const file = fs.open(localPath, 'w');

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', async () => {
          const buffer = Buffer.concat(chunks);
          await fs.writeFile(localPath, buffer);
          resolve({ success: true, size: buffer.length });
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
      }
    }).on('error', reject);
  });
}

/**
 * Upload file to Supabase Storage
 */
async function uploadToSupabase(localPath, bucketName, storagePath) {
  try {
    const fileBuffer = await fs.readFile(localPath);
    const contentType = getContentType(localPath);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath);

    return {
      success: true,
      publicUrl,
      size: fileBuffer.length
    };
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

/**
 * Get MIME type from file extension
 */
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm'
  };
  return types[ext] || 'application/octet-stream';
}

/**
 * Main migration function
 */
async function migrateCriticalAssets() {
  console.log('🚀 CRITICAL ASSETS MIGRATION\n');
  console.log(`Assets to migrate: ${CRITICAL_ASSETS.length}`);
  console.log('=' .repeat(60) + '\n');

  const results = [];
  const urlMapping = {};

  // Create temp directory
  await fs.mkdir(TEMP_DIR, { recursive: true });

  for (let i = 0; i < CRITICAL_ASSETS.length; i++) {
    const asset = CRITICAL_ASSETS[i];
    const localPath = path.join(TEMP_DIR, asset.supabasePath);

    console.log(`[${i + 1}/${CRITICAL_ASSETS.length}] ${asset.category}: ${path.basename(asset.supabasePath)}`);

    try {
      // Download from Cloudinary
      console.log('  📥 Downloading...');
      const downloadResult = await downloadFile(asset.cloudinaryUrl, localPath);
      console.log(`  ✅ Downloaded (${(downloadResult.size / 1024).toFixed(2)} KB)`);

      // Upload to Supabase
      console.log('  📤 Uploading to Supabase...');
      const uploadResult = await uploadToSupabase(localPath, asset.bucket, asset.supabasePath);
      console.log(`  ✅ Uploaded: ${uploadResult.publicUrl}\n`);

      // Store result
      results.push({
        cloudinaryUrl: asset.cloudinaryUrl,
        supabaseUrl: uploadResult.publicUrl,
        category: asset.category,
        bucket: asset.bucket,
        size: uploadResult.size,
        success: true
      });

      // Add to URL mapping
      urlMapping[asset.cloudinaryUrl] = uploadResult.publicUrl;

    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}\n`);
      results.push({
        cloudinaryUrl: asset.cloudinaryUrl,
        error: error.message,
        category: asset.category,
        success: false
      });
    }

    // Small delay to avoid overwhelming services
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Save results
  const reportPath = path.join(__dirname, '../temp/critical-assets-migration-report.json');
  await fs.writeFile(reportPath, JSON.stringify({
    migrationDate: new Date().toISOString(),
    totalAssets: CRITICAL_ASSETS.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    urlMapping,
    results
  }, null, 2));

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Assets: ${CRITICAL_ASSETS.length}`);
  console.log(`✅ Successful: ${results.filter(r => r.success).length}`);
  console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);

  const totalSize = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.size, 0);
  console.log(`📦 Total Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  console.log(`\n💾 Report saved: ${reportPath}`);

  // Print next steps
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Review the migration report');
  console.log('2. Run: node scripts/update-critical-urls.js');
  console.log('3. Test locally: npm run dev');
  console.log('4. Deploy to dev: npm run deploy:dev\n');

  if (results.some(r => !r.success)) {
    console.log('⚠️  Some assets failed to migrate. Review errors above.\n');
    process.exit(1);
  } else {
    console.log('🎉 ALL CRITICAL ASSETS MIGRATED SUCCESSFULLY!\n');
  }
}

// Run migration
migrateCriticalAssets().catch(error => {
  console.error('\n❌ MIGRATION FAILED:', error.message);
  process.exit(1);
});
