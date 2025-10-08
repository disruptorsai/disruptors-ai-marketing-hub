#!/usr/bin/env node

/**
 * Figma Selection Retriever
 *
 * This script provides instructions and utilities for retrieving currently
 * selected items from Figma Desktop app using the Figma Plugin API.
 *
 * Since the Figma REST API doesn't provide access to selection state,
 * we need to use a different approach through the desktop app.
 */

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     Figma Selection Retriever - Instructions              ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('📌 HOW TO GET SELECTED ITEMS FROM FIGMA DESKTOP:\n');

console.log('METHOD 1: Copy Links (Recommended)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('1. In Figma Desktop, select the items you want to export');
console.log('2. Right-click on a selected item');
console.log('3. Choose "Copy/Paste as" → "Copy link"');
console.log('4. The link will look like:');
console.log('   https://www.figma.com/design/FILE_KEY/File-Name?node-id=NODE_ID\n');
console.log('5. Extract the FILE_KEY and NODE_ID from the URL');
console.log('6. Run the export script:\n');
console.log('   node scripts/figma-asset-retriever.js <FILE_KEY> <NODE_ID1> <NODE_ID2> ...\n');

console.log('METHOD 2: Use Figma Plugin (For Multiple Items)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('1. In Figma Desktop, select multiple items');
console.log('2. Run this command to start the Figma MCP Plugin:\n');
console.log('   npx figma-developer-mcp --figma-api-key=$FIGMA_API_KEY\n');
console.log('3. The plugin will help you export selected items\n');

console.log('METHOD 3: Manual File + Node ID Entry');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('1. In Figma Desktop, note your file name in the tab');
console.log('2. Select an item and look at the properties panel');
console.log('3. The node ID might be visible in some contexts');
console.log('4. Or use the Figma URL bar to get the file key\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('💡 QUICK START:\n');
console.log('If you have a Figma URL, paste it here and I\'ll extract the info:\n');

// Check if a URL was provided as argument
const args = process.argv.slice(2);
if (args.length > 0) {
  const input = args.join(' ');

  // Try to parse Figma URL
  const urlMatch = input.match(/figma\.com\/(design|file)\/([a-zA-Z0-9]+)\/[^?]*\?.*node-id=([0-9-]+)/);

  if (urlMatch) {
    const fileKey = urlMatch[2];
    const nodeId = urlMatch[3].replace(/-/g, ':');

    console.log('✅ Parsed Figma URL:\n');
    console.log(`   File Key: ${fileKey}`);
    console.log(`   Node ID:  ${nodeId}\n`);
    console.log('Run this command to export:\n');
    console.log(`   node scripts/figma-asset-retriever.js ${fileKey} ${nodeId}\n`);
  } else {
    console.log('⚠️  Could not parse Figma URL. Please provide a valid Figma link.\n');
    console.log('Expected format:');
    console.log('   https://www.figma.com/design/FILE_KEY/Name?node-id=NODE-ID\n');
  }
} else {
  console.log('Provide a Figma URL as an argument to parse it:\n');
  console.log('   node scripts/figma-get-selection.js "https://www.figma.com/design/..."\n');
}
