#!/usr/bin/env node

/**
 * Execute SEO Audit Migration using Supabase Management API
 * This script properly executes the migration SQL
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Extract project reference
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

async function executeSQLQuery(query) {
  try {
    // Use the PostgREST API to execute raw SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'params=single-object'
      },
      body: JSON.stringify({
        query: query
      })
    });

    const contentType = response.headers.get('content-type');
    let result;

    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = await response.text();
    }

    if (!response.ok) {
      // Not necessarily an error - might be "already exists"
      if (typeof result === 'string') {
        if (result.includes('already exists') ||
            result.includes('duplicate key') ||
            result.includes('relation') && result.includes('exists')) {
          return { success: true, skipped: true };
        }
      } else if (result.message) {
        if (result.message.includes('already exists') ||
            result.message.includes('duplicate key')) {
          return { success: true, skipped: true };
        }
      }

      return { success: false, error: result };
    }

    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Executing SEO Audit Migration\n');
  console.log(`Project: ${projectRef}`);
  console.log(`URL: ${supabaseUrl}\n`);

  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251016_seo_audit_tool.sql');
  console.log(`📄 Reading: ${migrationPath}\n`);

  const migrationSQL = readFileSync(migrationPath, 'utf8');

  // Execute the entire migration as one transaction
  console.log('🔧 Executing full migration SQL...\n');

  const result = await executeSQLQuery(migrationSQL);

  if (result.success) {
    if (result.skipped) {
      console.log('✅ Migration SQL executed (some objects already existed)');
    } else {
      console.log('✅ Migration SQL executed successfully');
    }
  } else {
    console.log('⚠️  Migration execution encountered issues:');
    console.log(JSON.stringify(result.error, null, 2));
    console.log('\n💡 Trying statement-by-statement execution...\n');

    // Fall back to statement-by-statement
    const statements = migrationSQL
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/));

    console.log(`Found ${statements.length} statements\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.substring(0, 50).replace(/\n/g, ' ') + '...';

      const result = await executeSQLQuery(stmt + ';');

      if (result.success) {
        if (result.skipped) {
          process.stdout.write('s');
          skipCount++;
        } else {
          process.stdout.write('.');
          successCount++;
        }
      } else {
        process.stdout.write('E');
        errorCount++;

        if (errorCount <= 5) {
          console.log(`\n⚠️  Statement ${i + 1} error:`);
          console.log(`   ${preview}`);
          console.log(`   Error: ${JSON.stringify(result.error)}`);
        }
      }

      // Rate limiting
      if (i % 10 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`\n\n📊 Results:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
  }

  // Now verify by querying information_schema
  console.log('\n🔍 Verifying tables in database...\n');

  const verifyQuery = `
    SELECT table_name, table_type
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('seo_audits', 'seo_audit_sections', 'seo_audit_recommendations', 'seo_leads')
    ORDER BY table_name;
  `;

  const verifyResult = await executeSQLQuery(verifyQuery);

  if (verifyResult.success && verifyResult.result) {
    console.log('✅ Tables found in information_schema:');
    if (Array.isArray(verifyResult.result)) {
      verifyResult.result.forEach(row => {
        console.log(`   • ${row.table_name} (${row.table_type})`);
      });
    } else {
      console.log('   (Results format:', typeof verifyResult.result, ')');
    }
  } else {
    console.log('⚠️  Could not query information_schema');
  }

  console.log('\n✅ Migration execution complete!');
  console.log('\n💡 Note: Supabase schema cache may take 30-60 seconds to refresh.');
  console.log('   If tables don\'t appear immediately, wait and try again.\n');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
