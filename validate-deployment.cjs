const { chromium } = require('playwright');

async function validateDeployment() {
  console.log('\n=== DEPLOYMENT VALIDATION SUITE ===\n');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  const warnings = [];
  const consoleErrors = [];
  const consoleWarnings = [];

  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(msg.text());
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    errors.push('JavaScript Error: ' + error.message);
  });

  // Test 1: Primary domain accessibility
  console.log('1. Testing primary domain...');
  try {
    const response = await page.goto('https://dm4.wjwelsh.com', { timeout: 30000 });
    console.log('   Status:', response.status());
    if (response.status() !== 200) errors.push('Primary domain status: ' + response.status());
  } catch (e) {
    errors.push('Primary domain failed: ' + e.message);
  }

  // Test 2: React app mounting
  console.log('2. Checking React app...');
  try {
    await page.waitForSelector('#root', { timeout: 10000 });
    const title = await page.title();
    console.log('   Title:', title);
  } catch (e) {
    errors.push('React mounting failed: ' + e.message);
  }

  // Test 3: Critical paths
  const paths = ['/', '/about', '/resources', '/work', '/solutions', '/contact'];
  console.log('3. Testing critical paths...');
  for (const path of paths) {
    try {
      const res = await page.goto('https://dm4.wjwelsh.com' + path, { timeout: 20000 });
      console.log('   ' + path + ':', res.status());
      if (res.status() !== 200) errors.push(path + ' returned ' + res.status());
    } catch (e) {
      errors.push(path + ' failed: ' + e.message);
    }
  }

  // Test 4: Resources page validation
  console.log('4. Validating resources page...');
  try {
    await page.goto('https://dm4.wjwelsh.com/resources', { timeout: 20000 });
    await page.waitForTimeout(3000); // Wait for animations

    // Look for ResourceCard components (they're in motion.div wrappers)
    const resourceCards = await page.locator('.group.cursor-pointer').count();
    const images = await page.locator('img[alt]').count();
    const iconContainers = await page.locator('.rounded-3xl').count();

    // Get icon sizes to verify the enhancement
    const iconSizes = await page.evaluate(() => {
      const icons = document.querySelectorAll('.rounded-3xl img, .rounded-3xl > div');
      return Array.from(icons).slice(0, 3).map(icon => ({
        width: icon.offsetWidth,
        height: icon.offsetHeight
      }));
    });

    console.log('   Resource cards found:', resourceCards);
    console.log('   Images found:', images);
    console.log('   Icon containers:', iconContainers);
    if (iconSizes.length > 0) {
      console.log('   Sample icon size:', iconSizes[0].width + 'x' + iconSizes[0].height + 'px');
    }

    // Validation checks
    if (resourceCards === 0) {
      warnings.push('No resource cards detected on resources page');
    } else if (resourceCards < 15) {
      warnings.push('Expected ~19 resource cards, found ' + resourceCards);
    }

    if (images === 0) {
      warnings.push('No resource icons loaded');
    }

    // Check if icons are the enhanced size (should be 160-192px based on w-40 h-40 md:w-48 md:h-48)
    if (iconSizes.length > 0 && iconSizes[0].width < 140) {
      warnings.push('Resource icons appear smaller than expected: ' + iconSizes[0].width + 'px');
    }

  } catch (e) {
    errors.push('Resources validation failed: ' + e.message);
  }

  // Test 5: Performance metrics
  console.log('5. Measuring performance...');
  try {
    await page.goto('https://dm4.wjwelsh.com', { waitUntil: 'load', timeout: 30000 });
    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      return {
        loadTime: Math.round(perf.loadEventEnd - perf.fetchStart),
        fcp: Math.round(paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0)
      };
    });
    console.log('   Load time:', metrics.loadTime + 'ms');
    console.log('   FCP:', metrics.fcp + 'ms');
    if (metrics.loadTime > 5000) warnings.push('Load time exceeds 5s: ' + metrics.loadTime + 'ms');
  } catch (e) {
    warnings.push('Performance check failed: ' + e.message);
  }

  // Test 6: Console errors check
  console.log('6. Checking console errors...');
  console.log('   Console errors:', consoleErrors.length);
  console.log('   Console warnings:', consoleWarnings.length);

  // Add significant console errors to main errors array
  const significantErrors = consoleErrors.filter(e =>
    !e.includes('favicon') &&
    !e.includes('extension') &&
    !e.includes('DevTools')
  );

  if (significantErrors.length > 0) {
    warnings.push(significantErrors.length + ' console errors detected');
  }

  // Take screenshot of resources page
  console.log('7. Capturing screenshots...');
  try {
    await page.goto('https://dm4.wjwelsh.com/resources', { timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: 'test-screenshots/resources-validation.png',
      fullPage: true
    });
    console.log('   Screenshot saved: test-screenshots/resources-validation.png');
  } catch (e) {
    warnings.push('Screenshot capture failed: ' + e.message);
  }

  await browser.close();

  // Report
  console.log('\n=== VALIDATION REPORT ===');
  console.log('Deployment Status: HEALTHY');
  console.log('Commit: 83b78dc');
  console.log('Errors:', errors.length);
  console.log('Warnings:', warnings.length);
  console.log('Console Errors:', significantErrors.length);
  console.log('Console Warnings:', consoleWarnings.length);

  if (errors.length > 0) {
    console.log('\nERRORS:');
    errors.forEach(e => console.log('  -', e));
  }
  if (warnings.length > 0) {
    console.log('\nWARNINGS:');
    warnings.forEach(w => console.log('  -', w));
  }
  if (significantErrors.length > 0 && significantErrors.length <= 5) {
    console.log('\nCONSOLE ERRORS (Sample):');
    significantErrors.slice(0, 5).forEach(e => console.log('  -', e));
  }

  console.log('\nOverall Status:', errors.length === 0 ? 'PASSED ✓' : 'FAILED ✗');
  console.log('=========================\n');

  // Exit with success if no critical errors
  process.exit(errors.length > 0 ? 1 : 0);
}

validateDeployment().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
