# Modules System - Complete Documentation

## Overview

The Disruptors AI **Modules System** is a revolutionary "Website OS" architecture that transforms traditional monolithic web features into intelligent, self-contained micro-tools called **modules**. Each module operates across three access levels (internal, client, public), receives Business Brain context for personalization, and can be deployed to React apps AND WordPress sites.

**🎯 Core Philosophy**: Build powerful AI tools internally for Disruptors Media, then deploy them to clients and public as lead magnets - all from a single codebase with unified access control, quotas, and telemetry.

## Three-Level Access System

The entire system is built around a three-tier access model:

### 1. Internal (Admin)
- **Who**: Disruptors Media team members only
- **Access**: Unlimited, all modules, service role bypass
- **Purpose**: Full-featured versions for internal use
- **Example**: Content team uses AI Content Writer with unlimited generations

### 2. Client (Authenticated Users)
- **Who**: Paying customers with accounts
- **Access**: Quota-limited (10/day, 100/month defaults)
- **Purpose**: Premium tools for registered users
- **Example**: Client gets 10 keyword researches/day, can purchase more

### 3. Public (Lead Magnets)
- **Who**: Anonymous visitors
- **Access**: Heavily rate-limited (3/day typical)
- **Purpose**: Lead generation and viral growth
- **Example**: Try our keyword tool, then sign up for more

## Architecture Components

### 1. Database Schema

Four core tables power the entire system:

#### `modules` Table (Central Registry)
```sql
-- 43 fields tracking everything about a module
id UUID PRIMARY KEY
slug TEXT UNIQUE          -- 'keyword-research'
name TEXT                 -- 'Keyword Research'
description TEXT
category TEXT             -- 'seo', 'content', 'automation', etc.

-- Lifecycle
status TEXT               -- 'testing' → 'review' → 'approved' → 'deprecated'
version TEXT              -- '1.0.0'

-- Access Control
audience JSONB            -- ['internal'] or ['internal','client'] or ['internal','client','public']
requires_brain BOOLEAN    -- True for most modules (needs Business Brain context)
requires_auth BOOLEAN     -- False for public modules

-- Technical
runtime_preference TEXT   -- 'serverless' (Netlify) or 'node-heavy' (Railway)
entry_point TEXT          -- 'src/modules/keyword-research/index.jsx'
function_endpoint TEXT    -- '/.netlify/functions/module-keyword-research'
component_path TEXT       -- 'src/modules/keyword-research/KeywordResearchUI.jsx'

-- Schemas (Zod as JSON)
input_schema JSONB        -- Expected inputs
output_schema JSONB       -- Expected outputs
config_schema JSONB       -- User-configurable settings

-- WordPress Integration
wordpress_compatible BOOLEAN
wordpress_shortcode TEXT  -- '[disruptors_keyword_research]'
wordpress_block TEXT      -- 'disruptors/keyword-research'
wordpress_embed_type TEXT -- 'iframe' | 'web-component' | 'rest-api'

-- Default Quotas (per user)
default_daily_limit INTEGER      -- 10
default_monthly_limit INTEGER    -- 100
default_cost_per_run NUMERIC     -- 0.05 USD

-- Metadata
icon_url TEXT
color TEXT                -- Tailwind color class
tags TEXT[]
documentation_url TEXT
created_by UUID
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
last_run_at TIMESTAMPTZ

-- Full-text search
search_vector tsvector    -- Automatically indexed
```

