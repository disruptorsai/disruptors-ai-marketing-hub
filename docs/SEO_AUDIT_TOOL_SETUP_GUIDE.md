# SEO Audit Tool - Comprehensive Setup Guide

## Overview

The SEO Audit Tool is a dual-purpose system that provides:
1. **Internal Admin Module** - For prospecting and analyzing client websites internally
2. **Public Lead Generation Tool** - Premium, visually impressive tool for capturing leads

Both versions use the same backend infrastructure but serve different purposes and audiences.

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     SEO Audit Tool System                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐              ┌──────────────────┐     │
│  │  Admin Module    │              │  Public Page     │     │
│  │  /admin/secret/  │              │  /tools-seo-     │     │
│  │  seo-audit-tool  │              │  audit           │     │
│  └────────┬─────────┘              └────────┬─────────┘     │
│           │                                  │               │
│           └──────────────┬───────────────────┘               │
│                          │                                   │
│           ┌──────────────▼──────────────┐                   │
│           │   Netlify Functions          │                   │
│           │  • seo-audit-analyzer.js     │                   │
│           │  • seo-audit-stream.js       │                   │
│           │  • seo-audit-get.js          │                   │
│           └──────────────┬──────────────┘                   │
│                          │                                   │
│           ┌──────────────▼──────────────┐                   │
│           │   Shared Utilities           │                   │
│           │  • scraper.js (Firecrawl)    │                   │
│           │  • dataforseo.js             │                   │
│           │  • analyzer.js (Claude AI)   │                   │
│           │  • report-generator.js       │                   │
│           └──────────────┬──────────────┘                   │
│                          │                                   │
│           ┌──────────────▼──────────────┐                   │
│           │   Supabase Database          │                   │
│           │  • seo_audits                │                   │
│           │  • seo_audit_sections        │                   │
│           │  • seo_audit_recommendations │                   │
│           │  • seo_leads                 │                   │
│           └──────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

Before setting up the SEO Audit Tool, ensure you have:

- ✅ Supabase project with admin access
- ✅ Netlify account with function deployment capabilities
- ✅ API keys for:
  - Firecrawl (website scraping)
  - DataForSEO (keyword analysis)
  - Anthropic Claude (AI content analysis)
- ✅ Admin Nexus already integrated (for internal admin access)

## Step 1: Database Setup

### Apply Migration

1. **Navigate to Supabase SQL Editor**:
   - Go to your Supabase project dashboard
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

2. **Run the migration file**:
   - Copy contents from: `supabase/migrations/20251016_seo_audit_tool.sql`
   - Paste into SQL Editor
   - Click "Run" or press `Ctrl+Enter`

3. **Verify tables were created**:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name LIKE 'seo_%';
   ```

   Expected output:
   - `seo_audits`
   - `seo_audit_sections`
   - `seo_audit_recommendations`
   - `seo_leads`

### Verify Row Level Security (RLS)

Check that RLS policies are active:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'seo_%';
```

All tables should show `rowsecurity = true`.

### Test Database Access

```sql
-- Test insert (should succeed)
INSERT INTO seo_audits (domain, status, source)
VALUES ('example.com', 'pending', 'internal')
RETURNING id;

-- Clean up test record
DELETE FROM seo_audits WHERE domain = 'example.com';
```

## Step 2: Environment Variables

### Required API Keys

Add these to your `.env` file and Netlify environment:

```bash
# Supabase (required for database access)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Firecrawl API (required for website scraping)
VITE_FIRECRAWL_API_KEY=your_firecrawl_api_key

# DataForSEO (required for keyword analysis)
DATAFORSEO_LOGIN=your_dataforseo_email@example.com
DATAFORSEO_PASSWORD=your_dataforseo_password

# Anthropic Claude (required for AI content analysis)
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Getting API Keys

**Firecrawl API Key**:
- Sign up at https://www.firecrawl.dev/
- Navigate to API Keys section
- Create new API key
- Copy and add to `.env`

**DataForSEO Credentials**:
- Sign up at https://dataforseo.com/
- Go to Dashboard → API Access
- Use your login email and API password (NOT your account password)
- Important: DataForSEO charges per API call, monitor usage

**Anthropic API Key**:
- Sign up at https://console.anthropic.com/
- Navigate to API Keys
- Create new key
- Copy and add to `.env`

### Netlify Environment Setup

1. **Go to Netlify Dashboard**:
   - Select your site
   - Navigate to "Site settings" → "Environment variables"

2. **Add each variable**:
   - Click "Add a variable"
   - Set scope to "All scopes" or specifically "Functions"
   - Add all variables from your `.env` file
   - Save changes

3. **Redeploy**:
   ```bash
   npm run deploy:netlify
   ```

## Step 3: Deploy Netlify Functions

### Verify Function Files

Ensure these files exist:

```
netlify/functions/
├── seo-audit-analyzer.js       # Main orchestrator (background processing)
├── seo-audit-stream.js         # Real-time streaming for public tool
├── seo-audit-get.js            # Get audit results by ID
└── seo-audit/
    ├── scraper.js              # Firecrawl integration
    ├── dataforseo.js           # Keyword analysis
    ├── analyzer.js             # Claude AI analysis
    └── report-generator.js     # Markdown report generation
