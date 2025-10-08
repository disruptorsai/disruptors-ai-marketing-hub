/**
 * Universal Job Storage
 *
 * Platform-agnostic job storage that works on both Netlify and Vercel:
 * - Netlify: Uses in-memory Map (ephemeral, single instance)
 * - Vercel: Uses Vercel KV (Redis, persistent, multi-instance)
 *
 * Automatically detects the platform and uses the appropriate storage backend.
 */

// Platform detection
const isVercel = process.env.VERCEL === '1';
const hasVercelKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

// Storage backends
let kvStorage = null;
const memoryStorage = new Map();

// Initialize Vercel KV if available (async import)
let kvInitialized = false;

async function initKV() {
  if (kvInitialized) return;

  if (isVercel && hasVercelKV) {
    try {
      const { kv } = await import('@vercel/kv');
      kvStorage = kv;
      console.log('✅ Using Vercel KV for job storage');
    } catch (error) {
      console.warn('⚠️ Vercel KV not available, falling back to in-memory storage', error);
    }
  } else {
    console.log('✅ Using in-memory storage for jobs (Netlify mode)');
  }

  kvInitialized = true;
}

/**
 * Storage interface - all methods are async for consistency
 */
export const JobStorage = {
  /**
   * Store a job with optional TTL
   * @param {string} key - Job ID
   * @param {object} value - Job data
   * @param {number} ttl - Time to live in seconds (default: 3600 = 1 hour)
   */
  async set(key, value, ttl = 3600) {
    await initKV();

    if (kvStorage) {
      // Vercel KV with TTL
      await kvStorage.set(key, JSON.stringify(value), { ex: ttl });
    } else {
      // In-memory storage (no TTL support, manual cleanup needed)
      memoryStorage.set(key, {
        value,
        expiry: Date.now() + ttl * 1000,
      });
    }
  },

  /**
   * Get a job by ID
   * @param {string} key - Job ID
   * @returns {Promise<object|null>} Job data or null if not found
   */
  async get(key) {
    await initKV();

    if (kvStorage) {
      // Vercel KV
      const data = await kvStorage.get(key);
      return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
    } else {
      // In-memory storage with expiry check
      const entry = memoryStorage.get(key);
      if (!entry) return null;

      // Check if expired
      if (entry.expiry < Date.now()) {
        memoryStorage.delete(key);
        return null;
      }

      return entry.value;
    }
  },

  /**
   * Delete a job
   * @param {string} key - Job ID
   */
  async delete(key) {
    await initKV();

    if (kvStorage) {
      await kvStorage.del(key);
    } else {
      memoryStorage.delete(key);
    }
  },

  /**
   * Check if a job exists
   * @param {string} key - Job ID
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    await initKV();

    if (kvStorage) {
      return (await kvStorage.exists(key)) === 1;
    } else {
      const entry = memoryStorage.get(key);
      if (!entry) return false;

      // Check if expired
      if (entry.expiry < Date.now()) {
        memoryStorage.delete(key);
        return false;
      }

      return true;
    }
  },

  /**
   * Get all job IDs (for debugging)
   * @returns {Promise<string[]>}
   */
  async keys(pattern = '*') {
    await initKV();

    if (kvStorage) {
      return await kvStorage.keys(pattern);
    } else {
      // Return non-expired keys only
      const now = Date.now();
      const validKeys = [];

      for (const [key, entry] of memoryStorage.entries()) {
        if (entry.expiry >= now) {
          validKeys.push(key);
        } else {
          memoryStorage.delete(key);
        }
      }

      return validKeys;
    }
  },

  /**
   * Clean up expired entries (in-memory only)
   * Call this periodically if using in-memory storage
   */
  async cleanup() {
    if (!kvStorage) {
      const now = Date.now();
      for (const [key, entry] of memoryStorage.entries()) {
        if (entry.expiry < now) {
          memoryStorage.delete(key);
        }
      }
    }
  },

  /**
   * Get storage info (for debugging)
   * @returns {Promise<object>}
   */
  async getStorageInfo() {
    await initKV();

    return {
      platform: isVercel ? 'vercel' : 'netlify',
      backend: kvStorage ? 'Vercel KV (Redis)' : 'In-Memory Map',
      persistent: kvStorage ? true : false,
      jobCount: kvStorage ? (await this.keys()).length : memoryStorage.size,
    };
  },
};

// Periodic cleanup for in-memory storage (runs every 5 minutes)
if (!kvStorage) {
  setInterval(() => {
    JobStorage.cleanup().catch((error) => {
      console.error('Error cleaning up expired jobs:', error);
    });
  }, 5 * 60 * 1000);
}

export default JobStorage;