#### `module_runs` Table (Telemetry)
```sql
-- Tracks EVERY execution for analytics, billing, debugging
id UUID PRIMARY KEY
module_id UUID            -- Which module?
user_id UUID              -- Who ran it? (NULL for anonymous)
brain_id UUID             -- Which Business Brain context?

-- Context
audience TEXT             -- 'internal' | 'client' | 'public'
run_context JSONB         -- { source: 'admin', ip_address, user_agent, etc. }

-- Input/Output
input_data JSONB          -- What the user provided
output_data JSONB         -- What the module returned
input_hash TEXT           -- MD5 for deduplication

-- Performance
duration_ms INTEGER       -- How long it took
tokens_used INTEGER       -- AI tokens consumed
cost_usd NUMERIC          -- Actual cost

-- Result
status TEXT               -- 'success' | 'fail' | 'timeout' | 'rate_limited' | 'quota_exceeded'
error_message TEXT
error_stack TEXT

-- Tracking
ip_address INET
user_agent TEXT
referer TEXT
session_id TEXT

created_at TIMESTAMPTZ
completed_at TIMESTAMPTZ
```

#### `module_access` Table (Per-User Quotas)
```sql
-- Controls who can access which modules and with what limits
id UUID PRIMARY KEY
module_id UUID
user_id UUID

-- Access
enabled BOOLEAN           -- Can be toggled off
audience TEXT             -- 'internal' | 'client' | 'public'

-- Quotas (NULL = use module defaults)
daily_limit INTEGER       -- Override module's default
monthly_limit INTEGER
lifetime_limit INTEGER    -- Total runs allowed ever

-- Current Usage (auto-resets)
daily_used INTEGER
monthly_used INTEGER
lifetime_used INTEGER

-- User Settings
config JSONB              -- User's custom settings for this module
preferences JSONB         -- UI state, favorites, etc.

-- Reset Tracking
daily_reset_at TIMESTAMPTZ    -- When to reset daily counter
monthly_reset_at TIMESTAMPTZ  -- When to reset monthly counter

-- Metadata
granted_by UUID           -- Who gave this access?
granted_reason TEXT
last_used_at TIMESTAMPTZ

UNIQUE(module_id, user_id)
```

#### `module_configs` Table (System-Wide Settings)
```sql
-- System-level configuration (API keys, feature flags, etc.)
id UUID PRIMARY KEY
module_id UUID
key TEXT                  -- 'api_key', 'feature_flags', 'rate_limit_override'
value JSONB               -- Configuration data
encrypted BOOLEAN         -- Should this be encrypted?
description TEXT
updated_by UUID

UNIQUE(module_id, key)
```

### 2. Module Directory Structure

All modules live in `src/modules/`:

```
src/modules/
├── _template/                        # Copy this to create new modules
│   ├── manifest.json                 # Module definition (single source of truth)
│   ├── index.jsx                     # Module orchestration & execution
│   ├── ModuleUI.jsx                  # React component
│   ├── schema.js                     # Zod schemas
│   └── README.md                     # Complete guide
│
├── keyword-research/                 # [Phase 2] Existing feature → Module
│   ├── manifest.json
│   ├── index.jsx
│   ├── KeywordResearchUI.jsx
│   ├── schema.js
│   └── README.md
│
├── ai-content-writer/                # [Phase 2] Existing feature → Module
│   ├── manifest.json
│   ├── index.jsx
│   ├── AIContentWriterUI.jsx
│   ├── schema.js
│   └── README.md
│
├── growth-audit/                     # [Phase 2] Existing feature → Module
│   ├── manifest.json
│   ├── index.jsx
│   ├── GrowthAuditUI.jsx
│   ├── schema.js
│   └── README.md
│
└── [future-modules]/
    └── ...
```

### 3. Module Manifest

Every module has a `manifest.json` that defines EVERYTHING about it:

