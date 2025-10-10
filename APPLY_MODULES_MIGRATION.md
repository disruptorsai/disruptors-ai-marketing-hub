# Apply Modules Migration - Quick Guide

## Status
❌ **NOT YET APPLIED** - Migration ready but requires manual application via Supabase Dashboard

## What This Migration Does

Creates the complete modules system infrastructure:
- **4 new tables**: `modules`, `module_runs`, `module_access`, `module_configs`
- **6 helper functions**: Access control, quota management, usage tracking
- **RLS policies**: Three-level security (internal/client/public)
- **Triggers**: Auto-update timestamps
- **Indexes**: Optimized for common queries

## Quick Steps (5 minutes)

### 1. Open Supabase SQL Editor
🔗 **Direct Link**: https://supabase.com/dashboard/project/ubqxflzuvxowigbjmqfb/sql/new

### 2. Copy Migration SQL
The SQL file is already copied to your clipboard (or copy from):
```
supabase/migrations/20251010_modules_infrastructure.sql
```

### 3. Paste & Run
1. Paste the entire SQL file into the SQL Editor
2. Click the **"Run"** button (or press Ctrl+Enter)
3. Wait for success message

### 4. Verify Migration
Run this command to verify all tables were created:
```bash
node scripts/verify-modules-migration.js
```

Expected output:
```
✅ Migration successfully applied!
✅ All 4 tables created
✅ All 6 functions created
✅ RLS policies active
```

### 5. Seed Initial Data
Once verified, seed the initial modules:
```bash
node scripts/seed-modules.js
```

This will create 4 initial modules:
- Keyword Research (approved, internal+client)
- AI Content Writer (approved, internal+client)
- Growth Audit (review, internal+public)
- Module Template (testing, internal)

## Troubleshooting

### Error: "relation already exists"
The migration is already applied! Skip to verification step.

### Error: "permission denied"
Make sure you're using the service role key, not the anon key.

### Error: "business_brains does not exist"
The Business Brain migration must be applied first. See:
```
APPLY_MIGRATION_NOW.md
```

## Next Steps After Migration

1. ✅ Verify migration: `node scripts/verify-modules-migration.js`
2. ✅ Seed modules: `node scripts/seed-modules.js`
3. ✅ Test module registry: `node scripts/test-module-registry.js`
4. 📝 Documentation will be auto-updated
5. 🚀 Phase 2: Refactor Keyword Research into first module

## Files Involved

- **Migration SQL**: `supabase/migrations/20251010_modules_infrastructure.sql` (550 lines)
- **Application script**: `scripts/apply-modules-migration.js`
- **Verification script**: `scripts/verify-modules-migration.js` (to be created)
- **Seed script**: `scripts/seed-modules.js` (300+ lines, already created)

## Database Schema Overview

```
modules (13 core fields + 30 metadata fields)
├── id, slug, name, description, category
├── audience: ['internal'], ['internal','client'], ['internal','client','public']
├── requires_brain, requires_auth
├── input_schema, output_schema, config_schema (Zod as JSON)
├── wordpress_compatible, wordpress_shortcode, wordpress_block
└── default quotas: daily_limit, monthly_limit, cost_per_run

module_runs (telemetry tracking)
├── module_id, user_id, brain_id
├── input_data, output_data, input_hash
├── duration_ms, tokens_used, cost_usd
├── status: success, fail, timeout, rate_limited, quota_exceeded
└── Performance metrics: ip_address, user_agent, session_id

module_access (per-user quotas)
├── module_id, user_id, audience
├── daily_limit, monthly_limit, lifetime_limit (overrides module defaults)
├── daily_used, monthly_used, lifetime_used
├── config (user settings), preferences (UI state)
└── Auto-resets: daily_reset_at, monthly_reset_at

module_configs (system-wide settings)
├── module_id, key, value (JSONB)
├── encrypted flag for sensitive data
└── API keys, feature flags, admin overrides
```

## Security Model

**Three-Level Access Control**:
1. **Internal** (Admin) - Unlimited access, all modules, service role bypass
2. **Client** (Authenticated users) - Quota-limited, approved modules only
3. **Public** (Anonymous) - Rate-limited, public modules only, lead magnets

**RLS Policies**:
- Public: Can view approved public modules
- Authenticated: Can view approved client/internal modules
- Service role: Full access (bypasses RLS)
- Users can only view their own runs and access records

**Helper Functions**:
- `check_module_access(slug, user_id, audience)` → Access decision + quota info
- `increment_module_usage(module_id, user_id)` → Increment counters
- `reset_daily_module_quotas()` → Reset all daily quotas (cron)
- `reset_monthly_module_quotas()` → Reset all monthly quotas (cron)

---

**Ready?** Open the SQL Editor and paste the migration! 🚀
