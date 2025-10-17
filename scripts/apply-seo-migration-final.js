#!/usr/bin/env node

/**
 * Final SEO Audit Migration Script
 * Uses direct SQL execution via Supabase Database URL
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🚀 SEO Audit Migration - Final Execution');
console.log('=' .repeat(80));

// Read the migration file
const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251016_seo_audit_tool.sql');
const migrationSQL = readFileSync(migrationPath, 'utf8');

console.log(`\n📄 Migration file: ${migrationPath}`);
console.log(`📦 Size: ${(migrationSQL.length / 1024).toFixed(2)} KB`);

console.log('\n' + '=' .repeat(80));
console.log('📋 INSTRUCTIONS FOR MANUAL EXECUTION');
console.log('=' .repeat(80));

console.log('\nSince automated SQL execution via the API has limitations,');
console.log('please execute this migration using ONE of the following methods:\n');

console.log('METHOD 1: Supabase Dashboard SQL Editor (RECOMMENDED)');
console.log('-'.repeat(80));
console.log('1. Go to: https://supabase.com/dashboard/project/' + supabaseUrl.match(/https:\/\/([^.]+)/)?.[1] + '/sql/new');
console.log('2. Copy the entire contents of:');
console.log(`   ${migrationPath}`);
console.log('3. Paste into the SQL editor');
console.log('4. Click "Run" to execute');
console.log('5. Verify all tables were created\n');

console.log('METHOD 2: Command Line (using psql)');
console.log('-'.repeat(80));
console.log('If you have database password in your .env:');
console.log(`psql postgresql://postgres:[PASSWORD]@db.${supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]}.supabase.co:5432/postgres < "${migrationPath}"`);
console.log('');

console.log('METHOD 3: Copy SQL to Clipboard');
console.log('-'.repeat(80));
console.log('Run this command to copy the SQL to your clipboard:');
console.log(`  cat "${migrationPath}" | pbcopy  # macOS`);
console.log(`  cat "${migrationPath}" | xclip -selection clipboard  # Linux`);
console.log('Then paste into Supabase SQL editor\n');

console.log('=' .repeat(80));
console.log('🔍 VERIFICATION');
console.log('=' .repeat(80));

console.log('\nAfter executing the migration, run:');
console.log('  node scripts/verify-seo-audit-tables.js');
console.log('\nTo verify that all 4 tables were created successfully.\n');

console.log('=' .repeat(80));
console.log('📊 EXPECTED RESULTS');
console.log('=' .repeat(80));

const expectedObjects = {
  'Tables (4)': [
    'seo_audits',
    'seo_audit_sections',
    'seo_audit_recommendations',
    'seo_leads'
  ],
  'Indexes (12)': [
    'idx_seo_audits_domain',
    'idx_seo_audits_status',
    'idx_seo_audits_source',
    'idx_seo_audits_created_at',
    'idx_seo_audits_overall_score',
    'idx_seo_audit_sections_audit_id',
    'idx_seo_audit_recommendations_audit_id',
    'idx_seo_audit_recommendations_priority',
    'idx_seo_leads_email',
    'idx_seo_leads_domain',
    'idx_seo_leads_status',
    'idx_seo_leads_created_at'
  ],
  'Functions (2)': [
    'update_seo_leads_updated_at()',
    'calculate_seo_audit_overall_score(UUID)'
  ],
  'Triggers (1)': [
    'trigger_update_seo_leads_updated_at ON seo_leads'
  ],
  'Views (1)': [
    'admin_seo_audit_summary'
  ],
  'RLS Policies (10)': [
    'Public can insert their own audits',
    'Users can view their own audits',
    'Admins can do anything with audits',
    'Users can view sections of their audits',
    'Service role can manage sections',
    'Users can view recommendations of their audits',
    'Service role can manage recommendations',
    'Admins can view all leads',
    'Admins can update leads',
    'Service role can manage leads'
  ]
};

console.log('');
for (const [category, items] of Object.entries(expectedObjects)) {
  console.log(`\n${category}:`);
  items.forEach(item => console.log(`  • ${item}`));
}

console.log('\n' + '=' .repeat(80));
console.log('');

// Attempt to copy to clipboard
try {
  const { execSync } = await import('child_process');
  execSync(`echo "${migrationPath}" | pbcopy`, { stdio: 'ignore' });
  console.log('✅ Migration file path copied to clipboard!');
  console.log('   You can paste it to view the file.\n');
} catch (error) {
  console.log('💡 Migration file path:', migrationPath, '\n');
}
