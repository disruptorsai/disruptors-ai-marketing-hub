# Batch Blog Regeneration Guide

## Complete Guide to Updating Existing Blogs with New Content Standards

This guide explains how to use the batch regeneration script to automatically update existing blog posts to comply with the new Blog Content Standards.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Usage Examples](#usage-examples)
5. [Options Reference](#options-reference)
6. [Workflow](#workflow)
7. [Safety Features](#safety-features)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### What It Does

The batch regeneration script (`scripts/batch-regenerate-blogs.js`) automatically regenerates existing blog posts using the updated prompts that enforce the Blog Content Standards.

**Key Features:**
- ✅ Regenerate multiple blogs at once
- ✅ Filter by audit score threshold
- ✅ Automatic content backups before regeneration
- ✅ Dry-run mode to preview changes
- ✅ Progress tracking during batch processing
- ✅ Rate limiting to avoid API throttling
- ✅ Detailed summary reports

### When to Use

Use this script when you want to:
- Update blogs that scored poorly on the audit (< 60)
- Bring all blogs into compliance with new standards
- Refresh outdated content with improved formatting
- Batch update specific blogs by slug or ID

---

## Prerequisites

### 1. Database Migration

First, apply the backups table migration:

```bash
# Apply the migration
node scripts/apply-migration.js supabase/migrations/20251021_blog_content_backups.sql
```

Or via Supabase SQL Editor:
1. Go to https://app.supabase.com/project/YOUR_PROJECT/sql
2. Paste contents of `supabase/migrations/20251021_blog_content_backups.sql`
3. Click "Run"

### 2. Environment Variables

Ensure these are set in your `.env` file:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3. Run Initial Audit

Identify which blogs need updating:

```bash
node scripts/audit-blog-content-standards.js
```

This shows you:
- Which blogs have low scores (< 60 = needs regeneration)
- Which blogs need minor edits (60-79)
- Which blogs are compliant (≥ 80)

---

## Quick Start

### Step 1: Preview with Dry-Run

Always start with a dry-run to see what will happen:

```bash
# Preview regeneration for blogs with score < 60
node scripts/batch-regenerate-blogs.js --score-threshold 60 --dry-run
```

**Output:**
```
📋 Blogs to Regenerate: 3

1. "How to Use AI for Email Marketing"
   Slug: how-to-use-ai-for-email-marketing
   Score: 45/100, Word Count: 850

2. "Marketing Automation Basics"
   Slug: marketing-automation-basics
   Score: 52/100, Word Count: 920

3. "SEO Tips for Service Businesses"
   Slug: seo-tips-service-businesses
   Score: 58/100, Word Count: 1050

🔍 DRY-RUN MODE: No changes will be made
```

### Step 2: Run Actual Regeneration

Remove `--dry-run` to perform the regeneration:

```bash
node scripts/batch-regenerate-blogs.js --score-threshold 60
```

**Confirmation Prompt:**
```
⚠️  WARNING: This will regenerate blog content and REPLACE existing content
   Backups will be created before regeneration

Proceed with regenerating 3 blog(s)? (y/n):
```

Type `y` and press Enter to proceed.

### Step 3: Review Results

Check the summary at the end:

```
📊 REGENERATION SUMMARY

Total Blogs Processed:  3
Successful:             3 ✅
Failed:                 0 ❌

✅ Successfully Regenerated:

1. "How to Use AI for Email Marketing"
   Slug: how-to-use-ai-for-email-marketing
   Word count: 850 → 1,547 words

2. "Marketing Automation Basics"
   Slug: marketing-automation-basics
   Word count: 920 → 1,823 words

3. "SEO Tips for Service Businesses"
   Slug: seo-tips-service-businesses
   Word count: 1,050 → 1,692 words
```

### Step 4: Re-Run Audit

Verify improved scores:

```bash
node scripts/audit-blog-content-standards.js
```

---

## Usage Examples

### Example 1: Regenerate by Score Threshold

**Use Case:** Update all blogs with poor compliance

```bash
# Regenerate blogs with score < 60 (recommended)
node scripts/batch-regenerate-blogs.js --score-threshold 60

# Regenerate blogs with score < 80 (stricter - includes those needing minor fixes)
node scripts/batch-regenerate-blogs.js --score-threshold 80
```

**When to use:**
- After running initial audit
- Want to fix all non-compliant blogs automatically
- Trust the new prompts to improve quality

---

### Example 2: Regenerate Specific Blogs by Slug

**Use Case:** Update specific blog posts you've identified

```bash
node scripts/batch-regenerate-blogs.js --slugs "ai-email-marketing,marketing-automation-guide,seo-best-practices"
```

**When to use:**
- You know exactly which blogs need updating
- Want precise control over what gets regenerated
- Testing regeneration on a few blogs first

---

### Example 3: Regenerate by Blog IDs

**Use Case:** Update blogs using their database IDs

```bash
node scripts/batch-regenerate-blogs.js --ids "uuid-1,uuid-2,uuid-3"
```

**When to use:**
- Working from database query results
- Programmatic selection of blogs
- IDs obtained from other scripts

---

### Example 4: Regenerate ALL Blogs

**Use Case:** Complete content refresh (⚠️ use with caution!)

```bash
# DRY-RUN first to see impact
node scripts/batch-regenerate-blogs.js --all --dry-run

# Then regenerate all
node scripts/batch-regenerate-blogs.js --all
```

**When to use:**
- Major content standards update
- Complete blog refresh needed
- All existing blogs are outdated

**⚠️ Warning:** This will regenerate EVERY published blog. Always dry-run first!

---

### Example 5: Custom Delay Between Regenerations

**Use Case:** Slower regeneration to be extra safe with API limits

```bash
# 5-second delay between each blog (default is 3 seconds)
node scripts/batch-regenerate-blogs.js --score-threshold 60 --delay 5000

# 10-second delay for very large batches
node scripts/batch-regenerate-blogs.js --all --delay 10000
```

**When to use:**
- Regenerating many blogs (10+)
- Want to be conservative with API rate limits
- Experiencing API throttling

---

### Example 6: Skip Backups

**Use Case:** Faster regeneration without backups (not recommended)

```bash
node scripts/batch-regenerate-blogs.js --slugs "test-blog" --skip-backup
```

**When to use:**
- Testing/development environment
- Already have external backups
- Regenerating test content

**⚠️ Warning:** No safety net if regeneration doesn't go as expected!

---

## Options Reference

### Selection Options (Choose One)

| Option | Description | Example |
|--------|-------------|---------|
| `--slugs <list>` | Regenerate specific blogs by slug | `--slugs "blog-1,blog-2"` |
| `--ids <list>` | Regenerate specific blogs by ID | `--ids "uuid-1,uuid-2"` |
| `--score-threshold <N>` | Regenerate blogs with score < N | `--score-threshold 60` |
| `--all` | Regenerate ALL published blogs | `--all` |

### Modifier Options

| Option | Description | Default |
|--------|-------------|---------|
| `--dry-run` | Preview without making changes | (not set) |
| `--delay <ms>` | Delay between regenerations in milliseconds | `3000` |
| `--skip-backup` | Don't create content backups | (not set) |

### Combining Options

```bash
# Score threshold + dry-run + custom delay
node scripts/batch-regenerate-blogs.js --score-threshold 70 --dry-run --delay 5000

# Specific slugs + skip backup (development)
node scripts/batch-regenerate-blogs.js --slugs "test-1,test-2" --skip-backup

# All blogs + slower delay (safer)
node scripts/batch-regenerate-blogs.js --all --delay 10000
```

---

## Workflow

### Recommended Workflow for Existing Blogs

#### Step 1: Initial Assessment

Run the audit to see current state:

```bash
node scripts/audit-blog-content-standards.js > temp/audit-report.txt
```

Review the report and categorize blogs:
- **High priority** (score < 60): Needs regeneration
- **Medium priority** (score 60-79): Manual editing or regeneration
- **Low priority** (score ≥ 80): Minor improvements

---

#### Step 2: Test Regeneration

Pick 1-2 low-stakes blogs to test:

```bash
# Test with dry-run first
node scripts/batch-regenerate-blogs.js --slugs "test-blog-1" --dry-run

# Then regenerate for real
node scripts/batch-regenerate-blogs.js --slugs "test-blog-1"
```

Review the regenerated content:
1. Check word count increased to ≥1,200
2. Verify FAQ section has 5 questions
3. Confirm no em dashes
4. Check natural headings (no "Introduction")
5. Verify brand voice is preserved

---

#### Step 3: Batch Regenerate High Priority

Regenerate all blogs with score < 60:

```bash
# Dry-run to see what will happen
node scripts/batch-regenerate-blogs.js --score-threshold 60 --dry-run

# Review the list, then proceed
node scripts/batch-regenerate-blogs.js --score-threshold 60
```

**Estimated Time:**
- 3-5 blogs: ~2-5 minutes
- 10 blogs: ~7-10 minutes
- 20 blogs: ~15-20 minutes
- 50+ blogs: ~45-60 minutes

---

#### Step 4: Handle Medium Priority

For blogs with score 60-79, you have options:

**Option A: Regenerate**
```bash
node scripts/batch-regenerate-blogs.js --score-threshold 80
```

**Option B: Manual Editing**
1. Open blog in admin panel
2. Fix specific issues from audit report
3. Save and re-publish

---

#### Step 5: Verify Results

Re-run audit to confirm improvements:

```bash
node scripts/audit-blog-content-standards.js
```

Look for:
- ✅ Increased average score
- ✅ More blogs with score ≥ 80
- ✅ Reduced number of critical issues

---

#### Step 6: Publish Updated Blogs

1. Review regenerated blogs in admin panel
2. Make any minor tweaks if needed
3. Update `published_at` dates if desired
4. Monitor blog performance over next 2-4 weeks

---

## Safety Features

### 1. Automatic Backups

Before regenerating each blog, the script creates a backup:

**Backup Includes:**
- Original content
- Original title
- Original excerpt
- Original word count
- Timestamp
- Backup reason

**Restore from Backup:**

Query the backups table to see what was backed up:

```sql
SELECT
  p.title,
  p.slug,
  b.original_word_count,
  b.backed_up_at
FROM blog_content_backups b
JOIN posts p ON b.post_id = p.id
ORDER BY b.backed_up_at DESC;
```

Restore manually if needed:

```sql
-- Get the backup
SELECT original_content FROM blog_content_backups
WHERE post_id = 'your-post-uuid'
ORDER BY backed_up_at DESC LIMIT 1;

-- Restore to posts table
UPDATE posts
SET content = (
  SELECT original_content FROM blog_content_backups
  WHERE post_id = 'your-post-uuid'
  ORDER BY backed_up_at DESC LIMIT 1
)
WHERE id = 'your-post-uuid';
```

---

### 2. Dry-Run Mode

Always preview changes first:

```bash
node scripts/batch-regenerate-blogs.js --all --dry-run
```

**Dry-run shows:**
- Which blogs will be regenerated
- Current scores and word counts
- No actual changes made

---

### 3. Confirmation Prompt

Script asks for explicit confirmation before regenerating:

```
Proceed with regenerating 5 blog(s)? (y/n):
```

- Type `n` or `no` to cancel
- Type `y` or `yes` to proceed

---

### 4. Rate Limiting

Built-in delays between regenerations:
- Default: 3 seconds
- Customizable with `--delay` option
- Prevents API throttling
- Allows monitoring progress

---

### 5. Error Handling

If regeneration fails for a blog:
- ✅ Script continues with remaining blogs
- ✅ Error is logged in summary
- ✅ Failed blog is not updated (original content preserved)
- ✅ Backup is still created (if enabled)

---

## Troubleshooting

### Issue: "Missing required environment variables"

**Solution:**
```bash
# Check your .env file has these variables
VITE_SUPABASE_URL=...
VITE_SUPABASE_SERVICE_ROLE_KEY=...
VITE_ANTHROPIC_API_KEY=...
```

---

### Issue: "Failed to fetch posts: ..."

**Possible causes:**
- Supabase credentials invalid
- Posts table doesn't exist
- Network connectivity issues

**Solution:**
1. Verify Supabase URL and service role key
2. Test connection: `node scripts/test-supabase-connection.js`
3. Check Supabase dashboard for table existence

---

### Issue: "Table blog_content_backups does not exist"

**Solution:**
Apply the migration:
```bash
# Via Supabase SQL Editor or migration script
# See Prerequisites section above
```

Or run with `--skip-backup` to bypass backups (not recommended).

---

### Issue: API Rate Limiting (429 errors)

**Solution:**
Increase delay between regenerations:
```bash
# Use 5-10 second delay
node scripts/batch-regenerate-blogs.js --score-threshold 60 --delay 5000
```

Or regenerate in smaller batches:
```bash
# First 5 blogs
node scripts/batch-regenerate-blogs.js --slugs "blog-1,blog-2,blog-3,blog-4,blog-5"

# Wait a few minutes, then next 5
node scripts/batch-regenerate-blogs.js --slugs "blog-6,blog-7,blog-8,blog-9,blog-10"
```

---

### Issue: Generated content doesn't meet standards

**Possible causes:**
- Prompt not applied correctly
- Anthropic API issue
- Invalid keyword data

**Solution:**
1. Check one regenerated blog manually
2. Verify prompts in `scripts/batch-regenerate-blogs.js` match `src/lib/anthropic-blog-writer.js`
3. Re-run audit to see actual scores
4. If scores still low, try regenerating individual blog to debug

---

### Issue: Script runs too slowly

**Optimization:**
1. Reduce delay: `--delay 2000` (2 seconds minimum recommended)
2. Run in batches instead of all at once
3. Use faster internet connection
4. Skip backups for testing: `--skip-backup` (not recommended for production)

---

## Best Practices

### 1. Always Dry-Run First

```bash
# See what will happen before doing it
node scripts/batch-regenerate-blogs.js --score-threshold 60 --dry-run
```

### 2. Start Small

Test with 1-2 blogs before doing large batches:

```bash
# Test regeneration
node scripts/batch-regenerate-blogs.js --slugs "test-blog"

# Review result in admin panel
# Then proceed with larger batch
```

### 3. Monitor Progress

Watch the console output during regeneration:
- ✅ Successful regenerations
- ❌ Failed regenerations
- 📊 Word count changes
- ⏱️ Progress tracking

### 4. Keep Backups

Don't use `--skip-backup` unless you have other backups:

```bash
# This is safe (creates backups)
node scripts/batch-regenerate-blogs.js --score-threshold 60

# This is risky (no backups)
node scripts/batch-regenerate-blogs.js --score-threshold 60 --skip-backup
```

### 5. Verify After Regeneration

Always re-run the audit:

```bash
node scripts/audit-blog-content-standards.js
```

Check that:
- Average score increased
- Critical issues resolved
- Blogs meet ≥1,200 word minimum
- FAQ sections added

### 6. Review High-Value Blogs Manually

For your most important blogs:
1. Regenerate automatically
2. Review the output manually
3. Make custom tweaks if needed
4. Ensure brand voice is perfect

---

## Summary

### Quick Reference

**Most Common Use Case:**
```bash
# 1. Run audit
node scripts/audit-blog-content-standards.js

# 2. Dry-run regeneration for low-scoring blogs
node scripts/batch-regenerate-blogs.js --score-threshold 60 --dry-run

# 3. Regenerate for real
node scripts/batch-regenerate-blogs.js --score-threshold 60

# 4. Re-audit to verify
node scripts/audit-blog-content-standards.js
```

**Safe Testing:**
```bash
# Test on one blog first
node scripts/batch-regenerate-blogs.js --slugs "test-blog-slug"
```

**Large Batch:**
```bash
# Use longer delay for safety
node scripts/batch-regenerate-blogs.js --all --delay 5000
```

---

## Related Documentation

- **Content Standards:** `docs/BLOG_CONTENT_STANDARDS.md`
- **Audit Script:** `scripts/audit-blog-content-standards.js`
- **Integration Summary:** `BLOG_STANDARDS_INTEGRATION_COMPLETE.md`
- **AutoBlog System:** `docs/AUTOBLOG_SYSTEM.md`

---

**Happy Batch Regenerating!** 🚀

For questions or issues, refer to the troubleshooting section or review the script source code at `scripts/batch-regenerate-blogs.js`.
