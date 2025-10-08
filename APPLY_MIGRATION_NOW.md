# Apply Posts Table Migration - IMMEDIATE ACTION REQUIRED

## Migration Status: Ready to Apply

The minimal migration adds only the 2 missing keyword columns to the posts table.

## Step 1: Open Supabase SQL Editor

**Direct Link**: https://supabase.com/dashboard/project/ubqxflzuvxowigbjmqfb/sql/new

Or navigate:
1. Go to https://supabase.com/dashboard
2. Click project: ubqxflzuvxowigbjmqfb
3. Click "SQL Editor" in sidebar
4. Click "New Query"

## Step 2: Copy and Paste This SQL

**⚠️ IMPORTANT: Copy ONLY the SQL below (NOT the ```sql line)**

-- Add only the missing columns to posts table
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS primary_keyword TEXT,
  ADD COLUMN IF NOT EXISTS secondary_keywords TEXT[];

-- Create indexes for keyword search performance
CREATE INDEX IF NOT EXISTS idx_posts_primary_keyword ON posts(primary_keyword);
CREATE INDEX IF NOT EXISTS idx_posts_secondary_keywords ON posts USING GIN(secondary_keywords);

-- Add comments
COMMENT ON COLUMN posts.primary_keyword IS 'Primary SEO keyword for this post';
COMMENT ON COLUMN posts.secondary_keywords IS 'Array of secondary SEO keywords for this post';

## Step 3: Click "RUN"

You should see: **"Success. No rows returned"**

## Step 4: Verify Columns Were Added

Run this verification query in a NEW query tab:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'posts'
  AND column_name IN ('primary_keyword', 'secondary_keywords')
ORDER BY column_name;
```

Expected result: **2 rows** (primary_keyword, secondary_keywords)

---

## What This Migration Does

✅ Adds `primary_keyword` column (TEXT) - for primary SEO keyword targeting
✅ Adds `secondary_keywords` column (TEXT[]) - for secondary keyword array
✅ Creates performance indexes on both columns for fast searches
✅ Safe to run multiple times (uses IF NOT EXISTS)

## Existing Columns (No Changes)

These columns already exist in your posts table and won't be modified:
- `brain_id` - Business Brain reference (UUID)
- `meta_title` - SEO meta title
- `meta_description` - SEO meta description
- `slug` - URL slug (unique)
- `status` - Post status (draft/published)
- `scheduled_date` - Publishing schedule timestamp
- `word_count` - Article word count
- `ai_generated` - AI generation flag (boolean)
- `editor_notes` - Editorial notes (text)

---

## After Migration Success

The next automated steps will be:

1. ✅ **Deploy to Production** - Push code to master for Netlify auto-deploy
2. ✅ **Test Netlify Functions** - Verify brain-auto-initialize, brain-enhance, brain-content-generate
3. ✅ **End-to-End Testing** - Test full workflow from brain init to content generation
4. 🔒 **Security Fixes** - Move AI API keys server-side

---

**Ready?** Copy the SQL above and run it in Supabase SQL Editor now!
