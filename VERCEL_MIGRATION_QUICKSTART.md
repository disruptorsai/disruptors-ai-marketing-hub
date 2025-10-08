# Vercel Migration Quick Start Guide

**Status**: ✅ Ready for Implementation
**Estimated Time**: 12-16 hours
**Risk Level**: LOW

---

## Prerequisites Checklist

- [x] `vercel.json` created in repository root
- [ ] Vercel account with access to "dm4" project
- [ ] All 48 environment variables documented
- [ ] Netlify functions analyzed (10 functions)
- [ ] GitHub repository connected: `TechIntegrationLabs/disruptors-ai-marketing-hub`

---

## 3 Critical Changes Required

### 1. Job Storage: In-Memory → Vercel KV ⚠️ **CRITICAL**

**Problem**: Current `netlify/functions/shared/job-storage.js` uses in-memory Map that resets on cold starts.

**Solution**: Migrate to Vercel KV (Redis)

```bash
# 1. Create Vercel KV database via dashboard
# 2. Install package
npm install @vercel/kv

# 3. Replace job-storage.js with Vercel KV implementation
```

See: `docs/VERCEL_MIGRATION_REPORT.md` - Appendix B for complete code

**Impact**: Growth Audit jobs, SSE streaming, all background jobs

---

### 2. Function URL Updates ⚠️ **CRITICAL**

**Current**: `/.netlify/functions/[function-name]`
**New**: `/api/[category]/[function-name]`

**Files to Update**:
- `src/pages/demos/GrowthAudit.jsx`
- `src/pages/demos/GrowthAuditResults.jsx`
- `src/admin/modules/BusinessBrainBuilder.jsx`
- `src/admin/modules/ContentManagement.jsx`
- All admin modules using AI generation

**Recommended**: Create centralized API client:

```javascript
// src/lib/api-client.js
const API_BASE = '/api';

export const apiClient = {
  growthAudit: {
    ingest: (websiteUrl) =>
      fetch(`${API_BASE}/growth-audit/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl })
      }),
    stream: (jobId) =>
      new EventSource(`${API_BASE}/growth-audit/stream?jobId=${jobId}`)
  },
  // ... other endpoints
};
```

---

### 3. SSE Streaming: Use Edge Functions ⚠️ **IMPORTANT**

**Function**: `growth-audit-stream.js`

**Solution**: Convert to Vercel Edge Function (no timeout limit)

```javascript
// api/growth-audit/stream.js
export const config = {
  runtime: 'edge', // ✅ Unlimited streaming
};

export default async function handler(req) {
  // See full implementation in migration report
}
```

**Alternative**: Use polling instead of SSE (simpler but less real-time)

---

## Quick Migration Steps

### Step 1: Vercel Setup (30 minutes)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Link to existing project
vercel link
# Select: TechIntegrationLabs/disruptors-ai-marketing-hub
# Project: dm4

# 4. Create Vercel KV database
# Dashboard: Storage → Create Database → KV → Link to dm4

# 5. Set environment variables (48 variables)
# Dashboard: Project Settings → Environment Variables
# Or: vercel env add VARIABLE_NAME production
```

---

### Step 2: Function Migration (4-6 hours)

```bash
# 1. Create API directory structure
mkdir -p api/growth-audit api/brain api/admin api/content api/utilities api/shared

# 2. Copy and adapt functions
# Example: Growth Audit Ingest
cp netlify/functions/growth-audit-ingest.js api/growth-audit/ingest.js

# 3. Transform to Vercel pattern:
#    - Replace: export async function handler(event)
#    - With: export default async function handler(req, res)
#    - Update: event.httpMethod → req.method
#    - Update: event.body → req.body
#    - Update: return { statusCode, body, headers } → res.status().json()

# 4. Update imports
#    - Replace: './shared/job-storage.js' → '../shared/job-storage.js'
#    - Make job storage calls async (await createJob(...))
```

**10 Functions to Migrate**:
1. `growth-audit-ingest.js` → `api/growth-audit/ingest.js`
2. `growth-audit-stream.js` → `api/growth-audit/stream.js` (Edge Function)
3. `brain-auto-initialize.ts` → `api/brain/auto-initialize.ts`
4. `brain-enhance.ts` → `api/brain/enhance.ts`
5. `brain-content-generate.ts` → `api/brain/content-generate.ts`
6. `ai_invoke.ts` → `api/admin/ai-invoke.ts`
7. `agent_train-background.ts` → `api/admin/agent-train.ts`
8. `dataforseo-keywords.js` → `api/content/dataforseo-keywords.js`
9. `ingest_dispatch-background.ts` → `api/content/ingest-dispatch.ts`
10. `screenshot-capture.js` → `api/utilities/screenshot-capture.js`

