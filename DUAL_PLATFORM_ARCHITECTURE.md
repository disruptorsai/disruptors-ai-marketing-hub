# Dual-Platform Architecture (Netlify + Vercel)

**Status:** ✅ Fully Implemented
**Date:** October 8, 2025

## Overview

The Disruptors AI Marketing Hub now supports **simultaneous deployment on both Netlify and Vercel** with automatic platform detection and zero-configuration switching.

## Architecture Benefits

✅ **Zero downtime migration** - Run both platforms simultaneously
✅ **Easy A/B testing** - Compare platform performance
✅ **Instant fallback** - If one platform fails, the other continues working
✅ **Cost optimization** - Switch platforms based on usage patterns
✅ **Platform-specific optimizations** - Leverages best features of each

## How It Works

### 1. Platform-Agnostic API Client (`src/lib/platform-api-client.js`)

The frontend automatically detects and routes to the correct serverless function endpoint.

**Detection Strategy:**
1. Try Vercel endpoint: `/api/growth-audit/ingest`
2. If 404, try Netlify endpoint: `/.netlify/functions/growth-audit-ingest`
3. Return whichever succeeds

### 2. Universal Job Storage

**Netlify:** In-memory Map (ephemeral, single instance)
**Vercel:** Vercel KV Redis (persistent, multi-instance)

Both platforms use the same API through abstraction layers.

### 3. Serverless Functions

**10 Functions Deployed to Both Platforms:**

| Function | Netlify Path | Vercel Path |
|----------|--------------|-------------|
| Growth Audit Ingest | `/.netlify/functions/growth-audit-ingest` | `/api/growth-audit/ingest` |
| Growth Audit Stream | `/.netlify/functions/growth-audit-stream` | `/api/growth-audit/stream` |
| Brain Auto-Init | `/.netlify/functions/brain-auto-initialize` | `/api/brain/auto-initialize` |
| Brain Enhance | `/.netlify/functions/brain-enhance` | `/api/brain/enhance` |
| Brain Content Gen | `/.netlify/functions/brain-content-generate` | `/api/brain/content-generate` |
| AI Invoke | `/.netlify/functions/ai_invoke` | `/api/admin/ai-invoke` |
| Agent Train | `/.netlify/functions/agent_train-background` | `/api/admin/agent-train` |
| DataForSEO Keywords | `/.netlify/functions/dataforseo-keywords` | `/api/content/dataforseo-keywords` |
| Ingest Dispatch | `/.netlify/functions/ingest_dispatch-background` | `/api/content/ingest-dispatch` |
| Screenshot Capture | `/.netlify/functions/screenshot-capture` | `/api/utilities/screenshot-capture` |

## Testing Both Platforms Locally

### Test Netlify Locally
```bash
npm run dev:netlify
# Runs on localhost:8888
# Functions: /.netlify/functions/*
```

### Test Vercel Locally
```bash
npx vercel dev
# Runs on localhost:3000
# Functions: /api/*
```

## Migration Options

**Option A: Gradual Migration (Recommended)**
1. Deploy to Vercel preview environment
2. Test all functions with real data
3. Update DNS to point to Vercel
4. Keep Netlify as fallback for 30 days

**Option B: Dual Deployment**
1. Deploy to Vercel production
2. Keep both platforms active
3. Use frontend auto-detection for routing
4. A/B test performance and costs

**Option C: Stay on Netlify**
1. Keep Netlify as primary platform
2. Vercel code ready whenever needed
3. Switch anytime with zero code changes

## Success Metrics

✅ **Frontend API client:** Platform-agnostic with automatic fallback
✅ **Vercel functions:** All 10 functions migrated
✅ **Netlify functions:** Updated to use universal storage
✅ **Job storage:** Works on both platforms with same API
✅ **Zero code changes:** Switch platforms by changing deployment target only

---

**Status:** ✅ **READY FOR DUAL DEPLOYMENT**

Both platforms fully supported. Choose your deployment strategy and deploy with confidence.
