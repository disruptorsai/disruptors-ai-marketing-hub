import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('\n=== ANALYZING https://info.disruptorsmedia.com ===\n');

  try {
    // Navigate and wait for page load
    await page.goto('https://info.disruptorsmedia.com', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Wait a bit for dynamic content
    await page.waitForTimeout(3000);

    console.log('Page loaded successfully\n');

    // ===== HEADER ANALYSIS =====
    console.log('=== HEADER ANALYSIS ===\n');

    // Check for header/nav element
    const header = await page.locator('header, nav, [role="banner"]').first();
    if (await header.count() > 0) {
      const headerStyles = await header.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          position: styles.position,
          backgroundColor: styles.backgroundColor,
          height: styles.height,
          display: styles.display,
          padding: styles.padding,
          zIndex: styles.zIndex
        };
      });
      console.log('Header Styles:', JSON.stringify(headerStyles, null, 2));

      // Logo analysis
      const logo = await page.locator('header img, nav img, .logo, [class*="logo"]').first();
      if (await logo.count() > 0) {
        const logoInfo = await logo.evaluate(el => {
          const styles = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            src: el.src || el.style.backgroundImage,
            width: styles.width,
            height: styles.height,
            position: `x: ${rect.x}, y: ${rect.y}`,
            alt: el.alt || 'N/A'
          };
        });
        console.log('\nLogo:', JSON.stringify(logoInfo, null, 2));
      }

      // Navigation items
      const navLinks = await page.locator('header a, nav a').all();
      console.log('\nNavigation Items:');
      for (let i = 0; i < navLinks.length; i++) {
        const link = navLinks[i];
        const linkInfo = await link.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            text: el.textContent.trim(),
            href: el.href,
            color: styles.color,
            fontSize: styles.fontSize,
            fontFamily: styles.fontFamily,
            fontWeight: styles.fontWeight
          };
        });
        console.log(`  ${i + 1}. ${linkInfo.text}`, JSON.stringify(linkInfo, null, 2));
      }
    } else {
      console.log('No header element found');
    }

    // ===== CHECK FOR ANIMATION LIBRARIES =====
    console.log('\n\n=== ANIMATION LIBRARIES LOADED ===\n');

    const libraries = await page.evaluate(() => {
      const libs = [];
      if (window.gsap) libs.push('GSAP');
      if (window.ScrollTrigger) libs.push('ScrollTrigger');
      if (window.Lottie || window.lottie) libs.push('Lottie');
      if (document.querySelector('[data-aos]')) libs.push('AOS (Animate On Scroll)');
      if (window.anime) libs.push('Anime.js');
      if (window.Velocity) libs.push('Velocity.js');

      // Check for Framer Motion
      const hasFramerMotion = document.querySelector('[style*="transform"]') !== null;
      if (hasFramerMotion) libs.push('Likely React/Framer Motion (transform styles detected)');

      return libs;
    });

    console.log('Detected Libraries:', libraries.join(', ') || 'None detected (may use CSS animations)');

    // Check script tags for animation libraries
    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
    });

    console.log('\nLoaded Scripts (animation-related):');
    scripts.filter(src =>
      src.includes('gsap') ||
      src.includes('lottie') ||
      src.includes('anime') ||
      src.includes('scroll') ||
      src.includes('animation')
    ).forEach(src => console.log('  -', src));

    // ===== SCROLL AND ANALYZE ANIMATIONS =====
    console.log('\n\n=== SCROLL ANIMATION ANALYSIS ===\n');

    // Get all elements that might animate
    const allElements = await page.locator('section, div[class*="section"], article, .animate, [data-aos], [class*="fade"], [class*="slide"]').all();

    console.log(`Found ${allElements.length} potential animated elements\n`);

    // Scroll through page in increments
    const scrollPositions = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000];

    for (const scrollY of scrollPositions) {
      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await page.waitForTimeout(500); // Wait for animations to trigger

      console.log(`\n--- Scroll Position: ${scrollY}px ---`);

      // Check what's in viewport
      const visibleElements = await page.evaluate((scroll) => {
        const elements = [];
        document.querySelectorAll('section, div[class*="section"], article, h1, h2, h3, img, [class*="card"]').forEach((el, idx) => {
          const rect = el.getBoundingClientRect();
          const styles = window.getComputedStyle(el);

          // Only report elements near viewport
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const classes = Array.from(el.classList).join(' ');
            const hasTransform = styles.transform !== 'none';
            const hasOpacity = parseFloat(styles.opacity) < 1;
            const hasTransition = styles.transition !== 'all 0s ease 0s';

            if (hasTransform || hasOpacity || hasTransition || classes.includes('animate')) {
              elements.push({
                index: idx,
                tag: el.tagName.toLowerCase(),
                classes: classes,
                text: el.textContent.substring(0, 50).trim() + '...',
                position: {
                  top: Math.round(rect.top),
                  left: Math.round(rect.left),
                  width: Math.round(rect.width),
                  height: Math.round(rect.height)
                },
                styles: {
                  transform: styles.transform,
                  opacity: styles.opacity,
                  transition: styles.transition,
                  animation: styles.animation
                },
                inViewport: rect.top >= 0 && rect.top <= window.innerHeight
              });
            }
          }
        });
        return elements;
      }, scrollY);

      visibleElements.forEach(el => {
        console.log(`\n  Element: <${el.tag}> "${el.text}"`);
        console.log(`  Classes: ${el.classes}`);
        console.log(`  Position: top=${el.position.top}px, viewport=${el.inViewport}`);
        console.log(`  Transform: ${el.styles.transform}`);
        console.log(`  Opacity: ${el.styles.opacity}`);
        console.log(`  Transition: ${el.styles.transition}`);
        if (el.styles.animation !== 'none') {
          console.log(`  Animation: ${el.styles.animation}`);
        }
      });
    }

    // ===== FOOTER ANALYSIS =====
    console.log('\n\n=== FOOTER ANALYSIS ===\n');

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const footer = await page.locator('footer').first();
    if (await footer.count() > 0) {
      const footerInfo = await footer.evaluate(el => {
        const styles = window.getComputedStyle(el);
        const sections = [];

        // Find all major sections in footer
        el.querySelectorAll('div[class*="col"], div[class*="section"], nav').forEach((section, idx) => {
          const links = [];
          section.querySelectorAll('a').forEach(a => {
            links.push({
              text: a.textContent.trim(),
              href: a.href
            });
          });

          sections.push({
            index: idx,
            classes: Array.from(section.classList).join(' '),
            text: section.textContent.substring(0, 100).trim(),
            links: links,
            linkCount: links.length
          });
        });

        return {
          styles: {
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            padding: styles.padding,
            display: styles.display,
            gridTemplateColumns: styles.gridTemplateColumns,
            flexDirection: styles.flexDirection
          },
          sections: sections,
          allLinks: Array.from(el.querySelectorAll('a')).map(a => ({
            text: a.textContent.trim(),
            href: a.href
          })),
          socialIcons: Array.from(el.querySelectorAll('svg, img[alt*="social"], a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"]')).length,
          copyrightText: el.querySelector('[class*="copyright"], [class*="legal"], small')?.textContent.trim() || 'Not found'
        };
      });

      console.log('Footer Layout:', JSON.stringify(footerInfo.styles, null, 2));
      console.log('\nFooter Sections:', footerInfo.sections.length);
      footerInfo.sections.forEach(section => {
        console.log(`\n  Section ${section.index + 1}:`);
        console.log(`    Classes: ${section.classes}`);
        console.log(`    Links: ${section.linkCount}`);
        section.links.forEach(link => {
          console.log(`      - ${link.text} (${link.href})`);
        });
      });

      console.log(`\nTotal Footer Links: ${footerInfo.allLinks.length}`);
      console.log(`Social Icons Found: ${footerInfo.socialIcons}`);
      console.log(`\nCopyright/Legal Text:\n  ${footerInfo.copyrightText}`);
    } else {
      console.log('No footer element found');
    }

    // ===== CSS ANIMATIONS ANALYSIS =====
    console.log('\n\n=== CSS ANIMATIONS & KEYFRAMES ===\n');

    const cssAnimations = await page.evaluate(() => {
      const animations = [];

      // Get all stylesheets
      Array.from(document.styleSheets).forEach(sheet => {
        try {
          Array.from(sheet.cssRules).forEach(rule => {
            if (rule.type === CSSRule.KEYFRAMES_RULE) {
              animations.push({
                name: rule.name,
                keyframes: Array.from(rule.cssRules).map(kr => ({
                  keyText: kr.keyText,
                  style: kr.style.cssText
                }))
              });
            }
          });
        } catch (e) {
          // CORS or access issues
        }
      });

      return animations;
    });

    if (cssAnimations.length > 0) {
      console.log('CSS Keyframe Animations Found:');
      cssAnimations.forEach(anim => {
        console.log(`\n  @keyframes ${anim.name} {`);
        anim.keyframes.forEach(kf => {
          console.log(`    ${kf.keyText} { ${kf.style} }`);
        });
        console.log('  }');
      });
    } else {
      console.log('No CSS keyframe animations detected (or blocked by CORS)');
    }

    console.log('\n\n=== ANALYSIS COMPLETE ===\n');

  } catch (error) {
    console.error('Error during analysis:', error.message);
  } finally {
    await browser.close();
  }
})();
