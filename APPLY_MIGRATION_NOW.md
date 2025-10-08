# Apply Business Brain Migration - DO THIS NOW

## Quick Instructions

### Step 1: Open Supabase SQL Editor

**Direct Link**: https://app.supabase.com/project/ubqxflzuvxowigbjmqfb/sql/new

Or navigate:
1. Go to https://app.supabase.com
2. Click project: ubqxflzuvxowigbjmqfb
3. Click "SQL Editor" in sidebar
4. Click "New Query"

### Step 2: Copy Migration SQL

Open this file: `supabase/migrations/20250107_business_brain_infrastructure.sql`

**Select ALL** (Ctrl+A) and **Copy** (Ctrl+C)

### Step 3: Paste and Execute

1. Paste the SQL into the SQL Editor
2. Click **"RUN"** button (or Ctrl+Enter)
3. Wait 30-60 seconds for execution

### Step 4: Verify Success

You should see: **"Success. No rows returned"**

Run this verification query in a NEW query tab:

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

Expected result: **7 tables**

---

## If You Get Errors

### Error: "extension vector does not exist"

Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Then re-run the full migration.

### Error: "table posts does not exist"

Comment out lines that extend the posts table:

Find this section (around line 373):
```sql
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS brain_id UUID REFERENCES business_brains(id),
  ...
```

Add `--` to comment it out:
```sql
-- ALTER TABLE posts
--   ADD COLUMN IF NOT EXISTS brain_id UUID REFERENCES business_brains(id),
--   ...
```

### Any Other Errors

Check:
- pgvector extension is enabled
- You're using the service_role key (not anon key)
- Your Supabase project is not in paused state

---

## After Migration Success

Come back and tell me "migration complete" so we can continue with:

1. ✅ Deploy Netlify functions
2. ✅ Test function endpoints
3. ✅ Create frontend API client
4. ✅ Build Business Brain Manager UI
5. ✅ Build AI Content Writer UI

---

**Ready?** Open the SQL Editor and apply the migration now!
