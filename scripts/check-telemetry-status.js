/**
 * Check Telemetry System Status
 *
 * Verifies all telemetry tables exist and shows current data counts
 *
 * Usage: node scripts/check-telemetry-status.js
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkTableExists(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('id')
    .limit(1);

  return !error;
}

async function getTableCount(tableName) {
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  if (error) {
    return { count: 0, error: error.message };
  }

  return { count, error: null };
}

async function getRecentRecords(tableName, limit = 5) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return null;
  }

  return data;
}

async function checkTelemetryTables() {
  console.log('\n📊 Telemetry System Status Check');
  console.log('=================================\n');

  const tables = [
    { name: 'telemetry_events', description: 'System-wide event logging' },
    { name: 'module_runs', description: 'AI module execution tracking' },
    { name: 'agent_runs', description: 'AI agent training/eval runs' },
    { name: 'workflow_runs', description: 'Workflow automation tracking' }
  ];

  console.log('🔍 Checking Tables:\n');

  for (const table of tables) {
    const exists = await checkTableExists(table.name);
    const { count, error } = await getTableCount(table.name);

    const status = exists ? '✅' : '❌';
    const countStr = count > 0 ? `${count} records` : 'empty';

    console.log(`${status} ${table.name.padEnd(20)} - ${countStr}`);
    console.log(`   ${table.description}`);

    if (error) {
      console.log(`   ⚠️  Error: ${error}`);
    }

    console.log('');
  }
}

async function showRecentActivity() {
  console.log('\n📈 Recent Activity:\n');

  // Recent telemetry events
  const events = await getRecentRecords('telemetry_events', 5);
  if (events && events.length > 0) {
    console.log('Last 5 Telemetry Events:');
    events.forEach(event => {
      const time = new Date(event.created_at).toLocaleString();
      console.log(`  • [${event.area}] ${event.name} - ${time}`);
    });
    console.log('');
  } else {
    console.log('No recent telemetry events\n');
  }

  // Recent module runs
  const moduleRuns = await getRecentRecords('module_runs', 5);
  if (moduleRuns && moduleRuns.length > 0) {
    console.log('Last 5 Module Runs:');
    moduleRuns.forEach(run => {
      const time = new Date(run.created_at).toLocaleString();
      const status = run.status === 'success' ? '✅' : '❌';
      console.log(`  ${status} ${run.status} - ${run.duration_ms}ms - ${time}`);
    });
    console.log('');
  } else {
    console.log('No recent module runs\n');
  }
}

async function showStatistics() {
  console.log('\n📊 Statistics (Last 24 Hours):\n');

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Module runs stats
  const { data: moduleRuns } = await supabase
    .from('module_runs')
    .select('status, duration_ms, cost_usd')
    .gte('created_at', yesterday);

  if (moduleRuns && moduleRuns.length > 0) {
    const total = moduleRuns.length;
    const successful = moduleRuns.filter(r => r.status === 'success').length;
    const failed = moduleRuns.filter(r => r.status === 'fail').length;
    const avgDuration = moduleRuns.reduce((sum, r) => sum + (r.duration_ms || 0), 0) / total;
    const totalCost = moduleRuns.reduce((sum, r) => sum + (r.cost_usd || 0), 0);

    console.log('Module Runs:');
    console.log(`  Total: ${total}`);
    console.log(`  Success: ${successful} (${((successful / total) * 100).toFixed(1)}%)`);
    console.log(`  Failed: ${failed} (${((failed / total) * 100).toFixed(1)}%)`);
    console.log(`  Avg Duration: ${avgDuration.toFixed(0)}ms`);
    console.log(`  Total Cost: $${totalCost.toFixed(4)}`);
    console.log('');
  } else {
    console.log('No module runs in last 24 hours\n');
  }

  // Telemetry events stats
  const { data: events } = await supabase
    .from('telemetry_events')
    .select('area, name')
    .gte('created_at', yesterday);

  if (events && events.length > 0) {
    const byArea = events.reduce((acc, e) => {
      acc[e.area] = (acc[e.area] || 0) + 1;
      return acc;
    }, {});

    console.log('Telemetry Events by Area:');
    Object.entries(byArea)
      .sort(([, a], [, b]) => b - a)
      .forEach(([area, count]) => {
        console.log(`  ${area}: ${count}`);
      });
    console.log('');
  } else {
    console.log('No telemetry events in last 24 hours\n');
  }
}

async function checkAdminAccess() {
  console.log('\n🔐 Admin Access Check:\n');

  // Check if admin_users table exists
  const { data: adminUsers, error } = await supabase
    .from('admin_users')
    .select('id, email, role')
    .limit(5);

  if (error) {
    console.log('❌ admin_users table not found or not accessible');
    console.log('   You may need to create admin credentials');
    console.log('   See docs/TELEMETRY_SETUP_GUIDE.md for setup instructions\n');
  } else if (adminUsers && adminUsers.length > 0) {
    console.log(`✅ ${adminUsers.length} admin users found:`);
    adminUsers.forEach(user => {
      console.log(`   • ${user.email} (${user.role})`);
    });
    console.log('');
  } else {
    console.log('⚠️  admin_users table exists but no users found');
    console.log('   You need to create an admin user to access the dashboard');
    console.log('   See docs/TELEMETRY_SETUP_GUIDE.md for setup instructions\n');
  }
}

async function main() {
  try {
    await checkTelemetryTables();
    await showRecentActivity();
    await showStatistics();
    await checkAdminAccess();

    console.log('💡 Next Steps:\n');
    console.log('  1. Generate test data: npm run telemetry:generate');
    console.log('  2. Access dashboard: /admin/secret → Telemetry Dashboard');
    console.log('  3. View setup guide: docs/TELEMETRY_SETUP_GUIDE.md\n');

  } catch (error) {
    console.error('\n❌ Error checking telemetry status:', error.message);
    console.error('\nPlease verify:');
    console.error('  • VITE_SUPABASE_URL is set in .env');
    console.error('  • VITE_SUPABASE_SERVICE_ROLE_KEY is set in .env');
    console.error('  • Database is accessible\n');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { checkTelemetryTables, showRecentActivity, showStatistics };
