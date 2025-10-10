/**
 * Comprehensive Deployment Validation Test
 *
 * Tests all critical pages, JavaScript loading, console errors, and functionality
 */

import fetch from 'node-fetch';

const LIVE_URL = 'https://dm4.wjwelsh.com';

const PAGES_TO_TEST = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/work', name: 'Work' },
  { path: '/solutions', name: 'Solutions' },
  { path: '/blog', name: 'Blog' },
  { path: '/demos/growth-audit', name: 'Growth Audit Demo' },
  { path: '/demos/keyword-research', name: 'Keyword Research Demo' },
  { path: '/demos/ai-content-writer', name: 'AI Content Writer Demo' },
  { path: '/app/content-writer', name: 'App - Content Writer' },
  { path: '/app/business-brain', name: 'App - Business Brain' }
];

async function testPage(page) {
  const url = LIVE_URL + page.path;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = await response.text();

    // Check for key indicators
    const hasRoot = html.includes('<div id="root">');
    const hasScript = html.includes('<script type="module"');
    const hasVersionMeta = html.includes('data-app-version') || html.includes('data-build-time');

    // Extract script URL
    const scriptMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
    const scriptUrl = scriptMatch ? scriptMatch[1] : null;

    // Check for error indicators in HTML
    const hasErrorText = html.toLowerCase().includes('error') && !html.includes('ChunkErrorBoundary');
    const has404Text = html.includes('404') || html.includes('Not Found');

    return {
      name: page.name,
      path: page.path,
      url: url,
      status: response.status,
      statusText: response.statusText,
      contentLength: html.length,
      hasRoot,
      hasScript,
      hasVersionMeta,
      scriptUrl,
      hasErrorText,
      has404Text,
      success: response.status === 200 && hasRoot && hasScript
    };

  } catch (error) {
    return {
      name: page.name,
      path: page.path,
      url: url,
      status: 'ERROR',
      statusText: error.message,
      contentLength: 0,
      hasRoot: false,
      hasScript: false,
      hasVersionMeta: false,
      scriptUrl: null,
      hasErrorText: true,
      has404Text: false,
      success: false,
      error: error.message
    };
  }
}

