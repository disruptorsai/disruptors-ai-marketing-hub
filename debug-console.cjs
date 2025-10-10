/**
 * Capture and analyze console output from dm4.wjwelsh.com
 * with comprehensive debugging information
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Starting console debug session...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const allConsoleMessages = [];
  const errors = [];
  const debugMessages = [];

  // Capture ALL console messages with timestamps
  page.on('console', msg => {
    const timestamp = new Date().toISOString();
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();

    const messageData = {
      timestamp,
      type,
      text,
      url: location.url,
      lineNumber: location.lineNumber
    };

    allConsoleMessages.push(messageData);

    // Categorize
    if (type === 'error') {
      errors.push(messageData);
    }

    if (text.includes('[INDEX.HTML]') || text.includes('[MAIN.JSX]') ||
        text.includes('[SCRIPT') || text.includes('[REACT') ||
        text.includes('[CRITICAL]') || text.includes('[DEBUG]')) {
      debugMessages.push(messageData);
    }
  });

  // Capture page errors
  page.on('pageerror', err => {
    const errorData = {
      timestamp: new Date().toISOString(),
      type: 'pageerror',
      text: err.message,
      stack: err.stack
    };
    errors.push(errorData);
    allConsoleMessages.push(errorData);
  });

  try {
    console.log('📡 Loading https://dm4.wjwelsh.com/ ...\n');

    await page.goto('https://dm4.wjwelsh.com/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for all debugging to complete
    await page.waitForTimeout(6000);

    // Print organized results
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  CONSOLE DEBUG ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📊 SUMMARY:');
    console.log(`   Total console messages: ${allConsoleMessages.length}`);
    console.log(`   Debug messages: ${debugMessages.length}`);
    console.log(`   Errors: ${errors.length}\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  DEBUG MESSAGES (chronological order)');
    console.log('═══════════════════════════════════════════════════════════\n');

    debugMessages.forEach((msg, i) => {
      console.log(`${i + 1}. [${msg.type.toUpperCase()}] ${msg.text}`);
      if (msg.url && !msg.url.includes('about:blank')) {
        console.log(`   └─ Source: ${msg.url.split('/').pop()}:${msg.lineNumber || '?'}`);
      }
    });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  ERRORS');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (errors.length === 0) {
      console.log('✅ No errors detected!\n');
    } else {
      errors.forEach((err, i) => {
        console.log(`ERROR ${i + 1}:`);
        console.log(`   Message: ${err.text}`);
        if (err.url) {
          console.log(`   Source: ${err.url.split('/').pop()}:${err.lineNumber || '?'}`);
        }
        if (err.stack) {
          console.log(`   Stack: ${err.stack.substring(0, 200)}...`);
        }
        console.log('');
      });

      // Check for forwardRef error
      const forwardRefError = errors.find(e =>
        e.text.includes('forwardRef') ||
        e.text.includes('Cannot read properties of undefined')
      );

      if (forwardRefError) {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('  🚨 FORWARDREF ERROR ANALYSIS');
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('Error Message:', forwardRefError.text);
        console.log('Source File:', forwardRefError.url?.split('/').pop() || 'unknown');
        console.log('Line Number:', forwardRefError.lineNumber || 'unknown');
        console.log('\nThis error occurred in the chunk listed above.');
        console.log('This chunk is trying to use React before it\'s available.\n');
      }
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  FULL CONSOLE LOG (all messages)');
    console.log('═══════════════════════════════════════════════════════════\n');

    allConsoleMessages.slice(0, 50).forEach((msg, i) => {
      const prefix = msg.type === 'error' ? '❌' :
                     msg.type === 'warn' ? '⚠️' :
                     msg.type === 'info' ? 'ℹ️' : '📝';
      console.log(`${i + 1}. ${prefix} ${msg.text.substring(0, 150)}`);
    });

    if (allConsoleMessages.length > 50) {
      console.log(`\n... and ${allConsoleMessages.length - 50} more messages`);
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }

  // Exit with error code if forwardRef error found
  const hasForwardRefError = errors.some(e =>
    e.text.includes('forwardRef') || e.text.includes('Cannot read properties of undefined')
  );

  if (hasForwardRefError) {
    console.log('❌ ForwardRef error detected - exiting with error code 1\n');
    process.exit(1);
  } else {
    console.log('✅ No ForwardRef errors - site appears to be working!\n');
    process.exit(0);
  }
})();
