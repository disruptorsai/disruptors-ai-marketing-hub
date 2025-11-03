# AI Change Request Analyzer - Setup Guide

Quick setup instructions for the AI-powered change request analyzer.

## Prerequisites

- ✅ OpenAI API key with GPT-4 Vision access
- ✅ Supabase project with admin access
- ✅ Netlify deployment configured

## Step 1: Apply Database Migration

### Option A: Supabase SQL Editor (Recommended)

1. Open your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Copy the migration SQL from: `supabase/migrations/20250131_change_requests_ai_analysis.sql`
4. Paste into SQL Editor
5. Click **Run**
6. Verify success (should see "Success. No rows returned")

### Option B: Migration Script

```bash
# From project root
VITE_SUPABASE_URL=your_url \
VITE_SUPABASE_SERVICE_ROLE_KEY=your_key \
node scripts/apply-change-requests-ai-migration.js
```

## Step 2: Verify Environment Variables

Ensure these are set in your `.env` file:

```bash
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_OPENAI_API_KEY=sk-...your-openai-key

# Optional (for future enhancements)
VITE_ANTHROPIC_API_KEY=your_anthropic_key
```

## Step 3: Install Dependencies

```bash
npm install pdf-parse
```

This is already done if you see `pdf-parse` in `package.json`.

## Step 4: Deploy Netlify Function

The function is already created at:
```
netlify/functions/change-request-analyze.js
```

Deploy to Netlify:

```bash
# If using Netlify CLI
netlify deploy --prod

# Or push to your git repository
git add .
git commit -m "feat: Add AI Change Request Analyzer"
git push
```

## Step 5: Test the Feature

1. Navigate to **Admin Panel** (`/admin/secret`)
2. Click **Change Requests** in sidebar
3. Click **"AI Analyzer"** button (purple with sparkles)
4. Enter a team member name
5. Choose **"Paste Text"** tab
6. Paste sample text:
   ```
   - Fix homepage button alignment
   - Update contact form validation
   - Add new testimonial section
   ```
7. Click **"Analyze & Create Requests"**
8. Wait 5-10 seconds
9. Verify 3 change requests were created

## Step 6: Verify Database

Check that data was created:

```sql
-- Check AI analyses table
SELECT * FROM change_request_ai_analyses
ORDER BY created_at DESC
LIMIT 5;

-- Check change requests with AI metadata
SELECT
  id,
  requester_name,
  change_description,
  source_type,
  batch_id,
  task_items
FROM change_requests
WHERE source_type IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

## Troubleshooting

### Issue: "Migration failed"

**Solution**: Apply manually via Supabase SQL Editor (Step 1, Option A)

### Issue: "OpenAI API error"

**Causes**:
- Invalid API key
- Insufficient credits
- Rate limit exceeded

**Solution**:
1. Verify API key in `.env`
2. Check OpenAI dashboard for credits
3. Wait a minute and retry

### Issue: "PDF parsing failed"

**Cause**: Image-based PDF (scanned document)

**Solution**: Upload as image instead using the "Upload Image" tab

### Issue: "No change requests found"

**Cause**: Input text too vague

**Solution**:
- Use bullet points
- Be more specific
- Include clear action items

### Issue: Function not found

**Cause**: Netlify function not deployed

**Solution**:
```bash
# Redeploy
netlify deploy --prod

# Or check function exists
netlify functions:list
```

## Usage Tips

### Best Input Formats

✅ **Good**:
```
- Fix broken contact form validation
- Update hero section with new tagline
- Add testimonial from Acme Corp
- Optimize mobile performance
```

❌ **Poor**:
```
Make the website better and fix some stuff
```

### Priority Keywords

AI recognizes these urgency indicators:

- **Urgent**: URGENT, ASAP, critical, emergency, immediately
- **High**: important, priority, needs attention, soon
- **Low**: minor, eventually, nice-to-have, optional

### Category Keywords

AI uses these to categorize:

- **Bug Fix**: fix, broken, error, not working, issue
- **Feature**: add, new, create, implement
- **Content**: update, change, modify (text/copy)
- **Design**: redesign, styling, layout, UI
- **Performance**: optimize, slow, speed, loading
- **Security**: secure, vulnerability, auth, permissions

## Next Steps

- 📚 Read full documentation: `docs/AI_CHANGE_REQUEST_ANALYZER.md`
- 🧪 Test with image uploads
- 📄 Test with PDF documents
- 📊 Monitor AI analysis accuracy
- ⚙️ Adjust categories/priorities as needed

## Support

Need help? Check:
- Browser console for errors
- Netlify function logs
- Supabase logs
- OpenAI API dashboard

Or contact the development team.
