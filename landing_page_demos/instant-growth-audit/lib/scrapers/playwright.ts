import { chromium, Browser, Page } from 'playwright';

export interface PlaywrightResult {
  html: string;
  screenshot?: Buffer;
  metadata: {
    title: string;
    description?: string;
    ogTags: Record<string, string>;
    jsonLd: any[];
  };
}

export class PlaywrightScraper {
  private browser: Browser | null = null;

  async init() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapePage(url: string, takeScreenshot: boolean = false): Promise<PlaywrightResult> {
    await this.init();

    const page = await this.browser!.newPage();

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
      const ogTags: Record<string, string> = {};
      const ogElements = await page.locator('meta[property^="og:"]').all();
      for (const el of ogElements) {
        const property = await el.getAttribute('property');
        const content = await el.getAttribute('content');
        if (property && content) {
          ogTags[property] = content;
        }
      }

      // Extract JSON-LD
      const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
      const jsonLd: any[] = [];
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

      let screenshot: Buffer | undefined;
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

  async extractImages(url: string): Promise<string[]> {
    await this.init();
    const page = await this.browser!.newPage();

    try {
      await page.goto(url, { waitUntil: 'load' });

      const images = await page.locator('img[src]').all();
      const imageSrcs: string[] = [];

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
