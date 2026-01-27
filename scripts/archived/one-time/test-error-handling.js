import { chromium } from 'playwright';

async function testErrorHandling() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const networkErrors = [];

  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Listen for network failures
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  try {
    console.log('🛠️  Testing error handling and improvements...');

    // Test 1: Valid routes - should work without errors
    console.log('\n📍 Test 1: Testing valid routes');
    const validRoutes = [
      '/',
      '/about',
      '/solutions',
      '/work',
      '/contact',
      '/resources',
      '/assessment'
    ];

    for (const route of validRoutes) {
      try {
        console.log(`  Testing ${route}...`);
        await page.goto(`https://disruptors-ai-marketing-hub.netlify.app${route}`, {
          waitUntil: 'networkidle',
          timeout: 15000
        });
        await page.waitForTimeout(2000);

        // Check if page loaded successfully
        const title = await page.title();
        const hasContent = await page.$('body');

        if (hasContent && title) {
          console.log(`  ✅ ${route} - Loaded successfully`);
        } else {
          console.log(`  ❌ ${route} - Failed to load properly`);
        }
      } catch (error) {
        console.log(`  ❌ ${route} - Error: ${error.message}`);
      }
    }

    // Test 2: Invalid routes - should handle gracefully with 404 or redirect
    console.log('\n📍 Test 2: Testing invalid route handling');
    const invalidRoutes = [
      '/non-existent-page',
      '/random-path',
      '/undefined-route',
      '/work/invalid-client'
    ];

    for (const route of invalidRoutes) {
      try {
        console.log(`  Testing ${route}...`);
        await page.goto(`https://disruptors-ai-marketing-hub.netlify.app${route}`, {
          waitUntil: 'networkidle',
          timeout: 15000
        });
        await page.waitForTimeout(2000);

        // Check if it's handling 404s properly (should serve index.html for SPA)
        const currentUrl = page.url();
        const title = await page.title();

        if (title === 'Base44 APP' && currentUrl.includes(route)) {
          console.log(`  ✅ ${route} - SPA routing handling properly`);
        } else {
          console.log(`  ⚠️  ${route} - Unexpected behavior: ${title}`);
        }
      } catch (error) {
        console.log(`  ❌ ${route} - Error: ${error.message}`);
      }
    }

    // Test 3: Test missing environment variables handling
    console.log('\n📍 Test 3: Testing environment variable fallbacks');

    // Go to homepage and check for any API errors
    await page.goto('https://disruptors-ai-marketing-hub.netlify.app', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);

    // Check if any Supabase or API errors occur
    const apiErrors = consoleErrors.filter(error =>
      error.includes('supabase') ||
      error.includes('api') ||
      error.includes('fetch') ||
      error.includes('401') ||
      error.includes('403')
    );

    if (apiErrors.length === 0) {
      console.log('  ✅ No API-related errors detected');
    } else {
      console.log('  ⚠️  API errors found:');
      apiErrors.forEach(error => console.log(`    - ${error}`));
    }

    // Test 4: Test image fallback handling
    console.log('\n📍 Test 4: Testing image error handling');

    // Navigate to a page with images and check for broken image handling
    await page.goto('https://disruptors-ai-marketing-hub.netlify.app/work', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);

    const imageErrors = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img =>
        !img.complete ||
        img.naturalHeight === 0 ||
        img.naturalWidth === 0
      ).map(img => ({
        src: img.src,
        alt: img.alt
      }));
    });

    if (imageErrors.length === 0) {
      console.log('  ✅ No broken images detected');
    } else {
      console.log('  ⚠️  Broken images found:');
      imageErrors.forEach(img => console.log(`    - ${img.src} (${img.alt})`));
    }

    // Test 5: Test form error handling (if contact forms exist)
    console.log('\n📍 Test 5: Testing form error handling');

    await page.goto('https://disruptors-ai-marketing-hub.netlify.app/contact', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);

    const forms = await page.$$('form');
    if (forms.length > 0) {
      console.log(`  Found ${forms.length} form(s)`);

      // Try to submit an empty form to test validation
      try {
        await page.click('button[type="submit"], input[type="submit"]');
        await page.waitForTimeout(1000);

        // Check for validation messages or error handling
        const errorMessages = await page.$$eval('.error, .invalid, [role="alert"]',
          els => els.map(el => el.textContent)
        );

        if (errorMessages.length > 0) {
          console.log('  ✅ Form validation working');
        } else {
          console.log('  ⚠️  No visible form validation detected');
        }
      } catch (error) {
        console.log('  ℹ️  Could not test form submission');
      }
    } else {
      console.log('  ℹ️  No forms found on contact page');
    }

    // Test 6: Check for JavaScript runtime errors
    console.log('\n📍 Test 6: JavaScript runtime error check');

    if (consoleErrors.length === 0) {
      console.log('  ✅ No console errors detected during testing');
    } else {
      console.log(`  ⚠️  Found ${consoleErrors.length} console errors:`);
      consoleErrors.forEach((error, index) => {
        console.log(`    ${index + 1}. ${error}`);
      });
    }

    // Test 7: Network error handling
    console.log('\n📍 Test 7: Network error handling');

    if (networkErrors.length === 0) {
      console.log('  ✅ No network errors detected');
    } else {
      console.log(`  ⚠️  Found ${networkErrors.length} network errors:`);
      networkErrors.forEach((error, index) => {
        console.log(`    ${index + 1}. ${error.status} - ${error.url}`);
      });
    }

    console.log('\n🎉 Error handling validation completed!');

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`Console errors: ${consoleErrors.length}`);
    console.log(`Network errors: ${networkErrors.length}`);
    console.log(`Image errors: ${imageErrors.length}`);

  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testErrorHandling();