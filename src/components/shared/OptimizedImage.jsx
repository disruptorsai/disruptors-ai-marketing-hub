/**
 * OptimizedImage Component
 * Automatically optimizes images based on connection quality and viewport size
 *
 * Features:
 * - Connection-aware quality adjustment
 * - Viewport-specific sizing
 * - Lazy loading with adaptive margins
 * - Progressive loading with LQIP (Low Quality Image Placeholder)
 * - Automatic format selection (WebP/AVIF)
 * - Supabase Storage optimization with transformation API
 */

import React, { useState } from 'react';
import { useAdaptiveImage } from '@/hooks/useConnectionQuality';
import { useLazyLoad } from '@/hooks/useImageOptimization';
import {
  getViewportOptimizedDimensions,
  getSupabaseLQIP,
  optimizeSupabaseImage,
  isSupabaseStorageUrl
} from '@/utils/supabase-media-optimizer';

/**
 * OptimizedImage Component
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for accessibility
 * @param {string} props.preset - Cloudinary preset (hero, card, thumbnail, etc.)
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 * @param {boolean} props.lazy - Enable lazy loading (default: true)
 * @param {boolean} props.showPlaceholder - Show LQIP placeholder (default: true)
 * @param {Function} props.onLoad - Callback when image loads
 * @param {Function} props.onError - Callback on error
 */
export default function OptimizedImage({
  src,
  alt = '',
  preset = 'hero',
  className = '',
  style = {},
  lazy = true,
  showPlaceholder = true,
  onLoad,
  onError,
  ...props
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get optimized dimensions for current viewport
  const dimensions = getViewportOptimizedDimensions(preset);

  // Get connection-aware optimized URL
  const optimizedSrc = useAdaptiveImage(src, {
    width: dimensions.width,
    height: dimensions.height
  });

  // Lazy loading with adaptive root margin
  const { ref, isVisible } = useLazyLoad({
    triggerOnce: true,
  });

  // Generate LQIP (Low Quality Image Placeholder) URL
  const placeholderSrc = isSupabaseStorageUrl(src)
    ? getSupabaseLQIP(src)
    : null;

  const handleLoad = (e) => {
    setImageLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setImageError(true);
    onError?.(e);
    console.warn('Image failed to load:', src);
  };

  // Don't render if lazy and not visible
  const shouldRender = !lazy || isVisible;

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {/* Low Quality Placeholder - shown while loading */}
      {showPlaceholder && placeholderSrc && !imageLoaded && shouldRender && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 transition-opacity duration-300"
          style={{ opacity: imageLoaded ? 0 : 1 }}
        />
      )}

      {/* Main optimized image */}
      {shouldRender && !imageError && (
        <img
          src={optimizedSrc}
          alt={alt}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}

      {/* Error fallback */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 text-white">
          <div className="text-center px-4">
            <svg
              className="w-12 h-12 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Image unavailable</p>
          </div>
        </div>
      )}

      {/* Loading skeleton - shown before image is visible */}
      {!shouldRender && (
        <div className="absolute inset-0 bg-gray-800/20 animate-pulse" />
      )}
    </div>
  );
}
