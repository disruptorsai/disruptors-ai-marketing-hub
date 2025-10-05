# Figma MCP Tools Guide

## Overview

Two Figma MCP servers are currently running:

1. **cursor-talk-to-figma-mcp** (v0.3.3)
2. **figma-developer-mcp** (v0.6.3)

## Running Processes

```bash
# cursor-talk-to-figma-mcp (PID 11483)
node /private/tmp/bunx-507-cursor-talk-to-figma-mcp@latest/node_modules/.bin/cursor-talk-to-figma-mcp

# figma-developer-mcp (PID 11479)
node /opt/homebrew/bin/figma-developer-mcp --figma-api-key=*** --stdio
```

## Expected MCP Tools

### From cursor-talk-to-figma-mcp

Based on the package name and common MCP patterns, expected tools:

- `mcp__cursor-talk-to-figma__get_selection` - Get current Figma selection
- `mcp__cursor-talk-to-figma__read_my_design` - Read design data
- `mcp__cursor-talk-to-figma__get_file` - Get entire file data
- `mcp__cursor-talk-to-figma__get_node` - Get specific node by ID

### From figma-developer-mcp

Based on the package description ("Give your coding agent access to your Figma data"):

- `mcp__figma-developer__get_file` - Retrieve Figma file data
- `mcp__figma-developer__get_node` - Get specific node details
- `mcp__figma-developer__export_assets` - Export images/assets
- `mcp__figma-developer__get_styles` - Get design tokens/styles
- `mcp__figma-developer__get_components` - Get component library

## How to Use (With Claude Code MCP Access)

### 1. Get Current Selection

```javascript
// Using cursor-talk-to-figma-mcp
const selection = await mcp__cursor_talk_to_figma__get_selection();

// Expected response structure:
{
  "selection": {
    "nodes": [
      {
        "id": "123:456",
        "name": "Frame Name",
        "type": "FRAME",
        "visible": true,
        "locked": false,
        "absoluteBoundingBox": {
          "x": 100,
          "y": 100,
          "width": 375,
          "height": 812
        },
        "fills": [...],
        "strokes": [...],
        "effects": [...],
        "children": [...]
      }
    ]
  }
}
```

### 2. Read Design Data

```javascript
// Get comprehensive design data
const design = await mcp__cursor_talk_to_figma__read_my_design();

// Expected response includes:
// - All frames and their hierarchy
// - Text content and styles
// - Colors and fills
// - Components and instances
// - Constraints and layout
```

### 3. Export Assets

```javascript
// Using figma-developer-mcp
const assets = await mcp__figma_developer__export_assets({
  nodeIds: ["123:456", "789:012"],
  format: "png",
  scale: 2
});

// Returns URLs or base64 data for exported images
```

## Configuration Files

### .cursor/mcp.json (Add this configuration)

```json
{
  "mcpServers": {
    "cursor-talk-to-figma": {
      "command": "npx",
      "args": ["-y", "cursor-talk-to-figma-mcp@latest"]
    },
    "figma-developer": {
      "command": "npx",
      "args": [
        "-y",
        "figma-developer-mcp@latest",
        "--figma-api-key=${FIGMA_ACCESS_TOKEN}",
        "--stdio"
      ],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${FIGMA_ACCESS_TOKEN}"
      }
    }
  }
}
```

### Environment Variables (.env)

```bash
# Get your Figma API token from:
# https://www.figma.com/developers/api#access-tokens
FIGMA_ACCESS_TOKEN=figd_your_token_here
```

## Data Extraction Workflow

### Step 1: Select in Figma
1. Open your Figma file
2. Select the elements you want to extract
3. The MCP server will detect the selection

### Step 2: Extract Data (Via Claude Code)
```javascript
// Example Claude Code prompt:
"Use the Figma MCP tools to get my current selection and save it to
/Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/selection-[timestamp].json"
```

### Step 3: Process in React
```javascript
import figmaData from '/figma-imports/selection-2025-10-05.json';

// Use the data
const frames = figmaData.selection.nodes.filter(n => n.type === 'FRAME');
const colors = extractColors(figmaData);
const typography = extractTextStyles(figmaData);
```

## Expected Data Structure

