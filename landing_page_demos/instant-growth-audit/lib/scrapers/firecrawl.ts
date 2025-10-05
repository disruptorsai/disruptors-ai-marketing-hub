import FirecrawlApp from '@mendable/firecrawl-js';

export interface CrawlResult {
  markdown: string;
  html: string;
  metadata: {
    title?: string;
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
  links: string[];
}

export class FirecrawlScraper {
  private app: FirecrawlApp;

  constructor(apiKey?: string) {
    this.app = new FirecrawlApp({ apiKey: apiKey || process.env.FIRECRAWL_API_KEY || '' });
  }

  async scrapePage(url: string): Promise<CrawlResult> {
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

  async crawlSite(url: string, maxPages: number = 20): Promise<CrawlResult[]> {
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

      return (crawlResult.data || []).map((page: any) => ({
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

  async mapSite(url: string): Promise<string[]> {
    try {
      const result = await this.app.mapUrl(url);
      return result.links || [];
    } catch (error) {
      console.error('Firecrawl map error:', error);
      return [];
    }
  }
}
