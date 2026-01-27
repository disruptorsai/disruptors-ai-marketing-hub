#!/usr/bin/env node

/**
 * Figma Data Extractor via REST API
 *
 * Direct Figma REST API client for extracting design data
 * when MCP servers are unavailable.
 *
 * Usage:
 *   node scripts/extract-figma-rest-api.js <file-key-or-url> [node-ids]
 *
 * Examples:
 *   node scripts/extract-figma-rest-api.js abc123def456
 *   node scripts/extract-figma-rest-api.js https://www.figma.com/file/abc123/Design
 *   node scripts/extract-figma-rest-api.js abc123def456 1:2,1:3
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment
config({ path: path.join(process.cwd(), '.env') });

const FIGMA_API_KEY = process.env.FIGMA_API_KEY || process.env.VITE_FIGMA_API_KEY;
const FIGMA_API_BASE = 'https://api.figma.com/v1';

if (!FIGMA_API_KEY) {
  console.error('❌ Error: FIGMA_API_KEY not found in environment variables');
  process.exit(1);
}

/**
 * Fetch from Figma API
 */
async function fetchFigma(endpoint) {
  const url = `${FIGMA_API_BASE}${endpoint}`;
  console.log(`📡 Fetching: ${url}`);

  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': FIGMA_API_KEY
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Figma API error ${response.status}: ${error}`);
  }

  return await response.json();
}

/**
 * Extract comprehensive node details
 */
function extractNodeDetails(node, parentPath = '', level = 0) {
  const currentPath = parentPath ? `${parentPath} > ${node.name}` : node.name;

  const details = {
    id: node.id,
    name: node.name,
    type: node.type,
    path: currentPath,
    level: level,
    visible: node.visible !== false,
    locked: node.locked || false
  };

  // Bounding box and dimensions
  if (node.absoluteBoundingBox) {
    details.absoluteBoundingBox = node.absoluteBoundingBox;
    details.dimensions = {
      width: Math.round(node.absoluteBoundingBox.width * 100) / 100,
      height: Math.round(node.absoluteBoundingBox.height * 100) / 100,
      x: Math.round(node.absoluteBoundingBox.x * 100) / 100,
      y: Math.round(node.absoluteBoundingBox.y * 100) / 100
    };
  }

  // Layout properties
  if (node.layoutMode) {
    details.layout = {
      mode: node.layoutMode, // HORIZONTAL, VERTICAL, NONE
      padding: {
        top: node.paddingTop,
        right: node.paddingRight,
        bottom: node.paddingBottom,
        left: node.paddingLeft
      },
      spacing: node.itemSpacing,
      alignment: node.primaryAxisAlignMode,
      distribution: node.counterAxisAlignMode
    };
  }

  // Colors - fills
  if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
    details.fills = node.fills
      .filter(fill => fill.visible !== false)
      .map(fill => {
        const fillData = {
          type: fill.type,
          opacity: fill.opacity ?? 1,
          blendMode: fill.blendMode
        };

        if (fill.color) {
          fillData.color = {
            r: Math.round(fill.color.r * 255),
            g: Math.round(fill.color.g * 255),
            b: Math.round(fill.color.b * 255),
            a: fill.color.a ?? 1,
            hex: rgbToHex(fill.color),
            rgba: `rgba(${Math.round(fill.color.r * 255)}, ${Math.round(fill.color.g * 255)}, ${Math.round(fill.color.b * 255)}, ${fill.color.a ?? 1})`
          };
        }

        if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL') {
          fillData.gradientStops = fill.gradientStops?.map(stop => ({
            position: stop.position,
            color: stop.color ? rgbToHex(stop.color) : null
          }));
        }

        return fillData;
      });
  }

  // Colors - strokes
  if (node.strokes && Array.isArray(node.strokes) && node.strokes.length > 0) {
    details.strokes = node.strokes.map(stroke => {
      const strokeData = {
        type: stroke.type,
        opacity: stroke.opacity ?? 1
      };

      if (stroke.color) {
        strokeData.color = {
          r: Math.round(stroke.color.r * 255),
          g: Math.round(stroke.color.g * 255),
          b: Math.round(stroke.color.b * 255),
          a: stroke.color.a ?? 1,
          hex: rgbToHex(stroke.color)
        };
      }

      return strokeData;
    });

    if (node.strokeWeight !== undefined) {
      details.strokeWeight = node.strokeWeight;
    }
    if (node.strokeAlign) {
      details.strokeAlign = node.strokeAlign;
    }
  }

  // Corner radius
  if (node.cornerRadius !== undefined) {
    details.cornerRadius = node.cornerRadius;
  }
  if (node.rectangleCornerRadii) {
    details.rectangleCornerRadii = node.rectangleCornerRadii;
  }

  // Text properties
  if (node.type === 'TEXT') {
    details.text = {
      content: node.characters,
      style: {}
    };

    if (node.style) {
      details.text.style = {
        fontFamily: node.style.fontFamily,
        fontWeight: node.style.fontWeight,
        fontSize: node.style.fontSize,
        textAlignHorizontal: node.style.textAlignHorizontal,
        textAlignVertical: node.style.textAlignVertical,
        letterSpacing: node.style.letterSpacing,
        lineHeightPx: node.style.lineHeightPx,
        lineHeightPercent: node.style.lineHeightPercent,
        textDecoration: node.style.textDecoration
      };
    }
  }

  // Component/Instance properties
  if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
    details.component = {
      isComponent: true,
      componentId: node.id,
      description: node.description
    };
  } else if (node.type === 'INSTANCE') {
    details.instance = {
      componentId: node.componentId,
      isInstance: true
    };
  }

  // Effects (shadows, blurs)
  if (node.effects && node.effects.length > 0) {
    details.effects = node.effects
      .filter(effect => effect.visible !== false)
      .map(effect => ({
        type: effect.type,
        radius: effect.radius,
        offset: effect.offset,
        color: effect.color ? rgbToHex(effect.color) : null,
        blendMode: effect.blendMode
      }));
  }

  // Constraints
  if (node.constraints) {
    details.constraints = node.constraints;
  }

  // Export settings
  if (node.exportSettings && node.exportSettings.length > 0) {
    details.exportSettings = node.exportSettings;
  }

  // Process children recursively
  if (node.children && node.children.length > 0) {
    details.childrenCount = node.children.length;
    details.children = node.children.map(child =>
      extractNodeDetails(child, currentPath, level + 1)
    );
  }

  return details;
}

/**
 * Convert Figma RGB (0-1) to hex color
 */
function rgbToHex(color) {
  const r = Math.round(color.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(color.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(color.b * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toUpperCase();
}

/**
 * Generate comprehensive markdown summary
 */
function generateMarkdownSummary(fileData, extractedNodes) {
  const timestamp = new Date().toISOString();
  const nodeCount = extractedNodes.length;

  // Collect statistics
  const stats = {
    types: {},
    colors: new Set(),
    fonts: new Set(),
    components: 0,
    instances: 0,
    textNodes: 0,
    totalNodes: 0
  };

  function collectStats(node) {
    stats.totalNodes++;
    stats.types[node.type] = (stats.types[node.type] || 0) + 1;

    if (node.fills) {
      node.fills.forEach(fill => {
        if (fill.color?.hex) stats.colors.add(fill.color.hex);
      });
    }

    if (node.text?.style?.fontFamily) {
      stats.fonts.add(node.text.style.fontFamily);
    }

    if (node.type === 'COMPONENT') stats.components++;
    if (node.type === 'INSTANCE') stats.instances++;
    if (node.type === 'TEXT') stats.textNodes++;

    if (node.children) {
      node.children.forEach(collectStats);
    }
  }

  extractedNodes.forEach(collectStats);

  let markdown = `# Figma Data Extraction Report\n\n`;
  markdown += `**Extracted:** ${timestamp}\n`;
  markdown += `**File:** ${fileData.name}\n`;
  markdown += `**Version:** ${fileData.version || 'N/A'}\n`;
  markdown += `**Last Modified:** ${fileData.lastModified || 'N/A'}\n\n`;

  markdown += `## Overview\n\n`;
  markdown += `- **Top-level Nodes:** ${nodeCount}\n`;
  markdown += `- **Total Nodes:** ${stats.totalNodes}\n`;
  markdown += `- **Unique Colors:** ${stats.colors.size}\n`;
  markdown += `- **Font Families:** ${stats.fonts.size}\n`;
  markdown += `- **Components:** ${stats.components}\n`;
  markdown += `- **Instances:** ${stats.instances}\n`;
  markdown += `- **Text Nodes:** ${stats.textNodes}\n\n`;

  markdown += `## Node Types\n\n`;
  Object.entries(stats.types)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      markdown += `- **${type}**: ${count}\n`;
    });
  markdown += `\n`;

  if (stats.colors.size > 0) {
    markdown += `## Color Palette\n\n`;
    Array.from(stats.colors).forEach(color => {
      markdown += `- ${color}\n`;
    });
    markdown += `\n`;
  }

  if (stats.fonts.size > 0) {
    markdown += `## Typography\n\n`;
    Array.from(stats.fonts).forEach(font => {
      markdown += `- ${font}\n`;
    });
    markdown += `\n`;
  }

  markdown += `## Extracted Nodes\n\n`;

  extractedNodes.forEach((node, index) => {
    markdown += `### ${index + 1}. ${node.name}\n\n`;
    markdown += `- **Type:** ${node.type}\n`;
    markdown += `- **ID:** \`${node.id}\`\n`;
    markdown += `- **Path:** ${node.path}\n`;

    if (node.dimensions) {
      markdown += `- **Dimensions:** ${node.dimensions.width} × ${node.dimensions.height}px\n`;
      markdown += `- **Position:** (${node.dimensions.x}, ${node.dimensions.y})\n`;
    }

    if (node.layout) {
      markdown += `- **Layout:** ${node.layout.mode}\n`;
      if (node.layout.spacing) {
        markdown += `  - Spacing: ${node.layout.spacing}px\n`;
      }
    }

    if (node.fills && node.fills.length > 0) {
      markdown += `- **Fills:**\n`;
      node.fills.forEach(fill => {
        if (fill.color) {
          markdown += `  - ${fill.color.hex} (${fill.color.rgba})\n`;
        } else if (fill.type.includes('GRADIENT')) {
          markdown += `  - ${fill.type}\n`;
        }
      });
    }

    if (node.strokes && node.strokes.length > 0) {
      markdown += `- **Strokes:**\n`;
      node.strokes.forEach(stroke => {
        if (stroke.color) {
          markdown += `  - ${stroke.color.hex} (${node.strokeWeight}px)\n`;
        }
      });
    }

    if (node.cornerRadius !== undefined) {
      markdown += `- **Corner Radius:** ${node.cornerRadius}px\n`;
    }

    if (node.text) {
      markdown += `- **Text:** "${node.text.content}"\n`;
      if (node.text.style) {
        markdown += `  - Font: ${node.text.style.fontFamily} ${node.text.style.fontWeight}\n`;
        markdown += `  - Size: ${node.text.style.fontSize}px\n`;
      }
    }

    if (node.children && node.children.length > 0) {
      markdown += `- **Children:** ${node.children.length} nodes\n`;
    }

    markdown += `\n`;
  });

  markdown += `## Next Steps\n\n`;
  markdown += `1. Review the extracted data in the JSON file\n`;
  markdown += `2. Identify components to convert to React\n`;
  markdown += `3. Map Figma properties to Tailwind CSS classes\n`;
  markdown += `4. Extract and export any image assets\n`;
  markdown += `5. Generate component code based on the structure\n\n`;

  markdown += `---\n`;
  markdown += `*Generated by extract-figma-rest-api.js at ${timestamp}*\n`;

  return markdown;
}

