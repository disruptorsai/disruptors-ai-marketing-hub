# Build Optimization & Performance

## Vite Configuration

File: `vite.config.js`

## Manual Chunk Splitting

Optimal bundle distribution for performance:

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React/Router (reduces main bundle)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // All Radix UI components grouped
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            // ... 20+ components
          ],

          // Animation libraries
          'vendor-animation': ['framer-motion', 'gsap'],

          // 3D libraries (loaded only when needed)
          'vendor-3d': ['@splinetool/react-spline', '@splinetool/runtime'],

          // AI generation libraries
          'vendor-ai': ['openai', '@google/generative-ai', 'replicate'],

          // Database
          'vendor-database': ['@supabase/supabase-js', '@base44/sdk'],

          // Utilities
          'vendor-utils': ['clsx', 'tailwind-merge', 'zod', 'date-fns']
        }
      }
    }
  }
})
```

### Benefits

1. **Smaller initial bundle** - Core React separated
2. **Better caching** - Vendor chunks change less frequently
3. **Lazy loading** - 3D libraries only loaded when needed
4. **Parallel downloads** - Multiple smaller chunks load faster

## Chunk Size Optimization

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Experimental: prevent excessive fragmentation
        experimentalMinChunkSize: 20000, // 20KB
        chunkSizeWarningLimit: 250000 // 250KB
      }
    }
  }
})
```

## Path Alias

```javascript
// vite.config.js
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

**Usage:**
```javascript
import sdk from '@/lib/custom-sdk'
import { Button } from '@/components/ui/button'
```

## Global Polyfills

```javascript
// vite.config.js
export default defineConfig({
  define: {
    global: 'globalThis',
    'process.env': {}
  }
})
```

Prevents errors when libraries expect Node.js globals.

## Lazy Loading Strategy

### Page Components

```javascript
// src/pages/index.jsx
import HomePage from './home' // ✅ Immediate (Home only)

// All other pages lazy-loaded
const About = lazy(() => import('./about'))
const Contact = lazy(() => import('./contact'))
const SplineDemo = lazy(() => import('./demos/spline-demo')) // Defers ~2MB
```

### Benefits

- **Reduced initial bundle** - Only Home page loads immediately
- **Faster TTI** (Time to Interactive)
- **Better performance scores**
- **Progressive loading**

## Image Optimization

### Formats

```javascript
// Use modern formats
<img src="image.webp" alt="..." /> // ✅ Modern, smaller
<img src="image.jpg" alt="..." />  // ❌ Older, larger
```

### Lazy Loading

```javascript
<img loading="lazy" src="..." alt="..." />
```

### Cloudinary Optimization

```javascript
const optimizedUrl = cloudinary.url('image.jpg', {
  width: 800,
  quality: 'auto',
  format: 'auto'
})
```

## Bundle Analysis

### Analyze Bundle Size

```bash
npm run build