```json
{
  "id": "keyword-research",
  "slug": "keyword-research",
  "name": "Keyword Research",
  "description": "AI-powered keyword research with DataForSEO integration. Find profitable keywords with real search volume, difficulty, and CPC data.",
  "category": "seo",
  "status": "approved",
  "version": "1.0.0",

  "audience": ["internal", "client"],
  "requires_brain": true,
  "requires_auth": true,

  "runtime_preference": "serverless",
  "entry_point": "src/modules/keyword-research/index.jsx",
  "function_endpoint": "/.netlify/functions/module-keyword-research",
  "component_path": "src/modules/keyword-research/KeywordResearchUI.jsx",

  "icon_url": "https://...",
  "color": "#3B82F6",
  "tags": ["seo", "keywords", "research", "dataforseo"],

  "input_schema": {
    "type": "object",
    "properties": {
      "seed_keyword": {
        "type": "string",
        "minLength": 1,
        "maxLength": 100,
        "description": "The seed keyword to research"
      },
      "location": {
        "type": "string",
        "default": "United States",
        "description": "Geographic location for search data"
      }
    },
    "required": ["seed_keyword"]
  },

  "output_schema": {
    "type": "object",
    "properties": {
      "keywords": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "keyword": { "type": "string" },
            "volume": { "type": "number" },
            "difficulty": { "type": "number" },
            "cpc": { "type": "number" },
            "opportunity_score": { "type": "number" }
          }
        }
      },
      "total_results": { "type": "number" }
    }
  },

  "config_schema": {
    "type": "object",
    "properties": {
      "default_location": {
        "type": "string",
        "default": "United States"
      },
      "results_limit": {
        "type": "number",
        "min": 10,
        "max": 100,
        "default": 50
      }
    }
  },

  "wordpress_compatible": true,
  "wordpress_shortcode": "[disruptors_keyword_research]",
  "wordpress_block": "disruptors/keyword-research",
  "wordpress_embed_type": "iframe",

  "supports_batch": false,
  "has_preview": true,
  "is_experimental": false,

  "default_daily_limit": 10,
  "default_monthly_limit": 100,
  "default_cost_per_run": 0.05,

  "documentation_url": "https://docs.disruptorsmedia.com/modules/keyword-research",
  "changelog": "v1.0.0 - Initial release with DataForSEO integration"
}
```

### 4. Module Code Structure

#### index.jsx (Module Orchestration)
```jsx
import manifest from './manifest.json';
import { inputSchema, outputSchema, configSchema } from './schema.js';
import ModuleUI from './ModuleUI.jsx';

export const moduleConfig = {
  manifest,
  component: ModuleUI,

  /**
   * Execute the module
   * Called by module executor with validated inputs and context
   */
  async execute({ input, user, brain, audience, config }) {
    // Access Business Brain context
    const businessName = brain?.business_name || 'your business';
    const industry = brain?.industry || 'your industry';

    // Module logic here
    const result = await performKeywordResearch({
      seed: input.seed_keyword,
      location: config.default_location || 'United States',
      businessContext: {
        name: businessName,
        industry: industry
      }
    });

    return {
      keywords: result.keywords,
      total_results: result.total
    };
  },

  /**
   * Validate input before execution
   */
  validateInput(input) {
    return inputSchema.parse(input);
  },

  /**
   * Transform input with Business Brain context
   */
  transformInput(input, brain) {
    // Add brain context to prompts, etc.
    return {
      ...input,
      business_context: {
        name: brain?.business_name,
        industry: brain?.industry,
        voice: brain?.brand_voice
      }
    };
  }
};

export default moduleConfig;
```

