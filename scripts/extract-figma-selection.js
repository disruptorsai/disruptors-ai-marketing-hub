#!/usr/bin/env node

/**
 * Figma Selection Extractor via MCP
 *
 * This script connects to the Figma MCP servers and extracts the current
 * selection from the Figma desktop app or via the API.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(process.cwd(), '.env') });

const PROJECT_ROOT = path.resolve(__dirname, '..');
const FIGMA_IMPORTS_DIR = path.join(PROJECT_ROOT, 'public', 'figma-imports');

// Ensure imports directory exists
if (!fs.existsSync(FIGMA_IMPORTS_DIR)) {
  fs.mkdirSync(FIGMA_IMPORTS_DIR, { recursive: true });
}

/**
 * Generate timestamp for file naming
 */
function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

/**
 * Execute MCP command via bunx/npx
 */
function executeMCPCommand(server, method, params = {}) {
  return new Promise((resolve, reject) => {
    let command, args;

    if (server === 'cursor-talk-to-figma') {
      command = '/Users/disruptors/.bun/bin/bunx';
      args = ['cursor-talk-to-figma-mcp@latest'];
    } else if (server === 'figma-developer') {
      command = 'npx';
      args = [
        '-y',
        'figma-developer-mcp',
        `--figma-api-key=${process.env.FIGMA_API_KEY}`,
        '--stdio'
      ];
    } else {
      reject(new Error(`Unknown MCP server: ${server}`));
      return;
    }

    console.log(`🔄 Executing ${server} MCP command...`);
    console.log(`   Command: ${command} ${args.join(' ')}`);

    const proc = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        FIGMA_API_KEY: process.env.FIGMA_API_KEY
      }
    });

    let stdout = '';
    let stderr = '';

    // Send JSON-RPC request to stdin
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: method,
      params: params
    };

    proc.stdin.write(JSON.stringify(request) + '\n');
    proc.stdin.end();

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}\nStderr: ${stderr}`));
      } else {
        try {
          // Try to parse JSON-RPC response
          const lines = stdout.split('\n').filter(line => line.trim());
          for (const line of lines) {
            try {
              const response = JSON.parse(line);
              if (response.result) {
                resolve(response.result);
                return;
              }
            } catch (e) {
              // Not JSON, continue
            }
          }
          // If no valid JSON-RPC response found, return raw stdout
          resolve({ raw: stdout, stderr });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}\nOutput: ${stdout}`));
        }
      }
    });

    proc.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Try to get selection from cursor-talk-to-figma (desktop app)
 */
async function getDesktopSelection() {
  console.log('\n📱 Attempting to get selection from Figma desktop app...');

  try {
    // Try get_selection method
    const result = await executeMCPCommand('cursor-talk-to-figma', 'tools/call', {
      name: 'get_selection',
      arguments: {}
    });

    return result;
  } catch (error) {
    console.log(`   ⚠️  Desktop method 1 failed: ${error.message}`);

    try {
      // Try read_my_design method as fallback
      const result = await executeMCPCommand('cursor-talk-to-figma', 'tools/call', {
        name: 'read_my_design',
        arguments: {}
      });

      return result;
    } catch (error2) {
      console.log(`   ⚠️  Desktop method 2 failed: ${error2.message}`);
      throw new Error('Both desktop extraction methods failed');
    }
  }
}

/**
 * Get file info via Figma API
 */
async function getAPIData(fileKey) {
  console.log('\n🌐 Attempting to get data via Figma API...');
  console.log(`   File key: ${fileKey || 'Not provided'}`);

  if (!fileKey) {
    throw new Error('No file key provided for API access');
  }

  try {
    const result = await executeMCPCommand('figma-developer', 'tools/call', {
      name: 'get_file',
      arguments: { file_key: fileKey }
    });

    return result;
  } catch (error) {
    console.log(`   ⚠️  API method failed: ${error.message}`);
    throw error;
  }
}

/**
 * Process and save the extracted data
 */
function saveSelectionData(data, source) {
  const timestamp = getTimestamp();
  const filename = `selection-${timestamp}.json`;
  const filepath = path.join(FIGMA_IMPORTS_DIR, filename);

  const wrappedData = {
    metadata: {
      timestamp: new Date().toISOString(),
      source: source,
      extractedBy: 'extract-figma-selection.js',
      version: '1.0.0'
    },
    data: data
  };

  fs.writeFileSync(filepath, JSON.stringify(wrappedData, null, 2));
  console.log(`\n✅ Data saved to: ${filepath}`);

  return { filepath, filename, data: wrappedData };
}

/**
 * Create extraction report
 */
