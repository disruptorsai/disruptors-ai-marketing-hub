# Extract Figma Selection with MCP Tools

This guide shows how to use Claude Code with MCP tool access to extract actual Figma data.

## Prerequisites

1. **Figma MCP servers are running** (verified ✅)
   - cursor-talk-to-figma-mcp v0.3.3 (PID: 11483)
   - figma-developer-mcp v0.6.3 (PID: 11479)

2. **Figma is open** with your design file

3. **Elements are selected** in Figma

## Method 1: Using cursor-talk-to-figma-mcp

### Step 1: Get Current Selection

Ask Claude Code (with MCP access):

```
Use the mcp__cursor-talk-to-figma__get_selection tool to get my current Figma selection
```

### Step 2: Save the Data

Ask Claude Code:

```
Take the Figma selection data and save it to:
/Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/selection-2025-10-05-[HH-MM].json

Include metadata with:
- timestamp
- selection count
- node types
- extracted colors
- typography info
```

### Step 3: Generate Summary

Ask Claude Code:

```
Analyze the Figma selection data and create a detailed summary at:
/Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/IMPORT_SUMMARY.md

Include:
- Number of items selected
- Types of items (frames, components, text, etc.)
- Color palette extracted
- Typography system (fonts, sizes, weights)
- Layout information (dimensions, spacing)
- Exportable assets list
- React integration examples
```

## Method 2: Using figma-developer-mcp

### Get Entire File

```
Use the mcp__figma-developer__get_file tool to get the entire Figma file data
```

### Get Specific Node

```
Use the mcp__figma-developer__get_node tool with node ID "123:456" to get detailed node data
```

### Export Assets

```
Use the mcp__figma-developer__export_assets tool to export:
- Node IDs: ["456:790", "123:456"]
- Format: PNG
- Scale: 2x
```

## Combined Workflow

### Complete Extraction Command

Ask Claude Code:

```
I need to extract my current Figma selection. Please:

1. Use the Figma MCP tools (cursor-talk-to-figma or figma-developer) to get my current selection

2. Save the complete data to:
   /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/selection-2025-10-05-[timestamp].json

3. Extract and save:
   - All node data (IDs, names, types, dimensions)
   - All colors and fills
   - All text content and typography
   - Layout information (padding, spacing, alignment)
   - Component properties if any
   - Hierarchy/nesting structure

4. Create a summary document at:
   /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/selection-summary-[timestamp].md

5. List any exportable assets (SVGs, PNGs) with their IDs

6. Generate React component examples showing how to use this data
```

## Expected MCP Tools

Based on the running servers, these tools should be available:

### cursor-talk-to-figma-mcp
- `mcp__cursor-talk-to-figma__get_selection`
- `mcp__cursor-talk-to-figma__read_my_design`
- `mcp__cursor-talk-to-figma__get_file`
- `mcp__cursor-talk-to-figma__get_node`

### figma-developer-mcp
- `mcp__figma-developer__get_file`
- `mcp__figma-developer__get_node`
- `mcp__figma-developer__export_assets`
- `mcp__figma-developer__get_styles`
- `mcp__figma-developer__get_components`

## Data Structure to Extract

Ensure the extraction includes:

```json
{
  "metadata": {
    "timestamp": "ISO-8601",
    "fileKey": "figma-file-key",
    "fileName": "Design System Name",
    "extractedBy": "MCP tool name",
    "selectionCount": 5
  },
  "selection": {
    "nodes": [
      {
        "id": "123:456",
        "name": "Node Name",
        "type": "FRAME|COMPONENT|TEXT|etc",
        "visible": true,
        "locked": false,
        "absoluteBoundingBox": {
          "x": 0,
          "y": 0,
          "width": 100,
          "height": 100
        },
        "fills": [...],
        "strokes": [...],
        "effects": [...],
        "cornerRadius": 0,
        "layoutMode": "NONE|HORIZONTAL|VERTICAL",
        "paddingLeft": 0,
        "paddingRight": 0,
        "paddingTop": 0,
        "paddingBottom": 0,
        "itemSpacing": 0,
        "children": [...],
        "style": {...},
        "characters": "...",
        "componentProperties": {...}
      }
    ],
    "summary": {
      "totalNodes": 5,
      "nodeTypes": { "FRAME": 3, "TEXT": 2 },
      "colors": ["#2C6BAA", "#FFFFFF"],
      "fonts": [{ "family": "Inter", "weights": [400, 600, 700] }],
      "exportableAssets": [...]
    }
  }
}
```

## Troubleshooting

### "No MCP tools found"
- Verify Figma MCP servers are running: `ps aux | grep figma`
- Check MCP configuration in `.cursor/mcp.json`
- Restart the MCP servers if needed

### "No selection detected"
- Ensure elements are actually selected in Figma
- Try reselecting the elements
- Make sure Figma app is in focus

### "Permission denied"
- Verify FIGMA_ACCESS_TOKEN is set correctly
- Check that the token has proper permissions
- Generate a new token if needed: https://www.figma.com/developers/api#access-tokens

## Verification

After extraction, verify the data:

```bash
# Check file exists and size
ls -lh /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/selection-*.json

# Preview the data
head -50 /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/selection-*.json

# Count nodes
jq '.selection.nodes | length' /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/selection-*.json
```

## Next Steps After Extraction

1. **Review the data** - Check that all expected elements are present
2. **Generate design tokens** - Extract colors, typography, spacing
3. **Build React components** - Use the provided examples
4. **Test in app** - Import and verify the components work
5. **Set up automation** - Create a workflow for continuous sync

## Quick Reference Commands

```bash
# List all extractions
ls -lt /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/*.json

# View latest extraction
cat /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/selection-*.json | jq '.'

# Extract just the colors
cat /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/selection-*.json | jq '.selection.summary.colors'

# Count different node types
cat /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/selection-*.json | jq '.selection.summary.nodeTypes'
```

---

**Note:** This is a guide for using Claude Code with MCP tool access. The commands assume you're interacting with Claude Code in an environment where MCP tools are available.

The MCP servers are confirmed running. You just need to use Claude Code with MCP access to invoke the tools!
