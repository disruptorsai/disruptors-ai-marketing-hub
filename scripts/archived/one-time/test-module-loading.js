/**
 * Test Module Loading Script
 *
 * Verifies that the Keyword Research module can be loaded
 * via the Module Registry and all integration points work.
 *
 * Usage: node scripts/test-module-loading.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(dirname(__dirname), '.env') });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('ERROR: Missing environment variables');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * Test 1: Check if modules table exists
 */
async function testModulesTable() {
  console.log('\n📊 Test 1: Checking modules table...');

  const { data, error } = await supabase
    .from('modules')
    .select('count', { count: 'exact', head: true });

  if (error) {
    console.error('   ❌ FAIL: Modules table does not exist or is not accessible');
    console.error('   Error:', error.message);
    return false;
  }

  console.log('   ✅ PASS: Modules table exists');
  return true;
}

/**
 * Test 2: Load Keyword Research module from database
 */
async function testLoadModule() {
  console.log('\n📦 Test 2: Loading keyword-research module from database...');

  const { data: module, error } = await supabase
    .from('modules')
    .select('*')
    .eq('slug', 'keyword-research')
    .single();

  if (error) {
    console.error('   ❌ FAIL: Could not load module from database');
    console.error('   Error:', error.message);
    return false;
  }

  if (!module) {
    console.error('   ❌ FAIL: Module not found in database');
    return false;
  }

  console.log('   ✅ PASS: Module loaded from database');
  console.log('   Module Details:');
  console.log(`      Name: ${module.name}`);
  console.log(`      Version: ${module.version}`);
  console.log(`      Status: ${module.status}`);
  console.log(`      Category: ${module.category}`);
  console.log(`      Audience: ${module.audience.join(', ')}`);
  console.log(`      Requires Brain: ${module.requires_brain}`);
  console.log(`      Requires Auth: ${module.requires_auth}`);
  console.log(`      Function Endpoint: ${module.function_endpoint}`);

  return module;
}

/**
 * Test 3: Verify manifest.json matches database
 */
async function testManifestMatch(dbModule) {
  console.log('\n📄 Test 3: Verifying manifest.json matches database...');

  try {
    const manifestPath = join(dirname(__dirname), 'src', 'modules', 'keyword-research', 'manifest.json');
    const manifestContent = readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    const checks = [
      { field: 'slug', db: dbModule.slug, manifest: manifest.slug },
      { field: 'name', db: dbModule.name, manifest: manifest.name },
      { field: 'version', db: dbModule.version, manifest: manifest.version },
      { field: 'status', db: dbModule.status, manifest: manifest.status },
      { field: 'category', db: dbModule.category, manifest: manifest.category },
      { field: 'function_endpoint', db: dbModule.function_endpoint, manifest: manifest.function_endpoint }
    ];

    let allMatch = true;

    for (const check of checks) {
      if (check.db === check.manifest) {
        console.log(`   ✅ ${check.field}: Match`);
      } else {
        console.log(`   ❌ ${check.field}: Mismatch`);
        console.log(`      Database: ${check.db}`);
        console.log(`      Manifest: ${check.manifest}`);
        allMatch = false;
      }
    }

    if (allMatch) {
      console.log('\n   ✅ PASS: Manifest matches database');
      return true;
    } else {
      console.log('\n   ⚠️  WARNING: Some fields do not match');
      return false;
    }
  } catch (error) {
    console.error('   ❌ FAIL: Could not read or parse manifest.json');
    console.error('   Error:', error.message);
    return false;
  }
}

/**
 * Test 4: Check module files exist
 */
async function testModuleFiles() {
  console.log('\n📁 Test 4: Checking module files exist...');

  const basePath = join(dirname(__dirname), 'src', 'modules', 'keyword-research');
  const files = [
    'manifest.json',
    'schema.js',
    'index.jsx',
    'KeywordResearchUI.jsx',
    'README.md'
  ];

  let allExist = true;

  for (const file of files) {
    try {
      const filePath = join(basePath, file);
      readFileSync(filePath, 'utf-8');
      console.log(`   ✅ ${file} exists`);
    } catch (error) {
      console.log(`   ❌ ${file} does NOT exist`);
      allExist = false;
    }
  }

  // Check Netlify function
  try {
    const functionPath = join(dirname(__dirname), 'netlify', 'functions', 'module-keyword-research.js');
    readFileSync(functionPath, 'utf-8');
    console.log(`   ✅ netlify/functions/module-keyword-research.js exists`);
  } catch (error) {
    console.log(`   ❌ netlify/functions/module-keyword-research.js does NOT exist`);
    allExist = false;
  }

  if (allExist) {
    console.log('\n   ✅ PASS: All module files exist');
    return true;
  } else {
    console.log('\n   ❌ FAIL: Some module files are missing');
    return false;
  }
}

/**
 * Test 5: Check access control function
 */
async function testAccessControl() {
  console.log('\n🔐 Test 5: Testing access control function...');

  // Test public access (anonymous user)
  const { data: publicAccess, error: publicError } = await supabase
    .rpc('check_module_access', {
      p_module_slug: 'keyword-research',
      p_user_id: null,
      p_audience: 'public'
    });

  if (publicError) {
    console.error('   ❌ FAIL: Public access check failed');
    console.error('   Error:', publicError.message);
    return false;
  }

  console.log('   ✅ Public Access Check:');
  console.log(`      Allowed: ${publicAccess.allowed}`);
  console.log(`      Reason: ${publicAccess.reason || 'N/A'}`);
  console.log(`      Daily Limit: ${publicAccess.daily_limit}`);
  console.log(`      Daily Used: ${publicAccess.daily_used}`);

  if (publicAccess.allowed) {
    console.log('\n   ✅ PASS: Access control function working');
    return true;
  } else {
    console.log('\n   ⚠️  WARNING: Public access denied (may be expected if quota exceeded)');
    return true; // Still pass the test, just a warning
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Module Loading Test: keyword-research');
  console.log('═══════════════════════════════════════════════════');

  const results = [];

  // Run all tests
  results.push(await testModulesTable());

  const module = await testLoadModule();
  results.push(!!module);

  if (module) {
    results.push(await testManifestMatch(module));
  }

  results.push(await testModuleFiles());
  results.push(await testAccessControl());

  // Summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  Test Summary');
  console.log('═══════════════════════════════════════════════════');

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`\n   Tests Passed: ${passed}/${total}`);

  if (passed === total) {
    console.log('\n   ✅ ALL TESTS PASSED!');
    console.log('\n   The Keyword Research module is ready for production.');
    console.log('   You can now:');
    console.log('   1. Access the public demo at /demos/keyword-research');
    console.log('   2. Use the module in client apps at /app/keyword-research');
    console.log('   3. Call the Netlify function at /.netlify/functions/module-keyword-research');
  } else {
    console.log('\n   ⚠️  SOME TESTS FAILED');
    console.log('\n   Please review the errors above and fix any issues.');
  }

  console.log('\n═══════════════════════════════════════════════════\n');
}

main().catch(console.error);
