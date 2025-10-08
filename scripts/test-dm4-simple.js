/**
 * Simple website test for dm4.wjwelsh.com
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://dm4.wjwelsh.com';
const SCREENSHOT_DIR = 'temp/website-tests';

try {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
} catch (e) {}

async function testPage(page, url, pageName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📍 Testing ${pageName}: ${url}`);
  console.log('='.repeat(60));

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

  // Wait a bit for dynamic content
  await page.waitForTimeout(2000);

  // Gather all data in one evaluate call for efficiency
  const pageData = await page.evaluate(() => {
    // Meta tags
    const getMeta = (name) => {
      const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      return meta ? meta.getAttribute('content') : null;
    };

    // Count elements
    const count = (selector) => document.querySelectorAll(selector).length;

    // Get text content
    const getText = (selector) => {
      const el = document.querySelector(selector);
      return el ? el.textContent.trim() : null;
    };

    // Get all text contents
    const getAllText = (selector) => {
      return Array.from(document.querySelectorAll(selector)).map(el => el.textContent.trim());
    };

    // Performance
    const timing = performance.timing;
    const paint = performance.getEntriesByType('paint');

    return {
      title: document.title,
      url: window.location.href,
      meta: {
        description: getMeta('description') || getMeta('og:description'),
        ogImage: getMeta('og:image'),
        ogTitle: getMeta('og:title'),
        lang: document.documentElement.getAttribute('lang')
      },
      structure: {
        navCount: count('nav'),
        navLinks: count('nav a'),
        h1Count: count('h1'),
        firstH1: getText('h1'),
        h2Count: count('h2'),
        h3Count: count('h3'),
        sections: count('section'),
        images: count('img'),
        imagesWithAlt: count('img[alt]'),
        links: count('a'),
        externalLinks: count('a[href^="http"]')
      },
      headings: {
        h1: getAllText('h1'),
        h2: getAllText('h2').slice(0, 15),
        h3: getAllText('h3').slice(0, 15)
      },
      performance: {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: paint[0]?.startTime || 0,
        fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      },
      accessibility: {
        hasLang: !!document.documentElement.getAttribute('lang'),
        hasTitle: !!document.title,
        skipLinks: count('a[href^="#"]'),
        ariaLabels: count('[aria-label]')
      }
    };
  });

  // Display results
  console.log(`\n📄 Page Info:`);
  console.log(`   Title: "${pageData.title}"`);
  console.log(`   URL: ${pageData.url}`);

  console.log(`\n📝 Meta Tags:`);
  console.log(`   Description: ${pageData.meta.description ? pageData.meta.description.substring(0, 80) + '...' : 'Not set'}`);
  console.log(`   OG Image: ${pageData.meta.ogImage || 'Not set'}`);
  console.log(`   Language: ${pageData.meta.lang || 'Not set'}`);

  console.log(`\n🏗️  Structure:`);
  console.log(`   Navigation: ${pageData.structure.navCount} nav elements, ${pageData.structure.navLinks} links`);
  console.log(`   Headings: ${pageData.structure.h1Count} H1, ${pageData.structure.h2Count} H2, ${pageData.structure.h3Count} H3`);
  console.log(`   Sections: ${pageData.structure.sections}`);
  console.log(`   Images: ${pageData.structure.images} total (${pageData.structure.imagesWithAlt} with alt text)`);
  console.log(`   Links: ${pageData.structure.links} total (${pageData.structure.externalLinks} external)`);

  if (pageData.headings.h1.length > 0) {
    console.log(`\n📋 Main Headings:`);
    pageData.headings.h1.forEach((h, i) => {
      console.log(`   H1: ${h.substring(0, 60)}`);
    });
  }

  if (pageData.headings.h2.length > 0) {
    console.log(`\n📚 Content (H2 headings):`);
    pageData.headings.h2.forEach((h, i) => {
      if (h) console.log(`   ${i + 1}. ${h.substring(0, 60)}`);
    });
  }

  console.log(`\n⚡ Performance:`);
  console.log(`   Load time: ${pageData.performance.loadTime}ms`);
  console.log(`   DOM ready: ${pageData.performance.domReady}ms`);
  console.log(`   First paint: ${Math.round(pageData.performance.firstPaint)}ms`);
  console.log(`   First contentful paint: ${Math.round(pageData.performance.fcp)}ms`);

  console.log(`\n♿ Accessibility:`);
  console.log(`   Language attribute: ${pageData.accessibility.hasLang ? '✓' : '✗'}`);
  console.log(`   Page title: ${pageData.accessibility.hasTitle ? '✓' : '✗'}`);
  console.log(`   Skip links: ${pageData.accessibility.skipLinks}`);
  console.log(`   ARIA labels: ${pageData.accessibility.ariaLabels}`);

  // Screenshot
  const screenshotName = `${pageName.toLowerCase().replace(/\s+/g, '-')}.png`;
  await page.screenshot({
    path: join(SCREENSHOT_DIR, screenshotName),
    fullPage: true
  });
  console.log(`\n📸 Screenshot: ${screenshotName}`);

  return pageData;
}

async function runTests() {
  console.log('🌐 DM4 Website Testing Suite\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const results = {};

  try {
    // Test homepage
    results.homepage = await testPage(page, BASE_URL, 'Homepage');

    // Test work page
    results.workPage = await testPage(page, BASE_URL + '/work', 'Work Page');

    // Mobile screenshot of work page
    console.log(`\n${'='.repeat(60)}`);
    console.log('📱 Mobile View Test');
    console.log('='.repeat(60));
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL + '/work', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'work-page-mobile.png'),
      fullPage: true
    });
    console.log('   Screenshot: work-page-mobile.png');

    // Summary
    console.log(`\n\n${'='.repeat(60)}`);
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));

    console.log(`\n✅ Homepage:`);
    console.log(`   - Title: "${results.homepage.title}"`);
    console.log(`   - Images: ${results.homepage.structure.images} (${Math.round(results.homepage.structure.imagesWithAlt/results.homepage.structure.images*100)}% with alt)`);
    console.log(`   - Load time: ${results.homepage.performance.loadTime}ms`);

    console.log(`\n✅ Work Page:`);
    console.log(`   - Title: "${results.workPage.title}"`);
    console.log(`   - H2 sections: ${results.workPage.structure.h2Count}`);
    console.log(`   - Images: ${results.workPage.structure.images} (${Math.round(results.workPage.structure.imagesWithAlt/results.workPage.structure.images*100)}% with alt)`);
    console.log(`   - Load time: ${results.workPage.performance.loadTime}ms`);

    console.log(`\n📸 Screenshots saved to: ${SCREENSHOT_DIR}/`);
    console.log(`   - homepage.png`);
    console.log(`   - work-page.png`);
    console.log(`   - work-page-mobile.png`);

    // Save JSON results
    const resultsPath = join(SCREENSHOT_DIR, 'test-results.json');
    writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Full results: ${resultsPath}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }

  return results;
}

runTests()
  .then(() => {
    console.log('\n\n🎉 Website testing complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
