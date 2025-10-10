/**
 * Lighthouse Report Analyzer
 *
 * Analyzes Lighthouse JSON reports to extract actionable insights
 * and generate prioritized recommendations.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = path.join(__dirname, '..', 'lighthouse-reports');

/**
 * Load all JSON reports
 */
function loadReports() {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.endsWith('.json') && !f.includes('comparisons') && !f.includes('summary'));

  const reports = {};

  for (const file of files) {
    const content = fs.readFileSync(path.join(REPORTS_DIR, file), 'utf8');
    const data = JSON.parse(content);

    // Extract page name and device from filename
    // Format: YYYY-MM-DDTHH-MM-SS_pagename_device.json
    const parts = file.split('_');
    const pageName = parts[1];
    const device = parts[2].replace('.json', '');

    if (!reports[pageName]) {
      reports[pageName] = {};
    }

    reports[pageName][device] = data;
  }

  return reports;
}

/**
 * Analyze performance opportunities
 */
function analyzePerformance(report) {
  const opportunities = [];
  const audits = report.audits;

  // Key performance audits to check
  const performanceAudits = [
    'render-blocking-resources',
    'unused-css-rules',
    'unused-javascript',
    'modern-image-formats',
    'offscreen-images',
    'unminified-css',
    'unminified-javascript',
    'efficient-animated-content',
    'duplicated-javascript',
    'legacy-javascript',
    'total-byte-weight',
    'uses-long-cache-ttl',
    'uses-responsive-images',
    'uses-text-compression',
    'font-display',
    'third-party-summary',
    'largest-contentful-paint-element',
    'layout-shift-elements',
    'long-tasks'
  ];

  for (const auditId of performanceAudits) {
    const audit = audits[auditId];
    if (!audit) continue;

    // Only include failing or warning audits with potential savings
    if (audit.score !== null && audit.score < 1) {
      let savings = null;

      if (audit.details?.overallSavingsMs) {
        savings = {
          ms: audit.details.overallSavingsMs,
          bytes: audit.details.overallSavingsBytes || 0
        };
      }

      opportunities.push({
        id: auditId,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        displayValue: audit.displayValue,
        savings: savings,
        numericValue: audit.numericValue,
        details: audit.details
      });
    }
  }

  // Sort by potential savings (ms)
  opportunities.sort((a, b) => {
    const aMs = a.savings?.ms || a.numericValue || 0;
    const bMs = b.savings?.ms || b.numericValue || 0;
    return bMs - aMs;
  });

  return opportunities;
}

/**
 * Analyze Core Web Vitals issues
 */
function analyzeCoreWebVitals(report) {
  const audits = report.audits;
  const issues = [];

  // LCP Analysis
  const lcp = audits['largest-contentful-paint'];
  if (lcp && lcp.score < 0.9) {
    const lcpElement = audits['largest-contentful-paint-element'];
    issues.push({
      vital: 'LCP',
      score: lcp.score,
      value: lcp.displayValue,
      element: lcpElement?.details?.items?.[0]?.node?.snippet || 'Unknown',
      phase: audits['lcp-lazy-loaded']?.score === 0 ? 'Lazy loading issue' : null
    });
  }

  // CLS Analysis
  const cls = audits['cumulative-layout-shift'];
  if (cls && cls.score < 0.9) {
    const clsElements = audits['layout-shift-elements'];
    issues.push({
      vital: 'CLS',
      score: cls.score,
      value: cls.displayValue,
      culprits: clsElements?.details?.items?.map(item => ({
        element: item.node?.snippet || 'Unknown',
        score: item.score
      })) || []
    });
  }

  // TBT/FID Analysis
  const tbt = audits['total-blocking-time'];
  if (tbt && tbt.score < 0.9) {
    const longTasks = audits['long-tasks'];
    issues.push({
      vital: 'TBT',
      score: tbt.score,
      value: tbt.displayValue,
      longTasks: longTasks?.details?.items?.length || 0
    });
  }

  return issues;
}

/**
 * Analyze accessibility issues
 */
function analyzeAccessibility(report) {
  const audits = report.audits;
  const issues = [];

  for (const [auditId, audit] of Object.entries(audits)) {
    if (audit.score !== null && audit.score < 1 && auditId.includes('aria') || auditId.includes('color-contrast') || auditId.includes('heading') || auditId.includes('label')) {
      issues.push({
        id: auditId,
        title: audit.title,
        score: audit.score,
        impact: audit.details?.items?.length || 0,
        items: audit.details?.items?.slice(0, 3) // First 3 examples
      });
    }
  }

  return issues;
}