---

### Step 3: Frontend Updates (2-3 hours)

```bash
# 1. Search for Netlify function calls
grep -r "\.netlify/functions" src/

# 2. Create API client
# File: src/lib/api-client.js
# (See example above)

# 3. Update all components to use new API client
# Example:
# Before: fetch('/.netlify/functions/growth-audit-ingest')
# After: apiClient.growthAudit.ingest(websiteUrl)

# 4. Update SSE connections
# Before: new EventSource('/.netlify/functions/growth-audit-stream?jobId=' + jobId)
# After: new EventSource('/api/growth-audit/stream?jobId=' + jobId)
```

---

### Step 4: Testing (2-3 hours)

```bash
# 1. Local testing
vercel dev
# Test each function at http://localhost:3000/api/...

# 2. Preview deployment
vercel
# Test in production-like environment

# 3. Verify critical paths
# - Growth Audit: Submit URL, verify job creation, check streaming
# - Business Brain: Test auto-initialize, onboarding, content generation
# - Admin: Test AI invocation, agent training
```

---

### Step 5: Production Deployment (1 hour)

```bash
# 1. Final checks
git status
git add .
git commit -m "feat: Migrate to Vercel"
git push origin master

# 2. Deploy to production
vercel --prod

# 3. Monitor logs
vercel logs --follow

# 4. Update DNS (if needed)
# Point dm4.wjwelsh.com to Vercel
```

---

## Environment Variables (48 Required)

### Core (6)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_REF
GITHUB_PERSONAL_ACCESS_TOKEN
```

### Growth Audit (3)
```
VITE_FIRECRAWL_API_KEY (required)
VITE_BRANDFETCH_API_KEY (optional)
VITE_PAGESPEED_API_KEY (optional)
```

### AI Services (5)
```
VITE_OPENAI_API_KEY
VITE_GEMINI_API_KEY
VITE_ANTHROPIC_API_KEY
VITE_REPLICATE_API_TOKEN
VITE_ELEVENLABS_API_KEY
```

### Keyword Research (2)
```
DATAFORSEO_LOGIN
DATAFORSEO_PASSWORD
```

### Vercel-Specific (Auto-configured)
```
KV_REST_API_URL (auto)
KV_REST_API_TOKEN (auto)
```

**Full list**: See `docs/VERCEL_MIGRATION_REPORT.md` - Appendix C

---

## Common Issues & Solutions

### Issue: "Multiple instances of vercel detected"
**Solution**: Use `npx vercel` instead of global install

### Issue: "Function timeout after 10 seconds"
**Solution**: Use Edge Functions (`export const config = { runtime: 'edge' }`)

### Issue: "Cannot find module '../shared/job-storage.js'"
**Solution**: Update relative import paths after directory restructure

### Issue: "req.body is undefined"
**Solution**: Vercel auto-parses JSON, access directly via `req.body`

### Issue: "CORS errors in preview deployment"
**Solution**: Add CORS headers to function responses:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
```

---

## Rollback Plan

If migration fails, rollback to Netlify:

```bash
# 1. Revert Vercel deployment
vercel rollback

# 2. Or redeploy to Netlify
git revert <commit-hash>
git push origin master
# Netlify auto-deploys from master branch

# 3. Update DNS back to Netlify (if changed)
```

---

## Success Criteria

- [ ] All 10 functions migrated and working
- [ ] Job storage persists across cold starts (Vercel KV)
- [ ] SSE streaming functional (Edge Functions)
- [ ] All frontend API calls updated
- [ ] Zero broken functionality
- [ ] Performance equal or better than Netlify
- [ ] 24-48 hour monitoring shows no errors

---

## Resources

- **Full Migration Report**: `docs/VERCEL_MIGRATION_REPORT.md` (48 pages)
- **Vercel Config**: `vercel.json` (created)
- **Vercel Docs**: https://vercel.com/docs
- **KV Docs**: https://vercel.com/docs/storage/vercel-kv
- **Edge Functions**: https://vercel.com/docs/functions/edge-functions

---

## Contact

**Project**: Disruptors AI Marketing Hub
**Repository**: https://github.com/TechIntegrationLabs/disruptors-ai-marketing-hub
**Vercel Project**: dm4
**Migration Date**: 2025-10-08

---

**Ready to start?** Begin with Step 1: Vercel Setup
