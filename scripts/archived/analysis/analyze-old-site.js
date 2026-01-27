import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzeDisruptorsMediaSite() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Navigating to https://info.disruptorsmedia.com...');
  try {
    await page.goto('https://info.disruptorsmedia.com', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
  } catch (error) {
    console.log('Initial navigation timeout, trying with load event...');
    await page.goto('https://info.disruptorsmedia.com', {
      waitUntil: 'load',
      timeout: 60000
    });
  }

  // Wait for content to load
  await page.waitForTimeout(3000);

  const analysis = {
    header: {},
    footer: {},
    scrollAnimations: [],
    screenshots: []
  };

  console.log('\n=== ANALYZING HEADER ===');

  // Header Analysis
  try {
    const headerData = await page.evaluate(() => {
      const header = document.querySelector('header') || document.querySelector('[class*="header"]') || document.querySelector('nav');
      if (!header) return null;

      const logo = header.querySelector('img, svg, [class*="logo"]');
      const nav = header.querySelector('nav') || header.querySelector('[class*="nav"]');
      const navLinks = nav ? Array.from(nav.querySelectorAll('a')) : [];

      const headerStyles = window.getComputedStyle(header);

      return {
        exists: true,
        tagName: header.tagName,
        className: header.className,
        height: header.offsetHeight,
        position: headerStyles.position,
        backgroundColor: headerStyles.backgroundColor,
        padding: headerStyles.padding,
        logo: logo ? {
          tagName: logo.tagName,
          src: logo.src || null,
          width: logo.offsetWidth,
          height: logo.offsetHeight,
          styles: {
            margin: window.getComputedStyle(logo).margin,
            padding: window.getComputedStyle(logo).padding
          }
        } : null,
        navigation: {
          exists: !!nav,
          itemCount: navLinks.length,
          items: navLinks.map(link => ({
            text: link.textContent.trim(),
            href: link.href,
            className: link.className,
            styles: {
              color: window.getComputedStyle(link).color,
              fontSize: window.getComputedStyle(link).fontSize,
              fontWeight: window.getComputedStyle(link).fontWeight,
              padding: window.getComputedStyle(link).padding,
              margin: window.getComputedStyle(link).margin
            }
          })),
          layout: nav ? {
            display: window.getComputedStyle(nav).display,
            justifyContent: window.getComputedStyle(nav).justifyContent,
            alignItems: window.getComputedStyle(nav).alignItems,
            gap: window.getComputedStyle(nav).gap
          } : null
        }
      };
    });

    analysis.header = headerData;
    console.log('Header analysis complete:', JSON.stringify(headerData, null, 2));
  } catch (error) {
    console.error('Header analysis error:', error.message);
  }

  // Take header screenshot
  await page.screenshot({ path: 'docs/old-site-header.png', fullPage: false });
  console.log('Header screenshot saved to docs/old-site-header.png');

  console.log('\n=== ANALYZING SCROLL ANIMATIONS ===');

  // Detect scroll animations by monitoring changes as we scroll
  const animatedElements = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const animatedEls = [];

    elements.forEach(el => {
      const styles = window.getComputedStyle(el);
      const hasTransition = styles.transition !== 'all 0s ease 0s';
      const hasAnimation = styles.animation !== 'none';
      const hasTransform = styles.transform !== 'none';

      // Check for animation-related classes or data attributes
      const className = typeof el.className === 'string' ? el.className : '';
      const hasAnimationClass = className.match(/(fade|slide|animate|scroll|parallax|reveal)/i);
      const hasAnimationData = el.hasAttribute('data-scroll') ||
                               el.hasAttribute('data-aos') ||
                               el.hasAttribute('data-animate');

      if (hasTransition || hasAnimation || hasTransform || hasAnimationClass || hasAnimationData) {
        const rect = el.getBoundingClientRect();
        animatedEls.push({
          tagName: el.tagName,
          className: className,
          id: el.id,
          text: el.textContent.substring(0, 50),
          position: {
            top: rect.top + window.scrollY,
            left: rect.left,
            width: rect.width,
            height: rect.height
          },
          styles: {
            transition: styles.transition,
            animation: styles.animation,
            transform: styles.transform,
            opacity: styles.opacity
          },
          attributes: {
            dataScroll: el.getAttribute('data-scroll'),
            dataAos: el.getAttribute('data-aos'),
            dataAnimate: el.getAttribute('data-animate')
          }
        });
      }
    });

    return animatedEls;
  });

  console.log(`Found ${animatedElements.length} potentially animated elements`);

  // Scroll through the page and capture animation states
  const scrollSteps = 10;
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);

  for (let i = 0; i <= scrollSteps; i++) {
    const scrollPosition = (pageHeight - viewportHeight) * (i / scrollSteps);
    await page.evaluate((pos) => window.scrollTo(0, pos), scrollPosition);
    await page.waitForTimeout(500);

    console.log(`Scroll position: ${scrollPosition}px (${Math.round((i / scrollSteps) * 100)}%)`);

    // Capture state at this scroll position
    const elementStates = await page.evaluate((position) => {
      const elements = Array.from(document.querySelectorAll('[class*="fade"], [class*="slide"], [class*="animate"], [data-scroll], [data-aos]'));

      return elements.map(el => {
        const rect = el.getBoundingClientRect();
        const styles = window.getComputedStyle(el);
        const className = typeof el.className === 'string' ? el.className : '';

        return {
          selector: className || el.tagName,
          scrollPosition: position,
          inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
          distanceFromTop: rect.top,
          styles: {
            opacity: styles.opacity,
            transform: styles.transform,
            visibility: styles.visibility
          }
        };
      });
    }, scrollPosition);

    if (elementStates.length > 0) {
      analysis.scrollAnimations.push({
        scrollPosition,
        percentage: Math.round((i / scrollSteps) * 100),
        elements: elementStates
      });
    }
  }

  console.log('\n=== ANALYZING FOOTER ===');

  // Scroll to bottom for footer analysis
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  const footerData = await page.evaluate(() => {
    const footer = document.querySelector('footer') || document.querySelector('[class*="footer"]');
    if (!footer) return null;

    const footerStyles = window.getComputedStyle(footer);
    const sections = Array.from(footer.querySelectorAll('div[class*="column"], div[class*="section"], div[class*="col"]'));

    const links = Array.from(footer.querySelectorAll('a'));
    const socialLinks = links.filter(link =>
      link.className.match(/(social|facebook|twitter|linkedin|instagram)/i) ||
      link.href.match(/(facebook|twitter|linkedin|instagram|youtube)/i)
    );

    return {
      exists: true,
      tagName: footer.tagName,
      className: footer.className,
      height: footer.offsetHeight,
      styles: {
        backgroundColor: footerStyles.backgroundColor,
        color: footerStyles.color,
        padding: footerStyles.padding,
        display: footerStyles.display,
        gridTemplateColumns: footerStyles.gridTemplateColumns,
        gap: footerStyles.gap
      },
      sections: sections.map(section => ({
        className: section.className,
        html: section.innerHTML.substring(0, 200),
        textContent: section.textContent.trim().substring(0, 100),
        linkCount: section.querySelectorAll('a').length
      })),
      links: links.map(link => ({
        text: link.textContent.trim(),
        href: link.href,
        className: link.className
      })),
      socialLinks: socialLinks.map(link => ({
        platform: link.href.match(/(facebook|twitter|linkedin|instagram|youtube)/i)?.[0] || 'unknown',
        href: link.href,
        className: link.className
      }))
    };
  });

  analysis.footer = footerData;
  console.log('Footer analysis complete:', JSON.stringify(footerData, null, 2));

  // Take footer screenshot
  await page.screenshot({ path: 'docs/old-site-footer.png', fullPage: false });
  console.log('Footer screenshot saved to docs/old-site-footer.png');

  // Get full page screenshot
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/old-site-full.png', fullPage: true });
  console.log('Full page screenshot saved to docs/old-site-full.png');

  // Get page source for additional analysis
  const htmlContent = await page.content();

  // Check for animation libraries
  const animationLibraries = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const libraries = {
      gsap: scripts.some(s => s.src.includes('gsap')),
      scrollTrigger: scripts.some(s => s.src.includes('ScrollTrigger')),
      aos: scripts.some(s => s.src.includes('aos')),
      framerMotion: scripts.some(s => s.src.includes('framer')),
      locomotive: scripts.some(s => s.src.includes('locomotive')),
      barba: scripts.some(s => s.src.includes('barba'))
    };

    return {
      detected: libraries,
      scriptSources: scripts.map(s => s.src).filter(src =>
        src.includes('gsap') ||
        src.includes('scroll') ||
        src.includes('animate') ||
        src.includes('aos')
      )
    };
  });

  analysis.animationLibraries = animationLibraries;
  console.log('\n=== ANIMATION LIBRARIES DETECTED ===');
  console.log(JSON.stringify(animationLibraries, null, 2));

  // Save analysis to file
  const reportPath = path.join(__dirname, '..', 'docs', 'OLD_SITE_ANALYSIS.json');
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
  console.log(`\nFull analysis saved to ${reportPath}`);

  await browser.close();

  return analysis;
}

analyzeDisruptorsMediaSite()
  .then(() => {
    console.log('\n=== ANALYSIS COMPLETE ===');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during analysis:', error);
    process.exit(1);
  });