```

### Test Functions Locally

Before deploying, test functions locally:

```bash
# Start Netlify dev server
npm run dev:netlify

# In another terminal, test the analyzer function
curl -X POST http://localhost:8888/.netlify/functions/seo-audit-analyzer \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "email": "test@example.com",
    "name": "Test User",
    "source": "internal"
  }'

# Expected response:
# {"auditId":"uuid-here","status":"processing"}
```

### Test Streaming Function

```bash
# Test SSE streaming
curl -N http://localhost:8888/.netlify/functions/seo-audit-stream?domain=example.com&email=test@example.com
```

You should see real-time progress updates streaming in.

### Deploy to Production

```bash
# Build and deploy
npm run build
npm run deploy:netlify

# Or use Netlify CLI
npx netlify deploy --prod
```

### Verify Deployment

After deployment, check Netlify function logs:

1. Go to Netlify Dashboard → Functions
2. Verify all 3 functions are listed:
   - `seo-audit-analyzer`
   - `seo-audit-stream`
   - `seo-audit-get`
3. Click each function to verify no errors

## Step 4: Access & Testing

### Admin Module Access

**URL**: `https://yourdomain.com/admin/secret/seo-audit-tool`

**Prerequisites**:
- Must be logged into Admin Nexus
- Session-based authentication required

**Features**:
- **Audits Tab**: View all audits (internal + public)
- **Leads Tab**: Manage leads captured from public tool
- **Analytics Tab**: 30-day metrics, conversion rates

**Testing Internal Audit**:

1. Navigate to `/admin/secret/seo-audit-tool`
2. Click "New Audit" button
3. Enter domain: `example.com`
4. Click "Run Audit"
5. Wait for processing (30-60 seconds)
6. View results in table

Expected flow:
- Status shows "Processing" with spinner
- After completion, status shows "Completed" with score
- Click "View" to see full report
- Click "Download Report" to get markdown file

### Public Tool Access

**URL**: `https://yourdomain.com/tools-seo-audit`

**Features**:
- Premium, high-end design with animations
- Typing animation showing analysis progress
- Terminal-style real-time updates
- Smooth reveal animations for results
- Lead capture form integration

**Testing Public Audit**:

1. Navigate to `/tools-seo-audit`
2. Fill out form:
   - Website URL: `https://example.com`
   - Business Name: `Test Business`
   - Email: `test@example.com`
3. Click "Analyze My Website"
4. Watch animated analysis phase (60-90 seconds):
   - Typing messages appear character by character
   - Progress bar advances
   - Terminal shows real-time steps
5. View results:
   - Overall score displays with animation
   - Section scores reveal one by one
   - Recommendations appear with stagger effect
6. Check email for full report link

Expected behavior:
- Analysis takes 60-90 seconds
- Progress messages type out in real-time
- Results reveal smoothly with animations
- Lead is captured in `seo_leads` table
- Admin can view lead in Admin Nexus

### Verify Lead Capture

After public tool submission:

1. Go to `/admin/secret/seo-audit-tool`
2. Click "Leads" tab
3. Verify new lead appears with:
   - Business name
   - Email
   - Domain audited
   - SEO score
   - Interest level (auto-assigned)
   - Timestamp

## Step 5: Monitoring & Analytics

### Database Monitoring

**Check audit processing status**:

```sql
-- View recent audits
SELECT
  id,
  domain,
  status,
  overall_score,
  source,
  created_at,
  completed_at
FROM seo_audits
ORDER BY created_at DESC
LIMIT 10;

-- Check for failed audits
SELECT * FROM seo_audits
WHERE status = 'failed'
ORDER BY created_at DESC;
```

**Monitor lead quality**:

