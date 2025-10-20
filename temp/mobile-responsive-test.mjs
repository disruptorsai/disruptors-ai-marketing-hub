/**
 * Mobile Responsiveness Test
 * Tests site across multiple device viewports
 */

import { chromium } from 'playwright';

const sites = [
  {
    name: 'Dev Site',
    url: 'https://dev.disruptorsmedia.com'
  },
  {
    name: 'Production Site',
    url: 'https://dm4.wjwelsh.com'
  }
];

const devices = [
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Laptop', width: 1366, height: 768 },
  { name: 'Tablet (Portrait)', width: 768, height: 1024 },
  { name: 'Tablet (Landscape)', width: 1024, height: 768 },
  { name: 'Mobile (Portrait)', width: 375, height: 667 },
  { name: 'Mobile (Landscape)', width: 667, height: 375 }
];

/**
 * Test site responsiveness
 */
async function testResponsiveness(site) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`MOBILE RESPONSIVENESS TEST: ${site.name}`);
  console.log(`URL: ${site.url}`);
  console.log(`${'='.repeat(80)}\n`);

  const browser = await chromium.launch({ headless: true });
  const results = {
    site: site.name,
    url: site.url,
    devices: []
  };

  for (const device of devices) {
    console.log(`Testing ${device.name} (${device.width}x${device.height})...`);

    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      isMobile: device.width < 768
    });

    const page = await context.newPage();

    try {
      const startTime = Date.now();
      await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 });
      const loadTime = Date.now() - startTime;

      await page.waitForTimeout(2000);

      // Check for responsive elements
      const responsiveChecks = await page.evaluate(() => {
        const body = document.body;
        const hasOverflow = body.scrollWidth > body.clientWidth;
        const hasContent = body.innerText.length > 100;
        const hasImages = document.images.length > 0;
        const hasNav = document.querySelector('nav') !== null;

        // Check for mobile menu if on mobile device
        const isMobile = window.innerWidth < 768;
        const hasMobileMenu = isMobile ? document.querySelector('[class*="mobile"]') !== null : true;

        return {
          hasOverflow,
          hasContent,
          hasImages,
          hasNav,
          hasMobileMenu,
          bodyWidth: body.scrollWidth,
          viewportWidth: window.innerWidth,
          textLength: body.innerText.length
        };
      });

      const deviceResult = {
        device: device.name,
        viewport: `${device.width}x${device.height}`,
        loadTime,
        success: true,
        checks: responsiveChecks,
        issues: []
      };

      // Flag issues
      if (responsiveChecks.hasOverflow) {
        deviceResult.issues.push('Horizontal overflow detected');
      }
      if (!responsiveChecks.hasContent) {
        deviceResult.issues.push('No content detected');
      }
      if (!responsiveChecks.hasMobileMenu && device.width < 768) {
        deviceResult.issues.push('Mobile menu not detected');
      }

      results.devices.push(deviceResult);

      if (deviceResult.issues.length === 0) {
        console.log(`  ✓ ${device.name.padEnd(25)} ${loadTime}ms - All checks passed`);
      } else {
        console.log(`  ⚠ ${device.name.padEnd(25)} ${loadTime}ms - ${deviceResult.issues.length} issues`);
        deviceResult.issues.forEach(issue => console.log(`    - ${issue}`));
      }

      await context.close();

    } catch (error) {
      console.log(`  ✗ ${device.name.padEnd(25)} Error: ${error.message}`);
      results.devices.push({
        device: device.name,
        viewport: `${device.width}x${device.height}`,
        success: false,
        error: error.message
      });
      await context.close();
    }
  }

  await browser.close();

  // Summary
  const passed = results.devices.filter(d => d.success && (!d.issues || d.issues.length === 0)).length;
  const total = results.devices.length;

  console.log(`\n${'─'.repeat(80)}`);
  console.log(`RESPONSIVE TEST SUMMARY: ${site.name}`);
  console.log(`Total Devices: ${total}`);
  console.log(`Passed: ${passed} (${Math.round(passed / total * 100)}%)`);
  console.log(`Issues: ${total - passed}`);
  console.log(`${'─'.repeat(80)}\n`);

  return results;
}

/**
 * Main execution
 */
async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║              DISRUPTORS AI - MOBILE RESPONSIVENESS TEST                    ║');
  console.log('║                    Cross-Device Compatibility Check                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');

  const allResults = [];

  for (const site of sites) {
    try {
      const result = await testResponsiveness(site);
      allResults.push(result);
    } catch (error) {
      console.error(`\n✗ Error testing ${site.name}:`, error.message);
    }
  }

  // Overall Summary
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                   OVERALL RESPONSIVENESS STATUS                            ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  for (const result of allResults) {
    const passed = result.devices.filter(d => d.success && (!d.issues || d.issues.length === 0)).length;
    const total = result.devices.length;
    const health = passed / total;
    const status = health >= 0.9 ? '✓ RESPONSIVE' : health >= 0.7 ? '⚠ NEEDS WORK' : '✗ CRITICAL';

    console.log(`${result.site.padEnd(30)} ${status.padEnd(20)} ${passed}/${total} devices`);
  }

  console.log('\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
