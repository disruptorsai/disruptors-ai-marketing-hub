# Figma MCP Import Instructions

## Status
This directory is set up to receive Figma selection data via MCP tools.

## MCP Server
- **URL**: http://127.0.0.1:3845/mcp
- **Expected Tools**:
  - `mcp__cursor-talk-to-figma__get_selection`
  - `mcp__cursor-talk-to-figma__read_my_design`
  - `mcp__figma-developer__*`

## Required Configuration

The Figma MCP server needs to be added to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${FIGMA_ACCESS_TOKEN}"
      }
    }
  }
}
```

## Expected Data Structure

### Selection Data
```json
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
```

## Files Generated
- `selection-[timestamp].json` - Raw selection data
- `IMPORT_SUMMARY.md` - Human-readable summary

## Next Steps
1. Ensure Figma MCP server is configured in `.cursor/mcp.json`
2. Set `FIGMA_ACCESS_TOKEN` environment variable
3. Use Claude Code with MCP tools to extract actual selection data
4. Data will be saved in this directory automatically

## Usage in React App
```javascript
import selectionData from '/figma-imports/selection-[timestamp].json';

// Access node data
const nodes = selectionData.selection.nodes;
const frames = nodes.filter(n => n.type === 'FRAME');
const components = nodes.filter(n => n.type === 'COMPONENT');
```

---
Generated: 2025-10-05T23:15:23.487Z
