import { FirecrawlScraper } from './scrapers/firecrawl.js';
import { PlaywrightScraper } from './scrapers/playwright.js';
import { BrandDetector } from './scrapers/brand-detect.js';
import { PageSpeedInsights } from './scrapers/pagespeed.js';
import { analyzeBusinessProfile } from './ai/analyzer.js';
import { detectOpportunities, calculateReadinessScore } from './ai/opportunities.js';

/**
 * @typedef {import('./types.js').StreamEvent} StreamEvent
 * @typedef {import('./types.js').BusinessProfile} BusinessProfile
 */

/**
 * @callback StreamCallback
 * @param {StreamEvent} event - Stream event
 * @returns {void}
 */

/**
 * Growth Audit Orchestrator - coordinates all scrapers and AI analyzers
 */
export class GrowthAuditOrchestrator {
  constructor() {
    this.firecrawl = new FirecrawlScraper();
    this.playwright = new PlaywrightScraper();
    this.brandDetector = new BrandDetector();
    this.pagespeed = new PageSpeedInsights();
  }

  /**
   * Run complete growth audit for a website
   * @param {string} url - Website URL to audit
   * @param {StreamCallback} [onStream] - Optional callback for streaming progress updates
   * @returns {Promise<BusinessProfile>} Complete business profile with opportunities
   */
  async runAudit(url, onStream) {
    try {
      // Step 1: Crawl the site
      onStream?.({ type: 'progress', tileId: 'crawl', status: 'pending', message: 'Crawling website...' });

      const pages = await this.firecrawl.crawlSite(url, 10);
      const siteMap = await this.firecrawl.mapSite(url);

      onStream?.({ type: 'progress', tileId: 'crawl', status: 'ready', payload: { pagesFound: pages.length } });

      // Step 2: Detect brand
      onStream?.({ type: 'progress', tileId: 'brand', status: 'pending', message: 'Detecting brand...' });

      let brandData = await this.brandDetector.detectFromDomain(url);

      if (!brandData) {
        // Fallback: extract from images
        const images = await this.playwright.extractImages(url);
        brandData = await this.brandDetector.extractFromImages(images);
      }

      onStream?.({
        type: 'tile',
        tileId: 'brand',
        status: 'ready',
        payload: brandData,
      });

      // Step 3: Run PageSpeed
      onStream?.({ type: 'progress', tileId: 'performance', status: 'pending', message: 'Running performance audit...' });

      const psiResult = await this.pagespeed.analyze(url, 'mobile');
      const webVitals = this.pagespeed.getCoreWebVitalsStatus(psiResult.metrics);

      onStream?.({
        type: 'tile',
        tileId: 'performance',
        status: 'ready',
        payload: { scores: psiResult.scores, metrics: psiResult.metrics, webVitals },
      });

      // Step 4: Extract schema & meta
      onStream?.({ type: 'progress', tileId: 'seo', status: 'pending', message: 'Analyzing SEO...' });

      const playwrightData = await this.playwright.scrapePage(url);
      const schemaTypes = playwrightData.metadata.jsonLd.map((ld) => ld['@type']).filter(Boolean);

      onStream?.({
        type: 'tile',
        tileId: 'seo',
        status: 'ready',
        payload: { schema: schemaTypes, og: playwrightData.metadata.ogTags },
      });

      // Step 5: AI Analysis
      onStream?.({ type: 'progress', tileId: 'analysis', status: 'pending', message: 'AI analyzing business profile...' });

      const profile = await analyzeBusinessProfile({
        domain: url,
        siteMarkdown: pages.map((p) => p.markdown),
        topPages: pages.slice(0, 5).map((p) => ({
          url: p.metadata.title || '',
          title: p.metadata.title,
          h1: p.metadata.ogTitle,
        })),
        metaSummary: playwrightData.metadata.ogTags['og:description'] || '',
        schemaTypes,
        psiScores: psiResult.scores,
        webVitals: psiResult.metrics,
        snippets: [],
      });

      profile.brand = {
        ...profile.brand,
        logoUrl: brandData?.logo,
        palette: brandData?.palette,
      };

      onStream?.({
        type: 'tile',
        tileId: 'profile',
        status: 'ready',
        payload: profile,
      });

      // Step 6: Detect Opportunities
      onStream?.({ type: 'progress', tileId: 'opportunities', status: 'pending', message: 'Identifying growth opportunities...' });

      const readinessScore = calculateReadinessScore(profile);
      const opportunityResult = await detectOpportunities(profile, readinessScore);

      profile.quickWins = opportunityResult.opportunities;

      onStream?.({
        type: 'tile',
        tileId: 'opportunities',
        status: 'ready',
        payload: {
          opportunities: opportunityResult.opportunities,
          readinessScore: opportunityResult.readinessScore,
        },
      });

      // Step 7: Complete
      onStream?.({ type: 'complete', tileId: 'all', status: 'ready', message: 'Analysis complete!' });

      await this.playwright.close();

      return profile;
    } catch (error) {
      console.error('Audit error:', error);
      onStream?.({
        type: 'error',
        tileId: 'system',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
