# Quick Start: Performance Optimization

## TL;DR - Copy & Paste Examples

### Optimize an Image
```javascript
import { optimizeCloudinaryImage, CLOUDINARY_PRESETS } from '@/utils/cloudinary-optimizer';

// Use preset (recommended)
<img src={optimizeCloudinaryImage(url, CLOUDINARY_PRESETS.card)} />

// Available presets: thumbnail, card, hero, gallery, fullscreen
```

### Optimize a Video
```javascript
import { getVideoThumbnail, optimizeCloudinaryVideo } from '@/utils/cloudinary-optimizer';

// Show thumbnail in grid
<img src={getVideoThumbnail(videoUrl, { width: 800 })} />

// Load video on click
<video src={optimizeCloudinaryVideo(videoUrl, { quality: 'auto:good' })} />
```

### Lazy Load Images
```javascript
import { useLazyLoad } from '@/hooks/useImageOptimization';
import { optimizeCloudinaryImage } from '@/utils/cloudinary-optimizer';

function MyComponent({ imageUrl }) {
  const { ref, isVisible } = useLazyLoad({ rootMargin: '200px' });

  return (
    <div ref={ref} style={{ minHeight: '200px' }}>
      {isVisible && (
        <img
          src={optimizeCloudinaryImage(imageUrl, { width: 800 })}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
}
```

### Responsive Images
```javascript
import { useResponsiveImage } from '@/hooks/useImageOptimization';
import { optimizeCloudinaryImage } from '@/utils/cloudinary-optimizer';

function ResponsiveHero({ imageUrl }) {
  const { isMobile, isTablet } = useResponsiveImage();

  const width = isMobile ? 640 : isTablet ? 1024 : 1920;

  return (
    <img
      src={optimizeCloudinaryImage(imageUrl, { width, quality: 'auto:best' })}
      loading="eager"
      fetchpriority="high"
    />
  );
}
```

## Common Patterns

### Background Image (Large, Low Priority)
```javascript
<img
  src={optimizeCloudinaryImage(bgUrl, { width: 1920, quality: 'auto:low' })}
  className="w-full h-full object-cover"
  loading="eager"
  fetchpriority="low"
/>
```

### Hero Image (Critical, High Priority)
```javascript
<img
  src={optimizeCloudinaryImage(heroUrl, CLOUDINARY_PRESETS.hero)}
  loading="eager"
  fetchpriority="high"
/>
```

### Product Grid (Lazy Load)
```javascript
{products.map(product => (
  <ProductCard
    key={product.id}
    image={optimizeCloudinaryImage(product.image, CLOUDINARY_PRESETS.card)}
    loading="lazy"
  />
))}
```

### Video Gallery (Thumbnails + Lazy Load)
```javascript
function VideoGallery({ videos }) {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {videos.map((video, index) => {
          const { ref, isVisible } = useLazyLoad();
          return (
            <div key={index} ref={ref} onClick={() => setSelected(video)}>
              {isVisible && (
                <img
                  src={getVideoThumbnail(video.url, { width: 400 })}
                  loading="lazy"
                />
              )}
            </div>
          );
        })}
      </div>

      {selected && (
        <video
          src={optimizeCloudinaryVideo(selected.url)}
          controls
          autoPlay
        />
      )}
    </>
  );
}
```

## Presets Reference

| Preset | Size | Quality | Use Case |
|--------|------|---------|----------|
| `thumbnail` | 300×300 | low | Small avatars, icons |
| `card` | 640×400 | good | Product cards, list items |
| `hero` | 1920×1080 | best | Hero sections, banners |
| `gallery` | 800px width | good | Gallery grids, portfolios |
| `fullscreen` | 2560px width | best | Lightbox, full-screen views |

## Image Attributes Guide

### Critical Images (Above the Fold)
```javascript
loading="eager"
fetchpriority="high"
```

### Non-Critical Images (Below the Fold)
```javascript
loading="lazy"
decoding="async"
```

### Videos
```javascript
preload="metadata"  // Load metadata only
preload="none"      // Don't preload anything
preload="auto"      // Let browser decide
```

## Performance Checklist

- [ ] Use Cloudinary optimizer for all images
- [ ] Apply appropriate presets
- [ ] Implement lazy loading for below-fold images
- [ ] Use `loading="eager"` for critical images
- [ ] Add `minHeight` to prevent layout shift
- [ ] Use video thumbnails in grids
- [ ] Set `fetchpriority="high"` for LCP images
- [ ] Test on slow 3G connection
- [ ] Check Lighthouse score > 90

## Common Mistakes to Avoid

❌ **Don't load full-size images**
```javascript
<img src={originalUrl} /> // Could be 5MB!
```

✅ **Do optimize images**
```javascript
<img src={optimizeCloudinaryImage(originalUrl, { width: 800 })} />
```

❌ **Don't load all gallery items at once**
```javascript
{items.map(item => <img src={item.url} />)}
```

✅ **Do use lazy loading**
```javascript
{items.map(item => {
  const { ref, isVisible } = useLazyLoad();
  return (
    <div ref={ref}>
      {isVisible && <img src={optimizeCloudinaryImage(item.url)} loading="lazy" />}
    </div>
  );
})}
```

❌ **Don't autoplay videos in grids**
```javascript
<video src={videoUrl} autoPlay loop />
```

✅ **Do show thumbnails**
```javascript
<img src={getVideoThumbnail(videoUrl)} onClick={openLightbox} />
```

## Need More?

- **Full Guide**: See `docs/PERFORMANCE_OPTIMIZATION_GUIDE.md`
- **Implementation Details**: See `docs/PERFORMANCE_IMPROVEMENTS_SUMMARY.md`
- **API Reference**: See JSDoc comments in `src/utils/cloudinary-optimizer.js`