```sql
-- View high-interest leads
SELECT
  business_name,
  email,
  domain,
  seo_score,
  interest_level,
  created_at
FROM seo_leads
WHERE interest_level IN ('high', 'very_high')
ORDER BY created_at DESC;

-- Lead conversion funnel
SELECT
  interest_level,
  COUNT(*) as total,
  COUNT(CASE WHEN contacted_at IS NOT NULL THEN 1 END) as contacted,
  ROUND(
    COUNT(CASE WHEN contacted_at IS NOT NULL THEN 1 END)::numeric /
    COUNT(*)::numeric * 100,
    2
  ) as contact_rate
FROM seo_leads
GROUP BY interest_level
ORDER BY
  CASE interest_level
    WHEN 'very_high' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END;
```

### Netlify Function Logs

**Monitor function execution**:

1. Go to Netlify Dashboard → Functions
2. Click on `seo-audit-analyzer`
3. View logs for:
   - Execution time
   - Memory usage
   - Error rates
   - API call counts

**Set up alerts** (optional):
- Configure Netlify notifications for function errors
- Set up email alerts for failed audits

### Admin Analytics Dashboard

The admin module includes built-in analytics at `/admin/secret/seo-audit-tool` (Analytics tab):

**Metrics Tracked**:
- Total audits (30-day)
- Completed audits
- Total leads captured
- Conversion rate (leads/public audits)
- Average SEO score
- Interest level distribution
- Source breakdown (internal vs public)

**Charts Available**:
- Daily audit volume (last 30 days)
- Lead capture rate over time
- SEO score distribution
- Interest level pie chart

## Step 6: API Cost Management

### DataForSEO Cost Monitoring

Each audit makes 3 DataForSEO API calls:
1. Domain metrics ($0.002-0.005)
2. Ranked keywords ($0.002-0.005)
3. Competitor analysis ($0.002-0.005)

**Total cost per audit**: ~$0.01-0.015

**Monitor usage**:
- Check DataForSEO dashboard: https://app.dataforseo.com/
- View API call history
- Set up spending limits
- Configure budget alerts

**Cost optimization**:
```javascript
// In dataforseo.js, adjust limits to reduce costs
const keywords = await dataforSEORequest('/v3/dataforseo_labs/google/ranked_keywords/live', [{
  target: cleanDomain,
  limit: 50  // Reduce from 100 to save costs
}]);
```

### Firecrawl Cost Monitoring

Each audit makes 1-2 Firecrawl API calls:
- Homepage scrape (~1 credit)
- Additional pages (if needed)

**Monitor usage**:
- Check Firecrawl dashboard: https://www.firecrawl.dev/dashboard
- View credit usage
- Set up alerts

### Anthropic API Cost

Each audit uses Claude Sonnet 4.5:
- Input tokens: ~3,000-5,000
- Output tokens: ~2,000-3,000
- Cost per audit: ~$0.03-0.05

**Monitor usage**:
- Check Anthropic Console: https://console.anthropic.com/
- View API usage dashboard
- Set spending limits

### Total Cost Per Audit

**Estimated cost breakdown**:
- DataForSEO: $0.01-0.015
- Firecrawl: $0.001-0.003
- Anthropic: $0.03-0.05
- **Total**: ~$0.04-0.07 per audit

For reference:
- 100 audits/month = ~$5-7
- 500 audits/month = ~$25-35
- 1,000 audits/month = ~$50-70

## Step 7: Customization & Configuration

### Adjust Analysis Depth

**Modify scraper.js** to scrape more pages:

```javascript
// netlify/functions/seo-audit/scraper.js
const homepage = await firecrawl.scrapeUrl(url, {
  formats: ['markdown', 'html'],
  onlyMainContent: false,
  waitFor: 2000,
  includeTags: ['meta', 'title', 'h1', 'h2', 'h3'],
  removeTags: ['script', 'style', 'noscript']
});

// Add additional page scraping
const aboutPage = await firecrawl.scrapeUrl(`${url}/about`, { ... });
const servicesPage = await firecrawl.scrapeUrl(`${url}/services`, { ... });
```

### Customize Report Format

**Modify report-generator.js** to adjust report structure:

```javascript
// netlify/functions/seo-audit/report-generator.js
export function generateReport(auditData) {
  // Customize sections
  const report = `# SEO Analysis Report

## Your Custom Section
${generateCustomSection(auditData)}

## Standard Sections
${generateExecutiveSummary(...)}
...
`;
  return report;
}
```

### Adjust Scoring Algorithm

**Modify analyzer.js** to change scoring weights:

```javascript
// netlify/functions/seo-audit/analyzer.js
function calculateOverallScore(sections) {
  const weights = {
    metaTags: 0.20,           // 20% weight
    contentDepth: 0.15,       // 15% weight
    keywordOptimization: 0.15,
    technicalSEO: 0.20,       // Increase technical importance
    eeatSignals: 0.15,
    userExperience: 0.10,
    competitivePosition: 0.05
  };

  // Custom calculation logic
  const weightedScore = Object.entries(sections).reduce((total, [key, section]) => {
    return total + (section.score * (weights[key] || 0));
  }, 0);

  return Math.round(weightedScore);
}
```

