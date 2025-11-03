/**
 * Upload new client logos to Cloudinary
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const logosToUpload = [
  { file: 'commission-express.png', name: 'commissionexpress_logo' },
  { file: 'acumen.png', name: 'acumen_logo' },
  { file: 'core-benefits.jpg', name: 'corebenefits_logo' },
  { file: 'geteducated.png', name: 'geteducated_logo' },
  { file: 'financial-haus.png', name: 'financialhaus_logo' },
  { file: 'pendari.png', name: 'pendari_logo' },
  { file: 'exeo-advisors.png', name: 'exeoadvisors_logo' },
  { file: 'greene-design.png', name: 'greenedesign_logo' }
];

async function uploadLogos() {
  console.log('Starting Cloudinary uploads...\n');

  const results = [];

  for (const logo of logosToUpload) {
    const filePath = path.join(__dirname, 'client-logos', logo.file);

    if (!fs.existsSync(filePath)) {
      console.error(`✗ File not found: ${filePath}`);
      continue;
    }

    try {
      console.log(`Uploading ${logo.file}...`);

      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'case-studies/case-studies',
        public_id: logo.name,
        overwrite: true,
        resource_type: 'image'
      });

      console.log(`✓ Uploaded: ${logo.name}`);
      console.log(`  URL: ${result.secure_url}\n`);

      results.push({
        name: logo.name,
        url: result.secure_url
      });

    } catch (error) {
      console.error(`✗ Failed to upload ${logo.file}:`, error.message);
    }
  }

  console.log('\n=== UPLOAD COMPLETE ===\n');
  console.log('Cloudinary URLs:');
  results.forEach(r => {
    console.log(`${r.name}: ${r.url}`);
  });

  return results;
}

uploadLogos().catch(console.error);
