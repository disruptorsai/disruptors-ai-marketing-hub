/**
 * Quick DataForSEO API Test
 * Tests basic API connectivity with your credentials
 */

import 'dotenv/config';

const DATAFORSEO_BASE = 'https://api.dataforseo.com/v3';
const TEST_DOMAIN = 'openai.com';

// Get credentials from environment
const login = process.env.DATAFORSEO_LOGIN || process.env.VITE_DATAFORSEO_LOGIN;
const password = process.env.DATAFORSEO_PASSWORD || process.env.VITE_DATAFORSEO_PASSWORD;

console.log('\n🧪 DataForSEO API Quick Test\n');
console.log('═'.repeat(60));

if (!login || !password) {
  console.error('❌ Missing credentials');
  console.log('\nSet in .env file:');
  console.log('  DATAFORSEO_LOGIN=your_email@example.com');
  console.log('  DATAFORSEO_PASSWORD=your_api_password\n');
  process.exit(1);
}

console.log(`✅ Credentials found: ${login.substring(0, 3)}***`);
console.log(`\nTesting with domain: ${TEST_DOMAIN}\n`);

async function testAPI(name, endpoint, data) {
  try {
    const auth = Buffer.from(`${login}:${password}`).toString('base64');

    const response = await fetch(`${DATAFORSEO_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status_code !== 20000) {
      throw new Error(`API Error: ${result.status_message || 'Unknown error'}`);
    }

    // Return the full task result for proper parsing
    return result.tasks?.[0] || null;
  } catch (err) {
    throw err;
  }
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: Keywords API (baseline)
  console.log('─'.repeat(60));
  console.log('Test 1: Keywords API (Baseline Test)');
  console.log('─'.repeat(60));
  try {
    const task = await testAPI('Keywords', '/keywords_data/google_ads/keywords_for_keywords/live', [{
      keywords: ['AI'],
      location_code: 2840,
      language_code: 'en',
      limit: 5
    }]);

    if (task && task.result && task.result.length > 0) {
      console.log(`✅ Keywords API: Retrieved ${task.result.length} keywords`);
      console.log(`   Sample: "${task.result[0].keyword}" (${task.result[0].search_volume.toLocaleString()} searches/mo)`);
      console.log(`   Cost: $${task.cost}`);
      passed++;
    } else {
      console.log('❌ Keywords API: No data returned');
      failed++;
    }
  } catch (err) {
    console.log(`❌ Keywords API: ${err.message}`);
    failed++;
  }

  // Test 2: Backlinks API
  console.log('\n' + '─'.repeat(60));
  console.log('Test 2: Backlinks API');
  console.log('─'.repeat(60));
  try {
    const task = await testAPI('Backlinks', '/backlinks/summary/live', [{
      target: TEST_DOMAIN,
      mode: 'domain',
      internal_list_limit: 10
    }]);

    if (task && task.result && task.result.length > 0) {
      const summary = task.result[0];
      const backlinks = summary.backlinks || 0;
      const refDomains = summary.referring_domains || 0;
      console.log(`✅ Backlinks API: ${backlinks.toLocaleString()} backlinks, ${refDomains.toLocaleString()} referring domains`);

      // Calculate domain rating
      const domains = summary.referring_main_domains || 0;
      let dr = 0;
      if (domains < 10) dr = Math.min(20, domains * 2);
      else if (domains < 50) dr = 20 + Math.min(20, (domains - 10) / 2);
      else if (domains < 100) dr = 40 + Math.min(15, (domains - 50) / 3);
      else if (domains < 500) dr = 55 + Math.min(15, (domains - 100) / 25);
      else if (domains < 1000) dr = 70 + Math.min(10, (domains - 500) / 50);
      else dr = 80 + Math.min(20, (domains - 1000) / 100);

      console.log(`   Calculated Domain Rating: ${Math.round(dr)}/100`);
      console.log(`   Cost: $${task.cost}`);
      passed++;
    } else {
      console.log('❌ Backlinks API: No data returned');
      failed++;
    }
  } catch (err) {
    console.log(`❌ Backlinks API: ${err.message}`);
    console.log('   ⚠️  This API may not be enabled on your account');
    failed++;
  }

  // Test 3: Domain Analytics API
  console.log('\n' + '─'.repeat(60));
  console.log('Test 3: Domain Analytics API');
  console.log('─'.repeat(60));
  try {
    const task = await testAPI('Domain Analytics', '/domain_analytics/overview/live', [{
      target: TEST_DOMAIN
    }]);

    if (task && task.result && task.result.length > 0) {
      const overview = task.result[0];
      const traffic = overview.organic_etv || 0;
      const keywords = overview.organic_keywords_count || 0;
      console.log(`✅ Domain Analytics API: ${traffic.toLocaleString()} est. traffic, ${keywords.toLocaleString()} organic keywords`);
      console.log(`   Cost: $${task.cost}`);
      passed++;
    } else {
      console.log('❌ Domain Analytics API: No data returned');
      failed++;
    }
  } catch (err) {
    console.log(`❌ Domain Analytics API: ${err.message}`);
    console.log('   ⚠️  This API may not be enabled on your account');
    failed++;
  }

  // Test 4: DataForSEO Labs API
  console.log('\n' + '─'.repeat(60));
  console.log('Test 4: DataForSEO Labs API (Competitors)');
  console.log('─'.repeat(60));
  try {
    const task = await testAPI('Labs', '/dataforseo_labs/google/competitors_domain/live', [{
      target: TEST_DOMAIN,
      limit: 5
    }]);

    if (task && task.result && task.result.length > 0) {
      const items = task.result[0]?.items || task.result;
      if (items && items.length > 0) {
        console.log(`✅ DataForSEO Labs API: Found ${items.length} competitors`);
        console.log(`   Top competitor: ${items[0].domain}`);
        console.log(`   Cost: $${task.cost}`);
        passed++;
      } else {
        console.log('❌ DataForSEO Labs API: No competitors returned');
        failed++;
      }
    } else {
      console.log('❌ DataForSEO Labs API: No data returned');
      failed++;
    }
  } catch (err) {
    console.log(`❌ DataForSEO Labs API: ${err.message}`);
    console.log('   ⚠️  This API may not be enabled on your account');
    failed++;
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('Test Summary');
  console.log('═'.repeat(60));
  console.log(`Total Tests: ${passed + failed}`);
  console.log(`✅ Passed: ${passed}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
  }

  if (failed === 0) {
    console.log('\n🎉 All tests passed! DataForSEO integration is ready.\n');
    console.log('Next steps:');
    console.log('  1. Run: npm run dev:netlify');
    console.log('  2. Navigate to: http://localhost:8888/demos/growth-audit');
    console.log('  3. Test with a real domain\n');
  } else if (passed > 0) {
    console.log('\n⚠️  Some tests failed, but core functionality works.\n');
    console.log('Failed APIs may not be enabled on your account.');
    console.log('Contact DataForSEO support to enable additional APIs.\n');
  } else {
    console.log('\n❌ All tests failed. Please check:');
    console.log('  - Credentials are correct');
    console.log('  - Account is active and has credits');
    console.log('  - Network connectivity\n');
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
