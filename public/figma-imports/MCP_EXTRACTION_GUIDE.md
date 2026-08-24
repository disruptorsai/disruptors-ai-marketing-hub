# Figma MCP Extraction Guide

## Overview
This guide explains how to extract Figma selections using the configured MCP servers.

## MCP Servers Configured

### 1. cursor-talk-to-figma
**Status**: ✅ Ready
**Purpose**: Desktop app integration - extracts selections directly from Figma desktop app
**Command**: `/Users/disruptors/.bun/bin/bunx cursor-talk-to-figma-mcp@latest`

**Available Tools**:
- `get_selection` - Get currently selected layers in Figma desktop
- `read_my_design` - Read full design context from current file

### 2. figma-developer
**Status**: ✅ Ready
**Purpose**: API-based access using Figma API key
**API Key**: Configured in `.env` as `FIGMA_API_KEY`
**Command**: `npx -y figma-developer-mcp`

**Available Tools**:
- `get_file` - Get file data by file key
- `get_file_nodes` - Get specific nodes
- `get_images` - Export images from nodes
- `get_comments` - Get file comments
- And more...

## How to Extract Figma Selection

### Method 1: Using Claude Code (Recommended)

Since you're in a Claude Code environment with MCP access, you can directly invoke MCP tools:

1. **Open Figma Desktop App**
2. **Select the layers** you want to extract
3. **In Claude Code**, request:
   ```
   Use mcp__cursor-talk-to-figma__get_selection to get my current Figma selection
   ```

4. **Claude will**:
   - Invoke the MCP tool
   - Receive the selection data
   - Save it to `/public/figma-imports/selection-[timestamp].json`
   - Create an extraction report

### Method 2: Using Figma File Key

If you have a Figma file URL like:
```
https://www.figma.com/file/ABC123xyz/File-Name
```

The file key is: `ABC123xyz`

**Request in Claude Code**:
```
Use mcp__figma-developer__get_file with file_key "ABC123xyz" to extract Figma file data
```

### Method 3: Manual API Call

You can use the Figma API directly:

```bash
curl -H "X-Figma-Token: YOUR_API_KEY" \
  https://api.figma.com/v1/files/FILE_KEY
```

## Expected Data Structure

### Selection Data
```json
{
  "metadata": {
    "timestamp": "2025-10-05T23:30:00.000Z",
    "source": "figma-desktop-app",
    "extractedBy": "mcp-tool",
    "version": "1.0.0"
  },
  "selection": {
    "nodes": [
      {
        "id": "123:456",
        "name": "Button/Primary",
        "type": "COMPONENT",
        "absoluteBoundingBox": {
          "x": 100,
          "y": 200,
          "width": 120,
          "height": 48
        },
        "fills": [
          {
            "type": "SOLID",
            "color": {
              "r": 0.17,
              "g": 0.42,
              "b": 0.67,
              "a": 1
            }
          }
        ],
        "strokes": [],
        "effects": [],
        "children": [...]
      }
    ],
    "count": 1,
    "types": ["COMPONENT"]
  }
}
```

## Key Properties to Extract

### Visual Properties
- `absoluteBoundingBox` - Position and size (x, y, width, height)
- `fills` - Background colors, gradients, images
- `strokes` - Borders and outlines
- `effects` - Shadows, blurs, etc.
- `opacity` - Transparency
- `cornerRadius` - Rounded corners

### Layout Properties
- `layoutMode` - "HORIZONTAL", "VERTICAL", "NONE"
- `primaryAxisAlignItems` - Justify content
- `counterAxisAlignItems` - Align items
- `paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom`
- `itemSpacing` - Gap between children

### Text Properties
- `characters` - Text content
- `style.fontFamily` - Font name
- `style.fontSize` - Font size
- `style.fontWeight` - Weight (400, 700, etc.)
- `style.lineHeightPx` - Line height
- `style.letterSpacing` - Letter spacing
- `style.textAlignHorizontal` - "LEFT", "CENTER", "RIGHT"

### Component Properties
- `type` - "COMPONENT", "INSTANCE", "FRAME", etc.
- `componentProperties` - Variant properties
- `mainComponent` - Reference to main component
- `componentId` - Unique component ID

## Converting to React

### Example: Button Component

**Figma Data**:
```json
{
  "name": "Button/Primary",
  "type": "COMPONENT",
  "absoluteBoundingBox": { "width": 120, "height": 48 },
  "fills": [{ "color": { "r": 0.17, "g": 0.42, "b": 0.67 } }],
  "cornerRadius": 8,
  "paddingLeft": 24,
  "paddingRight": 24
}
```

**React Component**:
```jsx
export function PrimaryButton({ children, ...props }) {
  return (
    <button
      className="px-6 h-12 bg-[#2C6BAA] text-white rounded-lg
                 hover:bg-[#234F85] transition-colors"
      {...props}
    >
      {children}
    </button>
  );
}
```

### Mapping Colors

Figma RGB (0-1) to Hex:
```javascript
function rgbToHex(r, g, b) {
  const toHex = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Example: { r: 0.17, g: 0.42, b: 0.67 } => #2C6BAA
```

### Mapping Typography

```javascript
function getFontWeight(weight) {
  const mapping = {
    'Thin': 100,
    'Extra Light': 200,
    'Light': 300,
    'Regular': 400,
    'Medium': 500,
    'Semi Bold': 600,
    'Bold': 700,
    'Extra Bold': 800,
    'Black': 900
  };
  return mapping[weight] || 400;
}
```

## Export Images

### Using MCP Tool

```
Use mcp__figma-developer__get_images with:
- file_key: "YOUR_FILE_KEY"
- ids: ["123:456", "789:012"]
- format: "png"
- scale: 2
```

### Save Images

Images should be saved to:
```
/public/figma-imports/assets/
  ├── icons/
  ├── logos/
  ├── images/
  └── exports/
```

## Workflow Checklist

- [ ] Open Figma and select desired layers
- [ ] Request MCP extraction via Claude Code
- [ ] Review extracted JSON data
- [ ] Export any required images
- [ ] Map Figma properties to Tailwind classes
- [ ] Generate React component templates
- [ ] Test components in Storybook/app
- [ ] Document component props and usage

## Troubleshooting

### Desktop App Not Responding
1. Ensure Figma desktop app is running
2. Make sure layers are selected
3. Check that cursor-talk-to-figma MCP server is running
4. Try restarting Figma

### API Errors
1. Verify FIGMA_API_KEY in .env
2. Check file key is correct
3. Ensure you have file access permissions
4. Check API rate limits

### Empty Selection
1. Make sure something is selected in Figma
2. Try selecting a parent frame
3. Use `read_my_design` instead of `get_selection`

## File Structure

```
/public/figma-imports/
├── MCP_EXTRACTION_GUIDE.md          # This file
├── selection-[timestamp].json        # Extracted selection data
├── EXTRACTION_REPORT.md             # Extraction summary
└── assets/                          # Exported images
    ├── icons/
    ├── logos/
    └── images/
```

## Next Steps

1. **Extract your first selection** using Claude Code + MCP tools
2. **Review the data structure** in the saved JSON
3. **Export images** for any visual assets
4. **Create component mapping** from Figma to React
5. **Build a component library** based on your design system

---

**Last Updated**: 2025-10-05
**MCP Servers**: cursor-talk-to-figma, figma-developer
**Status**: Ready for extraction
