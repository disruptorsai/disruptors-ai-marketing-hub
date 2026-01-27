import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deepAnimationAnalysis() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Navigating to https://info.disruptorsmedia.com...');
  await page.goto('https://info.disruptorsmedia.com', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  await page.waitForTimeout(5000);

  // Analyze the page's JavaScript and CSS for animation clues
  const technicalAnalysis = await page.evaluate(() => {
    const results = {
      cssAnimations: [],
      jsLibraries: [],
      inlineStyles: [],
      customScripts: [],
      eventListeners: []
    };

    // Check all stylesheets for animation-related CSS
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules || []).forEach(rule => {
          const text = rule.cssText || '';
          if (text.match(/(animation|transition|transform|@keyframes)/i)) {
            results.cssAnimations.push(text.substring(0, 200));
          }
        });
      } catch (e) {
        // Cross-origin stylesheets
      }
    });

    // Check for animation libraries
    const scripts = Array.from(document.querySelectorAll('script'));
    scripts.forEach(script => {
      const src = script.src || '';
      const content = script.textContent || '';

      if (src || content.length > 100) {
        if (src.match(/(gsap|scroll|animate|lottie|anime|velocity)/i) ||
            content.match(/(gsap|ScrollTrigger|ScrollMagic|anime|lottie)/i)) {
          results.jsLibraries.push({
            src: src || 'inline',
            snippet: content.substring(0, 300)
          });
        }
      }
    });

    // Check for scroll event listeners
    const scrollHandler = window.onscroll || document.onscroll;
    if (scrollHandler) {
      results.eventListeners.push({
        type: 'scroll',
        handler: scrollHandler.toString().substring(0, 300)
      });
    }

    // Look for elements with data attributes related to animation
    const animatedElements = document.querySelectorAll('[data-scroll], [data-animate], [data-animation], [class*="animate"], [class*="scroll"]');
    results.animatedElementCount = animatedElements.length;

    return results;
  });

  console.log('\n=== TECHNICAL ANALYSIS ===');
  console.log('CSS Animations found:', technicalAnalysis.cssAnimations.length);
  console.log('Animation libraries:', technicalAnalysis.jsLibraries.length);
  console.log('Animated elements:', technicalAnalysis.animatedElementCount);

  // Now perform detailed scroll tracking
  console.log('\n=== DETAILED SCROLL TRACKING ===\n');

  const scrollData = [];
  const scrollSteps = 30;
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);

  // Scroll to top first
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  for (let i = 0; i <= scrollSteps; i++) {
    const scrollPosition = (pageHeight - viewportHeight) * (i / scrollSteps);
    await page.evaluate((pos) => window.scrollTo(0, pos), scrollPosition);
    await page.waitForTimeout(400);

    const snapshot = await page.evaluate((scrollPos) => {
      // Capture state of specific element types
      const elements = {
        images: [],
        headings: [],
        sections: [],
        animated: []
      };

      // Images
      document.querySelectorAll('img').forEach(img => {
        const rect = img.getBoundingClientRect();
        const styles = window.getComputedStyle(img);
        if (rect.height > 50 && rect.width > 50) {
          elements.images.push({
            src: img.src.substring(img.src.lastIndexOf('/') + 1),
            inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
            distanceFromTop: Math.round(rect.top),
            opacity: styles.opacity,
            transform: styles.transform
          });
        }
      });

      // Headings
      document.querySelectorAll('h1, h2, h3, h4').forEach(heading => {
        const rect = heading.getBoundingClientRect();
        const styles = window.getComputedStyle(heading);
        elements.headings.push({
          tag: heading.tagName,
          text: heading.textContent.substring(0, 50).trim(),
          inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
          distanceFromTop: Math.round(rect.top),
          opacity: styles.opacity,
          transform: styles.transform,
          color: styles.color
        });
      });

      // Sections
      document.querySelectorAll('section, [class*="section"]').forEach(section => {
        const rect = section.getBoundingClientRect();
        const styles = window.getComputedStyle(section);
        const className = typeof section.className === 'string' ? section.className : '';
        elements.sections.push({
          className: className.substring(0, 50),
          inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
          distanceFromTop: Math.round(rect.top),
          opacity: styles.opacity,
          transform: styles.transform,
          backgroundColor: styles.backgroundColor
        });
      });

      // Elements with animation classes
      const animatedSelectors = [
        '[class*="fade"]',
        '[class*="slide"]',
        '[class*="zoom"]',
        '[class*="reveal"]',
        '[class*="animate"]',
        '[data-scroll]',
        '[data-animate]'
      ];

      animatedSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          const rect = el.getBoundingClientRect();
          const styles = window.getComputedStyle(el);
          const className = typeof el.className === 'string' ? el.className : '';

          if (rect.height > 20 && rect.width > 20) {
            elements.animated.push({
              selector: selector,
              tagName: el.tagName,
              className: className.substring(0, 80),
              text: el.textContent.substring(0, 40).trim(),
              inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
              distanceFromTop: Math.round(rect.top),
              percentInView: rect.top < window.innerHeight && rect.bottom > 0 ?
                Math.round(((window.innerHeight - Math.max(0, rect.top)) / rect.height) * 100) : 0,
              opacity: styles.opacity,
              transform: styles.transform,
              visibility: styles.visibility
            });
          }
        });
      });

      return {
        scrollY: scrollPos,
        elements
      };
    }, scrollPosition);

    scrollData.push({
      step: i,
      percentage: Math.round((i / scrollSteps) * 100),
      ...snapshot
    });

    console.log(`Captured scroll state at ${Math.round((i / scrollSteps) * 100)}%`);
  }

  // Analyze patterns
  console.log('\n=== ANALYZING PATTERNS ===\n');

  const patterns = {
    fadeIns: [],
    slideIns: [],
    parallax: [],
    reveals: []
  };

  // Find fade-in patterns
  scrollData.forEach((frame, idx) => {
    if (idx === 0) return;

    frame.elements.animated.forEach((el, elIdx) => {
      const prevFrame = scrollData[idx - 1].elements.animated[elIdx];
      if (!prevFrame) return;

      const opacityChange = parseFloat(el.opacity) - parseFloat(prevFrame.opacity);

      // Fade in detected
      if (opacityChange > 0.1 && el.percentInView > 0 && el.percentInView < 100) {
        patterns.fadeIns.push({
          element: {
            tag: el.tagName,
            class: el.className,
            text: el.text
          },
          trigger: {
            scrollPercentage: frame.percentage,
            scrollPosition: frame.scrollY,
            distanceFromTop: el.distanceFromTop,
            percentInView: el.percentInView
          },
          animation: {
            opacityFrom: prevFrame.opacity,
            opacityTo: el.opacity,
            opacityChange
          }
        });
      }

      // Transform change detected
      if (el.transform !== prevFrame.transform && el.transform !== 'none') {
        patterns.slideIns.push({
          element: {
            tag: el.tagName,
            class: el.className,
            text: el.text
          },
          trigger: {
            scrollPercentage: frame.percentage,
            scrollPosition: frame.scrollY,
            distanceFromTop: el.distanceFromTop,
            percentInView: el.percentInView
          },
          animation: {
            transformFrom: prevFrame.transform,
            transformTo: el.transform
          }
        });
      }
    });
  });

  const report = {
    technicalAnalysis,
    scrollData: scrollData.filter((_, idx) => idx % 3 === 0), // Every 3rd frame to reduce size
    patterns: {
      fadeIns: patterns.fadeIns.slice(0, 20),
      slideIns: patterns.slideIns.slice(0, 20),
      summary: {
        totalFadeIns: patterns.fadeIns.length,
        totalSlideIns: patterns.slideIns.length
      }
    }
  };

  const reportPath = path.join(__dirname, '..', 'docs', 'DEEP_ANIMATION_ANALYSIS.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to ${reportPath}`);

  await browser.close();
}

deepAnimationAnalysis()
  .then(() => {
    console.log('\n=== DEEP ANIMATION ANALYSIS COMPLETE ===');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
