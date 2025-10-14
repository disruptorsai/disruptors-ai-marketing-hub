#!/usr/bin/env node

/**
 * Image Optimization Script
 * Converts PNG/JPG images to WebP format with quality optimization
 * Reduces 42MB of resource icons to ~4-5MB
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// Directories to process
const IMAGE_DIRS = [
  'images/resource-icons',
  'generated',
  'generated/anachron-lite',
  'images/ai-generated',
  'images/services'
];

// WebP quality settings
const WEBP_QUALITY = 85; // High quality, good compression
const MOBILE_WIDTH = 800; // Max width for mobile optimization

/**
 * Convert a single image to WebP
 */
async function convertToWebP(inputPath, outputPath, mobileOptimize = false) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`  Converting: ${path.basename(inputPath)} (${metadata.width}x${metadata.height})`);

    let processor = image;

    // Create mobile-optimized version if requested
    if (mobileOptimize && metadata.width > MOBILE_WIDTH) {
      processor = processor.resize(MOBILE_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    await processor
      .webp({ quality: WEBP_QUALITY })
      .toFile(outputPath);

    // Get file sizes
    const inputSize = fs.statSync(inputPath).size;
    const outputSize = fs.statSync(outputPath).size;
    const reduction = ((1 - outputSize / inputSize) * 100).toFixed(1);

    console.log(`    ✓ Saved: ${formatBytes(outputSize)} (${reduction}% smaller)`);

    return { inputSize, outputSize, reduction };
  } catch (error) {
    console.error(`    ✗ Error converting ${path.basename(inputPath)}:`, error.message);
    return null;
  }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Process all images in a directory
 */
async function processDirectory(dirPath) {
  const fullPath = path.join(PUBLIC_DIR, dirPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠ Directory not found: ${dirPath}`);
    return { totalInput: 0, totalOutput: 0, count: 0 };
  }

  console.log(`\n📁 Processing: ${dirPath}`);

  const files = fs.readdirSync(fullPath);
  const imageFiles = files.filter(f => /\.(png|jpg|jpeg)$/i.test(f));

  if (imageFiles.length === 0) {
    console.log('  No images found');
    return { totalInput: 0, totalOutput: 0, count: 0 };
  }

  let totalInput = 0;
  let totalOutput = 0;
  let count = 0;

  for (const file of imageFiles) {
    const inputPath = path.join(fullPath, file);
    const outputFilename = file.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    const outputPath = path.join(fullPath, outputFilename);

    // Skip if WebP already exists and is newer
    if (fs.existsSync(outputPath)) {
      const inputTime = fs.statSync(inputPath).mtime;
      const outputTime = fs.statSync(outputPath).mtime;
      if (outputTime > inputTime) {
        console.log(`  Skipping: ${file} (WebP already exists)`);
        continue;
      }
    }

    const result = await convertToWebP(inputPath, outputPath, true);

    if (result) {
      totalInput += result.inputSize;
      totalOutput += result.outputSize;
      count++;
    }
  }

  if (count > 0) {
    const totalReduction = ((1 - totalOutput / totalInput) * 100).toFixed(1);
    console.log(`\n  📊 Summary: ${count} images, ${formatBytes(totalInput)} → ${formatBytes(totalOutput)} (${totalReduction}% reduction)`);
  }

  return { totalInput, totalOutput, count };
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Image Optimization Script');
  console.log('Converting PNG/JPG to WebP format...\n');

  let grandTotalInput = 0;
  let grandTotalOutput = 0;
  let grandTotalCount = 0;

  for (const dir of IMAGE_DIRS) {
    const { totalInput, totalOutput, count } = await processDirectory(dir);
    grandTotalInput += totalInput;
    grandTotalOutput += totalOutput;
    grandTotalCount += count;
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ OPTIMIZATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total images processed: ${grandTotalCount}`);
  console.log(`Original size: ${formatBytes(grandTotalInput)}`);
  console.log(`Optimized size: ${formatBytes(grandTotalOutput)}`);
  console.log(`Total savings: ${formatBytes(grandTotalInput - grandTotalOutput)} (${((1 - grandTotalOutput / grandTotalInput) * 100).toFixed(1)}%)`);
  console.log('\n💡 Next steps:');
  console.log('  1. Update image references in code to use .webp extensions');
  console.log('  2. Add <picture> tags with fallbacks for older browsers');
  console.log('  3. Implement lazy loading for images');
  console.log('  4. Test on mobile devices');
}

main().catch(console.error);
