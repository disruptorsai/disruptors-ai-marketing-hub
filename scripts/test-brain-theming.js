/**
 * Test Brain Theming System
 *
 * This script verifies that the brain theming system is working correctly
 * by checking CSS variables, theme injection, and component integration.
 *
 * Run: node scripts/test-brain-theming.js
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing environment variables');
  console.error('   VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

console.log('🧪 Testing Brain Theming System\n');

/**
 * Test 1: Verify brain schema has brand identity fields
 */
async function testBrainSchema() {
  console.log('📋 Test 1: Verify brain schema has brand identity fields');

  try {
    const { data, error } = await supabase
      .from('business_brains')
      .select('id, brand_colors, typography, logo_urls, business_name')
      .limit(1);

    if (error) {
      console.error('   ❌ Failed to query business_brains table');
      console.error('   Error:', error.message);
      return false;
    }

    if (!data || data.length === 0) {
      console.log('   ⚠️  No brains found in database');
      console.log('   ℹ️  Create a brain to test theming');
      return true;
    }

    const brain = data[0];
    console.log(`   ✅ Found brain: ${brain.business_name || brain.id}`);

    // Check for brand_colors
    if (brain.brand_colors && typeof brain.brand_colors === 'object') {
      console.log('   ✅ brand_colors field exists (JSONB)');
      console.log(`      Primary: ${brain.brand_colors.primary || 'not set'}`);
      console.log(`      Secondary: ${brain.brand_colors.secondary || 'not set'}`);
      console.log(`      Accent: ${brain.brand_colors.accent || 'not set'}`);
      console.log(`      Neutral: ${brain.brand_colors.neutral || 'not set'}`);
    } else {
      console.log('   ⚠️  brand_colors field is empty or invalid');
    }

    // Check for typography
    if (brain.typography && typeof brain.typography === 'object') {
      console.log('   ✅ typography field exists (JSONB)');
      console.log(`      Heading: ${brain.typography.heading || 'not set'}`);
      console.log(`      Body: ${brain.typography.body || 'not set'}`);
      console.log(`      Accent: ${brain.typography.accent || 'not set'}`);
    } else {
      console.log('   ⚠️  typography field is empty or invalid');
    }

    // Check for logo_urls
    if (brain.logo_urls && typeof brain.logo_urls === 'object') {
      console.log('   ✅ logo_urls field exists (JSONB)');
      console.log(`      Primary: ${brain.logo_urls.primary || 'not set'}`);
      console.log(`      Icon: ${brain.logo_urls.icon || 'not set'}`);
    } else {
      console.log('   ⚠️  logo_urls field is empty or invalid');
    }

    return true;
  } catch (err) {
    console.error('   ❌ Unexpected error:', err.message);
    return false;
  }
}

/**
 * Test 2: Verify theme files exist
 */
async function testThemeFiles() {
  console.log('\n📁 Test 2: Verify theme files exist');

  const fs = await import('fs');
  const path = await import('path');

  const filesToCheck = [
    'src/hooks/useBrainTheming.js',
    'src/components/layout/BrainThemedLayout.jsx',
    'src/components/branded/BrandedComponents.jsx',
    'docs/BRAIN_THEMING_SYSTEM.md',
  ];

  let allExist = true;

  for (const file of filesToCheck) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} - NOT FOUND`);
      allExist = false;
    }
  }

  return allExist;
}

/**
 * Test 3: Verify app pages use BrainThemedLayout
 */
async function testAppIntegration() {
  console.log('\n🔌 Test 3: Verify app pages use BrainThemedLayout');

  const fs = await import('fs');
  const path = await import('path');

  const pagesToCheck = [
    { file: 'src/pages/ai-content-writer.jsx', name: 'AI Content Writer' },
    { file: 'src/pages/business-brain-manager.jsx', name: 'Business Brain Manager' },
  ];

  let allIntegrated = true;

  for (const page of pagesToCheck) {
    const filePath = path.join(process.cwd(), page.file);
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  ${page.name} - File not found`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // Check for BrainThemedLayout import
    if (content.includes('import BrainThemedLayout')) {
      console.log(`   ✅ ${page.name} - BrainThemedLayout imported`);
    } else {
      console.log(`   ❌ ${page.name} - BrainThemedLayout NOT imported`);
      allIntegrated = false;
    }

    // Check for BrainThemedLayout usage
    if (content.includes('<BrainThemedLayout>') || content.includes('<BrainThemedLayout')) {
      console.log(`   ✅ ${page.name} - BrainThemedLayout used in JSX`);
    } else {
      console.log(`   ❌ ${page.name} - BrainThemedLayout NOT used in JSX`);
      allIntegrated = false;
    }

    // Check for CSS variable usage
    if (content.includes('var(--brand-primary)') || content.includes('var(--brand-')) {
      console.log(`   ✅ ${page.name} - CSS variables used`);
    } else {
      console.log(`   ⚠️  ${page.name} - No CSS variables detected`);
    }
  }

  return allIntegrated;
}

