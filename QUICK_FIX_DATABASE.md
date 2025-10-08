# Quick Fix for "brain_level does not exist" Error

## What Happened
You got this error because your `business_brains` table exists but is missing the `brain_level` column (and possibly others). This happens when:
1. An older version of the table was created
2. The migration was partially applied
3. The table structure doesn't match what the app expects

## Quick Fix (2 Options)

### Option A: Add Missing Columns (Safer - Keeps Existing Data)

**Run this SQL in Supabase:**

1. Open: https://supabase.com/dashboard/project/ubqxflzuvxowigbjmqfb/sql/new

2. Copy and paste the entire content from:
   ```
   supabase/migrations/FIX_BRAIN_LEVEL_ERROR.sql
   ```

3. Click **RUN**

4. Verify success - you should see:
   ```
   6 rows returned
   ```

This will add the missing columns to your existing table without losing data.

---

### Option B: Start Fresh (Recommended if no important data)

If you don't have any important data in the `business_brains` table:

1. **Drop the existing table:**
```sql
DROP TABLE IF EXISTS business_brains CASCADE;
```

2. **Run the full migration:**
   - Open the file: `supabase/migrations/20250107_business_brain_infrastructure.sql`
   - Copy ALL the SQL (all 826 lines)
   - Paste into Supabase SQL Editor
   - Click RUN

This creates the table with the correct structure from scratch.

---

## After Fix is Applied

Test that it works:

1. **Start dev server:**
```bash
npm run dev:netlify
```

2. **Test registration:**
   - Visit: http://localhost:8888/resources
   - Click "AI Content Writer"
   - Sign up with email
   - Complete onboarding

3. **Check database:**
   - Open Supabase dashboard
   - Go to: Table Editor → business_brains
   - You should see your new brain record with all columns

---

## If You Still Get Errors

Check if other tables are missing:

```sql
-- Check which Business Brain tables exist
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

If you see fewer than 7 tables, you need to run the full migration (Option B above).

---

## What Columns Are Required

Your `business_brains` table MUST have these columns for the app to work:

| Column | Type | Required by |
|--------|------|-------------|
| `id` | UUID | All operations |
| `business_name` | TEXT | All operations |
| `website_url` | TEXT | Onboarding, scraping |
| `industry` | TEXT | Onboarding |
| `slug` | TEXT | Routing |
| `created_by` | UUID | User association |
| `brain_level` | TEXT | Health metrics |
| `confidence_score` | DECIMAL | Health metrics |
| `onboarding_completed` | BOOLEAN | Onboarding flow |
| `brand_colors` | JSONB | Brand DNA |
| `business_description` | TEXT | AI context |
| `created_at` | TIMESTAMP | Auditing |
| `updated_at` | TIMESTAMP | Auditing |

The fix script (Option A) adds all of these if they're missing.