### Customize Lead Qualification

**Modify seo-audit-analyzer.js** to adjust interest level logic:

```javascript
// netlify/functions/seo-audit-analyzer.js
function determineInterestLevel(overallScore) {
  if (overallScore < 30) return 'very_high';  // Needs major help
  if (overallScore < 50) return 'high';       // Needs help
  if (overallScore < 70) return 'medium';     // Some improvements
  return 'low';                               // Doing well
}
```

## Step 8: Troubleshooting

### Common Issues

**Issue 1: "Audit stuck in 'processing' status"**

Diagnosis:
```sql
SELECT * FROM seo_audits
WHERE status = 'processing'
AND created_at < NOW() - INTERVAL '10 minutes';
```

Fix:
- Check Netlify function logs for errors
- Verify API keys are correct
- Check API rate limits
- Manually update status if needed:
  ```sql
  UPDATE seo_audits
  SET status = 'failed', error_message = 'Timeout'
  WHERE id = 'stuck-audit-id';
  ```

**Issue 2: "No keywords found for domain"**

Possible causes:
- Domain is too new (no ranking history)
- DataForSEO hasn't indexed domain yet
- Domain has very low authority

Solution:
- Check DataForSEO manually: https://app.dataforseo.com/
- Add fallback message in analyzer for low-data domains
- Suggest user try again in 30 days

**Issue 3: "Streaming not working on public tool"**

Diagnosis:
- Open browser DevTools → Network tab
- Look for `seo-audit-stream` request
- Check if EventSource connection opens

Fix:
- Verify CORS headers in function
- Check Netlify function timeout (max 26 seconds for background functions)
- Test locally first: `npm run dev:netlify`

**Issue 4: "Admin module shows empty table"**

Diagnosis:
```sql
SELECT COUNT(*) FROM seo_audits;
```

Fix:
- If 0 audits, run test audit from admin
- Check RLS policies allow admin access
- Verify service role key is set in Netlify

**Issue 5: "Firecrawl API returns 403"**

Fix:
- Verify API key is correct
- Check Firecrawl account has credits
- Test API key manually:
  ```bash
  curl -X POST https://api.firecrawl.dev/v0/scrape \
    -H "Authorization: Bearer YOUR_KEY" \
    -H "Content-Type: application/json" \
    -d '{"url": "https://example.com"}'
  ```

### Debug Mode

Enable verbose logging in Netlify functions:

```javascript
// Add to top of seo-audit-analyzer.js
const DEBUG = process.env.DEBUG_SEO_AUDIT === 'true';

function log(...args) {
  if (DEBUG) console.log('[SEO AUDIT]', ...args);
}

// Use throughout code
log('Starting scrape for domain:', domain);
log('DataForSEO response:', JSON.stringify(keywordData, null, 2));
```

Set in Netlify environment:
```
DEBUG_SEO_AUDIT=true
```

## Step 9: Security Considerations

### API Key Protection

- ✅ Never expose service role key to client
- ✅ Use environment variables for all sensitive keys
- ✅ Rotate API keys regularly (quarterly)
- ✅ Monitor API usage for anomalies

### Rate Limiting

Consider adding rate limiting to public endpoint:

```javascript
// netlify/functions/seo-audit-analyzer.js
import rateLimit from 'lambda-rate-limiter';

const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500
});

export async function handler(event, context) {
  const ip = event.headers['x-forwarded-for'];

  try {
    await limiter.check(10, ip); // 10 requests per hour per IP
  } catch (error) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: 'Rate limit exceeded' })
    };
  }

  // Continue with audit...
}
```

### Email Verification

The `seo-audit-get.js` function requires email verification:

```javascript
// Only allows access if requester_email matches
if (email) {
  query = query.eq('requester_email', email);
}
```

This prevents unauthorized access to audit results.

### Row Level Security (RLS)

Verify RLS policies are working:

```sql
-- Test public access (should only see public audits)
SET ROLE anon;
SELECT * FROM seo_audits;  -- Should only return public source audits

-- Test admin access (should see all)
SET ROLE authenticated;
SELECT * FROM seo_audits;  -- Should return all audits

-- Reset
RESET ROLE;
```

## Step 10: Performance Optimization

### Caching Strategy

Add caching to reduce API costs:

