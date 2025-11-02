/**
 * UPLOAD CLOUDINARY BACKUP TO SUPABASE STORAGE
 *
 * This script uploads all downloaded Cloudinary assets to Supabase Storage
 * and generates a URL mapping file for codebase updates.
 *
 * Usage:
 * node scripts/upload-to-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const BACKUP_DIR = path.join(__dirname, '../cloudinary-backup');
const MANIFEST_PATH = path.join(BACKUP_DIR, 'backup-manifest.json');

// Initialize Supabase Admin Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Storage buckets
const BUCKETS = {
  images: 'site-images',
  videos: 'site-videos'
};

/**
 * Create storage buckets if they don't exist
 */
async function createBuckets() {
  console.log('📦 Creating/verifying Supabase Storage buckets...\n');

  for (const [key, bucketName] of Object.entries(BUCKETS)) {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const exists = buckets?.some(b => b.name === bucketName);

      if (!exists) {
        const { data, error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 104857600, // 100MB
          allowedMimeTypes: key === 'videos'
            ? ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
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
 * Get MIME type from file extension
 */
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Upload a single file to Supabase
 */
async function uploadFile(localPath, bucketName, index, total) {
  const relativePath = localPath.replace(path.join(BACKUP_DIR, bucketName === 'site-images' ? 'images' : 'videos') + '/', '');

  console.log(`[${index + 1}/${total}] Uploading: ${relativePath}`);

  try {
    // Read file
    const fileBuffer = await fs.readFile(localPath);
    const mimeType = getMimeType(localPath);

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(relativePath, fileBuffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(relativePath);

    console.log(`  ✅ Uploaded: ${publicUrl}\n`);

    return {
      localPath,
      relativePath,
      supabaseUrl: publicUrl,
      bucket: bucketName,
      size: fileBuffer.length,
      success: true
    };

  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}\n`);
    return {
      localPath,
      relativePath,
      error: error.message,
      success: false
    };
  }
}

/**
 * Recursively get all files in a directory
 */
async function getAllFiles(dir) {
  const files = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

/**
 * Load Cloudinary manifest
 */
async function loadManifest() {
  try {
    const content = await fs.readFile(MANIFEST_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('⚠️  Could not load manifest file, will proceed without URL mapping');
    return null;
  }
}

/**
 * Main upload function
 */
async function upload() {
  console.log('🚀 UPLOADING TO SUPABASE STORAGE\n');

  // Load manifest
  const manifest = await loadManifest();

  // Create buckets
  await createBuckets();

  const results = [];
  const urlMapping = {};

  // Upload images
  console.log('='.repeat(60));
  console.log('📸 UPLOADING IMAGES');
  console.log('='.repeat(60) + '\n');

  const imagesDir = path.join(BACKUP_DIR, 'images');
  const imageFiles = await getAllFiles(imagesDir);
  console.log(`Found ${imageFiles.length} images to upload\n`);

  for (let i = 0; i < imageFiles.length; i++) {
    const result = await uploadFile(imageFiles[i], BUCKETS.images, i, imageFiles.length);
    results.push(result);

    // Create URL mapping
    if (result.success && manifest) {
      const imageManifest = manifest.images.find(img =>
        result.localPath.includes(img.public_id.replace(/\//g, path.sep))
      );
      if (imageManifest) {
        urlMapping[imageManifest.secure_url] = result.supabaseUrl;
      }
    }

    // Small delay to avoid overwhelming Supabase
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Upload videos
  console.log('\n' + '='.repeat(60));
  console.log('🎥 UPLOADING VIDEOS');
  console.log('='.repeat(60) + '\n');

  const videosDir = path.join(BACKUP_DIR, 'videos');
  const videoFiles = await getAllFiles(videosDir);
  console.log(`Found ${videoFiles.length} videos to upload\n`);

  for (let i = 0; i < videoFiles.length; i++) {
    const result = await uploadFile(videoFiles[i], BUCKETS.videos, i, videoFiles.length);
    results.push(result);

    // Create URL mapping
    if (result.success && manifest) {
      const videoManifest = manifest.videos.find(vid =>
        result.localPath.includes(vid.public_id.replace(/\//g, path.sep))
      );
      if (videoManifest) {
        urlMapping[videoManifest.secure_url] = result.supabaseUrl;
      }
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Save URL mapping
  const mappingPath = path.join(__dirname, '../temp/cloudinary-to-supabase-url-mapping.json');
  await fs.mkdir(path.dirname(mappingPath), { recursive: true });
  await fs.writeFile(mappingPath, JSON.stringify({
    migrationDate: new Date().toISOString(),
    totalAssets: imageFiles.length + videoFiles.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    urlMapping,
    results
  }, null, 2));

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Files: ${imageFiles.length + videoFiles.length}`);
  console.log(`  Images: ${imageFiles.length}`);
  console.log(`  Videos: ${videoFiles.length}`);
  console.log(`\n✅ Successful: ${results.filter(r => r.success).length}`);
  console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);
  console.log(`\n💾 URL Mapping saved to: ${mappingPath}`);
  console.log(`\n📋 Next Steps:`);
  console.log('1. Review the URL mapping file');
  console.log('2. Run: node scripts/update-cloudinary-urls.js');
  console.log('3. Test locally: npm run dev');
  console.log('4. Deploy: npm run deploy:prod\n');

  if (results.some(r => !r.success)) {
    console.log('⚠️  Some assets failed to upload. Review the errors above.\n');
  } else {
    console.log('🎉 ALL ASSETS UPLOADED SUCCESSFULLY!\n');
  }
}

// Run upload
upload().catch(error => {
  console.error('\n❌ UPLOAD FAILED:', error.message);
  process.exit(1);
});
