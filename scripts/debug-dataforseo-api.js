/**
 * Debug DataForSEO API Responses
 * Shows raw API responses to understand data structure
 */

import 'dotenv/config';

const DATAFORSEO_BASE = 'https://api.dataforseo.com/v3';
const TEST_DOMAIN = 'openai.com';

const login = process.env.DATAFORSEO_LOGIN || process.env.VITE_DATAFORSEO_LOGIN;
const password = process.env.DATAFORSEO_PASSWORD || process.env.VITE_DATAFORSEO_PASSWORD;

console.log('\n🐛 DataForSEO API Debug Mode\n');
console.log('═'.repeat(60));
console.log(`Credentials: ${login?.substring(0, 3)}***`);
console.log(`Testing with: ${TEST_DOMAIN}\n`);

async function debugAPI(name, endpoint, data) {
  try {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`Testing: ${name}`);
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Request Data:`, JSON.stringify(data, null, 2));
    console.log('─'.repeat(60));

    const auth = Buffer.from(`${login}:${password}`).toString('base64');

    const response = await fetch(`${DATAFORSEO_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    console.log(`HTTP Status: ${response.status} ${response.statusText}`);

    const result = await response.json();

    console.log('\n📦 Full API Response:');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n🔍 Response Analysis:');
    console.log(`  status_code: ${result.status_code}`);
    console.log(`  status_message: ${result.status_message}`);
    console.log(`  tasks array length: ${result.tasks?.length || 0}`);

    if (result.tasks?.[0]) {
      console.log(`  tasks[0].status_code: ${result.tasks[0].status_code}`);
      console.log(`  tasks[0].status_message: ${result.tasks[0].status_message}`);
      console.log(`  tasks[0].result type: ${Array.isArray(result.tasks[0].result) ? 'array' : typeof result.tasks[0].result}`);
      console.log(`  tasks[0].result length: ${result.tasks[0].result?.length || 0}`);

      if (result.tasks[0].result?.[0]) {
        console.log('\n📋 First Result Item Keys:');
        console.log(`  ${Object.keys(result.tasks[0].result[0]).join(', ')}`);
      }
    }

    return result;

  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    console.error(err.stack);
  }
}

async function runDebug() {
  // Test 1: Simple keyword test
  await debugAPI(
    'Keywords API',
    '/keywords_data/google_ads/keywords_for_keywords/live',
    [{
      keywords: ['AI'],
      location_code: 2840,
      language_code: 'en',
      limit: 5
    }]
  );

  // Test 2: Backlinks summary
  await debugAPI(
    'Backlinks Summary',
    '/backlinks/summary/live',
    [{
      target: TEST_DOMAIN,
      mode: 'domain',
      internal_list_limit: 10
    }]
  );

  // Test 3: Domain Analytics
  await debugAPI(
    'Domain Analytics',
    '/domain_analytics/overview/live',
    [{
      target: TEST_DOMAIN
    }]
  );

  console.log('\n' + '═'.repeat(60));
  console.log('Debug complete. Review API responses above.');
  console.log('═'.repeat(60) + '\n');
}

runDebug().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
