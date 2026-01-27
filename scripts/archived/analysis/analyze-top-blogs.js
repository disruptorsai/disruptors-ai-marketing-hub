import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

/**
 * Analyze top marketing blog sites for formatting best practices
 * Captures screenshots and extracts design patterns
 */

const BLOG_URLS = [
  {
    name: 'HubSpot',
    url: 'https://blog.hubspot.com/marketing/examples-of-blog-posts',
    category: 'Marketing Authority'
  },
  {
    name: 'Neil Patel',
    url: 'https://neilpatel.com/blog/content-marketing-made-easy/',
    category: 'SEO/Marketing'
  },
  {
    name: 'Backlinko',
    url: 'https://backlinko.com/seo-techniques',
    category: 'SEO'
  },
  {
    name: 'Content Marketing Institute',
    url: 'https://contentmarketinginstitute.com/articles/content-marketing-strategy-examples/',
    category: 'Content Marketing'
  },
  {
    name: 'Moz',
    url: 'https://moz.com/blog/seo-strategy',
    category: 'SEO'
  },
  {
    name: 'Ahrefs',
    url: 'https://ahrefs.com/blog/seo-basics/',
    category: 'SEO'
  }
];

async function analyzeBlogSite(browser, blogSite) {
  console.log(`\n📸 Analyzing ${blogSite.name}...`);

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  try {
    // Navigate to the blog post
    await page.goto(blogSite.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000); // Allow dynamic content to load

    // Take full page screenshot
    const screenshotDir = path.join(process.cwd(), 'temp', 'blog-analysis-screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const screenshotPath = path.join(screenshotDir, `${blogSite.name.toLowerCase().replace(/\s+/g, '-')}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`   ✓ Screenshot saved: ${screenshotPath}`);

    // Extract design patterns
    const analysis = await page.evaluate(() => {
      // Find the main article content
      const article = document.querySelector('article') ||
                     document.querySelector('[role="main"]') ||
                     document.querySelector('.post-content') ||
                     document.querySelector('.article-content') ||
                     document.querySelector('main');

      if (!article) return null;

      // Get computed styles of article container
      const articleStyles = window.getComputedStyle(article);

      // Find paragraphs
      const paragraphs = Array.from(article.querySelectorAll('p'));
      const firstParagraph = paragraphs[0];
      const pStyles = firstParagraph ? window.getComputedStyle(firstParagraph) : null;

      // Find headings
      const h1 = article.querySelector('h1');
      const h2 = article.querySelector('h2');
      const h3 = article.querySelector('h3');

      const h1Styles = h1 ? window.getComputedStyle(h1) : null;
      const h2Styles = h2 ? window.getComputedStyle(h2) : null;
      const h3Styles = h3 ? window.getComputedStyle(h3) : null;

      // Find lists
      const lists = article.querySelectorAll('ul, ol');
      const firstList = lists[0];
      const listStyles = firstList ? window.getComputedStyle(firstList) : null;

      // Check for special elements
      const hasCalloutBoxes = article.querySelectorAll('.callout, .highlight, .note, [class*="box"]').length > 0;
      const hasTableOfContents = !!document.querySelector('.toc, .table-of-contents, [class*="toc"]');
      const hasImages = article.querySelectorAll('img').length;
      const hasCodeBlocks = article.querySelectorAll('pre, code').length;

      return {
        // Container
        maxWidth: articleStyles.maxWidth,
        padding: articleStyles.padding,
        backgroundColor: articleStyles.backgroundColor,

        // Typography
        paragraph: pStyles ? {
          fontSize: pStyles.fontSize,
          lineHeight: pStyles.lineHeight,
          marginBottom: pStyles.marginBottom,
          color: pStyles.color,
          fontFamily: pStyles.fontFamily
        } : null,

        // Headings
        h1: h1Styles ? {
          fontSize: h1Styles.fontSize,
          lineHeight: h1Styles.lineHeight,
          marginTop: h1Styles.marginTop,
          marginBottom: h1Styles.marginBottom,
          fontWeight: h1Styles.fontWeight,
          color: h1Styles.color
        } : null,

        h2: h2Styles ? {
          fontSize: h2Styles.fontSize,
          lineHeight: h2Styles.lineHeight,
          marginTop: h2Styles.marginTop,
          marginBottom: h2Styles.marginBottom,
          fontWeight: h2Styles.fontWeight,
          color: h2Styles.color
        } : null,

        h3: h3Styles ? {
          fontSize: h3Styles.fontSize,
          lineHeight: h3Styles.lineHeight,
          marginTop: h3Styles.marginTop,
          marginBottom: h3Styles.marginBottom,
          fontWeight: h3Styles.fontWeight,
          color: h3Styles.color
        } : null,

        // Lists
        list: listStyles ? {
          marginLeft: listStyles.marginLeft,
          marginBottom: listStyles.marginBottom,
          paddingLeft: listStyles.paddingLeft
        } : null,

        // Special elements
        features: {
          hasCalloutBoxes,
          hasTableOfContents,
          hasImages,
          hasCodeBlocks,
          paragraphCount: paragraphs.length,
          headingCount: {
            h1: article.querySelectorAll('h1').length,
            h2: article.querySelectorAll('h2').length,
            h3: article.querySelectorAll('h3').length
          }
        }
      };
    });

    console.log(`   ✓ Design analysis complete`);
    return { success: true, analysis };

  } catch (error) {
    console.error(`   ✗ Error analyzing ${blogSite.name}:`, error.message);
    return { success: false, error: error.message };
  } finally {
    await context.close();
  }
}

async function main() {
  console.log('🚀 Starting blog analysis...\n');
  console.log('📋 Analyzing top marketing blogs for design patterns\n');

  const browser = await chromium.launch({ headless: true });
  const results = {};

  for (const blogSite of BLOG_URLS) {
    const result = await analyzeBlogSite(browser, blogSite);
    results[blogSite.name] = {
      ...blogSite,
      ...result
    };
  }

  await browser.close();

  // Save results to JSON
  const resultsPath = path.join(process.cwd(), 'temp', 'blog-analysis-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n\n✅ Analysis complete!`);
  console.log(`📊 Results saved to: ${resultsPath}`);
  console.log(`📸 Screenshots saved to: temp/blog-analysis-screenshots/`);

  // Generate summary report
  console.log('\n\n📋 SUMMARY OF FINDINGS:');
  console.log('=' .repeat(60));

  Object.entries(results).forEach(([name, data]) => {
    if (data.success && data.analysis) {
      console.log(`\n${name} (${data.category}):`);
      console.log(`  Container Max Width: ${data.analysis.maxWidth}`);

      if (data.analysis.paragraph) {
        console.log(`  Paragraph Font Size: ${data.analysis.paragraph.fontSize}`);
        console.log(`  Line Height: ${data.analysis.paragraph.lineHeight}`);
        console.log(`  Paragraph Spacing: ${data.analysis.paragraph.marginBottom}`);
      }

      if (data.analysis.h2) {
        console.log(`  H2 Font Size: ${data.analysis.h2.fontSize}`);
        console.log(`  H2 Margin Top: ${data.analysis.h2.marginTop}`);
      }

      if (data.analysis.features) {
        console.log(`  Features:`);
        console.log(`    - Callout Boxes: ${data.analysis.features.hasCalloutBoxes ? 'Yes' : 'No'}`);
        console.log(`    - Table of Contents: ${data.analysis.features.hasTableOfContents ? 'Yes' : 'No'}`);
        console.log(`    - Images: ${data.analysis.features.hasImages}`);
        console.log(`    - H2 Sections: ${data.analysis.features.headingCount?.h2 || 0}`);
      }
    } else {
      console.log(`\n${name}: Analysis failed - ${data.error}`);
    }
  });
}

main().catch(console.error);
