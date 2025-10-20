import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Example blog posts known for excellent formatting
const blogExamples = [
  {
    name: 'medium',
    url: 'https://medium.com/@andreineagoie/the-best-ai-tools-for-programmers-in-2025-32629e52dc22',
    description: 'Medium article example'
  },
  {
    name: 'hubspot',
    url: 'https://blog.hubspot.com/marketing/chatgpt-for-marketing',
    description: 'HubSpot marketing blog'
  },
  {
    name: 'buffer',
    url: 'https://buffer.com/resources/social-media-strategy/',
    description: 'Buffer resources blog'
  },
  {
    name: 'neil-patel',
    url: 'https://neilpatel.com/blog/seo-marketing/',
    description: 'Neil Patel blog'
  },
  {
    name: 'smashing-magazine',
    url: 'https://www.smashingmagazine.com/2025/01/accessible-front-end-components-2025-part-1/',
    description: 'Smashing Magazine article'
  }
];

async function captureScreenshots() {
  console.log('🚀 Starting blog examples screenshot capture...\n');

  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const outputDir = path.join(__dirname, 'blog-examples-screenshots');

  for (const example of blogExamples) {
    console.log(`📸 Capturing: ${example.description}`);
    console.log(`   URL: ${example.url}`);

    try {
      const page = await context.newPage();

      // Navigate to page
      await page.goto(example.url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for content to load
      await page.waitForTimeout(2000);

      // Take full page screenshot with JPEG compression
      const fullPath = path.join(outputDir, `${example.name}-full.jpg`);
      await page.screenshot({
        path: fullPath,
        fullPage: true,
        type: 'jpeg',
        quality: 75
      });
      console.log(`   ✅ Full page saved: ${fullPath}`);

      // Take viewport screenshot (above fold) with JPEG compression
      const viewportPath = path.join(outputDir, `${example.name}-viewport.jpg`);
      await page.screenshot({
        path: viewportPath,
        fullPage: false,
        type: 'jpeg',
        quality: 75
      });
      console.log(`   ✅ Viewport saved: ${viewportPath}`);

      // Take article content screenshot (try to find main article container)
      try {
        const articleSelector = 'article, main, .post-content, .article-content, .blog-post, [role="main"]';
        const articleElement = await page.locator(articleSelector).first();

        if (await articleElement.count() > 0) {
          const articlePath = path.join(outputDir, `${example.name}-article.jpg`);
          await articleElement.screenshot({
            path: articlePath,
            type: 'jpeg',
            quality: 75
          });
          console.log(`   ✅ Article content saved: ${articlePath}`);
        }
      } catch (err) {
        console.log(`   ⚠️  Could not capture article section separately`);
      }

      await page.close();
      console.log('');
    } catch (error) {
      console.error(`   ❌ Error capturing ${example.name}: ${error.message}\n`);
    }
  }

  await browser.close();
  console.log('✅ Screenshot capture complete!');
}

captureScreenshots().catch(console.error);
