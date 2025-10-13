# Cloudinary Favicon URLs Reference

Quick reference for all optimized favicon assets served via Cloudinary CDN.

## Base Configuration

**Cloudinary Cloud**: `dvcvxhzmt`
**Asset Location**: `favicons/dm-favicon`
**Version**: `v1760392297`

---

## Direct URLs

### PNG Favicons (All Sizes)

#### 256x256px (14.23 KB)
```
https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_256,q_auto:best,w_256/v1/favicons/dm-favicon.png
```

#### 128x128px (4.72 KB)
```
https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_128,q_auto:best,w_128/v1/favicons/dm-favicon.png
```

#### 64x64px (2.12 KB)
```
https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_64,q_auto:best,w_64/v1/favicons/dm-favicon.png
```

#### 48x48px (1.64 KB)
```
https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_48,q_auto:best,w_48/v1/favicons/dm-favicon.png
```

#### 32x32px (1.24 KB)
```
https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.png
```

#### 16x16px (0.41 KB)
```
https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_16,q_auto:best,w_16/v1/favicons/dm-favicon.png
```

### ICO Format (9.44 KB)
```
https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,h_48,q_auto:best,w_48/v1/favicons/dm-favicon.ico
```

---

## Alternative Formats

### WebP Variants (Explicit)
For browsers that support WebP, force WebP delivery:

```
# 256x256 WebP
https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_webp,h_256,q_auto:best,w_256/v1/favicons/dm-favicon.webp

# 128x128 WebP
https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_webp,h_128,q_auto:best,w_128/v1/favicons/dm-favicon.webp

# 64x64 WebP
https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_webp,h_64,q_auto:best,w_64/v1/favicons/dm-favicon.webp

# 32x32 WebP
https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_webp,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.webp
```

### AVIF Variants (Next-Gen)
For cutting-edge compression (50%+ smaller than PNG):

```
# 256x256 AVIF
https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_avif,h_256,q_auto:best,w_256/v1/favicons/dm-favicon.avif

# 128x128 AVIF
https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_avif,h_128,q_auto:best,w_128/v1/favicons/dm-favicon.avif

# 32x32 AVIF
https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_avif,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.avif
```

---

## URL Anatomy

### Standard Pattern
```
https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{version}/{folder}/{public_id}.{format}
```

### Transformation Components

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `c_fill` | Crop mode | Fill dimensions while maintaining aspect ratio |
| `f_auto` | Format | Automatic format selection (PNG/WebP based on browser) |
| `f_webp` | Format | Force WebP format |
| `f_avif` | Format | Force AVIF format |
| `h_XXX` | Height | Target height in pixels |
| `w_XXX` | Width | Target width in pixels |
| `q_auto:best` | Quality | Best automatic quality optimization |
| `v1` | Version | Cache-busting version identifier |

---

## Advanced Transformations

### Dark Mode Variant
Invert colors for dark theme compatibility:

```
# 32x32 Dark Mode
https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,e_negate,f_auto,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.png
```

### High Contrast
Boost contrast for accessibility:

```
# 32x32 High Contrast
https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,e_contrast:50,f_auto,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.png
```

### Blur Effect (Loading Placeholder)
Create blur-up placeholder:

```
# 32x32 Blurred
https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,e_blur:300,f_auto,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.png
```

### Custom Colors
Apply color overlay:

```
# 32x32 Blue Tint
https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,e_colorize:50,co_rgb:0066ff,f_auto,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.png
```

---

## Responsive Image Implementation

### Picture Element (Multi-Format)
```html
<picture>
  <!-- AVIF for modern browsers -->
  <source type="image/avif"
    srcset="https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_avif,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.avif">

  <!-- WebP for supporting browsers -->
  <source type="image/webp"
    srcset="https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_webp,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.webp">

  <!-- PNG fallback -->
  <img src="https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.png"
    alt="Disruptors AI Favicon"
    width="32"
    height="32">
</picture>
```

### Srcset for Device Pixel Ratio
```html
<link rel="icon"
  type="image/png"
  sizes="32x32"
  href="https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.png"
  srcset="https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.png 1x,
          https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_64,q_auto:best,w_64/v1/favicons/dm-favicon.png 2x,
          https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_128,q_auto:best,w_128/v1/favicons/dm-favicon.png 4x">
```

---

## JavaScript Dynamic Loading

### Dynamic Favicon Switcher
```javascript
// Change favicon dynamically (e.g., for notifications)
function updateFavicon(size = 32) {
  const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  link.type = 'image/png';
  link.rel = 'icon';
  link.href = `https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_${size},q_auto:best,w_${size}/v1/favicons/dm-favicon.png`;
  document.head.appendChild(link);
}

// Usage
updateFavicon(32); // Standard
updateFavicon(64); // High DPI
```

### Dark Mode Detection
```javascript
// Swap favicon based on color scheme
function setThemeFavicon() {
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const effect = isDarkMode ? 'e_negate,' : '';

  const link = document.querySelector("link[rel*='icon']");
  link.href = `https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,${effect}f_auto,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.png`;
}

// Listen for theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setThemeFavicon);
setThemeFavicon(); // Initial load
```

---

## Bulk Operations

