// Improved Data Migration - handles column mismatches
// Exports from OLD, filters columns, imports to NEW

const OLD_PROJECT = {
  url: 'https://ubqxflzuvxowigbjmqfb.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicXhmbHp1dnhvd2lnYmptcWZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODUxMjQzOCwiZXhwIjoyMDc0MDg4NDM4fQ.FnhnaAxWjMo41M7Gmm_bXFXZuegzW5HfitvB1APNDDk'
};

const NEW_PROJECT = {
  url: 'https://ulfnzcniivkjtfaoxfmi.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZm56Y25paXZranRmYW94Zm1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQzNjQ1MSwiZXhwIjoyMDg0MDEyNDUxfQ.kt9Y2zWkz6UV2rbyJnEZBRvaoc58bYdYW--YK5XpvDo'
};

// Define which columns to migrate for each table (only common columns)
const TABLE_COLUMNS = {
  site_media: ['id', 'media_key', 'media_type', 'media_url', 'page_slug', 'section_name', 'purpose', 'alt_text', 'caption', 'title', 'width', 'height', 'file_size', 'mime_type', 'cloudinary_public_id', 'cloudinary_folder', 'cloudinary_version', 'cloudinary_format', 'display_order', 'is_active', 'is_featured', 'lazy_load', 'seo_optimized', 'accessibility_checked', 'tags', 'metadata', 'created_at', 'updated_at'],
  posts: ['id', 'title', 'slug', 'excerpt', 'content', 'content_type', 'featured_image', 'gallery_images', 'author_id', 'category', 'tags', 'read_time_minutes', 'is_featured', 'is_published', 'published_at', 'seo_title', 'seo_description', 'seo_keywords', 'is_landing_page', 'primary_keyword', 'secondary_keywords', 'created_at', 'updated_at'],
  business_brains: ['id', 'slug', 'name', 'business_name', 'tagline', 'description', 'industry', 'founded_year', 'company_size', 'primary_website', 'primary_email', 'primary_phone', 'headquarters_city', 'headquarters_state', 'headquarters_country', 'service_areas', 'ideal_customer_profile', 'core_offerings', 'unique_value_propositions', 'key_differentiators', 'pain_points_solved', 'target_keywords', 'competitor_urls', 'brand_colors', 'typography', 'logo_urls', 'design_style', 'brand_voice', 'tone_attributes', 'writing_style', 'vocabulary_level', 'content_pillars', 'content_formats', 'publishing_frequency', 'seasonal_campaigns', 'brain_level', 'confidence_score', 'total_facts', 'last_trained_at', 'last_enhanced_at', 'auto_initialized', 'onboarding_completed', 'web_scrape_completed', 'brand_colors_extracted', 'integrations_connected', 'created_at', 'updated_at', 'created_by'],
  brain_facts: ['id', 'brain_id', 'fact_text', 'fact_type', 'category', 'subcategory', 'source_type', 'source_url', 'keywords', 'confidence', 'importance', 'verified', 'usage_count', 'last_used_at', 'version', 'is_current', 'created_at', 'updated_at', 'created_by'],
  brand_rules: ['id', 'brain_id', 'rule_category', 'rule_type', 'rule_text', 'applies_to', 'priority', 'good_examples', 'bad_examples', 'is_active', 'created_at', 'updated_at', 'created_by'],
  brand_assets: ['id', 'brain_id', 'asset_type', 'asset_url', 'thumbnail_url', 'cloudinary_public_id', 'name', 'description', 'alt_text', 'tags', 'dominant_colors', 'width', 'height', 'file_size', 'file_format', 'usage_context', 'is_primary', 'uploaded_at', 'uploaded_by', 'created_at', 'updated_at'],
  modules: ['id', 'slug', 'name', 'description', 'category', 'status', 'version', 'audience', 'requires_brain', 'requires_auth', 'runtime_preference', 'entry_point', 'function_endpoint', 'component_path', 'icon_url', 'color', 'tags', 'input_schema', 'output_schema', 'config_schema', 'wordpress_compatible', 'wordpress_shortcode', 'wordpress_block', 'wordpress_embed_type', 'supports_batch', 'has_preview', 'is_experimental', 'default_daily_limit', 'default_monthly_limit', 'default_cost_per_run', 'documentation_url', 'changelog', 'created_by', 'created_at', 'updated_at', 'last_run_at'],
  settings: ['id', 'key', 'category', 'value_text', 'value_number', 'value_boolean', 'value_json', 'data_type', 'label', 'description', 'is_required', 'is_public', 'validation_rules', 'created_at', 'updated_at'],
  leads: ['id', 'name', 'email', 'phone', 'company', 'job_title', 'website', 'source', 'source_page', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'status', 'score', 'interest_level', 'assigned_to', 'last_contact_date', 'next_follow_up_date', 'contacted', 'notes', 'tags', 'custom_fields', 'created_at', 'updated_at'],
  keywords: ['id', 'keyword', 'keyword_hash', 'discovery_source', 'discovery_location', 'discovery_language', 'discovered_at', 'search_volume', 'cpc', 'competition', 'keyword_difficulty', 'trend_score', 'monthly_volumes', 'opportunity_score', 'priority', 'keyword_type', 'search_intent', 'assignment_status', 'assigned_post_id', 'assigned_at', 'notes', 'created_at', 'updated_at']
};

