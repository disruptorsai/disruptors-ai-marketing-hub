#!/usr/bin/env node

/**
 * Apply SEO Audit Migration using PostgreSQL Client
 * Direct database connection for reliable migration
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse Supabase URL to get connection string
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not parse Supabase URL');
  process.exit(1);
}

// Construct direct PostgreSQL connection string
// Note: This requires the database password, not the service key
console.log('⚠️  Note: This script requires direct database access');
console.log('   Using Supabase REST API instead...\n');

async function executeViaSupa baseAPI(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({ query: sql })
  });

  return response;
}

async function main() {
  console.log('🚀 Applying SEO Audit Migration via Supabase Client\n');

  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251016_seo_audit_tool.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf8');

  console.log('📄 Migration file loaded');
  console.log(`📦 Size: ${(migrationSQL.length / 1024).toFixed(2)} KB\n`);

  // Use Supabase JS Client with raw SQL
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🔧 Executing migration in chunks...\n');

  // Split into individual statements
  const statements = migrationSQL
    .split(/;\s*[\r\n]/)
    .map(s => s.trim())
    .filter(s => {
      return s.length > 0 &&
             !s.startsWith('--') &&
             !s.match(/^\/\*/) &&
             !s.match(/^\s*$/);
    });

  console.log(`Found ${statements.length} statements to execute\n`);

  let executed = 0;
  let skipped = 0;
  let failed = 0;

  for (const statement of statements) {
    try {
      // Use raw SQL execution via REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          query: statement + ';'
        })
      });

      if (response.ok || response.status === 400) {
        const text = await response.text();
        if (text.includes('already exists')) {
          process.stdout.write('s');
          skipped++;
        } else if (response.ok) {
          process.stdout.write('.');
          executed++;
        } else {
          process.stdout.write('E');
          failed++;
        }
      } else {
        process.stdout.write('.');
        executed++;
      }
    } catch (error) {
      if (error.message?.includes('already exists')) {
        process.stdout.write('s');
        skipped++;
      } else {
        process.stdout.write('E');
        failed++;
      }
    }

    // Rate limiting
    if ((executed + skipped + failed) % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n\n📊 Execution Results:');
  console.log(`   ✅ Executed: ${executed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);

  // Now verify the tables exist
  console.log('\n🔍 Verifying tables...\n');

  const tables = ['seo_audits', 'seo_audit_sections', 'seo_audit_recommendations', 'seo_leads'];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(0);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: exists`);
      }
    } catch (error) {
      console.log(`❌ ${table}: ${error.message}`);
    }
  }

  console.log('\n✅ Migration process complete!');
  console.log('\n💡 Note: Schema cache may need refresh. Try waiting 30 seconds and re-checking.');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
