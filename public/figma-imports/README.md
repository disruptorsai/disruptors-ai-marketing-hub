# Figma Imports Directory

This directory contains extracted design data from Figma files for integration into the Disruptors AI Marketing Hub.

## Quick Start

```bash
# Extract a Figma file (replace with your file key)
./scripts/figma-quick-extract.sh YOUR_FILE_KEY

# Or use the full script with more options
node scripts/extract-figma-rest-api.js YOUR_FILE_KEY
```

## Getting Your File Key

1. Open your Figma file in the browser
2. Look at the URL: `https://www.figma.com/file/ABC123DEF456/My-Design-File`
3. The file key is `ABC123DEF456`

Or just paste the entire URL into the script - it will extract the key automatically.

## What Gets Extracted

Each extraction creates two files:

### 1. JSON Data File (`selection-[timestamp].json`)

Complete design data including:
- **Structure:** Node hierarchy, IDs, types, names
- **Dimensions:** Width, height, x/y positions
- **Layout:** Flex modes, padding, spacing, alignment
- **Colors:** Fills and strokes with hex/RGB values
- **Typography:** Font families, sizes, weights, line heights
- **Effects:** Shadows, blurs, corner radii
- **Components:** Component and instance metadata

### 2. Markdown Summary (`selection-[timestamp].md`)

Human-readable report with:
- Statistics overview (node counts, colors, fonts)
- Color palette listing
- Typography inventory
- Detailed node breakdown
- Integration examples

## Usage in React

### Basic Import

```javascript
import figmaData from '/figma-imports/selection-2025-10-05T15-30-00.json';

// Access metadata
console.log(figmaData.metadata);
// → { timestamp, fileKey, fileName, version, extractedBy }

// Access extracted nodes
const nodes = figmaData.nodes;

// Find a specific node by name
const heroSection = nodes.find(n => n.name === 'Hero Section');
```

### Convert to React Component

```javascript
function FigmaNode({ node }) {
  const style = {
    width: node.dimensions?.width,
    height: node.dimensions?.height,
    backgroundColor: node.fills?.[0]?.color?.hex,
    color: node.text?.style?.color,
    fontSize: node.text?.style?.fontSize,
    borderRadius: node.cornerRadius,
  };

  return (
    <div className={figmaToTailwind(node)} style={style}>
      {node.text?.content}
      {node.children?.map((child, i) => (
        <FigmaNode key={i} node={child} />
      ))}
    </div>
  );
}
```

### Map to Tailwind CSS

```javascript
function figmaToTailwind(node) {
  const classes = [];

  // Layout
  if (node.layout?.mode === 'HORIZONTAL') {
    classes.push('flex flex-row');
  } else if (node.layout?.mode === 'VERTICAL') {
    classes.push('flex flex-col');
  }

  // Spacing
  if (node.layout?.spacing) {
    classes.push(`gap-[${node.layout.spacing}px]`);
  }

  // Typography
  if (node.text?.style) {
    const { fontSize, fontWeight, fontFamily } = node.text.style;
    classes.push(`text-[${fontSize}px]`);
    classes.push(`font-[${fontWeight}]`);
  }

  // Padding
  if (node.layout?.padding) {
    const { top, right, bottom, left } = node.layout.padding;
    if (top === right && right === bottom && bottom === left) {
      classes.push(`p-[${top}px]`);
    } else {
      classes.push(`pt-[${top}px] pr-[${right}px] pb-[${bottom}px] pl-[${left}px]`);
    }
  }

  return classes.join(' ');
}
```

### Extract Colors for Tailwind Config

```javascript
import figmaData from '/figma-imports/selection-latest.json';

function extractColorPalette(nodes) {
  const colors = new Map();

  function traverse(node) {
    // Extract fill colors
    node.fills?.forEach(fill => {
      if (fill.color?.hex) {
        const colorName = node.name.toLowerCase().replace(/\s+/g, '-');
        colors.set(colorName, fill.color.hex);
      }
    });

    // Recurse children
    node.children?.forEach(traverse);
  }

  nodes.forEach(traverse);
  return Object.fromEntries(colors);
}

// Use in tailwind.config.js
const figmaColors = extractColorPalette(figmaData.nodes);

export default {
  theme: {
    extend: {
      colors: {
        ...figmaColors
      }
    }
  }
};
```

