/**
 * Deployment Diagnostic Test Script
 *
 * Tests the live deployment comprehensively to identify issues
 */

import fetch from 'node-fetch';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const LIVE_URL = 'https://dm4.wjwelsh.com';
const NETLIFY_URL = 'https://master--cheerful-custard-2e6fc5.netlify.app';

async function testDeployment() {
  console.log('='.repeat(80));
  console.log('DEPLOYMENT DIAGNOSTICS REPORT');
  console.log('='.repeat(80));
  console.log('');

  // Test 1: Check primary domain
  console.log('1. Testing Primary Domain:', LIVE_URL);
  console.log('-'.repeat(80));

  try {
    const response = await fetch(LIVE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log('Status:', response.status, response.statusText);
    console.log('Content-Type:', response.headers.get('content-type'));
    console.log('Content-Length:', response.headers.get('content-length'));
    console.log('Server:', response.headers.get('server'));
    console.log('Cache-Status:', response.headers.get('cache-status'));

    const html = await response.text();
    console.log('HTML Length:', html.length);
    console.log('Contains <div id="root">:', html.includes('<div id="root">'));
    console.log('Contains script tag:', html.includes('<script type="module"'));

    // Extract script URLs
    const scriptMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (scriptMatch) {
      console.log('Main script:', scriptMatch[1]);

      // Test script loading
      const scriptUrl = LIVE_URL + scriptMatch[1];
      const scriptRes = await fetch(scriptUrl);
      console.log('Script status:', scriptRes.status);
      console.log('Script size:', scriptRes.headers.get('content-length'));

      const scriptContent = await scriptRes.text();
      console.log('Script contains React:', scriptContent.includes('React'));
      console.log('Script contains error:', scriptContent.toLowerCase().includes('error'));
    }

    console.log('');

  } catch (error) {
    console.error('ERROR testing primary domain:', error.message);
  }

  // Test 2: Check Netlify subdomain
  console.log('2. Testing Netlify Subdomain:', NETLIFY_URL);
  console.log('-'.repeat(80));

  try {
    const response = await fetch(NETLIFY_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log('Status:', response.status, response.statusText);
    console.log('Content-Type:', response.headers.get('content-type'));
    console.log('Server:', response.headers.get('server'));

    const html = await response.text();
    console.log('HTML Length:', html.length);
    console.log('Same as primary domain:', html.length);

    console.log('');

  } catch (error) {
    console.error('ERROR testing Netlify subdomain:', error.message);
  }

  // Test 3: Check specific assets
  console.log('3. Testing Asset Loading');
  console.log('-'.repeat(80));

  const assetsToTest = [
    '/favicon.svg',
    '/assets/vendor-react-DZrYvFpI.css',
  ];

  for (const asset of assetsToTest) {
    try {
      const url = LIVE_URL + asset;
      const response = await fetch(url);
      console.log(`${asset}: ${response.status} (${response.headers.get('content-length')} bytes)`);
    } catch (error) {
      console.log(`${asset}: ERROR - ${error.message}`);
    }
  }

  console.log('');

  // Test 4: Check redirects
  console.log('4. Testing SPA Routing');
  console.log('-'.repeat(80));

  const routesToTest = [
    '/',
    '/work',
    '/about',
    '/solutions',
    '/nonexistent-page'
  ];

  for (const route of routesToTest) {
    try {
      const url = LIVE_URL + route;
      const response = await fetch(url, { redirect: 'manual' });
      console.log(`${route}: ${response.status} ${response.statusText}`);
      if (response.status === 301 || response.status === 302) {
        console.log(`  → Redirects to: ${response.headers.get('location')}`);
      }
    } catch (error) {
      console.log(`${route}: ERROR - ${error.message}`);
    }
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('DIAGNOSIS COMPLETE');
  console.log('='.repeat(80));
  console.log('');
  console.log('ANALYSIS:');
  console.log('If all tests pass but site appears blank:');
  console.log('  - Check browser console for JavaScript errors');
  console.log('  - Check network tab for failed asset requests');
  console.log('  - Check if environment variables are set in Netlify');
  console.log('  - Verify Supabase connection (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
  console.log('');
  console.log('If assets fail to load:');
  console.log('  - Check Netlify build logs for build failures');
  console.log('  - Verify build command: npm run build');
  console.log('  - Verify publish directory: dist');
  console.log('');
  console.log('If redirects are broken:');
  console.log('  - Check _redirects file in dist/');
  console.log('  - Verify netlify.toml redirect configuration');
  console.log('');
}

testDeployment().catch(console.error);
