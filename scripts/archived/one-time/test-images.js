import { chromium } from 'playwright';

async function testImageLoading() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('🖼️  Testing image loading and display...');

    // Navigate to homepage
    await page.goto('https://disruptors-ai-marketing-hub.netlify.app', {
      waitUntil: 'networkidle'
    });

    // Wait for content to load
    await page.waitForTimeout(3000);

    // Test 1: Check for broken images
    console.log('\n📍 Test 1: Checking for broken images');
    const images = await page.$$eval('img', imgs =>
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      }))
    );

    console.log(`📊 Found ${images.length} images on homepage`);

    const brokenImages = images.filter(img => img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0));
    const loadingImages = images.filter(img => !img.complete);

    if (brokenImages.length === 0) {
      console.log('✅ No broken images detected');
    } else {
      console.log(`❌ Found ${brokenImages.length} broken images:`);
      brokenImages.forEach(img => console.log(`  - ${img.src} (${img.alt})`));
    }

    if (loadingImages.length > 0) {
      console.log(`⏳ ${loadingImages.length} images still loading...`);
      // Wait a bit more for images to load
      await page.waitForTimeout(2000);
    }

    // Test 2: Check service images specifically
    console.log('\n📍 Test 2: Testing service images');

    // Navigate to solutions page
    await page.goto('https://disruptors-ai-marketing-hub.netlify.app/solutions', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);

    const serviceImages = await page.$$eval('img', imgs =>
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      })).filter(img =>
        img.src.includes('service') ||
        img.alt.toLowerCase().includes('service') ||
        img.src.includes('cloudinary') ||
        img.src.includes('solution')
      )
    );

    console.log(`🔧 Found ${serviceImages.length} service-related images`);

    if (serviceImages.length > 0) {
      const loadedServiceImages = serviceImages.filter(img => img.complete && img.naturalWidth > 0);
      console.log(`✅ ${loadedServiceImages.length}/${serviceImages.length} service images loaded successfully`);

      serviceImages.forEach(img => {
        if (img.complete && img.naturalWidth > 0) {
          console.log(`  ✅ ${img.alt || 'Unnamed image'} - ${img.naturalWidth}x${img.naturalHeight}`);
        } else {
          console.log(`  ❌ ${img.alt || 'Unnamed image'} - Failed to load`);
        }
      });
    } else {
      console.log('⚠️  No service images found on solutions page');
    }

    // Test 3: Check work portfolio images
    console.log('\n📍 Test 3: Testing work portfolio images');

    await page.goto('https://disruptors-ai-marketing-hub.netlify.app/work', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);

    const portfolioImages = await page.$$eval('img', imgs =>
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      })).filter(img =>
        img.src.includes('work') ||
        img.src.includes('portfolio') ||
        img.src.includes('client') ||
        img.alt.toLowerCase().includes('work')
      )
    );

    console.log(`💼 Found ${portfolioImages.length} portfolio-related images`);

    if (portfolioImages.length > 0) {
      const loadedPortfolioImages = portfolioImages.filter(img => img.complete && img.naturalWidth > 0);
      console.log(`✅ ${loadedPortfolioImages.length}/${portfolioImages.length} portfolio images loaded successfully`);
    }

    // Test 4: Check for AI-generated placeholder handling
    console.log('\n📍 Test 4: Testing AI image fallbacks');

    const allImages = await page.$$eval('img', imgs =>
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      }))
    );

    const placeholderImages = allImages.filter(img =>
      img.src.includes('placeholder') ||
      img.src.includes('data:image') ||
      img.alt.toLowerCase().includes('placeholder') ||
      img.alt.toLowerCase().includes('fallback')
    );

    if (placeholderImages.length > 0) {
      console.log(`🔄 Found ${placeholderImages.length} placeholder/fallback images`);
      console.log('✅ Fallback system is active');
    } else {
      console.log('📷 No placeholder images detected (using real images)');
    }

    // Test 5: Check image accessibility
    console.log('\n📍 Test 5: Testing image accessibility');
    const imagesWithoutAlt = allImages.filter(img => !img.alt || img.alt.trim() === '');

    if (imagesWithoutAlt.length === 0) {
      console.log('✅ All images have alt text');
    } else {
      console.log(`⚠️  ${imagesWithoutAlt.length} images missing alt text:`);
      imagesWithoutAlt.forEach(img => console.log(`  - ${img.src}`));
    }

    // Take screenshot of solutions page for visual verification
    await page.screenshot({
      path: 'test-solutions-images.png',
      fullPage: true
    });

    console.log('\n🎉 Image testing completed!');

  } catch (error) {
    console.error('❌ Image test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testImageLoading();