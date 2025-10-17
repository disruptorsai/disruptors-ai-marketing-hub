# SEO Audit Tool Migration - Application Guide

## Status: READY TO APPLY

The SEO Audit Tool database migration is ready to be applied to your Supabase database.

## Quick Start (3 Minutes)

### Option 1: Supabase SQL Editor (RECOMMENDED)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/ubqxflzuvxowigbjmqfb/sql/new

2. **Copy Migration SQL**
   ```bash
   # Copy the migration file to clipboard
   cat supabase/migrations/20251016_seo_audit_tool.sql | pbcopy
   ```

3. **Paste and Execute**
   - Paste the SQL into the editor
   - Click "Run" button
   - Wait for confirmation (should complete in 2-3 seconds)

4. **Verify**
   ```bash
   node scripts/verify-seo-audit-tables.js
   ```

### Option 2: Command Line (if you have database password)

```bash
# Run the PostgreSQL migration script
node scripts/apply-seo-migration-pg.js
```

This requires `SUPABASE_DB_PASSWORD` in your `.env` file.

### Option 3: Manual Copy-Paste

1. Open the migration file:
   ```
   supabase/migrations/20251016_seo_audit_tool.sql
   ```

2. Copy entire contents (341 lines)

3. Paste into Supabase SQL Editor and run

## What Gets Created

### Tables (4)
- ✅ `seo_audits` - Main audit records with status, scores, and metrics
- ✅ `seo_audit_sections` - Detailed section breakdowns (meta tags, content, technical, etc.)
- ✅ `seo_audit_recommendations` - Actionable recommendations with priority levels
- ✅ `seo_leads` - Lead capture from public tool with follow-up tracking

### Indexes (12)
Performance indexes on:
- Domain lookups
- Status filtering
- Date-based queries
- Email lookups
- Foreign key relationships

### Security (RLS + 10 Policies)
- Row Level Security enabled on all tables
- Public users can insert/view their own audits
- Admins can view/manage all data
- Service role has full access
- Email-based access control

### Functions (2)
- `update_seo_leads_updated_at()` - Auto-update timestamp trigger
- `calculate_seo_audit_overall_score(UUID)` - Calculate average score from sections

### Triggers (1)
- Auto-update `updated_at` on seo_leads table

### Views (1)
- `admin_seo_audit_summary` - Comprehensive dashboard view

## Verification Checklist

After applying the migration, verify:

```bash
# Run comprehensive verification
node scripts/verify-seo-audit-tables.js
```

Expected output:
- ✅ 4/4 tables accessible
- ✅ All CRUD operations working
- ✅ Foreign key cascade working
- ✅ No errors

## Troubleshooting

### Schema Cache Lag
If tables show "not found" immediately after migration:
- **Wait 30-60 seconds** for Supabase schema cache to refresh
- Run verification again
- This is normal and expected

### "Already Exists" Errors
If you see "already exists" warnings:
- This is fine - it means objects were created in a previous run
- The migration is idempotent (safe to run multiple times)

### Access Denied Errors
If you see permission errors:
- Verify `VITE_SUPABASE_SERVICE_ROLE_KEY` is in `.env`
- Make sure you're using the service role key, not anon key

## Testing the Migration

After verification passes, test with:

```javascript
import { supabaseAdmin } from '@/lib/supabase-client';

// Create a test audit
const { data, error } = await supabaseAdmin
  .from('seo_audits')
  .insert({
    domain: 'example.com',
    status: 'completed',
    source: 'internal',
    overall_score: 75,
    ranked_keywords_count: 10
  })
  .select()
  .single();

console.log('Test audit created:', data);
```

## Migration File Location

```
/Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/supabase/migrations/20251016_seo_audit_tool.sql
```

Size: ~11.32 KB (341 lines)

## Need Help?

If you encounter issues:

1. Check Supabase logs:
   https://supabase.com/dashboard/project/ubqxflzuvxowigbjmqfb/logs/postgres-logs

2. Verify environment variables:
   ```bash
   grep VITE_SUPABASE .env
   ```

3. Check table editor:
   https://supabase.com/dashboard/project/ubqxflzuvxowigbjmqfb/editor

## Next Steps

After successful migration:

1. ✅ Integrate into SEO Audit module
2. ✅ Create Netlify function for audit processing
3. ✅ Build admin dashboard for lead management
4. ✅ Implement lead capture form
5. ✅ Set up automated email follow-ups

---

**Ready to apply?** Run Option 1 (Supabase SQL Editor) - it's the fastest and most reliable method.
