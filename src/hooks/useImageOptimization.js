/**
 * Custom Hook for Optimized Image Loading
 * Combines Intersection Observer with Cloudinary optimization
 */

import { useState, useEffect, useRef } from 'react';

/**
 * Hook for lazy loading images with Intersection Observer
 * @param {Object} options - Intersection Observer options
 * @returns {Object} - { ref, isVisible, isLoaded }
 */
export function useLazyLoad(options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef(null);

  const {
    rootMargin = '100px',
    threshold = 0.01,
    triggerOnce = true,
  } = options;

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [rootMargin, threshold, triggerOnce]);

  return { ref, isVisible, isLoaded, setIsLoaded };
}

/**
 * Hook for preloading critical images
 * @param {string} src - Image source URL
 * @param {boolean} shouldPreload - Whether to preload
 */
export function useImagePreload(src, shouldPreload = true) {
  useEffect(() => {
    if (!shouldPreload || !src) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [src, shouldPreload]);
}

/**
 * Hook for responsive image loading based on viewport
 * @returns {Object} - { isMobile, isTablet, isDesktop, viewport }
 */
export function useResponsiveImage() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setViewport({
        width,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return viewport;
}

/**
 * Hook for detecting reduced motion preference
 * @returns {boolean} - Whether user prefers reduced motion
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}
