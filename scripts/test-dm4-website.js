/**
 * Comprehensive test suite for dm4.wjwelsh.com
 * Tests homepage and work page with Playwright
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://dm4.wjwelsh.com';
const SCREENSHOT_DIR = 'temp/website-tests';

// Ensure screenshot directory exists
try {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
} catch (e) {
  // Directory already exists
}

async function testWebsite() {
  console.log('🌐 Testing dm4.wjwelsh.com Website\n');
  console.log('━'.repeat(60));

  const browser = await chromium.launch({
    headless: true
  });

  const results = {
    homepage: {},
    workPage: {},
    timestamp: new Date().toISOString()
  };

  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    const page = await context.newPage();

    // ==================== HOMEPAGE TESTS ====================
    console.log('\n📍 TESTING HOMEPAGE: ' + BASE_URL);
    console.log('━'.repeat(60));

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Basic page info
    const homeTitle = await page.title();
    const homeUrl = page.url();
    console.log(`\n✓ Page Title: "${homeTitle}"`);
    console.log(`✓ Final URL: ${homeUrl}`);

    // Meta tags (with fallback for missing elements)
    const homeMetaDescription = await page.locator('meta[name="description"]').first().getAttribute('content').catch(() => null);
    const homeOgImage = await page.locator('meta[property="og:image"]').first().getAttribute('content').catch(() => null);
    console.log(`\n📝 Meta Tags:`);
    console.log(`   Description: ${homeMetaDescription ? homeMetaDescription.substring(0, 80) + '...' : 'Not set'}`);
    console.log(`   OG Image: ${homeOgImage || 'Not set'}`);

    // Header/Navigation
    const hasNavigation = await page.locator('nav').count();
    const navLinks = await page.locator('nav a').count();
    console.log(`\n🧭 Navigation:`);
    console.log(`   Navigation elements: ${hasNavigation}`);
    console.log(`   Nav links: ${navLinks}`);

    // Hero section
    const heroHeadings = await page.locator('h1').count();
    const firstH1 = heroHeadings > 0 ? await page.locator('h1').first().textContent() : 'None';
    console.log(`\n🎯 Hero Section:`);
    console.log(`   H1 headings: ${heroHeadings}`);
    console.log(`   First H1: "${firstH1?.trim()}"`);

    // Images
    const totalImages = await page.locator('img').count();
    const imagesWithAlt = await page.locator('img[alt]').count();
    console.log(`\n🖼️  Images:`);
    console.log(`   Total images: ${totalImages}`);
    console.log(`   Images with alt text: ${imagesWithAlt} (${Math.round(imagesWithAlt/totalImages*100)}%)`);

    // Links
    const totalLinks = await page.locator('a').count();
    const externalLinks = await page.locator('a[href^="http"]').count();
    console.log(`\n🔗 Links:`);
    console.log(`   Total links: ${totalLinks}`);
    console.log(`   External links: ${externalLinks}`);

    // Performance metrics
    const homePerformance = await page.evaluate(() => {
      const timing = performance.timing;
      const paint = performance.getEntriesByType('paint');
      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: paint[0]?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      };
    });
    console.log(`\n⚡ Performance:`);
    console.log(`   Load time: ${homePerformance.loadTime}ms`);
    console.log(`   DOM ready: ${homePerformance.domReady}ms`);
    console.log(`   First paint: ${Math.round(homePerformance.firstPaint)}ms`);
    console.log(`   First contentful paint: ${Math.round(homePerformance.firstContentfulPaint)}ms`);

    // Screenshot
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'homepage-desktop.png'),
      fullPage: true
    });
    console.log(`\n📸 Screenshot: homepage-desktop.png`);

    // Check for JavaScript errors
    const jsErrors = [];
    page.on('pageerror', error => jsErrors.push(error.message));

    // Console messages
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(`ERROR: ${msg.text()}`);
      }
    });

    results.homepage = {
      title: homeTitle,
      url: homeUrl,
      metaDescription: homeMetaDescription,
      ogImage: homeOgImage,
      navigation: { elements: hasNavigation, links: navLinks },
      hero: { h1Count: heroHeadings, firstH1 },
      images: { total: totalImages, withAlt: imagesWithAlt },
      links: { total: totalLinks, external: externalLinks },
      performance: homePerformance,
      jsErrors: jsErrors.length,
      consoleErrors: consoleMessages.length
    };

    // ==================== WORK PAGE TESTS ====================
    console.log('\n\n📍 TESTING WORK PAGE: ' + BASE_URL + '/work');
    console.log('━'.repeat(60));

    await page.goto(BASE_URL + '/work', { waitUntil: 'networkidle', timeout: 30000 });

    // Basic page info
    const workTitle = await page.title();
    const workUrl = page.url();
    console.log(`\n✓ Page Title: "${workTitle}"`);
    console.log(`✓ Final URL: ${workUrl}`);

    // Main heading
    const workH1 = await page.locator('h1').first().textContent();
    console.log(`\n🎯 Main Heading: "${workH1?.trim()}"`);

    // Case study cards/sections
    const caseStudySections = await page.locator('section').count();
    const headings = await page.locator('h2, h3').count();
    console.log(`\n📚 Content Structure:`);
    console.log(`   Sections: ${caseStudySections}`);
    console.log(`   H2/H3 headings: ${headings}`);

    // Get all case study titles (assuming they're in h2 or h3 tags)
    const caseStudyTitles = await page.locator('h2, h3').allTextContents();
    console.log(`\n🏆 Case Studies Found:`);
    caseStudyTitles.slice(0, 10).forEach((title, i) => {
      console.log(`   ${i + 1}. ${title.trim()}`);
    });
    if (caseStudyTitles.length > 10) {
      console.log(`   ... and ${caseStudyTitles.length - 10} more`);
    }

    // Images on work page
    const workImages = await page.locator('img').count();
    const workImagesWithAlt = await page.locator('img[alt]').count();
    console.log(`\n🖼️  Images:`);
    console.log(`   Total images: ${workImages}`);
    console.log(`   Images with alt text: ${workImagesWithAlt} (${Math.round(workImagesWithAlt/workImages*100)}%)`);

    // Links to case studies
    const caseStudyLinks = await page.locator('a[href*="/work"]').count();
    console.log(`\n🔗 Case Study Links: ${caseStudyLinks}`);

    // Check for animations/interactive elements
    const hasFramerMotion = await page.evaluate(() => {
      return document.querySelector('[style*="transform"]') !== null;
    });
    console.log(`\n✨ Animations: ${hasFramerMotion ? 'Detected' : 'Not detected'}`);

    // Performance metrics
    const workPerformance = await page.evaluate(() => {
      const timing = performance.timing;
      const paint = performance.getEntriesByType('paint');
      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: paint[0]?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      };
    });
    console.log(`\n⚡ Performance:`);
    console.log(`   Load time: ${workPerformance.loadTime}ms`);
    console.log(`   DOM ready: ${workPerformance.domReady}ms`);
    console.log(`   First paint: ${Math.round(workPerformance.firstPaint)}ms`);
    console.log(`   First contentful paint: ${Math.round(workPerformance.firstContentfulPaint)}ms`);

    // Screenshot
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'work-page-desktop.png'),
      fullPage: true
    });
    console.log(`\n📸 Screenshot: work-page-desktop.png`);

    // Mobile viewport test
    console.log(`\n📱 Testing Mobile Viewport...`);
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'work-page-mobile.png'),
      fullPage: true
    });
    console.log(`   Screenshot: work-page-mobile.png`);

    results.workPage = {
      title: workTitle,
      url: workUrl,
      mainHeading: workH1?.trim(),
      sections: caseStudySections,
      headings: headings,
      caseStudies: caseStudyTitles.length,
      caseStudyTitles: caseStudyTitles.map(t => t.trim()),
      images: { total: workImages, withAlt: workImagesWithAlt },
      caseStudyLinks: caseStudyLinks,
      hasAnimations: hasFramerMotion,
      performance: workPerformance
    };

    // ==================== ACCESSIBILITY CHECKS ====================
    console.log('\n\n♿ ACCESSIBILITY CHECKS');
    console.log('━'.repeat(60));

    await page.goto(BASE_URL + '/work');

    const a11yChecks = await page.evaluate(() => {
      return {
        hasLang: document.documentElement.hasAttribute('lang'),
        langValue: document.documentElement.getAttribute('lang'),
        hasTitle: !!document.title,
        hasH1: document.querySelectorAll('h1').length > 0,
        skipLinks: document.querySelectorAll('a[href^="#"]').length,
        ariaLabels: document.querySelectorAll('[aria-label]').length,
        ariaDescribedBy: document.querySelectorAll('[aria-describedby]').length
      };
    });

    console.log(`\n✓ Language attribute: ${a11yChecks.langValue || 'Not set'}`);
    console.log(`✓ Page title: ${a11yChecks.hasTitle ? 'Present' : 'Missing'}`);
    console.log(`✓ H1 heading: ${a11yChecks.hasH1 ? 'Present' : 'Missing'}`);
    console.log(`✓ Skip links: ${a11yChecks.skipLinks}`);
    console.log(`✓ ARIA labels: ${a11yChecks.ariaLabels}`);
    console.log(`✓ ARIA descriptions: ${a11yChecks.ariaDescribedBy}`);

    results.accessibility = a11yChecks;

    // ==================== SUMMARY ====================
    console.log('\n\n📊 TEST SUMMARY');
    console.log('━'.repeat(60));
    console.log(`\n✅ Homepage:`);
    console.log(`   - Loaded successfully`);
    console.log(`   - ${results.homepage.images.total} images (${results.homepage.images.withAlt} with alt)`);
    console.log(`   - ${results.homepage.links.total} links`);
    console.log(`   - Load time: ${results.homepage.performance.loadTime}ms`);

    console.log(`\n✅ Work Page:`);
    console.log(`   - Loaded successfully`);
    console.log(`   - ${results.workPage.caseStudies} case studies detected`);
    console.log(`   - ${results.workPage.images.total} images (${results.workPage.images.withAlt} with alt)`);
    console.log(`   - Load time: ${results.workPage.performance.loadTime}ms`);

    console.log(`\n📸 Screenshots saved to: ${SCREENSHOT_DIR}/`);
    console.log(`   - homepage-desktop.png`);
    console.log(`   - work-page-desktop.png`);
    console.log(`   - work-page-mobile.png`);

    // Save detailed results to JSON
    const resultsPath = join(SCREENSHOT_DIR, 'test-results.json');
    writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Detailed results: ${resultsPath}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }

  return results;
}

// Run tests
testWebsite()
  .then(() => {
    console.log('\n\n🎉 Website testing complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  });
