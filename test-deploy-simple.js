import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Testing Production URL...');
  await page.goto('https://disruptors-ai-marketing-hub.netlify.app');
  const title = await page.title();
  console.log('Title:', title);
  
  const h1 = await page.locator('h1').first().textContent().catch(() => 'Not found');
  console.log('H1:', h1);
  
  await browser.close();
}

test();