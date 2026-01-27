// Migrate remaining tables with special handling
const OLD_PROJECT = {
  url: 'https://ubqxflzuvxowigbjmqfb.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicXhmbHp1dnhvd2lnYmptcWZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODUxMjQzOCwiZXhwIjoyMDc0MDg4NDM4fQ.FnhnaAxWjMo41M7Gmm_bXFXZuegzW5HfitvB1APNDDk'
};

const NEW_PROJECT = {
  url: 'https://ulfnzcniivkjtfaoxfmi.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZm56Y25paXZranRmYW94Zm1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQzNjQ1MSwiZXhwIjoyMDg0MDEyNDUxfQ.kt9Y2zWkz6UV2rbyJnEZBRvaoc58bYdYW--YK5XpvDo'
};

async function fetchAll(project, table) {
  const response = await fetch(`${project.url}/rest/v1/${table}?select=*`, {
    headers: {
      'apikey': project.serviceRoleKey,
      'Authorization': `Bearer ${project.serviceRoleKey}`
    }
  });
  if (!response.ok) return [];
  return response.json();
}

async function insertRows(project, table, rows) {
  if (rows.length === 0) return 0;

  let inserted = 0;
  for (const row of rows) {
    const response = await fetch(`${project.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': project.serviceRoleKey,
        'Authorization': `Bearer ${project.serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(row)
    });
    if (response.ok) inserted++;
    else {
      const err = await response.json();
      if (!err.message?.includes('duplicate')) {
        console.log(`     Row error: ${err.message?.substring(0, 80)}`);
      }
    }
  }
  return inserted;
}

async function migrateBusinessBrains() {
  console.log('\n📦 Migrating: business_brains (removing user references)');
  const data = await fetchAll(OLD_PROJECT, 'business_brains');
  console.log(`   Exported ${data.length} rows`);

  // Remove created_by to avoid FK constraint
  const cleaned = data.map(row => {
    const { created_by, organization_id, ...rest } = row;
    return rest;
  });

  const inserted = await insertRows(NEW_PROJECT, 'business_brains', cleaned);
  console.log(`   ✅ Imported ${inserted} rows`);
  return inserted;
}

async function migrateBrainFacts() {
  console.log('\n📦 Migrating: brain_facts');
  const data = await fetchAll(OLD_PROJECT, 'brain_facts');
  console.log(`   Exported ${data.length} rows`);

  // Map old column names to new and clean data
  const cleaned = data.map(row => ({
    id: row.id,
    brain_id: row.brain_id,
    fact_text: row.fact_text || row.content || row.text || 'Imported fact',
    fact_type: row.fact_type || 'custom',
    category: row.category || 'general',
    subcategory: row.subcategory,
    source_type: row.source_type || 'manual_entry',
    source_url: row.source_url,
    keywords: row.keywords,
    confidence: row.confidence || 0.5,
    importance: row.importance,
    verified: row.verified || false,
    usage_count: row.usage_count || 0,
    version: row.version || 1,
    is_current: row.is_current !== false,
    created_at: row.created_at,
    updated_at: row.updated_at
  })).filter(r => r.fact_text && r.fact_text.length >= 10);

  const inserted = await insertRows(NEW_PROJECT, 'brain_facts', cleaned);
  console.log(`   ✅ Imported ${inserted} rows`);
  return inserted;
}

async function migrateBrandRules() {
  console.log('\n📦 Migrating: brand_rules');
  const data = await fetchAll(OLD_PROJECT, 'brand_rules');
  console.log(`   Exported ${data.length} rows`);

  // Map old column names to new
  const cleaned = data.map(row => ({
    id: row.id,
    brain_id: row.brain_id,
    rule_category: row.rule_category || row.category || 'style',
    rule_type: row.rule_type || row.type || 'general',
    rule_text: row.rule_text || row.content || row.text || 'Imported rule',
    applies_to: row.applies_to,
    priority: row.priority || 5,
    good_examples: row.good_examples,
    bad_examples: row.bad_examples,
    is_active: row.is_active !== false,
    created_at: row.created_at,
    updated_at: row.updated_at
  })).filter(r => r.rule_text);

  const inserted = await insertRows(NEW_PROJECT, 'brand_rules', cleaned);
  console.log(`   ✅ Imported ${inserted} rows`);
  return inserted;
}

async function main() {
  console.log('='.repeat(50));
  console.log('MIGRATING REMAINING TABLES');
  console.log('='.repeat(50));

  const bb = await migrateBusinessBrains();
  const bf = await migrateBrainFacts();
  const br = await migrateBrandRules();

  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`business_brains: ${bb}`);
  console.log(`brain_facts: ${bf}`);
  console.log(`brand_rules: ${br}`);
  console.log(`TOTAL: ${bb + bf + br} additional rows`);
}

main().catch(console.error);
