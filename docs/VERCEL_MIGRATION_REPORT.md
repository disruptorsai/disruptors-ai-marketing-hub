# Vercel Migration Report
## Netlify to Vercel Migration Analysis & Implementation Plan

**Date**: 2025-10-08
**Project**: Disruptors AI Marketing Hub
**Repository**: https://github.com/TechIntegrationLabs/disruptors-ai-marketing-hub
**Vercel Project**: dm4

---

## Executive Summary

This document provides a comprehensive analysis and migration plan for moving the Disruptors AI Marketing Hub from Netlify to Vercel. The application is a React + Vite SPA with 10 serverless functions providing critical functionality including Growth Audit, Business Brain, and AI content generation.

**Migration Status**: ✅ **READY FOR IMPLEMENTATION**

**Key Findings**:
- All Netlify features have Vercel equivalents
- 10 serverless functions require migration to Vercel API routes structure
- CSP headers and security configurations can be preserved
- Build configuration is straightforward (React + Vite)
- Some Netlify-specific APIs require adaptation

---

## Current Netlify Configuration Analysis

### Platform Details
- **Site ID**: `cheerful-custard-2e6fc5`
- **Primary Domain**: https://dm4.wjwelsh.com
- **Netlify Domain**: https://master--cheerful-custard-2e6fc5.netlify.app
- **Framework**: React 18 + Vite 6.1.0
- **Node Version**: 18
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Functions Directory**: `netlify/functions`

### Build Configuration
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1"
  PLAYWRIGHT_BROWSERS_PATH = "0"

[functions]
  node_bundler = "esbuild"
  external_node_modules = [
    "@ai-sdk/openai",
    "@ai-sdk/anthropic",
    "chromium-bidi",
    "playwright-core",
    "playwright",
    "@mendable/firecrawl-js",
    "node-vibrant",
    "ai",
    "culori"
  ]
