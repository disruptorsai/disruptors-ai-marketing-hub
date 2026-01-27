// Generate SQL INSERT statements for direct database import
import { writeFileSync } from 'fs';

const OLD_PROJECT = {
  url: 'https://ubqxflzuvxowigbjmqfb.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicXhmbHp1dnhvd2lnYmptcWZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODUxMjQzOCwiZXhwIjoyMDc0MDg4NDM4fQ.FnhnaAxWjMo41M7Gmm_bXFXZuegzW5HfitvB1APNDDk'
};

async function fetchAll(table) {
  const response = await fetch(`${OLD_PROJECT.url}/rest/v1/${table}?select=*`, {
    headers: {
      'apikey': OLD_PROJECT.serviceRoleKey,
      'Authorization': `Bearer ${OLD_PROJECT.serviceRoleKey}`
    }
  });
  if (!response.ok) return [];
  return response.json();
}

function escapeSQL(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return value.toString();
  if (Array.isArray(value)) return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

function generateInsert(table, row, columns) {
  const values = columns.map(col => escapeSQL(row[col]));
  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT (id) DO NOTHING;`;
}

async function main() {
  let sql = `-- Direct SQL Import for Business Brain Data
-- Run this in the NEW Supabase project's SQL Editor
-- Generated: ${new Date().toISOString()}

`;

  // business_brains - only essential columns
  console.log('Fetching business_brains...');
  const brains = await fetchAll('business_brains');
  const brainCols = ['id', 'slug', 'name', 'business_name', 'tagline', 'description', 'industry', 'primary_website', 'brain_level', 'confidence_score', 'total_facts', 'created_at', 'updated_at'];

  sql += `-- business_brains (${brains.length} rows)\n`;
  for (const row of brains) {
    sql += generateInsert('business_brains', row, brainCols) + '\n';
  }

  // brain_facts
  console.log('Fetching brain_facts...');
  const facts = await fetchAll('brain_facts');
  const factCols = ['id', 'brain_id', 'fact_text', 'fact_type', 'category', 'source_type', 'confidence', 'is_current', 'created_at', 'updated_at'];

  sql += `\n-- brain_facts (${facts.length} rows)\n`;
  for (const row of facts) {
    // Clean up the data
    const cleaned = {
      ...row,
      fact_text: row.fact_text || row.content || 'Imported fact',
      fact_type: row.fact_type || 'custom',
      category: row.category || 'general',
      source_type: row.source_type || 'manual_entry',
      confidence: row.confidence || 0.5,
      is_current: row.is_current !== false
    };
    if (cleaned.fact_text && cleaned.fact_text.length >= 10) {
      sql += generateInsert('brain_facts', cleaned, factCols) + '\n';
    }
  }

  // brand_rules
  console.log('Fetching brand_rules...');
  const rules = await fetchAll('brand_rules');
  const ruleCols = ['id', 'brain_id', 'rule_category', 'rule_type', 'rule_text', 'priority', 'is_active', 'created_at', 'updated_at'];

  sql += `\n-- brand_rules (${rules.length} rows)\n`;
  for (const row of rules) {
    const cleaned = {
      ...row,
      rule_category: row.rule_category || row.category || 'style',
      rule_type: row.rule_type || row.type || 'general',
      rule_text: row.rule_text || row.content || 'Imported rule',
      priority: row.priority || 5,
      is_active: row.is_active !== false
    };
    if (cleaned.rule_text) {
      sql += generateInsert('brand_rules', cleaned, ruleCols) + '\n';
    }
  }

  sql += `\n-- Import complete!\nSELECT 'Imported ' || count(*) || ' business_brains' FROM business_brains;\nSELECT 'Imported ' || count(*) || ' brain_facts' FROM brain_facts;\nSELECT 'Imported ' || count(*) || ' brand_rules' FROM brand_rules;\n`;

  const outPath = 'scripts/supabase-migration/INSERT_BRAIN_DATA.sql';
  writeFileSync(outPath, sql);
  console.log(`\n✅ Generated: ${outPath}`);
  console.log(`   business_brains: ${brains.length} rows`);
  console.log(`   brain_facts: ${facts.length} rows`);
  console.log(`   brand_rules: ${rules.length} rows`);
}

main().catch(console.error);
