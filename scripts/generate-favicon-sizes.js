#!/usr/bin/env node

/**
 * Favicon Size Generator
 *
 * Uploads source favicon to Cloudinary and generates optimized PNG versions
 * at all required sizes with transparent background preservation.
 *
 * Usage:
 *   node scripts/generate-favicon-sizes.js
 *
 * Requirements:
 *   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *   - Source image at: c:\Users\Will\Downloads\disruptorsfavicon.png
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  source: {
    path: 'c:\\Users\\Will\\Downloads\\disruptorsfavicon.png',
    cloudinaryFolder: 'disruptors-ai/favicons',
    publicId: 'favicon-source'
  },
  output: {
    directory: path.join(__dirname, '..', 'public'),
    formats: ['png', 'ico']
  },
  sizes: [
    { width: 256, height: 256, filename: 'favicon-256x256.png' },
    { width: 128, height: 128, filename: 'favicon-128x128.png' },
    { width: 64, height: 64, filename: 'favicon-64x64.png' },
    { width: 48, height: 48, filename: 'favicon-48x48.png' },
    { width: 32, height: 32, filename: 'favicon-32x32.png' },
    { width: 16, height: 16, filename: 'favicon-16x16.png' }
  ],
  cloudinary: {
    transformation: {
      quality: 'auto:best',
      format: 'png',
      flags: 'preserve_transparency'
    }
  }
};

class FaviconGenerator {
  constructor() {
    this.cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    };

    if (!this.cloudinaryConfig.cloud_name || !this.cloudinaryConfig.api_key || !this.cloudinaryConfig.api_secret) {
      throw new Error('Cloudinary configuration missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
    }

    cloudinary.config(this.cloudinaryConfig);
  }

  /**
   * Verify source image exists
   */
  async verifySource() {
    try {
      await fs.access(CONFIG.source.path);
      const stats = await fs.stat(CONFIG.source.path);
      console.log(`✓ Source image found: ${CONFIG.source.path}`);
      console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`);
      return true;
    } catch (error) {
      console.error(`✗ Source image not found: ${CONFIG.source.path}`);
      throw new Error('Source image not found. Please ensure disruptorsfavicon.png exists in Downloads folder.');
    }
  }

  /**
   * Upload source image to Cloudinary
   */
  async uploadSource() {
    console.log('\n📤 Uploading source image to Cloudinary...');

    try {
      const result = await cloudinary.uploader.upload(CONFIG.source.path, {
        folder: CONFIG.source.cloudinaryFolder,
        public_id: CONFIG.source.publicId,
        overwrite: true,
        resource_type: 'image',
        type: 'upload'
      });

      console.log(`✓ Source uploaded successfully`);
      console.log(`  Public ID: ${result.public_id}`);
      console.log(`  URL: ${result.secure_url}`);
      console.log(`  Format: ${result.format}`);
      console.log(`  Dimensions: ${result.width}x${result.height}`);

      return result;
    } catch (error) {
      console.error('✗ Upload failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate Cloudinary transformation URL for specific size
   */
  generateTransformationUrl(publicId, size) {
    // Build transformation parameters
    const transformations = [
      `w_${size.width}`,
      `h_${size.height}`,
      'c_fit', // Fit entire image within dimensions
      'q_auto:best', // Best quality with auto optimization
      'f_png', // PNG format for transparency
      'fl_preserve_transparency' // Preserve transparent background
    ];

    const cloudName = this.cloudinaryConfig.cloud_name;
    const transformString = transformations.join(',');

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
  }

  /**
   * Download file from URL to local path
   */
  async downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
      const file = fs.open(filepath, 'w');

      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        const chunks = [];

        response.on('data', (chunk) => {
          chunks.push(chunk);
        });

        response.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);
            await fs.writeFile(filepath, buffer);
            resolve(filepath);
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Generate and download favicon at specific size
   */
  async generateSize(uploadResult, size) {
    console.log(`\n🎨 Generating ${size.width}x${size.height} favicon...`);

    try {
      // Generate transformation URL
      const transformedUrl = this.generateTransformationUrl(uploadResult.public_id, size);
      console.log(`  Transformation URL: ${transformedUrl}`);

      // Download transformed image
      const outputPath = path.join(CONFIG.output.directory, size.filename);
      await this.downloadFile(transformedUrl, outputPath);

      // Verify file was created
      const stats = await fs.stat(outputPath);
      console.log(`✓ ${size.filename} created`);
      console.log(`  Path: ${outputPath}`);
      console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`);

      return {
        size: `${size.width}x${size.height}`,
        filename: size.filename,
        path: outputPath,
        url: transformedUrl,
        fileSize: stats.size,
        success: true
      };

    } catch (error) {
      console.error(`✗ Failed to generate ${size.filename}:`, error.message);
      return {
        size: `${size.width}x${size.height}`,
        filename: size.filename,
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Generate ICO file for legacy browser support
   */
  async generateIco(uploadResult) {
    console.log('\n🎨 Generating favicon.ico...');

    try {
      // ICO format typically contains multiple sizes (16x16, 32x32, 48x48)
      // Cloudinary will handle the ICO format conversion
      const transformations = [
        'w_32',
        'h_32',
        'c_fit',
        'f_ico' // ICO format
      ];

      const cloudName = this.cloudinaryConfig.cloud_name;
      const transformString = transformations.join(',');
      const icoUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${uploadResult.public_id}`;

      console.log(`  Transformation URL: ${icoUrl}`);

      // Download ICO file
      const outputPath = path.join(CONFIG.output.directory, 'favicon.ico');
      await this.downloadFile(icoUrl, outputPath);

      const stats = await fs.stat(outputPath);
      console.log(`✓ favicon.ico created`);
      console.log(`  Path: ${outputPath}`);
      console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`);

      return {
        filename: 'favicon.ico',
        path: outputPath,
        url: icoUrl,
        fileSize: stats.size,
        success: true
      };

    } catch (error) {
      console.error(`✗ Failed to generate favicon.ico:`, error.message);
      return {
        filename: 'favicon.ico',
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Generate all favicon sizes
   */
  async generateAll() {
    console.log('🚀 Starting favicon generation...\n');
    console.log('Configuration:');
    console.log(`  Source: ${CONFIG.source.path}`);
    console.log(`  Output: ${CONFIG.output.directory}`);
    console.log(`  Sizes: ${CONFIG.sizes.length} PNG variants + 1 ICO file\n`);

    const results = {
      source: null,
      pngFiles: [],
      icoFile: null,
      timestamp: new Date().toISOString()
    };

    try {
      // Verify source image
      await this.verifySource();

      // Upload source to Cloudinary
      results.source = await this.uploadSource();

      // Generate PNG sizes
      for (const size of CONFIG.sizes) {
        const result = await this.generateSize(results.source, size);
        results.pngFiles.push(result);
      }

      // Generate ICO file
      results.icoFile = await this.generateIco(results.source);

      return results;

    } catch (error) {
      console.error('\n💥 Generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Save results summary to JSON file
   */
  async saveResults(results) {
    const outputPath = path.join(CONFIG.output.directory, 'favicon-generation-results.json');

    const summary = {
      timestamp: results.timestamp,
      source: {
        cloudinaryPublicId: results.source?.public_id,
        cloudinaryUrl: results.source?.secure_url,
        originalPath: CONFIG.source.path
      },
      generated: {
        png: results.pngFiles.filter(f => f.success).length,
        ico: results.icoFile?.success ? 1 : 0,
        total: results.pngFiles.filter(f => f.success).length + (results.icoFile?.success ? 1 : 0)
      },
      files: [
        ...results.pngFiles,
        results.icoFile
      ],
      transformations: {
        quality: 'auto:best',
        format: 'png',
        transparency: 'preserved',
        resizeMode: 'fit'
      }
    };

    await fs.writeFile(outputPath, JSON.stringify(summary, null, 2));
    console.log(`\n📄 Results saved to: ${outputPath}`);

    return summary;
  }

  /**
   * Display summary
   */
  displaySummary(results) {
    console.log('\n' + '='.repeat(70));
    console.log('📊 FAVICON GENERATION SUMMARY');
    console.log('='.repeat(70));

    const successful = results.pngFiles.filter(f => f.success).length;
    const failed = results.pngFiles.filter(f => !f.success).length;
    const icoSuccess = results.icoFile?.success ? 1 : 0;

    console.log(`\n✓ PNG Files: ${successful}/${CONFIG.sizes.length} successful`);
    console.log(`✓ ICO File: ${icoSuccess}/1 successful`);

    if (failed > 0) {
      console.log(`✗ Failed: ${failed}`);
    }

    console.log('\n📁 Generated Files:');
    results.pngFiles.filter(f => f.success).forEach(file => {
      console.log(`  ✓ ${file.filename} (${(file.fileSize / 1024).toFixed(2)} KB)`);
    });

    if (results.icoFile?.success) {
      console.log(`  ✓ ${results.icoFile.filename} (${(results.icoFile.fileSize / 1024).toFixed(2)} KB)`);
    }

    if (failed > 0) {
      console.log('\n❌ Failed Files:');
      results.pngFiles.filter(f => !f.success).forEach(file => {
        console.log(`  ✗ ${file.filename}: ${file.error}`);
      });
    }

    console.log('\n🔗 Cloudinary Source:');
    console.log(`  ${results.source.secure_url}`);

    console.log('\n📝 Next Steps:');
    console.log('  1. Verify favicon files in public/ directory');
    console.log('  2. Test favicons in different browsers');
    console.log('  3. Update HTML head tags if necessary');
    console.log('  4. Commit generated files to repository');
    console.log('\n' + '='.repeat(70));
  }
}

// Main execution
async function main() {
  try {
    const generator = new FaviconGenerator();
    const results = await generator.generateAll();
    await generator.saveResults(results);
    generator.displaySummary(results);

    process.exit(0);
  } catch (error) {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default FaviconGenerator;
