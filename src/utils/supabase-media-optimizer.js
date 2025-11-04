/**
 * Supabase Storage Media Optimization Utility
 *
 * Optimizes images and videos using Supabase Storage's built-in transformation API
 *
 * Features:
 * - Smart CDN with 285 cities worldwide (Cloudflare-backed)
 * - Automatic format selection (WebP for Chrome, AVIF for modern browsers)
 * - Connection-aware quality adjustment
 * - Responsive image generation
 * - Viewport-specific sizing
 *
 * Transformation API URL Structure:
 * https://[project].supabase.co/storage/v1/render/image/public/[bucket]/[path]?width=800&height=600&quality=80
 */

// Supabase project configuration
const SUPABASE_PROJECT_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ubqxflzuvxowigbjmqfb.supabase.co';

/**
 * Extract bucket and path from Supabase Storage URL
 * @param {string} url - Full Supabase Storage URL
 * @returns {Object} - { bucket, path } or null if not a Supabase URL
 */
function parseSupabaseUrl(url) {
  if (!url || !url.includes('supabase.co/storage')) {
    return null;
  }

  // Match pattern: /storage/v1/object/public/{bucket}/{path}
  const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (match) {
    return {
      bucket: match[1],
      path: match[2]
    };
  }

  return null;
}

/**
 * Build Supabase transformation API URL
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path within bucket
 * @param {Object} options - Transformation options
 * @returns {string} - Transformation API URL
 */
