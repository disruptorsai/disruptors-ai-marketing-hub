import { lazy } from 'react';

/**
 * Enhanced lazy loading with automatic retry and cache-busting on failure
 *
 * This solves the critical issue where:
 * 1. Users visit the site with cached old HTML
 * 2. Try to navigate to lazy-loaded pages (Work, Podcast, etc.)
 * 3. Browser tries to load old chunk files that no longer exist
 * 4. Lazy loading fails silently - page never loads
 * 5. Hard refresh works because it bypasses cache
 *
 * Solution:
 * - Wraps React.lazy() with retry logic
 * - On failure, does a hard reload to fetch fresh chunks
 * - Prevents infinite loops with sessionStorage flag
 * - Logs detailed error information for debugging
 *
 * @param {Function} importFunc - The dynamic import function (e.g., () => import('./Component.jsx'))
 * @param {number} maxRetries - Maximum number of retries before forcing reload (default: 1)
 * @returns {React.LazyExoticComponent} Lazy-loaded component with retry logic
 */
export function lazyWithRetry(importFunc, maxRetries = 1) {
  return lazy(async () => {
    const pageLoadKey = 'page-load-attempt';
    const hasRefreshed = sessionStorage.getItem(pageLoadKey);

    console.log('🔵 [lazyWithRetry] Starting import...');
    console.log('🔵 [lazyWithRetry] hasRefreshed:', hasRefreshed);

    try {
      // Try to import the component
      console.log('🔵 [lazyWithRetry] Calling importFunc()...');
      const component = await importFunc();
      console.log('✅ [lazyWithRetry] Import successful!', component);

      // Success! Clear the refresh flag
      sessionStorage.removeItem(pageLoadKey);

      return component;
    } catch (error) {
      // Log the error for debugging
      console.error('❌ [LAZY LOAD ERROR]', error);
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });

      // Check if this is a chunk loading error
      const isChunkError =
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('dynamically imported module') ||
        error?.message?.includes('Importing a module script failed') ||
        error?.message?.includes('Loading chunk') ||
        error?.code === 'MODULE_NOT_FOUND' ||
        error?.name === 'ChunkLoadError';

      if (isChunkError) {
        console.log('🔄 [CHUNK ERROR DETECTED] This is likely due to a cached old deployment');

        // If we haven't already tried refreshing, do it now
        if (!hasRefreshed || hasRefreshed === 'false') {
          console.log('🔄 [FORCING HARD RELOAD] Getting fresh chunks from server...');
          sessionStorage.setItem(pageLoadKey, 'true');

          // Hard reload to bypass cache
          window.location.reload(true);

          // Return a never-resolving promise to prevent error propagation
          // The page will reload before this matters
          return new Promise(() => {});
        } else {
          // We've already tried reloading once - show error
          console.error('🚨 [RELOAD FAILED] Chunk loading failed even after reload');
          console.error('🚨 This might indicate a deployment or CDN issue');

          // Clear the flag so next visit will try again
          sessionStorage.removeItem(pageLoadKey);
        }
      }

      // Re-throw non-chunk errors to be caught by error boundary
      throw error;
    }
  });
}

/**
 * Wrapper for lazy loading that adds a timeout
 * If the component doesn't load within the timeout, force a reload
 *
 * @param {Function} importFunc - The dynamic import function
 * @param {number} timeout - Timeout in milliseconds (default: 10000ms = 10 seconds)
 * @returns {React.LazyExoticComponent} Lazy-loaded component with timeout
 */
export function lazyWithTimeout(importFunc, timeout = 10000) {
  return lazy(() => {
    return Promise.race([
      importFunc(),
      new Promise((_, reject) =>
        setTimeout(() => {
          const error = new Error(`Component failed to load within ${timeout}ms - likely a chunk loading issue`);
          error.name = 'ChunkLoadError';
          error.code = 'TIMEOUT';
          reject(error);
        }, timeout)
      )
    ]);
  });
}

/**
 * Combined lazy loader with both retry and timeout
 * This is the recommended approach for production use
 *
 * @param {Function} importFunc - The dynamic import function
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Timeout in milliseconds (default: 10000)
 * @param {number} options.maxRetries - Maximum retries (default: 1)
 * @returns {React.LazyExoticComponent} Lazy-loaded component with full protection
 */
export function lazyWithRetryAndTimeout(importFunc, { timeout = 10000, maxRetries = 1 } = {}) {
  return lazyWithRetry(() => {
    return Promise.race([
      importFunc(),
      new Promise((_, reject) =>
        setTimeout(() => {
          const error = new Error(`Component failed to load within ${timeout}ms`);
          error.name = 'ChunkLoadError';
          error.code = 'TIMEOUT';
          reject(error);
        }, timeout)
      )
    ]);
  }, maxRetries);
}

export default lazyWithRetry;
