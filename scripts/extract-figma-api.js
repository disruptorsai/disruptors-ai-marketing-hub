#!/usr/bin/env node

/**
 * Extract Figma file using REST API
 * Works without desktop app connection
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIGMA_API_KEY = process.env.FIGMA_API_KEY || process.env.VITE_FIGMA_API_KEY;

console.log('🎨 Figma REST API Extraction\n');

// You'll need to provide a file key - get it from your Figma URL
// Example: https://www.figma.com/file/ABC123xyz/File-Name
//                                      ^^^^^^^^^^
// Get the most recently accessed file
const fileKey = process.argv[2];

if (!fileKey) {
  console.log('❌ No file key provided!');
  console.log('\n📋 Usage:');
  console.log('   node scripts/extract-figma-api.js <FILE_KEY>');
  console.log('\n💡 Get your file key from Figma URL:');
  console.log('   https://www.figma.com/file/ABC123xyz/File-Name');
  console.log('                                ^^^^^^^^^^');
  console.log('                                This is your file key\n');
  process.exit(1);
}

async function extractFigmaFile(fileKey) {
  console.log(`📥 Fetching Figma file: ${fileKey}...`);

  const url = `https://api.figma.com/v1/files/${fileKey}`;

  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': FIGMA_API_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

try {
  const fileData = await extractFigmaFile(fileKey);

  // Save to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputPath = join(__dirname, '..', 'public', 'figma-imports', `file-${fileKey}-${timestamp}.json`);

  writeFileSync(outputPath, JSON.stringify(fileData, null, 2));

  console.log('\n✅ SUCCESS!');
  console.log(`📁 Saved to: ${outputPath}`);
  console.log(`📊 File: ${fileData.name}`);
  console.log(`📄 Pages: ${fileData.document.children.length}`);

  // Print page names
  fileData.document.children.forEach((page, i) => {
    console.log(`   ${i + 1}. ${page.name} (${page.children?.length || 0} top-level nodes)`);
  });

  console.log(`\n📦 Data size: ${JSON.stringify(fileData).length} bytes`);

  process.exit(0);
} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  process.exit(1);
}
