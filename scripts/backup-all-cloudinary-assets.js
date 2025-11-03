/**
 * COMPLETE CLOUDINARY ASSET BACKUP
 *
 * This script backs up ALL assets from your Cloudinary account to a local folder.
 * It preserves folder structure and downloads both images and videos.
 *
 * Requirements:
 * - CLOUDINARY_CLOUD_NAME in .env
 * - CLOUDINARY_API_KEY in .env
 * - CLOUDINARY_API_SECRET in .env (YOU NEED TO ADD THIS!)
 *
 * Usage:
 * node scripts/backup-all-cloudinary-assets.js
 *
 * Output:
 * cloudinary-backup/
 *   ├── images/
 *   │   ├── disruptors-media/brand/logos/logo.svg
 *   │   ├── disruptors-media/services/...
 *   │   └── ...
 *   ├── videos/
 *   │   ├── dmsite/services/ai-automation.mp4
 *   │   └── ...
 *   └── backup-manifest.json
 */

import https from 'https';
import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration from environment
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dvcvxhzmt';
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Backup directory
const BACKUP_DIR = path.join(__dirname, '../cloudinary-backup');

// Validate credentials
if (!API_KEY) {
  console.error('❌ ERROR: CLOUDINARY_API_KEY not found in .env');
  console.error('\nPlease add to your .env file:');
  console.error('CLOUDINARY_API_KEY=Eueo6sCMjPWxtKiLh5lHlEUNvUA\n');
  process.exit(1);
}

if (!API_SECRET) {
  console.error('❌ ERROR: CLOUDINARY_API_SECRET not found in .env');
  console.error('\n⚠️  YOU NEED TO GET YOUR API SECRET FROM CLOUDINARY:\n');
  console.error('1. Login to https://cloudinary.com/console');
  console.error('2. Go to Settings → Security');
  console.error('3. Copy your API Secret');
  console.error('4. Add to .env file:');
  console.error('   CLOUDINARY_API_SECRET=your_secret_here\n');
  console.error('For security, the API secret is NOT shown in your current .env file.');
  console.error('You must retrieve it from Cloudinary dashboard.\n');
  process.exit(1);
}

console.log('✓ Cloudinary credentials loaded\n');

/**
 * Make authenticated request to Cloudinary Admin API
 */
async function cloudinaryAdminRequest(endpoint, params = {}) {
  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

  const queryParams = new URLSearchParams(params).toString();
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}${endpoint}${queryParams ? '?' + queryParams : ''}`;

  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    }, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        if (response.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`API request failed: ${response.statusCode} - ${data}`));
        }
      });
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Download file from URL
 */
async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
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
 * Get all resources from Cloudinary (paginated)
 */
async function getAllResources(resourceType = 'image') {
  console.log(`📋 Fetching ${resourceType} list from Cloudinary...`);

  const allResources = [];
  let nextCursor = null;

  do {
    const params = {
      resource_type: resourceType,
      type: 'upload',
      max_results: 500, // Max allowed per request
      ...(nextCursor && { next_cursor: nextCursor })
    };

    try {
      const response = await cloudinaryAdminRequest('/resources/image', params);

      allResources.push(...response.resources);
      nextCursor = response.next_cursor;

      console.log(`  ✓ Fetched ${response.resources.length} ${resourceType}s (total: ${allResources.length})`);

    } catch (error) {
      console.error(`  ❌ Error fetching ${resourceType}s:`, error.message);
      break;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));

  } while (nextCursor);

  return allResources;
}

/**
 * Download and save a resource
 */
async function downloadResource(resource, resourceType, index, total) {
  const { public_id, secure_url, format, bytes } = resource;

  // Create file path preserving folder structure
  const filename = `${public_id}.${format}`;
  const filePath = path.join(BACKUP_DIR, resourceType, filename);

  console.log(`[${index + 1}/${total}] ${public_id}.${format}`);
  console.log(`  Size: ${(bytes / 1024 / 1024).toFixed(2)} MB`);

  try {
    // Create directory if needed
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Check if already downloaded
    try {
      const stats = await fs.stat(filePath);
      if (stats.size === bytes) {
        console.log(`  ✓ Already exists, skipping\n`);
        return { ...resource, localPath: filePath, skipped: true };
      }
    } catch (err) {
      // File doesn't exist, proceed with download
    }

    // Download file
    console.log(`  ⬇️  Downloading...`);
    const fileBuffer = await downloadFile(secure_url);

    // Save to disk
    await fs.writeFile(filePath, fileBuffer);
    console.log(`  ✅ Saved to: ${filePath}\n`);

    return { ...resource, localPath: filePath, downloaded: true };

  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}\n`);
    return { ...resource, error: error.message, failed: true };
  }
}

