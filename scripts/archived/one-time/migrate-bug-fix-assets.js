/**
 * MIGRATE BUG FIX ASSETS
 *
 * Migrates the two assets needed to fix identified bugs:
 * 1. DualCTABlock background image (white bar bug)
 * 2. Blog hero video
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Assets to migrate
const ASSETS = [
  {
    name: 'DualCTABlock Background',
    cloudinaryUrl: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759258608/u4455988764_A_vast_Renaissance_fresco_depicting_the_Great_Pyr_830a33dd-1da9-470b-99fa-8e12d1867455_3_l5wfrc.png',
    bucket: 'site-images',
    path: 'ui/backgrounds/renaissance-fresco-pyramids.png',
    category: 'ui-backgrounds'
  },
  {
    name: 'Blog Hero Video',
    cloudinaryUrl: 'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759270235/social_u4455988764_a_michealangelo_painting_of_a_decorated_and_rugge_cdd91916-0689-4b4c-8aa1-419f07eed4f4_0_eo3dgk.mp4',
    bucket: 'site-videos',
    path: 'blog/hero-michelangelo-painting.mp4',
    category: 'blog'
  }
];

/**
 * Download asset from Cloudinary
 */
async function downloadAsset(url, tempPath) {
  console.log(`   📥 Downloading from Cloudinary...`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  await fs.writeFile(tempPath, Buffer.from(buffer));

  const stats = await fs.stat(tempPath);
  return stats.size;
}

/**
 * Upload asset to Supabase Storage
 */
async function uploadToSupabase(localPath, bucket, remotePath, contentType) {
  console.log(`   📤 Uploading to Supabase Storage...`);

  const fileBuffer = await fs.readFile(localPath);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(remotePath, fileBuffer, {
      contentType,
      upsert: true
    });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get Supabase public URL
 */
function getSupabasePublicUrl(bucket, path) {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Main migration function
 */
async function migrateAssets() {
  console.log('🚀 MIGRATING BUG FIX ASSETS\n');
  console.log(`Assets to migrate: ${ASSETS.length}\n`);

  const results = [];
  const tempDir = path.join(__dirname, '../temp/asset-downloads');

  // Ensure temp directory exists
  await fs.mkdir(tempDir, { recursive: true });

  for (const asset of ASSETS) {
    console.log(`\n📦 ${asset.name}`);
    console.log(`   Category: ${asset.category}`);
    console.log(`   Bucket: ${asset.bucket}`);
    console.log(`   Path: ${asset.path}`);

    try {
      // Determine file extension and content type
      const ext = path.extname(asset.cloudinaryUrl).split('?')[0];
      const isVideo = ext === '.mp4';
      const contentType = isVideo ? 'video/mp4' : 'image/png';

      const tempFileName = `${Date.now()}-${path.basename(asset.path)}`;
      const tempPath = path.join(tempDir, tempFileName);

      // Download from Cloudinary
      const size = await downloadAsset(asset.cloudinaryUrl, tempPath);
      console.log(`   ✅ Downloaded (${(size / 1024 / 1024).toFixed(2)} MB)`);

      // Upload to Supabase
      await uploadToSupabase(tempPath, asset.bucket, asset.path, contentType);
      const supabaseUrl = getSupabasePublicUrl(asset.bucket, asset.path);
      console.log(`   ✅ Uploaded to Supabase`);

      // Clean up temp file
      await fs.unlink(tempPath);

      results.push({
        name: asset.name,
        cloudinaryUrl: asset.cloudinaryUrl,
        supabaseUrl,
        category: asset.category,
        bucket: asset.bucket,
        path: asset.path,
        size,
        success: true
      });

      console.log(`   ✅ Migration complete`);
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      results.push({
        name: asset.name,
        cloudinaryUrl: asset.cloudinaryUrl,
        error: error.message,
        success: false
      });
    }
  }

  // Clean up temp directory
  try {
    await fs.rmdir(tempDir);
  } catch (err) {
    // Ignore if directory not empty
  }

  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`Total Assets: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log('');

  if (successful.length > 0) {
    console.log('✅ Successful Migrations:');
    successful.forEach(r => {
      console.log(`   - ${r.name}`);
      console.log(`     Old: ${r.cloudinaryUrl.substring(0, 80)}...`);
      console.log(`     New: ${r.supabaseUrl}`);
    });
    console.log('');
  }

  if (failed.length > 0) {
    console.log('❌ Failed Migrations:');
    failed.forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
    console.log('');
  }

  // Save report
  const reportPath = path.join(__dirname, '../temp/bug-fix-assets-migration-report.json');
  await fs.writeFile(reportPath, JSON.stringify({
    migrationDate: new Date().toISOString(),
    totalAssets: results.length,
    successful: successful.length,
    failed: failed.length,
    urlMapping: successful.reduce((map, r) => {
      map[r.cloudinaryUrl] = r.supabaseUrl;
      return map;
    }, {}),
    results
  }, null, 2));

  console.log(`📋 Report saved: ${reportPath}\n`);

  // Show URL mapping for easy reference
  if (successful.length > 0) {
    console.log('📋 URL MAPPINGS:');
    successful.forEach(r => {
      console.log(`\n${r.name}:`);
      console.log(`  Cloudinary: ${r.cloudinaryUrl}`);
      console.log(`  Supabase:   ${r.supabaseUrl}`);
    });
    console.log('');
  }

  return results;
}

// Run migration
migrateAssets()
  .then(results => {
    const allSuccess = results.every(r => r.success);
    if (allSuccess) {
      console.log('✅ All assets migrated successfully!\n');
      process.exit(0);
    } else {
      console.log('⚠️  Some assets failed to migrate. Check report for details.\n');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