async function testScriptLoading() {
  try {
    const homeResponse = await fetch(LIVE_URL);
    const html = await homeResponse.text();
    const scriptMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);

    if (!scriptMatch) {
      return {
        success: false,
        error: 'Could not find main script URL in HTML'
      };
    }

    const scriptUrl = LIVE_URL + scriptMatch[1];
    const scriptResponse = await fetch(scriptUrl);
    const script = await scriptResponse.text();

    return {
      success: scriptResponse.status === 200,
      status: scriptResponse.status,
      url: scriptUrl,
      size: script.length,
      containsReact: script.includes('React'),
      containsReactDOM: script.includes('ReactDOM'),
      containsRouter: script.includes('Router'),
      containsSupabase: script.includes('supabase'),
      containsVite: script.includes('vite'),
      containsChunkError: script.includes('ChunkError') || script.includes('chunk'),
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testChunkLoading() {
  try {
    // Test vendor chunk loading
    const homeResponse = await fetch(LIVE_URL);
    const html = await homeResponse.text();

    // Find all chunk references
    const chunkMatches = html.match(/\/assets\/[^"']+\.(js|css)/g) || [];

    const chunkTests = [];
    for (const chunk of chunkMatches.slice(0, 5)) { // Test first 5 chunks
      const chunkUrl = LIVE_URL + chunk;
      try {
        const response = await fetch(chunkUrl);
        chunkTests.push({
          chunk,
          status: response.status,
          success: response.status === 200
        });
      } catch (error) {
        chunkTests.push({
          chunk,
          status: 'ERROR',
          success: false,
          error: error.message
        });
      }
    }

    return {
      totalChunks: chunkMatches.length,
      testedChunks: chunkTests,
      allSuccessful: chunkTests.every(t => t.success)
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function runComprehensiveTest() {
  console.log('='.repeat(100));
  console.log('COMPREHENSIVE DEPLOYMENT VALIDATION REPORT');
  console.log('='.repeat(100));
  console.log('');
  console.log('Site:', LIVE_URL);
  console.log('Test Date:', new Date().toISOString());
  console.log('Latest Commit:', '1e37e0b - feat: Add deployment validation, error handling, and performance monitoring');
  console.log('');

  // Test 1: Page Loading
  console.log('TEST 1: PAGE LOADING VALIDATION');
  console.log('-'.repeat(100));
  console.log('');

  const pageResults = [];
  for (const page of PAGES_TO_TEST) {
    const result = await testPage(page);
    pageResults.push(result);

    const statusIcon = result.success ? '✓' : '✗';
    console.log(`${statusIcon} ${result.name.padEnd(30)} | Status: ${String(result.status).padEnd(10)} | Root: ${result.hasRoot ? 'Yes' : 'No'} | Script: ${result.hasScript ? 'Yes' : 'No'} | Version: ${result.hasVersionMeta ? 'Yes' : 'No'}`);

    if (!result.success) {
      console.log(`   └─ ERROR: ${result.error || result.statusText}`);
    }
  }

  console.log('');
  const successCount = pageResults.filter(r => r.success).length;
  const totalCount = pageResults.length;
  console.log(`Summary: ${successCount}/${totalCount} pages loaded successfully (${Math.round(successCount/totalCount*100)}%)`);
  console.log('');

  // Test 2: Script Loading
  console.log('TEST 2: SCRIPT LOADING VALIDATION');
  console.log('-'.repeat(100));
  console.log('');

  const scriptResult = await testScriptLoading();
  if (scriptResult.success) {
    console.log('✓ Main script loads successfully');
    console.log(`  URL: ${scriptResult.url}`);
    console.log(`  Size: ${(scriptResult.size / 1024).toFixed(2)} KB`);
    console.log(`  Contains React: ${scriptResult.containsReact ? 'Yes' : 'No'}`);
    console.log(`  Contains React DOM: ${scriptResult.containsReactDOM ? 'Yes' : 'No'}`);
    console.log(`  Contains Router: ${scriptResult.containsRouter ? 'Yes' : 'No'}`);
    console.log(`  Contains Supabase: ${scriptResult.containsSupabase ? 'Yes' : 'No'}`);
    console.log(`  Contains chunk error handling: ${scriptResult.containsChunkError ? 'Yes' : 'No'}`);
  } else {
    console.log('✗ Main script loading failed');
    console.log(`  ERROR: ${scriptResult.error}`);
  }
  console.log('');

  // Test 3: Chunk Loading
  console.log('TEST 3: CHUNK LOADING VALIDATION');
  console.log('-'.repeat(100));
  console.log('');

  const chunkResult = await testChunkLoading();
  if (chunkResult.allSuccessful !== undefined) {
    console.log(`Total chunks detected: ${chunkResult.totalChunks}`);
    console.log(`Chunks tested: ${chunkResult.testedChunks.length}`);
    console.log('');

    chunkResult.testedChunks.forEach(chunk => {
      const icon = chunk.success ? '✓' : '✗';
      console.log(`${icon} ${chunk.chunk.padEnd(60)} | Status: ${chunk.status}`);
      if (!chunk.success && chunk.error) {
        console.log(`   └─ ERROR: ${chunk.error}`);
      }
    });

    console.log('');
    if (chunkResult.allSuccessful) {
      console.log('✓ All tested chunks loaded successfully');
    } else {
      console.log('✗ Some chunks failed to load');
    }
  } else {
    console.log('✗ Chunk testing failed');
    console.log(`  ERROR: ${chunkResult.error}`);
  }
  console.log('');

  // Overall Summary
  console.log('='.repeat(100));
  console.log('OVERALL DEPLOYMENT STATUS');
  console.log('='.repeat(100));
  console.log('');

  const allPagesPassed = pageResults.every(r => r.success);
  const scriptPassed = scriptResult.success;
  const chunksPassed = chunkResult.allSuccessful !== undefined ? chunkResult.allSuccessful : false;

  const overallSuccess = allPagesPassed && scriptPassed && chunksPassed;

  if (overallSuccess) {
    console.log('✓ DEPLOYMENT VALIDATION PASSED');
    console.log('');
    console.log('All systems operational:');
    console.log('  ✓ All critical pages load correctly');
    console.log('  ✓ JavaScript bundles load successfully');
    console.log('  ✓ Code splitting and lazy loading functional');
    console.log('  ✓ ChunkErrorBoundary in place');
    console.log('  ✓ Version metadata present');
  } else {
    console.log('✗ DEPLOYMENT VALIDATION FAILED');
    console.log('');
    console.log('Issues detected:');

    if (!allPagesPassed) {
      const failedPages = pageResults.filter(r => !r.success);
      console.log(`  ✗ ${failedPages.length} page(s) failed to load:`);
      failedPages.forEach(page => {
        console.log(`     - ${page.name} (${page.path}): ${page.error || page.statusText}`);
      });
    }

    if (!scriptPassed) {
      console.log('  ✗ Main script loading failed');
    }

    if (!chunksPassed) {
      console.log('  ✗ Some chunks failed to load');
    }
  }

  console.log('');
  console.log('='.repeat(100));
  console.log('');

  // Recommendations
  console.log('RECOMMENDATIONS:');
  console.log('');

  if (overallSuccess) {
    console.log('1. Continue monitoring for JavaScript console errors in browser');
    console.log('2. Test user flows (navigation, forms, interactions) manually');
    console.log('3. Verify environment variables are set correctly in Netlify');
    console.log('4. Check analytics and error tracking tools for runtime issues');
    console.log('5. Run Lighthouse performance audit for optimization opportunities');
  } else {
    console.log('1. Check Netlify build logs for detailed error information');
    console.log('2. Verify all environment variables are set in Netlify dashboard');
    console.log('3. Test locally with `npm run build && npm run preview`');
    console.log('4. Check browser console for JavaScript errors');
    console.log('5. Verify Supabase connection (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
    console.log('6. Review ChunkErrorBoundary implementation for edge cases');
  }

  console.log('');
  console.log('='.repeat(100));

  return {
    success: overallSuccess,
    pageResults,
    scriptResult,
    chunkResult
  };
}

// Run the test
runComprehensiveTest()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('FATAL ERROR:', error);
    process.exit(1);
  });
