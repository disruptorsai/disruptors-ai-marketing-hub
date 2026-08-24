import { chromium } from 'playwright';

/**
 * @typedef {Object} PlaywrightResult
 * @property {string} html - Full HTML content
 * @property {Buffer} [screenshot] - Screenshot buffer (if requested)
 * @property {Object} metadata - Page metadata
 * @property {string} metadata.title - Page title
 * @property {string} [metadata.description] - Meta description
 * @property {Record<string, string>} metadata.ogTags - Open Graph tags
 * @property {Array<any>} metadata.jsonLd - JSON-LD structured data
 */

/**
 * Playwright scraper for advanced page scraping and metadata extraction
 */
export class PlaywrightScraper {
  constructor() {
    /** @type {import('playwright').Browser | null} */
    this.browser = null;
  }

  /**
   * Initialize the browser
   * @returns {Promise<void>}
   */
  async init() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
  }

  /**
   * Close the browser
   * @returns {Promise<void>}
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Scrape a page with advanced metadata extraction
   * @param {string} url - URL to scrape
   * @param {boolean} [takeScreenshot=false] - Whether to take a screenshot
   * @returns {Promise<PlaywrightResult>} Scrape result
   */
  async scrapePage(url, takeScreenshot = false) {
    await this.init();

    const page = await this.browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      const html = await page.content();
      const title = await page.title();

      // Extract meta tags
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute('content')
        .catch(() => undefined);

      // Extract Open Graph tags
      /** @type {Record<string, string>} */
      const ogTags = {};
      const ogElements = await page.locator('meta[property^="og:"]').all();
      for (const el of ogElements) {
        const property = await el.getAttribute('property');
        const content = await el.getAttribute('content');
        if (property && content) {
          ogTags[property] = content;
        }
      }

      // Extract JSON-LD structured data
      const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
      /** @type {Array<any>} */
      const jsonLd = [];
      for (const script of jsonLdScripts) {
        try {
          const content = await script.textContent();
          if (content) {
            jsonLd.push(JSON.parse(content));
          }
        } catch (e) {
          // Invalid JSON-LD, skip
        }
      }

      let screenshot;
      if (takeScreenshot) {
        screenshot = await page.screenshot({ fullPage: false, type: 'png' });
      }

      await page.close();

      return {
        html,
        screenshot,
        metadata: {
          title,
          description,
          ogTags,
          jsonLd,
        },
      };
    } catch (error) {
      await page.close();
      console.error('Playwright scrape error:', error);
      throw new Error(`Failed to scrape ${url} with Playwright`);
    }
  }

  /**
   * Extract image URLs from a page
   * @param {string} url - URL to extract images from
   * @returns {Promise<string[]>} Array of image URLs
   */
  async extractImages(url) {
    await this.init();
    const page = await this.browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'load' });

      const images = await page.locator('img[src]').all();
      const imageSrcs = [];

      for (const img of images) {
        const src = await img.getAttribute('src');
        if (src && !src.startsWith('data:')) {
          try {
            const absoluteUrl = new URL(src, url).toString();
            imageSrcs.push(absoluteUrl);
          } catch {
            // Invalid URL, skip
          }
        }
      }

      await page.close();
      return imageSrcs;
    } catch (error) {
      await page.close();
      throw error;
    }
  }
}
