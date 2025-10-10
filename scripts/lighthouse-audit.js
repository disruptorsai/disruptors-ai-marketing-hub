/**
 * Comprehensive Lighthouse Audit Script
 *
 * Runs Lighthouse audits on key pages with both mobile and desktop configurations.
 * Generates detailed reports and performance comparisons.
 *
 * Usage:
 *   node scripts/lighthouse-audit.js [options]
 *
 * Options:
 *   --page=<name>       Run audit on specific page only (home, about, work, solutions, blog)
 *   --device=<type>     Run audit for specific device only (mobile, desktop)
 *   --output=<format>   Output format: json, html, csv (default: all)
 *   --ci                CI mode - fail if scores below thresholds
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://dm4.wjwelsh.com';
const OUTPUT_DIR = path.join(__dirname, '..', 'lighthouse-reports');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

// Pages to audit
const PAGES = {
  home: '/',
  about: '/about',
  work: '/work',
  solutions: '/solutions',
  blog: '/blog'
};

// Device configurations
const DEVICE_CONFIGS = {
  mobile: {
    extends: 'lighthouse:default',
    settings: {
      formFactor: 'mobile',
      screenEmulation: {
        mobile: true,
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        disabled: false
      },
      throttling: {
        rttMs: 150,
        throughputKbps: 1.6 * 1024,
        requestLatencyMs: 150,
        downloadThroughputKbps: 1.6 * 1024,
        uploadThroughputKbps: 750,
        cpuSlowdownMultiplier: 4
      }
    }
  },
  desktop: {
    extends: 'lighthouse:default',
    settings: {
      formFactor: 'desktop',
      screenEmulation: {
        mobile: false,
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
        disabled: false
      },
      throttling: {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
        cpuSlowdownMultiplier: 1
      }
    }
  }
};

// Performance budgets
const PERFORMANCE_BUDGETS = {
  performance: 80,
  accessibility: 90,
  'best-practices': 85,
  seo: 90
};

/**
 * Run Lighthouse audit for a specific URL and device configuration
 */
async function runAudit(url, device, chrome) {
  console.log(`\nRunning ${device} audit for: ${url}`);

  const config = DEVICE_CONFIGS[device];
  const options = {
    logLevel: 'info',
    output: ['html', 'json'],
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port
  };

  try {
    const runnerResult = await lighthouse(url, options, config);
    return runnerResult;
  } catch (error) {
    console.error(`Error running audit for ${url} (${device}):`, error.message);
    return null;
  }
}

/**
 * Extract key metrics from Lighthouse results
 */
function extractMetrics(lhr) {
  const metrics = {
    scores: {},
    coreWebVitals: {},
    performance: {},
    diagnostics: {}
  };

  // Category scores
  for (const [category, result] of Object.entries(lhr.categories)) {
    metrics.scores[category] = Math.round(result.score * 100);
  }

  // Core Web Vitals
  const audits = lhr.audits;
  metrics.coreWebVitals = {
    LCP: audits['largest-contentful-paint']?.displayValue || 'N/A',
    FID: audits['max-potential-fid']?.displayValue || 'N/A',
    CLS: audits['cumulative-layout-shift']?.displayValue || 'N/A',
    FCP: audits['first-contentful-paint']?.displayValue || 'N/A',
    TTI: audits['interactive']?.displayValue || 'N/A',
    TBT: audits['total-blocking-time']?.displayValue || 'N/A',
    SI: audits['speed-index']?.displayValue || 'N/A'
  };

  // Performance metrics
  metrics.performance = {
    totalSize: audits['total-byte-weight']?.displayValue || 'N/A',
    requests: audits['network-requests']?.details?.items?.length || 0,
    mainThreadWork: audits['mainthread-work-breakdown']?.displayValue || 'N/A',
    bootupTime: audits['bootup-time']?.displayValue || 'N/A'
  };

  // Diagnostics
  metrics.diagnostics = {
    renderBlocking: audits['render-blocking-resources']?.details?.items?.length || 0,
    unusedCSS: audits['unused-css-rules']?.details?.items?.length || 0,
    unusedJS: audits['unused-javascript']?.details?.items?.length || 0,
    largestBundle: findLargestBundle(audits),
    fontDisplay: audits['font-display']?.score === 1
  };

  return metrics;
}

/**
 * Find the largest JavaScript bundle
 */
function findLargestBundle(audits) {
  const bundles = audits['network-requests']?.details?.items
    ?.filter(item => item.resourceType === 'Script')
    ?.sort((a, b) => b.transferSize - a.transferSize) || [];

  if (bundles.length > 0) {
    return {
      url: bundles[0].url.split('/').pop(),
      size: Math.round(bundles[0].transferSize / 1024) + ' KB'
    };
  }
  return { url: 'N/A', size: 'N/A' };
}

/**
 * Generate comparison report between mobile and desktop
 */
