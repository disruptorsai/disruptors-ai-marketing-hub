# Apply Automation Feasibility Migration

## Migration Required

The automation feasibility analysis feature requires database schema changes.

### Option 1: Via Supabase SQL Editor (Recommended)

1. **Login to Supabase**: https://app.supabase.com
2. **Navigate to SQL Editor**
3. **Copy the SQL from**: `supabase/migrations/20250131_automation_feasibility.sql`
4. **Paste and execute** in the SQL editor
5. **Verify**: Run this query to confirm:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'change_requests'
AND column_name LIKE 'automation%';
```

### Option 2: Via Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push
```

## What This Migration Does

Adds the following columns to `change_requests` table:

- `automation_feasibility` - Classification: fully_automatable, partially_automatable, manual_required, external_required
- `automation_analysis` - Full JSON analysis from Claude
- `automation_confidence` - Confidence score (0-1)
- `automation_blockers` - Array of specific blockers
- `automation_recommendations` - Implementation recommendations
- `analyzed_at` - Timestamp of analysis

## After Migration

1. Refresh the admin panel
2. Click "Analyze Automation" button to analyze pending requests
3. Individual requests can be analyzed with the "Analyze" button
4. Automation badges will show feasibility status

## Features Enabled

✅ Automatic determination of which requests can be completed by AI coding assistants
✅ Confidence scores for automation feasibility
✅ Specific blocker identification
✅ Tool recommendations (Claude Code, Cursor, Manual, External)
✅ Implementation approach suggestions
✅ Batch analysis of all pending requests
