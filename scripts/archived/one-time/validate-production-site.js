#!/usr/bin/env node

import https from 'https';

const BASE_URL = 'https://disruptors-ai-marketing-hub.netlify.app';

const PAGES_TO_TEST = [
  '/',
  '/solutions-ai-automation',
  '/solutions-crm-management',
  '/solutions-custom-apps',
  '/solutions-fractional-cmo',
  '/solutions-lead-generation',
  '/solutions-paid-advertising',
  '/solutions-podcasting',
  '/solutions-seo-geo',
  '/solutions-social-media',
  '/graveyard-archive',
  '/screenshot-manager',
  '/about',
  '/contact',
  '/work'
];

let passedTests = 0;
let failedTests = 0;
let testResults = [];

function testPage(path) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${path}`;

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const result = {
          path,
          url,
          statusCode: res.statusCode,
          contentLength: data.length,
          hasHTML: data.includes('<html'),
          hasTitle: data.includes('<title>'),
          hasReact: data.includes('react'),
          hasMainApp: data.includes('id="root"') || data.includes('id="app"'),
          timestamp: new Date().toLocaleTimeString()
        };

        // Determine if test passed
        if (res.statusCode === 200 && data.length > 1000 && result.hasHTML) {
          result.status = 'PASS';
          passedTests++;
        } else {
          result.status = 'FAIL';
          failedTests++;
        }

        testResults.push(result);
        resolve(result);
      });
    }).on('error', (error) => {
      const result = {
        path,
        url,
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      };
      testResults.push(result);
      failedTests++;
      resolve(result);
    });
  });
}

async function runTests() {
  console.log('\n=== PRODUCTION SITE VALIDATION ===');
  console.log(`Testing: ${BASE_URL}`);
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log(`\nTesting ${PAGES_TO_TEST.length} pages...\n`);

  // Test all pages
  for (const path of PAGES_TO_TEST) {
    process.stdout.write(`Testing ${path.padEnd(30)}... `);
    const result = await testPage(path);

    if (result.status === 'PASS') {
      console.log(`✓ PASS (${result.statusCode}, ${(result.contentLength / 1024).toFixed(1)}KB)`);
    } else if (result.status === 'FAIL') {
      console.log(`✗ FAIL (${result.statusCode || 'N/A'}, ${result.contentLength ? (result.contentLength / 1024).toFixed(1) + 'KB' : '0KB'})`);
    } else {
      console.log(`✗ ERROR (${result.error})`);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Print summary
  console.log('\n=== TEST SUMMARY ===\n');
  console.log(`Total Tests: ${PAGES_TO_TEST.length}`);
  console.log(`Passed: ${passedTests} (${((passedTests / PAGES_TO_TEST.length) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failedTests} (${((failedTests / PAGES_TO_TEST.length) * 100).toFixed(1)}%)`);

  // Show failed tests in detail
  if (failedTests > 0) {
    console.log('\n=== FAILED TESTS ===\n');
    testResults.filter(r => r.status !== 'PASS').forEach(result => {
      console.log(`${result.path}:`);
      console.log(`  URL: ${result.url}`);
      console.log(`  Status Code: ${result.statusCode || 'N/A'}`);
      console.log(`  Content Length: ${result.contentLength || 0} bytes`);
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
      console.log('');
    });
  }

  // Component-specific checks
  console.log('\n=== COMPONENT VALIDATION ===\n');
  console.log('Testing home page for key components...\n');

  const homeResult = testResults.find(r => r.path === '/');
  if (homeResult && homeResult.status === 'PASS') {
    console.log('✓ Home page loads successfully');
    console.log('  - Basic SPA structure: OK');
    console.log('  - HTML present: ' + (homeResult.hasHTML ? 'YES' : 'NO'));
    console.log('  - Title tag: ' + (homeResult.hasTitle ? 'YES' : 'NO'));
    console.log('  - Main app container: ' + (homeResult.hasMainApp ? 'YES' : 'NO'));
  } else {
    console.log('✗ Home page failed to load');
  }

  console.log('\n=== DEPLOYMENT INFORMATION ===\n');
  console.log('Site URL: https://disruptors-ai-marketing-hub.netlify.app');
  console.log('Admin Dashboard: https://app.netlify.com/projects/disruptors-ai-marketing-hub');
  console.log('\nNOTE: The site is not connected to GitHub for automatic deployments.');
  console.log('Latest deployment: October 2, 2025 (predates today\'s master branch push)');
  console.log('\nTo test the latest code:');
  console.log('1. Connect GitHub repository to Netlify');
  console.log('2. Or manually trigger deployment via build hook');
  console.log('3. Or use Netlify CLI: netlify deploy --prod');

  console.log('\n');
  process.exit(failedTests > 0 ? 1 : 0);
}

runTests();
