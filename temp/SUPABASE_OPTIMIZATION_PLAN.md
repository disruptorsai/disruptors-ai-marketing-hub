# SUPABASE STORAGE OPTIMIZATION PLAN

**Created**: 2025-11-04
**Status**: Ready for Implementation
**Goal**: Achieve fastest possible load speeds with Supabase Storage

## Executive Summary

Replace Cloudinary-dependent optimization system with Supabase Storage's native optimization capabilities. Supabase provides:
- **Smart CDN**: 285 cities worldwide (Cloudflare-backed)
- **Image Transformation API**: On-the-fly resizing, format conversion, quality adjustment
- **Automatic Format Optimization**: WebP for Chrome, AVIF for modern browsers
- **Public Bucket Advantage**: Better cache hit rates

## Current Issues Identified

### 1. White Bar Bug on Blog Page
- **File**: `src/components/shared/DualCTABlock.jsx` (line 14)
- **Issue**: Still uses Cloudinary background image
- **URL**: `https://res.cloudinary.com/dvcvxhzmt/image/upload/v1759258608/...png`
- **Impact**: Visual layout bug above "Get Insights Delivered" section

### 2. Blog Hero Video Not Migrated
- **File**: `src/pages/blog.jsx` (line 229)
- **Issue**: Hero video still on Cloudinary
- **URL**: `https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759270235/...mp4`
- **Impact**: Slower load time, dependency on Cloudinary

### 3. Cloudinary-Dependent Utilities
- **File**: `src/utils/cloudinary-optimizer.js` (321 lines)
- **Issue**: All optimization logic tied to Cloudinary transformations
- **Functions**:
  - `optimizeCloudinaryImage()` - Image transformations
  - `generateCloudinarySrcSet()` - Responsive images
  - `optimizeCloudinaryVideo()` - Video transformations
  - `getVideoThumbnail()` - Video thumbnails
- **Impact**: Can't optimize Supabase URLs, no automatic format selection

### 4. OptimizedImage Component
- **File**: `src/components/shared/OptimizedImage.jsx` (140 lines)
- **Issue**: Uses Cloudinary optimizer functions (line 16)
- **Impact**: LQIP placeholders only work for Cloudinary URLs (lines 61-63)

## Supabase Storage Transformation API

### URL Structure
```
https://[project].supabase.co/storage/v1/render/image/public/[bucket]/[path]?
  width=800&
  height=600&
  quality=80&
  format=origin&
  resize=contain
```

### Available Parameters

| Parameter | Options | Description |
|-----------|---------|-------------|
| `width` | 1-2500 | Target width in pixels |
| `height` | 1-2500 | Target height in pixels |
| `quality` | 20-100 | JPEG/WebP quality (default: 80) |
| `format` | `origin`, `webp` | Force specific format |
| `resize` | `cover`, `contain`, `fill` | Resize mode |

### Automatic Features
- **Smart Format Selection**: Serves WebP to Chrome, AVIF to Safari when `format=origin`
- **CDN Caching**: 285 cities worldwide with aggressive caching
- **On-the-fly Processing**: No pre-generation needed

## Implementation Plan

### Phase 1: Create Supabase Media Optimizer Utility

**File**: `src/utils/supabase-media-optimizer.js`

**Functions to Create**:
1. `optimizeSupabaseImage(url, options)` - Replace Cloudinary optimizer
2. `generateSupabaseSrcSet(url, widths, options)` - Responsive images
3. `optimizeSupabaseVideo(url, options)` - Video optimization (direct URLs)
4. `getSupabaseImageUrl(path, bucket, options)` - URL builder
5. `getViewportOptimizedDimensions(preset)` - Reuse viewport logic
6. `SUPABASE_PRESETS` - Equivalent presets for common use cases

**Key Features**:
- Automatic format optimization (WebP/AVIF)
- Connection-aware quality adjustment (80 for good, 60 for slow, 100 for fast)
- Viewport-specific sizing
- Support for both public URLs and render API

### Phase 2: Update OptimizedImage Component

**File**: `src/components/shared/OptimizedImage.jsx`

**Changes**:
1. Import Supabase optimizer instead of Cloudinary
2. Update LQIP generation for Supabase URLs:
   ```javascript
   // Replace:
   const placeholderSrc = src?.includes('cloudinary.com')
     ? src.replace('/upload/', '/upload/w_50,q_auto:low,f_auto,e_blur:1000/')
     : null;

   // With:
   const placeholderSrc = src?.includes('supabase.co')
     ? getSupabaseImageUrl(extractPathFromUrl(src), bucket, { width: 50, quality: 20 })
     : null;
   ```
3. Update `useAdaptiveImage` hook to use Supabase optimizer
4. Add fallback for non-Supabase URLs

### Phase 3: Fix Identified Bugs

#### 3.1 DualCTABlock Background Image
**File**: `src/components/shared/DualCTABlock.jsx` (line 14)

**Action**: Migrate background image to Supabase
1. Download image from Cloudinary
2. Upload to `site-images/ui/backgrounds/` bucket
3. Update `backgroundImage` default prop to Supabase URL
4. Apply transformation: `width=2560&quality=80&format=origin`

#### 3.2 Blog Hero Video
**File**: `src/pages/blog.jsx` (line 229)

**Action**: Migrate video to Supabase
1. Download video from Cloudinary
2. Upload to `site-videos/blog/` bucket
3. Update `src` attribute to Supabase URL
4. Keep same video attributes (autoPlay, muted, loop, playsInline)

### Phase 4: Performance Optimizations

