/**
 * Screenshot Capture System for Disruptors AI Marketing Hub
 *
 * Integrates with Playwright for headless browser screenshots
 * Stores screenshots in Cloudinary with organized folder structure
 * Saves metadata to Supabase for searching and comparison
 *
 * @module screenshot-capture
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Viewport configurations for responsive screenshots
 */
export const VIEWPORTS = {
  desktop: { width: 1920, height: 1080, suffix: 'desktop' },
  tablet: { width: 768, height: 1024, suffix: 'tablet' },
  mobile: { width: 375, height: 667, suffix: 'mobile' },
  largeDesktop: { width: 2560, height: 1440, suffix: 'large-desktop' }
};

/**
 * Screenshot capture configuration
 */
const DEFAULT_CONFIG = {
  baseUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  cloudinaryFolder: 'disruptors-media/screenshots',
  fullPage: true,
  quality: 90,
  type: 'png'
};

/**
 * ScreenshotCapture class
 * Handles all screenshot capture operations
 */
export class ScreenshotCapture {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cloudinaryClient = null;
    this.supabaseClient = null;
  }

  /**
   * Initialize with required clients
   * @param {Object} cloudinaryClient - Cloudinary client instance
   * @param {Object} supabaseClient - Supabase client instance
   */
  async initialize(cloudinaryClient, supabaseClient) {
    this.cloudinaryClient = cloudinaryClient;
    this.supabaseClient = supabaseClient;
  }

  /**
   * Capture screenshot using Playwright (server-side only)
   * This method should be called from Node.js environment
   *
   * @param {Object} options - Screenshot options
   * @param {string} options.pageRoute - Page route (e.g., '/home', '/about')
   * @param {string} options.changeDescription - Description of the change
   * @param {string} options.viewport - Viewport size (desktop|tablet|mobile|largeDesktop)
   * @param {boolean} options.capturedBeforeChange - Whether this is a before or after screenshot
   * @param {string} options.relatedChangeId - ID linking before/after screenshots
   * @returns {Promise<Object>} Screenshot metadata
   */
  async captureWithPlaywright(options) {
    const {
      pageRoute,
      changeDescription,
      viewport = 'desktop',
      capturedBeforeChange = true,
      relatedChangeId = null
    } = options;

    // This will be implemented in the CLI tool
    // Browser environments will use the API endpoint instead
    throw new Error('captureWithPlaywright must be called from Node.js environment. Use captureScreenshot() from browser.');
  }

  /**
   * Capture screenshot via API endpoint (browser-safe)
   *
   * @param {Object} options - Screenshot options
   * @returns {Promise<Object>} Screenshot metadata
   */
  async captureScreenshot(options) {
    try {
      const response = await fetch('/api/screenshot/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Screenshot capture failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      throw error;
    }
  }

  /**
   * Upload screenshot buffer to Cloudinary
   *
   * @param {Buffer} screenshotBuffer - Screenshot image buffer
   * @param {Object} metadata - Screenshot metadata
   * @returns {Promise<string>} Cloudinary URL
   */
  async uploadToCloudinary(screenshotBuffer, metadata) {
    const { pageRoute, changeDescription, timestamp, viewport } = metadata;

    // Generate organized folder path: screenshots/2025/01/06/
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const folderPath = `${this.config.cloudinaryFolder}/${year}/${month}/${day}`;

    // Generate filename: home_full-width-header-to-contained_20250106-143022_desktop
    const timestampStr = this.formatTimestamp(date);
    const pageSlug = pageRoute.replace(/^\//, '').replace(/\//g, '-') || 'home';
    const changeSlug = this.slugify(changeDescription);
    const filename = `${pageSlug}_${changeSlug}_${timestampStr}_${viewport}`;

    // Upload to Cloudinary
    // Note: This requires server-side Cloudinary SDK
    // Browser uploads should go through the API endpoint
    try {
      const uploadResult = await this.cloudinaryClient.uploader.upload(
        `data:image/png;base64,${screenshotBuffer.toString('base64')}`,
        {
          folder: folderPath,
          public_id: filename,
          resource_type: 'image',
          type: 'upload',
          tags: ['screenshot', pageSlug, viewport],
          context: {
            page_route: pageRoute,
            change_description: changeDescription,
            viewport: viewport,
            captured_at: timestamp
          }
        }
      );

      return uploadResult.secure_url;
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw error;
    }
  }

  /**
   * Save screenshot metadata to Supabase
   *
   * @param {Object} metadata - Screenshot metadata
   * @returns {Promise<Object>} Saved record
   */
  async saveMetadata(metadata) {
    try {
      const { data, error } = await this.supabaseClient
        .from('page_screenshots')
        .insert([metadata])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to save screenshot metadata:', error);
      throw error;
    }
  }

  /**
   * Get all screenshots for a specific page
   *
   * @param {string} pageRoute - Page route
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Screenshots
   */
  async getScreenshotsByPage(pageRoute, filters = {}) {
    try {
      let query = this.supabaseClient
        .from('page_screenshots')
        .select('*')
        .eq('page_route', pageRoute)
        .order('captured_at', { ascending: false });

      if (filters.viewport) {
        query = query.eq('viewport_size', filters.viewport);
      }

      if (filters.startDate) {
        query = query.gte('captured_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('captured_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to get screenshots:', error);
      throw error;
    }
  }

  /**
   * Get before/after screenshot pairs
   *
   * @param {string} relatedChangeId - Related change ID
   * @returns {Promise<Object>} Before and after screenshots
   */
  async getBeforeAfterPair(relatedChangeId) {
    try {
      const { data, error } = await this.supabaseClient
        .from('page_screenshots')
        .select('*')
        .eq('related_change_id', relatedChangeId)
        .order('captured_at', { ascending: true });

      if (error) throw error;

      const before = data.find(s => s.captured_before_change === true);
      const after = data.find(s => s.captured_before_change === false);

      return { before, after };
    } catch (error) {
      console.error('Failed to get before/after pair:', error);
      throw error;
    }
  }

  /**
   * Delete old screenshots
   *
   * @param {number} daysOld - Delete screenshots older than this many days
   * @returns {Promise<number>} Number of deleted screenshots
   */
  async deleteOldScreenshots(daysOld = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await this.supabaseClient
        .from('page_screenshots')
        .delete()
        .lt('captured_at', cutoffDate.toISOString())
        .select();

      if (error) throw error;

      return data.length;
    } catch (error) {
      console.error('Failed to delete old screenshots:', error);
      throw error;
    }
  }

  /**
   * Helper: Format timestamp for filenames
   *
   * @param {Date} date - Date object
   * @returns {string} Formatted timestamp (YYYYMMDD-HHMMSS)
   */
  formatTimestamp(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
  }

  /**
   * Helper: Convert string to URL-safe slug
   *
   * @param {string} text - Text to slugify
   * @returns {string} Slugified text
   */
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50); // Limit length
  }

  /**
   * Generate screenshot metadata object
   *
   * @param {Object} options - Screenshot options
   * @returns {Object} Metadata object
   */
  generateMetadata(options) {
    const {
      pageRoute,
      changeDescription,
      screenshotUrl,
      viewport,
      capturedBeforeChange = true,
      relatedChangeId = null
    } = options;

    return {
      id: uuidv4(),
      page_route: pageRoute,
      change_description: changeDescription,
      screenshot_url: screenshotUrl,
      viewport_size: viewport,
      captured_at: new Date().toISOString(),
      captured_before_change: capturedBeforeChange,
      related_change_id: relatedChangeId || uuidv4()
    };
  }
}

/**
 * Singleton instance for browser use
 */
export const screenshotCapture = new ScreenshotCapture();

export default ScreenshotCapture;