/**
 * Main backup function
 */
async function backup() {
  console.log('🚨 CLOUDINARY COMPLETE BACKUP STARTING\n');
  console.log(`Cloud Name: ${CLOUD_NAME}`);
  console.log(`Backup Directory: ${BACKUP_DIR}\n`);

  // Create backup directory
  await fs.mkdir(BACKUP_DIR, { recursive: true });

  const manifest = {
    backupDate: new Date().toISOString(),
    cloudName: CLOUD_NAME,
    images: [],
    videos: [],
    stats: {
      totalAssets: 0,
      totalSizeMB: 0,
      downloaded: 0,
      skipped: 0,
      failed: 0
    }
  };

  // Backup images
  console.log('=' .repeat(60));
  console.log('📸 BACKING UP IMAGES');
  console.log('='.repeat(60) + '\n');

  const images = await getAllResources('image');
  console.log(`\n✓ Found ${images.length} images\n`);

  for (let i = 0; i < images.length; i++) {
    const result = await downloadResource(images[i], 'images', i, images.length);
    manifest.images.push(result);

    if (result.downloaded) manifest.stats.downloaded++;
    if (result.skipped) manifest.stats.skipped++;
    if (result.failed) manifest.stats.failed++;

    // Small delay to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Backup videos
  console.log('\n' + '='.repeat(60));
  console.log('🎥 BACKING UP VIDEOS');
  console.log('='.repeat(60) + '\n');

  const videos = await getAllResources('video');
  console.log(`\n✓ Found ${videos.length} videos\n`);

  for (let i = 0; i < videos.length; i++) {
    const result = await downloadResource(videos[i], 'videos', i, videos.length);
    manifest.videos.push(result);

    if (result.downloaded) manifest.stats.downloaded++;
    if (result.skipped) manifest.stats.skipped++;
    if (result.failed) manifest.stats.failed++;

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Calculate total size
  manifest.stats.totalAssets = images.length + videos.length;
  manifest.stats.totalSizeMB = [...manifest.images, ...manifest.videos]
    .reduce((sum, r) => sum + (r.bytes || 0), 0) / 1024 / 1024;

  // Save manifest
  const manifestPath = path.join(BACKUP_DIR, 'backup-manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 BACKUP SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Assets: ${manifest.stats.totalAssets}`);
  console.log(`  Images: ${images.length}`);
  console.log(`  Videos: ${videos.length}`);
  console.log(`\nTotal Size: ${manifest.stats.totalSizeMB.toFixed(2)} MB`);
  console.log(`\n✅ Downloaded: ${manifest.stats.downloaded}`);
  console.log(`⏭️  Skipped (already exists): ${manifest.stats.skipped}`);
  console.log(`❌ Failed: ${manifest.stats.failed}`);
  console.log(`\n💾 Backup Location: ${BACKUP_DIR}`);
  console.log(`📋 Manifest: ${manifestPath}`);

  if (manifest.stats.failed > 0) {
    console.log('\n⚠️  Some assets failed to download. Check the manifest file for details.\n');
  } else {
    console.log('\n🎉 BACKUP COMPLETE!\n');
  }

  console.log('📋 Next Steps:');
  console.log('1. Review backup folder: cloudinary-backup/');
  console.log('2. Upload to Supabase: node scripts/emergency-cloudinary-migration.js');
  console.log('3. Or keep as local backup and continue using Cloudinary\n');
}

// Run backup
backup().catch(error => {
  console.error('\n❌ BACKUP FAILED:', error.message);
  console.error('\nPlease check:');
  console.error('1. CLOUDINARY_API_SECRET is correct in .env');
  console.error('2. Your Cloudinary account is accessible');
  console.error('3. You have internet connection\n');
  process.exit(1);
});