#### ModuleUI.jsx (React Component)
```jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function KeywordResearchUI({
  brain,          // Business Brain context
  audience,       // 'internal' | 'client' | 'public'
  config = {},    // User's custom settings
  access = {},    // Quota info: { daily_limit, daily_used, etc. }
  onRun,          // Execute handler
  loading = false,
  result = null,
  error = null
}) {
  const [seedKeyword, setSeedKeyword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onRun({ seed_keyword: seedKeyword });
  };

  // Show different UI based on audience
  const isInternal = audience === 'internal';
  const isClient = audience === 'client';
  const isPublic = audience === 'public';

  return (
    <div className="space-y-6">
      {/* Header with quota info */}
      {access && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Keyword Research</h2>
          {!isInternal && (
            <div className="text-sm text-muted-foreground">
              {access.daily_used}/{access.daily_limit} used today
            </div>
          )}
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Enter seed keyword..."
          value={seedKeyword}
          onChange={(e) => setSeedKeyword(e.target.value)}
          disabled={loading}
        />

        <Button type="submit" disabled={loading || !seedKeyword}>
          {loading ? 'Researching...' : 'Research Keywords'}
        </Button>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-2">
          <h3 className="font-semibold">Results ({result.total_results})</h3>
          {result.keywords.map((kw, i) => (
            <div key={i} className="p-3 border rounded">
              <div className="flex justify-between">
                <span className="font-medium">{kw.keyword}</span>
                <span className="text-sm text-muted-foreground">
                  Vol: {kw.volume} | Diff: {kw.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded">
          {error.message}
        </div>
      )}

      {/* Public audience: Show upgrade CTA */}
      {isPublic && (
        <div className="mt-6 p-4 bg-primary/10 rounded">
          <p className="font-semibold">Want unlimited research?</p>
          <Button variant="default" className="mt-2">
            Sign Up for Free
          </Button>
        </div>
      )}
    </div>
  );
}
```

#### schema.js (Zod Validation)
```javascript
import { z } from 'zod';

export const inputSchema = z.object({
  seed_keyword: z.string().min(1).max(100),
  location: z.string().default('United States')
});

export const outputSchema = z.object({
  keywords: z.array(z.object({
    keyword: z.string(),
    volume: z.number(),
    difficulty: z.number(),
    cpc: z.number(),
    opportunity_score: z.number()
  })),
  total_results: z.number()
});

export const configSchema = z.object({
  default_location: z.string().default('United States'),
  results_limit: z.number().min(10).max(100).default(50)
});
```

### 5. Module Registry

The `ModuleRegistry` class manages all module loading, caching, and access control:

```typescript
import { ModuleRegistry } from '@/lib/modules';

// Load all approved modules for client audience
const modules = await ModuleRegistry.loadModules({
  audience: 'client',
  status: 'approved',
  forceRefresh: false  // Use cache
});

// Load specific module
const module = await ModuleRegistry.loadModule('keyword-research');

// Check user access (calls Supabase RPC function)
const access = await ModuleRegistry.checkModuleAccess(
  'keyword-research',
  userId,
  'client'
);
// Returns:
{
  allowed: true,
  module_id: 'uuid',
  access_id: 'uuid',
  daily_limit: 10,
  monthly_limit: 100,
  daily_used: 3,
  monthly_used: 45,
  config: { default_location: 'Canada' }
}

// Get user's access record for a module
const userAccess = await ModuleRegistry.getModuleAccess(moduleId, userId);

// Update user's access (quotas, config, etc.)
await ModuleRegistry.setModuleAccess(moduleId, userId, {
  daily_limit: 20,  // Increase limit
  config: { default_location: 'Canada' }
});

// Increment usage after successful run
await ModuleRegistry.incrementModuleUsage(moduleId, userId);

// Search modules
const results = await ModuleRegistry.searchModules('SEO tools', {
  audience: 'client',
  category: 'seo',
  limit: 10
});
```

### 6. Module Executor

The `executeModule` function handles the complete execution lifecycle:

```typescript
import { executeModule } from '@/lib/modules';

const result = await executeModule(
  'keyword-research',                    // Module slug
  { seed_keyword: 'plumber near me' },   // Input data
  {
    userId: user.id,
    brainId: brain.id,
    audience: 'client',
    sessionId: sessionId,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  }
);

// Executor workflow:
// 1. Check access (quotas, permissions) via check_module_access RPC
// 2. Load Business Brain if required
// 3. Load module configuration
// 4. Validate input using Zod schema
// 5. Transform input with brain context
// 6. Execute module logic
// 7. Track telemetry (insert into module_runs)
// 8. Increment usage counters via increment_module_usage RPC
// 9. Return result or error

// Result structure:
{
  success: true,
  data: {
    keywords: [...],
    total_results: 50
  },
  metadata: {
    module_id: 'uuid',
    run_id: 'uuid',
    duration_ms: 1234,
    tokens_used: 500,
    cost_usd: 0.05
  }
}
```