export function getSupabaseImageUrl(bucket, path, options = {}) {
  const {
    width,
    height,
    quality = 80,
    format = 'origin', // 'origin' enables automatic WebP/AVIF selection
    resize = 'cover', // 'cover', 'contain', 'fill'
  } = options;

  const baseUrl = `${SUPABASE_PROJECT_URL}/storage/v1/render/image/public/${bucket}/${path}`;
  const params = new URLSearchParams();

  if (width) params.append('width', width);
  if (height) params.append('height', height);
  if (quality) params.append('quality', quality);
  if (format) params.append('format', format);
  if (resize) params.append('resize', resize);

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Optimize a Supabase Storage image URL with transformation parameters
 * @param {string} url - Original Supabase Storage URL or path
 * @param {Object} options - Optimization options
 * @param {number} options.width - Target width in pixels (1-2500)
 * @param {number} options.height - Target height in pixels (1-2500)
 * @param {number} options.quality - Quality level (20-100, default: 80)
 * @param {string} options.format - Image format ('origin', 'webp')
 * @param {string} options.resize - Resize mode ('cover', 'contain', 'fill')
 * @returns {string} - Optimized Supabase URL
 */
export function optimizeSupabaseImage(url, options = {}) {
  if (!url) return url;

  // If already a transformation URL, return as-is
  if (url.includes('/render/image/')) {
    return url;
  }

  // Parse Supabase URL
  const parsed = parseSupabaseUrl(url);
  if (!parsed) {
    // Not a Supabase URL, return as-is
    return url;
  }

  return getSupabaseImageUrl(parsed.bucket, parsed.path, options);
}

/**
 * Generate responsive srcset for Supabase images
 * @param {string} url - Original Supabase Storage URL
 * @param {Array<number>} widths - Array of widths for srcset
 * @param {Object} options - Additional optimization options
 * @returns {string} - srcset attribute value
 */
export function generateSupabaseSrcSet(url, widths = [320, 640, 768, 1024, 1280, 1536, 1920], options = {}) {
  if (!url) return '';

  const parsed = parseSupabaseUrl(url);
  if (!parsed) return '';

  return widths
    .map(width => {
      const optimizedUrl = getSupabaseImageUrl(parsed.bucket, parsed.path, {
        ...options,
        width
      });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * Optimize video URL for Supabase Storage
 * Note: Supabase doesn't have video transformation API, so this returns the direct URL
 * @param {string} url - Original Supabase video URL
 * @param {Object} options - Options (for compatibility, not used)
 * @returns {string} - Video URL
 */
export function optimizeSupabaseVideo(url, options = {}) {
  // Supabase Storage doesn't have video transformation API
  // Return direct public URL for best performance
  return url;
}

/**
 * Generate LQIP (Low Quality Image Placeholder) URL
 * @param {string} url - Original Supabase Storage URL
 * @returns {string} - LQIP URL with 50px width and low quality
 */
export function getSupabaseLQIP(url) {
  if (!url) return null;

  const parsed = parseSupabaseUrl(url);
  if (!parsed) return null;

  return getSupabaseImageUrl(parsed.bucket, parsed.path, {
    width: 50,
    quality: 20,
    format: 'origin'
  });
}

/**
 * Detect viewport size category
 * @returns {string} - Viewport category
 */
export function getViewportCategory() {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1920;

  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1920) return 'desktop';
  if (width < 2560) return 'large'; // 2K displays
  return 'xlarge'; // 4K displays
}

/**
 * Get optimal dimensions for current viewport
 * @param {string} preset - Preset name
 * @returns {Object} - Optimal dimensions
 */
export function getViewportOptimizedDimensions(preset = 'hero') {
  const viewport = getViewportCategory();

  const dimensionMap = {
    hero: {
      mobile: { width: 768, height: 432 },
      tablet: { width: 1024, height: 576 },
      desktop: { width: 1920, height: 1080 },
      large: { width: 2560, height: 1440 },
      xlarge: { width: 3840, height: 2160 }
    },
    card: {
      mobile: { width: 320, height: 200 },
      tablet: { width: 640, height: 400 },
      desktop: { width: 800, height: 500 },
      large: { width: 1024, height: 640 },
      xlarge: { width: 1280, height: 800 }
    },
    fullscreen: {
      mobile: { width: 768, height: 432 },
      tablet: { width: 1024, height: 576 },
      desktop: { width: 1920, height: 1080 },
      large: { width: 2560, height: 1440 },
      xlarge: { width: 3840, height: 2160 }
    },
    video: {
      mobile: { width: 640, height: 360 },
      tablet: { width: 1024, height: 576 },
      desktop: { width: 1280, height: 720 },
      large: { width: 1920, height: 1080 },
      xlarge: { width: 2560, height: 1440 }
    },
    thumbnail: {
      mobile: { width: 150, height: 150 },
      tablet: { width: 200, height: 200 },
      desktop: { width: 300, height: 300 },
      large: { width: 400, height: 400 },
      xlarge: { width: 500, height: 500 }
    },
    background: {
      mobile: { width: 768, height: 432 },
      tablet: { width: 1024, height: 576 },
      desktop: { width: 1920, height: 1080 },
      large: { width: 2560, height: 1440 },
      xlarge: { width: 3840, height: 2160 }
    }
  };

  return dimensionMap[preset]?.[viewport] || dimensionMap.hero[viewport];
}

/**
 * Presets for common use cases
 */
export const SUPABASE_PRESETS = {
  thumbnail: {
    width: 300,
    height: 300,
    quality: 60,
    resize: 'cover',
  },
  card: {
    width: 640,
    height: 400,
    quality: 75,
    resize: 'cover',
  },
  hero: {
    width: 1920,
    height: 1080,
    quality: 80,
    resize: 'cover',
  },
  gallery: {
    width: 800,
    quality: 75,
    resize: 'contain',
  },
  fullscreen: {
    width: 2560,
    quality: 80,
    resize: 'contain',
  },
  background: {
    width: 2560,
    height: 1440,
    quality: 70, // Lower quality for backgrounds
    resize: 'cover',
  },
  largeDisplay: {
    width: 2560,
    height: 1440,
    quality: 75,
    resize: 'cover',
  },
  xlargeDisplay: {
    width: 3840,
    height: 2160,
    quality: 75,
    resize: 'cover',
  },
};

/**
 * Apply preset to Supabase Storage URL
 * @param {string} url - Original URL
 * @param {string} presetName - Name of preset from SUPABASE_PRESETS
 * @returns {string} - Optimized URL
 */
export function applyPreset(url, presetName) {
  const preset = SUPABASE_PRESETS[presetName];
  if (!preset) {
    console.warn(`Unknown preset: ${presetName}`);
    return url;
  }
  return optimizeSupabaseImage(url, preset);
}

/**
 * Get connection-aware quality setting
 * @returns {number} - Quality value (20-100)
 */
export function getConnectionQuality() {
  if (typeof navigator === 'undefined' || !navigator.connection) {
    return 80; // Default quality
  }

  const connection = navigator.connection;
  const effectiveType = connection.effectiveType;

  // Adjust quality based on connection speed
  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return 50; // Low quality for very slow connections
    case '3g':
      return 60; // Medium-low quality for slow connections
    case '4g':
    case '5g':
      return 80; // Good quality for fast connections
    default:
      return 80; // Default to good quality
  }
}

/**
 * Optimize image with connection-aware quality
 * @param {string} url - Original URL
 * @param {Object} options - Base optimization options
 * @returns {string} - Optimized URL with connection-aware quality
 */
export function optimizeWithConnectionQuality(url, options = {}) {
  const connectionQuality = getConnectionQuality();
  return optimizeSupabaseImage(url, {
    ...options,
    quality: options.quality || connectionQuality
  });
}

/**
 * Check if URL is a Supabase Storage URL
 * @param {string} url - URL to check
 * @returns {boolean} - True if Supabase Storage URL
 */
export function isSupabaseStorageUrl(url) {
  return url && url.includes('supabase.co/storage');
}

/**
 * Convert Cloudinary URL to Supabase equivalent (for migration reference)
 * This is a helper function for documentation purposes
 * @deprecated Use migration scripts instead
 */
export function cloudinaryToSupabaseUrl(cloudinaryUrl) {
  console.warn('cloudinaryToSupabaseUrl is deprecated. Use migration scripts instead.');
  return cloudinaryUrl;
}
