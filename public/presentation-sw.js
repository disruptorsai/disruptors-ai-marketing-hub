/**
 * Presentation Mode Service Worker
 * Caches all site assets for instant offline access
 */

const CACHE_VERSION = 'v1-presentation';
const CACHE_NAME = `disruptors-${CACHE_VERSION}`;

// Assets to cache immediately on install
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
];

// High-resolution videos to cache for presentations
const PRESENTATION_VIDEOS = [
  'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1760046691/dmsite/home/handshake-landscape.mp4',
  'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759116522/full-animation_online-video-cutter.com_zzpok1.mp4',
];

// High-resolution images to cache
const PRESENTATION_IMAGES = [
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758752837/logo_a4toul.png',
  'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/v1/disruptors-media/hero-poster.jpg',
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing presentation mode...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching critical assets');
      return cache.addAll(CRITICAL_ASSETS);
    }).then(() => {
      console.log('[Service Worker] Critical assets cached');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('disruptors-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[Service Worker] Activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome extensions
  if (request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[Service Worker] Serving from cache:', request.url);
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache responses from our domain and Cloudinary
        const shouldCache =
          request.url.startsWith(self.location.origin) ||
          request.url.includes('cloudinary.com') ||
          request.url.includes('res.cloudinary.com');

        if (shouldCache) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
            console.log('[Service Worker] Cached:', request.url);
          });
        }

        return response;
      }).catch((error) => {
        console.error('[Service Worker] Fetch failed:', error);
        throw error;
      });
    })
  );
});

// Message event - handle commands from the app
self.addEventListener('message', (event) => {
  if (event.data.type === 'DOWNLOAD_PRESENTATION_ASSETS' || event.data.type === 'CACHE_ASSETS') {
    console.log('[Service Worker] Downloading presentation assets...');
    downloadPresentationAssets(event.ports[0], event.data.timestamp);
  }

  if (event.data.type === 'GET_CACHE_STATUS') {
    getCacheStatus(event.ports[0]);
  }

  if (event.data.type === 'CLEAR_CACHE') {
    clearCache(event.ports[0]);
  }
});

/**
 * Download all presentation assets
 */
async function downloadPresentationAssets(port, timestamp) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const total = PRESENTATION_VIDEOS.length + PRESENTATION_IMAGES.length;
    let downloaded = 0;

    // Send progress update
    const sendProgress = () => {
      const percent = Math.round((downloaded / total) * 100);
      port.postMessage({
        type: 'CACHE_PROGRESS',
        progress: percent,
        downloaded,
        total
      });
    };

    // Download videos
    for (const videoUrl of PRESENTATION_VIDEOS) {
      try {
        // Fetch high-resolution version (no transformations)
        const response = await fetch(videoUrl);
        if (response.ok) {
          await cache.put(videoUrl, response);
          downloaded++;
          sendProgress();
          console.log(`[Service Worker] Cached video: ${videoUrl.split('/').pop()}`);
        }
      } catch (error) {
        console.error('[Service Worker] Failed to cache video:', error);
      }
    }

    // Download images
    for (const imageUrl of PRESENTATION_IMAGES) {
      try {
        // Fetch high-resolution version
        const highResUrl = imageUrl.replace('/f_auto,q_auto/', '/f_auto,q_100/');
        const response = await fetch(highResUrl);
        if (response.ok) {
          await cache.put(imageUrl, response);
          await cache.put(highResUrl, response);
          downloaded++;
          sendProgress();
          console.log(`[Service Worker] Cached image: ${imageUrl.split('/').pop()}`);
        }
      } catch (error) {
        console.error('[Service Worker] Failed to cache image:', error);
      }
    }

    // Get all pages and cache them
    const pages = [
      '/',
      '/about',
      '/solutions',
      '/podcast',
      '/blog',
      '/gallery',
      '/contact',
    ];

    for (const page of pages) {
      try {
        const response = await fetch(page);
        if (response.ok) {
          await cache.put(page, response);
          console.log(`[Service Worker] Cached page: ${page}`);
        }
      } catch (error) {
        console.error('[Service Worker] Failed to cache page:', error);
      }
    }

    // Save cache metadata
    const metadata = {
      timestamp: timestamp || Date.now(),
      version: CACHE_VERSION,
      itemCount: downloaded
    };

    await cache.put(
      '/cache-metadata.json',
      new Response(JSON.stringify(metadata), {
        headers: { 'Content-Type': 'application/json' }
      })
    );

    port.postMessage({
      type: 'CACHE_COMPLETE',
      success: true,
      cached: downloaded,
      metadata
    });

    console.log('[Service Worker] Presentation assets download complete');
  } catch (error) {
    console.error('[Service Worker] Download failed:', error);
    port.postMessage({
      type: 'CACHE_ERROR',
      success: false,
      error: error.message
    });
  }
}

/**
 * Get cache status
 */
async function getCacheStatus(port) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();

    const videos = keys.filter(req => req.url.includes('.mp4')).length;
    const images = keys.filter(req =>
      req.url.includes('.jpg') ||
      req.url.includes('.png') ||
      req.url.includes('.webp')
    ).length;
    const pages = keys.filter(req =>
      req.url.endsWith('/') ||
      req.url.includes('/about') ||
      req.url.includes('/solutions')
    ).length;

    // Calculate approximate cache size
    const cacheSize = keys.length;

    port.postMessage({
      type: 'CACHE_STATUS',
      videos,
      images,
      pages,
      total: cacheSize,
      ready: videos >= PRESENTATION_VIDEOS.length && images >= PRESENTATION_IMAGES.length
    });
  } catch (error) {
    console.error('[Service Worker] Failed to get cache status:', error);
    port.postMessage({
      type: 'CACHE_STATUS',
      error: error.message
    });
  }
}

/**
 * Clear cache
 */
async function clearCache(port) {
  try {
    await caches.delete(CACHE_NAME);
    console.log('[Service Worker] Cache cleared');
    port.postMessage({
      type: 'CACHE_CLEARED',
      success: true
    });
  } catch (error) {
    console.error('[Service Worker] Failed to clear cache:', error);
    port.postMessage({
      type: 'CACHE_CLEARED',
      success: false,
      error: error.message
    });
  }
}
