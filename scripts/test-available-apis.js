/**
 * Test which DataForSEO APIs are available with current subscription
 */

import 'dotenv/config';

const DATAFORSEO_BASE = 'https://api.dataforseo.com/v3';
const login = process.env.DATAFORSEO_LOGIN || process.env.VITE_DATAFORSEO_LOGIN;
const password = process.env.DATAFORSEO_PASSWORD || process.env.VITE_DATAFORSEO_PASSWORD;

console.log('\n🔍 Testing Available DataForSEO APIs\n');
console.log('═'.repeat(60));

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

    const result = await response.json();
    const task = result.tasks?.[0];

    if (task.status_code === 20000) {
      console.log(`✅ ${name}: AVAILABLE`);
      console.log(`   Cost: $${task.cost}`);
      if (task.result && task.result.length > 0) {
        console.log(`   Results: ${task.result.length} items`);
      }
      return true;
    } else if (task.status_code === 40204) {
      console.log(`❌ ${name}: SUBSCRIPTION REQUIRED`);
      console.log(`   Message: ${task.status_message}`);
      return false;
    } else {
      console.log(`⚠️  ${name}: UNKNOWN STATUS (${task.status_code})`);
      console.log(`   Message: ${task.status_message}`);
      return false;
    }
  } catch (err) {
    console.log(`❌ ${name}: ERROR - ${err.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n📊 Keywords & SERP APIs\n');
  console.log('─'.repeat(60));

  // Test Keywords API
  await testAPI(
    'Keywords API',
    '/keywords_data/google_ads/keywords_for_keywords/live',
    [{
      keywords: ['digital marketing'],
      location_code: 2840,
      language_code: 'en',
      limit: 5
    }]
  );

  console.log();

  // Test SERP API
  await testAPI(
    'SERP API',
    '/serp/google/organic/live/regular',
    [{
      keyword: 'digital marketing',
      location_code: 2840,
      language_code: 'en',
      depth: 10
    }]
  );

  console.log();

  // Test Keyword Ideas (different from suggestions)
  await testAPI(
    'Keyword Ideas API',
    '/keywords_data/google_ads/search_volume/live',
    [{
      keywords: ['digital marketing', 'seo', 'content marketing'],
      location_code: 2840,
      language_code: 'en'
    }]
  );

  console.log('\n' + '═'.repeat(60));
  console.log('\n📝 Summary\n');
  console.log('Available APIs can be used to enhance:');
  console.log('  • Keyword Research module (expand data, add metrics)');
  console.log('  • AI Content Writer (keyword suggestions)');
  console.log('  • Growth Audit (keyword opportunities)');
  console.log('  • SERP analysis (if SERP API is available)\n');
}

runTests();
