# Database Quick Reference Guide

Quick access guide for database operations, health checks, and troubleshooting.

---

## Quick Commands

```bash
# Database Health & Status
npm run db:health          # Comprehensive health check (detailed report)
npm run db:migrations      # Check migration status
npm run db:setup           # Initialize database (first time setup)

# Development
npm run dev:netlify        # Start dev server with functions (for modules)
npm run dev                # Start frontend-only dev server
```

---

## Health Check Outputs

### 1. Comprehensive Health Check
```bash
npm run db:health
```

**Checks:**
- ✅ Table existence (15 expected tables)
- ✅ Schema validation (required columns)
- ✅ RLS policy status (10 critical tables)
- ✅ Data integrity (orphaned records, FK violations)
- ✅ Performance (indexes, query optimization)
- ✅ Security posture (auth, key exposure)

**Output Files:**
- Console: Colored terminal output with summary
- JSON: `database-health-report.json` (detailed data)

**Status Levels:**
- 🟢 **EXCELLENT** - No issues, optimized
- 🔵 **GOOD** - Minor warnings, functional
- 🟡 **WARNING** - Issues detected, needs attention
- 🔴 **CRITICAL** - Immediate action required

### 2. Migration Status Check
```bash
npm run db:migrations
```

**Checks:**
- Core table existence
- Required columns per table
- Migration file inventory
- Migration history (if available)

**Output:** Console summary with table status

---

## Current Database Status

**Last Health Check:** 2025-10-13
**Overall Status:** 🔴 CRITICAL → 🟡 WARNING (after RLS applied)

### Critical Issues Found

1. **Row Level Security Disabled** 🔴
   - Impact: All user data accessible to any authenticated user
   - Fix: Apply RLS policies
   - Command: See "Applying RLS Policies" section below

2. **Missing Performance Indexes** 🟡
   - Impact: Slow queries at scale (>1000 users)
   - Fix: Included in RLS script
   - Status: Auto-applied with RLS

3. **Minor Schema Mismatches** 🟢
   - Impact: Low (field mapping handles differences)
   - Fix: Update Custom SDK or add columns
   - Status: Non-blocking

---

## Applying RLS Policies

### Prerequisites
- Supabase CLI installed OR direct database access
- Service role key in `.env` file
- Database connection details

### Option 1: Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref ubqxflzuvxowigbjmqfb

# Apply RLS policies
supabase db push --file scripts/enable-rls-policies.sql
```

### Option 2: SQL Editor (Supabase Dashboard)

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project: `ubqxflzuvxowigbjmqfb`
3. Go to **SQL Editor**
4. Copy contents of `scripts/enable-rls-policies.sql`
5. Paste and click **Run**

### Option 3: Direct psql Connection

```bash
# Get connection string from Supabase Dashboard > Project Settings > Database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres" \
  < scripts/enable-rls-policies.sql
```

### Verification

After applying RLS policies:

```bash
# Run health check again
npm run db:health

# Expected output:
# - RLS Enabled: 10/10 tables ✅
# - Indexes: 15+ indexes created ✅
# - Overall Health: GOOD or EXCELLENT ✅
```

---

## Table Overview

### Core Tables

| Table | Records | RLS | Purpose |
|-------|---------|-----|---------|
| `users` | 0 | ❌ | User accounts and profiles |
| `business_brains` | 4 | ❌ | Business intelligence per user |
| `brain_assets` | 0 | ❌ | Visual assets (logos, images) |
| `brain_themes` | 0 | ❌ | Brand color themes |
| `posts` | 7 | ❌ | Blog posts |
| `services` | 9 | ❌ | Service offerings |
| `team_members` | 5 | ❌ | Team member profiles |
| `case_study` | 0 | ❌ | Case studies |
| `site_media` | 57 | ❌ | Public site images |
| `modules` | 4 | ❌ | AI module registry |
| `module_runs` | 0 | ❌ | Module execution telemetry |
| `user_module_access` | 0 | ❌ | User quota tracking |

*RLS status shows current state - ❌ means not yet enabled*

### Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `ai-generated-images` | ✅ | AI-generated visuals |
| `ai-generated-videos` | ✅ | AI video outputs |
| `ai-generated-audio` | ✅ | AI audio/voice |
| `team-photos` | ✅ | Team member photos |
| `case-study-images` | ✅ | Case study visuals |
| `blog-images` | ✅ | Blog post images |
| `resource-files` | ✅ | Downloadable assets |

---

## Common Operations

### Checking RLS Status

```sql
-- Via SQL Editor in Supabase Dashboard
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'users', 'business_brains', 'brain_assets', 'brain_themes',
  'posts', 'services', 'modules', 'module_runs'
);
```

**Expected Output (After RLS Applied):**
```
tablename         | rowsecurity
------------------+-------------
users             | t
business_brains   | t
brain_assets      | t
brain_themes      | t
posts             | t
services          | t
modules           | t
module_runs       | t
```

### Viewing Active Policies

```sql
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Checking Indexes

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('users', 'business_brains', 'posts', 'modules', 'module_runs')
ORDER BY tablename, indexname;
```

### Table Sizes

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Troubleshooting

### Issue: Health Check Shows "CRITICAL"

**Cause:** RLS not enabled
**Fix:** Apply RLS policies (see "Applying RLS Policies" section)

### Issue: "Permission denied" errors in app

**Symptom:** Users can't access their own data
**Cause:** RLS policies too restrictive OR not using correct client
**Fix:**
1. Verify using `supabase` client (not `supabaseAdmin`) for user operations
2. Check RLS policies allow user access to own data
3. Verify `auth.uid()` returns correct user ID

```javascript
// Correct: Use regular client for user operations
import { supabase } from '@/lib/supabase-client'
const { data } = await supabase.from('business_brains').select('*')

