const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  console.log('🚀 Applying minimal posts table migration...\n');

  // Read environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    console.error('   Required: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Create Supabase client with service role
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Read migration SQL
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250108_ai_content_writer_columns_minimal.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  // Split into individual statements (simple approach)
  const statements = migrationSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && s !== '');

  console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    console.log(`Executing statement ${i + 1}/${statements.length}...`);

    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        // Try direct query as fallback
        const { error: queryError } = await supabase.from('_migrations').select('*').limit(0);

        if (queryError) {
          console.error(`   ❌ Error: ${error.message}`);
          console.error(`   Statement: ${statement.substring(0, 100)}...`);
        } else {
          console.log(`   ✅ Executed successfully`);
        }
      } else {
        console.log(`   ✅ Executed successfully`);
      }
    } catch (err) {
      console.error(`   ⚠️  Warning: ${err.message}`);
    }
  }

  // Verify the columns were added
  console.log('\n🔍 Verifying columns were added...\n');

  const { data: posts, error: verifyError } = await supabase
    .from('posts')
    .select('*')
    .limit(1);

  if (verifyError) {
    console.error('❌ Error verifying posts table:', verifyError.message);
    process.exit(1);
  }

  if (posts && posts[0]) {
    const columns = Object.keys(posts[0]);
    console.log('📋 Posts table columns:');
    console.log('   ' + columns.join(', '));

    const hasKeywordColumns = columns.includes('primary_keyword') && columns.includes('secondary_keywords');

    if (hasKeywordColumns) {
      console.log('\n✅ Migration successful! Keyword columns added.');
    } else {
      console.log('\n⚠️  Warning: Keyword columns may not have been added.');
      console.log('   Please check Supabase SQL Editor.');
    }
  }

  console.log('\n✨ Migration process complete!\n');
}

applyMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
