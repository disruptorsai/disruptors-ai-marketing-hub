/**
 * Smart Preloading System
 * Intelligently preloads resources based on user behavior and connection quality
 *
 * Features:
 * - Hover-based navigation prefetching
 * - Scroll-based content preloading
 * - Connection-aware (respects slow connections)
 * - Intersection Observer for viewport-based loading
 * - Mouse velocity tracking for intent prediction
 */

import { useState, useEffect, useRef } from 'react';
import { useConnectionQuality } from './useConnectionQuality';

/**
 * Track which resources have been preloaded to avoid duplicates
 */
const preloadedResources = new Set();

/**
 * Preload a resource (image, video, script, style)
 * @param {string} url - Resource URL
 * @param {string} as - Resource type: 'image', 'video', 'script', 'style', 'fetch'
 * @param {Object} options - Additional options
 */
export function preloadResource(url, as = 'fetch', options = {}) {
  if (!url || preloadedResources.has(url)) return;

  try {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = as;
    link.href = url;

    if (options.crossOrigin) {
      link.crossOrigin = options.crossOrigin;
    }

    if (options.fetchPriority) {
      link.fetchpriority = options.fetchPriority;
    }

    document.head.appendChild(link);
    preloadedResources.add(url);

    console.log(`🔮 Preloading ${as}:`, url.split('/').pop());
  } catch (error) {
    console.warn('Preload failed:', error);
  }
}

/**
 * Hook for hover-based navigation prefetching
 * Preloads page assets when user hovers over links
 */
export function useNavigationPrefetch() {
  const { quality, preset } = useConnectionQuality();
  const hoverTimers = useRef(new Map());

  useEffect(() => {
    // Only prefetch on good connections
    if (quality === 'poor' || quality === 'offline') {
      return;
    }

    const handleMouseEnter = (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      // Wait 150ms before prefetching (user must show intent)
      const timer = setTimeout(() => {
        // For internal links, prefetch the page
        if (href.startsWith('/') || href.includes(window.location.hostname)) {
          preloadResource(href, 'document', { fetchPriority: 'low' });
        }
      }, 150);

      hoverTimers.current.set(link, timer);
    };

    const handleMouseLeave = (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const timer = hoverTimers.current.get(link);
      if (timer) {
        clearTimeout(timer);
        hoverTimers.current.delete(link);
      }
    };

    // Add listeners to document
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);

      // Clear all timers
      hoverTimers.current.forEach(timer => clearTimeout(timer));
      hoverTimers.current.clear();
    };
  }, [quality]);
}

/**
 * Hook for scroll-based content preloading
 * Preloads content before it enters viewport
 */
export function useScrollPreloading(options = {}) {
  const { quality, preset } = useConnectionQuality();
  const [preloadQueue, setPreloadQueue] = useState([]);

  useEffect(() => {
    // Only preload on moderate+ connections
    if (quality === 'poor' || quality === 'offline') {
      return;
    }

    // Get preload margin based on viewport and connection
    const getPreloadMargin = () => {
      const width = window.innerWidth;

      if (quality === 'excellent') {
        if (width >= 2560) return '1000px';
        if (width >= 1920) return '800px';
        return '600px';
      }

      if (quality === 'good') {
        if (width >= 2560) return '800px';
        if (width >= 1920) return '600px';
        return '400px';
      }

      return '400px';
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;

            // Preload images
            const images = element.querySelectorAll('img[data-src]');
            images.forEach((img) => {
              const src = img.getAttribute('data-src');
              if (src) {
                preloadResource(src, 'image', { fetchPriority: 'low' });
              }
            });

            // Preload videos
            const videos = element.querySelectorAll('video[data-src]');
            videos.forEach((video) => {
              const src = video.getAttribute('data-src');
              if (src && preset.enableVideo) {
                preloadResource(src, 'video', { fetchPriority: 'low' });
              }
            });

            // Disconnect after preloading
            observer.unobserve(element);
          }
        });
      },
      {
        rootMargin: getPreloadMargin(),
        threshold: 0.01
      }
    );

    // Observe all sections
    const sections = document.querySelectorAll('section[data-preload]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [quality, preset]);

  return preloadQueue;
}

/**
 * Hook for mouse velocity tracking
 * Detects fast mouse movement to predict navigation intent
 */
export function useMouseIntent() {
  const [intent, setIntent] = useState({
    direction: null,
    velocity: 0,
    targetElement: null
  });

  const lastPosition = useRef({ x: 0, y: 0, time: Date.now() });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const now = Date.now();
      const deltaTime = now - lastPosition.current.time;

      if (deltaTime < 50) return; // Sample every 50ms

      const deltaX = e.clientX - lastPosition.current.x;
      const deltaY = e.clientY - lastPosition.current.y;
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      const velocity = distance / deltaTime;

      // Detect direction
      let direction = null;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      setIntent({
        direction,
        velocity,
        targetElement: e.target
      });

      lastPosition.current = { x: e.clientX, y: e.clientY, time: now };
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return intent;
}

/**
 * Master hook that combines all preloading strategies
 */
export function useSmartPreloading() {
  useNavigationPrefetch();
  useScrollPreloading();

  const mouseIntent = useMouseIntent();
  const { quality } = useConnectionQuality();

  return {
    quality,
    mouseIntent,
    preloadResource
  };
}
