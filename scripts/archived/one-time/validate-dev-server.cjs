/**
 * Development Server Validation Script
 * Performs comprehensive closed-loop validation of the local dev server
 * Tests: HTTP status, routing, assets, and basic functionality
 */

const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = 'http://localhost:5174';
const ROUTES_TO_TEST = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/work', name: 'Work' },
  { path: '/solutions', name: 'Solutions' },
  { path: '/contact', name: 'Contact' },
  { path: '/blog', name: 'Blog' },
  { path: '/assessment', name: 'Assessment' },
];

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Results tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

/**
 * Make HTTP request and return response details
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Log with color
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Test a single route
 */
async function testRoute(route) {
  const url = `${BASE_URL}${route.path}`;

  try {
    const response = await makeRequest(url);

    // Check status code
    if (response.statusCode === 200) {
      log(`  ✓ ${route.name} (${route.path}): ${response.statusCode}`, colors.green);

      // Validate HTML structure
      const hasDoctype = response.body.toLowerCase().includes('<!doctype html');
      const hasRoot = response.body.includes('id="root"');
      const hasViteScript = response.body.includes('/@vite/client');
      const hasMainScript = response.body.includes('/src/main.jsx');

      if (!hasDoctype) {
        log(`    ⚠ Missing DOCTYPE declaration`, colors.yellow);
        results.warnings++;
      }

      if (!hasRoot) {
        log(`    ✗ Missing root element`, colors.red);
        results.failed++;
        return false;
      }

      if (!hasViteScript) {
        log(`    ⚠ Missing Vite client script`, colors.yellow);
        results.warnings++;
      }

      if (!hasMainScript) {
        log(`    ✗ Missing main application script`, colors.red);
        results.failed++;
        return false;
      }

      results.passed++;
      return true;
    } else {
      log(`  ✗ ${route.name} (${route.path}): ${response.statusCode}`, colors.red);
      results.failed++;
      return false;
    }
  } catch (error) {
    log(`  ✗ ${route.name} (${route.path}): ${error.message}`, colors.red);
    results.failed++;
    return false;
  }
}

/**
 * Check server availability
 */
async function checkServerAvailability() {
  try {
    const response = await makeRequest(BASE_URL);
    return response.statusCode === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Test asset availability
 */
async function testCriticalAssets() {
  log('\n📦 Testing Critical Assets...', colors.cyan);

  const assets = [
    '/@vite/client',
    '/src/main.jsx',
  ];

  for (const asset of assets) {
    try {
      const response = await makeRequest(`${BASE_URL}${asset}`);
      if (response.statusCode === 200) {
        log(`  ✓ ${asset}: Available`, colors.green);
        results.passed++;
      } else {
        log(`  ✗ ${asset}: ${response.statusCode}`, colors.red);
        results.failed++;
      }
    } catch (error) {
      log(`  ✗ ${asset}: ${error.message}`, colors.red);
      results.failed++;
    }
  }
}

/**
 * Main validation function
 */
async function validateDevServer() {
  log('\n' + '='.repeat(60), colors.bright);
  log('DEVELOPMENT SERVER VALIDATION REPORT', colors.bright + colors.cyan);
  log('='.repeat(60) + '\n', colors.bright);

  log(`🔍 Target: ${BASE_URL}`, colors.blue);
  log(`📅 Date: ${new Date().toISOString()}\n`, colors.blue);

  // Step 1: Check if server is running
  log('🚀 Checking Server Availability...', colors.cyan);
  const serverIsRunning = await checkServerAvailability();

  if (!serverIsRunning) {
    log('  ✗ Server is not responding', colors.red);
    log('\n' + '='.repeat(60), colors.bright);
    log('VALIDATION FAILED: Server not available', colors.red + colors.bright);
    log('='.repeat(60) + '\n', colors.bright);
    process.exit(1);
  }

  log('  ✓ Server is responding', colors.green);
  results.passed++;

  // Step 2: Test all routes
  log('\n🗺️  Testing Routes...', colors.cyan);
  for (const route of ROUTES_TO_TEST) {
    await testRoute(route);
  }

  // Step 3: Test critical assets
  await testCriticalAssets();

  // Step 4: Generate summary
  log('\n' + '='.repeat(60), colors.bright);
  log('VALIDATION SUMMARY', colors.bright + colors.cyan);
  log('='.repeat(60), colors.bright);

  const total = results.passed + results.failed;
  const passRate = ((results.passed / total) * 100).toFixed(1);

  log(`\n✓ Passed: ${results.passed}`, colors.green);
  log(`✗ Failed: ${results.failed}`, colors.red);
  log(`⚠ Warnings: ${results.warnings}`, colors.yellow);
  log(`📊 Pass Rate: ${passRate}%`, colors.cyan);

  // Overall health assessment
  log('\n' + '='.repeat(60), colors.bright);
  if (results.failed === 0 && results.warnings === 0) {
    log('OVERALL STATUS: EXCELLENT ✓', colors.green + colors.bright);
    log('All tests passed without warnings', colors.green);
  } else if (results.failed === 0 && results.warnings > 0) {
    log('OVERALL STATUS: GOOD ⚠', colors.yellow + colors.bright);
    log(`${results.warnings} warning(s) detected but no failures`, colors.yellow);
  } else if (results.failed <= 2) {
    log('OVERALL STATUS: DEGRADED ✗', colors.yellow + colors.bright);
    log(`${results.failed} test(s) failed - investigation recommended`, colors.yellow);
  } else {
    log('OVERALL STATUS: CRITICAL ✗✗', colors.red + colors.bright);
    log(`${results.failed} test(s) failed - immediate attention required`, colors.red);
  }

  log('='.repeat(60) + '\n', colors.bright);

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run validation
validateDevServer().catch((error) => {
  log(`\n✗ Validation script error: ${error.message}`, colors.red);
  process.exit(1);
});
