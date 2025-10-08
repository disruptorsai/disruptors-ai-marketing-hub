# Apply Business Brain Migration - Step by Step

## Quick Start (Manual Application)

Since the Supabase JavaScript client doesn't support raw SQL execution, we'll apply the migration via the Supabase Dashboard SQL Editor.

### Step 1: Open Supabase SQL Editor

Go to: **https://app.supabase.com/project/ubqxflzuvxowigbjmqfb/sql**

Or navigate manually:
1. Go to https://app.supabase.com
2. Select your project: `ubqxflzuvxowigbjmqfb`
3. Click "SQL Editor" in the left sidebar

### Step 2: Copy Migration SQL

Open this file: `supabase/migrations/20250107_business_brain_infrastructure.sql`

Copy the ENTIRE contents (1,100 lines)

### Step 3: Execute Migration

1. In SQL Editor, click "New Query"
2. Paste the migration SQL
3. Click "Run" or press Ctrl+Enter
4. Wait for execution to complete (~30-60 seconds)

### Step 4: Verify Tables Created

Run this verification query in a new SQL Editor tab:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'business_brains',
    'brain_facts',
    'brand_rules',
    'brand_assets',
    'onboarding_sessions',
    'knowledge_sources',
    'posts_brain_facts'
  )
ORDER BY table_name;
```

You should see 7 tables listed.

### Step 5: Verify RLS Policies

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%brain%'
ORDER BY tablename;
```

All should show `rowsecurity = t` (true).

### Step 6: Test Database Functions

```sql
-- Test confidence calculation function
SELECT calculate_brain_confidence('00000000-0000-0000-0000-000000000000'::uuid);
-- Should return: 0.00 (no error)
```

## Troubleshooting

### Error: "extension 'vector' does not exist"

Enable pgvector extension:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Then re-run the migration.

### Error: "relation 'organizations' does not exist"

The `business_brains` table references `organizations(id)`. You need to create the organizations table first:

```sql
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Or modify the migration to make `organization_id` nullable:

```sql
-- Line 39 in migration file, change:
organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
-- To:
organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NULL,
```

### Error: "function calculate_brain_confidence already exists"

The migration uses `CREATE OR REPLACE FUNCTION` so this shouldn't happen. If it does, drop and recreate:

```sql
DROP FUNCTION IF EXISTS calculate_brain_confidence(UUID);
-- Then re-run that section of the migration
```

## Alternative: Use Supabase CLI

If you install Supabase CLI, you can apply migrations automatically:

```bash
npm install -g supabase
supabase login
supabase link --project-ref ubqxflzuvxowigbjmqfb
supabase db push
```

## Next Steps After Migration

Once migration is applied successfully:

1. ✅ Verify all 7 tables exist
2. ✅ Verify RLS policies are enabled
3. ✅ Test database functions work
4. 🔜 Deploy Netlify functions
5. 🔜 Test function endpoints
6. 🔜 Build frontend applications

---

**Need Help?**

Check these docs:
- Integration Guide: `docs/BUSINESS_BRAIN_INTEGRATION_GUIDE.md`
- Infrastructure Summary: `docs/BUSINESS_BRAIN_INFRASTRUCTURE_SUMMARY.md`
- Migration File: `supabase/migrations/20250107_business_brain_infrastructure.sql`