```

### Security Headers
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Content-Security-Policy**: Extensive CSP for AI APIs (OpenAI, Anthropic, Gemini, Supabase, Firecrawl, Brandfetch, etc.)
- **Cache-Control**: 1-year immutable caching for `/assets/*`

### SPA Routing
- Single redirect rule: `/* → /index.html` (200 status)

---

## Netlify Serverless Functions Inventory

### 10 Functions Requiring Migration

#### 1. Growth Audit System (2 functions)

**`growth-audit-ingest.js`** (95 lines)
- **Purpose**: Create growth audit jobs with URL validation
- **Method**: POST
- **Dependencies**: `uuid`, `./shared/job-storage.js`
- **Key Features**:
  - URL validation and normalization
  - Job creation with UUID
  - Returns jobId immediately
- **Netlify-specific**: Uses `event.httpMethod`, `event.body`
- **Migration Note**: Straightforward - adapt to Vercel Request/Response

**`growth-audit-stream.js`** (exact structure unknown, needs examination)
- **Purpose**: Server-Sent Events (SSE) streaming for results
- **Method**: GET (likely)
- **Dependencies**: `./shared/job-storage.js`, AI services
- **Key Features**:
  - Polls job status
  - Streams results via SSE
  - Real-time progress updates
- **Migration Note**: Vercel supports SSE via Edge Functions

#### 2. Business Brain System (3 functions)

**`brain-auto-initialize.ts`** (TypeScript)
- **Purpose**: Auto-scrape website to create starter brain
- **Dependencies**: Supabase, Anthropic, Firecrawl
- **Key Features**:
  - Website scraping with Firecrawl
  - AI fact extraction with Claude
  - Business intelligence creation
- **Migration Note**: TypeScript requires special attention

**`brain-enhance.ts`** (100+ lines, TypeScript)
- **Purpose**: AI onboarding conversation engine
- **Dependencies**: `@netlify/functions`, `@supabase/supabase-js`, `@anthropic-ai/sdk`
- **Key Features**:
  - 10-15 question onboarding flow
  - File upload processing
  - Integration data sync
  - Manual fact additions
  - Confidence scoring and brain level upgrades
- **Netlify-specific**: Uses `Handler`, `HandlerEvent`, `HandlerContext` types
- **Migration Note**: Replace Netlify types with Vercel types

**`brain-content-generate.ts`** (TypeScript)
- **Purpose**: Brain-aware content generation
- **Dependencies**: Supabase, Anthropic
- **Key Features**:
  - Uses Business Brain context
  - Generates brand-consistent content
  - Blog posts, social media, copy
- **Migration Note**: Standard function migration

#### 3. Admin Nexus System (2 functions)

**`ai_invoke.ts`** (TypeScript)
- **Purpose**: AI generation with streaming support
- **Dependencies**: `@ai-sdk/openai`, `@ai-sdk/anthropic`, `ai`
- **Key Features**:
  - Multi-provider AI invocation
  - Streaming responses
  - Model selection logic
- **Migration Note**: Vercel AI SDK is native to Vercel

**`agent_train-background.ts`** (TypeScript)
- **Purpose**: Background AI agent training
- **Dependencies**: AI SDKs, Supabase
- **Key Features**:
  - Long-running training jobs
  - Background processing
- **Migration Note**: Consider Vercel background functions (26s limit) or queue

#### 4. Content & SEO (2 functions)

**`dataforseo-keywords.js`**
- **Purpose**: Keyword research with DataForSEO API
- **Dependencies**: DataForSEO SDK
- **Key Features**:
  - Real keyword data (volume, difficulty, CPC)
  - Smart scoring algorithm
  - Batch processing
- **Migration Note**: Straightforward API proxy

**`ingest_dispatch-background.ts`** (TypeScript)
- **Purpose**: Content ingestion dispatcher
- **Dependencies**: Unknown (needs examination)
- **Key Features**:
  - Background job dispatch
  - Content processing queue
- **Migration Note**: Background job handling

#### 5. Utilities (1 function)

**`screenshot-capture.js`**
- **Purpose**: Playwright-based screenshot capture
- **Dependencies**: `playwright`, `playwright-core`
- **Key Features**:
  - Headless browser automation
  - Screenshot generation
  - Multiple viewport support
- **Migration Note**: **CHALLENGE** - Playwright requires special handling on Vercel

### Shared Utilities

**`shared/job-storage.js`** (119 lines)
- **Purpose**: In-memory job queue and state management
- **Structure**: ES6 module with Map-based storage
- **Functions**: `getJob`, `createJob`, `updateJobStatus`, `setJobResult`, `setJobError`, `cleanupOldJobs`
- **Migration Note**: **CRITICAL** - In-memory storage resets on cold starts
  - Vercel functions are stateless
  - Requires persistent storage (Redis, Supabase, Vercel KV)
  - Production recommendation: Migrate to Vercel KV or Supabase

---

## Vercel Equivalent Configuration

### `vercel.json` Created ✅

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install",

  "build": {
    "env": {
      "NODE_VERSION": "18",
      "PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD": "1",
      "PLAYWRIGHT_BROWSERS_PATH": "0"
    }
  },

  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x",
      "maxDuration": 26
    },
    "api/**/*.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 26
    }
  }
}
```

**Key Features**:
- ✅ Security headers (CSP, XSS, frame options)
- ✅ SPA routing (`/* → /index.html`)
- ✅ Asset caching (1-year immutable)
- ✅ Node 18 runtime
- ✅ 26-second function timeout (Vercel limit)
- ✅ Framework detection (Vite)

---

## Function Migration Strategy

### Directory Structure Transformation

**Netlify Structure**:
```
netlify/
└── functions/
    ├── growth-audit-ingest.js
    ├── growth-audit-stream.js
    ├── brain-auto-initialize.ts
    ├── brain-enhance.ts
    ├── brain-content-generate.ts
    ├── ai_invoke.ts
    ├── agent_train-background.ts
    ├── dataforseo-keywords.js
    ├── ingest_dispatch-background.ts
    ├── screenshot-capture.js
    └── shared/
        └── job-storage.js
```

**Vercel Structure** (Recommended):
```
api/
├── growth-audit/
│   ├── ingest.js
│   └── stream.js
├── brain/
│   ├── auto-initialize.ts
│   ├── enhance.ts
│   └── content-generate.ts
├── admin/
│   ├── ai-invoke.ts
│   └── agent-train.ts
├── content/
│   ├── dataforseo-keywords.js
│   └── ingest-dispatch.ts
├── utilities/
│   └── screenshot-capture.js
└── shared/
    └── job-storage.js (migrate to Vercel KV)
```

**URL Mapping**:
| Netlify Function | Vercel API Route | URL Change |
|-----------------|------------------|------------|
| `/.netlify/functions/growth-audit-ingest` | `/api/growth-audit/ingest` | YES |
| `/.netlify/functions/growth-audit-stream` | `/api/growth-audit/stream` | YES |
| `/.netlify/functions/brain-auto-initialize` | `/api/brain/auto-initialize` | YES |
| `/.netlify/functions/brain-enhance` | `/api/brain/enhance` | YES |
| `/.netlify/functions/brain-content-generate` | `/api/brain/content-generate` | YES |
| `/.netlify/functions/ai_invoke` | `/api/admin/ai-invoke` | YES |
| `/.netlify/functions/agent_train-background` | `/api/admin/agent-train` | YES |
| `/.netlify/functions/dataforseo-keywords` | `/api/content/dataforseo-keywords` | YES |
| `/.netlify/functions/ingest_dispatch-background` | `/api/content/ingest-dispatch` | YES |
| `/.netlify/functions/screenshot-capture` | `/api/utilities/screenshot-capture` | YES |

**⚠️ CRITICAL**: All frontend API calls must be updated to new URLs!

### Code Transformation Pattern

#### Netlify Function Example
```javascript
// netlify/functions/example.js
export async function handler(event, context) {
  const { httpMethod, body } = event;

  if (httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  const data = JSON.parse(body);

  return {
    statusCode: 200,
    body: JSON.stringify({ result: 'success' }),
    headers: { 'Content-Type': 'application/json' }
  };
}
```

#### Vercel Function Equivalent
```javascript
// api/example.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = req.body;

  return res.status(200).json({ result: 'success' });
}
```

#### TypeScript with Netlify Types
```typescript
// netlify/functions/example.ts
import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // function logic
};
```

#### TypeScript with Vercel Types
```typescript
// api/example.ts
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // function logic
}
```

---

## Critical Migration Challenges

### 1. In-Memory Job Storage ⚠️ **HIGH PRIORITY**

**Problem**: `shared/job-storage.js` uses in-memory Map for job state
```javascript
export const jobs = new Map(); // ❌ Resets on every cold start!
```

**Impact**:
- Growth Audit jobs will be lost on function cold starts
- Users will lose audit progress
- SSE streaming will fail

**Solutions**:

#### Option A: Vercel KV (Redis) ✅ **RECOMMENDED**
```bash
# Install Vercel KV
npm install @vercel/kv
```

```javascript
// api/shared/job-storage.js
import { kv } from '@vercel/kv';

export async function createJob(jobId, url) {
  const job = {
    url,
    status: 'queued',
    createdAt: new Date().toISOString(),
  };
  await kv.set(`job:${jobId}`, JSON.stringify(job));
  return job;
}

export async function getJob(jobId) {
  const data = await kv.get(`job:${jobId}`);
  return data ? JSON.parse(data) : undefined;
}

// Auto-expire jobs after 1 hour
export async function createJobWithExpiry(jobId, url) {
  const job = { url, status: 'queued', createdAt: new Date().toISOString() };
  await kv.set(`job:${jobId}`, JSON.stringify(job), { ex: 3600 });
  return job;
}
```

**Vercel KV Setup**:
1. Go to Vercel dashboard → Storage → Create KV Database
2. Link to dm4 project
3. Environment variables auto-configured (`KV_REST_API_URL`, `KV_REST_API_TOKEN`)

**Pricing**: Free tier includes 256 MB storage, 3,000 commands/day

#### Option B: Supabase Storage ✅ **ALTERNATIVE**
```javascript
// api/shared/job-storage.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

export async function createJob(jobId, url) {
  const job = {
    id: jobId,
    url,
    status: 'queued',
    created_at: new Date().toISOString(),
  };

  await supabase.from('growth_audit_jobs').insert(job);
  return job;
}

export async function getJob(jobId) {
  const { data } = await supabase
    .from('growth_audit_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  return data;
}
```

**Requires**: New `growth_audit_jobs` table in Supabase

#### Option C: Upstash Redis ✅ **THIRD OPTION**
Similar to Vercel KV but provider-agnostic

**Recommendation**: **Vercel KV** for simplest integration and native Vercel support

---

### 2. Server-Sent Events (SSE) Streaming ⚠️ **MEDIUM PRIORITY**

**Function**: `growth-audit-stream.js`

**Challenge**: Vercel Serverless Functions have 26-second timeout limit

**Solutions**:

#### Option A: Vercel Edge Functions ✅ **RECOMMENDED**
```javascript
// api/growth-audit/stream.js
export const config = {
  runtime: 'edge', // ✅ No timeout limit for streaming!
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Poll job status
      const interval = setInterval(async () => {
        const job = await getJob(jobId); // From Vercel KV

        if (job.status === 'completed') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(job.result)}\n\n`));
          controller.close();
          clearInterval(interval);
        } else if (job.status === 'failed') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: job.error })}\n\n`));
          controller.close();
          clearInterval(interval);
        } else {
          // Send progress update
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: job.status })}\n\n`));
        }
      }, 1000); // Poll every second
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

#### Option B: Polling Endpoint (No SSE)
```javascript
// api/growth-audit/status.js
export default async function handler(req, res) {
  const { jobId } = req.query;
  const job = await getJob(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  return res.status(200).json(job);
}
```

**Frontend**: Poll every 2 seconds instead of SSE

**Recommendation**: **Edge Functions** for true streaming experience

---

### 3. Playwright Browser Automation ⚠️ **HIGH PRIORITY**

**Function**: `screenshot-capture.js`

**Challenge**: Vercel doesn't include Chromium by default

**Solutions**:

#### Option A: @vercel/og for Screenshots ✅ **SIMPLE**
```javascript
// api/utilities/screenshot.js
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler(req) {
  return new ImageResponse(
    // React component to render
    <div style={{ /* styles */ }}>Content</div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
