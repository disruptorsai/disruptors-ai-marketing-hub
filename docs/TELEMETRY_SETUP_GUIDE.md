# Telemetry & KPI Dashboard Setup Guide

## Overview

The Admin Nexus Telemetry Dashboard tracks all KPIs and system statistics through four main database tables:
- **`telemetry_events`** - System-wide event logging (errors, actions, state changes)
- **`module_runs`** - Tracks every AI module execution (Keyword Research, Content Writer, etc.)
- **`agent_runs`** - Tracks AI agent training and evaluation runs
- **`workflow_runs`** - Tracks automation workflow executions

## Current Status

✅ **Database Tables** - All telemetry tables exist and are ready
✅ **Dashboard UI** - `/admin/secret` → Telemetry Dashboard (fully implemented)
✅ **Module Tracking** - Module executor automatically tracks runs
⚠️ **Data Collection** - Minimal data currently (needs more module usage)

```bash
# Check current telemetry data
node -e "
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const { data: moduleRuns } = await supabase.from('module_runs').select('*', { count: 'exact', head: true });
const { data: telemetryEvents } = await supabase.from('telemetry_events').select('*', { count: 'exact', head: true });
const { data: agentRuns } = await supabase.from('agent_runs').select('*', { count: 'exact', head: true });
const { data: workflowRuns } = await supabase.from('workflow_runs').select('*', { count: 'exact', head: true });

console.log('📊 Current Telemetry Data:');
console.log('  Module Runs:', moduleRuns?.length || 0);
console.log('  Telemetry Events:', telemetryEvents?.length || 0);
console.log('  Agent Runs:', agentRuns?.length || 0);
console.log('  Workflow Runs:', workflowRuns?.length || 0);
"
```

## Accessing the Telemetry Dashboard

### 1. Access Admin Nexus

**Method A: Logo Pattern** (Recommended)
1. Go to your website homepage
2. Click the Disruptors logo **5 times within 3 seconds**
3. Login with admin credentials

**Method B: Keyboard Shortcut**
1. Go to any page on your site
2. Press `Ctrl+Shift+D` (Windows/Linux) or `Cmd+Shift+D` (Mac)
3. Login with admin credentials

**Method C: Direct URL**
1. Navigate to `https://dm4.wjwelsh.com/admin/secret`
2. Login with admin credentials

### 2. Navigate to Telemetry Dashboard

Once in Admin Nexus:
1. Click "Telemetry Dashboard" in the sidebar
2. Dashboard auto-refreshes every 30 seconds
3. Toggle auto-refresh on/off in the header

### 3. Admin Account Setup

If you don't have admin credentials yet, you need to create an admin user in the database:

```sql
-- Run this in Supabase SQL Editor
-- Replace with your email and desired password

-- First, check if admin_users table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'admin_users'
);

-- If it doesn't exist, you need to apply the Admin Nexus migration first
-- See: temp/admin-nexus-COMPLETE/DB/migrations/001_init_enhanced.sql

-- Create admin user (if table exists)
INSERT INTO admin_users (email, password_hash, role)
VALUES (
  'your-email@disruptorsmedia.com',
  crypt('your-password-here', gen_salt('bf')),  -- bcrypt hash
  'super_admin'
)
RETURNING id, email, role, created_at;

-- OR use the setup script:
-- node scripts/setup-admin-user.js your-email@disruptorsmedia.com your-password
```

## What the Dashboard Shows

### Real-Time Metrics (Top Cards)

1. **Total Events** - All telemetry events in selected time range
2. **Error Rate** - Percentage of failed operations
3. **Agent Runs** - Number of AI agent executions
4. **Avg Response Time** - Average duration of tracked operations

### Event Volume Chart

- Line chart showing events per hour over last 24 hours
- Updates automatically with auto-refresh enabled

### Recent Events Stream

- Live feed of latest telemetry events
- Color-coded by severity:
  - 🟢 Green - Success/completed events
  - 🔴 Red - Error/failed events
  - 🟡 Yellow - Warning events
  - 🔵 Blue - Info/general events

### Filters

- **Time Range**: 1h, 24h, 7d, 30d
- **Event Type**: all, admin, agent, workflow, ingest

## Data Sources & Tracking

### 1. Module Runs (Automatic)

Module runs are **automatically tracked** by `src/lib/modules/module-executor.ts` whenever a module executes:

```javascript
// Automatically tracked for ALL module executions:
- Module ID, user ID, brain ID
- Input data, output data
- Duration, tokens used, cost
- Status (success/fail)
- IP address, user agent, session ID
```

**Production Modules Tracking:**
- ✅ Keyword Research (`module-keyword-research`)
- ✅ AI Content Writer (`module-ai-content-writer`)
- ✅ Growth Audit (`module-growth-audit`)

