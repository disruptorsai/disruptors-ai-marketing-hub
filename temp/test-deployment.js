import { chromium } from 'playwright';

async function testDeployment() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-cache', '--disable-application-cache', '--disable-offline-load-stale-cache']
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    // Clear all browser data - fresh start
    storageState: undefined
  });

  // Clear all storage
  await context.clearCookies();

  const page = await context.newPage();

  // Additional cache clearing
  await page.route('**/*', route => route.continue());

  // Collect console messages
  const consoleLogs = [];
  const consoleErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  // Collect network errors
  const networkErrors = [];
  page.on('requestfailed', request => {
    networkErrors.push(`${request.url()} - ${request.failure().errorText}`);
  });

  try {
    console.log('🚀 Navigating to dev4.disruptorsmedia.com with FRESH browser state...');
    console.log('🧹 Cache cleared, cookies cleared, no prior storage');

    // Navigate to the site with extended timeout
    const response = await page.goto('https://dev4.disruptorsmedia.com', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    console.log(`📡 Response status: ${response.status()}`);
    console.log('✅ Page loaded');

    // Wait longer for any dynamic content
    console.log('⏳ Waiting 5 seconds for app initialization...');
    await page.waitForTimeout(5000);

    // Take screenshot
    await page.screenshot({
      path: 'temp/deployment-screenshot.png',
      fullPage: true
    });
    console.log('📸 Screenshot saved to temp/deployment-screenshot.png');

    // Get page title
    const title = await page.title();
    console.log(`📄 Page Title: ${title}`);

    // Check for React root
    const hasReactRoot = await page.evaluate(() => {
      return document.getElementById('root') !== null;
    });
    console.log(`⚛️  React Root Present: ${hasReactRoot}`);

    // Check if content is rendered
    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasContent = bodyText.length > 100;
    console.log(`📝 Content Rendered: ${hasContent} (${bodyText.length} chars)`);

    // Report console logs
    console.log('\n📋 Console Logs:');
    consoleLogs.forEach(log => console.log('  ' + log));

    // Report errors
    if (consoleErrors.length > 0) {
      console.log('\n❌ Console Errors:');
      consoleErrors.forEach(err => console.log('  ' + err));
    }

    if (pageErrors.length > 0) {
      console.log('\n❌ Page Errors:');
      pageErrors.forEach(err => console.log('  ' + err));
    }

    if (networkErrors.length > 0) {
      console.log('\n❌ Network Errors:');
      networkErrors.forEach(err => console.log('  ' + err));
    }

    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`  ✓ Page loaded: Yes`);
    console.log(`  ✓ React root: ${hasReactRoot ? 'Yes' : 'No'}`);
    console.log(`  ✓ Content rendered: ${hasContent ? 'Yes' : 'No'}`);
    console.log(`  ✓ Console errors: ${consoleErrors.length}`);
    console.log(`  ✓ Page errors: ${pageErrors.length}`);
    console.log(`  ✓ Network errors: ${networkErrors.length}`);

    const hasIssues = consoleErrors.length > 0 || pageErrors.length > 0 || networkErrors.length > 0 || !hasReactRoot || !hasContent;

    if (hasIssues) {
      console.log('\n⚠️  ISSUES DETECTED - Site needs fixes');
      process.exit(1);
    } else {
      console.log('\n✅ SITE IS WORKING CORRECTLY');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);

    // Try to take a screenshot anyway
    try {
      await page.screenshot({
        path: 'temp/deployment-error-screenshot.png',
        fullPage: true
      });
      console.log('📸 Error screenshot saved to temp/deployment-error-screenshot.png');
    } catch (e) {
      console.log('Could not capture error screenshot');
    }

    process.exit(1);
  } finally {
    await browser.close();
  }
}

testDeployment();