# Check output
dist/
├── index.html
├── assets/
│   ├── index-abc123.js           # Main bundle
│   ├── vendor-react-def456.js    # React chunk
│   ├── vendor-ui-ghi789.js       # Radix UI chunk
│   └── ... more chunks
```

### Check Sizes

```bash
du -sh dist/*
```

### Target Sizes

- **Initial bundle**: < 500KB gzipped
- **Lazy chunks**: < 250KB each
- **Total page size**: < 2MB

## Performance Metrics

### Target Scores

- **Lighthouse Performance**: > 90
- **FCP** (First Contentful Paint): < 1.8s
- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1
- **TBT** (Total Blocking Time): < 200ms

### Measuring Performance

```bash
# Run Lighthouse in Chrome DevTools
1. Open DevTools
2. Click Lighthouse tab
3. Select categories
4. Generate report
```

## Code Splitting

### Automatic Code Splitting

Vite automatically splits code based on:
- Dynamic imports
- Manual chunks configuration
- Entry points

### Dynamic Imports

```javascript
// Dynamic import for heavy libraries
const loadHeavyLibrary = async () => {
  const lib = await import('heavy-library')
  return lib.default
}
```

## CSS Optimization

### Tailwind Purging

```javascript
// tailwind.config.cjs
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  // Unused classes automatically removed
}
```

### Critical CSS

Vite automatically inlines critical CSS in `<style>` tags.

## Asset Optimization

### Static Assets

```
public/
├── images/     # Optimized images
├── videos/     # Compressed videos
└── spline/     # 3D scenes
```

### Video Optimization

```html
<video muted loop playsinline>
  <source src="video.webm" type="video/webm">
  <source src="video.mp4" type="video/mp4">
</video>
```

## Tree Shaking

Vite automatically removes unused code:

```javascript
// Only imports Button, not entire library
import { Button } from '@/components/ui/button'
```

## Minification

```javascript
// vite.config.js
export default defineConfig({
  build: {
    minify: 'esbuild', // Fast minification
    target: 'es2015'   // Browser compatibility
  }
})
```

## Source Maps

```javascript
// vite.config.js
export default defineConfig({
  build: {
    sourcemap: true // Enable for debugging
  }
})
```

**Production:** Source maps hidden from users but available for debugging.

## Preloading

### Module Preload

```html
<!-- Vite automatically adds modulepreload -->
<link rel="modulepreload" href="/assets/vendor-react.js">
```

### DNS Prefetch

```html
<!-- public/index.html -->
<link rel="dns-prefetch" href="https://api.openai.com">
<link rel="dns-prefetch" href="https://ubqxflzuvxowigbjmqfb.supabase.co">
```

## Caching Strategy

### Immutable Assets

```
/assets/index-abc123.js  # Hash in filename = immutable
Cache-Control: public, max-age=31536000, immutable
```

### HTML

```
/index.html  # No cache (always fresh)
Cache-Control: no-cache
```

## Build Performance

### Build Time Optimization

```javascript
// vite.config.js
export default defineConfig({
  build: {
    // Use esbuild for faster builds
    minify: 'esbuild',

    // Disable source maps in production (faster)
    sourcemap: false
  }
})
```

### Incremental Builds

Vite caches build results:
- First build: ~30 seconds
- Incremental: ~5 seconds

## Animation Performance

### GSAP Optimization

```javascript
// Force 3D acceleration
gsap.set('.element', { force3D: true })

// Use will-change sparingly
.element { will-change: transform; }
```

### Framer Motion Optimization

```javascript
// Use layout animations efficiently
<motion.div layout="position"> // ✅ Only animate position
<motion.div layout> // ❌ Animates all properties
```

### Spline 3D Optimization

```javascript
// Lazy load Spline scenes
const SplineScene = lazy(() => import('@splinetool/react-spline'))

// Monitor performance
const { fps, memory } = useSplinePerformance()
```

## Font Optimization

### Google Fonts

```html
<!-- Preconnect to font servers -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Load fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Font Display Strategy

```css
@font-face {
  font-family: 'Inter';
  font-display: swap; /* Show fallback immediately */
}
```

## Network Optimization

### API Caching

```javascript
// Cache API responses
const cache = new Map()

async function fetchWithCache(url) {
  if (cache.has(url)) {
    return cache.get(url)
  }

  const data = await fetch(url).then(r => r.json())
  cache.set(url, data)
  return data
}
```

### Request Batching

```javascript
// Batch multiple requests
const batchedData = await Promise.all([
  fetch('/api/posts'),
  fetch('/api/team'),
  fetch('/api/media')
])
```

## Build Output Analysis

```
dist/
├── index.html                    # 2KB
├── assets/
│   ├── index-abc123.js           # 120KB (main bundle)
│   ├── vendor-react-def456.js    # 180KB (React)
│   ├── vendor-ui-ghi789.js       # 250KB (Radix UI)
│   ├── vendor-animation-jkl012.js # 80KB (GSAP + Framer)
│   ├── vendor-3d-mno345.js       # 2MB (Spline - lazy)
│   ├── vendor-ai-pqr678.js       # 300KB (AI SDKs)
│   └── vendor-database-stu901.js # 150KB (Supabase)
```

**Total initial load**: ~680KB (without 3D)
**Total with 3D pages**: ~2.6MB

## Performance Checklist

Before deployment:

- [ ] Bundle size < 500KB gzipped (initial)
- [ ] Lighthouse score > 90
- [ ] Images optimized (WebP/AVIF)
- [ ] Lazy loading implemented
- [ ] Code splitting configured
- [ ] Tree shaking verified
- [ ] CSS purged (Tailwind)
- [ ] Fonts optimized
- [ ] Animations performant (60fps)
- [ ] API responses cached
- [ ] Source maps removed (production)

## Monitoring

### Build Warnings

```bash
npm run build

# Check for warnings:
# - Large chunks (> 250KB)
# - Circular dependencies
# - Missing dependencies
```

### Runtime Performance

```javascript
// Performance monitoring
if (window.performance) {
  const perfData = window.performance.getEntriesByType('navigation')[0]
  console.log('Load time:', perfData.loadEventEnd - perfData.fetchStart)
}
```

## Related Documentation

- `docs/DEPLOYMENT.md` - Deployment configuration
- `docs/TECHNOLOGY_STACK.md` - Technology stack
- `docs/workflows/TESTING.md` - Performance testing
- `docs/PERFORMANCE_OPTIMIZATION_GUIDE.md` - Additional tips
