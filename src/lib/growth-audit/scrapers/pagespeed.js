/**
 * @typedef {Object} PageSpeedScores
 * @property {number} performance - Performance score (0-100)
 * @property {number} accessibility - Accessibility score (0-100)
 * @property {number} bestPractices - Best practices score (0-100)
 * @property {number} seo - SEO score (0-100)
 */

/**
 * @typedef {Object} PageSpeedMetrics
 * @property {number} [lcp] - Largest Contentful Paint (ms)
 * @property {number} [inp] - Interaction to Next Paint (ms)
 * @property {number} [cls] - Cumulative Layout Shift
 * @property {number} [fcp] - First Contentful Paint (ms)
 * @property {number} [tti] - Time to Interactive (ms)
 */

/**
 * @typedef {Object} PageSpeedOpportunity
 * @property {string} title - Opportunity title
 * @property {string} description - Opportunity description
 * @property {number} savings - Potential savings (ms or score)
 */

/**
 * @typedef {Object} PageSpeedResult
 * @property {PageSpeedScores} scores - Lighthouse scores
 * @property {PageSpeedMetrics} metrics - Core Web Vitals and other metrics
 * @property {PageSpeedOpportunity[]} opportunities - Performance opportunities
 */

/**
 * PageSpeed Insights API client
 */
export class PageSpeedInsights {
  /**
   * @param {string} [apiKey] - Google PageSpeed Insights API key (optional)
   */
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.VITE_PAGESPEED_API_KEY || '';
  }

  /**
   * Analyze a URL with PageSpeed Insights
   * @param {string} url - URL to analyze
   * @param {'mobile' | 'desktop'} [strategy='mobile'] - Analysis strategy
   * @returns {Promise<PageSpeedResult>} PageSpeed analysis result
   */
  async analyze(url, strategy = 'mobile') {
    try {
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        url
      )}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo${
        this.apiKey ? `&key=${this.apiKey}` : ''
      }`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`PageSpeed API error: ${response.statusText}`);
      }

      const data = await response.json();

      const lighthouseResult = data.lighthouseResult;
      const audits = lighthouseResult.audits;

      // Extract scores
      const scores = {
        performance: Math.round(lighthouseResult.categories.performance.score * 100),
        accessibility: Math.round(lighthouseResult.categories.accessibility.score * 100),
        bestPractices: Math.round(lighthouseResult.categories['best-practices'].score * 100),
        seo: Math.round(lighthouseResult.categories.seo.score * 100),
      };

      // Extract Core Web Vitals
      const metrics = {
        lcp: audits['largest-contentful-paint']?.numericValue,
        inp: audits['interaction-to-next-paint']?.numericValue,
        cls: audits['cumulative-layout-shift']?.numericValue,
        fcp: audits['first-contentful-paint']?.numericValue,
        tti: audits['interactive']?.numericValue,
      };

      // Extract top opportunities
      const opportunities = Object.entries(audits)
        .filter(([key, audit]) => audit.score !== null && audit.score < 0.9 && audit.numericValue)
        .map(([key, audit]) => ({
          title: audit.title,
          description: audit.description,
          savings: audit.numericValue || 0,
        }))
        .sort((a, b) => b.savings - a.savings)
        .slice(0, 10);

      return {
        scores,
        metrics,
        opportunities,
      };
    } catch (error) {
      console.error('PageSpeed Insights error:', error);
      throw new Error('Failed to analyze with PageSpeed Insights');
    }
  }

  /**
   * Analyze URL for both mobile and desktop
   * @param {string} url - URL to analyze
   * @returns {Promise<{mobile: PageSpeedResult, desktop: PageSpeedResult}>} Mobile and desktop results
   */
  async analyzeBoth(url) {
    const [mobile, desktop] = await Promise.all([
      this.analyze(url, 'mobile'),
      this.analyze(url, 'desktop'),
    ]);

    return { mobile, desktop };
  }

  /**
   * Get Core Web Vitals status ratings
   * @param {PageSpeedMetrics} metrics - PageSpeed metrics
   * @returns {{lcp: string, inp: string, cls: string}} Status for each vital
   */
  getCoreWebVitalsStatus(metrics) {
    const lcpStatus = !metrics.lcp
      ? 'needs-improvement'
      : metrics.lcp <= 2500
      ? 'good'
      : metrics.lcp <= 4000
      ? 'needs-improvement'
      : 'poor';

    const inpStatus = !metrics.inp
      ? 'needs-improvement'
      : metrics.inp <= 200
      ? 'good'
      : metrics.inp <= 500
      ? 'needs-improvement'
      : 'poor';

    const clsStatus = !metrics.cls
      ? 'needs-improvement'
      : metrics.cls <= 0.1
      ? 'good'
      : metrics.cls <= 0.25
      ? 'needs-improvement'
      : 'poor';

    return { lcp: lcpStatus, inp: inpStatus, cls: clsStatus };
  }
}
