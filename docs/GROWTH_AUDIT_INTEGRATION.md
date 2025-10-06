# Growth Audit Integration Documentation

## Overview

The Instant Growth Audit is an AI-powered web analysis tool that provides comprehensive growth opportunities and actionable insights for any website. It combines multiple data sources (web scraping, brand detection, performance audits, and AI analysis) to generate a detailed business profile with prioritized opportunities.

## Architecture

### Components

1. **Scrapers** (`src/lib/growth-audit/scrapers/`)
   - `firecrawl.js` - Web crawling and content extraction using Firecrawl API
   - `playwright.js` - Advanced page scraping with Playwright (meta tags, JSON-LD, images)
   - `brand-detect.js` - Brand color and identity extraction (Brandfetch API + Vibrant)
   - `pagespeed.js` - Google PageSpeed Insights integration for performance metrics

2. **AI Analyzers** (`src/lib/growth-audit/ai/`)
   - `analyzer.js` - Business profile analysis using Claude Sonnet 4.5
   - `opportunities.js` - Growth opportunity detection and prioritization
   - `prompts.js` - System prompts and prompt builders for AI models

3. **Orchestrator** (`src/lib/growth-audit/orchestrator.js`)
   - Coordinates all scrapers and AI analyzers
   - Manages workflow execution
   - Provides streaming progress updates

4. **Netlify Functions** (`netlify/functions/`)
   - `growth-audit-ingest.js` - Job creation endpoint (POST)
   - `growth-audit-stream.js` - Results streaming endpoint (GET with polling)

5. **UI Components** (`src/pages/demos/`)
   - `growth-audit.jsx` - Landing page with URL input form
   - `growth-audit-results.jsx` - Results display with polling mechanism

## Required Environment Variables

Add these to your `.env` file:

```bash
# Required
VITE_FIRECRAWL_API_KEY=your_firecrawl_api_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key  # Already exists

# Optional (for enhanced features)
VITE_BRANDFETCH_API_KEY=your_brandfetch_api_key  # Brand detection
VITE_PAGESPEED_API_KEY=your_google_api_key      # PageSpeed Insights
```

### Getting API Keys

1. **Firecrawl** (Required)
   - Sign up at https://firecrawl.dev
   - Get API key from dashboard
   - Used for web crawling and content extraction

2. **Anthropic** (Required - Already configured)
   - Sign up at https://console.anthropic.com
   - Get API key from settings
   - Used for AI-powered business analysis

3. **Brandfetch** (Optional)
   - Sign up at https://brandfetch.com
   - Get API key from developer portal
   - Fallback: Uses Vibrant color extraction from images

4. **Google PageSpeed Insights** (Optional)
   - Get API key from https://console.cloud.google.com
   - Enable PageSpeed Insights API
   - Fallback: Gracefully skips performance analysis

## Installation

1. **Install Dependencies**

```bash
npm install
```

Required packages (already in package.json):
- `@ai-sdk/anthropic` - Claude API integration
- `@mendable/firecrawl-js` - Web crawling
- `playwright` - Advanced web scraping
- `node-vibrant` - Color extraction
- `culori` - Color utilities
- `uuid` - Job ID generation
- `zod` - Schema validation
- `ai` - Vercel AI SDK

2. **Configure Environment Variables**

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
# Edit .env and add your API keys
```

3. **Test Netlify Functions Locally**

```bash
netlify dev
```

This starts the dev server with Netlify Functions at `http://localhost:8888`

## Usage

### As a User

1. Navigate to `/demos/growth-audit`
2. Enter a website URL (e.g., `shopify.com`)
3. Click "Scan My Business"
4. Wait 30-60 seconds for analysis
5. View comprehensive results including:
   - Brand identity (colors, logo, name)
   - SEO and performance metrics
   - 8-15 prioritized growth opportunities
   - Actionable steps for each opportunity

### As a Developer

**Manual Test Flow:**

```javascript
import { GrowthAuditOrchestrator } from './src/lib/growth-audit/orchestrator.js';

const orchestrator = new GrowthAuditOrchestrator();

const profile = await orchestrator.runAudit('https://example.com', (event) => {
  console.log('Progress:', event);
});

console.log('Profile:', profile);
console.log('Opportunities:', profile.quickWins);
```

**API Endpoints:**

1. Create job:
```bash
curl -X POST http://localhost:8888/.netlify/functions/growth-audit-ingest \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://example.com"}'
```

Response:
```json
{
  "jobId": "uuid-here",
  "url": "https://example.com",
  "status": "queued"
}
```

2. Get results (poll until completed):
```bash
curl "http://localhost:8888/.netlify/functions/growth-audit-stream?jobId=uuid-here"
```

Response (completed):
```json
{
  "status": "completed",
  "result": { /* BusinessProfile */ },
  "events": [ /* Progress events */ ]
}
```

## Data Flow

```
User Input (URL)
    ↓
Netlify Function (Ingest)
    ↓
Create Job ID
    ↓
User Redirected to Results Page
    ↓
Results Page Polls Stream Function
    ↓
Orchestrator Runs Audit:
    1. Firecrawl crawls site (10 pages)
    2. Playwright extracts meta/schema
    3. Brand Detector finds colors/logo
    4. PageSpeed Insights analyzes performance
    5. Claude analyzes business profile
    6. Claude detects opportunities
    ↓
Results Displayed to User
```

## Key Features

### 1. Brand Detection
- Extracts logo, colors, and brand identity
- Uses Brandfetch API (if available)
- Fallback: Vibrant color extraction from page images
- WCAG contrast validation

