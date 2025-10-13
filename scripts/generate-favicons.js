/**
 * Favicon Generator using Cloudinary
 *
 * This script:
 * 1. Uploads a source image to Cloudinary
 * 2. Generates optimized PNG versions at multiple sizes
 * 3. Downloads each optimized image to the public directory
 *
 * Cloudinary transformations applied:
 * - f_auto: Automatic format selection (PNG optimized)
 * - q_auto:best: Best quality optimization
 * - w_XXX,h_XXX: Resize to exact dimensions
 * - c_fill: Fill mode to maintain aspect ratio
 */

import cloudinary from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration
const SOURCE_IMAGE = 'c:/Users/Will/Downloads/dmfavicon.png';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const CLOUDINARY_FOLDER = 'favicons';
const CLOUDINARY_PUBLIC_ID = 'dm-favicon';

// Favicon sizes to generate
const FAVICON_SIZES = [
  { width: 256, height: 256, filename: 'favicon-256x256.png' },
  { width: 128, height: 128, filename: 'favicon-128x128.png' },
  { width: 64, height: 64, filename: 'favicon-64x64.png' },
  { width: 48, height: 48, filename: 'favicon-48x48.png' },
  { width: 32, height: 32, filename: 'favicon-32x32.png' },
  { width: 16, height: 16, filename: 'favicon-16x16.png' }
];

/**
 * Upload image to Cloudinary
 */
async function uploadToCloudinary() {
  console.log('\n📤 Uploading source image to Cloudinary...');

  try {
    const result = await cloudinary.v2.uploader.upload(SOURCE_IMAGE, {
      folder: CLOUDINARY_FOLDER,
      public_id: CLOUDINARY_PUBLIC_ID,
      overwrite: true,
      resource_type: 'image'
    });

    console.log('✅ Upload successful!');
    console.log(`   Public ID: ${result.public_id}`);
    console.log(`   URL: ${result.secure_url}`);
    console.log(`   Size: ${(result.bytes / 1024).toFixed(2)} KB`);

    return result;
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    throw error;
  }
}

/**
 * Generate Cloudinary transformation URL
 */
function getTransformationUrl(publicId, width, height) {
  return cloudinary.v2.url(publicId, {
    width: width,
    height: height,
    crop: 'fill',
    quality: 'auto:best',
    format: 'png',
    fetch_format: 'auto'
  });
}

/**
 * Download image from URL
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file if download fails
      reject(err);
    });
  });
}

/**
 * Generate all favicon sizes
 */
async function generateFavicons(publicId) {
  console.log('\n🎨 Generating optimized favicon sizes...\n');

  for (const size of FAVICON_SIZES) {
    try {
      console.log(`  Generating ${size.width}x${size.height}px...`);

      // Generate transformation URL
      const url = getTransformationUrl(publicId, size.width, size.height);
      console.log(`     URL: ${url}`);

      // Download optimized image
      const filepath = path.join(PUBLIC_DIR, size.filename);
      await downloadImage(url, filepath);

      // Check file size
      const stats = fs.statSync(filepath);
      const fileSizeKB = (stats.size / 1024).toFixed(2);

      console.log(`     ✅ Saved to ${size.filename} (${fileSizeKB} KB)`);
    } catch (error) {
      console.error(`     ❌ Failed: ${error.message}`);
    }
  }
}

/**
 * Generate favicon.ico (multi-resolution ICO file)
 */
async function generateIcoFile(publicId) {
  console.log('\n🔷 Generating favicon.ico...');

  try {
    // Use Cloudinary's ICO format conversion
    const icoUrl = cloudinary.v2.url(publicId, {
      width: 48,
      height: 48,
      crop: 'fill',
      quality: 'auto:best',
      format: 'ico'
    });

    console.log(`   URL: ${icoUrl}`);

    const filepath = path.join(PUBLIC_DIR, 'favicon.ico');
    await downloadImage(icoUrl, filepath);

    const stats = fs.statSync(filepath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    console.log(`   ✅ Saved to favicon.ico (${fileSizeKB} KB)`);
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
  }
}

/**
 * Display summary
 */
function displaySummary() {
  console.log('\n' + '═'.repeat(60));
  console.log('✨ Favicon generation complete!');
  console.log('═'.repeat(60));
  console.log('\n📁 Generated files in public/ directory:');

  FAVICON_SIZES.forEach(size => {
    const filepath = path.join(PUBLIC_DIR, size.filename);
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      const fileSizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   ✅ ${size.filename} (${fileSizeKB} KB)`);
    }
  });

  const icoPath = path.join(PUBLIC_DIR, 'favicon.ico');
  if (fs.existsSync(icoPath)) {
    const stats = fs.statSync(icoPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   ✅ favicon.ico (${fileSizeKB} KB)`);
  }

  console.log('\n💡 Cloudinary optimization benefits:');
  console.log('   • Automatic format selection (WebP where supported)');
  console.log('   • Quality optimization (auto:best)');
  console.log('   • Efficient PNG compression');
  console.log('   • CDN delivery for fast loading');
  console.log('\n🎯 Next steps:');
  console.log('   1. Verify favicons display correctly in browsers');
  console.log('   2. Update HTML <link> tags if needed');
  console.log('   3. Clear browser cache to see new favicons');
  console.log('');
}

/**
 * Main execution
 */
async function main() {
  console.log('═'.repeat(60));
  console.log('🌐 Cloudinary Favicon Generator');
  console.log('═'.repeat(60));
  console.log(`Source: ${SOURCE_IMAGE}`);
  console.log(`Target: ${PUBLIC_DIR}`);
  console.log(`Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);

  try {
    // Check if source file exists
    if (!fs.existsSync(SOURCE_IMAGE)) {
      throw new Error(`Source image not found: ${SOURCE_IMAGE}`);
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary();

    // Generate all favicon sizes
    await generateFavicons(uploadResult.public_id);

    // Generate ICO file
    await generateIcoFile(uploadResult.public_id);

    // Display summary
    displaySummary();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
