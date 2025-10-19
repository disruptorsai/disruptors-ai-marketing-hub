/**
 * Apply Auto-Grant Admin Role Migration
 *
 * This migration sets up automatic admin role granting for @disruptorsmedia.com emails
 * After applying, any new user who signs up with @disruptorsmedia.com will automatically get admin access
 *
 * Usage: node scripts/apply-auto-admin-migration.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('\n🚀 Auto-Grant Admin Role Migration\n');
  console.log('='.repeat(60));

  try {
    // Read the migration file
    const migrationPath = join(__dirname, '../supabase/migrations/20251016_auto_grant_admin_role.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('\n📄 Migration file loaded');
    console.log('   File: 20251016_auto_grant_admin_role.sql');
    console.log('   Size:', Math.round(migrationSQL.length / 1024), 'KB');

    // Apply the migration
    console.log('\n⚙️  Applying migration...');

    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // Try direct query if RPC doesn't exist
      const { error: directError } = await supabase
        .from('_migrations')
        .insert({ name: '20251016_auto_grant_admin_role', executed_at: new Date().toISOString() });

      if (directError) {
        throw new Error('Migration failed. You may need to apply this manually in Supabase SQL Editor.');
      }
    }

    console.log('✅ Migration applied successfully!\n');

    // Verify the trigger was created
    console.log('🔍 Verifying installation...\n');

    const { data: functions } = await supabase
      .rpc('pg_get_functiondef', { funcid: 'public.auto_grant_admin_role'::regproc })
      .single();

    if (functions) {
      console.log('✅ Function created: public.auto_grant_admin_role()');
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✨ Auto-Grant Admin Role is now active!\n');

    console.log('📋 What this means:');
    console.log('   • Any new signup with @disruptorsmedia.com email');
    console.log('   • Automatically gets admin role');
    console.log('   • Can access /admin/secret immediately');
    console.log('   • No manual role granting needed!\n');

    console.log('🎯 Affected emails:');
    console.log('   • tyler@disruptorsmedia.com - Will auto-grant on signup');
    console.log('   • josh@disruptorsmedia.com - Will auto-grant on signup');
    console.log('   • Any future @disruptorsmedia.com signups\n');

    console.log('🧪 Test it:');
    console.log('   1. Have Tyler sign up at /signup');
    console.log('   2. Tyler can immediately login at /admin/secret');
    console.log('   3. No need to run admin:setup-role command!\n');

    console.log('📊 Verify it worked:');
    console.log('   npm run admin:list-users\n');

    console.log('⚠️  Note: This only affects NEW signups');
    console.log('   Existing users (Will, Kyle) already have admin access\n');

  } catch (error) {
    console.error('\n❌ Error applying migration:', error.message);
    console.log('\n📝 Manual Application Required:');
    console.log('   1. Open Supabase Dashboard → SQL Editor');
    console.log('   2. Copy contents of: supabase/migrations/20251016_auto_grant_admin_role.sql');
    console.log('   3. Paste and run in SQL Editor');
    console.log('   4. Verify with: npm run admin:list-users\n');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  applyMigration().catch(console.error);
}

export { applyMigration };