/**
 * Test 4: Create test brain with custom colors
 */
async function testCreateTestBrain() {
  console.log('\n🎨 Test 4: Create test brain with custom colors');

  try {
    const testBrainData = {
      slug: `test-brain-${Date.now()}`,
      name: 'Test Brain for Theming',
      business_name: 'Test Business Co.',
      brand_colors: {
        primary: '#FF6B35',
        secondary: '#004E89',
        accent: '#F77F00',
        neutral: '#06A77D',
      },
      typography: {
        heading: "'Montserrat', sans-serif",
        body: "'Open Sans', sans-serif",
        accent: "'Merriweather', serif",
      },
      logo_urls: {
        primary: 'https://via.placeholder.com/200x60/FF6B35/FFFFFF?text=Test+Logo',
      },
      brain_level: 'starter',
      confidence_score: 0.5,
    };

    const { data, error } = await supabase
      .from('business_brains')
      .insert([testBrainData])
      .select()
      .single();

    if (error) {
      console.error('   ❌ Failed to create test brain');
      console.error('   Error:', error.message);
      return false;
    }

    console.log(`   ✅ Created test brain: ${data.id}`);
    console.log(`   📋 Slug: ${data.slug}`);
    console.log(`   🎨 Colors: Primary ${data.brand_colors.primary}, Secondary ${data.brand_colors.secondary}`);
    console.log(`   ℹ️  Use this brain to test theming in the app`);
    console.log(`   ⚠️  Remember to delete test brain after testing`);

    return data;
  } catch (err) {
    console.error('   ❌ Unexpected error:', err.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  const results = {
    schema: await testBrainSchema(),
    files: await testThemeFiles(),
    integration: await testAppIntegration(),
  };

  console.log('\n📊 Test Summary:');
  console.log(`   Schema Test: ${results.schema ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Files Test: ${results.files ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Integration Test: ${results.integration ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = Object.values(results).every(r => r === true);

  if (allPassed) {
    console.log('\n✅ All tests passed!');
    console.log('\n🚀 Next Steps:');
    console.log('   1. Run `npm run dev` to start the dev server');
    console.log('   2. Navigate to /ai-content-writer or /business-brain-manager');
    console.log('   3. Open DevTools → Elements → :root');
    console.log('   4. Verify CSS variables are injected:');
    console.log('      - --brand-primary');
    console.log('      - --brand-secondary');
    console.log('      - --brand-accent');
    console.log('      - --brand-neutral');
    console.log('      - --font-heading');
    console.log('      - --font-body');
    console.log('      - --font-accent');
    console.log('   5. Verify UI elements use brand colors');

    // Optionally create test brain
    console.log('\n📝 Create Test Brain?');
    console.log('   Run: node scripts/test-brain-theming.js --create-test-brain');
  } else {
    console.log('\n❌ Some tests failed. Please review the output above.');
    process.exit(1);
  }
}

// Check if --create-test-brain flag is passed
if (process.argv.includes('--create-test-brain')) {
  testCreateTestBrain();
} else {
  runTests();
}
