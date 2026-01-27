import https from 'https';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dvcvxhzmt';
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!apiKey || !apiSecret) {
  console.log('ERROR: Cloudinary credentials not found');
  process.exit(1);
}

const auth = Buffer.from(apiKey + ':' + apiSecret).toString('base64');

// Generate Cloudinary signature for signed uploads
function generateSignature(params) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(sortedParams + apiSecret)
    .digest('hex');
}

// Curated Unsplash images - abstract dark geometric backgrounds aligned with site aesthetic
const BACKGROUND_IMAGES = [
  {
    id: 'WtNk-Ab9JEY',
    name: 'geometric-dramatic-lighting',
    description: 'Abstract geometric shapes with dramatic lighting and shadows'
  },
  {
    id: 'IiLVwx3e8bk',
    name: 'geometric-structure-black',
    description: 'Abstract geometric structure on black background'
  },
  {
    id: 'O_lLr6e8NtQ',
    name: 'blue-geometric-rectangles',
    description: 'Black and blue abstract background with squares and rectangles'
  },
  {
    id: 'cEM7ISPDLEQ',
    name: 'geometric-minimalist',
    description: 'Abstract geometric shapes creating minimalist backdrop'
  },
  {
    id: '9ZYYnNV9Ibs',
    name: 'dark-gradient-waves',
    description: 'Dark gradient with flowing waves'
  },
  {
    id: 'fpZZEV0uQwA',
    name: 'neural-network-blue',
    description: 'Blue neural network pattern on dark background'
  },
  {
    id: 'cckf4TsHAuw',
    name: 'dark-abstract-polygon',
    description: 'Dark abstract polygonal background'
  }
];

// Download image from Unsplash
async function downloadFromUnsplash(photoId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'unsplash.com',
      path: `/photos/${photoId}/download?force=true`,
      method: 'GET',
      headers: {
        'User-Agent': 'Disruptors-AI-Background-Downloader'
      }
    };

    const req = https.request(options, (res) => {
      // Unsplash redirects to the actual image URL
      if (res.statusCode === 302 || res.statusCode === 301) {
        const imageUrl = res.headers.location;

        // Follow redirect to download actual image
        https.get(imageUrl, (imageRes) => {
          const chunks = [];

          imageRes.on('data', (chunk) => {
            chunks.push(chunk);
          });

          imageRes.on('end', () => {
            resolve(Buffer.concat(chunks));
          });
        }).on('error', reject);
      } else {
        reject(new Error(`Unexpected status code: ${res.statusCode}`));
      }
    });

    req.on('error', reject);
    req.end();
  });
}

// Upload to Cloudinary
async function uploadToCloudinary(imageBuffer, fileName) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const timestamp = Math.round(Date.now() / 1000);
    const publicId = `disruptors-ai/backgrounds/${fileName}`;

    // Generate signature for signed upload
    const signatureParams = {
      folder: 'disruptors-ai/backgrounds',
      public_id: publicId,
      timestamp: timestamp
    };
    const signature = generateSignature(signatureParams);

    // Build multipart form data
    const parts = [];

    // File field
    parts.push(`--${boundary}\r\n`);
    parts.push(`Content-Disposition: form-data; name="file"; filename="${fileName}.jpg"\r\n`);
    parts.push(`Content-Type: image/jpeg\r\n\r\n`);

    const beforeFile = Buffer.from(parts.join(''));

    // Add signature, timestamp, api_key, public_id, and folder
    const afterFile = Buffer.from(`\r\n--${boundary}\r\n` +
      `Content-Disposition: form-data; name="public_id"\r\n\r\n` +
      `${publicId}\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="folder"\r\n\r\n` +
      `disruptors-ai/backgrounds\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="api_key"\r\n\r\n` +
      `${apiKey}\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="timestamp"\r\n\r\n` +
      `${timestamp}\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="signature"\r\n\r\n` +
      `${signature}\r\n` +
      `--${boundary}--\r\n`);

    const body = Buffer.concat([beforeFile, imageBuffer, afterFile]);

    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${cloudName}/image/upload`,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Main execution
console.log('=== BACKGROUND IMAGES DOWNLOAD & UPLOAD ===\n');
console.log(`Target: Cloudinary (${cloudName})`);
console.log(`Folder: disruptors-ai/backgrounds\n`);
console.log(`Images to process: ${BACKGROUND_IMAGES.length}\n`);

let successCount = 0;
let failCount = 0;

for (let i = 0; i < BACKGROUND_IMAGES.length; i++) {
  const img = BACKGROUND_IMAGES[i];

  try {
    console.log(`[${i + 1}/${BACKGROUND_IMAGES.length}] Processing: ${img.name}`);
    console.log(`   Description: ${img.description}`);
    console.log(`   Downloading from Unsplash...`);

    const imageBuffer = await downloadFromUnsplash(img.id);
    console.log(`   ✓ Downloaded (${(imageBuffer.length / 1024).toFixed(2)} KB)`);

    console.log(`   Uploading to Cloudinary...`);
    const result = await uploadToCloudinary(imageBuffer, img.name);
    console.log(`   ✓ Uploaded successfully!`);
    console.log(`   URL: ${result.secure_url}`);
    console.log(`   Public ID: ${result.public_id}\n`);

    successCount++;

    // Rate limiting - wait 1 second between uploads
    if (i < BACKGROUND_IMAGES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.log(`   ✗ Error: ${error.message || JSON.stringify(error)}\n`);
    failCount++;
  }
}

console.log('\n=== SUMMARY ===');
console.log(`✓ Success: ${successCount}`);
console.log(`✗ Failed: ${failCount}`);
console.log(`Total: ${BACKGROUND_IMAGES.length}\n`);

if (successCount > 0) {
  console.log('Background images are now available at:');
  console.log(`https://res.cloudinary.com/${cloudName}/image/upload/disruptors-ai/backgrounds/[image-name].jpg\n`);
}
