#!/usr/bin/env node

// API key verification script
import https from 'https';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('🔐 API Key Verification');
console.log('======================\n');

function makeRequest(url, apiKey, keyType) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ubqxflzuvxowigbjmqfb.supabase.co',
      port: 443,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          keyType
        });
      });
    });

    req.on('error', (error) => {
      reject({ error, keyType });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject({ error: new Error('Request timeout'), keyType });
    });

    req.end();
  });
}

async function verifyApiKeys() {
  console.log(`📍 Testing database: ${supabaseUrl}\n`);

  // Test anon key
  console.log('1️⃣ Testing anon key...');
  try {
    const anonResult = await makeRequest(supabaseUrl, supabaseAnonKey, 'anon');
    console.log(`   Status: ${anonResult.statusCode}`);

    if (anonResult.statusCode === 200) {
      console.log('   ✅ Anon key is valid and working');
    } else if (anonResult.statusCode === 401) {
      console.log('   ❌ Anon key is invalid or expired');
    } else if (anonResult.statusCode === 404) {
      console.log('   ⚠️ API endpoint not found (unusual)');
    } else {
      console.log(`   ⚠️ Unexpected response: ${anonResult.statusCode}`);
      console.log(`   Response: ${anonResult.body.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.error?.message || error.message}`);
  }

  // Test service role key
  console.log('\n2️⃣ Testing service role key...');
  try {
    const serviceResult = await makeRequest(supabaseUrl, supabaseServiceKey, 'service');
    console.log(`   Status: ${serviceResult.statusCode}`);

    if (serviceResult.statusCode === 200) {
      console.log('   ✅ Service role key is valid and working');
    } else if (serviceResult.statusCode === 401) {
      console.log('   ❌ Service role key is invalid or expired');
    } else if (serviceResult.statusCode === 404) {
      console.log('   ⚠️ API endpoint not found (unusual)');
    } else {
      console.log(`   ⚠️ Unexpected response: ${serviceResult.statusCode}`);
      console.log(`   Response: ${serviceResult.body.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.error?.message || error.message}`);
  }

  // Test specific table query
  console.log('\n3️⃣ Testing table access...');
  try {
    const tableTestOptions = {
      hostname: 'ubqxflzuvxowigbjmqfb.supabase.co',
      port: 443,
      path: '/rest/v1/information_schema.tables?table_schema=eq.public&select=table_name&limit=5',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json'
      }
    };

    const tableResult = await new Promise((resolve, reject) => {
      const req = https.request(tableTestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
      });
      req.on('error', reject);
      req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
      req.end();
    });

    console.log(`   Status: ${tableResult.statusCode}`);
    if (tableResult.statusCode === 200) {
      try {
        const tables = JSON.parse(tableResult.body);
        console.log(`   ✅ Found ${tables.length} tables in database`);
        if (tables.length > 0) {
          console.log(`   📋 Tables: ${tables.map(t => t.table_name).join(', ')}`);
        } else {
          console.log('   📋 Database schema is empty');
        }
      } catch (parseError) {
        console.log('   ⚠️ Could not parse table response');
      }
    } else {
      console.log(`   ❌ Table query failed: ${tableResult.body.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`   ❌ Table test failed: ${error.message}`);
  }
}

verifyApiKeys()
  .then(() => {
    console.log('\n🎉 API key verification complete!');
  })
  .catch((error) => {
    console.error('\n💥 Verification failed:', error);
  });