function generateComparisonReport(mobileMetrics, desktopMetrics, pageName) {
  const comparison = {
    page: pageName,
    scores: {},
    webVitals: {},
    performance: {}
  };

  // Compare scores
  for (const category in mobileMetrics.scores) {
    comparison.scores[category] = {
      mobile: mobileMetrics.scores[category],
      desktop: desktopMetrics.scores[category],
      diff: desktopMetrics.scores[category] - mobileMetrics.scores[category]
    };
  }

  // Compare Core Web Vitals
  for (const vital in mobileMetrics.coreWebVitals) {
    comparison.webVitals[vital] = {
      mobile: mobileMetrics.coreWebVitals[vital],
      desktop: desktopMetrics.coreWebVitals[vital]
    };
  }

  // Compare performance
  comparison.performance = {
    totalSize: {
      mobile: mobileMetrics.performance.totalSize,
      desktop: desktopMetrics.performance.totalSize
    },
    requests: {
      mobile: mobileMetrics.performance.requests,
      desktop: desktopMetrics.performance.requests
    },
    mainThreadWork: {
      mobile: mobileMetrics.performance.mainThreadWork,
      desktop: desktopMetrics.performance.mainThreadWork
    }
  };

  return comparison;
}

/**
 * Save report to file
 */
function saveReport(data, filename, format = 'json') {
  const filepath = path.join(OUTPUT_DIR, filename);

  if (format === 'json') {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  } else if (format === 'html') {
    fs.writeFileSync(filepath, data);
  } else if (format === 'csv') {
    fs.writeFileSync(filepath, data);
  }

  console.log(`Report saved: ${filepath}`);
}

/**
 * Generate CSV summary report
 */
function generateCSVSummary(allResults) {
  const headers = [
    'Page',
    'Device',
    'Performance',
    'Accessibility',
    'Best Practices',
    'SEO',
    'LCP',
    'FID',
    'CLS',
    'FCP',
    'TTI',
    'TBT',
    'Total Size',
    'Requests'
  ].join(',');

  const rows = [];

  for (const [pageName, devices] of Object.entries(allResults)) {
    for (const [device, result] of Object.entries(devices)) {
      if (!result) continue;

      const metrics = extractMetrics(result.lhr);
      const row = [
        pageName,
        device,
        metrics.scores.performance,
        metrics.scores.accessibility,
        metrics.scores['best-practices'],
        metrics.scores.seo,
        metrics.coreWebVitals.LCP,
        metrics.coreWebVitals.FID,
        metrics.coreWebVitals.CLS,
        metrics.coreWebVitals.FCP,
        metrics.coreWebVitals.TTI,
        metrics.coreWebVitals.TBT,
        metrics.performance.totalSize,
        metrics.performance.requests
      ].join(',');

      rows.push(row);
    }
  }

  return [headers, ...rows].join('\n');
}

/**
 * Generate markdown summary report
 */
