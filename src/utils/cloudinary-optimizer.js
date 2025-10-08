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
    format = 'auto',
    crop = 'fill',
  } = options;

  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  const baseUrl = url.substring(0, uploadIndex + 8);
  const assetPath = url.substring(uploadIndex + 8);

  const transformations = [];

  // Video format optimization
  if (format === 'auto') {
    transformations.push('f_auto');
  } else {
    transformations.push(`f_${format}`);
  }

  // Quality
  transformations.push(`q_${quality}`);

  // Dimensions
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);

  // Video-specific optimizations
  transformations.push('vc_auto'); // Auto video codec

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
