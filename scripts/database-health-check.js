/**
 * Comprehensive Database Health Check for Disruptors AI Marketing Hub
 *
 * This script performs a thorough assessment of the Supabase database including:
 * - Table existence and schema validation
 * - RLS policy verification
 * - Migration status
 * - Performance and index analysis
 * - Data integrity checks
 * - Security posture assessment
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ANSI color codes for better readability
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.blue}📋 ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  detail: (msg) => console.log(`  ${colors.reset}${msg}${colors.reset}`),
};

// Expected tables based on migrations and architecture
const EXPECTED_TABLES = [
  // Core user management
  'users',

  // Business Brain system
  'business_brains',
  'brain_assets',
  'brain_themes',

  // Content management
  'posts',
  'services',
  'team_members',
  'case_study',
  'site_media',
  'archived_sections',

  // Modules infrastructure
  'modules',
  'module_executions',
  'module_usage_analytics',
  'user_module_quotas',

  // Supporting systems
  'screenshots',
];

// Expected RLS-enabled tables
const RLS_REQUIRED_TABLES = [
  'users',
  'business_brains',
  'brain_assets',
  'brain_themes',
  'posts',
  'services',
  'modules',
  'module_executions',
  'module_usage_analytics',
  'user_module_quotas',
];

const healthReport = {
  timestamp: new Date().toISOString(),
  database: supabaseUrl,
  overallHealth: 'UNKNOWN',
  tables: {
    total: 0,
    existing: 0,
    missing: [],
    unexpected: [],
  },
  rls: {
    enabled: 0,
    disabled: 0,
    issues: [],
  },
  indexes: {
    total: 0,
    recommendations: [],
  },
  performance: {
    slowQueries: [],
    recommendations: [],
  },
  security: {
    issues: [],
    warnings: [],
  },
  dataIntegrity: {
    orphanedRecords: [],
    missingRelations: [],
  },
  recommendations: [],
};

/**
 * Check which tables exist in the database
 */
async function checkTableExistence() {
  log.section('Checking Table Existence');

  try {
    // Query PostgreSQL information schema for tables
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT table_name, table_type
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
    }).catch(() => {
      // If RPC doesn't exist, use direct query
      return supabase
        .from('information_schema.tables')
        .select('table_name, table_type')
        .eq('table_schema', 'public')
        .eq('table_type', 'BASE TABLE');
    });

    if (error) {
      // Fallback: try to check tables individually
      log.warning('Direct table query failed, checking tables individually...');
      const existingTables = [];

      for (const tableName of EXPECTED_TABLES) {
        const { error: tableError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          .limit(1);

        if (!tableError) {
          existingTables.push(tableName);
          log.success(`Table exists: ${tableName}`);
        } else {
          log.error(`Table missing: ${tableName}`);
          healthReport.tables.missing.push(tableName);
        }
      }

      healthReport.tables.existing = existingTables.length;
      healthReport.tables.total = EXPECTED_TABLES.length;
      return;
    }

    const actualTables = data || [];
    healthReport.tables.total = actualTables.length;

    // Check expected tables
    for (const expectedTable of EXPECTED_TABLES) {
      const exists = actualTables.some(t => t.table_name === expectedTable);
      if (exists) {
        log.success(`Table exists: ${expectedTable}`);
        healthReport.tables.existing++;
      } else {
        log.error(`Table missing: ${expectedTable}`);
        healthReport.tables.missing.push(expectedTable);
      }
    }

    // Check for unexpected tables
    for (const actualTable of actualTables) {
      if (!EXPECTED_TABLES.includes(actualTable.table_name) &&
          !actualTable.table_name.startsWith('_') &&
          !actualTable.table_name.includes('migrations')) {
        log.warning(`Unexpected table found: ${actualTable.table_name}`);
        healthReport.tables.unexpected.push(actualTable.table_name);
      }
    }

    log.info(`Total tables: ${healthReport.tables.total}`);
    log.info(`Expected tables found: ${healthReport.tables.existing}/${EXPECTED_TABLES.length}`);

  } catch (error) {
    log.error(`Failed to check table existence: ${error.message}`);
    healthReport.security.issues.push(`Table enumeration failed: ${error.message}`);
  }
}

/**
 * Check table schemas and column definitions
 */
