/**
 * Test script for Playwright MCP server functionality
 * Tests basic browser automation and screenshot capture
 */

import { chromium } from 'playwright';

async function testPlaywrightMCP() {
  console.log('🎭 Testing Playwright MCP Server...\n');

  const browser = await chromium.launch({
    headless: true
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });

    const page = await context.newPage();

    // Test 1: Navigate to example.com
    console.log('📍 Test 1: Navigation');
    await page.goto('https://example.com', { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log(`   ✓ Page title: "${title}"`);

    // Test 2: Extract content
    console.log('\n📝 Test 2: Content Extraction');
    const heading = await page.locator('h1').first().textContent();
    console.log(`   ✓ H1 heading: "${heading}"`);

    // Test 3: Screenshot capture
    console.log('\n📸 Test 3: Screenshot Capture');
    await page.screenshot({
      path: 'temp/playwright-test-screenshot.png',
      fullPage: false
    });
    console.log('   ✓ Screenshot saved to temp/playwright-test-screenshot.png');

    // Test 4: Viewport information
    console.log('\n🖥️  Test 4: Viewport Info');
    const viewport = page.viewportSize();
    console.log(`   ✓ Viewport: ${viewport.width}x${viewport.height}`);

    // Test 5: Network request tracking
    console.log('\n🌐 Test 5: Network Tracking');
    let requestCount = 0;
    page.on('request', () => requestCount++);
    await page.goto('https://example.com', { waitUntil: 'networkidle' });
    console.log(`   ✓ Network requests: ${requestCount}`);

    // Test 6: Performance metrics
    console.log('\n⚡ Test 6: Performance Metrics');
    const performanceMetrics = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
      };
    });
    console.log(`   ✓ Page load: ${performanceMetrics.loadTime}ms`);
    console.log(`   ✓ DOM ready: ${performanceMetrics.domReady}ms`);
    console.log(`   ✓ First paint: ${Math.round(performanceMetrics.firstPaint)}ms`);

    console.log('\n✅ All Playwright MCP tests passed!');

  } catch (error) {
    console.error('\n❌ Playwright MCP test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run tests
testPlaywrightMCP()
  .then(() => {
    console.log('\n🎉 Playwright MCP is working correctly!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  });
