/**
 * Admin Nexus Database Schema Verification
 * Checks which tables exist and reports on missing schema
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials')
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Tables required by Admin Nexus modules
const REQUIRED_TABLES = {
  // Core content tables
  posts: { module: 'Blog Management, Content Management, Data Manager', priority: 'HIGH' },
  team_members: { module: 'Team Management, Data Manager', priority: 'HIGH' },
  services: { module: 'Data Manager', priority: 'HIGH' },
  case_studies: { module: 'Data Manager', priority: 'MEDIUM' },
  testimonials: { module: 'Data Manager', priority: 'MEDIUM' },
  site_media: { module: 'Media Library, Data Manager', priority: 'HIGH' },

  // Lead generation tables
  leads: { module: 'Data Manager', priority: 'HIGH' },
  lead_captures: { module: 'Lead Magnets, Event Submissions', priority: 'HIGH' },
  lead_accesses: { module: 'Lead Magnets, Event Submissions', priority: 'HIGH' },
  lead_magnets: { module: 'Lead Magnets', priority: 'HIGH' },
  contact_submissions: { module: 'Event Submissions, Data Manager', priority: 'HIGH' },

  // Event tables
  event_checkins: { module: 'Event Submissions', priority: 'HIGH' },
  connect_attendances: { module: 'Event Submissions (kiosk)', priority: 'MEDIUM' },
  connect_contacts: { module: 'Event Submissions (kiosk)', priority: 'MEDIUM' },

  // Business Brain tables
  business_brains: { module: 'Business Brain Builder', priority: 'HIGH' },
  brain_facts: { module: 'Business Brain Builder', priority: 'MEDIUM' },
  brain_onboarding_logs: { module: 'Business Brain Builder', priority: 'LOW' },

  // SEO tables
  seo_keywords: { module: 'SEO Suite', priority: 'MEDIUM' },
  seo_audits: { module: 'SEO Audit Tool', priority: 'MEDIUM' },
  seo_issues: { module: 'SEO Audit Tool', priority: 'LOW' },

  // Analytics and telemetry
  telemetry_events: { module: 'Telemetry Dashboard', priority: 'MEDIUM' },
  page_views: { module: 'Data Manager, Analytics', priority: 'LOW' },

  // Future: Brand DNA (not yet implemented)
  brand_profiles: { module: 'Brand DNA Builder (STUB)', priority: 'FUTURE' },
  brand_guidelines: { module: 'Brand DNA Builder (STUB)', priority: 'FUTURE' },
  brand_assets: { module: 'Brand DNA Builder (STUB)', priority: 'FUTURE' },

  // Future: AI Agents (not yet implemented)
  ai_agents: { module: 'Agent Builder (STUB)', priority: 'FUTURE' },
  agent_training_data: { module: 'Agent Builder (STUB)', priority: 'FUTURE' },
  agent_conversations: { module: 'Agent Chat (STUB)', priority: 'FUTURE' },
  agent_chat_sessions: { module: 'Agent Chat (STUB)', priority: 'FUTURE' },
  agent_messages: { module: 'Agent Chat (STUB)', priority: 'FUTURE' },

  // Future: Workflows (not yet implemented)
  workflows: { module: 'Workflow Manager (STUB)', priority: 'FUTURE' },
  workflow_executions: { module: 'Workflow Manager (STUB)', priority: 'FUTURE' },
  workflow_triggers: { module: 'Workflow Manager (STUB)', priority: 'FUTURE' },

  // Future: Integrations (not yet implemented)
  integrations: { module: 'Integrations Hub (STUB)', priority: 'FUTURE' },
  integration_credentials: { module: 'Integrations Hub (STUB)', priority: 'FUTURE' },
  webhooks: { module: 'Integrations Hub (STUB)', priority: 'FUTURE' },
}

async function checkTableExists(tableName) {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .limit(1)

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return { exists: false, error: null }
      }
      return { exists: false, error: error.message }
    }

    return { exists: true, count: count || 0, error: null }
  } catch (err) {
    return { exists: false, error: err.message }
  }
}

async function verifySchema() {
  console.log('🔍 Admin Nexus Database Schema Verification\n')
  console.log('=' .repeat(80))

  const results = {
    existing: [],
    missing: [],
    errors: [],
  }

  const byPriority = {
    HIGH: { existing: [], missing: [] },
    MEDIUM: { existing: [], missing: [] },
    LOW: { existing: [], missing: [] },
    FUTURE: { existing: [], missing: [] },
  }

  // Check each table
  for (const [tableName, info] of Object.entries(REQUIRED_TABLES)) {
    process.stdout.write(`Checking ${tableName}...`)

    const result = await checkTableExists(tableName)

    if (result.exists) {
      console.log(` ✅ EXISTS (${result.count} rows)`)
      results.existing.push({ table: tableName, ...info, count: result.count })
      byPriority[info.priority].existing.push(tableName)
    } else if (result.error && !result.error.includes('does not exist')) {
      console.log(` ⚠️  ERROR: ${result.error}`)
      results.errors.push({ table: tableName, ...info, error: result.error })
    } else {
      console.log(` ❌ MISSING`)
      results.missing.push({ table: tableName, ...info })
      byPriority[info.priority].missing.push(tableName)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('\n📊 Summary\n')

  console.log(`✅ Existing Tables: ${results.existing.length}/${Object.keys(REQUIRED_TABLES).length}`)
  console.log(`❌ Missing Tables: ${results.missing.length}`)
  console.log(`⚠️  Errors: ${results.errors.length}`)

  console.log('\n' + '='.repeat(80))
  console.log('\n🎯 Priority Breakdown\n')

  for (const [priority, tables] of Object.entries(byPriority)) {
    if (tables.missing.length === 0 && priority !== 'FUTURE') {
      console.log(`✅ ${priority} Priority: All tables exist`)
    } else if (priority === 'FUTURE') {
      console.log(`🔮 ${priority}: ${tables.missing.length} planned tables (not yet needed)`)
    } else {
      console.log(`⚠️  ${priority} Priority: ${tables.missing.length} missing tables`)
      tables.missing.forEach(table => {
        const info = REQUIRED_TABLES[table]
        console.log(`   - ${table} (${info.module})`)
      })
    }
  }

  // Critical missing tables
  const criticalMissing = results.missing.filter(t => t.priority === 'HIGH')
  if (criticalMissing.length > 0) {
    console.log('\n' + '='.repeat(80))
    console.log('\n🚨 CRITICAL: Missing HIGH Priority Tables\n')
    criticalMissing.forEach(({ table, module }) => {
      console.log(`❌ ${table}`)
      console.log(`   Required by: ${module}`)
      console.log(`   Impact: Module may not function correctly\n`)
    })
  }

  // Tables with errors
  if (results.errors.length > 0) {
    console.log('\n' + '='.repeat(80))
    console.log('\n⚠️  Tables with Errors\n')
    results.errors.forEach(({ table, module, error }) => {
      console.log(`⚠️  ${table}`)
      console.log(`   Module: ${module}`)
      console.log(`   Error: ${error}\n`)
    })
  }

  // Sample data from existing tables
  console.log('\n' + '='.repeat(80))
  console.log('\n📋 Sample Data Check\n')

  const sampleTables = ['posts', 'team_members', 'lead_captures']
  for (const tableName of sampleTables) {
    if (results.existing.find(t => t.table === tableName)) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (data && data.length > 0) {
        console.log(`✅ ${tableName}: Has data (${Object.keys(data[0]).length} columns)`)
      } else if (data && data.length === 0) {
        console.log(`⚠️  ${tableName}: Table exists but empty`)
      } else if (error) {
        console.log(`❌ ${tableName}: Error reading data - ${error.message}`)
      }
    }
  }

  // Generate migration script suggestions
  if (results.missing.length > 0 && results.missing.some(t => t.priority !== 'FUTURE')) {
    console.log('\n' + '='.repeat(80))
    console.log('\n📝 Next Steps\n')
    console.log('To create missing tables, you need to:')
    console.log('1. Create migration files in supabase/migrations/')
    console.log('2. Apply migrations to Supabase')
    console.log('3. Re-run this verification script\n')

    const highPriorityMissing = results.missing.filter(t => t.priority === 'HIGH')
    if (highPriorityMissing.length > 0) {
      console.log('🚨 START WITH HIGH PRIORITY TABLES:')
      highPriorityMissing.forEach(({ table, module }) => {
        console.log(`   - ${table} (${module})`)
      })
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('\n✨ Verification Complete\n')

  // Exit with error code if critical tables are missing
  if (criticalMissing.length > 0) {
    console.error('❌ Critical tables missing. Admin Nexus may not function correctly.')
    process.exit(1)
  } else {
    console.log('✅ All critical tables present. Admin Nexus should function correctly.')
    process.exit(0)
  }
}

// Run verification
verifySchema().catch(err => {
  console.error('Fatal error during verification:', err)
  process.exit(1)
})