/**
 * Main extraction function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Figma Data Extractor via REST API
${'='.repeat(60)}

Usage:
  node scripts/extract-figma-rest-api.js <file-key-or-url> [node-ids]

Examples:
  # Extract entire file
  node scripts/extract-figma-rest-api.js abc123def456

  # Extract from URL
  node scripts/extract-figma-rest-api.js https://www.figma.com/file/abc123/Design

  # Extract specific nodes
  node scripts/extract-figma-rest-api.js abc123def456 1:2,1:3

Environment:
  FIGMA_API_KEY must be set in .env file
    `);
    process.exit(0);
  }

  let fileKey = args[0];
  const nodeIds = args[1] || null;

  // Extract file key from URL if provided
  if (fileKey.includes('figma.com')) {
    const match = fileKey.match(/\/file\/([a-zA-Z0-9]+)/);
    if (match) {
      fileKey = match[1];
      console.log(`🔗 Extracted file key from URL: ${fileKey}\n`);
    } else {
      console.error('❌ Could not extract file key from URL');
      process.exit(1);
    }
  }

  try {
    console.log(`🎨 Figma Data Extractor`);
    console.log(`${'='.repeat(60)}\n`);
    console.log(`📂 File Key: ${fileKey}`);
    if (nodeIds) {
      console.log(`🎯 Node IDs: ${nodeIds}\n`);
    }

    // Fetch file data
    const endpoint = nodeIds
      ? `/files/${fileKey}/nodes?ids=${nodeIds}`
      : `/files/${fileKey}`;

    const data = await fetchFigma(endpoint);

    // Extract nodes
    let extractedNodes = [];
    let fileData = { name: 'Unknown', version: null, lastModified: null };

    if (data.nodes) {
      // Specific nodes requested
      fileData.name = data.name || 'Figma File';
      Object.values(data.nodes).forEach(nodeWrapper => {
        if (nodeWrapper.document) {
          extractedNodes.push(extractNodeDetails(nodeWrapper.document));
        }
      });
    } else if (data.document) {
      // Full file - extract frames from pages
      fileData = {
        name: data.name,
        version: data.version,
        lastModified: data.lastModified
      };

      if (data.document.children) {
        data.document.children.forEach(page => {
          if (page.children) {
            page.children.forEach(frame => {
              extractedNodes.push(extractNodeDetails(frame));
            });
          }
        });
      }
    }

    console.log(`✅ Extracted ${extractedNodes.length} top-level nodes\n`);

    // Save files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const outputDir = path.join(process.cwd(), 'public', 'figma-imports');

    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save raw JSON
    const jsonFilename = `selection-${timestamp}.json`;
    const jsonPath = path.join(outputDir, jsonFilename);
    const jsonData = {
      metadata: {
        timestamp: new Date().toISOString(),
        fileKey: fileKey,
        fileName: fileData.name,
        version: fileData.version,
        extractedBy: 'extract-figma-rest-api.js'
      },
      file: fileData,
      nodes: extractedNodes
    };

    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    console.log(`💾 JSON saved: ${jsonPath}`);

    // Save markdown summary
    const mdFilename = `selection-${timestamp}.md`;
    const mdPath = path.join(outputDir, mdFilename);
    const markdown = generateMarkdownSummary(fileData, extractedNodes);
    fs.writeFileSync(mdPath, markdown);
    console.log(`📝 Summary saved: ${mdPath}\n`);

    // Print summary
    console.log(`${'='.repeat(60)}`);
    console.log(`EXTRACTION COMPLETE`);
    console.log(`${'='.repeat(60)}`);
    console.log(`File: ${fileData.name}`);
    console.log(`Top-level nodes: ${extractedNodes.length}`);

    const typeCounts = {};
    function countTypes(node) {
      typeCounts[node.type] = (typeCounts[node.type] || 0) + 1;
      if (node.children) {
        node.children.forEach(countTypes);
      }
    }
    extractedNodes.forEach(countTypes);

    console.log(`\nNode types:`);
    Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`);
      });
    console.log(`${'='.repeat(60)}\n`);

    console.log(`Next steps:`);
    console.log(`1. Review ${mdFilename} for detailed analysis`);
    console.log(`2. Inspect ${jsonFilename} for complete data`);
    console.log(`3. Use data to generate React components\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
