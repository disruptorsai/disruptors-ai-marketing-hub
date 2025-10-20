/**
 * Test only Backlinks API to see raw response
 */

import 'dotenv/config';

const DATAFORSEO_BASE = 'https://api.dataforseo.com/v3';
const TEST_DOMAIN = 'openai.com';

const login = process.env.DATAFORSEO_LOGIN || process.env.VITE_DATAFORSEO_LOGIN;
const password = process.env.DATAFORSEO_PASSWORD || process.env.VITE_DATAFORSEO_PASSWORD;

console.log('\n🔍 Testing Backlinks API\n');
console.log(`Domain: ${TEST_DOMAIN}\n`);

async function testBacklinks() {
  try {
    const auth = Buffer.from(`${login}:${password}`).toString('base64');

    const response = await fetch(`${DATAFORSEO_BASE}/backlinks/summary/live`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        target: TEST_DOMAIN,
        mode: 'domain',
        internal_list_limit: 10
      }])
    });

    const result = await response.json();

    console.log('Full Response:');
    console.log(JSON.stringify(result, null, 2));

  } catch (err) {
    console.error('Error:', err.message);
  }
}

testBacklinks();
