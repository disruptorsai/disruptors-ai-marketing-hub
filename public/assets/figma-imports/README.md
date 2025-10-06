# Figma Imports Directory

This directory contains assets exported from Figma using the project's Figma integration tools.

## Quick Import Guide

### 1. In Figma Desktop
- Select your asset(s)
- Right-click → "Copy/Paste as" → "Copy link"

### 2. Parse the Link
```bash
npm run figma:help "paste-your-link-here"
```

### 3. Export the Assets
```bash
npm run figma:export <FILE_KEY> <NODE_ID1> <NODE_ID2> ...
```

### 4. Find Your Files
Assets appear in this directory with a manifest.json tracking file.

## File Naming Convention

Exported files follow this pattern:
```
{node-name}-{node-id}.{format}
```

Example:
```
hero-image-123-456.png
logo-component-789-012.svg
```

## Manifest File

Each export creates/updates `manifest.json` with:
- Export timestamp
- Source file key
- Asset metadata (names, types, paths)

## Using in Code

```jsx
import asset from '/assets/figma-imports/your-asset-name-123-456.png';

function Component() {
  return <img src={asset} alt="Figma import" />;
}
```

For more details, see: `/FIGMA_WORKFLOW.md`