```javascript
// netlify/functions/seo-audit/dataforseo.js
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 86400 }); // 24 hour cache

export async function getKeywordData(domain, onProgress = null) {
  const cacheKey = `keywords_${domain}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    console.log('Using cached keyword data for', domain);
    return cached;
  }

  const data = await fetchKeywordData(domain, onProgress);
  cache.set(cacheKey, data);
  return data;
}
```

### Database Indexing

Verify indexes are created:

```sql
-- Check existing indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename LIKE 'seo_%';

-- Add additional indexes if needed
CREATE INDEX IF NOT EXISTS idx_seo_audits_created_at
ON seo_audits(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_seo_leads_interest
ON seo_leads(interest_level, created_at DESC);
```

### Function Optimization

**Reduce cold start time**:
- Keep function code minimal
- Use external modules judiciously
- Consider pre-warming for critical functions

**Bundle size optimization** in `netlify.toml`:

```toml
[functions]
  node_bundler = "esbuild"
  external_node_modules = [
    "@anthropic-ai/sdk",
    "@supabase/supabase-js",
    "firecrawl-node"
  ]
```

## Step 11: Maintenance Schedule

### Daily Tasks
- Monitor function logs for errors
- Check audit completion rate
- Review new leads in admin

### Weekly Tasks
- Review analytics dashboard
- Check API usage and costs
- Follow up with high-interest leads
- Clean up failed audits

### Monthly Tasks
- Review and optimize scoring algorithm
- Update report templates based on feedback
- Analyze conversion rates
- Export lead data for CRM
- Rotate API keys (if needed)

### Quarterly Tasks
- Review total API costs
- Optimize DataForSEO queries
- Update SEO analysis criteria
- Conduct security audit
- Review RLS policies

## Step 12: Backup & Recovery

### Database Backups

Supabase automatically backs up data, but you can create manual backups:

```bash
# Export all SEO audit data
npx supabase db dump -f backup_seo_audits.sql \
  --table seo_audits \
  --table seo_audit_sections \
  --table seo_audit_recommendations \
  --table seo_leads
```

### Disaster Recovery Plan

If data is lost:

1. **Restore from Supabase backup**:
   - Go to Supabase Dashboard → Database → Backups
   - Select backup point
   - Restore

2. **Rerun failed audits**:
   ```sql
   UPDATE seo_audits
   SET status = 'pending',
       completed_at = NULL
   WHERE status = 'failed'
   AND created_at > NOW() - INTERVAL '7 days';
   ```

3. **Notify affected leads**:
   - Export emails from `seo_leads`
   - Send notification about reprocessing

## Support & Resources

### Internal Documentation
- Database schema: `supabase/migrations/20251016_seo_audit_tool.sql`
- Function code: `netlify/functions/seo-audit-*.js`
- Utility modules: `netlify/functions/seo-audit/*.js`
- Admin module: `src/admin/modules/SEOAuditTool.jsx`
- Public page: `src/pages/tools-seo-audit.jsx`

### External Resources
- Firecrawl Docs: https://docs.firecrawl.dev/
- DataForSEO API Docs: https://docs.dataforseo.com/
- Anthropic API Docs: https://docs.anthropic.com/
- Supabase Docs: https://supabase.com/docs

### Contact Points
- For database issues: Check Supabase support
- For function errors: Review Netlify function logs
- For API issues: Contact respective provider support
- For lead issues: Check admin module logs

---

## Quick Start Checklist

Use this checklist for rapid deployment:

- [ ] Run database migration in Supabase SQL Editor
- [ ] Verify all 4 tables created with RLS enabled
- [ ] Add all environment variables to `.env`
- [ ] Add environment variables to Netlify
- [ ] Test functions locally with `npm run dev:netlify`
- [ ] Deploy to production with `npm run deploy:netlify`
- [ ] Test admin module at `/admin/secret/seo-audit-tool`
- [ ] Test public tool at `/tools-seo-audit`
- [ ] Verify lead capture in admin module
- [ ] Set up monitoring and alerts
- [ ] Configure backup schedule
- [ ] Document any customizations made

**Estimated setup time**: 30-45 minutes

---

## Conclusion

The SEO Audit Tool is now fully operational with:
- ✅ Comprehensive database schema with RLS
- ✅ Three Netlify functions for orchestration, streaming, and retrieval
- ✅ Shared utility modules for scraping, keyword analysis, AI analysis, and reporting
- ✅ Internal admin module for managing audits and leads
- ✅ Premium public tool with animated progress and lead capture
- ✅ Full analytics and monitoring capabilities

For questions or issues, refer to the troubleshooting section or check the internal documentation links provided above.

**System Status**: Production Ready ✅
**Last Updated**: October 16, 2025