/**
 * Analyze SEO issues
 */
function analyzeSEO(report) {
  const audits = report.audits;
  const issues = [];

  const seoAudits = [
    'meta-description',
    'link-text',
    'crawlable-anchors',
    'is-crawlable',
    'robots-txt',
    'hreflang',
    'canonical',
    'structured-data'
  ];

  for (const auditId of seoAudits) {
    const audit = audits[auditId];
    if (audit && audit.score !== null && audit.score < 1) {
      issues.push({
        id: auditId,
        title: audit.title,
        score: audit.score,
        description: audit.description
      });
    }
  }

  return issues;
}

/**
 * Analyze JavaScript bundles
 */
function analyzeBundles(report) {
  const audits = report.audits;
  const networkRequests = audits['network-requests']?.details?.items || [];

  const jsFiles = networkRequests
    .filter(req => req.resourceType === 'Script')
    .map(req => ({
      url: req.url,
      size: req.transferSize,
      sizeKB: Math.round(req.transferSize / 1024),
      startTime: req.startTime,
      endTime: req.endTime,
      duration: req.endTime - req.startTime
    }))
    .sort((a, b) => b.size - a.size);

  const cssFiles = networkRequests
    .filter(req => req.resourceType === 'Stylesheet')
    .map(req => ({
      url: req.url,
      size: req.transferSize,
      sizeKB: Math.round(req.transferSize / 1024)
    }))
    .sort((a, b) => b.size - a.size);

  const fontFiles = networkRequests
    .filter(req => req.resourceType === 'Font')
    .map(req => ({
      url: req.url,
      size: req.transferSize,
      sizeKB: Math.round(req.transferSize / 1024)
    }))
    .sort((a, b) => b.size - a.size);

  return {
    javascript: jsFiles,
    css: cssFiles,
    fonts: fontFiles,
    totalJS: jsFiles.reduce((sum, f) => sum + f.sizeKB, 0),
    totalCSS: cssFiles.reduce((sum, f) => sum + f.sizeKB, 0),
    totalFonts: fontFiles.reduce((sum, f) => sum + f.sizeKB, 0)
  };
}

/**
 * Generate detailed analysis report
 */
function generateAnalysis(reports) {
  const analysis = {};

  for (const [pageName, devices] of Object.entries(reports)) {
    analysis[pageName] = {};

    for (const [device, report] of Object.entries(devices)) {
      analysis[pageName][device] = {
        scores: {
          performance: Math.round(report.categories.performance.score * 100),
          accessibility: Math.round(report.categories.accessibility.score * 100),
          bestPractices: Math.round(report.categories['best-practices'].score * 100),
          seo: Math.round(report.categories.seo.score * 100)
        },
        performanceOpportunities: analyzePerformance(report),
        coreWebVitalsIssues: analyzeCoreWebVitals(report),
        accessibilityIssues: analyzeAccessibility(report),
        seoIssues: analyzeSEO(report),
        bundles: analyzeBundles(report),
        metrics: {
          FCP: report.audits['first-contentful-paint'].displayValue,
          LCP: report.audits['largest-contentful-paint'].displayValue,
          TBT: report.audits['total-blocking-time'].displayValue,
          CLS: report.audits['cumulative-layout-shift'].displayValue,
          SI: report.audits['speed-index'].displayValue,
          TTI: report.audits['interactive'].displayValue
        }
      };
    }
  }

  return analysis;
}

/**
 * Generate prioritized recommendations
 */
