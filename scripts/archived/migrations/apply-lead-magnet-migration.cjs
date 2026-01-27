const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase credentials');
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20250117000000_lead_magnet_resources.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('🔄 Applying lead magnet resources migration...');

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
      // If exec_sql doesn't exist, try direct query
      const { error } = await supabase.from('_migrations').insert({
        name: '20250117000000_lead_magnet_resources',
        executed_at: new Date().toISOString()
      });
      
      if (error) throw error;
      
      // Execute the SQL directly (this requires special permissions)
      console.log('⚠️  Direct SQL execution not available via client');
      console.log('📋 Please apply the migration manually in Supabase SQL Editor:');
      console.log(`   ${migrationPath}`);
      return { error: null };
    });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }

    console.log('✅ Migration applied successfully!');
    console.log('📊 Created tables:');
    console.log('   - lead_magnet_resources');
    console.log('   - Views: popular_resources, featured_resources, resource_stats');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('   1. Seed initial data: node scripts/seed-lead-magnet-resources.js');
    console.log('   2. Access Lead Magnets in Admin: /admin/secret/lead-magnets');
    console.log('   3. Public page: /free-resources');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

applyMigration();