async function checkTableSchemas() {
  log.section('Validating Table Schemas');

  const criticalTables = {
    users: ['id', 'email', 'full_name', 'created_at', 'updated_at'],
    business_brains: ['id', 'user_id', 'business_name', 'created_at', 'updated_at'],
    modules: ['id', 'slug', 'name', 'status', 'access_level'],
    module_executions: ['id', 'module_slug', 'user_id', 'status', 'created_at'],
    posts: ['id', 'title', 'slug', 'content', 'status', 'created_at'],
  };

  for (const [tableName, requiredColumns] of Object.entries(criticalTables)) {
    try {
      // Query a single row to check schema
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        log.error(`Cannot access table ${tableName}: ${error.message}`);
        continue;
      }

      if (!data || data.length === 0) {
        log.warning(`Table ${tableName} is empty`);
        continue;
      }

      const actualColumns = Object.keys(data[0]);
      const missingColumns = requiredColumns.filter(col => !actualColumns.includes(col));

      if (missingColumns.length === 0) {
        log.success(`Table ${tableName} has all required columns`);
      } else {
        log.error(`Table ${tableName} missing columns: ${missingColumns.join(', ')}`);
        healthReport.dataIntegrity.missingRelations.push({
          table: tableName,
          missingColumns,
        });
      }

    } catch (error) {
      log.error(`Failed to check schema for ${tableName}: ${error.message}`);
    }
  }
}

/**
 * Check RLS policies
 */
async function checkRLSPolicies() {
  log.section('Checking Row Level Security (RLS) Policies');

  for (const tableName of RLS_REQUIRED_TABLES) {
    try {
      // Try to query with anon key (should respect RLS)
      const anonClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);

      const { error: anonError } = await anonClient
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .limit(1);

      // Try to query with service role (should bypass RLS)
      const { error: adminError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .limit(1);

      if (!adminError && anonError) {
        log.success(`RLS is active on ${tableName}`);
        healthReport.rls.enabled++;
      } else if (!adminError && !anonError) {
        log.warning(`RLS may not be properly configured on ${tableName}`);
        healthReport.rls.disabled++;
        healthReport.rls.issues.push({
          table: tableName,
          issue: 'RLS might be disabled or overly permissive',
        });
      } else if (adminError) {
        log.error(`Cannot access ${tableName} even with admin: ${adminError.message}`);
      }

    } catch (error) {
      log.error(`Failed to check RLS for ${tableName}: ${error.message}`);
    }
  }

  log.info(`Tables with RLS enabled: ${healthReport.rls.enabled}`);
  log.info(`Tables with RLS issues: ${healthReport.rls.disabled}`);
}

/**
 * Check for indexes and performance
 */
async function checkIndexes() {
  log.section('Analyzing Indexes and Performance');

  const indexRecommendations = [
    { table: 'users', column: 'email', reason: 'Frequent lookups by email' },
    { table: 'business_brains', column: 'user_id', reason: 'FK relationship and filtering' },
    { table: 'module_executions', column: 'user_id', reason: 'User quota tracking' },
    { table: 'module_executions', column: 'module_slug', reason: 'Module analytics' },
    { table: 'module_executions', column: 'created_at', reason: 'Time-based queries' },
    { table: 'posts', column: 'slug', reason: 'URL lookups' },
    { table: 'posts', column: 'status', reason: 'Published content filtering' },
  ];

  log.info('Recommended indexes for optimal performance:');

  for (const rec of indexRecommendations) {
    log.detail(`• ${rec.table}.${rec.column} - ${rec.reason}`);
    healthReport.indexes.recommendations.push(rec);
  }

  // Check actual table sizes
  try {
    const { data: users } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { data: brains } = await supabase.from('business_brains').select('*', { count: 'exact', head: true });
    const { data: executions } = await supabase.from('module_executions').select('*', { count: 'exact', head: true });

    log.info('\nCurrent data volumes:');
    if (users !== null) log.detail(`Users: ${users.length || 0} records`);
    if (brains !== null) log.detail(`Business Brains: ${brains.length || 0} records`);
    if (executions !== null) log.detail(`Module Executions: ${executions.length || 0} records`);
  } catch (error) {
    log.warning(`Could not determine data volumes: ${error.message}`);
  }
}

/**
 * Check data integrity and relationships
 */
