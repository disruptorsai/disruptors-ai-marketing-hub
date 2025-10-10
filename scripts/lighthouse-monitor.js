/**
 * Lighthouse Performance Monitor
 *
 * Automated performance monitoring with trend tracking and alerts.
 * Can be run manually or integrated into CI/CD pipeline.
 *
 * Usage:
 *   npm run perf:monitor           - Run single monitoring cycle
 *   npm run perf:monitor --watch   - Continuous monitoring (hourly)
 *   npm run perf:monitor --ci      - CI mode (fail on regression)
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://dm4.wjwelsh.com';
const HISTORY_DIR = path.join(__dirname, '..', 'lighthouse-history');
const BASELINE_FILE = path.join(HISTORY_DIR, 'baseline.json');

// Performance budgets (target scores)
const BUDGETS = {
  performance: {
    mobile: 80,
    desktop: 90
  },
  accessibility: 90,
  bestPractices: 85,
  seo: 90,
  metrics: {
    LCP: { mobile: 2500, desktop: 2500 },      // ms
    FID: { mobile: 100, desktop: 100 },        // ms
    CLS: { mobile: 0.1, desktop: 0.1 },        // unitless
    FCP: { mobile: 1800, desktop: 1800 },      // ms
    TTI: { mobile: 3800, desktop: 3800 },      // ms
    TBT: { mobile: 200, desktop: 200 }         // ms
  }
};

// Pages to monitor (critical user paths)
const PAGES = {
  home: '/',
  about: '/about'
};

/**
 * Run quick performance check
 */
async function runQuickCheck(url, device, chrome) {
  const config = {
    extends: 'lighthouse:default',
    settings: {
      formFactor: device,
      throttling: device === 'mobile' ? {
        rttMs: 150,
        throughputKbps: 1.6 * 1024,
        cpuSlowdownMultiplier: 4
      } : {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        cpuSlowdownMultiplier: 1
      },
      onlyCategories: ['performance']
    }
  };

  const options = {
    logLevel: 'error',
    output: 'json',
    port: chrome.port
  };

  const result = await lighthouse(url, options, config);
  return result.lhr;
}

/**
 * Extract key metrics
 */
function extractMetrics(lhr) {
  return {
    scores: {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: lhr.categories.accessibility ? Math.round(lhr.categories.accessibility.score * 100) : null,
      bestPractices: lhr.categories['best-practices'] ? Math.round(lhr.categories['best-practices'].score * 100) : null,
      seo: lhr.categories.seo ? Math.round(lhr.categories.seo.score * 100) : null
    },
    metrics: {
      LCP: lhr.audits['largest-contentful-paint'].numericValue,
      FID: lhr.audits['max-potential-fid'].numericValue,
      CLS: lhr.audits['cumulative-layout-shift'].numericValue,
      FCP: lhr.audits['first-contentful-paint'].numericValue,
      TTI: lhr.audits['interactive'].numericValue,
      TBT: lhr.audits['total-blocking-time'].numericValue,
      SI: lhr.audits['speed-index'].numericValue
    }
  };
}

/**
 * Compare against baseline
 */
function compareToBaseline(current, baseline) {
  const regressions = [];
  const improvements = [];

  // Compare performance scores
  for (const [category, score] of Object.entries(current.scores)) {
    if (!baseline.scores[category]) continue;

    const diff = score - baseline.scores[category];
    if (diff < -5) {
      regressions.push({
        type: 'score',
        category: category,
        current: score,
        baseline: baseline.scores[category],
        diff: diff
      });
    } else if (diff > 5) {
      improvements.push({
        type: 'score',
        category: category,
        current: score,
        baseline: baseline.scores[category],
        diff: diff
      });
    }
  }

  // Compare metrics
  for (const [metric, value] of Object.entries(current.metrics)) {
    if (!baseline.metrics[metric]) continue;

    const diff = value - baseline.metrics[metric];
    const percentChange = (diff / baseline.metrics[metric]) * 100;

    if (percentChange > 10) {
      regressions.push({
        type: 'metric',
        metric: metric,
        current: Math.round(value),
        baseline: Math.round(baseline.metrics[metric]),
        diff: Math.round(diff),
        percentChange: Math.round(percentChange)
      });
    } else if (percentChange < -10) {
      improvements.push({
        type: 'metric',
        metric: metric,
        current: Math.round(value),
        baseline: Math.round(baseline.metrics[metric]),
        diff: Math.round(diff),
        percentChange: Math.round(percentChange)
      });
    }
  }

  return { regressions, improvements };
}

/**
 * Check against budgets
 */
function checkBudgets(metrics, device) {
  const violations = [];

  // Check performance score
  if (metrics.scores.performance < BUDGETS.performance[device]) {
    violations.push({
      type: 'score',
      category: 'performance',
      value: metrics.scores.performance,
      budget: BUDGETS.performance[device]
    });
  }

  // Check other scores
  for (const [category, budget] of Object.entries(BUDGETS)) {
    if (category === 'performance' || category === 'metrics') continue;

    if (metrics.scores[category] && metrics.scores[category] < budget) {
      violations.push({
        type: 'score',
        category: category,
        value: metrics.scores[category],
        budget: budget
      });
    }
  }

  // Check metrics
  for (const [metric, budget] of Object.entries(BUDGETS.metrics)) {
    const value = metrics.metrics[metric];
    const limit = budget[device];

    if (value > limit) {
      violations.push({
        type: 'metric',
        metric: metric,
        value: Math.round(value),
        budget: limit
      });
    }
  }

  return violations;
}

