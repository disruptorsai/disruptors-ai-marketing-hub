/**
 * DataForSEO Integration Test Script
 *
 * Tests all DataForSEO API integrations to verify:
 * 1. Credentials are valid
 * 2. API endpoints are accessible
 * 3. Response formats are correct
 * 4. Analyzers work end-to-end
 *
 * Usage:
 *   node scripts/test-dataforseo-integration.js
 *
 * Environment Variables Required:
 *   DATAFORSEO_LOGIN=your_email@example.com
 *   DATAFORSEO_PASSWORD=your_api_password
 */

import 'dotenv/config';

// Test domain (well-established site with known data)
const TEST_DOMAIN = 'openai.com';

console.log('\n🧪 DataForSEO Integration Test Suite\n');
console.log('═'.repeat(60));

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function heading(message) {
  console.log('\n' + '─'.repeat(60));
  log(message, 'blue');
  console.log('─'.repeat(60));
}

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function recordTest(name, passed, message = '') {
  results.tests.push({ name, passed, message });
  if (passed) {
    results.passed++;
    success(`${name}: ${message}`);
  } else {
    results.failed++;
    error(`${name}: ${message}`);
  }
}

async function runTests() {
  try {
    // Test 1: Environment Variables
    heading('Test 1: Environment Variables');

    const login = process.env.DATAFORSEO_LOGIN || process.env.VITE_DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD || process.env.VITE_DATAFORSEO_PASSWORD;

    if (login && password) {
      recordTest('Credentials Found', true, `Login: ${login.substring(0, 3)}***`);
    } else {
      recordTest('Credentials Found', false, 'Missing DATAFORSEO_LOGIN or DATAFORSEO_PASSWORD');
      error('\nPlease set environment variables:');
      console.log('  DATAFORSEO_LOGIN=your_email@example.com');
      console.log('  DATAFORSEO_PASSWORD=your_api_password\n');
      return;
    }

    // Test 2: DataForSEO Client Import
    heading('Test 2: Module Imports');

    let dataForSEOClient;
    try {
      const module = await import('../src/lib/dataforseo-client.js');
      dataForSEOClient = module.dataForSEOClient || module.default;
      recordTest('DataForSEO Client Import', true, 'Module loaded successfully');
    } catch (err) {
      recordTest('DataForSEO Client Import', false, err.message);
      return;
    }

    let BacklinksAnalyzer, DomainMetricsAnalyzer;
    try {
      const backlinkModule = await import('../src/lib/growth-audit/audits/backlinks.js');
      BacklinksAnalyzer = backlinkModule.BacklinksAnalyzer;
      recordTest('Backlinks Analyzer Import', true, 'Module loaded successfully');
    } catch (err) {
      recordTest('Backlinks Analyzer Import', false, err.message);
    }

    try {
      const metricsModule = await import('../src/lib/growth-audit/audits/domain-metrics.js');
      DomainMetricsAnalyzer = metricsModule.DomainMetricsAnalyzer;
      recordTest('Domain Metrics Analyzer Import', true, 'Module loaded successfully');
    } catch (err) {
      recordTest('Domain Metrics Analyzer Import', false, err.message);
    }

    // Test 3: API Connectivity - Keywords (baseline test)
    heading('Test 3: API Connectivity - Keywords API (Baseline)');

    info(`Testing with domain: ${TEST_DOMAIN}`);

    try {
      const keywordData = await dataForSEOClient.getKeywordSuggestions('AI', 2840, 'en', 5);
      if (keywordData && keywordData.length > 0) {
        recordTest('Keywords API', true, `Retrieved ${keywordData.length} keyword suggestions`);
        info(`  Sample keyword: "${keywordData[0].keyword}" (${keywordData[0].searchVolume} searches/mo)`);
      } else {
        recordTest('Keywords API', false, 'No keyword data returned');
      }
    } catch (err) {
      recordTest('Keywords API', false, err.message);
      warning('Keywords API failed - checking if it\'s a credentials issue or API issue');
    }

    // Test 4: Backlinks API
    heading('Test 4: Backlinks API');

    try {
      info(`Fetching backlink summary for ${TEST_DOMAIN}...`);
      const summary = await dataForSEOClient.getBacklinksSummary(TEST_DOMAIN, 'domain');

      if (summary) {
        const backlinks = summary.backlinks || 0;
        const refDomains = summary.referring_domains || 0;

        recordTest('Backlinks API - Summary', true, `${backlinks.toLocaleString()} backlinks, ${refDomains.toLocaleString()} referring domains`);

        // Test domain rating calculation
        const domainRating = dataForSEOClient.calculateDomainRating(summary);
        info(`  Calculated Domain Rating: ${domainRating}/100`);

        // Test referring domains
        info('Fetching top referring domains...');
        const referrers = await dataForSEOClient.getReferringDomains(TEST_DOMAIN, 'domain', 10);

        if (referrers && referrers.length > 0) {
          recordTest('Backlinks API - Referring Domains', true, `Retrieved ${referrers.length} referring domains`);
          info(`  Top referrer: ${referrers[0].target || referrers[0].domain || 'Unknown'}`);
        } else {
          recordTest('Backlinks API - Referring Domains', false, 'No referring domains returned');
        }
      } else {
        recordTest('Backlinks API - Summary', false, 'No backlink data returned');
      }
    } catch (err) {
      recordTest('Backlinks API', false, err.message);
      warning('This might indicate the Backlinks API is not enabled on your account');
    }

    // Test 5: Domain Analytics API
    heading('Test 5: Domain Analytics API');

    try {
      info(`Fetching domain overview for ${TEST_DOMAIN}...`);
      const overview = await dataForSEOClient.getDomainOverview(TEST_DOMAIN);

      if (overview) {
        const traffic = overview.organic_etv || 0;
        const keywords = overview.organic_keywords_count || 0;

        recordTest('Domain Analytics API - Overview', true, `${traffic.toLocaleString()} est. traffic, ${keywords.toLocaleString()} organic keywords`);

        // Test organic keywords
        info('Fetching top organic keywords...');
        const topKeywords = await dataForSEOClient.getOrganicKeywords(TEST_DOMAIN, 10);

        if (topKeywords && topKeywords.length > 0) {
          recordTest('Domain Analytics API - Keywords', true, `Retrieved ${topKeywords.length} keywords`);
          // Note: topKeywords structure varies by endpoint
          info(`  Sample: ${topKeywords.length} keywords returned`);
        } else {
          warning('No organic keywords returned (this is normal for some endpoints)');
          results.warnings++;
        }
      } else {
        recordTest('Domain Analytics API - Overview', false, 'No domain data returned');
      }
    } catch (err) {
      recordTest('Domain Analytics API', false, err.message);
      warning('This might indicate the Domain Analytics API is not enabled');
    }

    // Test 6: DataForSEO Labs API
    heading('Test 6: DataForSEO Labs API');

    try {
      info(`Fetching competitors for ${TEST_DOMAIN}...`);
      const competitors = await dataForSEOClient.getCompetitors(TEST_DOMAIN, 5);

      if (competitors && competitors.length > 0) {
        recordTest('DataForSEO Labs - Competitors', true, `Found ${competitors.length} competitors`);
        info(`  Top competitor: ${competitors[0].domain || 'Unknown'}`);
      } else {
        recordTest('DataForSEO Labs - Competitors', false, 'No competitors returned');
      }
    } catch (err) {
      recordTest('DataForSEO Labs', false, err.message);
      warning('This might indicate DataForSEO Labs is not enabled');
    }

    // Test 7: Backlinks Analyzer End-to-End
    if (BacklinksAnalyzer) {
      heading('Test 7: Backlinks Analyzer (End-to-End)');

      try {
        const analyzer = new BacklinksAnalyzer();
        info(`Running complete backlink analysis for ${TEST_DOMAIN}...`);

        const result = await analyzer.analyze(TEST_DOMAIN);

        if (result && result.status !== 'error') {
          recordTest('Backlinks Analyzer', true, `DR: ${result.domain_rating}, Quality: ${result.link_quality.score}`);
          info(`  Backlinks: ${result.total_backlinks.toLocaleString()}`);
          info(`  Referring Domains: ${result.referring_domains.toLocaleString()}`);
          info(`  Opportunities: ${result.opportunities.length} identified`);
        } else {
          recordTest('Backlinks Analyzer', false, result.error_message || 'Analysis failed');
        }
      } catch (err) {
        recordTest('Backlinks Analyzer', false, err.message);
      }
    }

    // Test 8: Domain Metrics Analyzer End-to-End
    if (DomainMetricsAnalyzer) {
      heading('Test 8: Domain Metrics Analyzer (End-to-End)');

      try {
        const analyzer = new DomainMetricsAnalyzer();
        info(`Running complete domain metrics analysis for ${TEST_DOMAIN}...`);

        const result = await analyzer.analyze(TEST_DOMAIN);

        if (result && result.status !== 'error') {
          recordTest('Domain Metrics Analyzer', true, `Visibility: ${result.visibility_score}, Quality: ${result.traffic_quality.score}`);
          info(`  Est. Traffic: ${result.organic_traffic_estimate.toLocaleString()}/mo`);
          info(`  Keywords: ${result.organic_keywords_count.toLocaleString()}`);
          info(`  Competitors: ${result.top_competitors.length} found`);
        } else {
          recordTest('Domain Metrics Analyzer', false, result.error_message || 'Analysis failed');
        }
      } catch (err) {
        recordTest('Domain Metrics Analyzer', false, err.message);
      }
    }

    // Final Summary
    heading('Test Summary');

    console.log('\nResults:');
    console.log(`  Total Tests: ${results.passed + results.failed}`);
    success(`  Passed: ${results.passed}`);
    if (results.failed > 0) {
      error(`  Failed: ${results.failed}`);
    }
    if (results.warnings > 0) {
      warning(`  Warnings: ${results.warnings}`);
    }

    console.log('\n' + '═'.repeat(60));

    if (results.failed === 0) {
      success('\n🎉 All tests passed! DataForSEO integration is ready.\n');
      info('Next steps:');
      console.log('  1. Run: npm run build');
      console.log('  2. Test locally: npm run dev:netlify');
      console.log('  3. Navigate to /demos/growth-audit');
      console.log('  4. Run an audit on a real domain\n');
    } else {
      error('\n⚠️  Some tests failed. Please review the errors above.\n');
      info('Common issues:');
      console.log('  - Missing or incorrect DataForSEO credentials');
      console.log('  - API services not enabled on your account');
      console.log('  - API rate limits or quota exceeded');
      console.log('  - Network connectivity issues\n');
    }

    // Detailed test report
    if (results.failed > 0) {
      heading('Failed Tests Detail');
      results.tests.filter(t => !t.passed).forEach(test => {
        error(`${test.name}`);
        console.log(`  Reason: ${test.message}`);
      });
      console.log();
    }

  } catch (err) {
    console.error('\n❌ Unexpected error during testing:\n');
    console.error(err);
    process.exit(1);
  }
}

// Run tests
runTests().then(() => {
  process.exit(results.failed > 0 ? 1 : 0);
}).catch(err => {
  console.error('\n❌ Fatal error:\n');
  console.error(err);
  process.exit(1);
});
