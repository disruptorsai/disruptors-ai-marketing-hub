/**
 * Apply Business Brain Infrastructure Migration
 *
 * Applies the complete database schema to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function applyMigration() {
  console.log('🚀 Starting Business Brain Infrastructure Migration...\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250107_business_brain_infrastructure.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded:', migrationPath);
    console.log('📏 Migration size:', migrationSQL.length, 'characters\n');

    // Execute migration using Supabase RPC
    console.log('⚙️  Executing migration...');

    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      // RPC might not exist, try direct query
      console.log('⚠️  RPC method not available, trying direct execution...\n');

      // Split by statement and execute individually
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];

        // Skip comments and empty statements
        if (statement.startsWith('--') || statement.length < 10) {
          continue;
        }

        try {
          // For CREATE EXTENSION, CREATE TABLE, etc.
          const { error: stmtError } = await supabase.rpc('exec', {
            query: statement + ';'
          });

          if (stmtError) {
            // If RPC doesn't work, this approach won't work either
            console.error(`\n❌ Unable to execute SQL via Supabase client.`);
            console.error(`\nPlease apply the migration manually:`);
            console.error(`1. Go to: ${SUPABASE_URL.replace('https://', 'https://app.supabase.com/project/')}/editor`);
            console.error(`2. Open SQL Editor`);
            console.error(`3. Copy the contents of: supabase/migrations/20250107_business_brain_infrastructure.sql`);
            console.error(`4. Execute the migration\n`);
            process.exit(1);
          }

          successCount++;
          process.stdout.write(`✓ ${successCount}/${statements.length} `);

        } catch (err) {
          errorCount++;
          console.error(`\n❌ Error on statement ${i + 1}:`, err.message);
        }
      }

      console.log(`\n\n✅ Migration completed: ${successCount} successful, ${errorCount} errors\n`);
    } else {
      console.log('✅ Migration executed successfully!\n');
    }

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', [
        'business_brains',
        'brain_facts',
        'brand_rules',
        'brand_assets',
        'onboarding_sessions',
        'knowledge_sources',
        'posts_brain_facts'
      ]);

    if (tablesError) {
      console.error('⚠️  Could not verify tables:', tablesError.message);
      console.log('\n📌 Please verify manually in Supabase Dashboard\n');
    } else {
      console.log('✅ Tables verified:\n');
      tables?.forEach(t => console.log(`   - ${t.table_name}`));
      console.log('');
    }

    console.log('🎉 Migration process complete!\n');
    console.log('Next steps:');
    console.log('1. Verify all tables exist in Supabase Dashboard');
    console.log('2. Deploy Netlify functions');
    console.log('3. Test function endpoints\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\n📌 Manual application required:');
    console.error(`1. Go to: ${SUPABASE_URL.replace('https://', 'https://app.supabase.com/project/')}/editor`);
    console.error(`2. Open SQL Editor`);
    console.error(`3. Copy the contents of: supabase/migrations/20250107_business_brain_infrastructure.sql`);
    console.error(`4. Execute the migration\n`);
    process.exit(1);
  }
}

applyMigration();
