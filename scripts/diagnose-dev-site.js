import { chromium } from 'playwright';

/**
 * Diagnose dev.disruptorsmedia.com loading issues
 */
async function diagnoseSite() {
  console.log('🔍 Starting diagnostic test for dev.disruptorsmedia.com...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
    console.log(`[CONSOLE ${msg.type()}]`, msg.text());
  });

  // Collect errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
    console.error('❌ [PAGE ERROR]', error.message);
  });

  // Collect failed requests
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure()
    });
    console.error('❌ [REQUEST FAILED]', request.url(), request.failure());
  });

  // Track successful requests
  const successfulRequests = [];
  page.on('requestfinished', async request => {
    const response = await request.response();
    successfulRequests.push({
      url: request.url(),
      status: response?.status()
    });
  });

  try {
    // Allow custom URL via command line argument
    const targetUrl = process.argv[2] || 'https://dev.disruptorsmedia.com';
    console.log(`🌐 Navigating to ${targetUrl}...\n`);

    // Navigate with longer timeout
    await page.goto(targetUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('✅ Page loaded successfully\n');

    // Wait a bit for React to initialize
    await page.waitForTimeout(3000);

    // Check if root element has content
    const rootContent = await page.locator('#root').innerHTML();
    console.log('📦 Root element content length:', rootContent.length);

    if (rootContent.length < 100) {
      console.error('⚠️  Root element appears empty!\n');
    }

    // Check for React
    const hasReact = await page.evaluate(() => {
      return typeof window.React !== 'undefined';
    });
    console.log('⚛️  React available:', hasReact);

    // Check for service worker
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    console.log('🔧 Service Worker support:', hasServiceWorker);

    if (hasServiceWorker) {
      const swRegistrations = await page.evaluate(async () => {
        const regs = await navigator.serviceWorker.getRegistrations();
        return regs.map(reg => ({
          scope: reg.scope,
          state: reg.active?.state
        }));
      });
      console.log('📝 Service Worker registrations:', swRegistrations);
    }

    // Take screenshot
    await page.screenshot({ path: 'temp/dev-site-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved to temp/dev-site-screenshot.png\n');

  } catch (error) {
    console.error('❌ Navigation failed:', error.message);
  }

  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  console.log('==========================================');
  console.log(`Console messages: ${consoleMessages.length}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Failed requests: ${failedRequests.length}`);
  console.log(`Successful requests: ${successfulRequests.length}`);

  if (errors.length > 0) {
    console.log('\n🚨 ERRORS FOUND:');
    errors.forEach((err, i) => {
      console.log(`${i + 1}. ${err}`);
    });
  }

  if (failedRequests.length > 0) {
    console.log('\n🚨 FAILED REQUESTS:');
    failedRequests.forEach((req, i) => {
      console.log(`${i + 1}. ${req.url}`);
      console.log(`   Reason: ${req.failure?.errorText || 'Unknown'}`);
    });
  }

  // Filter console messages for critical issues
  const criticalMessages = consoleMessages.filter(msg =>
    msg.type === 'error' ||
    msg.text.includes('forwardRef') ||
    msg.text.includes('Service Worker') ||
    msg.text.includes('CRITICAL')
  );

  if (criticalMessages.length > 0) {
    console.log('\n🔥 CRITICAL CONSOLE MESSAGES:');
    criticalMessages.forEach((msg, i) => {
      console.log(`${i + 1}. [${msg.type}] ${msg.text}`);
    });
  }

  await browser.close();

  console.log('\n✅ Diagnostic complete!');

  // Return summary for programmatic use
  return {
    success: errors.length === 0 && failedRequests.length === 0,
    errors,
    failedRequests,
    consoleMessages,
    criticalMessages
  };
}

// Run diagnostic
diagnoseSite().catch(console.error);