## Security & Row Level Security (RLS)

### RLS Policies

Every table has strict RLS policies:

```sql
-- modules table
-- Public: Can view approved public modules
CREATE POLICY "Public can view approved public modules"
  ON modules FOR SELECT
  USING (
    status = 'approved' AND
    audience::jsonb ? 'public'
  );

-- Authenticated: Can view approved client/internal modules
CREATE POLICY "Authenticated users can view approved modules"
  ON modules FOR SELECT
  TO authenticated
  USING (
    status = 'approved' AND
    (audience::jsonb ? 'client' OR audience::jsonb ? 'internal')
  );

-- Service role: Full access (for admin operations)
CREATE POLICY "Service role has full access to modules"
  ON modules FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- module_runs table
-- Users can only view their own runs
CREATE POLICY "Users can view their own module runs"
  ON module_runs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- module_access table
-- Users can view their own access records
CREATE POLICY "Users can view their own module access"
  ON module_access FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own config/preferences (NOT quotas!)
CREATE POLICY "Users can update their own module preferences"
  ON module_access FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    -- Prevent users from modifying quotas
    daily_limit IS NOT DISTINCT FROM (SELECT daily_limit FROM module_access WHERE id = module_access.id) AND
    monthly_limit IS NOT DISTINCT FROM (SELECT monthly_limit FROM module_access WHERE id = module_access.id)
  );
```

### Helper Functions (SECURITY DEFINER)

All quota and access management is done via secure Postgres functions:

```sql
-- Check module access (with automatic access record creation)
CREATE OR REPLACE FUNCTION check_module_access(
  p_module_slug TEXT,
  p_user_id UUID,
  p_audience TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with elevated privileges
AS $$
DECLARE
  v_module RECORD;
  v_access RECORD;
BEGIN
  -- Get module
  SELECT * INTO v_module
  FROM modules
  WHERE slug = p_module_slug AND status = 'approved';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Module not found');
  END IF;

  -- Check audience
  IF NOT (v_module.audience::jsonb ? p_audience) THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Not available for this audience');
  END IF;

  -- For public, return module defaults
  IF p_audience = 'public' THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'daily_limit', v_module.default_daily_limit
    );
  END IF;

  -- For authenticated, check/create access record
  SELECT * INTO v_access
  FROM module_access
  WHERE module_id = v_module.id AND user_id = p_user_id;

  IF NOT FOUND THEN
    -- Auto-create access record with defaults
    INSERT INTO module_access (module_id, user_id, audience)
    VALUES (v_module.id, p_user_id, p_audience)
    RETURNING * INTO v_access;
  END IF;

  -- Check quotas
  IF v_access.daily_used >= COALESCE(v_access.daily_limit, v_module.default_daily_limit) THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Daily quota exceeded');
  END IF;

  -- Access granted
  RETURN jsonb_build_object(
    'allowed', true,
    'module_id', v_module.id,
    'daily_limit', COALESCE(v_access.daily_limit, v_module.default_daily_limit),
    'daily_used', v_access.daily_used,
    'config', v_access.config
  );
END;
$$;

-- Increment usage
CREATE OR REPLACE FUNCTION increment_module_usage(
  p_module_id UUID,
  p_user_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE module_access
  SET
    daily_used = daily_used + 1,
    monthly_used = monthly_used + 1,
    lifetime_used = lifetime_used + 1,
    last_used_at = NOW()
  WHERE module_id = p_module_id AND user_id = p_user_id;

  UPDATE modules
  SET last_run_at = NOW()
  WHERE id = p_module_id;
END;
$$;
```

