# ANACHRON Lite Icon Generation System

## Overview

ANACHRON Lite is a minimal vector icon system for service graphics, designed for AI-generated service icons with a consistent, professional aesthetic.

## Style Guide

### Core Requirements

- **Style**: Simple flat vector icons, extremely minimal
- **Stroke**: 2px black outline only
- **Geometry**: Basic geometric shapes (circles, triangles, squares, lines)
- **Accent**: Single accent color per icon from approved palette
- **Background**: White (converted to transparent via post-processing)
- **Format**: 1024×1024 PNG, centered composition

### Approved Color Palette (Accents Only)

1. **Lapis Blue** `#2C6BAA`
   - Use for: Technology, automation, data, analytics

2. **Terracotta** `#C96F4C`
   - Use for: Communication, media, social, creative

3. **Verdigris Green** `#3C7A6A`
   - Use for: Growth, environment, discovery, sustainability

4. **Muted Gold** `#C9A53B`
   - Use for: Premium, strategy, leadership, excellence

### Negative Constraints

**Avoid these elements:**
- Textures
- Patterns (except minimal geometric)
- Gradients
- Shadows
- 3D effects
- Shading
- Ornate details
- Complex compositions
- Realistic rendering
- Photographic elements

## Generation Workflow

### 1. Generate Icon

Use Replicate Flux 1.1 Pro with carefully crafted prompts:

```javascript
import { generateImage } from '@/lib/ai-orchestrator'

const icon = await generateImage({
  prompt: `Simple flat vector icon: wrench and gear, 2px black stroke,
           minimal geometric design, #2C6BAA accent color, white background,
           extremely simple, clean lines, centered, icon style, no details, no texture`,
  model: 'flux-1.1-pro',
  size: '1024x1024'
})
```

### 2. Post-Process (Background Transparency)

Convert white background to transparent:

```bash
node scripts/make-backgrounds-transparent.js
```

This script:
- Reads PNG images
- Converts white (#FFFFFF) to transparent
- Preserves all other colors
- Outputs RGBA PNG format
- Target file size: 300-900KB

### 3. Verify Output

Check that the icon:
- ✓ Uses RGBA format (transparent background)
- ✓ Has 2px black stroke
- ✓ Uses single accent color from approved palette
- ✓ File size: 300-900KB
- ✓ Dimensions: 1024×1024 pixels
- ✓ Centered composition

## Example Prompts

### Technology Service

```
Simple flat vector icon: computer monitor with code brackets, 2px black stroke,
minimal geometric design, #2C6BAA accent color, white background,
extremely simple, clean lines, centered, icon style, no details, no texture
```

### Communication Service

```
Simple flat vector icon: speech bubble with sound waves, 2px black stroke,
minimal geometric design, #C96F4C accent color, white background,
extremely simple, clean lines, centered, icon style, no details, no texture
```

### Growth Service

```
Simple flat vector icon: upward arrow with plant sprout, 2px black stroke,
minimal geometric design, #3C7A6A accent color, white background,
extremely simple, clean lines, centered, icon style, no details, no texture
```

### Premium Service

```
Simple flat vector icon: crown with star, 2px black stroke,
minimal geometric design, #C9A53B accent color, white background,
extremely simple, clean lines, centered, icon style, no details, no texture
```

## Prompt Template

```
Simple flat vector icon: [SINGLE SHAPE DESCRIPTION], 2px black stroke,
minimal geometric design, [COLOR NAME] accent color [HEX CODE], white background,
extremely simple, clean lines, centered, icon style, no details, no texture
```

### Prompt Components

1. **Subject** - Single, simple subject (e.g., "wrench", "lightbulb", "rocket")
2. **Stroke** - Always "2px black stroke"
3. **Style** - Always "minimal geometric design"
4. **Color** - Single accent color with name and hex code
5. **Background** - Always "white background" (post-processed to transparent)
6. **Modifiers** - "extremely simple, clean lines, centered, icon style"
7. **Constraints** - "no details, no texture"

## Approved Model

**Replicate Flux 1.1 Pro**:
- Professional-grade vector output
- Consistent style adherence
- High-quality renders
- Reliable geometric shapes

## Scripts

### Generate Icons

```bash
npm run generate:service-images
```

Runs `scripts/generate-anachron-lite-replicate.js`:
- Reads service list
- Generates icons for each service
- Applies ANACHRON Lite style
- Saves to `public/images/services/`

### Make Backgrounds Transparent

```bash
node scripts/make-backgrounds-transparent.js
```

Post-processes generated icons:
- Converts white to transparent
- Preserves colors and alpha
- Outputs RGBA PNG
- Maintains quality

## File Organization

```
public/images/services/
├── seo-optimization.png           # ANACHRON Lite icon
├── web-design.png                 # ANACHRON Lite icon
├── content-marketing.png          # ANACHRON Lite icon
└── [service-name].png             # Pattern: kebab-case
```

## Quality Checklist

Before accepting an icon:

- [ ] Uses 2px black stroke
- [ ] Single accent color from approved palette
- [ ] Transparent background (RGBA)
- [ ] 1024×1024 dimensions
- [ ] Centered composition
- [ ] Extremely minimal (no extra details)
- [ ] Clean geometric shapes
- [ ] File size 300-900KB
- [ ] No gradients, shadows, or 3D effects
- [ ] Follows ANACHRON Lite aesthetic

## Usage in Components

```javascript
import seoIcon from '@/public/images/services/seo-optimization.png'

<img
  src={seoIcon}
  alt="SEO Optimization"
  className="w-24 h-24"
/>
```

## Regenerating Icons

If an icon doesn't meet standards:

1. Review the prompt
2. Adjust subject description (simpler is better)
3. Verify accent color hex code
4. Re-generate with Flux 1.1 Pro
5. Post-process for transparency
6. Verify against quality checklist

## Best Practices

1. **Keep it simple** - Single subject, minimal detail
2. **Use geometric shapes** - Circles, triangles, squares
3. **One accent color** - Choose from approved palette
4. **2px black stroke** - Consistent across all icons
5. **Post-process** - Always convert white to transparent
6. **Verify quality** - Check against quality checklist
7. **Consistent style** - All icons should feel cohesive

## Related Documentation

- `docs/brand/ANACHRON_Lite_Icon_System.md` - Complete style system
- `docs/brand/ANACHRON_Lite_GPT_Instructions.md` - GPT-specific instructions
- `docs/systems/AI_GENERATION.md` - AI generation orchestrator
- `scripts/generate-anachron-lite-replicate.js` - Generation script
- `scripts/make-backgrounds-transparent.js` - Post-processing script
