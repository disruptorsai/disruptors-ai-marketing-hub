#!/usr/bin/env node

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const SOURCE_IMAGE = 'C:\\Users\\Will\\Downloads\\disruptorsfavicon.png';
const OUTPUT_DIR = path.join(__dirname, '..', 'public');

const SIZES = [
  { w: 256, h: 256, name: 'favicon-256x256.png' },
  { w: 128, h: 128, name: 'favicon-128x128.png' },
  { w: 64, h: 64, name: 'favicon-64x64.png' },
  { w: 48, h: 48, name: 'favicon-48x48.png' },
  { w: 32, h: 32, name: 'favicon-32x32.png' },
  { w: 16, h: 16, name: 'favicon-16x16.png' }
];

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Starting favicon generation...\n');
console.log('Cloudinary Cloud:', process.env.CLOUDINARY_CLOUD_NAME);

async function downloadFile(url, filepath) {
  console.log(`  Downloading to: ${path.basename(filepath)}`);

  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', async () => {
        try {
          await fs.writeFile(filepath, Buffer.concat(chunks));
          const stats = await fs.stat(filepath);
          console.log(`  ✓ Saved: ${(stats.size / 1024).toFixed(2)} KB\n`);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    // Step 1: Check source file
    console.log('Step 1: Checking source file...');
    const sourceStats = await fs.stat(SOURCE_IMAGE);
    console.log(`✓ Source found: ${(sourceStats.size / 1024).toFixed(2)} KB\n`);

    // Step 2: Upload to Cloudinary
    console.log('Step 2: Uploading to Cloudinary...');
    const uploadResult = await cloudinary.uploader.upload(SOURCE_IMAGE, {
      folder: 'disruptors-ai/favicons',
      public_id: 'favicon-source',
      overwrite: true,
      resource_type: 'image'
    });
    console.log(`✓ Uploaded: ${uploadResult.public_id}`);
    console.log(`  URL: ${uploadResult.secure_url}`);
    console.log(`  Size: ${uploadResult.width}x${uploadResult.height}\n`);

    const publicId = uploadResult.public_id;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    // Step 3: Generate PNG sizes
    console.log('Step 3: Generating PNG sizes...\n');

    for (const size of SIZES) {
      console.log(`Generating ${size.w}x${size.h}...`);

      // Build Cloudinary transformation URL
      const url = `https://res.cloudinary.com/${cloudName}/image/upload/w_${size.w},h_${size.h},c_fit,q_auto:best,f_png,fl_preserve_transparency/${publicId}`;
      console.log(`  URL: ${url}`);

      // Download transformed image
      const outputPath = path.join(OUTPUT_DIR, size.name);
      await downloadFile(url, outputPath);
    }

    // Step 4: Generate ICO file
    console.log('Step 4: Generating favicon.ico...');
    const icoUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_32,h_32,c_fit,f_ico/${publicId}`;
    console.log(`  URL: ${icoUrl}`);
    const icoPath = path.join(OUTPUT_DIR, 'favicon.ico');
    await downloadFile(icoUrl, icoPath);

    // Step 5: Summary
    console.log('='.repeat(70));
    console.log('✓ FAVICON GENERATION COMPLETE');
    console.log('='.repeat(70));
    console.log(`\nGenerated files in: ${OUTPUT_DIR}`);
    console.log('\nPNG Files:');
    for (const size of SIZES) {
      const filepath = path.join(OUTPUT_DIR, size.name);
      const stats = await fs.stat(filepath);
      console.log(`  ✓ ${size.name} - ${(stats.size / 1024).toFixed(2)} KB`);
    }

    const icoStats = await fs.stat(icoPath);
    console.log(`\nICO File:`);
    console.log(`  ✓ favicon.ico - ${(icoStats.size / 1024).toFixed(2)} KB`);

    console.log('\n' + '='.repeat(70));
    console.log('All favicons generated successfully!');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
