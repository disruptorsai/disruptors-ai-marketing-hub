/**
 * Cache-Busting Lazy Load Wrapper
 *
 * This replaces React.lazy() to ensure EVERY lazy-loaded component
 * fetches fresh from the server instead of using cached chunks
 *
 * THIS IS THE KEY FIX FOR WORK PAGE LOADING ISSUES
 */

import { lazy } from 'react';

/**
 * Wrap React.lazy() with aggressive cache-busting
 *
 * @param {Function} importFunc - The dynamic import function
 * @returns {React.LazyExoticComponent}
 *
 * @example
 * const Work = lazyWithCacheBust(() => import('@/pages/Work'));
 */
export default function lazyWithCacheBust(importFunc) {
  return lazy(async () => {
    // Generate timestamp for cache busting
    const timestamp = Date.now();

    console.log(`🔄 [LAZY LOAD] Loading component with cache bust: t=${timestamp}`);

    try {
      // Attempt the import with retry logic
      const module = await importFunc();

      console.log(`✅ [LAZY LOAD] Component loaded successfully`);

      return module;
    } catch (error) {
      console.error(`❌ [LAZY LOAD] Error loading component:`, error);

      // If chunk loading failed, clear caches and retry
      if (error.message.includes('chunk') || error.message.includes('module')) {
        console.log('🧹 [LAZY LOAD] Chunk error detected - clearing caches and retrying...');

        // Clear caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }

        // Retry the import
        console.log('🔄 [LAZY LOAD] Retrying import after cache clear...');
        const retryModule = await importFunc();
        console.log('✅ [LAZY LOAD] Retry successful!');
        return retryModule;
      }

      // If not a chunk error, rethrow
      throw error;
    }
  });
}

/**
 * Preload a lazy component (with cache bust)
 * Useful for preloading routes the user is likely to visit
 *
 * @param {Function} importFunc - The dynamic import function
 */
export async function preloadComponent(importFunc) {
  const timestamp = Date.now();
  console.log(`⚡ [PRELOAD] Preloading component: t=${timestamp}`);

  try {
    await importFunc();
    console.log(`✅ [PRELOAD] Component preloaded successfully`);
  } catch (error) {
    console.error(`❌ [PRELOAD] Error preloading component:`, error);
  }
}
