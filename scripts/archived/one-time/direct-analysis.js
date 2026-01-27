import { chromium } from 'playwright';

async function quickAnalysis() {
  console.log('🚀 Quick analysis starting...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Loading page...');
    await page.goto('https://info.disruptorsmedia.com', { waitUntil: 'networkidle', timeout: 30000 });

    console.log('Page loaded, analyzing...');

    const basicInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyHTML: document.body ? document.body.innerHTML.substring(0, 1000) : 'No body',
        scripts: Array.from(document.scripts).map(s => s.src).filter(Boolean)
      };
    });

    console.log('Basic Info:', basicInfo);

    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

quickAnalysis();