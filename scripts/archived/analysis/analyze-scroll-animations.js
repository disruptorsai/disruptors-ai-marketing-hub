import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ScrollAnimationAnalyzer {
  constructor() {
    this.analysis = {
      url: 'https://info.disruptorsmedia.com',
      timestamp: new Date().toISOString(),
      animations: [],
      libraries: [],
      performance: {},
      scrollTriggers: [],
      technicalDetails: {},
      recommendations: []
    };
  }

  async analyze() {
    const browser = await chromium.launch({
      headless: false, // Keep visible to observe animations
      slowMo: 100
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1
    });

    const page = await context.newPage();

    // Enable performance monitoring
    await context.tracing.start({ screenshots: true, snapshots: true });

    try {
      console.log('🌐 Loading website...');
      await page.goto(this.analysis.url, { waitUntil: 'networkidle' });

      // Wait for potential lazy-loaded content
      await page.waitForTimeout(3000);

      // Analyze libraries and dependencies
      await this.analyzeLibraries(page);

      // Analyze CSS animations
      await this.analyzeCSSAnimations(page);

      // Analyze JavaScript animations
      await this.analyzeJSAnimations(page);

      // Analyze scroll triggers
      await this.analyzeScrollTriggers(page);

      // Performance analysis
      await this.analyzePerformance(page);

      // Analyze animation implementation details
      await this.analyzeImplementationDetails(page);

      // Test scroll behavior
      await this.testScrollBehaviors(page);

    } catch (error) {
      console.error('Analysis error:', error);
      this.analysis.errors = this.analysis.errors || [];
      this.analysis.errors.push(error.message);
    } finally {
      await context.tracing.stop({ path: 'scroll-analysis-trace.zip' });
      await browser.close();
    }

    return this.analysis;
  }

  async analyzeLibraries(page) {
    console.log('🔍 Analyzing animation libraries...');

    const libraries = await page.evaluate(() => {
      const detected = [];

      // Check for common animation libraries
      const checks = [
        { name: 'GSAP', check: () => window.gsap || window.GreenSockGlobals },
        { name: 'ScrollMagic', check: () => window.ScrollMagic },
        { name: 'AOS', check: () => window.AOS },
        { name: 'Lottie', check: () => window.lottie || document.querySelector('[data-lottie]') },
        { name: 'Framer Motion', check: () => document.querySelector('[data-framer-motion]') },
        { name: 'Intersection Observer', check: () => window.IntersectionObserver },
        { name: 'CSS Animations', check: () => {
          const styles = Array.from(document.styleSheets);
          return styles.some(sheet => {
            try {
              const rules = Array.from(sheet.cssRules || []);
              return rules.some(rule =>
                rule.type === CSSRule.KEYFRAMES_RULE ||
                (rule.style && (rule.style.animation || rule.style.transform))
              );
            } catch (e) { return false; }
          });
        }}
      ];

      checks.forEach(({ name, check }) => {
        try {
          if (check()) {
            detected.push({
              name,
              detected: true,
              version: this.getLibraryVersion(name)
            });
          }
        } catch (e) {
          // Library not found
        }
      });

      return detected;
    });

    this.analysis.libraries = libraries;
  }

  async analyzeCSSAnimations(page) {
    console.log('🎨 Analyzing CSS animations...');

    const cssAnimations = await page.evaluate(() => {
      const animations = [];
      const elements = document.querySelectorAll('*');

      elements.forEach((element, index) => {
        const computedStyle = window.getComputedStyle(element);
        const animationName = computedStyle.animationName;
        const transitionProperty = computedStyle.transitionProperty;

        if (animationName && animationName !== 'none') {
          animations.push({
            type: 'keyframe',
            element: element.tagName.toLowerCase() + (element.className ? '.' + element.className.split(' ').join('.') : ''),
            animationName,
            duration: computedStyle.animationDuration,
            timingFunction: computedStyle.animationTimingFunction,
            delay: computedStyle.animationDelay,
            iterationCount: computedStyle.animationIterationCount,
            direction: computedStyle.animationDirection,
            fillMode: computedStyle.animationFillMode
          });
        }

        if (transitionProperty && transitionProperty !== 'none') {
          animations.push({
            type: 'transition',
            element: element.tagName.toLowerCase() + (element.className ? '.' + element.className.split(' ').join('.') : ''),
            property: transitionProperty,
            duration: computedStyle.transitionDuration,
            timingFunction: computedStyle.transitionTimingFunction,
            delay: computedStyle.transitionDelay
          });
        }
      });

      return animations;
    });

    this.analysis.animations.push(...cssAnimations);
  }

  async analyzeJSAnimations(page) {
    console.log('⚡ Analyzing JavaScript animations...');

    // Inject monitoring script
    await page.addInitScript(() => {
      window.animationEvents = [];

      // Monitor GSAP if present
      if (window.gsap) {
        const originalTo = window.gsap.to;
        const originalFrom = window.gsap.from;
        const originalFromTo = window.gsap.fromTo;

        window.gsap.to = function(target, vars) {
          window.animationEvents.push({
            type: 'gsap.to',
            target: typeof target === 'string' ? target : target.constructor.name,
            duration: vars.duration,
            ease: vars.ease,
            properties: Object.keys(vars).filter(key => !['duration', 'ease', 'delay'].includes(key)),
            timestamp: Date.now()
          });
          return originalTo.call(this, target, vars);
        };

        window.gsap.from = function(target, vars) {
          window.animationEvents.push({
            type: 'gsap.from',
            target: typeof target === 'string' ? target : target.constructor.name,
            duration: vars.duration,
            ease: vars.ease,
            properties: Object.keys(vars).filter(key => !['duration', 'ease', 'delay'].includes(key)),
            timestamp: Date.now()
          });
          return originalFrom.call(this, target, vars);
        };
      }

      // Monitor scroll events
      let scrollEvents = [];
      window.addEventListener('scroll', (e) => {
        scrollEvents.push({
          timestamp: Date.now(),
          scrollY: window.scrollY,
          scrollX: window.scrollX
        });
      });
      window.scrollEvents = scrollEvents;
    });

    // Trigger animations by scrolling
    await this.simulateScrolling(page);

    // Get captured animation data
    const jsAnimations = await page.evaluate(() => {
      return {
        animationEvents: window.animationEvents || [],
        scrollEvents: window.scrollEvents || []
      };
    });

    this.analysis.animations.push(...jsAnimations.animationEvents);
    this.analysis.scrollEvents = jsAnimations.scrollEvents;
  }

  async analyzeScrollTriggers(page) {
    console.log('📍 Analyzing scroll triggers...');

    const scrollTriggers = await page.evaluate(() => {
      const triggers = [];
      const elements = document.querySelectorAll('*');

      elements.forEach(element => {
        // Check for data attributes that suggest scroll triggers
        const attrs = element.attributes;
        const scrollRelated = [];

        for (let attr of attrs) {
          if (attr.name.includes('scroll') ||
              attr.name.includes('trigger') ||
              attr.name.includes('animate') ||
              attr.name.includes('aos') ||
              attr.name.includes('fade') ||
              attr.name.includes('slide')) {
            scrollRelated.push({ name: attr.name, value: attr.value });
          }
        }

        if (scrollRelated.length > 0) {
          const rect = element.getBoundingClientRect();
          triggers.push({
            element: element.tagName.toLowerCase() + (element.className ? '.' + element.className.split(' ').slice(0, 2).join('.') : ''),
            attributes: scrollRelated,
            position: {
              top: rect.top + window.scrollY,
              left: rect.left + window.scrollX,
              width: rect.width,
              height: rect.height
            }
          });
        }
      });

      return triggers;
    });

    this.analysis.scrollTriggers = scrollTriggers;
  }

  async analyzePerformance(page) {
    console.log('📊 Analyzing performance characteristics...');

    // Start performance monitoring
    await page.evaluate(() => {
      window.performanceData = {
        frameRates: [],
        scrollPerformance: [],
        animationPerformance: []
      };

      // Monitor frame rate
      let lastTime = performance.now();
      let frameCount = 0;

      function measureFPS() {
        const now = performance.now();
        frameCount++;

        if (now - lastTime >= 1000) {
          window.performanceData.frameRates.push({
            fps: Math.round((frameCount * 1000) / (now - lastTime)),
            timestamp: now
          });
          frameCount = 0;
          lastTime = now;
        }

        requestAnimationFrame(measureFPS);
      }
      measureFPS();

      // Monitor scroll performance
      let scrollStartTime;
      window.addEventListener('scroll', () => {
        if (!scrollStartTime) {
          scrollStartTime = performance.now();
        }

        setTimeout(() => {
          const scrollEndTime = performance.now();
          window.performanceData.scrollPerformance.push({
            duration: scrollEndTime - scrollStartTime,
            scrollY: window.scrollY
          });
          scrollStartTime = null;
        }, 16); // Wait one frame
      });
    });

    // Perform scroll test
    await this.simulateScrolling(page);
    await page.waitForTimeout(2000); // Let performance data collect

    // Get performance data
    const performanceData = await page.evaluate(() => window.performanceData);
    this.analysis.performance = performanceData;
  }

  async analyzeImplementationDetails(page) {
    console.log('🔧 Analyzing implementation details...');

    const implementationDetails = await page.evaluate(() => {
      const details = {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio
        },
        styles: [],
        scripts: [],
        animationClasses: []
      };

      // Get relevant stylesheets
      Array.from(document.styleSheets).forEach((sheet, index) => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          const animationRules = rules.filter(rule => {
            if (rule.type === CSSRule.KEYFRAMES_RULE) return true;
            if (rule.style && (
              rule.style.animation ||
              rule.style.transform ||
              rule.style.transition ||
              rule.style.opacity
            )) return true;
            return false;
          });

          if (animationRules.length > 0) {
            details.styles.push({
              index,
              href: sheet.href,
              animationRules: animationRules.length,
              rules: animationRules.map(rule => ({
                type: rule.type,
                selectorText: rule.selectorText,
                cssText: rule.cssText.substring(0, 200) + '...'
              }))
            });
          }
        } catch (e) {
          // Cross-origin stylesheet
        }
      });

      // Get script sources
      Array.from(document.scripts).forEach(script => {
        if (script.src && (
          script.src.includes('gsap') ||
          script.src.includes('scroll') ||
          script.src.includes('animate') ||
          script.src.includes('motion')
        )) {
          details.scripts.push({
            src: script.src,
            async: script.async,
            defer: script.defer
          });
        }
      });

      // Find elements with animation classes
      const elements = document.querySelectorAll('*');
      const animationClasses = new Set();

      elements.forEach(element => {
        const classes = element.className.split(' ');
        classes.forEach(cls => {
          if (cls && (
            cls.includes('animate') ||
            cls.includes('fade') ||
            cls.includes('slide') ||
            cls.includes('scroll') ||
            cls.includes('aos') ||
            cls.includes('gsap')
          )) {
            animationClasses.add(cls);
          }
        });
      });

      details.animationClasses = Array.from(animationClasses);

      return details;
    });

    this.analysis.technicalDetails = implementationDetails;
  }

  async simulateScrolling(page) {
    console.log('📜 Simulating scroll behavior...');

    // Get page height
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    // Scroll incrementally to trigger animations
    const scrollSteps = Math.min(10, Math.floor(pageHeight / viewportHeight));

    for (let i = 0; i <= scrollSteps; i++) {
      const scrollPosition = (pageHeight / scrollSteps) * i;
      await page.evaluate((pos) => window.scrollTo(0, pos), scrollPosition);
      await page.waitForTimeout(500); // Wait for animations to trigger
    }

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
  }

  async testScrollBehaviors(page) {
    console.log('🧪 Testing scroll behaviors...');

    const scrollBehaviors = await page.evaluate(() => {
      const behaviors = [];

      // Test smooth scrolling
      const originalScrollTo = window.scrollTo;
      let smoothScrollDetected = false;

      window.scrollTo = function(x, y) {
        if (arguments.length > 2 || (typeof arguments[0] === 'object' && arguments[0].behavior === 'smooth')) {
          smoothScrollDetected = true;
        }
        return originalScrollTo.apply(this, arguments);
      };

      // Test for scroll-behavior CSS
      const htmlStyle = window.getComputedStyle(document.documentElement);
      const bodyStyle = window.getComputedStyle(document.body);

      behaviors.push({
        type: 'css-scroll-behavior',
        html: htmlStyle.scrollBehavior,
        body: bodyStyle.scrollBehavior
      });

      // Check for custom scroll implementations
      const hasCustomScroll = document.querySelector('[data-scroll]') ||
                             document.querySelector('.smooth-scroll') ||
                             document.querySelector('[data-locomotive-scroll]');

      behaviors.push({
        type: 'custom-scroll-detected',
        detected: !!hasCustomScroll
      });

      return behaviors;
    });

    this.analysis.scrollBehaviors = scrollBehaviors;
  }

  generateRecommendations() {
    const recommendations = [];

    // Library recommendations
    if (this.analysis.libraries.find(lib => lib.name === 'GSAP')) {
      recommendations.push({
        category: 'Implementation',
        priority: 'High',
        recommendation: 'Use GSAP with ScrollTrigger plugin for smooth scroll-based animations',
        rationale: 'GSAP detected on target site - provides excellent performance and control'
      });
    }

    // Performance recommendations
    if (this.analysis.performance.frameRates?.some(fps => fps.fps < 60)) {
      recommendations.push({
        category: 'Performance',
        priority: 'Medium',
        recommendation: 'Implement will-change CSS property and transform3d() for hardware acceleration',
        rationale: 'Frame rate drops detected during scroll animations'
      });
    }

    // React/Vite specific recommendations
    recommendations.push({
      category: 'React Integration',
      priority: 'High',
      recommendation: 'Use useGSAP hook for GSAP animations in React components',
      rationale: 'Ensures proper cleanup and prevents memory leaks in React'
    });

    recommendations.push({
      category: 'React Integration',
      priority: 'Medium',
      recommendation: 'Combine GSAP ScrollTrigger with Framer Motion for complex interactions',
      rationale: 'Leverage GSAP for scroll-triggered animations and Framer Motion for component-level animations'
    });

    this.analysis.recommendations = recommendations;
  }
}

// Main execution
async function runAnalysis() {
  console.log('🚀 Starting scroll animation analysis...');

  const analyzer = new ScrollAnimationAnalyzer();
  const results = await analyzer.analyze();
  analyzer.generateRecommendations();

  // Save results
  const outputPath = path.join(__dirname, '..', 'generated', `scroll-animation-analysis-${new Date().toISOString().split('T')[0]}.json`);

  // Ensure directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log('✅ Analysis complete!');
  console.log(`📁 Results saved to: ${outputPath}`);

  // Print summary
  console.log('\n📊 ANALYSIS SUMMARY:');
  console.log(`📚 Libraries detected: ${results.libraries.length}`);
  console.log(`🎨 Animations found: ${results.animations.length}`);
  console.log(`📍 Scroll triggers: ${results.scrollTriggers.length}`);
  console.log(`💡 Recommendations: ${results.recommendations.length}`);

  return results;
}

// Export for use as module or run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAnalysis().catch(console.error);
}

export { ScrollAnimationAnalyzer, runAnalysis };