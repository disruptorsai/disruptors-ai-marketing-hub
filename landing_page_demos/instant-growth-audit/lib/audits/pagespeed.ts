export interface PageSpeedResult {
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    lcp?: number;
    inp?: number;
    cls?: number;
    fcp?: number;
    tti?: number;
  };
  opportunities: Array<{
    title: string;
    description: string;
    savings: number;
  }>;
}

export class PageSpeedInsights {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PAGESPEED_API_KEY || '';
  }

  async analyze(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PageSpeedResult> {
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
        .filter(([key, audit]: [string, any]) => audit.score !== null && audit.score < 0.9 && audit.numericValue)
        .map(([key, audit]: [string, any]) => ({
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

  async analyzeBoth(url: string): Promise<{ mobile: PageSpeedResult; desktop: PageSpeedResult }> {
    const [mobile, desktop] = await Promise.all([this.analyze(url, 'mobile'), this.analyze(url, 'desktop')]);

    return { mobile, desktop };
  }

  getCoreWebVitalsStatus(metrics: PageSpeedResult['metrics']): {
    lcp: 'good' | 'needs-improvement' | 'poor';
    inp: 'good' | 'needs-improvement' | 'poor';
    cls: 'good' | 'needs-improvement' | 'poor';
  } {
    const lcpStatus = !metrics.lcp ? 'needs-improvement' : metrics.lcp <= 2500 ? 'good' : metrics.lcp <= 4000 ? 'needs-improvement' : 'poor';

    const inpStatus = !metrics.inp ? 'needs-improvement' : metrics.inp <= 200 ? 'good' : metrics.inp <= 500 ? 'needs-improvement' : 'poor';

    const clsStatus = !metrics.cls ? 'needs-improvement' : metrics.cls <= 0.1 ? 'good' : metrics.cls <= 0.25 ? 'needs-improvement' : 'poor';

    return { lcp: lcpStatus, inp: inpStatus, cls: clsStatus };
  }
}
