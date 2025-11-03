/**
 * AGGRESSIVE CACHE BUSTER FOR WORK PAGE AND ALL LAZY-LOADED ROUTES
 *
 * This utility forcefully clears browser caches and ensures fresh content loads
 * Solves the persistent issue where Work page requires Ctrl+Shift+R to load changes
 */

const CACHE_VERSION_KEY = 'app_cache_version';
const CURRENT_CACHE_VERSION = Date.now().toString();

/**
 * Clear all browser caches (localStorage, sessionStorage, Service Worker caches)
 */
export async function clearAllCaches() {
  console.log('🧹 [CACHE BUSTER] Clearing all browser caches...');

  try {
    // Clear Service Worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('🧹 Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }

    // Clear localStorage (except critical auth data)
    const authKey = 'disruptors-ai-auth';
    const authData = localStorage.getItem(authKey);
    localStorage.clear();
    if (authData) {
      localStorage.setItem(authKey, authData);
    }

    // Clear sessionStorage
    sessionStorage.clear();

    console.log('✅ [CACHE BUSTER] All caches cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ [CACHE BUSTER] Error clearing caches:', error);
    return false;
  }
}

/**
 * Check if cache version has changed and force reload if needed
 */
export function checkCacheVersion() {
  const storedVersion = localStorage.getItem(CACHE_VERSION_KEY);
  const reloadAttemptKey = 'cache_reload_attempt';
  const reloadAttempt = sessionStorage.getItem(reloadAttemptKey);

  if (!storedVersion) {
    // First visit - set version
    localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
    console.log('🔍 [CACHE BUSTER] First visit - cache version set');
    return true;
  }

  if (storedVersion !== CURRENT_CACHE_VERSION) {
    // Prevent infinite reload loop
    if (reloadAttempt) {
      console.log('⚠️ [CACHE BUSTER] Reload already attempted this session');
      console.log('🔧 [CACHE BUSTER] Updating version without reload to prevent loop');
      localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
      return true;
    }

    console.log('⚠️ [CACHE BUSTER] Cache version mismatch!');
    console.log(`   Stored: ${storedVersion}`);
    console.log(`   Current: ${CURRENT_CACHE_VERSION}`);
    console.log('🔄 [CACHE BUSTER] Forcing cache clear and reload...');

    // Mark that we're attempting a reload to prevent infinite loops
    sessionStorage.setItem(reloadAttemptKey, 'true');

    clearAllCaches().then(() => {
      localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
      window.location.reload(true); // Force reload from server
    });

    return false;
  }

  console.log('✅ [CACHE BUSTER] Cache version is current');
  return true;
}

/**
 * Force reload with cache bypass on route change
 * This ensures lazy-loaded components always fetch fresh
 */
export function forceReloadRoute(path) {
  console.log(`🔄 [CACHE BUSTER] Force reloading route: ${path}`);

  // Add timestamp to URL to force fresh fetch
  const url = new URL(window.location.href);
  url.searchParams.set('_t', Date.now().toString());
  window.history.replaceState({}, '', url);

  // Clear any cached chunks related to this route
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        if (cacheName.includes('chunk') || cacheName.includes('page')) {
          console.log('🧹 Clearing route cache:', cacheName);
          caches.delete(cacheName);
        }
      });
    });
  }
}

/**
 * Add cache-busting parameters to dynamic imports
 * This is the KEY fix for lazy-loaded React components
 */
export function bustImportCache(importPath) {
  const timestamp = Date.now();
  return `${importPath}?v=${timestamp}`;
}

/**
 * Initialize cache buster on app load
 * Call this from main.jsx BEFORE React renders
 */
export function initCacheBuster() {
  console.log('🚀 [CACHE BUSTER] Initializing...');

  // Check cache version
  checkCacheVersion();

  // Listen for visibility changes (user returns to tab)
  // DISABLED: Can cause infinite reload loops
  // document.addEventListener('visibilitychange', () => {
  //   if (document.visibilityState === 'visible') {
  //     console.log('👁️ [CACHE BUSTER] Tab visible - checking for updates...');
  //     checkCacheVersion();
  //   }
  // });

  // Listen for online/offline events
  // DISABLED: Can cause infinite reload loops
  // window.addEventListener('online', () => {
  //   console.log('🌐 [CACHE BUSTER] Back online - checking for updates...');
  //   checkCacheVersion();
  // });

  // Force refresh on focus if page has been in background > 5 minutes
  let lastFocusTime = Date.now();
  window.addEventListener('blur', () => {
    lastFocusTime = Date.now();
  });

  window.addEventListener('focus', () => {
    const timeInBackground = Date.now() - lastFocusTime;
    const fiveMinutes = 5 * 60 * 1000;

    if (timeInBackground > fiveMinutes) {
      console.log('⏰ [CACHE BUSTER] Page was in background > 5 min - forcing refresh...');
      window.location.reload(true);
    }
  });

  console.log('✅ [CACHE BUSTER] Initialization complete');
}

/**
 * NUCLEAR OPTION: Force hard refresh
 * Use this when all else fails
 */
export function nuclearRefresh() {
  console.log('☢️  [CACHE BUSTER] NUCLEAR REFRESH INITIATED');

  // Clear everything
  clearAllCaches().then(() => {
    // Force reload with cache bypass
    window.location.reload(true);
  });
}