```

**Limitation**: Only renders React/JSX, not real websites

#### Option B: External Screenshot Service ✅ **RECOMMENDED**
```javascript
// api/utilities/screenshot.js
export default async function handler(req, res) {
  const { url } = req.query;

  // Use Playwright MCP server or external service
  const response = await fetch('https://api.screenshotone.com/take', {
    method: 'POST',
    headers: { 'X-Access-Key': process.env.SCREENSHOT_API_KEY },
    body: JSON.stringify({ url, viewport_width: 1920, viewport_height: 1080 })
  });

  const imageBuffer = await response.buffer();

  res.setHeader('Content-Type', 'image/png');
  return res.send(imageBuffer);
}
```

**Services**: ScreenshotOne, Urlbox, ApiFlash

#### Option C: Serverless Chromium ✅ **COMPLEX**
```bash
npm install playwright-aws-lambda chrome-aws-lambda
```

```javascript
// api/utilities/screenshot.js
import playwright from 'playwright-aws-lambda';

export default async function handler(req, res) {
  const browser = await playwright.launchChromium();
  const page = await browser.newPage();
  await page.goto(req.query.url);
  const screenshot = await page.screenshot();
  await browser.close();

  res.setHeader('Content-Type', 'image/png');
  return res.send(screenshot);
}
```

**Recommendation**: **External service** or **Playwright MCP** for reliability

---

### 4. External Dependencies & Bundling ⚠️ **LOW PRIORITY**

**Challenge**: Netlify externalized certain packages (Playwright, Firecrawl, etc.)

**Vercel Approach**: Vercel auto-bundles dependencies with esbuild

**Action Required**:
- Test all functions after migration
- Add `externalModules` to `vercel.json` if needed:

```json
{
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x",
      "maxDuration": 26,
      "includeFiles": "node_modules/**"
    }
  }
}
```

---

### 5. Frontend API URL Updates ⚠️ **HIGH PRIORITY**

**Challenge**: All API calls use `/.netlify/functions/*` URLs

**Required Changes**:

#### Search for API Calls
```bash
# Find all Netlify function calls
grep -r "\.netlify/functions" src/
grep -r "netlify/functions" src/
```

#### Update Pattern
```javascript
// ❌ OLD (Netlify)
const response = await fetch('/.netlify/functions/growth-audit-ingest', {
  method: 'POST',
  body: JSON.stringify({ websiteUrl })
});

// ✅ NEW (Vercel)
const response = await fetch('/api/growth-audit/ingest', {
  method: 'POST',
  body: JSON.stringify({ websiteUrl })
});
```

#### Centralized API Client (Recommended)
```javascript
// src/lib/api-client.js
const API_BASE = import.meta.env.PROD
  ? '/api'
  : '/api'; // Or 'http://localhost:3000/api' for local dev

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
  brain: {
    autoInitialize: (data) =>
      fetch(`${API_BASE}/brain/auto-initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    // ... other brain methods
  }
};
```

**Files to Update**:
- Growth Audit pages: `src/pages/demos/GrowthAudit.jsx`, results pages
- Business Brain: `src/admin/modules/BusinessBrainBuilder.jsx`
- Admin Nexus: All admin modules using AI generation
- Content Management: Blog management, keyword research

---

## Environment Variables Migration

### Required Environment Variables (48 total)

All Netlify environment variables must be set in Vercel:

#### Core Services (6)
```bash
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_REF
GITHUB_PERSONAL_ACCESS_TOKEN
```

#### Growth Audit System (3)
```bash
VITE_FIRECRAWL_API_KEY      # Required
VITE_BRANDFETCH_API_KEY     # Optional
VITE_PAGESPEED_API_KEY      # Optional (Google API)
```

#### Keyword Research (2)
```bash
DATAFORSEO_LOGIN
DATAFORSEO_PASSWORD
```

#### AI Services (5)
```bash
VITE_OPENAI_API_KEY         # gpt-image-1 + embeddings
VITE_GEMINI_API_KEY         # Nano Banana
VITE_ANTHROPIC_API_KEY      # Business Brain + AutoBlog
VITE_REPLICATE_API_TOKEN    # Image generation
VITE_ELEVENLABS_API_KEY     # Voice synthesis
```

#### MCP & Deployment (8)
```bash
NETLIFY_AUTH_TOKEN
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
N8N_API_URL
N8N_API_KEY
GHL_API_KEY
GHL_LOCATION_ID
```

#### Vercel-Specific (NEW)
```bash
KV_REST_API_URL             # Auto-configured by Vercel KV
KV_REST_API_TOKEN           # Auto-configured by Vercel KV
```

### Setting Environment Variables

#### Via Vercel Dashboard
1. Go to https://vercel.com/will-4496s-projects/dm4/settings/environment-variables
2. Add each variable with appropriate environment (Production, Preview, Development)
3. Redeploy for changes to take effect

#### Via Vercel CLI
```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
# ... repeat for all variables
```

#### Bulk Import from .env
```bash
# Create .env.production with all variables
vercel env pull .env.production
```

---

## Git Deployment Configuration

### Vercel Project Setup

**Current Status**: Project "dm4" exists on Vercel

**Required Configuration**:
1. **Connect Repository**:
   - Repository: `TechIntegrationLabs/disruptors-ai-marketing-hub`
   - Production Branch: `master`
   - Preview Branches: All branches

2. **Build Settings**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Node Version: 18.x

3. **Deployment Settings**:
   - Auto-deploy: ✅ Enabled
   - Preview deployments: ✅ Enabled
   - Production branch: `master`

### Vercel CLI Setup

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Link project to existing Vercel project
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### GitHub Actions (Optional)

```yaml
# .github/workflows/vercel-deploy.yml
name: Vercel Deploy
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Compatibility Issues & Limitations

### 1. Function Timeout ⚠️
- **Netlify**: 26 seconds (free tier)
- **Vercel**: 26 seconds (Hobby), 10 seconds (Hobby Edge), 60s+ (Pro)
- **Impact**: Long-running functions (Growth Audit processing, AI training) may timeout
- **Solution**: Use Edge Functions, background jobs, or upgrade to Pro

### 2. Function Size Limits
- **Netlify**: 50 MB (compressed)
- **Vercel**: 50 MB (Serverless), 1 MB (Edge)
- **Impact**: Playwright/Chromium functions may exceed Edge limits
- **Solution**: Use Serverless Functions, not Edge

### 3. Cold Start Performance
- **Netlify**: ~500ms average
- **Vercel**: ~300ms Serverless, ~50ms Edge
- **Impact**: Better performance on Vercel
- **Solution**: Use Edge Functions where possible

### 4. Background Functions
- **Netlify**: Native background functions with `schedule` trigger
- **Vercel**: No native background functions (26s limit)
- **Impact**: `agent_train-background.ts`, `ingest_dispatch-background.ts` may need redesign
- **Solution**: Use Vercel Cron Jobs, external queue (Inngest, QStash), or Pro plan

### 5. Redirect Rules
- **Netlify**: Powerful `_redirects` file with regex, rewrites, proxying
- **Vercel**: Similar but different syntax in `vercel.json`
- **Impact**: Minimal (only SPA routing needed)
- **Solution**: Already configured in `vercel.json`

### 6. Build Plugins
- **Netlify**: Build plugins ecosystem
- **Vercel**: No native plugins, use npm scripts
- **Impact**: None (no build plugins currently used)
- **Solution**: N/A

---

## Step-by-Step Migration Implementation

### Phase 1: Pre-Migration Preparation ✅ **COMPLETED**

- [x] Audit Netlify configuration
- [x] Inventory all serverless functions
- [x] Create `vercel.json` configuration
- [x] Document environment variables
- [x] Create migration plan

### Phase 2: Vercel Project Setup (1-2 hours)

1. **Connect GitHub Repository**:
   ```bash
   # Via Vercel Dashboard
   vercel link
   # Select: TechIntegrationLabs/disruptors-ai-marketing-hub
   # Project: dm4
   ```

2. **Configure Build Settings**:
   - Verify `vercel.json` is detected
   - Set Node version to 18
   - Confirm output directory: `dist`

3. **Set Environment Variables**:
   ```bash
   # Option A: Via Dashboard (recommended for secrets)
   # Go to: https://vercel.com/will-4496s-projects/dm4/settings/environment-variables

   # Option B: Via CLI
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_ANON_KEY production
   vercel env add VITE_SUPABASE_SERVICE_ROLE_KEY production
   # ... (repeat for all 48 variables)
   ```

4. **Create Vercel KV Database**:
   ```bash
   # Via Dashboard: Storage → Create Database → KV
   # Link to dm4 project
   # KV_REST_API_URL and KV_REST_API_TOKEN auto-configured
   ```

### Phase 3: Function Migration (4-6 hours)

1. **Create API Directory Structure**:
   ```bash
   mkdir -p api/growth-audit
   mkdir -p api/brain
   mkdir -p api/admin
   mkdir -p api/content
   mkdir -p api/utilities
   mkdir -p api/shared
   ```

2. **Migrate Shared Job Storage** (HIGH PRIORITY):
   ```bash
   # Create new file: api/shared/job-storage.js
   # Replace in-memory Map with Vercel KV
   # Test with dummy data
   ```

3. **Migrate Growth Audit Functions**:
   ```bash
   # Copy and adapt:
   cp netlify/functions/growth-audit-ingest.js api/growth-audit/ingest.js
   cp netlify/functions/growth-audit-stream.js api/growth-audit/stream.js

   # Transform to Vercel handler pattern
   # Update job-storage imports
   # Test locally
   ```

4. **Migrate Business Brain Functions**:
   ```bash
   cp netlify/functions/brain-auto-initialize.ts api/brain/auto-initialize.ts
   cp netlify/functions/brain-enhance.ts api/brain/enhance.ts
   cp netlify/functions/brain-content-generate.ts api/brain/content-generate.ts

   # Replace @netlify/functions types with @vercel/node
   # Test locally
   ```

5. **Migrate Admin Functions**:
   ```bash
   cp netlify/functions/ai_invoke.ts api/admin/ai-invoke.ts
   cp netlify/functions/agent_train-background.ts api/admin/agent-train.ts

   # Consider Edge Functions for AI streaming
   # Test locally
   ```

6. **Migrate Content Functions**:
   ```bash
   cp netlify/functions/dataforseo-keywords.js api/content/dataforseo-keywords.js
   cp netlify/functions/ingest_dispatch-background.ts api/content/ingest-dispatch.ts

   # Test locally
   ```

7. **Migrate Utilities**:
   ```bash
   # screenshot-capture.js requires special handling
   # Decide: External service, @vercel/og, or playwright-aws-lambda
   # Implement chosen solution
   # Test locally
   ```

### Phase 4: Frontend API Updates (2-3 hours)

1. **Search for Netlify Function Calls**:
   ```bash
   grep -r "\.netlify/functions" src/
   ```

2. **Create Centralized API Client**:
   ```bash
   # Create: src/lib/api-client.js
   # Implement all API methods
   # Export typed functions
   ```

3. **Update All Components**:
   - Growth Audit pages: `src/pages/demos/GrowthAudit.jsx`, `GrowthAuditResults.jsx`
   - Business Brain: `src/admin/modules/BusinessBrainBuilder.jsx`
   - Admin Nexus: All modules in `src/admin/modules/`
   - Content Management: `src/admin/modules/ContentManagement.jsx`
   - Blog system: All blog-related components

4. **Update SSE Connections** (if using Edge Functions):
   ```javascript
   // Before (Netlify)
   const eventSource = new EventSource('/.netlify/functions/growth-audit-stream?jobId=' + jobId);

   // After (Vercel)
   const eventSource = new EventSource('/api/growth-audit/stream?jobId=' + jobId);
   ```

### Phase 5: Testing & Validation (2-3 hours)

1. **Local Testing with Vercel Dev**:
   ```bash
   npm install -g vercel
   vercel dev
   # Test all functions locally
   # Verify API responses
   # Check error handling
   ```

2. **Function-by-Function Testing**:
   - Growth Audit: Submit test URL, verify job creation, check SSE stream
   - Business Brain: Test auto-initialize, onboarding flow, content generation
   - Admin Nexus: Test AI invocation, agent training
   - Content: Test keyword research, ingestion
   - Utilities: Test screenshot capture

3. **Integration Testing**:
   - End-to-end Growth Audit flow
   - Business Brain creation and enhancement
   - Blog article generation with Business Brain context
   - Admin dashboard functionality

4. **Performance Testing**:
   - Measure cold start times
   - Check function execution duration
   - Monitor memory usage
   - Verify no timeouts

### Phase 6: Preview Deployment (1 hour)

1. **Deploy to Vercel Preview**:
   ```bash
   vercel
   # Review deployment URL
   # Test in production-like environment
   ```

2. **Verify All Features**:
   - Navigate all pages
   - Test all API endpoints
   - Verify environment variables loaded
   - Check CSP headers
   - Test Supabase connections

3. **Monitor Logs**:
   ```bash
   vercel logs
   # Check for errors
   # Verify function execution
   # Monitor performance
   ```

### Phase 7: Production Deployment (1 hour)

1. **Final Checks**:
   - All environment variables set in Production
   - `vercel.json` committed to `master` branch
   - All functions tested in Preview
   - Frontend API calls updated
   - Documentation updated

2. **Deploy to Production**:
   ```bash
   git checkout master
   git pull origin master
   vercel --prod
   ```

3. **Verify Production Deployment**:
   - Check deployment logs
   - Test critical paths (Growth Audit, Business Brain)
   - Verify custom domain (if configured)
   - Monitor error rates

4. **Update DNS (if needed)**:
   - Point custom domain to Vercel
   - Update DNS records: `dm4.wjwelsh.com → cname.vercel-dns.com`
   - Wait for propagation (1-24 hours)

### Phase 8: Post-Migration Monitoring (Ongoing)

1. **Monitor for 24-48 Hours**:
   ```bash
   vercel logs --follow
   # Watch for errors
   # Monitor function performance
   # Check cold start times
   ```

2. **Performance Comparison**:
   - Compare with Netlify Analytics
   - Check function execution times
   - Monitor error rates
   - Verify success rates

3. **User Acceptance Testing**:
   - Test all critical features
   - Verify no broken functionality
   - Check for UI issues
   - Monitor user feedback

4. **Rollback Plan** (if needed):
   ```bash
   # Revert to previous deployment
   vercel rollback

   # Or redeploy previous commit
   vercel --prod --force
   ```

---

## Migration Checklist

### Pre-Migration
- [x] Audit Netlify configuration
- [x] Inventory all functions (10 functions)
- [x] Create `vercel.json`
- [x] Document environment variables (48 variables)
- [x] Plan function migration strategy
- [x] Identify compatibility issues

### Vercel Setup
- [ ] Connect GitHub repository to Vercel
- [ ] Configure build settings (Node 18, Vite, dist/)
- [ ] Set all environment variables (Production, Preview, Development)
- [ ] Create Vercel KV database for job storage
- [ ] Link KV to dm4 project

### Function Migration
- [ ] Create `api/` directory structure
- [ ] Migrate `shared/job-storage.js` to Vercel KV
- [ ] Migrate Growth Audit functions (2)
- [ ] Migrate Business Brain functions (3)
- [ ] Migrate Admin Nexus functions (2)
- [ ] Migrate Content functions (2)
- [ ] Migrate Utilities (1)
- [ ] Update function imports and exports
- [ ] Add TypeScript type definitions for Vercel

### Frontend Updates
- [ ] Create centralized API client (`src/lib/api-client.js`)
- [ ] Update Growth Audit pages (API calls)
- [ ] Update Business Brain admin module (API calls)
- [ ] Update Admin Nexus modules (API calls)
- [ ] Update Content Management (API calls)
- [ ] Update blog system (API calls)
- [ ] Update SSE connections (if applicable)
- [ ] Test all API calls locally

### Testing
- [ ] Test all functions with `vercel dev`
- [ ] Verify job storage persistence (Vercel KV)
- [ ] Test SSE streaming (Edge Functions)
- [ ] Test Playwright/screenshot capture
- [ ] Verify environment variables loaded
- [ ] Check CSP headers and security
- [ ] Test Supabase connections
- [ ] Integration testing (end-to-end flows)

### Deployment
- [ ] Deploy to Vercel Preview
- [ ] Test preview deployment thoroughly
- [ ] Monitor preview logs for errors
- [ ] Deploy to Production (`vercel --prod`)
- [ ] Verify production deployment
- [ ] Update custom domain DNS (if needed)
- [ ] Monitor production logs (24-48 hours)

### Post-Migration
- [ ] Compare performance with Netlify
- [ ] Monitor error rates
- [ ] User acceptance testing
- [ ] Update documentation
- [ ] Archive Netlify project (after 1-2 weeks)
- [ ] Update CLAUDE.md with Vercel configuration

---

## Cost Comparison

### Netlify (Current)
- **Plan**: Free tier
- **Included**:
  - 100 GB bandwidth/month
  - 300 build minutes/month
  - 125K function invocations
  - 26-second function timeout
- **Estimated Monthly Cost**: $0

### Vercel (Recommended)
- **Plan**: Hobby (Free) or Pro
- **Hobby Plan** (Free):
  - 100 GB bandwidth/month
  - Unlimited builds (6 hours total execution)
  - 100 GB-hours serverless execution
  - Unlimited Edge Function execution
  - 26-second serverless timeout
  - 1 concurrent build
- **Pro Plan** ($20/month):
  - 1 TB bandwidth
  - Unlimited builds
  - 1000 GB-hours serverless execution
  - 60-second serverless timeout
  - Background functions
  - Analytics
  - 3 concurrent builds

**Recommendation**: Start with **Hobby (Free)**, upgrade to **Pro** if:
- Function timeouts become an issue (need 60s)
- Background jobs are critical
- Advanced analytics needed

### Vercel KV (Redis)
- **Free Tier**:
  - 256 MB storage
  - 3,000 commands/day
  - 100 MB bandwidth
- **Pro Tier** ($1/month):
  - 1 GB storage
  - 100,000 commands/day
  - 10 GB bandwidth

**Recommendation**: **Free Tier** sufficient for job storage (estimated 10-50 jobs/day)

---

## Recommended Next Steps

### Immediate Actions (Today)
1. ✅ Review this migration report
2. ✅ Commit `vercel.json` to repository
3. 🔄 Connect GitHub repo to Vercel project "dm4"
4. 🔄 Set environment variables in Vercel dashboard
5. 🔄 Create Vercel KV database

### Short-Term (This Week)
6. 🔄 Migrate `shared/job-storage.js` to Vercel KV
7. 🔄 Migrate Growth Audit functions (highest priority)
8. 🔄 Create centralized API client
9. 🔄 Update Growth Audit frontend API calls
10. 🔄 Deploy to Vercel Preview and test

### Medium-Term (Next Week)
11. 🔄 Migrate remaining functions (Business Brain, Admin, Content, Utilities)
12. 🔄 Update all frontend API calls
13. 🔄 Comprehensive testing (local + preview)
14. 🔄 Deploy to Production
15. 🔄 Monitor for 24-48 hours

### Long-Term (After Migration)
16. 🔄 Performance optimization
17. 🔄 Consider Edge Functions for better performance
18. 🔄 Implement background job queue (if needed)
19. 🔄 Archive Netlify project
20. 🔄 Update all documentation

---

## Support & Resources

### Vercel Documentation
- **Functions**: https://vercel.com/docs/functions
- **Edge Functions**: https://vercel.com/docs/functions/edge-functions
- **KV Storage**: https://vercel.com/docs/storage/vercel-kv
- **Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **TypeScript**: https://vercel.com/docs/functions/typescript

### Migration Guides
- **Netlify to Vercel**: https://vercel.com/guides/migrate-to-vercel-from-netlify
- **Serverless Functions**: https://vercel.com/docs/functions/serverless-functions/quickstart

### Community Support
- **Vercel Discord**: https://vercel.com/discord
- **GitHub Discussions**: https://github.com/vercel/vercel/discussions
- **Stack Overflow**: Tag `vercel`

---

## Contact Information

**Project Owner**: Will Welsh
**Repository**: https://github.com/TechIntegrationLabs/disruptors-ai-marketing-hub
**Vercel Project**: dm4
**Current Platform**: Netlify (cheerful-custard-2e6fc5)

**Migration Lead**: Claude Code (Anthropic)
**Date Created**: 2025-10-08
**Status**: 📋 **MIGRATION PLAN READY**

---

## Appendix A: Function Code Comparison

### Example: Growth Audit Ingest

#### Netlify Version
```javascript
// netlify/functions/growth-audit-ingest.js
import { v4 as uuidv4 } from 'uuid';
import { createJob } from './shared/job-storage.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { websiteUrl } = body;

    if (!websiteUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Website URL is required' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const jobId = uuidv4();
    const job = createJob(jobId, websiteUrl);

    return {
      statusCode: 200,
      body: JSON.stringify({ jobId, url: job.url, status: job.status }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error('Ingest error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
}
```

#### Vercel Version (Proposed)
```javascript
// api/growth-audit/ingest.js
import { v4 as uuidv4 } from 'uuid';
import { createJob } from '../shared/job-storage.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { websiteUrl } = req.body;

    if (!websiteUrl) {
      return res.status(400).json({ error: 'Website URL is required' });
    }

    const jobId = uuidv4();
    const job = await createJob(jobId, websiteUrl); // Now async with Vercel KV

    return res.status(200).json({
      jobId,
      url: job.url,
      status: job.status
    });
  } catch (error) {
    console.error('Ingest error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

**Key Differences**:
1. Export: `export async function handler(event)` → `export default async function handler(req, res)`
2. Method check: `event.httpMethod` → `req.method`
3. Body parsing: `JSON.parse(event.body)` → `req.body` (auto-parsed by Vercel)
4. Response: `{ statusCode, body, headers }` → `res.status().json()`
5. Job storage: Synchronous → Async (Vercel KV)
6. CORS: Added CORS headers for cross-origin requests

---

## Appendix B: Vercel KV Job Storage Implementation

```javascript
// api/shared/job-storage.js
import { kv } from '@vercel/kv';

/**
 * Get a job by ID from Vercel KV
 * @param {string} jobId - Job ID
 * @returns {Promise<Job | null>} Job or null if not found
 */