#### 4.1 Lazy Loading Configuration
- **Current**: Uses `useLazyLoad` hook with default margins
- **Optimization**: Adjust root margins based on connection quality
  - Fast 4G/5G: `rootMargin: "200px"`
  - Slow 3G: `rootMargin: "50px"`
  - Saves bandwidth on slow connections

#### 4.2 Responsive Images with srcset
**Implementation**:
```javascript
<img
  src={optimizeSupabaseImage(url, { width: 1920, quality: 80 })}
  srcSet={generateSupabaseSrcSet(url, [640, 768, 1024, 1280, 1920])}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 768px, 1920px"
/>
```

#### 4.3 Quality Settings by Use Case
- **Hero images**: quality=80 (good balance)
- **Thumbnails**: quality=60 (smaller files)
- **Card images**: quality=75 (good quality)
- **Background images**: quality=70 (not focal point)

#### 4.4 Public Bucket Verification
**Action**: Verify all buckets are public for better cache hit rates
```sql
-- Check bucket public status
SELECT name, public FROM storage.buckets;

-- Make buckets public if needed
UPDATE storage.buckets SET public = true WHERE name IN ('site-images', 'site-videos');
```

### Phase 5: Update FastVideo Component

**File**: `src/components/shared/FastVideo.jsx`

**Changes**:
1. Remove Cloudinary video optimization
2. Use direct Supabase Storage URLs (no transformation API for video)
3. Keep lazy loading and intersection observer
4. Add preload hints for above-the-fold videos

### Phase 6: Testing & Validation

#### 6.1 Local Testing
1. Run `npm run dev`
2. Test Home page (hero videos, logo)
3. Test Work page (case study logos)
4. Test Blog page (hero video, DualCTABlock)
5. Test Onboarding flow (brand logos)
6. Check browser DevTools Network tab:
   - Verify WebP format served
   - Check response times
   - Verify proper caching headers

#### 6.2 Dev Deployment
1. Commit changes with detailed message
2. Push to trigger auto-deploy
3. Test on https://dev.disruptorsmedia.com
4. Run Lighthouse audit
5. Compare before/after metrics

#### 6.3 Performance Metrics to Track
- **Before**: Current load times with migrated assets
- **After**: Load times with Supabase optimization
- **Metrics**:
  - Largest Contentful Paint (LCP)
  - First Contentful Paint (FCP)
  - Time to Interactive (TTI)
  - Total Blocking Time (TBT)
  - Image load times
  - Video load times

## Migration Checklist

### Critical Files to Update
- [ ] Create `src/utils/supabase-media-optimizer.js`
- [ ] Update `src/components/shared/OptimizedImage.jsx`
- [ ] Update `src/components/shared/DualCTABlock.jsx` (line 14)
- [ ] Update `src/pages/blog.jsx` (line 229)
- [ ] Update `src/hooks/useImageOptimization.js` (if needed)
- [ ] Update `src/hooks/useConnectionQuality.js` (if needed)

### Assets to Migrate
- [ ] DualCTABlock background image → `site-images/ui/backgrounds/`
- [ ] Blog hero video → `site-videos/blog/`

### Testing
- [ ] Local development testing
- [ ] Dev deployment testing
- [ ] Lighthouse audit
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile testing (iOS, Android)

### Cleanup (Post-Verification)
- [ ] Mark `src/utils/cloudinary-optimizer.js` for deprecation
- [ ] Remove Cloudinary MCP server from config
- [ ] Update `.env.example` to remove Cloudinary variables
- [ ] Remove Cloudinary dependencies from `package.json`

## Expected Performance Improvements

### Before (Cloudinary Migration)
- Images loading from Supabase but no optimization
- No automatic format selection
- No responsive sizing
- Slower load times due to larger file sizes

### After (Supabase Optimization)
- **30-50% smaller file sizes** with WebP/AVIF
- **20-40% faster LCP** with responsive images
- **Better cache hit rates** with public buckets
- **Improved mobile performance** with connection-aware quality

## Cost Analysis

### Cloudinary (Previous)
- **Bandwidth**: 25GB/month free, then $1.10/GB
- **Transformations**: 25,000/month free, then $0.30/1000
- **Estimated Monthly Cost**: $99/month

### Supabase Storage (New)
- **Storage**: 100GB included in Pro plan ($25/month)
- **Bandwidth**: 250GB included, then $0.09/GB
- **Transformations**: Unlimited (included)
- **Current Plan**: Already paying for Pro plan
- **Additional Cost**: $0 (within limits)

**Savings**: $99/month = $1,188/year

## Implementation Timeline

- **Phase 1**: Create Supabase optimizer - 30 minutes
- **Phase 2**: Update OptimizedImage - 20 minutes
- **Phase 3**: Fix bugs - 20 minutes
- **Phase 4**: Performance optimizations - 30 minutes
- **Phase 5**: Update FastVideo - 15 minutes
- **Phase 6**: Testing & validation - 45 minutes

**Total Time**: ~2.5 hours

## Rollback Plan

If issues arise:
1. Keep `cloudinary-optimizer.js` as backup
2. Revert component imports to Cloudinary optimizer
3. Update URLs back to Cloudinary (use git history)
4. Re-enable Cloudinary MCP server

## Next Steps

1. **Implement** the optimization plan (Phases 1-5)
2. **Test** locally and on dev site (Phase 6)
3. **Deploy** to production after validation
4. **Complete** Option A (migrate remaining 175 assets)
5. **Clean up** Cloudinary dependencies and documentation

---

**Ready to Implement**: This plan is ready for execution. All technical details are mapped out.
