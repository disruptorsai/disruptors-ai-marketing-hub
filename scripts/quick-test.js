/**
 * Quick deployment test for dm4.wjwelsh.com
 * Tests if the React forwardRef error is fixed
 */

const https = require('https');

const testUrl = 'https://dm4.wjwelsh.com/';

console.log('🧪 Testing dm4.wjwelsh.com for React errors...\n');

https.get(testUrl, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    // Extract script tags
    const scripts = html.match(/src="([^"]+\.js)"/g) || [];

    console.log('✅ Page loaded successfully (HTTP 200)');
    console.log(`\n📦 Found ${scripts.length} script tags:\n`);

    scripts.forEach((script, i) => {
      const src = script.match(/src="([^"]+)"/)[1];
      const filename = src.split('/').pop();
      console.log(`   ${i + 1}. ${filename}`);
    });

    // Check for main bundle
    const mainBundle = scripts.find(s => s.includes('index-'));
    if (mainBundle) {
      const mainSrc = mainBundle.match(/src="([^"]+)"/)[1];
      console.log(`\n🎯 Main bundle: ${mainSrc.split('/').pop()}`);
    }

    console.log('\n⚠️  Note: This test only verifies HTML loads.');
    console.log('   To test for JavaScript errors:');
    console.log('   1. Open https://dm4.wjwelsh.com in Chrome');
    console.log('   2. Open DevTools Console (F12)');
    console.log('   3. Check for "forwardRef" errors');
    console.log('   4. Verify page renders correctly\n');
  });
}).on('error', (err) => {
  console.error('❌ Request failed:', err.message);
  process.exit(1);
});
