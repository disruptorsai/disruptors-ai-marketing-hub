import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzeScrollAnimations() {
  console.log('🚀 Starting simplified scroll animation analysis...');

  const browser = await chromium.launch({
    headless: true,
    timeout: 30000
  });

  const page = await browser.newPage();

  // Set viewport
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    console.log('🌐 Loading website...');
    await page.goto('https://info.disruptorsmedia.com', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for content to load
    await page.waitForTimeout(5000);

    console.log('🔍 Analyzing page content...');

    const analysis = await page.evaluate(() => {
      const result = {
        title: document.title,
        url: window.location.href,
        libraries: [],
        animations: [],
        scrollElements: [],
        stylesheets: [],
        scripts: [],
        performanceMetrics: {}
      };

      // Check for animation libraries
      const libraryChecks = [
        { name: 'GSAP', check: () => window.gsap || window.GreenSockGlobals },
        { name: 'ScrollMagic', check: () => window.ScrollMagic },
        { name: 'AOS (Animate On Scroll)', check: () => window.AOS },
        { name: 'Lottie', check: () => window.lottie },
        { name: 'Three.js', check: () => window.THREE },
        { name: 'Framer Motion', check: () => document.querySelector('[data-framer-motion]') },
        { name: 'Intersection Observer API', check: () => window.IntersectionObserver }
      ];

      libraryChecks.forEach(lib => {
        try {
          if (lib.check()) {
            result.libraries.push({ name: lib.name, detected: true });
          }
        } catch (e) {
          // Library not found
        }
      });

      // Analyze stylesheets
      Array.from(document.styleSheets).forEach((sheet, index) => {
        try {
          result.stylesheets.push({
            index,
            href: sheet.href,
            origin: sheet.href ? new URL(sheet.href).origin : 'inline',
            rulesCount: sheet.cssRules ? sheet.cssRules.length : 0
          });
        } catch (e) {
          result.stylesheets.push({
            index,
            href: sheet.href,
            origin: 'blocked (CORS)',
            rulesCount: 'unknown'
          });
        }
      });

      // Analyze scripts
      Array.from(document.scripts).forEach((script, index) => {
        result.scripts.push({
          index,
          src: script.src,
          type: script.type,
          async: script.async,
          defer: script.defer
        });
      });

      // Find elements with animation-related attributes or classes
      const allElements = document.querySelectorAll('*');
      allElements.forEach((element, index) => {
        const animationClasses = [];
        const animationAttrs = [];

        // Check classes
        if (element.className && typeof element.className === 'string') {
          const classes = element.className.split(' ');
          classes.forEach(cls => {
            if (cls && (
              cls.includes('animate') ||
              cls.includes('fade') ||
              cls.includes('slide') ||
              cls.includes('scroll') ||
              cls.includes('aos') ||
              cls.includes('gsap') ||
              cls.includes('motion')
            )) {
              animationClasses.push(cls);
            }
          });
        }

        // Check attributes
        Array.from(element.attributes).forEach(attr => {
          if (attr.name.includes('data-') && (
            attr.name.includes('animate') ||
            attr.name.includes('scroll') ||
            attr.name.includes('aos') ||
            attr.name.includes('gsap') ||
            attr.name.includes('trigger')
          )) {
            animationAttrs.push({ name: attr.name, value: attr.value });
          }
        });

        if (animationClasses.length > 0 || animationAttrs.length > 0) {
          const rect = element.getBoundingClientRect();
          result.scrollElements.push({
            tagName: element.tagName.toLowerCase(),
            classes: animationClasses,
            attributes: animationAttrs,
            position: {
              top: Math.round(rect.top + window.scrollY),
              left: Math.round(rect.left + window.scrollX),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            },
            isVisible: rect.top < window.innerHeight && rect.bottom > 0
          });
        }
      });

      // Get computed styles for potential animations
      const elementsWithAnimations = [];
      allElements.forEach((element, index) => {
        if (index < 100) { // Limit to first 100 elements for performance
          try {
            const computedStyle = window.getComputedStyle(element);
            const hasAnimation = computedStyle.animationName !== 'none';
            const hasTransition = computedStyle.transitionProperty !== 'none';
            const hasTransform = computedStyle.transform !== 'none';

            if (hasAnimation || hasTransition || hasTransform) {
              elementsWithAnimations.push({
                tagName: element.tagName.toLowerCase(),
                animation: hasAnimation ? {
                  name: computedStyle.animationName,
                  duration: computedStyle.animationDuration,
                  timingFunction: computedStyle.animationTimingFunction,
                  delay: computedStyle.animationDelay
                } : null,
                transition: hasTransition ? {
                  property: computedStyle.transitionProperty,
                  duration: computedStyle.transitionDuration,
                  timingFunction: computedStyle.transitionTimingFunction,
                  delay: computedStyle.transitionDelay
                } : null,
                transform: hasTransform ? computedStyle.transform : null
              });
            }
          } catch (e) {
            // Skip elements that can't be analyzed
          }
        }
      });

      result.animations = elementsWithAnimations;

      // Basic performance metrics
      if (window.performance) {
        const navigation = window.performance.getEntriesByType('navigation')[0];
        result.performanceMetrics = {
          domContentLoaded: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart) : 0,
          loadComplete: navigation ? Math.round(navigation.loadEventEnd - navigation.loadEventStart) : 0,
          totalLoadTime: navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : 0
        };
      }

      return result;
    });

    // Test scroll behavior
    console.log('📜 Testing scroll behavior...');

    const scrollTest = await page.evaluate(async () => {
      const scrollResults = {
        initialScrollY: window.scrollY,
        pageHeight: document.body.scrollHeight,
        viewportHeight: window.innerHeight,
        scrollEvents: []
      };

      // Test smooth scrolling
      const originalScrollTo = window.scrollTo;
      let smoothScrollDetected = false;

      window.scrollTo = function(...args) {
        if (args.length > 0 && typeof args[0] === 'object' && args[0].behavior === 'smooth') {
          smoothScrollDetected = true;
        }
        return originalScrollTo.apply(this, args);
      };

      // Simulate scroll
      window.scrollTo({ top: 500, behavior: 'smooth' });
      await new Promise(resolve => setTimeout(resolve, 1000));

      scrollResults.smoothScrollDetected = smoothScrollDetected;
      scrollResults.finalScrollY = window.scrollY;

      // Restore original scrollTo
      window.scrollTo = originalScrollTo;
      window.scrollTo(0, 0);

      return scrollResults;
    });

    analysis.scrollTest = scrollTest;

    // Save results
    const outputPath = path.join(__dirname, '..', 'generated', `scroll-animation-analysis-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));

    console.log('✅ Analysis complete!');
    console.log(`📁 Results saved to: ${outputPath}`);

    // Print summary
    console.log('\n📊 ANALYSIS SUMMARY:');
    console.log(`🌐 URL: ${analysis.url}`);
    console.log(`📚 Animation libraries detected: ${analysis.libraries.length}`);
    console.log(`🎨 Elements with animations: ${analysis.animations.length}`);
    console.log(`📍 Elements with scroll attributes: ${analysis.scrollElements.length}`);
    console.log(`📄 Stylesheets: ${analysis.stylesheets.length}`);
    console.log(`📜 Scripts: ${analysis.scripts.length}`);

    if (analysis.libraries.length > 0) {
      console.log('\n🔧 Detected Libraries:');
      analysis.libraries.forEach(lib => {
        console.log(`  ✓ ${lib.name}`);
      });
    }

    return analysis;

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    return { error: error.message };
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeScrollAnimations().catch(console.error);
}

export { analyzeScrollAnimations };