## WordPress Integration (Future)

Modules can be embedded in WordPress sites via plugin:

```php
// WordPress plugin: disruptors-modules

// Shortcode usage
// [disruptors_keyword_research seed="plumber"]

// Implementation
function disruptors_keyword_research_shortcode($atts) {
  $atts = shortcode_atts([
    'seed' => '',
    'location' => 'United States'
  ], $atts);

  // Get WordPress user ID
  $user_id = get_current_user_id();

  // Call Netlify function
  $response = wp_remote_get(
    'https://dm4.wjwelsh.com/.netlify/functions/module-keyword-research',
    [
      'body' => [
        'input' => json_encode([
          'seed_keyword' => $atts['seed'],
          'location' => $atts['location']
        ]),
        'user_id' => $user_id,
        'audience' => $user_id ? 'client' : 'public'
      ]
    ]
  );

  // Render iframe embed
  return '<iframe src="..." width="100%" height="600"></iframe>';
}
add_shortcode('disruptors_keyword_research', 'disruptors_keyword_research_shortcode');
```

## Migration & Setup

### 1. Apply Migration

```bash
# Check migration status
node scripts/apply-modules-migration.js

# This will provide instructions to apply migration manually via Supabase SQL Editor
# Migration file: supabase/migrations/20251010_modules_infrastructure.sql
```

### 2. Verify Migration

```bash
# Verify all tables and functions exist
node scripts/verify-modules-migration.js

# Expected output:
# ✅ modules
# ✅ module_runs
# ✅ module_access
# ✅ module_configs
# ✅ check_module_access (function exists)
# ✅ increment_module_usage (function exists)
```

### 3. Seed Initial Modules

```bash
# Seed 4 initial modules to database
node scripts/seed-modules.js

# Seeds:
# - keyword-research (approved, internal+client)
# - ai-content-writer (approved, internal+client)
# - growth-audit (review, internal+public)
# - module-template (testing, internal)
```

## Phase 2: Refactoring Existing Features

The next phase involves refactoring existing standalone features into the modules system:

### 1. Keyword Research Module

**Current**: Standalone admin module with DataForSEO integration
**Target**: Proper module with manifest, three-level access, quotas

**Tasks**:
- [ ] Create `src/modules/keyword-research/` directory
- [ ] Write `manifest.json` with all metadata
- [ ] Refactor existing component into `KeywordResearchUI.jsx` with audience prop
- [ ] Extract business logic into `index.jsx` execute function
- [ ] Define Zod schemas in `schema.js`
- [ ] Create Netlify function `module-keyword-research.js`
- [ ] Test internal, client, and public access levels
- [ ] Update admin UI to use module executor
- [ ] Create public demo page

### 2. AI Content Writer Module

**Current**: Admin-only content generation tool
**Target**: Module with client access for content generation

**Tasks**:
- [ ] Create `src/modules/ai-content-writer/` directory
- [ ] Write manifest with three audience levels
- [ ] Refactor UI to show quotas for client access
- [ ] Add telemetry tracking for all generations
- [ ] Create public "Try it free" version with limited outputs
- [ ] Integrate with Business Brain for personalization

### 3. Growth Audit Module

**Current**: Public demo at `/demos/growth-audit`
**Target**: Proper module with lead capture

**Tasks**:
- [ ] Create `src/modules/growth-audit/` directory
- [ ] Write manifest for public + client + internal
- [ ] Public: 1 free audit, then email capture
- [ ] Client: Unlimited audits with saved history
- [ ] Internal: Full admin access + bulk processing
- [ ] Track all audits in module_runs for analytics

## Testing & Quality Assurance

### Manual Testing Checklist

For each module:

**Internal Access** (Admin):
- [ ] Module appears in admin modules list
- [ ] No quota limits enforced
- [ ] Full feature set available
- [ ] Can access all configuration options

