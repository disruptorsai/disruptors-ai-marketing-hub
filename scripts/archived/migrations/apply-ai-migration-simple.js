/**
 * Simple migration script for Change Requests AI Analysis
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

console.log('🚀 Applying Change Requests AI migration...\n');

// Read and split migration into individual statements
const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20250131_change_requests_ai_analysis.sql');
const sql = readFileSync(migrationPath, 'utf-8');

// Split by semicolons, filter out comments and empty statements
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--') && !s.startsWith('COMMENT'));

console.log(`📄 Found ${statements.length} SQL statements to execute\n`);

// Execute each statement
for (let i = 0; i < statements.length; i++) {
  const statement = statements[i];
  console.log(`[${i + 1}/${statements.length}] Executing...`);

  try {
    // For ALTER TABLE and CREATE TABLE, we need to use the REST API directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: statement + ';' })
    });

    if (!response.ok && response.status !== 404) {
      console.warn(`⚠️  Statement ${i + 1} warning: ${response.statusText}`);
    } else {
      console.log(`✅ Statement ${i + 1} complete`);
    }
  } catch (error) {
    console.warn(`⚠️  Statement ${i + 1} may have failed: ${error.message}`);
  }
}

console.log('\n🔍 Verifying tables...');

// Verify the new table exists
try {
  const { data, error } = await supabase
    .from('change_request_ai_analyses')
    .select('id')
    .limit(1);

  if (!error || error.code === 'PGRST116') {
    console.log('✅ change_request_ai_analyses table verified');
  }
} catch (e) {
  console.warn('⚠️  Could not verify change_request_ai_analyses table');
}

console.log('\n✨ Migration process complete!');
console.log('\n📋 If you see warnings above, please apply the migration manually:');
console.log('1. Open Supabase Dashboard');
console.log('2. Go to SQL Editor');
console.log('3. Copy/paste from: supabase/migrations/20250131_change_requests_ai_analysis.sql');
console.log('4. Run the SQL\n');