const TABLES_TO_MIGRATE = ['site_media', 'posts', 'business_brains', 'brain_facts', 'brand_rules', 'modules', 'settings'];

async function fetchAllFromTable(project, tableName, columns) {
  const columnList = columns.join(',');
  const allData = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const response = await fetch(
      `${project.url}/rest/v1/${tableName}?select=${columnList}&limit=${limit}&offset=${offset}`,
      {
        headers: {
          'apikey': project.serviceRoleKey,
          'Authorization': `Bearer ${project.serviceRoleKey}`,
          'Prefer': 'return=representation'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      if (error.code === '42P01' || error.code === 'PGRST204') {
        return { exists: false, data: [] };
      }
      // If column doesn't exist, try without specific columns
      if (error.message && error.message.includes('column')) {
        console.log(`   ⚠️  Some columns don't exist, fetching all...`);
        return await fetchAllFromTableBasic(project, tableName);
      }
      throw new Error(`Failed to fetch ${tableName}: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    allData.push(...data);

    if (data.length < limit) break;
    offset += limit;
  }

  return { exists: true, data: allData };
}

async function fetchAllFromTableBasic(project, tableName) {
  const response = await fetch(
    `${project.url}/rest/v1/${tableName}?select=*`,
    {
      headers: {
        'apikey': project.serviceRoleKey,
        'Authorization': `Bearer ${project.serviceRoleKey}`
      }
    }
  );

  if (!response.ok) {
    return { exists: false, data: [] };
  }

  const data = await response.json();
  return { exists: true, data };
}

function filterColumns(data, allowedColumns) {
  return data.map(row => {
    const filtered = {};
    for (const col of allowedColumns) {
      if (row.hasOwnProperty(col)) {
        filtered[col] = row[col];
      }
    }
    return filtered;
  });
}

async function insertIntoTable(project, tableName, data) {
  if (data.length === 0) return { inserted: 0 };

  const batchSize = 50;
  let totalInserted = 0;
  let lastError = null;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    const response = await fetch(
      `${project.url}/rest/v1/${tableName}`,
      {
        method: 'POST',
        headers: {
          'apikey': project.serviceRoleKey,
          'Authorization': `Bearer ${project.serviceRoleKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal,resolution=ignore-duplicates'
        },
        body: JSON.stringify(batch)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      lastError = error.message || JSON.stringify(error);
    } else {
      totalInserted += batch.length;
    }
  }

  return { inserted: totalInserted, error: lastError };
}

async function migrateTable(tableName) {
  console.log(`\n📦 Migrating: ${tableName}`);
  const columns = TABLE_COLUMNS[tableName] || [];

  // Export from OLD
  console.log(`   Exporting from OLD project...`);
  const { exists, data } = await fetchAllFromTable(OLD_PROJECT, tableName, columns);

  if (!exists) {
    console.log(`   ⏭️  Table doesn't exist in OLD project`);
    return { table: tableName, exported: 0, imported: 0, status: 'skipped' };
  }

  if (data.length === 0) {
    console.log(`   ⏭️  No data to migrate`);
    return { table: tableName, exported: 0, imported: 0, status: 'empty' };
  }

  console.log(`   ✅ Exported ${data.length} rows`);

  // Filter to only allowed columns
  const filteredData = filterColumns(data, columns);

  // Import to NEW
  console.log(`   Importing to NEW project...`);
  const { inserted, error } = await insertIntoTable(NEW_PROJECT, tableName, filteredData);

  if (error) {
    console.log(`   ⚠️  Error: ${error}`);
  }
  console.log(`   ✅ Imported ${inserted} rows`);

  return { table: tableName, exported: data.length, imported: inserted, status: inserted > 0 ? 'success' : 'partial' };
}

async function main() {
  console.log('='.repeat(60));
  console.log('SUPABASE DATA MIGRATION v2 (Column-Safe)');
  console.log('='.repeat(60));
  console.log(`FROM: ${OLD_PROJECT.url}`);
  console.log(`TO:   ${NEW_PROJECT.url}`);
  console.log('='.repeat(60));

  const results = [];

  for (const table of TABLES_TO_MIGRATE) {
    try {
      const result = await migrateTable(table);
      results.push(result);
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      results.push({ table, exported: 0, imported: 0, status: 'error' });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('MIGRATION SUMMARY');
  console.log('='.repeat(60));

  let totalExported = 0;
  let totalImported = 0;

  for (const r of results) {
    const icon = r.status === 'success' ? '✅' : r.status === 'partial' ? '⚠️' : r.status === 'empty' ? '⏭️' : '❌';
    console.log(`${icon} ${r.table.padEnd(20)} ${r.exported} → ${r.imported}`);
    totalExported += r.exported;
    totalImported += r.imported;
  }

  console.log('-'.repeat(60));
  console.log(`TOTAL: ${totalExported} exported, ${totalImported} imported`);
  console.log('='.repeat(60));
}

main().catch(console.error);
