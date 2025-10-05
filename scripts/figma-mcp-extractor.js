#!/usr/bin/env node

/**
 * Figma MCP Extractor
 *
 * This script attempts to connect to the Figma MCP server and extract
 * the current selection data from Figma.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Main extraction function
 */
async function extractFigmaSelection() {
  console.log('🎨 Figma MCP Extractor');
  console.log('='.repeat(50));
  console.log('');

  const timestamp = getTimestamp();

  try {
    // Note: Since we cannot directly access MCP tools in this script environment,
    // we'll create a placeholder structure that documents what should be extracted

    console.log('⚠️  MCP Tool Access Limitation');
    console.log('This script is designed to work with Figma MCP tools.');
    console.log('Expected tools:');
    console.log('  - mcp__cursor-talk-to-figma__get_selection');
    console.log('  - mcp__cursor-talk-to-figma__read_my_design');
    console.log('  - mcp__figma-developer__*');
    console.log('');

    // Create a template/documentation file showing the expected structure
    const templateData = {
      metadata: {
        timestamp: new Date().toISOString(),
        extractedBy: 'figma-mcp-extractor.js',
        mcpServer: 'http://127.0.0.1:3845/mcp',
        version: '1.0.0'
      },
      selection: {
        nodes: [],
        count: 0,
        types: []
      },
      instructions: {
        message: 'This is a template file. Actual Figma data should be extracted using MCP tools.',
        requiredTools: [
          'mcp__cursor-talk-to-figma__get_selection',
          'mcp__cursor-talk-to-figma__read_my_design'
        ],
        dataStructure: {
          nodes: [
            {
              id: 'node-id',
              name: 'Node Name',
              type: 'FRAME|COMPONENT|TEXT|SHAPE|etc',
              dimensions: {
                width: 0,
                height: 0,
                x: 0,
                y: 0
              },
              fills: [],
              strokes: [],
              effects: [],
              text: {
                content: '',
                style: {
                  fontFamily: '',
                  fontSize: 0,
                  fontWeight: 0,
                  lineHeight: 0,
                  letterSpacing: 0
                }
              },
              children: [],
              componentProperties: {},
              exportSettings: []
            }
          ]
        }
      }
    };

    const templatePath = path.join(FIGMA_IMPORTS_DIR, `selection-template-${timestamp}.json`);
    fs.writeFileSync(templatePath, JSON.stringify(templateData, null, 2));
    console.log(`✅ Template created: ${templatePath}`);
    console.log('');

    // Create README with instructions
    const readmeContent = `# Figma MCP Import Instructions

## Status
This directory is set up to receive Figma selection data via MCP tools.

## MCP Server
- **URL**: http://127.0.0.1:3845/mcp
- **Expected Tools**:
  - \`mcp__cursor-talk-to-figma__get_selection\`
  - \`mcp__cursor-talk-to-figma__read_my_design\`
  - \`mcp__figma-developer__*\`

## Required Configuration

The Figma MCP server needs to be added to \`.cursor/mcp.json\`:

\`\`\`json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "\${FIGMA_ACCESS_TOKEN}"
      }
    }
  }
}
\`\`\`

## Expected Data Structure

### Selection Data
\`\`\`json
{
  "metadata": {
    "timestamp": "ISO-8601 timestamp",
    "fileKey": "Figma file key",
    "fileName": "File name"
  },
  "selection": {
    "nodes": [
      {
        "id": "unique-node-id",
        "name": "Layer name",
        "type": "FRAME|COMPONENT|TEXT|etc",
        "dimensions": {
          "width": number,
          "height": number,
          "x": number,
          "y": number
        },
        "fills": [...],
        "strokes": [...],
        "text": {...},
        "children": [...]
      }
    ]
  }
}
\`\`\`

## Files Generated
- \`selection-[timestamp].json\` - Raw selection data
- \`IMPORT_SUMMARY.md\` - Human-readable summary

## Next Steps
1. Ensure Figma MCP server is configured in \`.cursor/mcp.json\`
2. Set \`FIGMA_ACCESS_TOKEN\` environment variable
3. Use Claude Code with MCP tools to extract actual selection data
4. Data will be saved in this directory automatically

## Usage in React App
\`\`\`javascript
import selectionData from '/figma-imports/selection-[timestamp].json';

// Access node data
const nodes = selectionData.selection.nodes;
const frames = nodes.filter(n => n.type === 'FRAME');
const components = nodes.filter(n => n.type === 'COMPONENT');
\`\`\`

---
Generated: ${new Date().toISOString()}
`;

    const readmePath = path.join(FIGMA_IMPORTS_DIR, 'README.md');
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`✅ README created: ${readmePath}`);
    console.log('');

    console.log('📋 Summary');
    console.log('='.repeat(50));
    console.log(`Directory: ${FIGMA_IMPORTS_DIR}`);
    console.log(`Files created:`);
    console.log(`  - selection-template-${timestamp}.json`);
    console.log(`  - README.md`);
    console.log('');
    console.log('⚠️  To extract actual Figma data:');
    console.log('1. Ensure Figma MCP server is running at http://127.0.0.1:3845/mcp');
    console.log('2. Configure the server in .cursor/mcp.json');
    console.log('3. Use Claude Code with MCP tool access to call:');
    console.log('   - mcp__cursor-talk-to-figma__get_selection');
    console.log('   - mcp__cursor-talk-to-figma__read_my_design');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  extractFigmaSelection().catch(console.error);
}

export { extractFigmaSelection };
