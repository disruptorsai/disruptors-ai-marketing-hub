#!/usr/bin/env node

/**
 * Figma Asset Retriever
 *
 * Retrieves currently selected items from Figma desktop app and exports them
 * to the project directory.
 *
 * Requirements:
 * - Figma desktop app must be running
 * - Assets must be selected in Figma
 * - Figma API key configured in mcp.json
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Figma API configuration from environment
const FIGMA_API_KEY = process.env.FIGMA_API_KEY;
const FIGMA_API_BASE = 'https://api.figma.com/v1';

if (!FIGMA_API_KEY) {
  console.error('❌ Error: FIGMA_API_KEY environment variable is not set');
  process.exit(1);
}

// Output directory for downloaded assets
const ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets', 'figma-imports');

/**
 * Make a request to the Figma API
 */
function figmaRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${FIGMA_API_BASE}${endpoint}`;
    const options = {
      headers: {
        'X-Figma-Token': FIGMA_API_KEY
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Figma API error: ${res.statusCode} - ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Download a file from URL to local path
 */
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

/**
 * Get the user's currently selected items from Figma Desktop
 * Note: This requires the Figma Desktop App Plugin API
 */
async function getSelectedItems() {
  console.log('\n📋 Checking for selected items in Figma Desktop...\n');

  // Unfortunately, the Figma REST API doesn't provide direct access to selected items
  // This would typically require:
  // 1. A Figma plugin running in the desktop app
  // 2. Or manually providing the file key and node IDs

  console.log('⚠️  Note: The Figma REST API cannot directly access selected items.');
  console.log('Please provide the following information:\n');

  // For now, we'll need to get this information interactively
  return null;
}

/**
 * Export assets from a Figma file
 */
async function exportAssets(fileKey, nodeIds, options = {}) {
  const format = options.format || 'png';
  const scale = options.scale || 2;

  console.log(`\n🎨 Exporting assets from file: ${fileKey}`);
  console.log(`   Nodes: ${nodeIds.join(', ')}`);
  console.log(`   Format: ${format} @ ${scale}x scale\n`);

  // Request image exports
  const nodeIdsParam = nodeIds.join(',');
  const endpoint = `/images/${fileKey}?ids=${nodeIdsParam}&format=${format}&scale=${scale}`;

  const response = await figmaRequest(endpoint);

  if (!response.images) {
    throw new Error('No images returned from Figma API');
  }

  return response.images;
}

/**
 * Get node details from Figma file
 */
async function getNodeDetails(fileKey, nodeIds) {
  const nodeIdsParam = nodeIds.join(',');
  const endpoint = `/files/${fileKey}/nodes?ids=${nodeIdsParam}`;

  const response = await figmaRequest(endpoint);
  return response.nodes;
}

/**
 * Main execution
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          Figma Asset Retriever                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
      console.log(`✅ Created output directory: ${ASSETS_DIR}\n`);
    }

    // Since we can't directly get selected items from the API,
    // we'll provide instructions for the user
    console.log('📌 TO USE THIS SCRIPT:\n');
    console.log('1. In Figma Desktop, select the items you want to export');
    console.log('2. Right-click on a selected item');
    console.log('3. Choose "Copy as" → "Copy link"');
    console.log('4. The link will look like: https://www.figma.com/file/FILE_KEY/...?node-id=NODE_ID');
    console.log('\n5. Then run this script with:');
    console.log('   node scripts/figma-asset-retriever.js <FILE_KEY> <NODE_ID1> <NODE_ID2> ...\n');

    // Check if we received command line arguments
    const args = process.argv.slice(2);

    if (args.length < 2) {
      console.log('⚠️  No file key or node IDs provided.\n');
      console.log('Example usage:');
      console.log('   node scripts/figma-asset-retriever.js ABC123DEF 1:23 4:56 7:89\n');
      process.exit(0);
    }

    const fileKey = args[0];
    const nodeIds = args.slice(1);

    // Get node details
    console.log('📥 Fetching node details...\n');
    const nodeDetails = await getNodeDetails(fileKey, nodeIds);

    // Export assets
    const imageUrls = await exportAssets(fileKey, nodeIds, {
      format: 'png',
      scale: 2
    });

    // Download each asset
    console.log('⬇️  Downloading assets...\n');
    const downloadedAssets = [];

    for (const nodeId of nodeIds) {
      const imageUrl = imageUrls[nodeId];

      if (!imageUrl) {
        console.log(`⚠️  No image URL for node: ${nodeId}`);
        continue;
      }

      const nodeInfo = nodeDetails[nodeId];
      const nodeName = nodeInfo?.document?.name || `node-${nodeId}`;
      const sanitizedName = nodeName.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
      const filename = `${sanitizedName}-${nodeId.replace(':', '-')}.png`;
      const filepath = path.join(ASSETS_DIR, filename);

      console.log(`   Downloading: ${nodeName}`);
      await downloadFile(imageUrl, filepath);

      downloadedAssets.push({
        nodeId,
        name: nodeName,
        type: nodeInfo?.document?.type || 'unknown',
        filepath: filepath.replace(__dirname, '').replace('\\..\\', ''),
        filename
      });
    }

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║          Download Summary                                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`✅ Successfully downloaded ${downloadedAssets.length} asset(s):\n`);

    downloadedAssets.forEach(asset => {
      console.log(`   📦 ${asset.name}`);
      console.log(`      Type: ${asset.type}`);
      console.log(`      File: ${asset.filename}`);
      console.log(`      Path: public/assets/figma-imports/${asset.filename}\n`);
    });

    // Save manifest
    const manifest = {
      exportDate: new Date().toISOString(),
      fileKey,
      assets: downloadedAssets
    };

    const manifestPath = path.join(ASSETS_DIR, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`📄 Manifest saved to: public/assets/figma-imports/manifest.json\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}

export { exportAssets, getNodeDetails, downloadFile };
