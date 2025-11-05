/**
 * Cloudinary Image Optimization Utility
 * Automatically optimizes images with format conversion, quality adjustment, and responsive sizing
 *
 * Based on 2025 best practices:
 * - f_auto: Automatic format selection (WebP/AVIF for modern browsers)
 * - q_auto: Intelligent quality compression
 * - Responsive sizing with width parameters
 * - Lazy loading support
 */

/**
 * Optimize a Cloudinary image URL with automatic format and quality optimization
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Optimization options
 * @param {number} options.width - Target width in pixels
 * @param {number} options.height - Target height in pixels
 * @param {string} options.quality - Quality level: 'auto', 'auto:low', 'auto:good', 'auto:best'
 * @param {string} options.crop - Crop mode: 'fill', 'fit', 'scale', 'crop', 'thumb'
 * @param {string} options.gravity - Gravity for cropping: 'auto', 'face', 'center', 'north', etc.
 * @param {boolean} options.progressive - Enable progressive JPEG loading
 * @param {number} options.dpr - Device pixel ratio (1, 2, 3)
 * @returns {string} - Optimized Cloudinary URL
 */
export function optimizeCloudinaryImage(url, options = {}) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width,
    height,
    quality = 'auto:good',
    crop = 'fill',
    gravity = 'auto',
    progressive = true,
    dpr = 1,
  } = options;

  // Extract parts of the Cloudinary URL
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  const baseUrl = url.substring(0, uploadIndex + 8);
  const assetPath = url.substring(uploadIndex + 8);

  // Build transformation string
  const transformations = [];

  // Format optimization (auto-select WebP/AVIF)
  transformations.push('f_auto');

  // Quality optimization
  transformations.push(`q_${quality}`);

  // Dimensions
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);

  // Crop mode with gravity
  if (crop) {
    transformations.push(`c_${crop}`);
    if (gravity && crop !== 'scale') {
      transformations.push(`g_${gravity}`);
    }
  }

  // Device pixel ratio
  if (dpr && dpr !== 1) {
    transformations.push(`dpr_${dpr}`);
  }

  // Progressive loading for JPEGs
  if (progressive) {
    transformations.push('fl_progressive');
  }

  // Combine transformations
  const transformString = transformations.join(',');

  return `${baseUrl}${transformString}/${assetPath}`;
}

/**
 * Generate responsive srcset for Cloudinary images
 * @param {string} url - Original Cloudinary URL
 * @param {Array<number>} widths - Array of widths for srcset
 * @param {Object} options - Additional optimization options
 * @returns {string} - srcset attribute value
 */
export function generateCloudinarySrcSet(url, widths = [320, 640, 768, 1024, 1280, 1536, 1920], options = {}) {
  if (!url || !url.includes('cloudinary.com')) {
    return '';
  }

  return widths
    .map(width => {
      const optimizedUrl = optimizeCloudinaryImage(url, { ...options, width });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * Optimize video URL for better performance
 * @param {string} url - Original Cloudinary video URL
 * @param {Object} options - Optimization options
 * @param {number} options.width - Target width
 * @param {number} options.height - Target height
 * @param {string} options.quality - Quality level
 * @param {string} options.format - Video format (mp4, webm, auto)
 * @returns {string} - Optimized video URL
 */
export function optimizeCloudinaryVideo(url, options = {}) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'mp4', // Use MP4 explicitly for compatibility
    crop = 'limit', // Use limit to maintain aspect ratio without distortion
    streaming = false, // Disable advanced streaming (may require paid plan)
  } = options;

  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  const baseUrl = url.substring(0, uploadIndex + 8);
  const assetPath = url.substring(uploadIndex + 8);

  const transformations = [];

  // Video format
  transformations.push(`f_${format}`);

  // Quality
  transformations.push(`q_${quality}`);

  // Dimensions (use limit to avoid upscaling and maintain aspect ratio)
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`c_${crop}`);

  // Video codec optimization (H.264 for best compatibility)
  transformations.push('vc_h264');

  const transformString = transformations.join(',');

  return `${baseUrl}${transformString}/${assetPath}`;
}

/**
 * Get optimized thumbnail for video
 * @param {string} videoUrl - Cloudinary video URL
 * @param {Object} options - Thumbnail options
 * @returns {string} - Thumbnail image URL
 */
export function getVideoThumbnail(videoUrl, options = {}) {
  if (!videoUrl || !videoUrl.includes('cloudinary.com')) {
    return videoUrl;
  }

  const {
    width = 640,
    height = 360,
    position = 0, // Frame position in seconds or percentage (e.g., '50p' for 50%)
  } = options;

  const uploadIndex = videoUrl.indexOf('/upload/');
  if (uploadIndex === -1) return videoUrl;

  const baseUrl = videoUrl.substring(0, uploadIndex + 8);
  const assetPath = videoUrl.substring(uploadIndex + 8)
    .replace('.mp4', '.jpg')
    .replace('.webm', '.jpg')
    .replace('.mov', '.jpg');

  const transformations = [
    'f_auto',
    'q_auto:good',
    `w_${width}`,
    `h_${height}`,
    'c_fill',
    'g_auto',
    `so_${position}`, // Start offset for frame extraction
  ];

  const transformString = transformations.join(',');

  return `${baseUrl}${transformString}/${assetPath}`;
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
      large: { width: 2560, height: 1440 }, // 2K
      xlarge: { width: 3840, height: 2160 } // 4K
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
      desktop: { width: 1280, height: 720 }, // 720p
      large: { width: 1920, height: 1080 }, // 1080p for 2K
      xlarge: { width: 2560, height: 1440 } // 1440p for 4K (not full 4K to save bandwidth)
    }
  };

  return dimensionMap[preset]?.[viewport] || dimensionMap.hero[viewport];
}

/**
 * Presets for common use cases
 */
export const CLOUDINARY_PRESETS = {
  thumbnail: {
    width: 300,
    height: 300,
    crop: 'thumb',
    gravity: 'auto',
    quality: 'auto:low',
  },
  card: {
    width: 640,
    height: 400,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:good',
  },
  hero: {
    width: 1920,
    height: 1080,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:best',
  },
  gallery: {
    width: 800,
    crop: 'scale',
    quality: 'auto:good',
  },
  fullscreen: {
    width: 2560,
    crop: 'fit',
    quality: 'auto:best',
  },
  // New presets for large displays
  largeDisplay: {
    width: 2560,
    height: 1440,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:good', // Good quality, not best, to save bandwidth
  },
  xlargeDisplay: {
    width: 3840,
    height: 2160,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:good', // Good quality, not best
  },
};

/**
 * Apply preset to image URL
 * @param {string} url - Original URL
 * @param {string} presetName - Name of preset from CLOUDINARY_PRESETS
 * @returns {string} - Optimized URL
 */
export function applyPreset(url, presetName) {
  const preset = CLOUDINARY_PRESETS[presetName];
  if (!preset) {
    console.warn(`Unknown preset: ${presetName}`);
    return url;
  }
  return optimizeCloudinaryImage(url, preset);
}
