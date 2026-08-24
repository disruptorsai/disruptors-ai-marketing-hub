# Claude Code + Figma MCP: Quick Start

This document provides **copy-paste commands** for Claude Code to extract Figma selections using the configured MCP tools.

---

## ✅ Prerequisites Confirmed

- [x] **cursor-talk-to-figma** MCP server: Ready
- [x] **figma-developer** MCP server: Ready
- [x] **FIGMA_API_KEY**: Configured in `.env`
- [x] **Import directory**: `/public/figma-imports/` created
- [x] **MCP status**: Verified (both servers operational)

---

## 🎯 Method 1: Extract Current Selection (Desktop App)

**Use this when**: You have Figma desktop app open with layers selected

### Steps:

1. **Open Figma desktop app**
2. **Select the layers** you want to extract (should have blue selection outline)
3. **Copy and paste this to Claude Code**:

```
Please extract my current Figma selection using the MCP tool:

1. Invoke: mcp__cursor-talk-to-figma__get_selection
2. Parse the returned data
3. Save to: /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/selection-TIMESTAMP.json
   (where TIMESTAMP is the current date/time in format YYYY-MM-DD-HHmmss)
4. Create a summary report at: /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/EXTRACTION_SUMMARY_TIMESTAMP.md
   Including:
   - Number of nodes extracted
   - Node types (FRAME, COMPONENT, TEXT, etc.)
   - Key properties found (colors, dimensions, typography)
   - List of any images that could be exported
   - Suggested React component structure

Show me the file paths where data was saved and a summary of what was extracted.
```

---

## 🌐 Method 2: Extract Entire File (API)

**Use this when**: You have a Figma file URL and want the complete file data

### Steps:

1. **Get your Figma file key** from the URL:
   ```
   https://www.figma.com/file/ABC123xyz/File-Name
                                ^^^^^^^^^^
                                This is your file key
   ```

2. **Copy and paste this to Claude Code** (replace FILE_KEY):

```
Please extract Figma file data using the API:

1. Invoke: mcp__figma-developer__get_file
   With arguments: { "file_key": "FILE_KEY" }
2. Parse the complete file structure
3. Save to: /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/file-FILE_KEY-TIMESTAMP.json
4. Create a comprehensive report at: /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/FILE_ANALYSIS_TIMESTAMP.md
   Including:
   - File metadata (name, version, lastModified)
   - Page structure (number of pages, page names)
   - Component inventory (all components and their variants)
   - Style library (colors, text styles, effects)
   - Asset catalog (all images and exportable elements)
   - Suggested component architecture for React

Show me the file paths and a high-level summary.
```

---

## 🖼️ Method 3: Export Specific Images

**Use this when**: You want to export images from specific Figma nodes

### Steps:

1. **Get the file key and node IDs**:
   - File key from URL (see Method 2)
   - Node IDs from a previous extraction or from Figma (right-click → Copy/Paste as → Copy Link)

2. **Copy and paste this to Claude Code**:

```
Please export images from Figma:

1. Invoke: mcp__figma-developer__get_images
   With arguments: {
     "file_key": "FILE_KEY",
     "ids": ["NODE_ID_1", "NODE_ID_2"],
     "format": "png",
     "scale": 2
   }
2. Download each returned image URL
3. Save images to: /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/assets/
   With descriptive filenames based on node names
4. Create an image inventory at: /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/IMAGES_EXPORTED_TIMESTAMP.md
   Listing:
   - Node ID → Filename mapping
   - Image dimensions
   - File sizes
   - Suggested usage (icon, logo, background, etc.)

Show me what was exported and where files were saved.
```

---

## 🔄 Method 4: Full Design System Extraction

**Use this when**: You want to extract an entire design system (colors, typography, components)

### Copy and paste this to Claude Code:

```
Please perform a complete design system extraction from Figma:

STEP 1: Extract file structure
- Use: mcp__figma-developer__get_file with file_key "FILE_KEY"
- Focus on: Components page, Styles page, Design tokens

STEP 2: Parse design tokens
- Extract all color styles (name, hex value, opacity)
- Extract all text styles (font family, size, weight, line height, letter spacing)
- Extract all effect styles (shadows, blurs)
- Extract all grid/layout styles

STEP 3: Inventory components
- List all component sets and variants
- Map component properties and values
- Identify reusable patterns (buttons, cards, inputs, etc.)

STEP 4: Generate design system files
Save to /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/design-system/:
- colors.json (all color tokens with names and values)
- typography.json (text styles mapped to Tailwind classes)
- components-inventory.json (component catalog)
- spacing.json (padding, margin, gap patterns)

STEP 5: Create Tailwind config
Generate a tailwind.config.js extension with:
- Custom colors matching Figma
- Font families and sizes
- Spacing scale
- Border radius values
- Shadow styles

STEP 6: Generate React component templates
For each major component, create a template in:
/Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/public/figma-imports/component-templates/
- Button.jsx (all variants)
- Card.jsx
- Input.jsx
- etc.

Show me:
1. File structure created
2. Number of tokens/styles extracted
3. Component inventory summary
4. Sample of generated component code
```

---

## 📊 Method 5: Quick Selection Summary (No Save)

**Use this when**: You just want to see what's selected without saving files

### Copy and paste this to Claude Code:

```
Please give me a quick summary of my current Figma selection:

1. Invoke: mcp__cursor-talk-to-figma__get_selection
2. Analyze the data and tell me:
   - How many nodes are selected
   - What types (FRAME, COMPONENT, TEXT, etc.)
   - Dimensions of each top-level node
   - Color palette used (unique colors)
   - Font families used
   - Any components or instances

Don't save files, just show me the summary.
```

---

## 🛠️ Troubleshooting Commands

### Check MCP Server Status

```
Please check the status of Figma MCP servers:

Run: npm run mcp:status

Look for these servers:
- cursor-talk-to-figma (should be "ready")
- figma-developer (should be "ready")

If either shows "error", run: npm run mcp:start
```

### Verify Environment Variables

```
Please verify Figma configuration:

1. Check .env file contains FIGMA_API_KEY
2. Verify the key starts with "figd_"
3. Check mcp.json contains both cursor-talk-to-figma and figma-developer servers
4. Confirm import directory exists: /public/figma-imports/
```

### Test Desktop App Connection

```
Please test the Figma desktop app connection:

1. Check if Figma is running: npm run figma:status
2. Try invoking: mcp__cursor-talk-to-figma__read_my_design
3. If it returns data, desktop connection is working
4. If it fails, ensure Figma app is open and a file is active
```

---

## 💡 Pro Tips

### Efficient Extraction Workflow

1. **Start broad**: Extract entire file first to understand structure
2. **Identify components**: Look for component sets and instances
3. **Extract selections**: Select specific components and extract individually
4. **Export images**: Export any raster images or complex graphics
5. **Map to React**: Create component templates based on extracted structure

### Best Practices

- **Name things clearly** in Figma - names become component/prop names
- **Use Auto Layout** - maps directly to Flexbox/Grid in React
- **Create components** - not just frames - for reusability
- **Define variants** - become React props and states
- **Use styles** - color/text styles become design tokens

### React Conversion Tips

| Figma Feature | React/Tailwind Equivalent |
|---------------|---------------------------|
| Auto Layout (Horizontal) | `flex flex-row` |
| Auto Layout (Vertical) | `flex flex-col` |
| Space Between | `justify-between` |
| Padding | `p-4` (4 × 4px) |
| Gap (8px) | `gap-2` (2 × 4px) |
| Corner Radius (8px) | `rounded-lg` |
| Fill (color) | `bg-[#HEX]` |
| Text Color | `text-[#HEX]` |
| Font Size (16px) | `text-base` |
| Font Weight (700) | `font-bold` |

---

## 📁 Output File Structure

After extractions, you'll have:

```
/public/figma-imports/
├── selection-2025-10-05-143022.json       # Raw selection data
├── file-ABC123-2025-10-05-143045.json     # Complete file data
├── EXTRACTION_SUMMARY_2025-10-05.md       # What was extracted
├── design-system/                         # Design tokens
│   ├── colors.json
│   ├── typography.json
│   ├── spacing.json
│   └── components-inventory.json
├── component-templates/                    # React components
│   ├── Button.jsx
│   ├── Card.jsx
│   └── Input.jsx
└── assets/                                # Exported images
    ├── icons/
    ├── logos/
    └── images/
```

---

## 🎯 Quick Reference: MCP Tool Names

Copy these exact tool names when invoking manually:

**Desktop App Tools** (cursor-talk-to-figma):
- `mcp__cursor-talk-to-figma__get_selection`
- `mcp__cursor-talk-to-figma__read_my_design`

**API Tools** (figma-developer):
- `mcp__figma-developer__get_file`
- `mcp__figma-developer__get_file_nodes`
- `mcp__figma-developer__get_images`
- `mcp__figma-developer__get_comments`
- `mcp__figma-developer__post_comment`

---

## ⚡ Common Use Cases

### "I want to build this exact button from Figma"

```
Select the button in Figma, then:

Please extract this button component and create a React component:
1. Extract selection (mcp__cursor-talk-to-figma__get_selection)
2. Analyze dimensions, colors, typography, padding
3. Map to Tailwind classes
4. Generate Button.jsx with all variants
5. Include prop types and usage examples
```

### "I need all the colors from our design system"

```
Please extract all color styles from file key "FILE_KEY":
1. Get file (mcp__figma-developer__get_file)
2. Extract all color styles
3. Convert RGB to hex
4. Generate colors.json and Tailwind config extension
5. Create a visual color palette component for testing
```

### "Export our logo in all sizes"

```
Please export our logo:
1. Find logo node in file "FILE_KEY" (search for "logo" in name)
2. Export in PNG at scales: 1x, 2x, 3x, 4x
3. Also export as SVG
4. Save to /public/figma-imports/assets/logos/
5. Create an index.js that imports all versions
```

---

## 🚀 Ready to Start?

**Copy one of the methods above and paste it into Claude Code!**

The MCP servers are ready and waiting. Choose your extraction method based on what you need:

- **Method 1**: Quick selection extraction (most common)
- **Method 2**: Complete file analysis
- **Method 3**: Export specific images
- **Method 4**: Full design system extraction (most comprehensive)
- **Method 5**: Quick peek without saving

---

**Last Updated**: 2025-10-05
**Status**: ✅ Ready for extraction
**MCP Servers**: Operational
**Next Action**: Copy a command above and paste it to Claude Code
