#!/usr/bin/env node

/**
 * Verify SEO Audit Tables
 * Check if the migration was successful by verifying table existence and structure
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function testTableAccess(tableName) {
  try {
    // Try to select with limit 0 (should work even with no data)
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);

    if (error) {
      return { exists: false, error: error.message };
    }

    // Try to get table info
    const { data: countData, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    const count = countError ? 'unknown' : (countData?.length || 0);

    return { exists: true, count, error: null };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

async function testInsertAndDelete(tableName) {
  try {
    const testData = {
      domain: `test-${Date.now()}.example.com`,
      status: 'pending',
      source: 'internal',
      requester_email: 'test@example.com'
    };

    // Insert
    const { data: insertData, error: insertError } = await supabase
      .from(tableName)
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      return { success: false, operation: 'INSERT', error: insertError.message };
    }

    const testId = insertData.id;

    // Select
    const { data: selectData, error: selectError } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', testId)
      .single();

    if (selectError) {
      return { success: false, operation: 'SELECT', error: selectError.message };
    }

    // Update
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ status: 'completed' })
      .eq('id', testId);

    if (updateError) {
      return { success: false, operation: 'UPDATE', error: updateError.message };
    }

    // Delete
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .eq('id', testId);

    if (deleteError) {
      return { success: false, operation: 'DELETE', error: deleteError.message };
    }

    return { success: true, testId };
  } catch (error) {
    return { success: false, operation: 'UNKNOWN', error: error.message };
  }
}

async function main() {
  log('\n🔍 SEO Audit Tables Verification\n', 'bright');
  log(`Supabase URL: ${supabaseUrl}\n`, 'cyan');

  const tables = ['seo_audits', 'seo_audit_sections', 'seo_audit_recommendations', 'seo_leads'];

  log('━'.repeat(80), 'cyan');
  log('TABLE VERIFICATION', 'bright');
  log('━'.repeat(80), 'cyan');

  const results = {};

  for (const table of tables) {
    process.stdout.write(`\n${table}: `);
    const result = await testTableAccess(table);
    results[table] = result;

    if (result.exists) {
      log(`✓ EXISTS (${result.count} rows)`, 'green');
    } else {
      log(`✗ NOT FOUND - ${result.error}`, 'red');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Test CRUD operations on main table
  log('\n' + '━'.repeat(80), 'cyan');
  log('CRUD OPERATIONS TEST (seo_audits)', 'bright');
  log('━'.repeat(80), 'cyan');

  if (results['seo_audits'].exists) {
    log('\nTesting INSERT, SELECT, UPDATE, DELETE...', 'yellow');

    const crudResult = await testInsertAndDelete('seo_audits');

    if (crudResult.success) {
      log('\n✅ All CRUD operations successful!', 'green');
      log(`   Test record ID: ${crudResult.testId}`, 'cyan');
    } else {
      log(`\n❌ ${crudResult.operation} operation failed`, 'red');
      log(`   Error: ${crudResult.error}`, 'red');
    }
  } else {
    log('\n⚠️  Skipping CRUD test (table not accessible)', 'yellow');
  }

  // Test foreign key relationship
  log('\n' + '━'.repeat(80), 'cyan');
  log('FOREIGN KEY TEST (CASCADE)', 'bright');
  log('━'.repeat(80), 'cyan');

  if (results['seo_audits'].exists && results['seo_audit_sections'].exists) {
    try {
      log('\nCreating audit with section...', 'yellow');

      // Create audit
      const { data: audit, error: auditError } = await supabase
        .from('seo_audits')
        .insert({
          domain: `fk-test-${Date.now()}.example.com`,
          status: 'completed',
          source: 'internal'
        })
        .select()
        .single();

      if (auditError) throw auditError;

      log(`✓ Created audit: ${audit.id}`, 'green');

      // Create section
      const { data: section, error: sectionError } = await supabase
        .from('seo_audit_sections')
        .insert({
          audit_id: audit.id,
          section_name: 'test_section',
          section_title: 'Test Section',
          score: 5
        })
        .select()
        .single();

      if (sectionError) throw sectionError;

      log(`✓ Created section: ${section.id}`, 'green');

      // Delete audit (should cascade to section)
      const { error: deleteError } = await supabase
        .from('seo_audits')
        .delete()
        .eq('id', audit.id);

      if (deleteError) throw deleteError;

      log(`✓ Deleted audit (cascade)`, 'green');

      // Verify section was deleted
      const { data: checkSection } = await supabase
        .from('seo_audit_sections')
        .select('*')
        .eq('id', section.id);

      if (!checkSection || checkSection.length === 0) {
        log(`✓ CASCADE DELETE working correctly!`, 'green');
      } else {
        log(`⚠️  Section still exists (cascade may not be working)`, 'yellow');
      }
    } catch (error) {
      log(`\n❌ Foreign key test failed: ${error.message}`, 'red');
    }
  } else {
    log('\n⚠️  Skipping foreign key test (tables not accessible)', 'yellow');
  }

  // Summary
  log('\n' + '━'.repeat(80), 'cyan');
  log('SUMMARY', 'bright');
  log('━'.repeat(80), 'cyan');

  const existingTables = tables.filter(t => results[t].exists);
  const missingTables = tables.filter(t => !results[t].exists);

  log(`\n✅ Tables accessible: ${existingTables.length}/${tables.length}`, 'green');
  if (existingTables.length > 0) {
    existingTables.forEach(t => log(`   • ${t}`, 'green'));
  }

  if (missingTables.length > 0) {
    log(`\n❌ Tables missing: ${missingTables.length}`, 'red');
    missingTables.forEach(t => log(`   • ${t}`, 'red'));
  }

  if (existingTables.length === tables.length) {
    log('\n🎉 All tables verified successfully!', 'green');
    log('   The SEO Audit Tool database is ready to use.\n', 'green');
    return true;
  } else {
    log('\n⚠️  Some tables are not accessible', 'yellow');
    log('   This may be due to schema cache lag. Wait 30 seconds and try again.\n', 'yellow');
    return false;
  }
}

main()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
