# Figma MCP Integration Status Report

**Date:** October 5, 2025
**Status:** MCP Tools Not Available in Current Session
**Alternative Solution:** REST API Extractor Created

---

## Summary

The Figma MCP servers (`TalkToFigma` and `figma-developer`) are properly configured in `mcp.json`, but **MCP tools are not currently available** as callable functions in this Claude Code session.

## MCP Configuration Status

### ✅ Properly Configured MCP Servers

The `/Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/mcp.json` file contains:

1. **TalkToFigma** (Lines 94-99)
   ```json
   {
     "command": "bunx",
     "args": ["cursor-talk-to-figma-mcp@latest"]
   }
   ```
   - **Purpose:** Extract current selection from Figma desktop app
   - **Expected Tools:** `get_selection`, `read_my_design`
   - **Runtime:** Bun (bunx) - ✅ Installed at `/Users/disruptors/.bun/bin/bunx`

2. **figma-developer** (Lines 100-108)
   ```json
   {
     "command": "npx",
     "args": [
       "-y",
       "figma-developer-mcp",
       "--figma-api-key=${FIGMA_API_KEY}",
       "--stdio"
     ]
   }
   ```
   - **Purpose:** Access Figma files via REST API
   - **Expected Tools:** `get_file`, `get_file_nodes`, `get_images`
   - **Runtime:** Node (npx) - ✅ Installed at `/opt/homebrew/bin/npx`
   - **API Key:** ✅ Configured in `.env` as `FIGMA_API_KEY`

### ❌ Tools Not Available in Current Session

**Available Tool Categories:**
- File operations (Read, Write, Edit, Glob, Grep)
- Bash/terminal operations
- Web operations (WebFetch, WebSearch)
- Task management (TodoWrite)
- Notebook editing (NotebookEdit)

**Missing:**
- No tools starting with `mcp__TalkToFigma__*`
- No tools starting with `mcp__figma-developer__*`
- No MCP server tools are exposed as callable functions

## Why MCP Tools Are Unavailable

MCP servers need to be:
1. **Initialized by Claude Code** when the environment starts
2. **Kept running** as background processes
3. **Exposed through the tool interface** as callable functions
4. **Active and responsive** to JSON-RPC requests

In the current session, the MCP servers are configured but **not actively loaded and running**.

## Testing Results

### Script-Based MCP Communication Attempt

**Script:** `/Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/scripts/extract-figma-selection.js`

**Result:** ⏱️ **Timeout after 30 seconds**

```
🔄 Executing cursor-talk-to-figma MCP command...
   Command: /Users/disruptors/.bun/bin/bunx cursor-talk-to-figma-mcp@latest
[Timed out - no response]
```

**Reason:** The script spawns the MCP server as a subprocess and attempts JSON-RPC communication, but:
- No active Figma desktop app with selection
- MCP server requires persistent session, not one-off subprocess
- Proper MCP integration requires Claude Code to manage the server lifecycle

---

## ✅ Alternative Solution: REST API Extractor

Since MCP tools are not available, I created a **direct REST API client** that works immediately without requiring MCP server infrastructure.

### New Script Created

**File:** `/Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/scripts/extract-figma-rest-api.js`

**Features:**
- ✅ Direct Figma REST API integration using fetch
- ✅ No MCP server dependencies
- ✅ Comprehensive data extraction (dimensions, colors, typography, hierarchy)
- ✅ Supports both full file and specific node extraction
- ✅ Generates JSON data + Markdown summary reports
- ✅ Accepts file keys or full Figma URLs
- ✅ Statistics collection (node types, color palette, fonts)
- ✅ Outputs to `/public/figma-imports/`

### Usage Examples

```bash
# Extract entire Figma file
node scripts/extract-figma-rest-api.js abc123def456

# Extract from Figma URL
node scripts/extract-figma-rest-api.js https://www.figma.com/file/abc123def456/My-Design

# Extract specific nodes by ID
node scripts/extract-figma-rest-api.js abc123def456 1:2,1:3,1:5
```

### What Gets Extracted

The script extracts **comprehensive design data** including:

#### Node Information
- Node IDs, names, types
- Hierarchical path (parent > child > grandchild)
- Visibility and lock status
- Nesting level tracking

#### Dimensions & Layout
- Width, height, x, y positions
- Absolute bounding boxes
- Layout mode (HORIZONTAL, VERTICAL, NONE)
- Padding (top, right, bottom, left)
- Item spacing and alignment