**To see module run data:**
1. Use any AI module from the `/app/tools/*` pages
2. Data will automatically appear in Telemetry Dashboard
3. Check "Recent Events" for immediate feedback

### 2. Telemetry Events (Manual Tracking)

Add telemetry events anywhere in your code for custom tracking:

```javascript
// In any Netlify function or React component:
import { supabaseAdmin } from '@/lib/supabase-client';

// Track a custom event
await supabaseAdmin.from('telemetry_events').insert({
  area: 'admin',        // admin, agent, workflow, ingest, ui, errors
  name: 'user_login_success',
  payload: {
    user_id: userId,
    method: 'google-oauth',
    duration: 342
  }
});
```

**Common Event Areas:**
- `admin` - Admin panel actions
- `agent` - AI agent operations
- `workflow` - Workflow executions
- `ingest` - Content ingestion jobs
- `ui` - Frontend interactions
- `errors` - Error tracking

**Common Event Names:**
- `*_success` - Successful operation
- `*_failed` - Failed operation
- `*_started` - Operation started
- `*_completed` - Operation completed
- `*_error` - Error occurred
- `*_warning` - Warning condition

### 3. Agent Runs (For AI Agent System)

Track AI agent training and evaluation runs:

```javascript
// When training an agent
await supabaseAdmin.from('agent_runs').insert({
  agent_id: agentId,
  agent_name: 'content-writer',
  type: 'train',      // 'train' or 'eval'
  status: 'running',  // 'queued' → 'running' → 'success' → 'failed'
  metrics: {
    accuracy: 0.95,
    latency: 1200,
    tokens: 1500
  },
  started_at: new Date().toISOString()
});

// Update when complete
await supabaseAdmin
  .from('agent_runs')
  .update({
    status: 'success',
    finished_at: new Date().toISOString()
  })
  .eq('id', runId);
```

### 4. Workflow Runs (For Automation System)

Track workflow executions:

```javascript
// When starting a workflow
await supabaseAdmin.from('workflow_runs').insert({
  workflow_id: workflowId,
  status: 'running',
  progress: 0,
  logs: 'Starting workflow execution...',
  started_at: new Date().toISOString()
});

// Update progress
await supabaseAdmin
  .from('workflow_runs')
  .update({
    progress: 50,
    logs: 'Step 2 of 4 complete...'
  })
  .eq('id', runId);

// Mark complete
await supabaseAdmin
  .from('workflow_runs')
  .update({
    status: 'success',
    progress: 100,
    logs: 'Workflow completed successfully',
    metrics: {
      steps_completed: 4,
      duration_ms: 5000
    },
    finished_at: new Date().toISOString()
  })
  .eq('id', runId);
```

## Generating Test Data

To populate the dashboard with test data:

```javascript
// Run this in Node.js to generate sample telemetry
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// Generate 50 random telemetry events
const events = Array.from({ length: 50 }, (_, i) => ({
  area: ['admin', 'agent', 'workflow', 'ingest'][Math.floor(Math.random() * 4)],
  name: ['operation_success', 'operation_failed', 'operation_started'][Math.floor(Math.random() * 3)],
  payload: {
    duration: Math.floor(Math.random() * 5000),
    test_data: true
  },
  created_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
}));

await supabase.from('telemetry_events').insert(events);
console.log('✅ Generated 50 test telemetry events');

// Generate agent runs
const agentRuns = Array.from({ length: 20 }, () => ({
  agent_id: '00000000-0000-0000-0000-000000000000', // Replace with real agent ID
  agent_name: 'test-agent',
  type: Math.random() > 0.5 ? 'train' : 'eval',
  status: Math.random() > 0.2 ? 'success' : 'failed',
  metrics: {
    accuracy: 0.8 + Math.random() * 0.2,
    latency: Math.floor(Math.random() * 3000),
    tokens: Math.floor(Math.random() * 2000)
  },
  started_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
  finished_at: new Date(Date.now() - Math.random() * 23 * 60 * 60 * 1000).toISOString()
}));

await supabase.from('agent_runs').insert(agentRuns);
console.log('✅ Generated 20 test agent runs');
```

Save as `scripts/generate-test-telemetry.js` and run with:
```bash
node scripts/generate-test-telemetry.js
```

## Netlify Functions Integration

### Automatic Module Tracking

The following Netlify functions **automatically track telemetry** via the module executor:

1. **`module-keyword-research.js`** - Tracks via module executor
2. **`module-ai-content-writer.js`** - Tracks via module executor
3. **`module-growth-audit.js`** - Tracks via module executor

### Manual Telemetry in Functions

For custom Netlify functions, add telemetry manually:

