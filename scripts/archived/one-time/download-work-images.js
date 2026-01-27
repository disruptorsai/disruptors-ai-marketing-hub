/**
 * DOWNLOAD WORK PAGE EXTERNAL IMAGES
 *
 * Downloads all Unsplash hero images and external client logos
 * to prepare them for Supabase Storage upload.
 *
 * Usage: node scripts/download-work-images.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output directory
const DOWNLOAD_DIR = path.join(__dirname, '../temp/work-images-download');

// Images to download from case studies
const IMAGES_TO_DOWNLOAD = [
  // Unsplash Hero Images (17)
  { url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=2070&auto=format&fit=crop', name: 'tradeworx-hero.jpg', type: 'hero' },
  { url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop', name: 'timberview-hero.jpg', type: 'hero' },
  { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2070&auto=format&fit=crop', name: 'wellness-way-hero.jpg', type: 'hero' },
  { url: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?q=80&w=2070&auto=format&fit=crop', name: 'sound-corrections-hero.jpg', type: 'hero' },
  { url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2070&auto=format&fit=crop', name: 'segpro-hero.jpg', type: 'hero' },
  { url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?q=80&w=2070&auto=format&fit=crop', name: 'neuro-mastery-hero.jpg', type: 'hero' },
  { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop', name: 'muscle-works-hero.jpg', type: 'hero' },
  { url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop', name: 'granite-paving-hero.jpg', type: 'hero' },
  { url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=2070&auto=format&fit=crop', name: 'auto-trim-hero.jpg', type: 'hero' },
  { url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop', name: 'commission-express-hero.jpg', type: 'hero' },
  { url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop', name: 'acumen-hero.jpg', type: 'hero' },
  { url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop', name: 'core-benefits-hero.jpg', type: 'hero' },
  { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop', name: 'geteducated-hero.jpg', type: 'hero' },
  { url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2070&auto=format&fit=crop', name: 'financial-haus-hero.jpg', type: 'hero' },
  { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop', name: 'pendari-hero.jpg', type: 'hero' },
  { url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop', name: 'exeo-advisors-hero.jpg', type: 'hero' },
  { url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2069&auto=format&fit=crop', name: 'greene-design-hero.jpg', type: 'hero' },

  // External Client Logos (9)
  { url: 'https://www.commissionexpress.com/wp-content/uploads/2019/07/Asset-1@2x.png', name: 'commission-express-logo.png', type: 'logo' },
  { url: 'https://acumenfl.com/wp-content/uploads/2015/06/logo.png', name: 'acumen-logo.png', type: 'logo' },
  { url: 'https://www.corebenefits.org/cbn/wp-content/uploads/2020/08/cropped-CORE-BENEFITS-LOGO2-e1596752565466.jpg', name: 'core-benefits-logo.jpg', type: 'logo' },
  { url: 'https://www.geteducated.com/wp-content/uploads/2019/09/logo-get-educated.png', name: 'geteducated-logo.png', type: 'logo' },
  { url: 'https://thefinancialhaus.com/wp-content/uploads/2022/07/LOGO_FinancialHaus_horiz-stacked_BLK.png', name: 'financial-haus-logo.png', type: 'logo' },
  { url: 'https://pendari.com/wp-content/uploads/2019/05/logo.png', name: 'pendari-logo.png', type: 'logo' },
  { url: 'https://static.wixstatic.com/media/a712e2_e2068188bbbc4f2ca2cb1ea57c4fa573~mv2.png', name: 'exeo-advisors-logo.png', type: 'logo' },
  { url: 'https://greenedesignandbuild.com/wp-content/uploads/2025/08/51124-Greene-Logo.png', name: 'greene-design-logo.png', type: 'logo' },
];

/**
 * Download a single file
 */
async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        downloadFile(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          await fs.writeFile(outputPath, buffer);
          resolve({ size: buffer.length });
        } catch (error) {
          reject(error);
        }
      });
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Main download function
 */
async function download() {
  console.log('🚀 DOWNLOADING WORK PAGE EXTERNAL IMAGES\n');

  // Create output directories
  await fs.mkdir(path.join(DOWNLOAD_DIR, 'heroes'), { recursive: true });
  await fs.mkdir(path.join(DOWNLOAD_DIR, 'logos'), { recursive: true });

  const results = [];
  let successCount = 0;
  let failCount = 0;

  // Download all images
  for (let i = 0; i < IMAGES_TO_DOWNLOAD.length; i++) {
    const image = IMAGES_TO_DOWNLOAD[i];
    const outputPath = path.join(
      DOWNLOAD_DIR,
      image.type === 'hero' ? 'heroes' : 'logos',
      image.name
    );

    console.log(`[${i + 1}/${IMAGES_TO_DOWNLOAD.length}] Downloading: ${image.name}`);
    console.log(`  URL: ${image.url.substring(0, 60)}...`);

    try {
      const { size } = await downloadFile(image.url, outputPath);
      console.log(`  ✅ Success (${(size / 1024).toFixed(2)} KB)\n`);

      results.push({
        ...image,
        success: true,
        outputPath,
        size
      });
      successCount++;
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}\n`);

      results.push({
        ...image,
        success: false,
        error: error.message
      });
      failCount++;
    }

    // Small delay to be polite to servers
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Save manifest
  const manifestPath = path.join(DOWNLOAD_DIR, 'download-manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify({
    downloadDate: new Date().toISOString(),
    totalImages: IMAGES_TO_DOWNLOAD.length,
    successful: successCount,
    failed: failCount,
    images: results
  }, null, 2));

  // Print summary
  console.log('='.repeat(60));
  console.log('📊 DOWNLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Images: ${IMAGES_TO_DOWNLOAD.length}`);
  console.log(`  Heroes: ${IMAGES_TO_DOWNLOAD.filter(i => i.type === 'hero').length}`);
  console.log(`  Logos: ${IMAGES_TO_DOWNLOAD.filter(i => i.type === 'logo').length}`);
  console.log(`\n✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`\n💾 Downloaded to: ${DOWNLOAD_DIR}`);
  console.log(`📋 Manifest saved to: ${manifestPath}`);
  console.log(`\n📋 Next Steps:`);
  console.log('1. Review downloaded images in temp/work-images-download/');
  console.log('2. Run: node scripts/upload-work-images-to-supabase.js');
  console.log('3. Update case studies with new Supabase URLs\n');

  if (failCount > 0) {
    console.log('⚠️  Some images failed to download. Review the errors above.\n');
  } else {
    console.log('🎉 ALL IMAGES DOWNLOADED SUCCESSFULLY!\n');
  }
}

// Run download
download().catch(error => {
  console.error('\n❌ DOWNLOAD FAILED:', error.message);
  process.exit(1);
});