// Admin operations: Use service role client
import { supabaseAdmin } from '@/lib/supabase-client'
const { data } = await supabaseAdmin.from('business_brains').select('*')
```

### Issue: Slow queries

**Symptom:** Dashboard loads slowly (>2 seconds)
**Cause:** Missing indexes
**Fix:** Apply RLS script (includes indexes) or add manually:

```sql
-- Critical indexes for performance
CREATE INDEX idx_business_brains_organization_id ON business_brains(organization_id);
CREATE INDEX idx_module_runs_user_id ON module_runs(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_slug ON posts(slug);
```

### Issue: "Table does not exist" errors

**Symptom:** App errors saying table not found
**Cause:** Missing migrations
**Fix:** Check which tables are missing:

```bash
npm run db:migrations
```

Then apply missing migrations manually via SQL Editor.

### Issue: Service role key exposed warning

**Symptom:** Health check warns about service role key
**Cause:** Key in `.env` file (expected)
**Action:** Verify key only used in Netlify Functions (server-side), never client-side
**Check:** Search codebase for `VITE_SUPABASE_SERVICE_ROLE_KEY` - should only appear in:
- `.env` file
- `src/lib/supabase-client.js` (server imports)
- Netlify functions (`netlify/functions/**`)

---

## Performance Optimization

### Recommended Indexes (Included in RLS Script)

```sql
-- User operations (authentication, profile)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Business Brain operations (dashboard, filtering)
CREATE INDEX idx_business_brains_organization_id ON business_brains(organization_id);
CREATE INDEX idx_business_brains_slug ON business_brains(slug);
CREATE INDEX idx_business_brains_brain_level ON business_brains(brain_level);

-- Module operations (execution tracking, quotas)
CREATE INDEX idx_module_runs_user_id ON module_runs(user_id);
CREATE INDEX idx_module_runs_module_id ON module_runs(module_id);
CREATE INDEX idx_module_runs_created_at ON module_runs(created_at DESC);
CREATE INDEX idx_module_runs_status ON module_runs(status);

-- Content operations (blog, services)
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_active ON services(active);
```

### Query Performance Testing

```sql
-- Test query performance with EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM business_brains
WHERE organization_id = 'some-user-id';

-- Look for:
-- - "Seq Scan" = BAD (no index used)
-- - "Index Scan" = GOOD (index used)
-- - Execution time < 10ms = EXCELLENT
```

---

## Security Checklist

- [ ] RLS enabled on all user data tables
- [ ] Service role key only used server-side
- [ ] `.env` file in `.gitignore`
- [ ] No API keys committed to git
- [ ] Supabase project has 2FA enabled
- [ ] Database backups verified
- [ ] Connection pooling configured
- [ ] Monitoring alerts set up

---

## Monitoring & Maintenance

### Daily Checks (Automated)
- Health check via cron: `0 9 * * * cd /path/to/project && npm run db:health`

### Weekly Reviews
- Review health check reports
- Check for slow queries
- Monitor table sizes
- Review user feedback for performance issues

### Monthly Maintenance
- Run VACUUM ANALYZE (automatic in Supabase)
- Review and archive old module_runs records
- Update indexes based on query patterns
- Review security audit logs

### Quarterly Reviews
- Full security audit
- Disaster recovery test
- Schema optimization review
- Capacity planning

---

## Resources

### Documentation
- **Full Health Report:** `/docs/DATABASE_HEALTH_REPORT.md`
- **RLS Policies:** `/scripts/enable-rls-policies.sql`
- **Supabase Docs:** https://supabase.com/docs

### Supabase Dashboard
- **Project URL:** https://supabase.com/dashboard/project/ubqxflzuvxowigbjmqfb
- **SQL Editor:** Dashboard > SQL Editor
- **Table Editor:** Dashboard > Table Editor
- **Auth Settings:** Dashboard > Authentication

### Support
- **Supabase Discord:** https://discord.supabase.com
- **Supabase GitHub:** https://github.com/supabase/supabase

---

## Quick Reference SQL Snippets

### Enable RLS on a table
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Create a simple RLS policy
```sql
CREATE POLICY "Users can view own data"
  ON table_name
  FOR SELECT
  USING (user_id = auth.uid());
```

### Check if RLS is enabled
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'your_table';
```

### List all policies
```sql
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

### Drop a policy
```sql
DROP POLICY "policy_name" ON table_name;
```

### Create an index
```sql
CREATE INDEX idx_table_column ON table_name(column_name);
```

### Drop an index
```sql
DROP INDEX idx_table_column;
```

### Check table size
```sql
SELECT pg_size_pretty(pg_total_relation_size('table_name'));
```

---

**Last Updated:** 2025-10-13
**Maintained By:** Database Operations Team
**Review Schedule:** Weekly during active development