function generateMarkdownSummary(allResults, comparisons) {
  let md = '# Lighthouse Audit Report\n\n';
  md += `**Generated:** ${new Date().toLocaleString()}\n`;
  md += `**Base URL:** ${BASE_URL}\n\n`;

  // Executive Summary
  md += '## Executive Summary\n\n';
  md += '| Page | Device | Performance | Accessibility | Best Practices | SEO |\n';
  md += '|------|--------|-------------|---------------|----------------|-----|\n';

  for (const [pageName, devices] of Object.entries(allResults)) {
    for (const [device, result] of Object.entries(devices)) {
      if (!result) continue;

      const metrics = extractMetrics(result.lhr);
      md += `| ${pageName} | ${device} | ${metrics.scores.performance} | ${metrics.scores.accessibility} | ${metrics.scores['best-practices']} | ${metrics.scores.seo} |\n`;
    }
  }

  // Core Web Vitals
  md += '\n## Core Web Vitals\n\n';
  md += '| Page | Device | LCP | FID | CLS | FCP | TTI | TBT |\n';
  md += '|------|--------|-----|-----|-----|-----|-----|-----|\n';

  for (const [pageName, devices] of Object.entries(allResults)) {
    for (const [device, result] of Object.entries(devices)) {
      if (!result) continue;

      const metrics = extractMetrics(result.lhr);
      const cwv = metrics.coreWebVitals;
      md += `| ${pageName} | ${device} | ${cwv.LCP} | ${cwv.FID} | ${cwv.CLS} | ${cwv.FCP} | ${cwv.TTI} | ${cwv.TBT} |\n`;
    }
  }

  // Mobile vs Desktop Comparison
  md += '\n## Mobile vs Desktop Performance Comparison\n\n';
  for (const comparison of comparisons) {
    md += `\n### ${comparison.page.charAt(0).toUpperCase() + comparison.page.slice(1)} Page\n\n`;
    md += '| Category | Mobile | Desktop | Difference |\n';
    md += '|----------|--------|---------|------------|\n';

    for (const [category, scores] of Object.entries(comparison.scores)) {
      const diff = scores.diff > 0 ? `+${scores.diff}` : scores.diff;
      md += `| ${category} | ${scores.mobile} | ${scores.desktop} | ${diff} |\n`;
    }
  }

  // Key Findings
  md += '\n## Key Findings\n\n';

  // Find pages below performance budgets
  const issues = [];
  for (const [pageName, devices] of Object.entries(allResults)) {
    for (const [device, result] of Object.entries(devices)) {
      if (!result) continue;

      const metrics = extractMetrics(result.lhr);
      for (const [category, threshold] of Object.entries(PERFORMANCE_BUDGETS)) {
        if (metrics.scores[category] < threshold) {
          issues.push({
            page: pageName,
            device: device,
            category: category,
            score: metrics.scores[category],
            threshold: threshold
          });
        }
      }
    }
  }

  if (issues.length > 0) {
    md += '### Pages Below Performance Budget\n\n';
    for (const issue of issues) {
      md += `- **${issue.page}** (${issue.device}): ${issue.category} score ${issue.score} (threshold: ${issue.threshold})\n`;
    }
  } else {
    md += '**All pages meet performance budgets!** ✅\n';
  }

  return md;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Lighthouse Audit Suite\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output Directory: ${OUTPUT_DIR}\n`);

  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {
    page: args.find(arg => arg.startsWith('--page='))?.split('=')[1],
    device: args.find(arg => arg.startsWith('--device='))?.split('=')[1],
    output: args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'all',
    ci: args.includes('--ci')
  };

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Determine which pages to audit
  const pagesToAudit = options.page
    ? { [options.page]: PAGES[options.page] }
    : PAGES;

  // Determine which devices to test
  const devicesToTest = options.device
    ? [options.device]
    : ['mobile', 'desktop'];

  // Launch Chrome
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  console.log(`Chrome launched on port ${chrome.port}\n`);

  const allResults = {};
  const comparisons = [];

  try {
    // Run audits for each page and device
    for (const [pageName, pagePath] of Object.entries(pagesToAudit)) {
      const url = `${BASE_URL}${pagePath}`;
      allResults[pageName] = {};

      for (const device of devicesToTest) {
        const result = await runAudit(url, device, chrome);

        if (result) {
          allResults[pageName][device] = result;

          // Save individual reports
          if (options.output === 'all' || options.output === 'html') {
            saveReport(
              result.report[0],
              `${TIMESTAMP}_${pageName}_${device}.html`,
              'html'
            );
          }

          if (options.output === 'all' || options.output === 'json') {
            saveReport(
              result.lhr,
              `${TIMESTAMP}_${pageName}_${device}.json`,
              'json'
            );
          }

          // Log immediate results
          const metrics = extractMetrics(result.lhr);
          console.log(`\n✅ ${pageName} (${device}) - Performance: ${metrics.scores.performance}`);
          console.log(`   LCP: ${metrics.coreWebVitals.LCP}, FID: ${metrics.coreWebVitals.FID}, CLS: ${metrics.coreWebVitals.CLS}`);
        }
      }

      // Generate comparison if both mobile and desktop were tested
      if (allResults[pageName].mobile && allResults[pageName].desktop) {
        const mobileMetrics = extractMetrics(allResults[pageName].mobile.lhr);
        const desktopMetrics = extractMetrics(allResults[pageName].desktop.lhr);
        const comparison = generateComparisonReport(mobileMetrics, desktopMetrics, pageName);
        comparisons.push(comparison);
      }
    }

    // Generate summary reports
    console.log('\n\n📊 Generating Summary Reports...\n');

    if (options.output === 'all' || options.output === 'csv') {
      const csvSummary = generateCSVSummary(allResults);
      saveReport(csvSummary, `${TIMESTAMP}_summary.csv`, 'csv');
    }

    // Always generate markdown summary
    const markdownSummary = generateMarkdownSummary(allResults, comparisons);
    saveReport(markdownSummary, `${TIMESTAMP}_summary.md`, 'json');
    console.log('\n' + markdownSummary);

    // Save comparison reports
    if (comparisons.length > 0) {
      saveReport(
        comparisons,
        `${TIMESTAMP}_comparisons.json`,
        'json'
      );
    }

    // CI mode - check performance budgets
    if (options.ci) {
      console.log('\n🔍 Checking Performance Budgets (CI Mode)...\n');
      let failed = false;

      for (const [pageName, devices] of Object.entries(allResults)) {
        for (const [device, result] of Object.entries(devices)) {
          if (!result) continue;

          const metrics = extractMetrics(result.lhr);
          for (const [category, threshold] of Object.entries(PERFORMANCE_BUDGETS)) {
            if (metrics.scores[category] < threshold) {
              console.error(`❌ ${pageName} (${device}): ${category} score ${metrics.scores[category]} below threshold ${threshold}`);
              failed = true;
            }
          }
        }
      }

      if (failed) {
        console.error('\n❌ Performance budgets not met!');
        process.exit(1);
      } else {
        console.log('\n✅ All performance budgets met!');
      }
    }

    console.log('\n✅ Audit complete! Reports saved to:', OUTPUT_DIR);

  } finally {
    await chrome.kill();
    console.log('\nChrome closed.');
  }
}

// Run the audit
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
