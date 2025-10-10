const playwright = require('playwright');

async function validateDeployment() {
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    timestamp: new Date().toISOString(),
    deployment_url: 'https://dm4.wjwelsh.com',
    tests: []
  };

  // Collect console messages and errors
  const consoleMessages = [];
  const errors = [];

  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack
    });
  });

  // Track network requests for bundle loading
  const bundles = [];
  page.on('response', response => {
    const url = response.url();
    if (url.includes('.js') && (url.includes('index-') || url.includes('vendor-'))) {
      bundles.push({
        url: url,
        status: response.status()
      });
    }
  });

  try {
    // TEST 1: Home page load
    console.log('\n=== TEST 1: Home Page Load ===');
    await page.goto('https://dm4.wjwelsh.com/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const homeErrors = errors.filter(e => e.message.includes('forwardRef') || e.message.includes('React'));

    results.tests.push({
      name: 'Home Page Load',
      status: homeErrors.length === 0 ? 'PASS' : 'FAIL',
      errors: homeErrors,
      bundles_loaded: bundles.map(b => ({
        file: b.url.split('/').pop(),
        status: b.status
      }))
    });

    console.log('Home Page Status:', homeErrors.length === 0 ? 'PASS ✓' : 'FAIL ✗');
    console.log('Bundles Loaded:', bundles.length);
    bundles.forEach(b => console.log('  -', b.url.split('/').pop(), 'Status:', b.status));

    // TEST 2: Check React availability
    console.log('\n=== TEST 2: React Availability ===');
    const reactAvailable = await page.evaluate(() => {
      return typeof window.React !== 'undefined';
    });

    results.tests.push({
      name: 'React Global Availability',
      status: reactAvailable ? 'PASS' : 'FAIL',
      details: { react_available: reactAvailable }
    });

    console.log('React Available:', reactAvailable ? 'PASS ✓' : 'FAIL ✗');

    // TEST 3: About page
    console.log('\n=== TEST 3: About Page ===');
    errors.length = 0;
    await page.goto('https://dm4.wjwelsh.com/about', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const aboutErrors = errors.filter(e => e.message.includes('forwardRef') || e.message.includes('React'));

    results.tests.push({
      name: 'About Page Load',
      status: aboutErrors.length === 0 ? 'PASS' : 'FAIL',
      errors: aboutErrors
    });

    console.log('About Page Status:', aboutErrors.length === 0 ? 'PASS ✓' : 'FAIL ✗');

    // TEST 4: Work page
    console.log('\n=== TEST 4: Work Page ===');
    errors.length = 0;
    await page.goto('https://dm4.wjwelsh.com/work', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const workErrors = errors.filter(e => e.message.includes('forwardRef') || e.message.includes('React'));

    results.tests.push({
      name: 'Work Page Load',
      status: workErrors.length === 0 ? 'PASS' : 'FAIL',
      errors: workErrors
    });

    console.log('Work Page Status:', workErrors.length === 0 ? 'PASS ✓' : 'FAIL ✗');

    // TEST 5: Solutions page
    console.log('\n=== TEST 5: Solutions Page ===');
    errors.length = 0;
    await page.goto('https://dm4.wjwelsh.com/solutions', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const solutionsErrors = errors.filter(e => e.message.includes('forwardRef') || e.message.includes('React'));

    results.tests.push({
      name: 'Solutions Page Load',
      status: solutionsErrors.length === 0 ? 'PASS' : 'FAIL',
      errors: solutionsErrors
    });

    console.log('Solutions Page Status:', solutionsErrors.length === 0 ? 'PASS ✓' : 'FAIL ✗');

    // TEST 6: Console error check
    console.log('\n=== TEST 6: Console Error Summary ===');
    const criticalErrors = consoleMessages.filter(msg =>
      msg.type === 'error' &&
      (msg.text.includes('forwardRef') || msg.text.includes('React') || msg.text.includes('chunk'))
    );

    results.tests.push({
      name: 'Console Error Check',
      status: criticalErrors.length === 0 ? 'PASS' : 'FAIL',
      critical_errors: criticalErrors
    });

    console.log('Critical Errors Found:', criticalErrors.length);
    if (criticalErrors.length > 0) {
      criticalErrors.forEach(err => console.log('  ERROR:', err.text));
    }

    // TEST 7: Bundle loading order verification
    console.log('\n=== TEST 7: Bundle Loading Order ===');
    const mainBundle = bundles.find(b => b.url.includes('index-'));
    const vendorUiBundle = bundles.find(b => b.url.includes('vendor-ui'));

    const bundleOrderCorrect = mainBundle && vendorUiBundle &&
      bundles.indexOf(mainBundle) < bundles.indexOf(vendorUiBundle);

    results.tests.push({
      name: 'Bundle Loading Order',
      status: bundleOrderCorrect ? 'PASS' : 'FAIL',
      details: {
        main_bundle: mainBundle ? mainBundle.url.split('/').pop() : 'NOT FOUND',
        vendor_ui_bundle: vendorUiBundle ? vendorUiBundle.url.split('/').pop() : 'NOT FOUND',
        main_loaded_first: bundleOrderCorrect
      }
    });

    console.log('Bundle Order:', bundleOrderCorrect ? 'CORRECT ✓' : 'INCORRECT ✗');
    if (mainBundle) console.log('  Main Bundle:', mainBundle.url.split('/').pop());
    if (vendorUiBundle) console.log('  Vendor-UI Bundle:', vendorUiBundle.url.split('/').pop());

  } catch (error) {
    console.error('Test execution error:', error.message);
    results.tests.push({
      name: 'Test Execution',
      status: 'FAIL',
      error: error.message
    });
  } finally {
    await browser.close();
  }

  // Summary
  console.log('\n=== VALIDATION SUMMARY ===');
  const passed = results.tests.filter(t => t.status === 'PASS').length;
  const total = results.tests.length;
  console.log('Tests Passed:', passed + '/' + total);
  console.log('Overall Status:', passed === total ? 'ALL TESTS PASSED ✓' : 'SOME TESTS FAILED ✗');

  console.log('\n=== DETAILED RESULTS ===');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

validateDeployment().catch(err => {
  console.error('Validation failed:', err);
  process.exit(1);
});