### Batch URL Generation (Node.js)
```javascript
const sizes = [16, 32, 48, 64, 128, 256];
const cloudName = 'dvcvxhzmt';
const publicId = 'favicons/dm-favicon';

const urls = sizes.map(size => ({
  size: `${size}x${size}`,
  png: `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,f_auto,h_${size},q_auto:best,w_${size}/v1/${publicId}.png`,
  webp: `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,f_webp,h_${size},q_auto:best,w_${size}/v1/${publicId}.webp`,
  avif: `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,f_avif,h_${size},q_auto:best,w_${size}/v1/${publicId}.avif`
}));

console.table(urls);
```

---

## Testing URLs

### Check Format Delivery
```bash
# Test PNG delivery
curl -I "https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.png"

# Test WebP delivery (with Accept header)
curl -I -H "Accept: image/webp" "https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.png"

# Test AVIF delivery
curl -I "https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_avif,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.avif"
```

### Download All Sizes
```bash
#!/bin/bash
# Download all favicon sizes

sizes=(256 128 64 48 32 16)
base_url="https://res.cloudinary.com/dvcvxhzmt/image/upload"

for size in "${sizes[@]}"; do
  url="${base_url}/c_fill,f_auto,h_${size},q_auto:best,w_${size}/v1/favicons/dm-favicon.png"
  wget -O "favicon-${size}x${size}.png" "$url"
  echo "Downloaded ${size}x${size}"
done

# Download ICO
wget -O "favicon.ico" "${base_url}/c_fill,h_48,q_auto:best,w_48/v1/favicons/dm-favicon.ico"
echo "Downloaded favicon.ico"
```

---

## Cache Management

### Cache Headers
All Cloudinary URLs include optimal caching:

```
Cache-Control: public, max-age=31536000, immutable
CDN-Cache-Control: public, max-age=31536000
Cloudinary-Cache-Hit: true
```

### Cache Invalidation
To force update (change version parameter):

```
# Old version (cached)
https://res.cloudinary.com/dvcvxhzmt/image/upload/.../v1/favicons/dm-favicon.png

# New version (bypasses cache)
https://res.cloudinary.com/dvcvxhzmt/image/upload/.../v2/favicons/dm-favicon.png
```

Or use timestamp:
```javascript
const cacheBuster = Date.now();
const url = `https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_32,q_auto:best,w_32/v${cacheBuster}/favicons/dm-favicon.png`;
```

---

## Performance Monitoring

### Lighthouse Test Commands
```bash
# Test favicon impact on Lighthouse score
lighthouse https://your-site.com --only-categories=performance --view

# Check specific favicon metrics
lighthouse https://your-site.com --chrome-flags="--disable-gpu" --output json --output-path ./report.json
```

### WebPageTest
```
Test URL: https://your-site.com
Connection: 4G
Location: Dulles, VA
Browser: Chrome
Advanced: Check "Capture Video"
```

---

## Integration Examples

### React Component
```jsx
import { useEffect } from 'react';

export function DynamicFavicon({ size = 32, darkMode = false }) {
  useEffect(() => {
    const effect = darkMode ? 'e_negate,' : '';
    const url = `https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,${effect}f_auto,h_${size},q_auto:best,w_${size}/v1/favicons/dm-favicon.png`;

    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = url;
    document.head.appendChild(link);
  }, [size, darkMode]);

  return null;
}
```

### Next.js Head Component
```jsx
import Head from 'next/head';

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <link rel="icon" type="image/png" sizes="32x32"
          href="https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16"
          href="https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_16,q_auto:best,w_16/v1/favicons/dm-favicon.png" />
        <link rel="apple-touch-icon" sizes="256x256"
          href="https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_256,q_auto:best,w_256/v1/favicons/dm-favicon.png" />
      </Head>
      {children}
    </>
  );
}
```

---

## Quick Copy-Paste HTML

### Minimal Setup (32x32 + ICO)
```html
<link rel="icon" type="image/png" sizes="32x32"
  href="https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.png">
<link rel="shortcut icon"
  href="https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,h_48,q_auto:best,w_48/v1/favicons/dm-favicon.ico">
```

### Complete Setup (All Sizes)
```html
<!-- Favicons -->
<link rel="icon" type="image/png" sizes="256x256" href="https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_256,q_auto:best,w_256/v1/favicons/dm-favicon.png">
<link rel="icon" type="image/png" sizes="128x128" href="https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_128,q_auto:best,w_128/v1/favicons/dm-favicon.png">
<link rel="icon" type="image/png" sizes="64x64" href="https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_64,q_auto:best,w_64/v1/favicons/dm-favicon.png">
<link rel="icon" type="image/png" sizes="48x48" href="https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_48,q_auto:best,w_48/v1/favicons/dm-favicon.png">
<link rel="icon" type="image/png" sizes="32x32" href="https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_32,q_auto:best,w_32/v1/favicons/dm-favicon.png">
<link rel="icon" type="image/png" sizes="16x16" href="https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_16,q_auto:best,w_16/v1/favicons/dm-favicon.png">
<link rel="shortcut icon" href="https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,h_48,q_auto:best,w_48/v1/favicons/dm-favicon.ico">
<link rel="apple-touch-icon" sizes="256x256" href="https://res.cloudinary.com/dvcvxhzmt/image/upload/c_fill,f_auto,h_256,q_auto:best,w_256/v1/favicons/dm-favicon.png">
```

---

**Last Updated**: 2025-10-13
**Cloudinary Cloud**: dvcvxhzmt
**Asset Path**: favicons/dm-favicon
**Status**: All assets optimized and deployed
