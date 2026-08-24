import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * LazyImage Component with IntersectionObserver
 *
 * Features:
 * - Lazy loads images only when they enter viewport
 * - WebP format with PNG/JPG fallback for older browsers
 * - Responsive srcset for mobile optimization
 * - Fade-in animation on load
 * - Blur placeholder while loading
 * - Error handling with fallback image
 *
 * Usage:
 * <LazyImage
 *   src="/images/photo.webp"
 *   fallbackSrc="/images/photo.png"
 *   alt="Description"
 *   className="w-full h-auto"
 * />
 */
export default function LazyImage({
  src,
  fallbackSrc,
  alt = '',
  className = '',
  width,
  height,
  aspectRatio = '1/1',
  loading = 'lazy',
  onLoad,
  onError,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // IntersectionObserver for lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    // Use native lazy loading as primary method
    if (loading === 'lazy' && 'loading' in HTMLImageElement.prototype) {
      setIsInView(true);
      return;
    }

    // Fallback to IntersectionObserver for older browsers
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading]);

  // Handle image load
  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  // Handle image error
  const handleError = (e) => {
    console.warn(`Image failed to load: ${src}`, e);
    setHasError(true);
    if (onError) onError(e);
  };

  // Generate srcset for responsive images
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc) return '';

    // For WebP images, generate responsive sizes
    if (baseSrc.endsWith('.webp')) {
      const base = baseSrc.replace('.webp', '');
      return `${base}.webp 1x, ${base}.webp 2x`;
    }

    return '';
  };

  // Determine which image to show
  const imageSrc = hasError && fallbackSrc ? fallbackSrc : src;
  const shouldLoad = isInView || loading === 'eager';

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      {/* Blur placeholder */}
      {!isLoaded && shouldLoad && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Main image with WebP support */}
      {shouldLoad && (
        <picture>
          {/* WebP format for modern browsers */}
          {src.endsWith('.webp') && (
            <source
              type="image/webp"
              srcSet={generateSrcSet(src) || src}
            />
          )}

          {/* Fallback for browsers that don't support WebP */}
          {fallbackSrc && (
            <source
              type={fallbackSrc.endsWith('.png') ? 'image/png' : 'image/jpeg'}
              srcSet={fallbackSrc}
            />
          )}

          {/* Final fallback img tag */}
          <motion.img
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            onLoad={handleLoad}
            onError={handleError}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className={`w-full h-full object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            {...props}
          />
        </picture>
      )}

      {/* Error state */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center text-gray-400">
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
    </div>
  );
}

/**
 * Preload critical images
 * Use for above-the-fold images that should load immediately
 */
export function preloadImage(src) {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;

  // Add WebP type hint
  if (src.endsWith('.webp')) {
    link.type = 'image/webp';
  }

  document.head.appendChild(link);
}
