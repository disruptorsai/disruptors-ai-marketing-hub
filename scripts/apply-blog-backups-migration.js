/**
 * Apply Blog Content Backups Migration
 * Applies the blog_content_backups table migration to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function applyMigration() {
  console.log('📦 Applying blog_content_backups migration...\n');

  try {
    // Read migration file
    const migrationPath = join(__dirname, '../supabase/migrations/20251021_blog_content_backups.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL loaded');
    console.log('🔧 Executing migration...\n');

    // Execute migration (note: this might not work directly via JS client)
    // Supabase JS client doesn't support raw SQL execution with CREATE TABLE
    // We need to use the SQL editor or supabase CLI

    console.log('⚠️  Note: Supabase JS client cannot execute CREATE TABLE statements directly.\n');
    console.log('Please apply this migration via one of these methods:\n');
    console.log('1. Supabase Dashboard SQL Editor:');
    console.log('   https://app.supabase.com/project/YOUR_PROJECT/sql\n');
    console.log('2. Or use this SQL:\n');
    console.log('─'.repeat(80));
    console.log(migrationSQL);
    console.log('─'.repeat(80));
    console.log('\nFor now, I will check if the table already exists...\n');

    // Check if table exists by trying to query it
    const { data, error } = await supabase
      .from('blog_content_backups')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      console.log('❌ Table blog_content_backups does not exist yet');
      console.log('\n✅ Solution: I will create it using RPC or continue without it for now');
      console.log('   Backups will be skipped if table does not exist\n');
      return false;
    } else if (error) {
      console.log('⚠️  Error checking table:', error.message);
      return false;
    } else {
      console.log('✅ Table blog_content_backups already exists!');
      console.log(`   Found ${data?.length || 0} existing backup records\n`);
      return true;
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

applyMigration().then(exists => {
  if (exists) {
    console.log('Migration verified successfully! ✅\n');
  } else {
    console.log('Migration needs to be applied manually via SQL Editor\n');
  }
});
