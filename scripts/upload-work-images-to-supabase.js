/**
 * UPLOAD WORK PAGE IMAGES TO SUPABASE STORAGE
 *
 * Uploads downloaded hero images and logos to Supabase Storage
 * and generates URL mapping for caseStudies.js update.
 *
 * Usage: node scripts/upload-work-images-to-supabase.js
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
const DOWNLOAD_DIR = path.join(__dirname, '../temp/work-images-download');
const MANIFEST_PATH = path.join(DOWNLOAD_DIR, 'download-manifest.json');

// Initialize Supabase Admin Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Storage bucket
const BUCKET_NAME = 'site-images';

/**
 * Create storage bucket if it doesn't exist
 */
async function ensureBucket() {
  console.log('📦 Verifying Supabase Storage bucket...\n');

  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!exists) {
      const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 104857600, // 100MB
        allowedMimeTypes: ['image/*']
      });

      if (error) throw error;
      console.log(`✅ Created bucket: ${BUCKET_NAME}\n`);
    } else {
      console.log(`✓ Bucket exists: ${BUCKET_NAME}\n`);
    }
  } catch (error) {
    console.error(`❌ Error with bucket ${BUCKET_NAME}:`, error.message);
    throw error;
  }
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
  };
  return mimeTypes[ext] || 'image/jpeg';
}

/**
 * Upload a single file to Supabase
 */
async function uploadFile(localPath, storagePath, index, total) {
  console.log(`[${index + 1}/${total}] Uploading: ${path.basename(localPath)}`);

  try {
    // Read file
    const fileBuffer = await fs.readFile(localPath);
    const mimeType = getMimeType(localPath);

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true,
        cacheControl: '3600'
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    console.log(`  ✅ Uploaded: ${publicUrl}\n`);

    return {
      localPath,
      storagePath,
      supabaseUrl: publicUrl,
      size: fileBuffer.length,
      success: true
    };

  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}\n`);
    return {
      localPath,
      storagePath,
      error: error.message,
      success: false
    };
  }
}

/**
 * Main upload function
 */
async function upload() {
  console.log('🚀 UPLOADING WORK PAGE IMAGES TO SUPABASE STORAGE\n');

  // Load download manifest
  let manifest;
  try {
    const content = await fs.readFile(MANIFEST_PATH, 'utf-8');
    manifest = JSON.parse(content);
  } catch (error) {
    console.error('❌ Could not load download manifest. Run download-work-images.js first.\n');
    process.exit(1);
  }

  // Ensure bucket exists
  await ensureBucket();

  const results = [];
  const urlMapping = {};
  const successfulDownloads = manifest.images.filter(img => img.success);

  if (successfulDownloads.length === 0) {
    console.error('❌ No successfully downloaded images found!\n');
    process.exit(1);
  }

  // Upload all images
  console.log('='.repeat(60));
  console.log('📤 UPLOADING IMAGES');
  console.log('='.repeat(60) + '\n');

  for (let i = 0; i < successfulDownloads.length; i++) {
    const image = successfulDownloads[i];
    const storagePath = `work/${image.type}s/${image.name}`;

    const result = await uploadFile(image.outputPath, storagePath, i, successfulDownloads.length);
    results.push(result);

    // Create URL mapping
    if (result.success) {
      urlMapping[image.url] = result.supabaseUrl;
    }

    // Small delay to avoid overwhelming Supabase
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Save URL mapping for caseStudies.js update
  const mappingPath = path.join(__dirname, '../temp/work-images-url-mapping.json');
  await fs.mkdir(path.dirname(mappingPath), { recursive: true });
  await fs.writeFile(mappingPath, JSON.stringify({
    migrationDate: new Date().toISOString(),
    totalImages: successfulDownloads.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    urlMapping,
    results
  }, null, 2));

  // Save human-readable update instructions
  const instructionsPath = path.join(__dirname, '../temp/UPDATE_CASE_STUDIES_INSTRUCTIONS.md');
  const instructions = `# Update Case Studies URLs

## URL Mapping

Replace these URLs in \`src/data/caseStudies.js\`:

${Object.entries(urlMapping).map(([old, newUrl]) => `
### ${path.basename(old)}
**Old (External):**
\`\`\`
${old}
\`\`\`

**New (Supabase):**
\`\`\`
${newUrl}
\`\`\`
`).join('\n')}

## Total Changes
- **Images to update**: ${Object.keys(urlMapping).length}
- **Heroes**: ${results.filter(r => r.storagePath.includes('heroes')).length}
- **Logos**: ${results.filter(r => r.storagePath.includes('logos')).length}

## Next Steps
1. Open \`src/data/caseStudies.js\`
2. Find and replace the old URLs with new Supabase URLs
3. Test locally: \`npm run dev\`
4. Verify Work page loads without CSP errors
5. Deploy: \`npm run deploy:dev\`
`;

  await fs.writeFile(instructionsPath, instructions);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Files: ${successfulDownloads.length}`);
  console.log(`  Heroes: ${successfulDownloads.filter(i => i.type === 'hero').length}`);
  console.log(`  Logos: ${successfulDownloads.filter(i => i.type === 'logo').length}`);
  console.log(`\n✅ Successful: ${results.filter(r => r.success).length}`);
  console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);
  console.log(`\n💾 URL Mapping saved to: ${mappingPath}`);
  console.log(`📋 Instructions saved to: ${instructionsPath}`);
  console.log(`\n📋 Next Steps:`);
  console.log('1. Review the URL mapping file');
  console.log('2. Update src/data/caseStudies.js with new URLs');
  console.log('3. Test locally: npm run dev');
  console.log('4. Deploy: npm run deploy:dev\n');

  if (results.some(r => !r.success)) {
    console.log('⚠️  Some images failed to upload. Review the errors above.\n');
  } else {
    console.log('🎉 ALL IMAGES UPLOADED SUCCESSFULLY!\n');
    console.log('✨ Your Work page will now load without CSP errors!\n');
  }
}

// Run upload
upload().catch(error => {
  console.error('\n❌ UPLOAD FAILED:', error.message);
  console.error(error.stack);
  process.exit(1);
});