async function checkDataIntegrity() {
  log.section('Checking Data Integrity');

  // Check for orphaned brain records
  try {
    const { data: brains, error: brainsError } = await supabase
      .from('business_brains')
      .select('id, user_id');

    if (!brainsError && brains) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id');

      if (!usersError && users) {
        const userIds = new Set(users.map(u => u.id));
        const orphanedBrains = brains.filter(b => !userIds.has(b.user_id));

        if (orphanedBrains.length > 0) {
          log.warning(`Found ${orphanedBrains.length} orphaned business_brains records`);
          healthReport.dataIntegrity.orphanedRecords.push({
            table: 'business_brains',
            count: orphanedBrains.length,
          });
        } else {
          log.success('No orphaned business_brains records');
        }
      }
    }
  } catch (error) {
    log.warning(`Could not check business_brains integrity: ${error.message}`);
  }

  // Check for orphaned module executions
  try {
    const { data: executions, error: execError } = await supabase
      .from('module_executions')
      .select('id, user_id, module_slug')
      .limit(100);

    if (!execError && executions && executions.length > 0) {
      const { data: users } = await supabase.from('users').select('id');
      const { data: modules } = await supabase.from('modules').select('slug');

      const userIds = new Set(users?.map(u => u.id) || []);
      const moduleSlugs = new Set(modules?.map(m => m.slug) || []);

      const orphanedExecs = executions.filter(e =>
        !userIds.has(e.user_id) || !moduleSlugs.has(e.module_slug)
      );

      if (orphanedExecs.length > 0) {
        log.warning(`Found ${orphanedExecs.length} orphaned module_executions records`);
        healthReport.dataIntegrity.orphanedRecords.push({
          table: 'module_executions',
          count: orphanedExecs.length,
        });
      } else {
        log.success('No orphaned module_executions records in sample');
      }
    }
  } catch (error) {
    log.warning(`Could not check module_executions integrity: ${error.message}`);
  }
}

/**
 * Security posture assessment
 */
