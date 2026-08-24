import FirecrawlApp from '@mendable/firecrawl-js';

/**
 * @typedef {Object} CrawlResult
 * @property {string} markdown - Markdown content
 * @property {string} html - HTML content
 * @property {Object} metadata - Page metadata
 * @property {string} [metadata.title] - Page title
 * @property {string} [metadata.description] - Meta description
 * @property {string} [metadata.ogTitle] - Open Graph title
 * @property {string} [metadata.ogDescription] - Open Graph description
 * @property {string} [metadata.ogImage] - Open Graph image URL
 * @property {string[]} links - Links found on the page
 */

/**
 * Firecrawl scraper for web crawling and scraping
 */
export class FirecrawlScraper {
  /**
   * @param {string} [apiKey] - Firecrawl API key
   */
  constructor(apiKey) {
    this.app = new FirecrawlApp({
      apiKey: apiKey || process.env.VITE_FIRECRAWL_API_KEY || ''
    });
  }

  /**
   * Scrape a single page
   * @param {string} url - URL to scrape
   * @returns {Promise<CrawlResult>} Scrape result
   */
  async scrapePage(url) {
    try {
      const result = await this.app.scrapeUrl(url, {
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        includeTags: ['meta', 'title', 'script[type="application/ld+json"]'],
      });

      return {
        markdown: result.markdown || '',
        html: result.html || '',
        metadata: {
          title: result.metadata?.title,
          description: result.metadata?.description,
          ogTitle: result.metadata?.ogTitle,
          ogDescription: result.metadata?.ogDescription,
          ogImage: result.metadata?.ogImage,
        },
        links: result.links || [],
      };
    } catch (error) {
      console.error('Firecrawl scrape error:', error);
      throw new Error(`Failed to scrape ${url}`);
    }
  }

  /**
   * Crawl an entire site
   * @param {string} url - Base URL to crawl
   * @param {number} [maxPages=20] - Maximum number of pages to crawl
   * @returns {Promise<CrawlResult[]>} Array of crawl results
   */
  async crawlSite(url, maxPages = 20) {
    try {
      const crawlResult = await this.app.crawlUrl(url, {
        limit: maxPages,
        scrapeOptions: {
          formats: ['markdown', 'html'],
          onlyMainContent: true,
        },
      });

      if (!crawlResult.success) {
        throw new Error('Crawl failed');
      }

      return (crawlResult.data || []).map((page) => ({
        markdown: page.markdown || '',
        html: page.html || '',
        metadata: {
          title: page.metadata?.title,
          description: page.metadata?.description,
          ogTitle: page.metadata?.ogTitle,
          ogDescription: page.metadata?.ogDescription,
          ogImage: page.metadata?.ogImage,
        },
        links: page.links || [],
      }));
    } catch (error) {
      console.error('Firecrawl crawl error:', error);
      throw new Error(`Failed to crawl ${url}`);
    }
  }

  /**
   * Map site structure (get all URLs)
   * @param {string} url - Base URL to map
   * @returns {Promise<string[]>} Array of URLs
   */
  async mapSite(url) {
    try {
      const result = await this.app.mapUrl(url);
      return result.links || [];
    } catch (error) {
      console.error('Firecrawl map error:', error);
      return [];
    }
  }
}
