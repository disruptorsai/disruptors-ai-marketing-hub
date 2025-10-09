/**
 * Upload Handshake Video to Cloudinary
 * Uploads the handshake landscape video for the "More Than an Agency" section
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET
});

async function uploadHandshakeVideo() {
  const filePath = 'C:\\Users\\Will\\Downloads\\handshake landscape.mp4';

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    console.log(`\n📤 Uploading handshake video...`);

    const uploadOptions = {
      folder: 'dmsite/home',
      public_id: 'handshake-landscape',
      resource_type: 'video',
      overwrite: true,
      invalidate: true
    };

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    console.log(`✅ Upload successful!`);
    console.log(`\n📋 Video Details:`);
    console.log(`   URL: ${result.secure_url}`);
    console.log(`   Public ID: ${result.public_id}`);
    console.log(`   Format: ${result.format}`);
    console.log(`   Duration: ${result.duration}s`);
    console.log(`   Size: ${(result.bytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Dimensions: ${result.width}x${result.height}`);

    console.log(`\n✨ Video uploaded successfully!`);
    console.log(`\n📝 Update home.jsx with this URL:`);
    console.log(`   ${result.secure_url}`);

    return result;

  } catch (error) {
    console.error(`❌ Upload failed:`, error.message);
    process.exit(1);
  }
}

// Verify Cloudinary config
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
if (!cloudName) {
  console.error('❌ Missing CLOUDINARY_CLOUD_NAME environment variable');
  process.exit(1);
}

console.log('🚀 Starting Cloudinary Upload...\n');
console.log(`☁️  Cloudinary Cloud: ${cloudName}\n`);

uploadHandshakeVideo().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