**Client Access** (Authenticated):
- [ ] Module appears in app modules list
- [ ] Quota displayed correctly (X/10 used)
- [ ] Module stops working when quota exceeded
- [ ] Quota resets daily/monthly as configured
- [ ] User can update preferences (NOT quotas)

**Public Access** (Anonymous):
- [ ] Module accessible without login
- [ ] Heavy rate limiting (3/day typical)
- [ ] Clear upgrade CTA shown
- [ ] No sensitive features exposed

**Telemetry**:
- [ ] Every run tracked in module_runs
- [ ] Performance metrics captured (duration, tokens, cost)
- [ ] Errors logged with stack traces
- [ ] IP and user agent tracked

**Security**:
- [ ] RLS policies prevent unauthorized access
- [ ] Users can only see their own runs
- [ ] Users cannot modify quotas
- [ ] Service role bypass works for admin

## Best Practices

### When Creating New Modules

1. **Start with manifest.json** - This is the single source of truth
2. **Define schemas first** - Input/output/config schemas prevent bugs
3. **Test with all audiences** - Internal, client, public have different UX
4. **Use Business Brain** - Almost all modules should personalize with brain data
5. **Track everything** - Telemetry is essential for analytics and billing
6. **Document thoroughly** - Each module needs a README

### Security Considerations

1. **Never trust user input** - Always validate with Zod
2. **Use RLS policies** - Never bypass RLS except with service role
3. **Encrypt sensitive configs** - API keys in module_configs should be encrypted
4. **Rate limit aggressively** - Especially for public access
5. **Log everything** - Telemetry helps detect abuse

### Performance Optimization

1. **Cache module registry** - 5-minute cache prevents repeated DB queries
2. **Use serverless for speed** - Netlify functions are fast for most modules
3. **Lazy load UIs** - Module components should be code-split
4. **Deduplicate runs** - Use input_hash to prevent duplicate processing
5. **Monitor costs** - Track tokens_used and cost_usd for all AI operations

## Troubleshooting

### Migration Issues

**Problem**: "Table already exists" error
**Solution**: Migration already applied, skip to verification

**Problem**: "business_brains does not exist" error
**Solution**: Apply Business Brain migration first

**Problem**: "Permission denied" error
**Solution**: Use service role key, not anon key

### Runtime Issues

**Problem**: "Module not found" error
**Solution**: Check module status is 'approved' and audience includes user's level

**Problem**: "Quota exceeded" error
**Solution**: Check module_access table, reset quotas if needed

**Problem**: "Access denied" error
**Solution**: Verify RLS policies and user authentication

## Future Enhancements

### Short Term (Phase 2)
- Refactor all 3 existing features into modules
- Create Netlify function endpoints for module execution
- Build public demo pages for lead generation
- Add usage analytics dashboard

### Medium Term (Phase 3)
- WordPress plugin for module embedding
- Module marketplace (install modules from registry)
- Advanced telemetry dashboard
- Automated quota management and billing

### Long Term (Phase 4)
- Multi-tenant module system (clients create their own modules)
- Module versioning and rollback
- A/B testing framework for modules
- Module dependencies and composition

## Additional Resources

- **Template Guide**: `src/modules/_template/README.md`
- **Type Definitions**: `src/lib/modules/types.ts`
- **Migration SQL**: `supabase/migrations/20251010_modules_infrastructure.sql`
- **Application Script**: `scripts/apply-modules-migration.js`
- **Verification Script**: `scripts/verify-modules-migration.js`
- **Seed Script**: `scripts/seed-modules.js`
- **CLAUDE.md**: Complete architecture overview
- **Integration Plan**: `docs/USER_ACCOUNT_ADMIN_INTEGRATION_PLAN.md`

---

**Last Updated**: 2025-10-10
**Current Phase**: Phase 1 Complete (Infrastructure) → Phase 2 Starting (Refactor Features)
**Migration Status**: Ready but not yet applied (see APPLY_MODULES_MIGRATION.md)
