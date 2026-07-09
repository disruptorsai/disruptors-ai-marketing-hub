/**
 * Resource Priority Manager
 * Centralized system for managing resource loading priorities
 *
 * Features:
 * - Priority-based resource loading
 * - Connection-aware resource management
 * - Critical resource identification
 * - Performance monitoring
 * - Automatic optimization
 */

/**
 * Resource priority levels
 */
export const PRIORITY = {
  CRITICAL: 'critical',  // Must load immediately (LCP, FCP)
  HIGH: 'high',          // Important, load soon
  MEDIUM: 'medium',      // Normal priority
  LOW: 'low',            // Can wait
  IDLE: 'idle'           // Load when browser is idle
};

/**
 * Resource types
 */
export const RESOURCE_TYPE = {
  IMAGE: 'image',
  VIDEO: 'video',
  SCRIPT: 'script',
  STYLE: 'style',
  FONT: 'font',
  FETCH: 'fetch',
  DOCUMENT: 'document'
};

/**
 * Critical resources that should load immediately
 * These affect LCP (Largest Contentful Paint) and FCP (First Contentful Paint)
 */
const CRITICAL_RESOURCES = [
  // Critical images (hero, logo)
  'https://ulfnzcniivkjtfaoxfmi.supabase.co/storage/v1/object/public/site-images/disruptors-media/brand/logos/gold-logo-banner.png',

  // Critical fonts (if any)

  // Critical styles are already inlined in HTML
];

/**
 * Resource Priority Manager Class
 */
class ResourcePriorityManager {
  constructor() {
    this.loadedResources = new Set();
    this.pendingResources = new Map();
    this.observers = new Map();
    this.connectionQuality = 'good';

    this.init();
  }

  init() {
    // Monitor connection quality
    this.monitorConnection();

    // Track resource loading performance
    this.trackPerformance();

    console.log('🎯 Resource Priority Manager initialized');
  }

