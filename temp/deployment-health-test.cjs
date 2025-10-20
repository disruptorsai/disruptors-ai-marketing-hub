/**
 * Comprehensive Deployment Health Check
 * Tests both dev and production sites for functionality, performance, and reliability
 */

const https = require('https');
const http = require('http');

// Sites to test
const sites = [
  {
    name: 'Dev Site',
    url: 'https://dev.disruptorsmedia.com',
    siteId: '62801e39-84b0-4586-a316-6c56a5e55718'
  },
  {
    name: 'Production Site',
    url: 'https://dm4.wjwelsh.com',
    siteId: 'cheerful-custard-2e6fc5'
  }
];

// Critical pages to test
const criticalPaths = [
  '/',
  '/services',
  '/about',
  '/contact',
  '/blog',
  '/modules/keyword-research',
  '/modules/ai-content-writer',
  '/modules/growth-audit'
];

// Netlify Functions to test
const functionsToTest = [
  '/.netlify/functions/module-keyword-research',
  '/.netlify/functions/module-ai-content-writer',
  '/.netlify/functions/module-growth-audit',
  '/.netlify/functions/growth-audit-stream'
];

/**
 * Fetch URL with timeout
 */
function fetchWithTimeout(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeoutId = setTimeout(() => {
      reject(new Error(`Request timeout after ${timeout}ms`));
    }, timeout);

    protocol.get(url, (res) => {
      clearTimeout(timeoutId);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime: Date.now()
        });
      });
    }).on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });
  });
}

/**
 * Test a single URL
 */
async function testUrl(baseUrl, path) {
  const fullUrl = baseUrl + path;
  const startTime = Date.now();

  try {
    const response = await fetchWithTimeout(fullUrl);
    const responseTime = Date.now() - startTime;

    return {
      url: fullUrl,
      path,
      success: response.statusCode >= 200 && response.statusCode < 400,
      statusCode: response.statusCode,
      responseTime,
      contentLength: response.body.length,
      headers: response.headers
    };
  } catch (error) {
    return {
      url: fullUrl,
      path,
      success: false,
      error: error.message,
      responseTime: Date.now() - startTime
    };
  }
}

/**
 * Test site health
 */
async function testSiteHealth(site) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TESTING: ${site.name}`);
  console.log(`URL: ${site.url}`);
  console.log(`Site ID: ${site.siteId}`);
  console.log(`${'='.repeat(80)}\n`);

  const results = {
    site: site.name,
    url: site.url,
    timestamp: new Date().toISOString(),
    pages: [],
    functions: [],
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      avgResponseTime: 0
    }
  };

  // Test critical pages
  console.log('Testing Critical Pages...\n');
  for (const path of criticalPaths) {
    const result = await testUrl(site.url, path);
    results.pages.push(result);
    results.summary.totalTests++;

    if (result.success) {
      results.summary.passed++;
      console.log(`✓ ${path.padEnd(40)} ${result.statusCode} (${result.responseTime}ms)`);
    } else {
      results.summary.failed++;
      console.log(`✗ ${path.padEnd(40)} ${result.error || result.statusCode}`);
    }
  }

  // Calculate average response time
  const responseTimes = results.pages
    .filter(p => p.success)
    .map(p => p.responseTime);
  results.summary.avgResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;

  // Summary
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`SUMMARY: ${site.name}`);
  console.log(`Total Tests: ${results.summary.totalTests}`);
  console.log(`Passed: ${results.summary.passed} (${Math.round(results.summary.passed / results.summary.totalTests * 100)}%)`);
  console.log(`Failed: ${results.summary.failed}`);
  console.log(`Average Response Time: ${results.summary.avgResponseTime}ms`);
  console.log(`${'─'.repeat(80)}\n`);

  return results;
}

/**
 * Main execution
 */
async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║              DISRUPTORS AI - DEPLOYMENT HEALTH CHECK                       ║');
  console.log('║                   Comprehensive Site Validation                            ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');

  const allResults = [];

  for (const site of sites) {
    try {
      const result = await testSiteHealth(site);
      allResults.push(result);
    } catch (error) {
      console.error(`\n✗ Error testing ${site.name}:`, error.message);
      allResults.push({
        site: site.name,
        url: site.url,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Overall Summary
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                        OVERALL DEPLOYMENT STATUS                           ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  for (const result of allResults) {
    if (result.summary) {
      const health = result.summary.passed / result.summary.totalTests;
      const status = health >= 0.9 ? '✓ HEALTHY' : health >= 0.7 ? '⚠ WARNING' : '✗ CRITICAL';
      console.log(`${result.site.padEnd(30)} ${status.padEnd(15)} ${result.summary.passed}/${result.summary.totalTests} tests passed`);
    } else {
      console.log(`${result.site.padEnd(30)} ✗ ERROR: ${result.error}`);
    }
  }

  console.log('\n');

  // Return exit code based on results
  const hasFailures = allResults.some(r => !r.summary || r.summary.failed > 0);
  process.exit(hasFailures ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
