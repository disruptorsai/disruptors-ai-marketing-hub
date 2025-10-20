/**
 * Browser-based Deployment Health Check
 * Uses Playwright to test JavaScript execution, rendering, and interactions
 */

import { chromium } from 'playwright';

const sites = [
  {
    name: 'Dev Site',
    url: 'https://dev.disruptorsmedia.com'
  },
  {
    name: 'Production Site',
    url: 'https://dm4.wjwelsh.com'
  }
];

const criticalPaths = [
  { path: '/', name: 'Homepage' },
  { path: '/services', name: 'Services Page' },
  { path: '/about', name: 'About Page' },
  { path: '/contact', name: 'Contact Page' },
  { path: '/blog', name: 'Blog Page' }
];

/**
 * Test site with browser automation
 */
async function testSiteWithBrowser(site) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`BROWSER TESTING: ${site.name}`);
  console.log(`URL: ${site.url}`);
  console.log(`${'='.repeat(80)}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const results = {
    site: site.name,
    url: site.url,
    timestamp: new Date().toISOString(),
    pages: [],
    errors: [],
    warnings: [],
    performance: {}
  };

  // Capture console errors and warnings
  const page = await context.newPage();
  const consoleMessages = [];
  const jsErrors = [];

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });

    if (type === 'error') {
      jsErrors.push(text);
      console.log(`  ⚠ Console Error: ${text}`);
    }
  });

  page.on('pageerror', error => {
    jsErrors.push(error.message);
    console.log(`  ✗ Page Error: ${error.message}`);
  });

  // Test each critical path
  for (const { path, name } of criticalPaths) {
    console.log(`Testing: ${name} (${path})`);

    try {
      const startTime = Date.now();

      // Navigate to page
      const response = await page.goto(`${site.url}${path}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      const loadTime = Date.now() - startTime;

      // Check response status
      const status = response.status();
      const success = status >= 200 && status < 400;

      // Wait for React to render
      await page.waitForTimeout(2000);

      // Check for key elements
      const hasContent = await page.evaluate(() => {
        return document.body.innerText.length > 100;
      });

      // Get performance metrics
      const metrics = await page.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: perfData?.domContentLoadedEventEnd - perfData?.domContentLoadedEventStart,
          loadComplete: perfData?.loadEventEnd - perfData?.loadEventStart,
          domInteractive: perfData?.domInteractive,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
        };
      });

      const pageResult = {
        path,
        name,
        success,
        status,
        loadTime,
        hasContent,
        metrics,
        errors: jsErrors.length
      };

      results.pages.push(pageResult);

      if (success && hasContent) {
        console.log(`  ✓ ${name.padEnd(30)} ${status} (${loadTime}ms) - ${jsErrors.length} errors`);
      } else {
        console.log(`  ✗ ${name.padEnd(30)} ${success ? 'No content' : status}`);
      }

      // Clear errors for next page
      jsErrors.length = 0;

    } catch (error) {
      console.log(`  ✗ ${name.padEnd(30)} Error: ${error.message}`);
      results.pages.push({
        path,
        name,
        success: false,
        error: error.message
      });
    }
  }

  // Test homepage performance in detail
  console.log('\nDetailed Performance Analysis (Homepage)...');
  try {
    await page.goto(site.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const performanceData = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');

      return {
        dns: perf.domainLookupEnd - perf.domainLookupStart,
        tcp: perf.connectEnd - perf.connectStart,
        request: perf.responseStart - perf.requestStart,
        response: perf.responseEnd - perf.responseStart,
        domParsing: perf.domInteractive - perf.responseEnd,
        domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
        loadComplete: perf.loadEventEnd - perf.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        totalLoadTime: perf.loadEventEnd - perf.fetchStart
      };
    });

    results.performance = performanceData;

    console.log(`  DNS Lookup: ${Math.round(performanceData.dns)}ms`);
    console.log(`  TCP Connection: ${Math.round(performanceData.tcp)}ms`);
    console.log(`  Request Time: ${Math.round(performanceData.request)}ms`);
    console.log(`  Response Time: ${Math.round(performanceData.response)}ms`);
    console.log(`  DOM Parsing: ${Math.round(performanceData.domParsing)}ms`);
    console.log(`  First Paint: ${Math.round(performanceData.firstPaint)}ms`);
    console.log(`  First Contentful Paint: ${Math.round(performanceData.firstContentfulPaint)}ms`);
    console.log(`  Total Load Time: ${Math.round(performanceData.totalLoadTime)}ms`);

  } catch (error) {
    console.log(`  ✗ Performance analysis failed: ${error.message}`);
  }

  await browser.close();

  // Summary
  const passed = results.pages.filter(p => p.success).length;
  const total = results.pages.length;

  console.log(`\n${'─'.repeat(80)}`);
  console.log(`BROWSER TEST SUMMARY: ${site.name}`);
  console.log(`Total Pages: ${total}`);
  console.log(`Passed: ${passed} (${Math.round(passed / total * 100)}%)`);
  console.log(`Failed: ${total - passed}`);
  console.log(`Average Load Time: ${Math.round(results.pages.filter(p => p.loadTime).reduce((sum, p) => sum + p.loadTime, 0) / results.pages.filter(p => p.loadTime).length)}ms`);
  console.log(`${'─'.repeat(80)}\n`);

  return results;
}

/**
 * Main execution
 */
async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║           DISRUPTORS AI - BROWSER-BASED HEALTH CHECK                      ║');
  console.log('║              JavaScript, Rendering & Performance Tests                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');

  const allResults = [];

  for (const site of sites) {
    try {
      const result = await testSiteWithBrowser(site);
      allResults.push(result);
    } catch (error) {
      console.error(`\n✗ Error testing ${site.name}:`, error.message);
      allResults.push({
        site: site.name,
        url: site.url,
        error: error.message
      });
    }
  }

  // Overall Summary
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                     OVERALL BROWSER TEST STATUS                            ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  for (const result of allResults) {
    if (result.pages) {
      const passed = result.pages.filter(p => p.success).length;
      const total = result.pages.length;
      const health = passed / total;
      const status = health >= 0.9 ? '✓ HEALTHY' : health >= 0.7 ? '⚠ WARNING' : '✗ CRITICAL';

      const avgFCP = result.performance.firstContentfulPaint || 0;
      const perfStatus = avgFCP < 1500 ? 'EXCELLENT' : avgFCP < 2500 ? 'GOOD' : 'NEEDS IMPROVEMENT';

      console.log(`${result.site.padEnd(30)} ${status.padEnd(15)} ${passed}/${total} pages | FCP: ${Math.round(avgFCP)}ms (${perfStatus})`);
    } else {
      console.log(`${result.site.padEnd(30)} ✗ ERROR: ${result.error}`);
    }
  }

  console.log('\n');

  // Return exit code
  const hasFailures = allResults.some(r => !r.pages || r.pages.some(p => !p.success));
  process.exit(hasFailures ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
