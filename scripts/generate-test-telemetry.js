/**
 * Generate Test Telemetry Data
 *
 * Populates the telemetry tables with realistic test data
 * for testing the Admin Nexus Telemetry Dashboard
 *
 * Usage: node scripts/generate-test-telemetry.js
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const areas = ['admin', 'agent', 'workflow', 'ingest', 'ui'];
const eventNames = {
  admin: ['user_login_success', 'user_login_failed', 'content_updated', 'content_published'],
  agent: ['agent_execution_started', 'agent_execution_completed', 'agent_execution_failed', 'agent_training_completed'],
  workflow: ['workflow_triggered', 'workflow_step_completed', 'workflow_completed', 'workflow_failed'],
  ingest: ['ingest_started', 'ingest_page_scraped', 'ingest_completed', 'ingest_failed'],
  ui: ['page_view', 'button_clicked', 'form_submitted', 'error_displayed']
};

async function generateTelemetryEvents(count = 100) {
  console.log(`\n📊 Generating ${count} telemetry events...`);

  const now = Date.now();
  const events = Array.from({ length: count }, (_, i) => {
    const area = areas[Math.floor(Math.random() * areas.length)];
    const names = eventNames[area];
    const name = names[Math.floor(Math.random() * names.length)];
    const isError = name.includes('failed') || name.includes('error');

    return {
      area,
      name,
      payload: {
        duration: Math.floor(Math.random() * 5000) + 100,
        user_id: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 10)}` : null,
        test_data: true,
        ...(isError && {
          error: 'Simulated error for testing',
          stack: 'Error: Simulated error\n    at test.js:10:15'
        })
      },
      // Spread events over last 7 days
      created_at: new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  });

  const { data, error } = await supabase
    .from('telemetry_events')
    .insert(events);

  if (error) {
    console.error('❌ Error generating telemetry events:', error);
    return false;
  }

  console.log('✅ Generated telemetry events');
  return true;
}

async function generateAgentRuns(count = 30) {
  console.log(`\n🤖 Generating ${count} agent runs...`);

  // Get or create a test agent
  let agent;
  const { data: existingAgent } = await supabase
    .from('agents')
    .select('id')
    .eq('name', 'test-agent')
    .single();

  if (existingAgent) {
    agent = existingAgent;
  } else {
    const { data: newAgent, error: createError } = await supabase
      .from('agents')
      .insert({
        name: 'test-agent',
        system_prompt: 'Test agent for telemetry demo',
        status: 'active'
      })
      .select()
      .single();

    if (createError) {
      console.warn('⚠️  Could not create test agent:', createError.message);
      console.log('   Skipping agent runs generation');
      return false;
    }

    agent = newAgent;
  }

  const now = Date.now();
  const runs = Array.from({ length: count }, () => {
    const startTime = now - Math.random() * 7 * 24 * 60 * 60 * 1000;
    const duration = Math.random() * 10000 + 1000;
    const type = Math.random() > 0.5 ? 'train' : 'eval';
    const status = Math.random() > 0.15 ? 'success' : 'failed';

    return {
      agent_id: agent.id,
      agent_name: 'test-agent',
      type,
      status,
      metrics: {
        accuracy: status === 'success' ? 0.8 + Math.random() * 0.2 : null,
        latency: Math.floor(duration),
        tokens: Math.floor(Math.random() * 3000) + 500,
        model: 'claude-3-5-sonnet-20241022'
      },
      started_at: new Date(startTime).toISOString(),
      finished_at: new Date(startTime + duration).toISOString()
    };
  });

  const { error } = await supabase.from('agent_runs').insert(runs);

  if (error) {
    console.error('❌ Error generating agent runs:', error);
    return false;
  }

  console.log('✅ Generated agent runs');
  return true;
}

async function generateWorkflowRuns(count = 20) {
  console.log(`\n⚙️  Generating ${count} workflow runs...`);

  // Get or create a test workflow
  let workflow;
  const { data: existingWorkflow } = await supabase
    .from('workflows')
    .select('id')
    .eq('name', 'test-workflow')
    .single();

  if (existingWorkflow) {
    workflow = existingWorkflow;
  } else {
    const { data: newWorkflow, error: createError } = await supabase
      .from('workflows')
      .insert({
        name: 'test-workflow',
        spec: {
          steps: [
            { type: 'fetch', config: { url: 'https://example.com' } },
            { type: 'process', config: { action: 'extract' } },
            { type: 'store', config: { destination: 'database' } }
          ]
        },
        enabled: true
      })
      .select()
      .single();

    if (createError) {
      console.warn('⚠️  Could not create test workflow:', createError.message);
      console.log('   Skipping workflow runs generation');
      return false;
    }

    workflow = newWorkflow;
  }

  const now = Date.now();
  const runs = Array.from({ length: count }, () => {
    const startTime = now - Math.random() * 7 * 24 * 60 * 60 * 1000;
    const duration = Math.random() * 30000 + 5000;
    const status = Math.random() > 0.1 ? 'success' : Math.random() > 0.5 ? 'failed' : 'cancelled';
    const progress = status === 'success' ? 100 : Math.random() > 0.5 ? Math.floor(Math.random() * 100) : 0;

    return {
      workflow_id: workflow.id,
      status,
      progress,
      logs: `Step 1: Fetch complete\nStep 2: Processing...\n${status === 'success' ? 'Step 3: Stored successfully' : 'Error occurred'}`,
      metrics: {
        steps_completed: Math.floor(progress / 33),
        duration_ms: Math.floor(duration),
        items_processed: Math.floor(Math.random() * 100)
      },
      started_at: new Date(startTime).toISOString(),
      finished_at: new Date(startTime + duration).toISOString()
    };
  });

  const { error } = await supabase.from('workflow_runs').insert(runs);

  if (error) {
    console.error('❌ Error generating workflow runs:', error);
    return false;
  }

  console.log('✅ Generated workflow runs');
  return true;
}

async function checkCurrentData() {
  console.log('\n📊 Current Telemetry Data Status:\n');

  const tables = ['telemetry_events', 'module_runs', 'agent_runs', 'workflow_runs'];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`  ❌ ${table}: Error - ${error.message}`);
    } else {
      console.log(`  ${count > 0 ? '✅' : '⚪'} ${table}: ${count} records`);
    }
  }

  console.log('');
}

async function main() {
  console.log('🚀 Test Telemetry Data Generator');
  console.log('================================\n');

  // Check current status
  await checkCurrentData();

  // Ask for confirmation
  console.log('This will generate test data in your database.');
  console.log('Recommended: 100 telemetry events, 30 agent runs, 20 workflow runs\n');

  // Generate data
  const success1 = await generateTelemetryEvents(100);
  const success2 = await generateAgentRuns(30);
  const success3 = await generateWorkflowRuns(20);

  if (success1 || success2 || success3) {
    console.log('\n✅ Test data generation complete!\n');
    await checkCurrentData();
    console.log('You can now view the data in the Admin Nexus Telemetry Dashboard:');
    console.log('  1. Go to /admin/secret');
    console.log('  2. Login with admin credentials');
    console.log('  3. Click "Telemetry Dashboard" in sidebar\n');
  } else {
    console.log('\n⚠️  Some data generation failed. Check errors above.\n');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateTelemetryEvents, generateAgentRuns, generateWorkflowRuns, checkCurrentData };
