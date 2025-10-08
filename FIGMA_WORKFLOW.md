# Figma Asset Import Workflow

This guide explains how to retrieve selected assets from your Figma Desktop app and import them into the project.

## Quick Start

### Step 1: Select Items in Figma Desktop

1. Open your Figma Desktop app
2. Navigate to your design file
3. Select the items/assets you want to export (frames, components, images, etc.)

### Step 2: Get the Figma Link

**Option A: Copy Link (Recommended)**
1. Right-click on a selected item
2. Choose "Copy/Paste as" → "Copy link"
3. You'll get a URL like:
   ```
   https://www.figma.com/design/ABC123XYZ/File-Name?node-id=123-456
   ```

**Option B: Use Browser URL**
1. If viewing in Figma web, just copy the browser URL
2. Select the item to see its node-id in the URL

### Step 3: Parse the Link (Optional Helper)

If you want help parsing the Figma URL:

```bash
npm run figma:help "https://www.figma.com/design/..."
```

This will extract the FILE_KEY and NODE_ID for you.

### Step 4: Export Assets

Run the export script with your file key and node IDs:

```bash
npm run figma:export <FILE_KEY> <NODE_ID1> <NODE_ID2> ...
```

**Example:**
```bash
npm run figma:export ABC123XYZ 123:456 789:012
```

### Step 5: Find Your Assets

Exported assets will be saved to:
```
public/assets/figma-imports/
```

A manifest file will also be created:
```
public/assets/figma-imports/manifest.json
```

## Understanding Figma URLs

Figma URLs contain important information:

```
https://www.figma.com/design/FILE_KEY/File-Name?node-id=NODE_ID
                              ^^^^^^^^              ^^^^^^^
                              Use this              Use this
```

- **FILE_KEY**: Unique identifier for the Figma file (e.g., `ABC123XYZ`)
- **NODE_ID**: Identifier for a specific item in the file (e.g., `123-456`)
  - Note: In URLs, node IDs use hyphens (`123-456`)
  - In the API, they use colons (`123:456`)
  - The script handles this conversion automatically

## Exporting Multiple Items

To export multiple items at once:

1. **Option 1**: Get individual links for each item
   ```bash
   npm run figma:export FILE_KEY 123:456 789:012 345:678
   ```

2. **Option 2**: Use Figma's multi-select
   - Select multiple items
   - Copy links for each one
   - Extract all node IDs
   - Run the script with all node IDs

## Export Options

The export script uses these default settings:
- **Format**: PNG
- **Scale**: 2x (high resolution)
- **Background**: Transparent (for supported formats)

To customize, edit `scripts/figma-asset-retriever.js` and modify the `exportAssets()` options:

```javascript
const imageUrls = await exportAssets(fileKey, nodeIds, {
  format: 'png',  // Options: 'png', 'jpg', 'svg', 'pdf'
  scale: 2        // Options: 1, 2, 3, 4
});
```

## Output Structure

After export, you'll see:

```
public/assets/figma-imports/
├── component-name-123-456.png
├── frame-title-789-012.png
├── another-asset-345-678.png
└── manifest.json
```

The manifest.json contains:
```json
{
  "exportDate": "2025-10-05T...",
  "fileKey": "ABC123XYZ",
  "assets": [
    {
      "nodeId": "123:456",
      "name": "Component Name",
      "type": "COMPONENT",
      "filepath": "public/assets/figma-imports/component-name-123-456.png",
      "filename": "component-name-123-456.png"
    }
  ]
}
```

## Troubleshooting

### "No image URL for node: XXX"
- The node might not be exportable (e.g., it's a group or section)
- Try selecting a frame, component, or leaf node instead

### "Figma API error: 403"
- Check that the Figma API key in `mcp.json` is valid
- Ensure you have access to the file

### "Figma API error: 404"
- Verify the FILE_KEY is correct
- Check that the file still exists and you have access

### "Could not parse Figma URL"
- Ensure the URL is from figma.com
- Check that it contains both file key and node-id parameters

## Advanced: Using the Figma MCP Server

For more advanced workflows, you can use the Figma MCP server directly:

```bash
npx figma-developer-mcp --figma-api-key=$FIGMA_API_KEY
```

This provides additional tools for:
- Downloading multiple images at once
- Accessing file metadata
- Working with design tokens
- Batch operations

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run figma:help` | Show instructions and parse Figma URLs |
| `npm run figma:export <fileKey> <nodeIds...>` | Export assets from Figma |

## API Key Management

The Figma API key is stored in `mcp.json` at line 161:

```json
"figma": {
  "command": "npx",
  "args": [
    "-y",
    "figma-developer-mcp",
    "--figma-api-key=${FIGMA_API_KEY}",
    "--stdio"
  ]
}
```

**Security Note**: API keys in `mcp.json` should be kept secure. Consider using environment variables for production deployments.

## Limitations

**The Figma REST API cannot:**
- Directly access "currently selected items" from Figma Desktop
- Export items without knowing their node IDs
- Auto-detect what you're working on

**Workaround:**
This is why we use the "Copy Link" method - it gives us the exact node IDs we need to export the right items.

## Next Steps

After importing assets:

1. **Optimize images** (if needed):
   ```bash
   npm run optimize:images
   ```

2. **Import into your components**:
   ```jsx
   import myAsset from '/assets/figma-imports/component-name-123-456.png';
   ```

3. **Update manifest tracking**:
   - The manifest.json helps you track what was exported and when
   - Use it for asset management and auditing

## Support

For issues or questions:
- Check the [Figma API Documentation](https://www.figma.com/developers/api)
- Review the [figma-developer-mcp package](https://www.npmjs.com/package/figma-developer-mcp)
- Consult the project's main documentation

---

**Last Updated**: 2025-10-05
