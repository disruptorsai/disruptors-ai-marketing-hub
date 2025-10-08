/**
 * Apply Migration via Supabase Management API
 *
 * Uses the Supabase Management API to execute SQL migrations
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!PROJECT_REF || !SUPABASE_ACCESS_TOKEN) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL (to extract PROJECT_REF)');
  console.error('   SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  BUSINESS BRAIN INFRASTRUCTURE MIGRATION                   ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');
console.log(`📍 Project Ref: ${PROJECT_REF}`);
console.log(`🔗 URL: ${SUPABASE_URL}\n`);

/**
 * Execute SQL query using Supabase Management API
 */
function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'apikey': SERVICE_ROLE_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Check if Management API is available
 */
async function checkAPIAvailability() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_REF}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`
      }
    };

    const req = https.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

/**
 * Main migration
 */
async function main() {
  console.log('🔍 Checking API availability...');

  const apiAvailable = await checkAPIAvailability();

  if (!apiAvailable) {
    console.log('⚠️  Management API not available or token invalid\n');
    console.log('Will execute via Supabase SQL Editor instead.\n');
    showManualInstructions();
    return;
  }

  console.log('✅ API connection successful\n');

  // Read migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250107_business_brain_infrastructure.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log(`📄 Migration loaded: ${(migrationSQL.length / 1024).toFixed(2)} KB`);
  console.log('🔄 Executing migration...\n');

  try {
    const result = await executeSQL(migrationSQL);
    console.log('✅ Migration executed successfully!\n');
    console.log('Result:', JSON.stringify(result, null, 2));

    await verifyTables();

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.log('\nFalling back to manual instructions...\n');
    showManualInstructions();
  }
}

/**
 * Verify tables were created
 */
async function verifyTables() {
  console.log('\n🔍 Verifying tables...\n');

  const tablesToCheck = [
    'business_brains',
    'brain_facts',
    'brand_rules',
    'brand_assets',
    'onboarding_sessions',
    'knowledge_sources'
  ];

  const checkQuery = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (${tablesToCheck.map(t => `'${t}'`).join(',')});
  `;

  try {
    const result = await executeSQL(checkQuery);
    const foundTables = result.map(row => row.table_name);

    console.log('Tables found:');
    tablesToCheck.forEach(table => {
      if (foundTables.includes(table)) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} - MISSING`);
      }
    });

    console.log(`\n${foundTables.length}/${tablesToCheck.length} tables created\n`);

    if (foundTables.length === tablesToCheck.length) {
      console.log('🎉 Migration completed successfully!\n');
    } else {
      console.log('⚠️  Some tables are missing. Please check the logs above.\n');
    }

  } catch (err) {
    console.error('❌ Verification failed:', err.message);
  }
}

/**
 * Show manual instructions
 */
function showManualInstructions() {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250107_business_brain_infrastructure.sql');

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  MANUAL MIGRATION INSTRUCTIONS                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log('1. Open Supabase SQL Editor:');
  console.log(`   https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new\n`);
  console.log('2. Copy the contents of:');
  console.log(`   ${migrationPath}\n`);
  console.log('3. Paste into SQL Editor and click "RUN"\n');
  console.log('4. Verify tables were created in the Table Editor\n');
  console.log('═'.repeat(60) + '\n');
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
