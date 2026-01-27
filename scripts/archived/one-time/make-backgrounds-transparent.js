/**
 * Convert white backgrounds to transparent
 * Uses sharp library for image processing
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, '..', 'public', 'generated', 'anachron-lite');
const OUTPUT_DIR = INPUT_DIR; // Overwrite originals

async function makeTransparent(inputPath, outputPath) {
  try {
    // Read the image
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`Processing: ${path.basename(inputPath)}`);
    console.log(`  Original format: ${metadata.format}, channels: ${metadata.channels}`);

    // Convert white/near-white pixels to transparent
    // This removes backgrounds that are close to white (RGB > 250,250,250)
    await image
      .ensureAlpha() // Add alpha channel if not present
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        // Process each pixel
        for (let i = 0; i < data.length; i += info.channels) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // If pixel is close to white (all RGB values > 245), make it transparent
          if (r > 245 && g > 245 && b > 245) {
            data[i + 3] = 0; // Set alpha to 0 (transparent)
          }
        }

        return sharp(data, {
          raw: {
            width: info.width,
            height: info.height,
            channels: info.channels
          }
        })
          .png()
          .toFile(outputPath);
      });

    console.log(`  ✅ Saved with transparency: ${path.basename(outputPath)}`);
    return { success: true, file: path.basename(inputPath) };

  } catch (error) {
    console.error(`  ❌ Failed: ${path.basename(inputPath)}`);
    console.error(`  Error: ${error.message}`);
    return { success: false, file: path.basename(inputPath), error: error.message };
  }
}

async function processAllIcons() {
  console.log('🎨 Making Backgrounds Transparent');
  console.log('=' .repeat(60));
  console.log(`Directory: ${INPUT_DIR}\n`);

  // Find all PNG files
  const files = fs.readdirSync(INPUT_DIR)
    .filter(file => file.endsWith('-anachron-lite.png'));

  console.log(`Found ${files.length} icons to process\n`);

  const results = [];

  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file);

    const result = await makeTransparent(inputPath, outputPath);
    results.push(result);
    console.log(''); // Blank line between files
  }

  // Summary
  console.log('=' .repeat(60));
  console.log('📊 Processing Summary');
  console.log('=' .repeat(60));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}/${files.length}`);
  console.log(`❌ Failed: ${failed}/${files.length}`);

  if (failed > 0) {
    console.log('\nFailed files:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.file}: ${r.error}`);
    });
  }

  console.log('\n✨ Transparency processing complete!');
}

// Check if sharp is installed
try {
  await import('sharp');
  processAllIcons();
} catch (error) {
  console.error('❌ Sharp library not found. Installing...');
  console.error('Run: npm install sharp');
  console.error('\nThen run this script again.');
  process.exit(1);
}