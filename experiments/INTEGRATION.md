# Admin Panel Integration Plan

## Overview

This document outlines how the AI Marketing Experiments system integrates with the Disruptors AI admin panel at `/admin/secret`.

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL (/admin/secret)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Main Navigation                                          │  │
│  │  ├── Dashboard                                            │  │
│  │  ├── Content Management                                   │  │
│  │  ├── Team Management                                      │  │
│  │  ├── Media Library                                        │  │
│  │  ├── Business Brain Builder                               │  │
│  │  ├── Agent Chat                                           │  │
│  │  └── 🆕 MARKETING EXPERIMENTS  ← NEW MODULE               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Marketing Experiments Module                             │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Experiments Dashboard                              │  │  │
│  │  │  ├── Active Experiments (5)                         │  │  │
│  │  │  ├── Submissions Pending Review (2)                 │  │  │
│  │  │  ├── Recent Completions                             │  │  │
│  │  │  └── Performance Summary                            │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Experiment Detail View                             │  │  │
│  │  │  ├── Status & Timeline                              │  │  │
│  │  │  ├── Metrics Dashboard                              │  │  │
│  │  │  ├── Control Panel (Enable/Disable/Configure)       │  │  │
│  │  │  ├── Analysis Reports                               │  │  │
│  │  │  └── Approval Workflows                             │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Submission Review                                   │  │  │
│  │  │  ├── New Submissions Queue                          │  │  │
│  │  │  ├── Agent Analysis Reports                         │  │  │
│  │  │  └── Approve/Reject Interface                       │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Netlify Functions                                        │  │
│  │  ├── experiment-list.js        (List all experiments)    │  │
│  │  ├── experiment-get.js         (Get experiment details)  │  │
│  │  ├── experiment-update.js      (Update configuration)    │  │
│  │  ├── experiment-metrics.js     (Get metrics data)        │  │
│  │  └── experiment-control.js     (Enable/disable/control)  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Agent Orchestrator                                       │  │
│  │  ├── File system watcher                                  │  │
│  │  ├── Submission processor                                 │  │
│  │  ├── Analysis engine                                      │  │
│  │  ├── Development automation                               │  │
│  │  └── Monitoring & reporting                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Database Queries
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  marketing_experiments          (Experiment definitions)         │
│  experiment_runs                 (Execution history)             │
│  experiment_metrics              (Performance data)              │
│  experiment_events               (Activity log)                  │
│  experiment_configurations       (Settings and variations)       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

```sql
-- Main experiments table
CREATE TABLE marketing_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN (
    'submitted', 'analysis', 'planning', 'development',
    'testing', 'deployed', 'live', 'paused', 'graduated', 'sunset'
  )),

  -- Lifecycle timestamps
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  analyzed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  deployed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- User tracking
  submitted_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),

  -- Configuration
  concept_document JSONB NOT NULL,
  analysis_report JSONB,
  specification JSONB,
  success_criteria JSONB,

  -- Current state
  current_configuration JSONB,
  is_enabled BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiment runs (each execution)
CREATE TABLE experiment_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES marketing_experiments(id) ON DELETE CASCADE,

  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_ms INTEGER,

  configuration JSONB,
  input_data JSONB,
  output_data JSONB,

  success BOOLEAN,
  error_message TEXT,

  user_id UUID REFERENCES auth.users(id),
  session_id TEXT
);

-- Performance metrics
CREATE TABLE experiment_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES marketing_experiments(id) ON DELETE CASCADE,

  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,

  recorded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Context for segmentation
  segment_data JSONB,

  CONSTRAINT unique_metric_per_time
    UNIQUE (experiment_id, metric_name, recorded_at)
);

-- Event logging
CREATE TABLE experiment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES marketing_experiments(id) ON DELETE CASCADE,

  event_type TEXT NOT NULL,
  event_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- A/B test configurations
CREATE TABLE experiment_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES marketing_experiments(id) ON DELETE CASCADE,

  configuration_name TEXT NOT NULL,
  configuration_data JSONB NOT NULL,

  is_active BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_marketing_experiments_status
  ON marketing_experiments(status);
CREATE INDEX idx_marketing_experiments_submitted_by
  ON marketing_experiments(submitted_by);
CREATE INDEX idx_experiment_runs_experiment_id
  ON experiment_runs(experiment_id);
CREATE INDEX idx_experiment_metrics_experiment_id
  ON experiment_metrics(experiment_id);
CREATE INDEX idx_experiment_metrics_recorded_at
  ON experiment_metrics(recorded_at DESC);
CREATE INDEX idx_experiment_events_experiment_id
  ON experiment_events(experiment_id);

-- RLS Policies (Admin only)
ALTER TABLE marketing_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access marketing_experiments"
  ON marketing_experiments FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin access experiment_runs"
  ON experiment_runs FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin access experiment_metrics"
  ON experiment_metrics FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin access experiment_events"
  ON experiment_events FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin access experiment_configurations"
  ON experiment_configurations FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_marketing_experiments_updated_at
  BEFORE UPDATE ON marketing_experiments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Admin Panel Components

### Component Hierarchy

```
src/components/admin/experiments/
├── ExperimentsDashboard.jsx           # Main dashboard
├── ExperimentsNav.jsx                 # Navigation component
├── ExperimentCard.jsx                 # Experiment card for list view
├── ExperimentDetail.jsx               # Full experiment detail view
├── ExperimentMetricsChart.jsx         # Metrics visualization
├── ExperimentControls.jsx             # Enable/disable/configure
├── SubmissionReview.jsx               # Review new submissions
├── ApprovalWorkflow.jsx               # Approve/reject interface
├── ExperimentTimeline.jsx             # Visual timeline
└── ExperimentComparison.jsx           # Compare multiple experiments
```

### Main Dashboard Component

```jsx
// src/components/admin/experiments/ExperimentsDashboard.jsx

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ExperimentCard from './ExperimentCard'
import SubmissionReview from './SubmissionReview'
import { supabaseAdmin } from '@/lib/supabase-client'