function generateRecommendations(analysis) {
  const recommendations = {
    critical: [],
    high: [],
    medium: [],
    low: []
  };

  // Analyze across all pages and devices
  const allOpportunities = [];

  for (const [pageName, devices] of Object.entries(analysis)) {
    for (const [device, data] of Object.entries(devices)) {
      for (const opp of data.performanceOpportunities) {
        allOpportunities.push({
          ...opp,
          page: pageName,
          device: device
        });
      }
    }
  }

  // Group by audit ID to find common issues
  const grouped = {};
  for (const opp of allOpportunities) {
    if (!grouped[opp.id]) {
      grouped[opp.id] = [];
    }
    grouped[opp.id].push(opp);
  }

  // Prioritize based on frequency and impact
  for (const [auditId, opportunities] of Object.entries(grouped)) {
    const avgSavings = opportunities.reduce((sum, o) => sum + (o.savings?.ms || 0), 0) / opportunities.length;
    const affectedPages = [...new Set(opportunities.map(o => o.page))].length;
    const affectedDevices = opportunities.filter(o => o.device === 'mobile').length;

    const recommendation = {
      id: auditId,
      title: opportunities[0].title,
      description: opportunities[0].description,
      affectedPages: affectedPages,
      affectedMobile: affectedDevices > 0,
      avgSavingsMs: Math.round(avgSavings),
      priority: calculatePriority(avgSavings, affectedPages, affectedDevices)
    };

    if (recommendation.priority === 'critical') {
      recommendations.critical.push(recommendation);
    } else if (recommendation.priority === 'high') {
      recommendations.high.push(recommendation);
    } else if (recommendation.priority === 'medium') {
      recommendations.medium.push(recommendation);
    } else {
      recommendations.low.push(recommendation);
    }
  }

  // Sort each priority level by savings
  for (const priority of ['critical', 'high', 'medium', 'low']) {
    recommendations[priority].sort((a, b) => b.avgSavingsMs - a.avgSavingsMs);
  }

  return recommendations;
}

/**
 * Calculate priority level
 */
