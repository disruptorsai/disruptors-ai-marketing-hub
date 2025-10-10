/**
 * Browser test to check for React forwardRef error on dm4.wjwelsh.com
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Testing dm4.wjwelsh.com for React errors...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const consoleMessages = [];

  // Capture console errors
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });

    if (type === 'error') {
      errors.push(text);
    }
  });

  // Capture page errors
  page.on('pageerror', err => {
    errors.push(err.message);
  });

  try {
    console.log('📡 Loading https://dm4.wjwelsh.com/ ...');
    await page.goto('https://dm4.wjwelsh.com/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for React to initialize
    await page.waitForTimeout(2000);

    // Check if page rendered
    const rootContent = await page.$('#root');

    console.log('\n✅ Page loaded successfully\n');

    if (rootContent) {
      console.log('✅ React root element found (#root)');
    } else {
      console.log('❌ React root element NOT found');
    }

    // Check for specific forwardRef error
    const hasForwardRefError = errors.some(e =>
      e.includes('forwardRef') || e.includes('Cannot read properties of undefined')
    );

    console.log('\n📋 Console Analysis:');
    console.log(`   Total console messages: ${consoleMessages.length}`);
    console.log(`   Error messages: ${errors.length}`);

    if (hasForwardRefError) {
      console.log('\n❌ CRITICAL: forwardRef error detected!\n');
      errors.forEach((err, i) => {
        if (err.includes('forwardRef') || err.includes('Cannot read properties of undefined')) {
          console.log(`   Error ${i + 1}: ${err.substring(0, 200)}...`);
        }
      });
      process.exit(1);
    } else if (errors.length > 0) {
      console.log('\n⚠️  Other errors found:');
      errors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.substring(0, 150)}`);
      });
    } else {
      console.log('\n✅ No JavaScript errors detected!');
      console.log('✅ React forwardRef fix appears to be working!');
    }

  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }

  console.log('\n✅ Test completed successfully');
})();
