const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log('🔍 Checking for Business Brain tables...\n');

  const tables = [
    'business_brains',
    'brain_facts',
    'brand_rules',
    'brand_assets',
    'onboarding_sessions',
    'knowledge_sources'
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('count');

    if (error) {
      console.log(`❌ ${table}: NOT FOUND`);
    } else {
      console.log(`✅ ${table}: EXISTS`);
    }
  }
}

checkTables();