function calculatePriority(avgSavings, affectedPages, affectedMobile) {
  // Critical: Affects all pages on mobile with >1000ms savings
  if (affectedPages >= 5 && affectedMobile >= 5 && avgSavings > 1000) {
    return 'critical';
  }

  // High: Affects multiple pages on mobile with >500ms savings
  if (affectedPages >= 3 && affectedMobile >= 3 && avgSavings > 500) {
    return 'high';
  }

  // Medium: Affects some pages with >200ms savings
  if (affectedPages >= 2 && avgSavings > 200) {
    return 'medium';
  }

  return 'low';
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(analysis, recommendations) {
  let md = '# Lighthouse Performance Analysis - Detailed Report\n\n';
  md += `**Generated:** ${new Date().toLocaleString()}\n\n`;

  // Executive Summary
  md += '## Executive Summary\n\n';
  md += '### Critical Issues\n\n';

  // Average mobile performance
  let totalMobilePerf = 0;
  let mobileCount = 0;
  for (const [pageName, devices] of Object.entries(analysis)) {
    if (devices.mobile) {
      totalMobilePerf += devices.mobile.scores.performance;
      mobileCount++;
    }
  }
  const avgMobilePerf = Math.round(totalMobilePerf / mobileCount);

  md += `- **Mobile Performance Crisis:** Average mobile performance score is ${avgMobilePerf}/100 (target: 80+)\n`;
  md += '- **Core Web Vitals Failing:** LCP exceeds 10 seconds on mobile (target: <2.5s)\n';
  md += '- **Severe Mobile/Desktop Gap:** Desktop outperforms mobile by 24-32 points\n';
  md += '- **SEO Issues:** All pages missing target SEO score of 90+\n\n';

  // Recommendations by Priority
  md += '## Prioritized Recommendations\n\n';

  md += '### CRITICAL (Fix Immediately)\n\n';
  for (const rec of recommendations.critical.slice(0, 5)) {
    md += `#### ${rec.title}\n\n`;
    md += `- **Impact:** Affects ${rec.affectedPages} pages, ${rec.affectedMobile ? 'especially on mobile' : ''}\n`;
    md += `- **Potential Savings:** ${rec.avgSavingsMs}ms average\n`;
    md += `- **Description:** ${rec.description}\n\n`;
  }

  md += '### HIGH PRIORITY (Fix This Sprint)\n\n';
  for (const rec of recommendations.high.slice(0, 5)) {
    md += `#### ${rec.title}\n\n`;
    md += `- **Impact:** Affects ${rec.affectedPages} pages\n`;
    md += `- **Potential Savings:** ${rec.avgSavingsMs}ms average\n`;
    md += `- **Description:** ${rec.description}\n\n`;
  }

  md += '### MEDIUM PRIORITY (Next Sprint)\n\n';
  for (const rec of recommendations.medium.slice(0, 5)) {
    md += `- **${rec.title}** - Affects ${rec.affectedPages} pages, saves ~${rec.avgSavingsMs}ms\n`;
  }

  // Bundle Analysis
  md += '\n## Bundle Size Analysis\n\n';
  const homeDesktop = analysis.home?.desktop?.bundles;
  if (homeDesktop) {
    md += `### Home Page (Desktop)\n\n`;
    md += `- **Total JavaScript:** ${homeDesktop.totalJS} KB\n`;
    md += `- **Total CSS:** ${homeDesktop.totalCSS} KB\n`;
    md += `- **Total Fonts:** ${homeDesktop.totalFonts} KB\n\n`;

    md += '#### Top JavaScript Bundles\n\n';
    for (const bundle of homeDesktop.javascript.slice(0, 10)) {
      const filename = bundle.url.split('/').pop().substring(0, 50);
      md += `- ${filename}: ${bundle.sizeKB} KB\n`;
    }
  }

  // Core Web Vitals Deep Dive
  md += '\n## Core Web Vitals Analysis\n\n';
  md += '### Mobile Issues\n\n';
  for (const [pageName, devices] of Object.entries(analysis)) {
    if (devices.mobile && devices.mobile.coreWebVitalsIssues.length > 0) {
      md += `\n#### ${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page\n\n`;
      for (const issue of devices.mobile.coreWebVitalsIssues) {
        md += `- **${issue.vital}:** ${issue.value} (score: ${Math.round(issue.score * 100)})\n`;
        if (issue.culprits && issue.culprits.length > 0) {
          md += '  - Culprits:\n';
          for (const culprit of issue.culprits.slice(0, 3)) {
            md += `    - ${culprit.element} (shift: ${culprit.score})\n`;
          }
        }
      }
    }
  }

  // SEO Analysis
  md += '\n## SEO Issues\n\n';
  const seoIssues = new Set();
  for (const [pageName, devices] of Object.entries(analysis)) {
    for (const issue of devices.mobile?.seoIssues || []) {
      seoIssues.add(JSON.stringify({ id: issue.id, title: issue.title }));
    }
  }

  for (const issueStr of seoIssues) {
    const issue = JSON.parse(issueStr);
    md += `- **${issue.title}**\n`;
  }

  // Implementation Plan
  md += '\n## Implementation Plan\n\n';
  md += '### Phase 1: Critical Performance Fixes (Week 1-2)\n\n';
  md += '1. Implement font-display: swap for all custom fonts\n';
  md += '2. Add explicit width/height to all images (fix CLS)\n';
  md += '3. Remove render-blocking resources (async/defer scripts)\n';
  md += '4. Enable text compression (gzip/brotli)\n';
  md += '5. Implement code splitting for vendor chunks\n\n';

  md += '### Phase 2: Mobile Optimization (Week 3-4)\n\n';
  md += '1. Reduce JavaScript bundle sizes (tree shaking)\n';
  md += '2. Implement lazy loading for below-fold images\n';
  md += '3. Optimize LCP element loading (preload critical resources)\n';
  md += '4. Remove unused CSS/JS\n';
  md += '5. Optimize animations for mobile (reduce motion on low-end devices)\n\n';

  md += '### Phase 3: SEO & Best Practices (Week 5-6)\n\n';
  md += '1. Add missing meta descriptions\n';
  md += '2. Improve link text descriptiveness\n';
  md += '3. Implement structured data\n';
  md += '4. Optimize robots.txt and canonical URLs\n';
  md += '5. Implement HTTP/2 server push for critical resources\n\n';

  return md;
}

/**
 * Main execution
 */
async function main() {
  console.log('Loading Lighthouse reports...');
  const reports = loadReports();

  console.log('Analyzing performance...');
  const analysis = generateAnalysis(reports);

  console.log('Generating recommendations...');
  const recommendations = generateRecommendations(analysis);

  console.log('Creating detailed report...');
  const markdown = generateMarkdownReport(analysis, recommendations);

  // Save analysis
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const analysisPath = path.join(REPORTS_DIR, `${timestamp}_detailed-analysis.json`);
  fs.writeFileSync(analysisPath, JSON.stringify({ analysis, recommendations }, null, 2));
  console.log(`Analysis saved: ${analysisPath}`);

  // Save markdown report
  const markdownPath = path.join(REPORTS_DIR, `${timestamp}_detailed-analysis.md`);
  fs.writeFileSync(markdownPath, markdown);
  console.log(`Markdown report saved: ${markdownPath}`);

  // Print to console
  console.log('\n' + markdown);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
