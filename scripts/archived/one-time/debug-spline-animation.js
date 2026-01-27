import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function debugSplineAnimation() {
  console.log('🎬 Starting Spline Animation Debug Session...\n');

  const browser = await chromium.launch({
    headless: false,
    devtools: true
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  // Create screenshots directory
  const screenshotsDir = join(__dirname, '../debug-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Collect console messages
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    console.log(`[${msg.type().toUpperCase()}] ${text}`);
  });

  // Collect errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
    console.error(`❌ Page Error: ${error.message}`);
  });

  try {
    console.log('📍 Navigating to http://localhost:5173/solutions\n');
    await page.goto('http://localhost:5173/solutions', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('⏳ Waiting for Spline scene to load...\n');
    await page.waitForTimeout(5000); // Give Spline time to load

    // Take initial screenshot
    console.log('📸 Screenshot 1: Initial state (0% scroll)');
    await page.screenshot({
      path: join(screenshotsDir, '01-initial-0-percent.png'),
      fullPage: false
    });

    // Get scene info
    const sceneInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return {
        canvasFound: !!canvas,
        canvasSize: canvas ? { width: canvas.width, height: canvas.height } : null,
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
        splineContainer: document.querySelector('[role="region"][aria-label*="3D"]') !== null
      };
    });

    console.log('🎯 Scene Info:', JSON.stringify(sceneInfo, null, 2), '\n');

    // Check for Spline objects
    const objectsInfo = await page.evaluate(() => {
      // Access the Spline app instance if available
      const splineCanvas = document.querySelector('canvas');
      if (!splineCanvas) return { error: 'No canvas found' };

      // Try to get console logs related to objects
      const logs = window._splineDebugLogs || [];

      return {
        canvasPresent: true,
        debugLogs: logs
      };
    });

    console.log('🔍 Objects Info:', JSON.stringify(objectsInfo, null, 2), '\n');

    // Scroll positions to test: 0%, 25%, 50%, 75%, 100%
    const scrollPositions = [
      { percent: 25, name: '25-percent' },
      { percent: 50, name: '50-percent' },
      { percent: 75, name: '75-percent' },
      { percent: 100, name: '100-percent' }
    ];

    for (const position of scrollPositions) {
      console.log(`\n📜 Scrolling to ${position.percent}%...`);

      await page.evaluate((percent) => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollTo = (scrollHeight * percent) / 100;
        window.scrollTo({ top: scrollTo, behavior: 'smooth' });
      }, position.percent);

      // Wait for scroll to complete and animation to settle
      await page.waitForTimeout(2000);

      // Take screenshot
      console.log(`📸 Screenshot: ${position.percent}% scroll`);
      await page.screenshot({
        path: join(screenshotsDir, `0${scrollPositions.indexOf(position) + 2}-scroll-${position.name}.png`),
        fullPage: false
      });

      // Check animation state at this position
      const animationState = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const style = canvas ? window.getComputedStyle(canvas) : null;

        return {
          scrollY: window.scrollY,
          scrollPercentage: ((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100).toFixed(2) + '%',
          canvasTransform: style ? style.transform : null,
          canvasOpacity: style ? style.opacity : null,
          canvasDisplay: style ? style.display : null,
          canvasVisibility: style ? style.visibility : null
        };
      });

      console.log('   State:', JSON.stringify(animationState, null, 2));
    }

    // Final report
    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log('📊 ANIMATION DEBUG REPORT');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('🎬 Scene Loading:');
    console.log('   Canvas found:', sceneInfo.canvasFound);
    console.log('   Spline container:', sceneInfo.splineContainer);
    console.log('   Canvas size:', sceneInfo.canvasSize);

    console.log('\n📋 Console Logs:');
    const relevantLogs = consoleLogs.filter(log =>
      log.text.includes('Services') ||
      log.text.includes('Spline') ||
      log.text.includes('GSAP') ||
      log.text.includes('Objects') ||
      log.text.includes('hand') ||
      log.text.includes('services-img') ||
      log.text.includes('Animation') ||
      log.text.includes('ScrollTrigger')
    );

    if (relevantLogs.length > 0) {
      relevantLogs.forEach(log => {
        console.log(`   [${log.type}] ${log.text}`);
      });
    } else {
      console.log('   No relevant logs captured');
    }

    console.log('\n❌ Errors:');
    if (errors.length > 0) {
      errors.forEach(error => {
        console.log(`   ${error}`);
      });
    } else {
      console.log('   No errors detected');
    }

    console.log('\n📸 Screenshots saved to:', screenshotsDir);
    console.log('\n🔍 KEY OBSERVATIONS TO CHECK:');
    console.log('   1. Is the hand rotating smoothly between screenshots?');
    console.log('   2. Does the services-img.png (funnel) stay visible?');
    console.log('   3. Are there GSAP or Spline errors in console?');
    console.log('   4. Does the canvas transform/opacity change unexpectedly?');
    console.log('   5. Is the scroll trigger activating correctly?');

    console.log('\n═══════════════════════════════════════════════════════════\n');

    // Keep browser open for manual inspection
    console.log('🖥️  Browser will stay open for manual inspection.');
    console.log('📝 Check the screenshots in:', screenshotsDir);
    console.log('⌨️  Press Ctrl+C in terminal when done.\n');

    // Wait indefinitely (user can Ctrl+C)
    await new Promise(() => {});

  } catch (error) {
    console.error('\n❌ Debug session failed:', error.message);
    console.error(error.stack);
  } finally {
    // Don't auto-close - let user inspect
    // await browser.close();
  }
}

debugSplineAnimation().catch(console.error);