export default function ExperimentsDashboard() {
  const [experiments, setExperiments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    active: 0,
    pending: 0,
    graduated: 0,
    total: 0
  })

  useEffect(() => {
    loadExperiments()
  }, [])

  async function loadExperiments() {
    try {
      // Fetch all experiments
      const { data, error } = await supabaseAdmin
        .from('marketing_experiments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Separate by status
      const submitted = data.filter(e => e.status === 'submitted' || e.status === 'analysis')
      const active = data.filter(e => ['development', 'testing', 'deployed', 'live'].includes(e.status))
      const graduated = data.filter(e => e.status === 'graduated')

      setExperiments(data)
      setSubmissions(submitted)
      setStats({
        active: active.length,
        pending: submitted.length,
        graduated: graduated.length,
        total: data.length
      })
    } catch (error) {
      console.error('Failed to load experiments:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marketing Experiments</h1>
          <p className="text-muted-foreground">
            AI-powered experimentation system
          </p>
        </div>
        <Button onClick={() => window.open('/experiments/submissions/README.md', '_blank')}>
          How to Submit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-sm text-muted-foreground">Active Experiments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.graduated}</div>
            <p className="text-sm text-muted-foreground">Graduated Features</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Experiments</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active ({stats.active})
          </TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
          </TabsTrigger>
          <TabsTrigger value="all">
            All Experiments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <p>Loading...</p>
          ) : (
            experiments
              .filter(e => ['development', 'testing', 'deployed', 'live'].includes(e.status))
              .map(experiment => (
                <ExperimentCard
                  key={experiment.id}
                  experiment={experiment}
                  onUpdate={loadExperiments}
                />
              ))
          )}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          {submissions.map(submission => (
            <SubmissionReview
              key={submission.id}
              submission={submission}
              onUpdate={loadExperiments}
            />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {experiments
            .filter(e => ['graduated', 'sunset', 'paused'].includes(e.status))
            .map(experiment => (
              <ExperimentCard
                key={experiment.id}
                experiment={experiment}
                onUpdate={loadExperiments}
              />
            ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {experiments.map(experiment => (
            <ExperimentCard
              key={experiment.id}
              experiment={experiment}
              onUpdate={loadExperiments}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### Experiment Card Component

```jsx
// src/components/admin/experiments/ExperimentCard.jsx

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function ExperimentCard({ experiment, onUpdate }) {
  const navigate = useNavigate()

  const statusColors = {
    submitted: 'bg-gray-500',
    analysis: 'bg-blue-500',
    planning: 'bg-blue-600',
    development: 'bg-purple-500',
    testing: 'bg-yellow-500',
    deployed: 'bg-green-500',
    live: 'bg-green-600',
    paused: 'bg-orange-500',
    graduated: 'bg-emerald-600',
    sunset: 'bg-red-500'
  }

  const statusLabels = {
    submitted: 'Submitted',
    analysis: 'Analyzing',
    planning: 'Planning',
    development: 'In Development',
    testing: 'Testing',
    deployed: 'Deployed',
    live: 'Live',
    paused: 'Paused',
    graduated: 'Graduated',
    sunset: 'Sunset'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate(`/admin/secret/experiments/${experiment.slug}`)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{experiment.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {experiment.description}
            </p>
          </div>
          <Badge className={statusColors[experiment.status]}>
            {statusLabels[experiment.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {experiment.is_enabled ? (
              <span className="text-green-600 font-medium">● Enabled</span>
            ) : (
              <span className="text-gray-500">○ Disabled</span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Created {new Date(experiment.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Quick metrics preview if live */}
        {experiment.status === 'live' && experiment.current_metrics && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold">
                  {experiment.current_metrics.conversion_rate}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Conversion Rate
                </div>
              </div>
              <div>
                <div className="text-lg font-bold">
                  {experiment.current_metrics.sample_size}
                </div>
                <div className="text-xs text-muted-foreground">
                  Sample Size
                </div>
              </div>
              <div>
                <div className="text-lg font-bold">
                  {experiment.current_metrics.days_running}d
                </div>
                <div className="text-xs text-muted-foreground">
                  Running
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/admin/secret/experiments/${experiment.slug}`)
            }}
          >
            View Details
          </Button>

          {experiment.status === 'submitted' && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/admin/secret/experiments/${experiment.slug}/review`)
              }}
            >
              Review
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

## Netlify Functions

### List Experiments Function

```javascript
// netlify/functions/experiments-list.js

import { supabaseAdmin } from '../../src/lib/supabase-client.js'

export default async (req, context) => {
  // Verify admin authentication
  const session = req.headers.get('authorization')
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Parse query parameters
    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const limit = parseInt(url.searchParams.get('limit') || '100')

    // Build query
    let query = supabaseAdmin
      .from('marketing_experiments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return new Response(JSON.stringify({
      success: true,
      experiments: data,
      count: data.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[Experiments List Error]:', error)
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
```

### Get Experiment Details Function

```javascript
// netlify/functions/experiment-get.js

import { supabaseAdmin } from '../../src/lib/supabase-client.js'

export default async (req, context) => {
  // Verify admin authentication
  const session = req.headers.get('authorization')
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const { id } = await req.json()

    if (!id) {
      throw new Error('Experiment ID required')
    }

    // Fetch experiment details
    const { data: experiment, error: expError } = await supabaseAdmin
      .from('marketing_experiments')
      .select('*')
      .eq('id', id)
      .single()

    if (expError) throw expError

    // Fetch recent metrics
    const { data: metrics, error: metricsError } = await supabaseAdmin
      .from('experiment_metrics')
      .select('*')
      .eq('experiment_id', id)
      .order('recorded_at', { ascending: false })
      .limit(100)

    if (metricsError) throw metricsError

    // Fetch recent events
    const { data: events, error: eventsError } = await supabaseAdmin
      .from('experiment_events')
      .select('*')
      .eq('experiment_id', id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (eventsError) throw eventsError

    // Fetch run history
    const { data: runs, error: runsError } = await supabaseAdmin
      .from('experiment_runs')
      .select('*')
      .eq('experiment_id', id)
      .order('started_at', { ascending: false })
      .limit(20)

    if (runsError) throw runsError

    return new Response(JSON.stringify({
      success: true,
      experiment,
      metrics,
      events,
      runs
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[Experiment Get Error]:', error)
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
```

### Control Experiment Function

```javascript
// netlify/functions/experiment-control.js

import { supabaseAdmin } from '../../src/lib/supabase-client.js'

export default async (req, context) => {
  // Verify admin authentication
  const session = req.headers.get('authorization')
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const { id, action, data: actionData } = await req.json()

    if (!id || !action) {
      throw new Error('Experiment ID and action required')
    }

    let updateData = {}
    let eventType = action

    switch (action) {
      case 'enable':
        updateData = { is_enabled: true }
        break

      case 'disable':
        updateData = { is_enabled: false }
        break

      case 'pause':
        updateData = { status: 'paused', is_enabled: false }
        break

      case 'resume':
        updateData = { status: 'live', is_enabled: true }
        break

      case 'approve':
        updateData = {
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: session.user.id
        }
        break

      case 'reject':
        updateData = {
          status: 'sunset',
          completed_at: new Date().toISOString()
        }
        break

      case 'configure':
        updateData = { current_configuration: actionData }
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    // Update experiment
    const { data: experiment, error: updateError } = await supabaseAdmin
      .from('marketing_experiments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    // Log event
    await supabaseAdmin
      .from('experiment_events')
      .insert({
        experiment_id: id,
        event_type: eventType,
        event_data: actionData || {},
        created_by: session.user.id
      })

    return new Response(JSON.stringify({
      success: true,
      experiment
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[Experiment Control Error]:', error)
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
```

## Navigation Integration

### Update Admin Navigation

```jsx
// src/components/admin/AdminNavigation.jsx

// Add to navigation items:

const navigationItems = [
  // ... existing items ...
  {
    name: 'Marketing Experiments',
    icon: FlaskConicalIcon, // or appropriate icon
    href: '/admin/secret/experiments',
    badge: pendingCount // show count of pending submissions
  },
  // ... rest of items ...
]
```

### Add Routing

```jsx
// src/App.jsx or router configuration

// Add route:
<Route path="/admin/secret/experiments" element={<ExperimentsDashboard />} />
<Route path="/admin/secret/experiments/:slug" element={<ExperimentDetail />} />
<Route path="/admin/secret/experiments/:slug/review" element={<SubmissionReview />} />
```

## Deployment Checklist

### Phase 1: Database Setup
- [ ] Apply database migration (create all tables)
- [ ] Verify RLS policies are active
- [ ] Test with service role key
- [ ] Test with admin user

### Phase 2: Backend Functions
- [ ] Deploy Netlify functions
- [ ] Test each endpoint
- [ ] Verify authentication works
- [ ] Check error handling

### Phase 3: Admin Panel Integration
- [ ] Create React components
- [ ] Add to admin navigation
- [ ] Set up routing
- [ ] Test admin panel interface

### Phase 4: Agent Setup
- [ ] Configure file system watcher
- [ ] Test submission detection
- [ ] Verify agent analysis works
- [ ] Check notification system

### Phase 5: Testing
- [ ] Submit test experiment
- [ ] Verify agent processes it
- [ ] Test approval workflow
- [ ] Check metrics tracking
- [ ] Validate controls (enable/disable)

### Phase 6: Documentation
- [ ] Update admin user guide
- [ ] Create video walkthrough
- [ ] Document troubleshooting
- [ ] Share with team

## Security Considerations

### Access Control
- **Admin Only**: All experiments functionality requires admin role
- **Session Validation**: Every API call validates admin session
- **RLS Policies**: Database enforces row-level security
- **Audit Logging**: All actions logged with user attribution

### Data Privacy
- **No Public Exposure**: Experiments never visible to public users
- **Internal Metrics Only**: Performance data stays internal
- **Secure Storage**: All data encrypted at rest
- **Access Logs**: Track who accessed what and when

### API Security
- **Authentication Required**: All endpoints require valid session
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize all inputs
- **Error Handling**: Don't leak sensitive info in errors

## Performance Optimization

### Database Queries
- **Indexes**: All frequently queried columns indexed
- **Pagination**: Large result sets paginated
- **Caching**: Dashboard data cached (5-minute TTL)
- **Aggregations**: Pre-compute statistics

### UI Performance
- **Lazy Loading**: Components loaded on demand
- **Virtual Scrolling**: Large lists virtualized
- **Debouncing**: Search and filter debounced
- **Memoization**: Expensive calculations memoized

### Real-Time Updates
- **WebSockets**: Use Supabase Realtime for live metrics
- **Polling**: Fallback to 30-second polling
- **Optimistic Updates**: UI updates immediately
- **Background Refresh**: Data refreshes in background

## Monitoring & Alerts

### System Health
- Monitor agent processing time
- Track API response times
- Watch database query performance
- Alert on failures or slowness

### Experiment Health
- Track success/failure rates
- Monitor metric collection
- Alert on anomalies
- Watch for errors

### User Activity
- Track admin usage
- Monitor submission rate
- Measure approval times
- Analyze experiment outcomes

---

**Document Version**: 1.0
**Last Updated**: 2025-10-12
**Status**: Implementation Ready
