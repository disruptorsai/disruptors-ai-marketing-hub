/**
 * Direct Migration Executor using Supabase REST API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_PROJECT_REF) {
  console.error('Missing environment variables');
  process.exit(1);
}

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250107_business_brain_infrastructure.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('🚀 Applying Business Brain Migration...\n');

// Just execute the entire migration as one query
const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Migration executed successfully!\n');
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } else {
      console.error('❌ Migration failed:', res.statusCode);
      console.error(data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  process.exit(1);
});

req.write(JSON.stringify({ query: migrationSQL }));
req.end();