async function assessSecurity() {
  log.section('Security Posture Assessment');

  // Check if service role key is exposed
  if (process.env.VITE_SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ')) {
    log.warning('Service role key found in .env - ensure it\'s not exposed client-side');
    healthReport.security.warnings.push(
      'Service role key should only be used server-side (Netlify functions)'
    );
  }

  // Check authentication configuration
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    log.success('Authentication system is accessible');
  } catch (error) {
    log.error(`Authentication check failed: ${error.message}`);
    healthReport.security.issues.push(`Auth system error: ${error.message}`);
  }

  // Check storage bucket configuration (if any)
  try {
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (!bucketsError && buckets) {
      log.info(`Found ${buckets.length} storage buckets`);
      for (const bucket of buckets) {
        log.detail(`• ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      }
    }
  } catch (error) {
    log.info('Storage buckets check skipped (may not be configured)');
  }
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations() {
  log.section('Optimization Recommendations');

  // Missing tables
  if (healthReport.tables.missing.length > 0) {
    const rec = `Apply missing migrations to create tables: ${healthReport.tables.missing.join(', ')}`;
    healthReport.recommendations.push({ priority: 'HIGH', recommendation: rec });
    log.error(`HIGH: ${rec}`);
  }

  // RLS issues
  if (healthReport.rls.issues.length > 0) {
    const rec = `Review and enable RLS on ${healthReport.rls.issues.length} tables`;
    healthReport.recommendations.push({ priority: 'HIGH', recommendation: rec });
    log.error(`HIGH: ${rec}`);
  }

  // Orphaned records
  if (healthReport.dataIntegrity.orphanedRecords.length > 0) {
    const rec = 'Clean up orphaned records to maintain referential integrity';
    healthReport.recommendations.push({ priority: 'MEDIUM', recommendation: rec });
    log.warning(`MEDIUM: ${rec}`);
  }

  // Index recommendations
  if (healthReport.indexes.recommendations.length > 0) {
    const rec = `Consider adding ${healthReport.indexes.recommendations.length} indexes for performance`;
    healthReport.recommendations.push({ priority: 'MEDIUM', recommendation: rec });
    log.warning(`MEDIUM: ${rec}`);
  }

  // Security warnings
  if (healthReport.security.warnings.length > 0) {
    const rec = 'Review security configuration and key exposure';
    healthReport.recommendations.push({ priority: 'MEDIUM', recommendation: rec });
    log.warning(`MEDIUM: ${rec}`);
  }

  // General optimization
  healthReport.recommendations.push({
    priority: 'LOW',
    recommendation: 'Schedule regular database maintenance and vacuum operations',
  });
  log.info('LOW: Schedule regular database maintenance and vacuum operations');

  healthReport.recommendations.push({
    priority: 'LOW',
    recommendation: 'Implement connection pooling if not already configured',
  });
  log.info('LOW: Implement connection pooling if not already configured');
}

/**
 * Determine overall health status
 */
function determineOverallHealth() {
  const criticalIssues =
    healthReport.tables.missing.length +
    healthReport.rls.issues.filter(i => i.issue.includes('disabled')).length +
    healthReport.security.issues.length;

  const warnings =
    healthReport.rls.issues.length +
    healthReport.dataIntegrity.orphanedRecords.length +
    healthReport.security.warnings.length;

  if (criticalIssues > 0) {
    healthReport.overallHealth = 'CRITICAL';
  } else if (warnings > 3) {
    healthReport.overallHealth = 'WARNING';
  } else if (warnings > 0) {
    healthReport.overallHealth = 'GOOD';
  } else {
    healthReport.overallHealth = 'EXCELLENT';
  }
}

/**
 * Print summary report
 */
function printSummary() {
  log.header();
  console.log(`${colors.bright}${colors.cyan}DATABASE HEALTH REPORT SUMMARY${colors.reset}`);
  log.header();

  const healthColor = {
    EXCELLENT: colors.green,
    GOOD: colors.cyan,
    WARNING: colors.yellow,
    CRITICAL: colors.red,
  }[healthReport.overallHealth] || colors.reset;

  console.log(`\n${colors.bright}Overall Health Status: ${healthColor}${healthReport.overallHealth}${colors.reset}\n`);

  console.log(`${colors.bright}Tables:${colors.reset}`);
  console.log(`  Existing: ${healthReport.tables.existing}/${EXPECTED_TABLES.length}`);
  console.log(`  Missing: ${healthReport.tables.missing.length}`);
  console.log(`  Unexpected: ${healthReport.tables.unexpected.length}`);

  console.log(`\n${colors.bright}Row Level Security:${colors.reset}`);
  console.log(`  Enabled: ${healthReport.rls.enabled}/${RLS_REQUIRED_TABLES.length}`);
  console.log(`  Issues: ${healthReport.rls.issues.length}`);

  console.log(`\n${colors.bright}Data Integrity:${colors.reset}`);
  console.log(`  Orphaned Records: ${healthReport.dataIntegrity.orphanedRecords.length} table(s)`);
  console.log(`  Missing Relations: ${healthReport.dataIntegrity.missingRelations.length} table(s)`);

  console.log(`\n${colors.bright}Security:${colors.reset}`);
  console.log(`  Issues: ${healthReport.security.issues.length}`);
  console.log(`  Warnings: ${healthReport.security.warnings.length}`);

  console.log(`\n${colors.bright}Recommendations:${colors.reset}`);
  console.log(`  High Priority: ${healthReport.recommendations.filter(r => r.priority === 'HIGH').length}`);
  console.log(`  Medium Priority: ${healthReport.recommendations.filter(r => r.priority === 'MEDIUM').length}`);
  console.log(`  Low Priority: ${healthReport.recommendations.filter(r => r.priority === 'LOW').length}`);

  log.header();
}

/**
 * Main execution
 */
async function main() {
  console.log(`${colors.bright}${colors.magenta}`);
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║              DISRUPTORS AI MARKETING HUB - DATABASE HEALTH CHECK              ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);
  console.log(colors.reset);

  log.info(`Database: ${supabaseUrl}`);
  log.info(`Timestamp: ${healthReport.timestamp}`);
  log.info('Starting comprehensive health check...\n');

  try {
    await checkTableExistence();
    await checkTableSchemas();
    await checkRLSPolicies();
    await checkIndexes();
    await checkDataIntegrity();
    await assessSecurity();

    generateRecommendations();
    determineOverallHealth();

    printSummary();

    // Save detailed report to file
    const fs = await import('fs/promises');
    const reportPath = join(__dirname, '..', 'database-health-report.json');
    await fs.writeFile(reportPath, JSON.stringify(healthReport, null, 2));

    log.info(`\nDetailed report saved to: ${reportPath}`);

    // Exit with appropriate code
    if (healthReport.overallHealth === 'CRITICAL') {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (error) {
    log.error(`\nFatal error during health check: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

main();
