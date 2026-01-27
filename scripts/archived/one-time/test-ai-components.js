import { chromium } from 'playwright';

async function testAIComponents() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('🤖 Testing AI generation components and fallbacks...');

    // Test 1: Check AI Generation components on homepage
    console.log('\n📍 Test 1: Testing AI components on homepage');
    await page.goto('https://disruptors-ai-marketing-hub.netlify.app', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);

    // Look for AI-related components
    const aiComponents = await page.evaluate(() => {
      const selectors = [
        '[data-testid*="ai"]',
        '[class*="ai-"]',
        '[data-component*="AI"]',
        '.ai-generator',
        '.ai-media',
        '[data-testid="ai-media-generator"]'
      ];

      const found = [];
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          found.push({
            selector,
            count: elements.length,
            visible: Array.from(elements).some(el => el.offsetParent !== null),
            text: Array.from(elements).map(el => el.textContent?.trim()).filter(Boolean).slice(0, 2)
          });
        }
      });

      return found;
    });

    if (aiComponents.length > 0) {
      console.log('  ✅ Found AI-related components:');
      aiComponents.forEach(comp => {
        console.log(`    - ${comp.selector}: ${comp.count} elements (visible: ${comp.visible})`);
        if (comp.text.length > 0) {
          console.log(`      Sample text: ${comp.text.join(', ')}`);
        }
      });
    } else {
      console.log('  ℹ️  No obvious AI component markers found on homepage');
    }

    // Test 2: Check for AI generation buttons or interfaces
    console.log('\n📍 Test 2: Looking for AI generation interfaces');

    const generateButtons = await page.$$eval('button', buttons =>
      buttons.map(btn => ({
        text: btn.textContent?.trim(),
        visible: btn.offsetParent !== null,
        disabled: btn.disabled
      })).filter(btn =>
        btn.text?.toLowerCase().includes('generate') ||
        btn.text?.toLowerCase().includes('ai') ||
        btn.text?.toLowerCase().includes('create') ||
        btn.text?.toLowerCase().includes('build')
      )
    );

    if (generateButtons.length > 0) {
      console.log('  ✅ Found generation-related buttons:');
      generateButtons.forEach(btn => {
        console.log(`    - "${btn.text}" (visible: ${btn.visible}, disabled: ${btn.disabled})`);
      });
    } else {
      console.log('  ℹ️  No obvious generation buttons found');
    }

    // Test 3: Test specific pages that might have AI components
    console.log('\n📍 Test 3: Testing AI components on solutions page');

    await page.goto('https://disruptors-ai-marketing-hub.netlify.app/solutions', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);

    // Check for service-related AI content
    const solutionsAI = await page.evaluate(() => {
      const text = document.body.textContent.toLowerCase();
      const aiKeywords = [
        'artificial intelligence',
        'ai-powered',
        'machine learning',
        'automated',
        'intelligent',
        'ai generation',
        'smart content',
        'automated content'
      ];

      return aiKeywords.filter(keyword => text.includes(keyword));
    });

    if (solutionsAI.length > 0) {
      console.log('  ✅ Found AI-related content in solutions:');
      solutionsAI.forEach(keyword => console.log(`    - "${keyword}"`));
    } else {
      console.log('  ℹ️  No obvious AI content keywords found in solutions');
    }

    // Test 4: Test error handling by checking network requests
    console.log('\n📍 Test 4: Testing API fallback mechanisms');

    const networkRequests = [];
    const networkErrors = [];

    page.on('request', request => {
      if (request.url().includes('api') ||
          request.url().includes('openai') ||
          request.url().includes('replicate') ||
          request.url().includes('gemini') ||
          request.url().includes('elevenlabs')) {
        networkRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    page.on('response', response => {
      if (response.status() >= 400 &&
          (response.url().includes('api') ||
           response.url().includes('openai') ||
           response.url().includes('replicate') ||
           response.url().includes('gemini') ||
           response.url().includes('elevenlabs'))) {
        networkErrors.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    // Navigate to gallery which might trigger AI image generation
    await page.goto('https://disruptors-ai-marketing-hub.netlify.app/gallery', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(5000);

    if (networkRequests.length > 0) {
      console.log('  ✅ Found AI API requests:');
      networkRequests.forEach(req => {
        console.log(`    - ${req.method} ${req.url}`);
      });
    } else {
      console.log('  ℹ️  No AI API requests detected');
    }

    if (networkErrors.length > 0) {
      console.log('  ⚠️  Found API errors (testing fallbacks):');
      networkErrors.forEach(err => {
        console.log(`    - ${err.status}: ${err.url}`);
      });
    } else {
      console.log('  ✅ No API errors detected');
    }

    // Test 5: Check for image placeholders and fallbacks
    console.log('\n📍 Test 5: Testing image fallback systems');

    const images = await page.$$eval('img', imgs =>
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        hasPlaceholder: img.src.includes('placeholder') ||
                       img.src.includes('data:image') ||
                       img.alt.toLowerCase().includes('placeholder'),
        hasCloudinary: img.src.includes('cloudinary')
      }))
    );

    const placeholderImages = images.filter(img => img.hasPlaceholder);
    const cloudinaryImages = images.filter(img => img.hasCloudinary);
    const brokenImages = images.filter(img => img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0));

    console.log(`  📊 Image Analysis:`);
    console.log(`    - Total images: ${images.length}`);
    console.log(`    - Cloudinary images: ${cloudinaryImages.length}`);
    console.log(`    - Placeholder images: ${placeholderImages.length}`);
    console.log(`    - Broken images: ${brokenImages.length}`);

    if (placeholderImages.length > 0) {
      console.log('  ✅ Placeholder system active (good fallback behavior)');
    }

    if (brokenImages.length === 0) {
      console.log('  ✅ All images loading correctly');
    } else {
      console.log('  ❌ Some images failed to load');
    }

    // Test 6: Test JavaScript AI orchestrator components
    console.log('\n📍 Test 6: Testing AI orchestrator integration');

    const aiOrchestrator = await page.evaluate(() => {
      // Check if AI orchestrator is loaded and functioning
      if (typeof window !== 'undefined') {
        // Look for evidence of AI orchestrator in window
        const hasAIFeatures = Object.keys(window).some(key =>
          key.toLowerCase().includes('ai') ||
          key.toLowerCase().includes('openai') ||
          key.toLowerCase().includes('replicate')
        );

        // Check for AI-related errors in console (already captured)
        return {
          hasAIFeatures,
          windowKeys: Object.keys(window).filter(key =>
            key.toLowerCase().includes('ai') ||
            key.toLowerCase().includes('generate')
          )
        };
      }
      return { hasAIFeatures: false, windowKeys: [] };
    });

    if (aiOrchestrator.hasAIFeatures) {
      console.log('  ✅ AI features detected in window object');
      if (aiOrchestrator.windowKeys.length > 0) {
        console.log(`    - Keys: ${aiOrchestrator.windowKeys.join(', ')}`);
      }
    } else {
      console.log('  ℹ️  No obvious AI features in window object (may be properly encapsulated)');
    }

    console.log('\n🎉 AI components testing completed!');

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`AI components found: ${aiComponents.length}`);
    console.log(`Generation buttons: ${generateButtons.length}`);
    console.log(`API requests: ${networkRequests.length}`);
    console.log(`API errors: ${networkErrors.length}`);
    console.log(`Placeholder images: ${placeholderImages.length}`);
    console.log(`Broken images: ${brokenImages.length}`);

  } catch (error) {
    console.error('❌ AI components test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testAIComponents();