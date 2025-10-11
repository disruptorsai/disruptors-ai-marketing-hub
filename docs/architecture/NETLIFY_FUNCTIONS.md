# Netlify Serverless Functions

## Overview

The application uses 11 Netlify serverless functions for AI processing, data collection, and background operations.

## Function Directory

### Growth Audit System (2 functions)

#### `growth-audit-ingest.js`
- **Purpose**: Website data collection orchestration with job queueing
- **Flow**:
  1. User submits URL
  2. Creates job in memory queue
  3. Orchestrates: Firecrawl → Playwright → Brandfetch → PageSpeed
  4. AI analyzer generates business profile + 8-15 opportunities
  5. Service mapper creates Starter/Core/Scale packages
  6. Sales copy generator creates email templates
- **Timeout**: 26 seconds (Netlify limit)
- **Dependencies**: `@mendable/firecrawl-js`, `playwright`, `@anthropic-ai/sdk`

#### `growth-audit-stream.js`
- **Purpose**: Server-Sent Events streaming for real-time results delivery
- **Flow**:
  1. Client polls via SSE
  2. Returns job status and incremental results
  3. Streams AI generation progress
  4. Closes when job complete
- **Protocol**: Server-Sent Events (SSE)
- **Dependencies**: None (uses shared job storage)

### Marketing Audit System (1 function)

#### `marketing-audit-analyze.js`
- **Purpose**: AI-powered marketing strategy analysis with Claude
- **Flow**:
  1. Receives marketing information from form
  2. Claude Sonnet 4.5 analyzes strategy
  3. Returns recommendations and insights
  4. Lead capture for follow-up
- **AI Model**: Claude Sonnet 4.5
- **Dependencies**: `@anthropic-ai/sdk`

### Business Brain System (3 functions)

#### `brain-auto-initialize.ts`
- **Purpose**: Auto-scrape website to create starter brain
- **Flow**:
  1. Receives website URL and brain ID
  2. Firecrawl scrapes website content
  3. Claude extracts 20-50 facts
  4. Assigns confidence scores (0.3-0.5 = Level 1)
  5. Stores facts in database
- **AI Model**: Claude Sonnet 4.5
- **Dependencies**: `@mendable/firecrawl-js`, `@anthropic-ai/sdk`

#### `brain-enhance.ts`
- **Purpose**: AI onboarding conversation engine
- **Flow**:
  1. Interactive conversation with user
  2. Claude asks targeted questions
  3. Extracts business intelligence
  4. Enhances brain to Level 2 (confidence 0.6-0.8)
- **AI Model**: Claude Sonnet 4.5
- **Dependencies**: `@anthropic-ai/sdk`

#### `brain-content-generate.ts`
- **Purpose**: Brain-aware content generation
- **Flow**:
  1. Loads Business Brain context
  2. Receives content generation request
  3. Claude generates brand-consistent content
  4. Returns content with business context
- **AI Model**: Claude Sonnet 4.5
- **Dependencies**: `@anthropic-ai/sdk`

### Admin Nexus System (2 functions)

#### `ai_invoke.ts`
- **Purpose**: AI generation with streaming support
- **Flow**:
  1. Receives AI generation request
  2. Routes to appropriate provider (Claude/OpenAI/Gemini)
  3. Streams response if requested
  4. Returns generated content
- **AI Models**: Claude, OpenAI gpt-image-1, Gemini
- **Dependencies**: `@ai-sdk/openai`, `@ai-sdk/anthropic`, `ai`

#### `agent_train-background.ts`
- **Purpose**: Background AI agent training
- **Flow**:
  1. Receives training data
  2. Processes training in background
  3. Updates agent configuration
  4. Returns training status
- **Dependencies**: `@anthropic-ai/sdk`

### Content & SEO (2 functions)

#### `dataforseo-keywords.js`
- **Purpose**: Keyword research with DataForSEO API
- **Flow**:
  1. Receives seed keyword
  2. Queries DataForSEO for keyword data
  3. Returns volume, difficulty, CPC, trends
  4. Opportunity scoring algorithm
- **API**: DataForSEO Keywords Data API
- **Dependencies**: None (direct API calls)

#### `ingest_dispatch-background.ts`
- **Purpose**: Content ingestion dispatcher
- **Flow**:
  1. Receives content to ingest
  2. Dispatches to appropriate processor
  3. Extracts metadata and content
  4. Stores in database
- **Dependencies**: Varies by content type