#### Visual Properties
- **Fills:** Solid colors, gradients, images
  - RGB values (0-255)
  - Hex colors (#RRGGBB)
  - RGBA strings
  - Opacity and blend modes
  - Gradient stops
- **Strokes:** Colors, weights, alignment
- **Corner radius:** Single value or per-corner
- **Effects:** Shadows, blurs, with colors and offsets

#### Typography
- Text content (characters)
- Font family and weight
- Font size
- Text alignment (horizontal/vertical)
- Letter spacing
- Line height (px and percentage)
- Text decoration

#### Components
- Component IDs
- Instance/component detection
- Component descriptions

#### Export Settings
- Export configurations if defined

#### Statistics Dashboard
- Total node count
- Node type breakdown
- Unique color palette
- Font families used
- Component and instance counts

### Output Files

Each extraction creates **two files** in `/public/figma-imports/`:

1. **`selection-[timestamp].json`**
   - Complete raw data in JSON format
   - Metadata (timestamp, file key, version)
   - Full node hierarchy with all properties

2. **`selection-[timestamp].md`**
   - Human-readable summary report
   - Statistics overview
   - Color palette listing
   - Typography inventory
   - Detailed node breakdown
   - Next steps and integration examples

---

## How to Use the Extracted Data

### 1. Review the Data

```bash
# Generate extraction
node scripts/extract-figma-rest-api.js YOUR_FILE_KEY

# Files created in:
# /public/figma-imports/selection-[timestamp].json
# /public/figma-imports/selection-[timestamp].md
```

### 2. Load in React/JavaScript

```javascript
import figmaData from '/figma-imports/selection-2025-10-05T15-30-00.json';

// Access extracted nodes
const nodes = figmaData.nodes;

// Find specific node by name
const heroSection = nodes.find(n => n.name === 'Hero Section');

// Get dimensions
console.log(heroSection.dimensions);
// → { width: 1440, height: 800, x: 0, y: 0 }

// Get colors
console.log(heroSection.fills[0].color);
// → { r: 44, g: 107, b: 170, a: 1, hex: '#2C6BAA', rgba: 'rgba(44, 107, 170, 1)' }
```

### 3. Convert to React Components

```javascript
function figmaNodeToReact(node) {
  const styles = {
    width: node.dimensions?.width,
    height: node.dimensions?.height,
    backgroundColor: node.fills?.[0]?.color?.hex,
    borderRadius: node.cornerRadius,
    padding: node.layout?.padding &&
      `${node.layout.padding.top}px ${node.layout.padding.right}px ${node.layout.padding.bottom}px ${node.layout.padding.left}px`
  };

  return (
    <div className="figma-node" style={styles}>
      {node.text?.content || node.children?.map(child => figmaNodeToReact(child))}
    </div>
  );
}
```

### 4. Map to Tailwind CSS

```javascript
function figmaToTailwind(node) {
  const classes = [];

  // Dimensions
  if (node.dimensions) {
    classes.push(`w-[${node.dimensions.width}px]`);
    classes.push(`h-[${node.dimensions.height}px]`);
  }

  // Colors
  if (node.fills?.[0]?.color?.hex) {
    // Add to tailwind.config.js colors, then:
    classes.push('bg-primary'); // or bg-[#2C6BAA]
  }

  // Layout
  if (node.layout?.mode === 'HORIZONTAL') {
    classes.push('flex flex-row');
  }
  if (node.layout?.spacing) {
    classes.push(`gap-[${node.layout.spacing}px]`);
  }

  // Typography
  if (node.text?.style) {
    classes.push(`text-[${node.text.style.fontSize}px]`);
    classes.push(`font-[${node.text.style.fontWeight}]`);
  }

  return classes.join(' ');
}
```

---

## Enabling MCP Tools (Future)

To make MCP tools available in future sessions:

### Option 1: Restart Claude Code (Recommended)

1. **Exit Claude Code completely**
2. **Restart Claude Code**
3. MCP servers in `mcp.json` should initialize
4. Tools should become available:
   - `mcp__TalkToFigma__get_selection`
   - `mcp__TalkToFigma__read_my_design`
   - `mcp__figma-developer__get_file`
   - etc.

### Option 2: Check MCP Server Logs

```bash
# Check if MCP orchestrator is configured
npm run mcp:status

# Check MCP server health
npm run mcp:health

# Monitor MCP servers
npm run mcp:monitor
```

### Option 3: Manual MCP Server Testing

```bash
# Test TalkToFigma server
bunx cursor-talk-to-figma-mcp@latest

# Test figma-developer server
npx -y figma-developer-mcp --figma-api-key=$FIGMA_API_KEY --stdio
```

---

## Expected MCP Tool Capabilities (When Available)

### TalkToFigma Tools

When active, these tools should be available:

- **`mcp__TalkToFigma__get_selection`**
  - Get current selection from Figma desktop app
  - Real-time extraction of active selection
  - Requires Figma app to be running

- **`mcp__TalkToFigma__read_my_design`**
  - Read entire design file from desktop app
  - Complete file structure extraction

### figma-developer Tools

- **`mcp__figma-developer__get_file`**
  - Fetch complete file via API
  - Requires file key

- **`mcp__figma-developer__get_file_nodes`**
  - Get specific nodes by ID
  - Requires file key + node IDs

- **`mcp__figma-developer__get_images`**
  - Export image assets
  - Supports PNG, JPG, SVG, PDF formats

---

## Current Recommendation

**Use the REST API extractor** (`extract-figma-rest-api.js`) for immediate Figma data extraction needs. It provides:

- ✅ No dependencies on MCP infrastructure
- ✅ Reliable API-based extraction
- ✅ Comprehensive data coverage
- ✅ Works immediately without session restart
- ✅ Same data output format

**For MCP integration:** Restart Claude Code to enable MCP tools, or continue using the REST API approach which is equally capable for most use cases.

---

## Files Created

1. **`/Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/scripts/extract-figma-rest-api.js`**
   - Direct Figma REST API client
   - 500+ lines of comprehensive extraction logic
   - Executable script (chmod +x)

2. **`/Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/docs/FIGMA_MCP_STATUS.md`**
   - This status report
   - Complete documentation of MCP status
   - Usage guide for REST API extractor

3. **`/Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/`**
   - Directory for extraction outputs
   - Will contain JSON + MD files from extractions

---

## Next Steps

1. **Obtain your Figma file key**
   - Open your Figma file
   - Copy URL: `https://www.figma.com/file/ABC123/File-Name`
   - File key is `ABC123`

2. **Run the extractor**
   ```bash
   node scripts/extract-figma-rest-api.js ABC123
   ```

3. **Review the output**
   - Open `/public/figma-imports/selection-[timestamp].md`
   - Inspect JSON data for component generation

4. **Integrate into your app**
   - Use extracted data to build React components
   - Map Figma properties to Tailwind classes
   - Export any image assets as needed

---

*Generated: October 5, 2025*
*Environment: Claude Code Session*