function createReport(extractedData, filepath) {
  const timestamp = new Date().toISOString();

  // Analyze the data
  let nodeCount = 0;
  let nodeTypes = new Set();
  let hasImages = false;
  let hasText = false;
  let hasComponents = false;

  function analyzeNode(node) {
    if (!node) return;

    nodeCount++;
    if (node.type) nodeTypes.add(node.type);

    if (node.type === 'TEXT') hasText = true;
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') hasComponents = true;
    if (node.type === 'IMAGE' || (node.fills && node.fills.some(f => f.type === 'IMAGE'))) hasImages = true;

    if (node.children) {
      node.children.forEach(analyzeNode);
    }
  }

  if (extractedData.data) {
    if (extractedData.data.document) {
      analyzeNode(extractedData.data.document);
    } else if (extractedData.data.selection) {
      if (Array.isArray(extractedData.data.selection)) {
        extractedData.data.selection.forEach(analyzeNode);
      } else {
        analyzeNode(extractedData.data.selection);
      }
    } else if (extractedData.data.nodes) {
      Object.values(extractedData.data.nodes).forEach(analyzeNode);
    }
  }

  const report = `# Figma Selection Extraction Report

## Extraction Details
- **Timestamp**: ${timestamp}
- **Source**: ${extractedData.metadata.source}
- **Data File**: ${path.basename(filepath)}

## Contents Summary
- **Total Nodes**: ${nodeCount}
- **Node Types**: ${Array.from(nodeTypes).join(', ') || 'None detected'}
- **Contains Text**: ${hasText ? 'Yes' : 'No'}
- **Contains Images**: ${hasImages ? 'Yes' : 'No'}
- **Contains Components**: ${hasComponents ? 'Yes' : 'No'}

## Key Properties Extracted
${nodeCount > 0 ? `
- Node IDs, names, types
- Hierarchical structure (parent-child relationships)
- Dimensions (x, y, width, height)
- Visual properties (fills, strokes, effects)
- Text content and typography
- Component/instance information
` : 'No nodes detected in extraction'}

## Export Capabilities
${hasImages ? `
### Images
Images can be exported using the Figma API or MCP tools.
Consider using the \`figma-developer\` MCP server's export methods.
` : ''}

${hasComponents ? `
### Components
Component definitions and instances are included.
Can be used to generate React components programmatically.
` : ''}

## Suggested Next Steps

1. **Review the Data**
   - Open ${path.basename(filepath)} to inspect the full structure
   - Identify which nodes you want to convert to React components

2. **Export Assets**
   - Use Figma MCP tools to export images in desired formats
   - Save to \`/public/figma-imports/assets/\`

3. **Generate React Components**
   - Create component templates based on Figma structure
   - Map Figma properties to React props and Tailwind classes
   - Use the color palette and typography from the extraction

4. **Integration**
   \`\`\`javascript
   import figmaData from '/figma-imports/${path.basename(filepath)}';

   // Access the extracted data
   const nodes = figmaData.data.selection || figmaData.data.document;

   // Process nodes into React components
   function processNode(node) {
     return {
       type: node.type,
       name: node.name,
       dimensions: {
         width: node.absoluteBoundingBox?.width,
         height: node.absoluteBoundingBox?.height
       },
       styles: extractStyles(node)
     };
   }
   \`\`\`

## Data Structure
\`\`\`
${JSON.stringify(extractedData, null, 2).split('\n').slice(0, 50).join('\n')}
${JSON.stringify(extractedData, null, 2).split('\n').length > 50 ? '...(truncated)' : ''}
\`\`\`

---
*Generated by extract-figma-selection.js*
*${timestamp}*
`;

  const reportPath = path.join(FIGMA_IMPORTS_DIR, 'EXTRACTION_REPORT.md');
  fs.writeFileSync(reportPath, report);
  console.log(`✅ Report saved to: ${reportPath}`);

  return reportPath;
}

/**
 * Main extraction function
 */
async function extractFigmaSelection(fileKey = null) {
  console.log('🎨 Figma Selection Extractor');
  console.log('='.repeat(60));

  let extractedData = null;
  let source = 'unknown';

  // Try desktop app first
  try {
    const desktopData = await getDesktopSelection();
    if (desktopData) {
      extractedData = desktopData;
      source = 'figma-desktop-app';
      console.log('✅ Successfully extracted from Figma desktop app');
    }
  } catch (error) {
    console.log('⚠️  Could not extract from desktop app');
  }

  // If desktop failed and we have a file key, try API
  if (!extractedData && fileKey) {
    try {
      const apiData = await getAPIData(fileKey);
      if (apiData) {
        extractedData = apiData;
        source = 'figma-api';
        console.log('✅ Successfully extracted via Figma API');
      }
    } catch (error) {
      console.log('⚠️  Could not extract via API');
    }
  }

  // If we got data, save it
  if (extractedData) {
    const { filepath, data } = saveSelectionData(extractedData, source);
    const reportPath = createReport(data, filepath);

    console.log('\n' + '='.repeat(60));
    console.log('📊 EXTRACTION COMPLETE');
    console.log('='.repeat(60));
    console.log(`📁 Data file: ${filepath}`);
    console.log(`📄 Report: ${reportPath}`);
    console.log('\nNext: Review the extraction report for details and next steps.');

    return { success: true, filepath, reportPath, data };
  } else {
    console.log('\n' + '='.repeat(60));
    console.log('❌ EXTRACTION FAILED');
    console.log('='.repeat(60));
    console.log('\nPossible solutions:');
    console.log('1. Make sure Figma desktop app is running');
    console.log('2. Select some layers in Figma');
    console.log('3. Provide a file key as argument: node extract-figma-selection.js FILE_KEY');
    console.log('4. Check that MCP servers are configured correctly');

    return { success: false, error: 'No data extracted' };
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fileKey = process.argv[2]; // Optional file key from command line
  extractFigmaSelection(fileKey).catch(console.error);
}

export { extractFigmaSelection };