/**
 * Save monitoring result
 */
function saveResult(result) {
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = path.join(HISTORY_DIR, `${timestamp}.json`);

  fs.writeFileSync(filename, JSON.stringify(result, null, 2));
  return filename;
}

/**
 * Load or create baseline
 */
function loadBaseline() {
  if (fs.existsSync(BASELINE_FILE)) {
    return JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
  }
  return null;
}

/**
 * Update baseline
 */
function updateBaseline(metrics) {
  fs.writeFileSync(BASELINE_FILE, JSON.stringify(metrics, null, 2));
  console.log('Baseline updated:', BASELINE_FILE);
}

/**
 * Generate alert message
 */
function generateAlertMessage(violations, regressions) {
  let message = '⚠️ PERFORMANCE ALERT\n\n';

  if (violations.length > 0) {
    message += 'BUDGET VIOLATIONS:\n';
    for (const v of violations) {
      if (v.type === 'score') {
        message += `- ${v.category}: ${v.value} (budget: ${v.budget})\n`;
      } else {
        message += `- ${v.metric}: ${v.value}ms (budget: ${v.budget}ms)\n`;
      }
    }
    message += '\n';
  }

  if (regressions.length > 0) {
    message += 'REGRESSIONS:\n';
    for (const r of regressions) {
      if (r.type === 'score') {
        message += `- ${r.category}: ${r.current} (was ${r.baseline}, ${r.diff})\n`;
      } else {
        message += `- ${r.metric}: ${r.current}ms (was ${r.baseline}ms, ${r.percentChange}% worse)\n`;
      }
    }
  }

  return message;
}

/**
 * Main monitoring function
 */
async function monitor() {
  console.log('🔍 Starting Performance Monitor\n');

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  console.log(`Chrome launched on port ${chrome.port}\n`);

  const results = {
    timestamp: new Date().toISOString(),
    url: BASE_URL,
    pages: {}
  };

  let hasViolations = false;
  let hasRegressions = false;

  try {
    for (const [pageName, pagePath] of Object.entries(PAGES)) {
      const url = `${BASE_URL}${pagePath}`;
      console.log(`Testing ${pageName}: ${url}`);

      results.pages[pageName] = {};

      for (const device of ['mobile', 'desktop']) {
        console.log(`  - ${device}...`);

        const lhr = await runQuickCheck(url, device, chrome);
        const metrics = extractMetrics(lhr);

        results.pages[pageName][device] = {
          metrics: metrics,
          budgetViolations: [],
          regressions: [],
          improvements: []
        };

        // Check budgets
        const violations = checkBudgets(metrics, device);
        if (violations.length > 0) {
          results.pages[pageName][device].budgetViolations = violations;
          hasViolations = true;
          console.log(`    ⚠️ ${violations.length} budget violations`);
        }

        // Compare to baseline
        const baseline = loadBaseline();
        if (baseline && baseline.pages?.[pageName]?.[device]) {
          const comparison = compareToBaseline(
            metrics,
            baseline.pages[pageName][device].metrics
          );

          if (comparison.regressions.length > 0) {
            results.pages[pageName][device].regressions = comparison.regressions;
            hasRegressions = true;
            console.log(`    📉 ${comparison.regressions.length} regressions`);
          }

          if (comparison.improvements.length > 0) {
            results.pages[pageName][device].improvements = comparison.improvements;
            console.log(`    📈 ${comparison.improvements.length} improvements`);
          }
        }

        console.log(`    Performance: ${metrics.scores.performance}`);
        console.log(`    LCP: ${Math.round(metrics.metrics.LCP)}ms`);
      }

      console.log('');
    }

    // Save results
    const filename = saveResult(results);
    console.log(`Results saved: ${filename}\n`);

    // Check if we should update baseline
    const args = process.argv.slice(2);
    if (args.includes('--update-baseline')) {
      updateBaseline(results);
    }

    // Print summary
    console.log('=== SUMMARY ===\n');

    if (hasViolations) {
      console.log('⚠️ BUDGET VIOLATIONS DETECTED');
    } else {
      console.log('✅ All pages meet performance budgets');
    }

    if (hasRegressions) {
      console.log('📉 PERFORMANCE REGRESSIONS DETECTED');

      // Generate alert
      const allViolations = [];
      const allRegressions = [];

      for (const [pageName, devices] of Object.entries(results.pages)) {
        for (const [device, data] of Object.entries(devices)) {
          allViolations.push(...data.budgetViolations);
          allRegressions.push(...data.regressions);
        }
      }

      const alertMessage = generateAlertMessage(allViolations, allRegressions);
      console.log('\n' + alertMessage);

      // CI mode - fail build
      if (args.includes('--ci')) {
        console.error('\n❌ Performance regression detected in CI mode');
        process.exit(1);
      }
    } else {
      console.log('✅ No performance regressions');
    }

    // Watch mode
    if (args.includes('--watch')) {
      console.log('\n⏰ Waiting 1 hour before next check...\n');
      setTimeout(monitor, 60 * 60 * 1000); // 1 hour
    }

  } finally {
    await chrome.kill();
    console.log('\nChrome closed.');
  }
}

// Run monitor
monitor().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
