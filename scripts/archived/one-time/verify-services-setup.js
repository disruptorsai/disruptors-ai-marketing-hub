import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function verifyServicesSetup() {
  console.log('='.repeat(70));
  console.log('SERVICES TABLE VERIFICATION');
  console.log('='.repeat(70));

  let allChecks = true;

  // Check 1: Table exists and has records
  console.log('\n[Check 1/5] Table exists and has records...');
  const { data: services, error: selectError } = await supabase
    .from('services')
    .select('*');

  if (selectError) {
    console.log('   ✗ FAILED: Table does not exist or cannot be accessed');
    console.log('   Error:', selectError.message);
    allChecks = false;
  } else {
    console.log(`   ✓ PASSED: Table exists with ${services?.length || 0} records`);

    if (services?.length !== 9) {
      console.log(`   ⚠️  WARNING: Expected 9 records, found ${services?.length || 0}`);
    }
  }

  // Check 2: Required columns exist
  console.log('\n[Check 2/5] Required columns exist...');
  const requiredColumns = ['id', 'title', 'slug', 'hook', 'image', 'display_order', 'is_active'];

  if (services && services.length > 0) {
    const sample = services[0];
    const missingColumns = requiredColumns.filter(col => !(col in sample));

    if (missingColumns.length === 0) {
      console.log('   ✓ PASSED: All required columns exist');
    } else {
      console.log('   ✗ FAILED: Missing columns:', missingColumns.join(', '));
      console.log('   Action: Run the SQL migration in Supabase SQL Editor');
      allChecks = false;
    }
  } else {
    console.log('   ⚠️  SKIPPED: No records to check columns');
  }

  // Check 3: Data integrity
  console.log('\n[Check 3/5] Data integrity...');
  if (services && services.length > 0) {
    let integrityIssues = 0;

    services.forEach(svc => {
      const issues = [];
      if (!svc.title) issues.push('missing title');
      if (!svc.slug) issues.push('missing slug');
      if (!svc.hook) issues.push('missing hook');
      if (!svc.image) issues.push('missing image');
      if (svc.display_order === null || svc.display_order === undefined) issues.push('missing display_order');

      if (issues.length > 0) {
        console.log(`   ⚠️  Service "${svc.title || 'Untitled'}": ${issues.join(', ')}`);
        integrityIssues++;
      }
    });

    if (integrityIssues === 0) {
      console.log('   ✓ PASSED: All records have required data');
    } else {
      console.log(`   ⚠️  WARNING: ${integrityIssues} records have missing data`);
    }
  } else {
    console.log('   ⚠️  SKIPPED: No records to verify');
  }

  // Check 4: Display order is correct
  console.log('\n[Check 4/5] Display order sequence...');
  if (services && services.length > 0) {
    const orderedServices = [...services].sort((a, b) =>
      (a.display_order || 0) - (b.display_order || 0)
    );

    const expectedOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const actualOrder = orderedServices.map(s => s.display_order);
    const orderMatch = JSON.stringify(actualOrder.slice(0, 9)) === JSON.stringify(expectedOrder);

    if (orderMatch) {
      console.log('   ✓ PASSED: Display order is sequential (1-9)');
    } else {
      console.log('   ⚠️  WARNING: Display order is not sequential');
      console.log(`   Expected: ${expectedOrder.join(', ')}`);
      console.log(`   Actual: ${actualOrder.join(', ')}`);
    }
  } else {
    console.log('   ⚠️  SKIPPED: No records to verify order');
  }

  // Check 5: RLS policies (test anon access)
  console.log('\n[Check 5/5] RLS policies (anon access)...');
  const anonClient = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  const { data: anonServices, error: anonError } = await anonClient
    .from('services')
    .select('id, title')
    .eq('is_active', true);

  if (anonError) {
    console.log('   ✗ FAILED: Anon users cannot access services');
    console.log('   Error:', anonError.message);
    console.log('   Action: Check RLS policies in Supabase Dashboard');
    allChecks = false;
  } else {
    console.log(`   ✓ PASSED: Anon users can access ${anonServices?.length || 0} active services`);
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(70));

  if (allChecks && services && services.length === 9) {
    console.log('\n✓ ALL CHECKS PASSED');
    console.log('\nThe services table is correctly configured and ready to use!');

    console.log('\nServices in database:');
    services
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      .forEach((svc, idx) => {
        console.log(`   ${idx + 1}. ${svc.title} (${svc.slug})`);
      });

    console.log('\nNext steps:');
    console.log('1. Update ServiceScroller.jsx to fetch from database');
    console.log('2. Remove hardcoded services data');
    console.log('3. Test the component with live data');
  } else {
    console.log('\n⚠️  SETUP INCOMPLETE');
    console.log('\nPlease complete the following:');
    console.log('1. Run the SQL migration in Supabase SQL Editor');
    console.log('   File: supabase/migrations/add_services_fields.sql');
    console.log('2. Verify RLS policies are configured');
    console.log('3. Re-run this verification script');
  }

  console.log('='.repeat(70));
}

verifyServicesSetup().catch(console.error);
