import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Reading migration file...\n');

  const migrationSQL = readFileSync('supabase/migrations/add_services_fields.sql', 'utf8');

  // Split the SQL into individual statements (rough split by semicolon)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements\n`);
  console.log('Executing migration...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    if (statement.startsWith('--') || statement.trim() === '') continue;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        // Try direct query if RPC doesn't work
        const response = await fetch(
          `${supabaseUrl}/rest/v1/rpc/exec_sql`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ query: statement })
          }
        );

        if (!response.ok) {
          console.log('⚠ Statement skipped (may already exist):', statement.substring(0, 60) + '...');
          errorCount++;
          continue;
        }
      }

      console.log('✓ Executed:', statement.substring(0, 60) + '...');
      successCount++;
    } catch (err) {
      console.log('⚠ Error on statement:', statement.substring(0, 60) + '...');
      console.log('  ', err.message);
      errorCount++;
    }
  }

  console.log(`\nMigration complete:`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Errors/Skipped: ${errorCount}`);
}

runMigration().catch(console.error);