### Node Object
```typescript
interface FigmaNode {
  id: string;
  name: string;
  type: NodeType;
  visible: boolean;
  locked: boolean;

  // Position & Size
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  // Styling
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  strokeAlign?: "INSIDE" | "OUTSIDE" | "CENTER";
  cornerRadius?: number;

  // Text Properties (if type === "TEXT")
  characters?: string;
  style?: TextStyle;
  characterStyleOverrides?: number[];

  // Layout
  layoutMode?: "NONE" | "HORIZONTAL" | "VERTICAL";
  primaryAxisSizingMode?: "FIXED" | "AUTO";
  counterAxisSizingMode?: "FIXED" | "AUTO";
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;

  // Hierarchy
  children?: FigmaNode[];

  // Component
  componentId?: string;
  componentProperties?: Record<string, any>;
}
```

### Paint Object
```typescript
interface Paint {
  type: "SOLID" | "GRADIENT_LINEAR" | "GRADIENT_RADIAL" | "IMAGE";
  visible?: boolean;
  opacity?: number;
  color?: RGB;
  gradientStops?: ColorStop[];
  imageRef?: string;
}

interface RGB {
  r: number; // 0-1
  g: number; // 0-1
  b: number; // 0-1
}
```

### Text Style Object
```typescript
interface TextStyle {
  fontFamily: string;
  fontPostScriptName?: string;
  fontSize: number;
  fontWeight: number;
  lineHeightPx: number;
  lineHeightPercent?: number;
  letterSpacing: number;
  textAlignHorizontal: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
  textAlignVertical: "TOP" | "CENTER" | "BOTTOM";
}
```

## Utility Functions for React

### Extract Colors
```javascript
function extractColors(figmaData) {
  const colors = new Set();

  function traverse(node) {
    if (node.fills) {
      node.fills.forEach(fill => {
        if (fill.type === "SOLID" && fill.color) {
          const { r, g, b } = fill.color;
          const hex = rgbToHex(r, g, b);
          colors.add(hex);
        }
      });
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  figmaData.selection.nodes.forEach(traverse);
  return Array.from(colors);
}

function rgbToHex(r, g, b) {
  const toHex = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
```

### Extract Typography
```javascript
function extractTextStyles(figmaData) {
  const textStyles = [];

  function traverse(node) {
    if (node.type === "TEXT" && node.style) {
      textStyles.push({
        text: node.characters,
        fontFamily: node.style.fontFamily,
        fontSize: node.style.fontSize,
        fontWeight: node.style.fontWeight,
        lineHeight: node.style.lineHeightPx,
        letterSpacing: node.style.letterSpacing
      });
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  figmaData.selection.nodes.forEach(traverse);
  return textStyles;
}
```

### Extract Layout Information
```javascript
function extractLayoutInfo(figmaData) {
  return figmaData.selection.nodes.map(node => ({
    id: node.id,
    name: node.name,
    type: node.type,
    dimensions: {
      width: node.absoluteBoundingBox?.width || 0,
      height: node.absoluteBoundingBox?.height || 0,
      x: node.absoluteBoundingBox?.x || 0,
      y: node.absoluteBoundingBox?.y || 0
    },
    layout: {
      mode: node.layoutMode,
      padding: {
        top: node.paddingTop || 0,
        right: node.paddingRight || 0,
        bottom: node.paddingBottom || 0,
        left: node.paddingLeft || 0
      },
      itemSpacing: node.itemSpacing || 0
    }
  }));
}
```

## Troubleshooting

### MCP Server Not Responding
```bash
# Check if servers are running
ps aux | grep figma

# Restart cursor-talk-to-figma-mcp
npx -y cursor-talk-to-figma-mcp@latest

# Restart figma-developer-mcp
npx -y figma-developer-mcp@latest --figma-api-key=$FIGMA_ACCESS_TOKEN --stdio
```

### No Selection Detected
1. Ensure Figma app is running
2. Make sure elements are selected in Figma
3. Check that MCP server has permission to access Figma

### Export Fails
1. Verify FIGMA_ACCESS_TOKEN is valid
2. Check that nodes have export settings
3. Ensure node IDs are correct

## Next Steps

1. **Manual Extraction**: Use Claude Code with MCP tool access to manually call the tools
2. **Automation**: Create a workflow that automatically exports selection on change
3. **Integration**: Build React components that consume the extracted data
4. **Live Sync**: Set up real-time sync between Figma and your React app

---

Generated: 2025-10-05
MCP Servers Detected: cursor-talk-to-figma-mcp (v0.3.3), figma-developer-mcp (v0.6.3)