## Available Scripts

### Extract Entire File
```bash
./scripts/figma-quick-extract.sh https://www.figma.com/file/YOUR_FILE_KEY/Design
```

### Extract Specific Nodes
```bash
node scripts/extract-figma-rest-api.js YOUR_FILE_KEY 1:2,1:3,5:10
```

### Show Recent Extractions
```bash
ls -lt public/figma-imports/*.json | head -5
```

## File Naming Convention

Files are named with timestamps for version tracking:
- `selection-2025-10-05T15-30-00.json` - JSON data
- `selection-2025-10-05T15-30-00.md` - Summary report

To use the latest extraction:
```bash
# Create a symlink to the latest
ln -sf $(ls -1t public/figma-imports/*.json | head -1) public/figma-imports/latest.json
```

Then import:
```javascript
import latestFigma from '/figma-imports/latest.json';
```

## Data Structure Reference

```typescript
interface FigmaExtraction {
  metadata: {
    timestamp: string;
    fileKey: string;
    fileName: string;
    version: string;
    extractedBy: string;
  };
  file: {
    name: string;
    version: string;
    lastModified: string;
  };
  nodes: FigmaNode[];
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  path: string;
  level: number;
  visible: boolean;
  locked: boolean;
  dimensions?: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  layout?: {
    mode: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
    padding: { top: number; right: number; bottom: number; left: number };
    spacing: number;
    alignment: string;
    distribution: string;
  };
  fills?: Array<{
    type: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a: number;
      hex: string;
      rgba: string;
    };
    opacity: number;
  }>;
  strokes?: Array<{
    type: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a: number;
      hex: string;
    };
    opacity: number;
  }>;
  strokeWeight?: number;
  cornerRadius?: number;
  text?: {
    content: string;
    style: {
      fontFamily: string;
      fontSize: number;
      fontWeight: number;
      textAlignHorizontal: string;
      letterSpacing: number;
      lineHeightPx: number;
    };
  };
  children?: FigmaNode[];
  childrenCount?: number;
}
```

## Tips & Best Practices

### 1. Extract Regularly
Keep your design-to-code pipeline fresh by extracting after major Figma updates.

### 2. Use Semantic Naming
Name your Figma layers with meaningful names that translate well to component names:
- `Hero Section` → `<HeroSection />`
- `CTA Button Primary` → `<CTAButton variant="primary" />`

### 3. Organize by Pages
Extract different pages for different parts of your app:
```bash
node scripts/extract-figma-rest-api.js FILE_KEY 1:5  # Header components
node scripts/extract-figma-rest-api.js FILE_KEY 2:10 # Footer components
```

### 4. Version Control
Commit extraction JSON files to git for design version tracking.

### 5. Automate with npm Scripts
Add to `package.json`:
```json
{
  "scripts": {
    "figma:extract": "node scripts/extract-figma-rest-api.js",
    "figma:hero": "node scripts/extract-figma-rest-api.js YOUR_FILE_KEY 1:5",
    "figma:latest": "ln -sf $(ls -1t public/figma-imports/*.json | head -1) public/figma-imports/latest.json"
  }
}
```

## Troubleshooting

### Error: FIGMA_API_KEY not found
Add `FIGMA_API_KEY` to your `.env` file. Get an API key from:
1. Open Figma
2. Go to Settings → Account
3. Scroll to Personal Access Tokens
4. Generate new token

### Error: Figma API error 404
- Check that the file key is correct
- Ensure you have access to the file
- Verify the file isn't deleted

### Error: Figma API error 403
- Check that your API key is valid
- Ensure you have permission to access the file

### Empty extraction
- Verify the file has content
- Check that you're using the correct page/node IDs

## Related Documentation

- **Figma API Docs:** https://www.figma.com/developers/api
- **MCP Status:** `/docs/FIGMA_MCP_STATUS.md`
- **Project Architecture:** `/CLAUDE.md`

---

*Last updated: October 5, 2025*