  /**
   * Monitor network connection quality
   */
  monitorConnection() {
    const connection = navigator.connection ||
                      navigator.mozConnection ||
                      navigator.webkitConnection;

    if (connection) {
      const updateQuality = () => {
        const effectiveType = connection.effectiveType || '4g';

        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          this.connectionQuality = 'poor';
        } else if (effectiveType === '3g') {
          this.connectionQuality = 'moderate';
        } else {
          this.connectionQuality = 'good';
        }

        console.log('🌐 Connection quality updated:', this.connectionQuality);
      };

      updateQuality();
      connection.addEventListener('change', updateQuality);
    }
  }

  /**
   * Track resource loading performance
   */
  trackPerformance() {
    if (!window.PerformanceObserver) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const duration = entry.responseEnd - entry.fetchStart;

          if (duration > 1000) {
            console.warn(`⚠️ Slow resource: ${entry.name.split('/').pop()} (${Math.round(duration)}ms)`);
          }
        }

        if (entry.entryType === 'largest-contentful-paint') {
          console.log(`🎨 LCP: ${Math.round(entry.renderTime || entry.loadTime)}ms`);
        }
      }
    });

    // Only observe entry types the browser actually supports. 'first-contentful-paint'
    // is not a valid observer entryType (paint timing is exposed via 'paint'), so
    // requesting it directly triggers a console warning in the browser.
    const wanted = ['resource', 'largest-contentful-paint', 'paint'];
    const supported = (PerformanceObserver.supportedEntryTypes || wanted).filter((t) => wanted.includes(t));
    if (supported.length) observer.observe({ entryTypes: supported });
  }

  /**
   * Load a resource with specified priority
   * @param {string} url - Resource URL
   * @param {string} type - Resource type
   * @param {string} priority - Priority level
   * @param {Object} options - Additional options
   */
  loadResource(url, type, priority = PRIORITY.MEDIUM, options = {}) {
    if (this.loadedResources.has(url)) {
      return Promise.resolve();
    }

    // Adjust priority based on connection quality
    const adjustedPriority = this.adjustPriorityForConnection(priority);

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');

      // Set relationship based on priority
      if (adjustedPriority === PRIORITY.CRITICAL || adjustedPriority === PRIORITY.HIGH) {
        link.rel = 'preload';
      } else {
        link.rel = 'prefetch';
      }

      link.as = type;
      link.href = url;

      if (options.crossOrigin) {
        link.crossOrigin = options.crossOrigin;
      }

      // Use fetchpriority attribute for supported browsers
      if ('fetchpriority' in link) {
        if (adjustedPriority === PRIORITY.CRITICAL) {
          link.fetchpriority = 'high';
        } else if (adjustedPriority === PRIORITY.LOW || adjustedPriority === PRIORITY.IDLE) {
          link.fetchpriority = 'low';
        }
      }

      link.onload = () => {
        this.loadedResources.add(url);
        resolve();
      };

      link.onerror = () => {
        console.warn(`❌ Failed to load resource: ${url.split('/').pop()}`);
        reject(new Error(`Failed to load ${url}`));
      };

      // For idle priority, use requestIdleCallback
      if (adjustedPriority === PRIORITY.IDLE && 'requestIdleCallback' in window) {
        requestIdleCallback(() => {
          document.head.appendChild(link);
        });
      } else {
        document.head.appendChild(link);
      }

      console.log(`📦 Loading ${type} with ${adjustedPriority} priority:`, url.split('/').pop());
    });
  }

  /**
   * Adjust priority based on connection quality
   * @param {string} priority - Original priority
   * @returns {string} - Adjusted priority
   */
  adjustPriorityForConnection(priority) {
    if (this.connectionQuality === 'poor') {
      // On poor connections, only load critical resources
      if (priority === PRIORITY.CRITICAL) return PRIORITY.CRITICAL;
      if (priority === PRIORITY.HIGH) return PRIORITY.MEDIUM;
      return PRIORITY.IDLE;
    }

    if (this.connectionQuality === 'moderate') {
      // On moderate connections, downgrade low priority
      if (priority === PRIORITY.LOW) return PRIORITY.IDLE;
    }

    return priority;
  }

  /**
   * Preload critical resources immediately
   */
  preloadCritical() {
    CRITICAL_RESOURCES.forEach((url) => {
      const type = this.getResourceType(url);
      this.loadResource(url, type, PRIORITY.CRITICAL);
    });
  }

  /**
   * Get resource type from URL
   * @param {string} url - Resource URL
   * @returns {string} - Resource type
   */
  getResourceType(url) {
    if (url.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) return RESOURCE_TYPE.IMAGE;
    if (url.match(/\.(mp4|webm|mov)$/i)) return RESOURCE_TYPE.VIDEO;
    if (url.match(/\.(js|mjs)$/i)) return RESOURCE_TYPE.SCRIPT;
    if (url.match(/\.(css)$/i)) return RESOURCE_TYPE.STYLE;
    if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return RESOURCE_TYPE.FONT;
    return RESOURCE_TYPE.FETCH;
  }

  /**
   * Preload next navigation target
   * @param {string} url - Page URL
   */
  preloadPage(url) {
    if (this.connectionQuality === 'poor') return;

    this.loadResource(url, RESOURCE_TYPE.DOCUMENT, PRIORITY.LOW);
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    if (!window.performance) return null;

    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    return {
      loadTime: navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : null,
      domContentLoaded: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart) : null,
      fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || null,
      resourceCount: this.loadedResources.size,
      connectionQuality: this.connectionQuality
    };
  }
}

// Singleton instance
let managerInstance = null;

/**
 * Get the resource priority manager instance
 * @returns {ResourcePriorityManager}
 */
export function getResourcePriorityManager() {
  if (!managerInstance) {
    managerInstance = new ResourcePriorityManager();
  }
  return managerInstance;
}

/**
 * Initialize and preload critical resources
 */
export function initResourcePriority() {
  const manager = getResourcePriorityManager();
  manager.preloadCritical();
  return manager;
}

/**
 * Preload a resource with priority
 * @param {string} url - Resource URL
 * @param {string} priority - Priority level
 * @param {Object} options - Options
 */
export function preloadWithPriority(url, priority = PRIORITY.MEDIUM, options = {}) {
  const manager = getResourcePriorityManager();
  const type = manager.getResourceType(url);
  return manager.loadResource(url, type, priority, options);
}

export default ResourcePriorityManager;