### Utilities (1 function)

#### `screenshot-capture.js`
- **Purpose**: Playwright-based screenshot capture
- **Flow**:
  1. Receives URL to capture
  2. Launches headless browser
  3. Captures screenshot
  4. Returns image data
- **Dependencies**: `playwright`, `chromium-bidi`

## Shared Utilities

### `shared/job-storage.js`
- **Purpose**: In-memory job queue and state management
- **Features**:
  - Create job with unique ID
  - Update job status and results
  - Poll job status
  - Cleanup completed jobs
- **Used by**: Growth Audit functions

## Configuration

### netlify.toml

```toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[functions."growth-audit-ingest"]]
  timeout = 26

[[functions."growth-audit-stream"]]
  timeout = 26

[build.environment]
  NODE_VERSION = "18"
```

### External Dependencies

Configured in `netlify.toml`:

```toml
[functions]
  external_node_modules = [
    "@ai-sdk/openai",
    "@ai-sdk/anthropic",
    "ai",
    "playwright",
    "playwright-core",
    "chromium-bidi",
    "@mendable/firecrawl-js",
    "node-vibrant",
    "culori"
  ]
```

## Environment Variables

Functions access environment variables via `process.env`:

```javascript
// Supabase (service role for elevated permissions)
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// AI Services
const anthropicKey = process.env.VITE_ANTHROPIC_API_KEY
const openaiKey = process.env.VITE_OPENAI_API_KEY
const geminiKey = process.env.VITE_GEMINI_API_KEY

// Growth Audit
const firecrawlKey = process.env.VITE_FIRECRAWL_API_KEY
const brandfetchKey = process.env.VITE_BRANDFETCH_API_KEY
const pagespeedKey = process.env.VITE_PAGESPEED_API_KEY

// Keyword Research
const dataforSeoLogin = process.env.DATAFORSEO_LOGIN
const dataforSeoPassword = process.env.DATAFORSEO_PASSWORD
```

## Common Patterns

### Function Response

```javascript
export const handler = async (event, context) => {
  try {
    // Parse request
    const body = JSON.parse(event.body)

    // Process request
    const result = await processRequest(body)

    // Return success
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    }
  } catch (error) {
    console.error('Function error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}
```

### Server-Sent Events (SSE)

```javascript
export const handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    },
    body: `data: ${JSON.stringify({ status: 'processing' })}\n\n`
  }
}
```

### CORS Headers

```javascript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
}
```

## Development

### Local Testing

```bash
# Start Netlify dev server (includes functions)
npm run dev:netlify

# Functions available at:
# http://localhost:8888/.netlify/functions/[function-name]
```

### Testing Function Endpoint

```javascript
// Example: Test growth-audit-ingest
const response = await fetch('/.netlify/functions/growth-audit-ingest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    website_url: 'https://example.com'
  })
})

const data = await response.json()
console.log(data)
```

## Deployment

Functions are automatically deployed with the site:

```bash
# Deploy to production
npm run deploy:prod

# Deploy preview
npm run deploy:netlify
```

## Monitoring

### Function Logs

Access logs in Netlify dashboard:
1. Go to https://app.netlify.com/projects/cheerful-custard-2e6fc5
2. Navigate to Functions tab
3. Click on function name
4. View logs and metrics

### Performance Metrics

- Invocation count
- Duration (ms)
- Error rate
- Memory usage

## Timeout Management

Netlify free tier has 26-second timeout limit.

### Strategies

1. **Job Queue Pattern** - Return immediately, process in background
2. **SSE Streaming** - Stream results as they're generated
3. **Chunked Processing** - Break large tasks into smaller chunks
4. **Caching** - Cache expensive operations

## Best Practices

1. **Use service role key** - Functions need elevated permissions
2. **Handle errors gracefully** - Return proper HTTP status codes
3. **Log important events** - Helps with debugging
4. **Validate input** - Don't trust client data
5. **Set appropriate timeouts** - Be mindful of 26s limit
6. **Use external dependencies** - Configure in netlify.toml
7. **Test locally first** - Use `npm run dev:netlify`

## Related Documentation

- `docs/GROWTH_AUDIT_INTEGRATION_REPORT.md` - Growth Audit system
- `docs/BUSINESS_BRAIN_INTEGRATION_GUIDE.md` - Business Brain system
- `docs/DEPLOYMENT.md` - Deployment configuration
- `docs/AUTHENTICATION_SYSTEM.md` - Authentication patterns