```javascript
// netlify/functions/your-custom-function.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

export const handler = async (event, context) => {
  const startTime = Date.now();

  try {
    // Your function logic here
    const result = await someOperation();

    // Track success
    await supabase.from('telemetry_events').insert({
      area: 'custom',
      name: 'custom_function_success',
      payload: {
        duration: Date.now() - startTime,
        result: result
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };

  } catch (error) {
    // Track error
    await supabase.from('telemetry_events').insert({
      area: 'errors',
      name: 'custom_function_failed',
      payload: {
        duration: Date.now() - startTime,
        error: error.message,
        stack: error.stack
      }
    });

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

## Key Metrics to Track

### Performance Metrics
- Average response time (module execution duration)
- Token usage (AI API consumption)
- Cost per operation (actual $ spent)
- Error rate (% of failed operations)

### Usage Metrics
- Module runs per day/week/month
- Unique users accessing modules
- Most popular modules
- Peak usage times

### Business Metrics
- Total cost (sum of all module costs)
- Revenue per module (if modules are sold)
- User engagement (runs per user)
- Conversion rate (public → client)

## Advanced Analytics Queries

Run these in Supabase SQL Editor for deeper insights:

### Daily Module Usage
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_runs,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(duration_ms) as avg_duration,
  SUM(cost_usd) as total_cost
FROM module_runs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Top Performing Modules
```sql
SELECT
  m.name,
  m.slug,
  COUNT(mr.id) as total_runs,
  AVG(mr.duration_ms) as avg_duration,
  SUM(mr.cost_usd) as total_cost,
  COUNT(*) FILTER (WHERE mr.status = 'success') * 100.0 / COUNT(*) as success_rate
FROM modules m
LEFT JOIN module_runs mr ON mr.module_id = m.id
WHERE mr.created_at >= NOW() - INTERVAL '7 days'
GROUP BY m.id, m.name, m.slug
ORDER BY total_runs DESC;
```

### Error Analysis
```sql
SELECT
  area,
  name,
  COUNT(*) as error_count,
  payload->>'error' as common_error
FROM telemetry_events
WHERE name LIKE '%error%' OR name LIKE '%fail%'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY area, name, payload->>'error'
ORDER BY error_count DESC
LIMIT 20;
```

### User Activity Patterns
```sql
SELECT
  EXTRACT(HOUR FROM created_at) as hour_of_day,
  COUNT(*) as runs,
  COUNT(DISTINCT user_id) as unique_users
FROM module_runs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY hour_of_day
ORDER BY hour_of_day;
```

## Troubleshooting

### Dashboard shows no data

1. **Check database connection**
   ```bash
   node -e "
   import { createClient } from '@supabase/supabase-js';
   const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
   const { data } = await s.from('telemetry_events').select('count');
   console.log('Connected:', !!data);
   "
   ```

2. **Verify tables exist**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
     AND table_name IN ('telemetry_events', 'module_runs', 'agent_runs', 'workflow_runs');
   ```

3. **Check RLS policies** (Row Level Security might be blocking reads)
   ```sql
   -- Temporarily disable RLS to test (re-enable after!)
   ALTER TABLE telemetry_events DISABLE ROW LEVEL SECURITY;
   ALTER TABLE module_runs DISABLE ROW LEVEL SECURITY;
   ```

4. **Generate test data** using the script above

### Auto-refresh not working

- Check browser console for errors
- Verify the component is mounted
- Check if `autoRefresh` state is true
- Manually click "Refresh Now" to test

### Slow dashboard loading

1. Add indexes if missing:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_telemetry_events_created_at
     ON telemetry_events(created_at DESC);

   CREATE INDEX IF NOT EXISTS idx_module_runs_created_at
     ON module_runs(created_at DESC);
   ```

2. Reduce time range (use 1h or 24h instead of 30d)
3. Limit event stream to 50 items instead of 100

## Next Steps

1. **Access Admin Nexus** - Use secret pattern to login
2. **Run AI Modules** - Use Keyword Research, Content Writer to generate data
3. **Generate Test Data** - Run test script to populate dashboard
4. **Add Custom Tracking** - Add telemetry events to custom code
5. **Monitor Daily** - Check dashboard regularly for system health

## Related Documentation

- `docs/systems/ADMIN_NEXUS.md` - Admin console documentation
- `docs/MODULES_SYSTEM.md` - Modules architecture
- `src/admin/modules/TelemetryDashboard.jsx` - Dashboard UI code
- `src/lib/modules/module-executor.ts` - Automatic tracking code
- `supabase/migrations/20251010_modules_infrastructure.sql` - Database schema

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify environment variables are set
3. Check Supabase logs for database errors
4. Review Netlify function logs for tracking issues