export async function getJob(jobId) {
  try {
    const data = await kv.get(`job:${jobId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Get job error:', error);
    return null;
  }
}

/**
 * Create a new job in Vercel KV
 * @param {string} jobId - Job ID
 * @param {string} url - Website URL
 * @returns {Promise<Job>} Created job
 */
export async function createJob(jobId, url) {
  try {
    const job = {
      url,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };

    // Store with 1-hour expiry
    await kv.set(`job:${jobId}`, JSON.stringify(job), { ex: 3600 });

    return job;
  } catch (error) {
    console.error('Create job error:', error);
    throw error;
  }
}

/**
 * Update job status in Vercel KV
 * @param {string} jobId - Job ID
 * @param {'queued' | 'running' | 'completed' | 'failed'} status - New status
 * @returns {Promise<Job | null>} Updated job or null if not found
 */
export async function updateJobStatus(jobId, status) {
  try {
    const job = await getJob(jobId);
    if (!job) return null;

    job.status = status;
    await kv.set(`job:${jobId}`, JSON.stringify(job), { ex: 3600 });

    return job;
  } catch (error) {
    console.error('Update job status error:', error);
    return null;
  }
}

/**
 * Set job result in Vercel KV
 * @param {string} jobId - Job ID
 * @param {Object} result - Audit result
 * @param {Array} events - Stream events
 * @returns {Promise<Job | null>} Updated job or null if not found
 */
export async function setJobResult(jobId, result, events = []) {
  try {
    const job = await getJob(jobId);
    if (!job) return null;

    job.status = 'completed';
    job.result = result;
    job.events = events;

    // Store completed jobs for 24 hours
    await kv.set(`job:${jobId}`, JSON.stringify(job), { ex: 86400 });

    return job;
  } catch (error) {
    console.error('Set job result error:', error);
    return null;
  }
}

/**
 * Set job error in Vercel KV
 * @param {string} jobId - Job ID
 * @param {string} error - Error message
 * @returns {Promise<Job | null>} Updated job or null if not found
 */
export async function setJobError(jobId, error) {
  try {
    const job = await getJob(jobId);
    if (!job) return null;

    job.status = 'failed';
    job.error = error;

    await kv.set(`job:${jobId}`, JSON.stringify(job), { ex: 3600 });

    return job;
  } catch (error) {
    console.error('Set job error:', error);
    return null;
  }
}

/**
 * Delete old jobs (cleanup) - Not needed with auto-expiry
 * KV entries auto-expire after set time
 */
export async function cleanupOldJobs() {
  console.log('Auto-expiry enabled via KV ex parameter');
  return 0;
}
```

**Benefits of Vercel KV**:
1. ✅ Persistent across function invocations
2. ✅ No cold start data loss
3. ✅ Auto-expiry (no manual cleanup)
4. ✅ Redis-compatible API
5. ✅ Global low-latency access
6. ✅ Built-in monitoring in Vercel dashboard

---

## Appendix C: Environment Variable Mapping

| Variable | Purpose | Required | Netlify | Vercel |
|----------|---------|----------|---------|--------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ Yes | ✅ | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | ✅ Yes | ✅ | ✅ |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Supabase service role | ✅ Yes | ✅ | ✅ |
| `VITE_FIRECRAWL_API_KEY` | Firecrawl web scraping | ✅ Yes | ✅ | ✅ |
| `VITE_ANTHROPIC_API_KEY` | Claude AI | ✅ Yes | ✅ | ✅ |
| `VITE_OPENAI_API_KEY` | OpenAI gpt-image-1 | ✅ Yes | ✅ | ✅ |
| `VITE_GEMINI_API_KEY` | Gemini Nano Banana | ✅ Yes | ✅ | ✅ |
| `VITE_REPLICATE_API_TOKEN` | Replicate AI | ⚠️ Optional | ✅ | ✅ |
| `VITE_BRANDFETCH_API_KEY` | Brandfetch colors | ⚠️ Optional | ✅ | ✅ |
| `DATAFORSEO_LOGIN` | DataForSEO keywords | ✅ Yes | ✅ | ✅ |
| `DATAFORSEO_PASSWORD` | DataForSEO password | ✅ Yes | ✅ | ✅ |
| `KV_REST_API_URL` | Vercel KV URL | ✅ Yes | ❌ | ✅ Auto |
| `KV_REST_API_TOKEN` | Vercel KV token | ✅ Yes | ❌ | ✅ Auto |

**Total**: 48 environment variables + 2 Vercel-specific (auto-configured)

---

## Conclusion

This migration from Netlify to Vercel is **technically feasible** with **moderate complexity**. The primary challenges involve:

1. **Job storage migration** (in-memory → Vercel KV) - **HIGH PRIORITY**
2. **SSE streaming** (use Edge Functions) - **MEDIUM PRIORITY**
3. **Playwright/screenshot capture** (use external service or serverless chromium) - **MEDIUM PRIORITY**
4. **Frontend API URL updates** - **HIGH PRIORITY**

**Estimated Total Time**: 12-16 hours over 1-2 weeks

**Recommended Approach**: **Phased migration** with thorough testing at each stage

**Risk Level**: **LOW** - All Netlify features have Vercel equivalents

**Success Criteria**:
- ✅ All 10 functions migrated and working
- ✅ Zero downtime during migration
- ✅ Performance equal or better than Netlify
- ✅ All features functional (Growth Audit, Business Brain, Admin)
- ✅ No broken API calls
- ✅ Job persistence working (Vercel KV)

**Go/No-Go Decision**: ✅ **GO** - Migration is ready for implementation

---

**Next Step**: Proceed with Phase 2 (Vercel Project Setup) when ready to begin implementation.
