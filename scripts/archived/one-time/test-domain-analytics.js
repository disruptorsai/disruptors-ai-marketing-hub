/**
 * Test Domain Analytics API (separate from backlinks)
 */

import 'dotenv/config';

const DATAFORSEO_BASE = 'https://api.dataforseo.com/v3';
const login = process.env.DATAFORSEO_LOGIN || process.env.VITE_DATAFORSEO_LOGIN;
const password = process.env.DATAFORSEO_PASSWORD || process.env.VITE_DATAFORSEO_PASSWORD;

async function testDomainAnalytics() {
  try {
    const auth = Buffer.from(`${login}:${password}`).toString('base64');

    console.log('\n🔍 Testing Domain Analytics API\n');

    const response = await fetch(`${DATAFORSEO_BASE}/domain_analytics/overview/live`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        target: 'openai.com'
      }])
    });

    const result = await response.json();
    const task = result.tasks?.[0];

    console.log('Status Code:', task.status_code);
    console.log('Status Message:', task.status_message);
    console.log('Cost:', task.cost);

    if (task.status_code === 20000 && task.result) {
      console.log('\n✅ Domain Analytics API: AVAILABLE');
      console.log('   Provides: organic traffic, keyword counts, visibility metrics');
    } else if (task.status_code === 40204) {
      console.log('\n❌ Domain Analytics API: SUBSCRIPTION REQUIRED');
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

testDomainAnalytics();