### 2. Business Profile Analysis
- AI-powered analysis using Claude Sonnet 4.5
- Extracts:
  - Brand identity (name, tagline, colors, fonts)
  - Product/service offerings
  - Ideal customer personas (ICP)
  - Geographic locations
  - Social media presence
  - Tech stack (CMS, framework, analytics)
  - Competitors

### 3. Growth Opportunities
- 8-15 AI-identified opportunities
- Categories: SEO, Content, Performance, CRO, Local, Social, Paid, EmailCRM, DataTracking, AI
- Each opportunity includes:
  - Impact band (conservative/likely/aggressive)
  - Effort level (low/med/high)
  - Confidence score (0-1)
  - Actionable steps (1-6)
  - Evidence with source URLs
  - Affected pages

### 4. Performance Metrics
- Google PageSpeed Insights integration
- Core Web Vitals (LCP, INP, CLS)
- Mobile and desktop scores
- Performance opportunities

## Customization

### Add New Opportunity Categories

Edit `src/lib/growth-audit/types.js`:

```javascript
/**
 * @typedef {'SEO' | 'Content' | 'Performance' | 'CRO' | 'Local' | 'Social' | 'Paid' | 'EmailCRM' | 'DataTracking' | 'AI' | 'YourCategory'} OpportunityCategory
 */
```

Update `src/lib/growth-audit/ai/prompts.js`:

```javascript
export const OPPORTUNITY_DETECTOR_SYSTEM = `
...
CATEGORIES: SEO, Content, Performance, CRO, Local, Social, Paid, EmailCRM, DataTracking, AI, YourCategory
...
`;
```

### Adjust AI Analysis Prompts

Edit `src/lib/growth-audit/ai/prompts.js` to customize:
- `BUSINESS_ANALYZER_SYSTEM` - Business profile analysis
- `OPPORTUNITY_DETECTOR_SYSTEM` - Opportunity detection
- `buildAnalyzerPrompt()` - Analyzer prompt builder
- `buildOpportunityPrompt()` - Opportunity prompt builder

### Change AI Model

Edit `src/lib/growth-audit/ai/analyzer.js` and `opportunities.js`:

```javascript
// Default: Claude Sonnet 4.5
model: anthropic('claude-sonnet-4-20250514')

// Alternative: Claude Opus 4.1
model: anthropic('claude-opus-4-20250514')

// Alternative: GPT-4o
model: openai('gpt-4o')
```

## Troubleshooting

### Common Issues

1. **"Firecrawl API key required"**
   - Ensure `VITE_FIRECRAWL_API_KEY` is set in `.env`
   - Restart dev server after adding env vars

2. **"Audit timed out"**
   - Increase poll timeout in `growth-audit-results.jsx`
   - Check Firecrawl API rate limits
   - Try a simpler website first

3. **"Brand detection failed"**
   - Check if `VITE_BRANDFETCH_API_KEY` is set (optional)
   - Fallback will use color extraction from images
   - Some sites may block image requests

4. **"PageSpeed Insights error"**
   - Check if `VITE_PAGESPEED_API_KEY` is set (optional)
   - Rate limits: 25,000 requests/day (free tier)
   - Gracefully skips if unavailable

5. **Netlify Functions not working locally**
   - Use `netlify dev` instead of `npm run dev`
   - Ensure `netlify.toml` is configured
   - Check function logs in terminal

### Debug Mode

Enable debug logging in orchestrator:

```javascript
// src/lib/growth-audit/orchestrator.js
async runAudit(url, onStream) {
  console.log('[DEBUG] Starting audit for:', url);
  // ... rest of code
}
```

## Performance Optimization

### Reduce Crawl Time
- Decrease `maxPages` in `orchestrator.js` (default: 10)
- Use Firecrawl's `limit` parameter

### Cache Results
- Implement Redis/database storage for jobs
- Cache brand detection results by domain
- Store PageSpeed results (TTL: 24 hours)

### Parallel Processing
- Run brand detection and PageSpeed in parallel
- Batch Firecrawl requests

## Security Considerations

1. **API Key Protection**
   - Never commit `.env` to git
   - Use Netlify environment variables in production
   - Rotate keys regularly

2. **Rate Limiting**
   - Implement per-IP rate limiting
   - Add CAPTCHA for public demos
   - Monitor Firecrawl usage

3. **Input Validation**
   - URL validation in `utils.js`
   - Sanitize all user inputs
   - Prevent SSRF attacks

## Deployment

### Netlify

1. **Set Environment Variables**
   - Go to Site Settings > Environment Variables
   - Add all required `VITE_*` keys

2. **Deploy**
```bash
npm run build
netlify deploy --prod
```

3. **Verify Functions**
   - Check Function logs in Netlify dashboard
   - Test endpoints at `https://yoursite.netlify.app/.netlify/functions/growth-audit-ingest`

### Custom Hosting

If not using Netlify:
- Replace Netlify Functions with Express/Next.js API routes
- Implement SSE streaming (Netlify doesn't support true SSE)
- Use WebSockets for real-time updates

## Future Enhancements

- [ ] Add 30/60/90 day plan generation
- [ ] Service package mapping (Starter/Core/Scale)
- [ ] Sales copy generation
- [ ] Email report generation
- [ ] Persistent storage (Supabase)
- [ ] User authentication
- [ ] Export to PDF
- [ ] Competitor analysis
- [ ] Historical tracking
- [ ] White-label customization

## Support

For issues or questions:
- Check existing GitHub issues
- Review Firecrawl docs: https://docs.firecrawl.dev
- Review Claude docs: https://docs.anthropic.com
- Contact: support@disruptorsai.com

## License

Proprietary - Disruptors AI Marketing Hub
