# Growth Audit - Quick Reference

## 📁 File Locations

### Core Library (`src/lib/growth-audit/`)
```
growth-audit/
├── ai/
│   ├── analyzer.js       # Business profile analysis
│   ├── copy.js          # Sales copy generation
│   ├── mapper.js        # Service package mapping
│   ├── opportunities.js # Growth opportunity detection
│   └── prompts.js       # AI system prompts
├── audits/
│   └── pagespeed.js     # Performance analysis
├── scrapers/
│   ├── brand-detect.js  # Brand color extraction
│   ├── firecrawl.js     # Website crawling
│   └── playwright.js    # DOM scraping
├── orchestrator.js      # Main coordinator
├── types.js            # Type definitions
└── utils.js            # Utility functions
```

### API Functions (`netlify/functions/`)
```
functions/
├── growth-audit-ingest.js  # Job creation endpoint
├── growth-audit-stream.js  # Results streaming endpoint
└── shared/
    └── job-storage.js      # Shared job state
```

### UI Pages (`src/pages/demos/`)
```
demos/
├── growth-audit.jsx         # Landing page with URL input
└── growth-audit-results.jsx # Results display page
```

## 🔑 Environment Variables

### Required
- `VITE_ANTHROPIC_API_KEY` - Claude Sonnet 4.5

### Optional (with fallbacks)
- `VITE_FIRECRAWL_API_KEY` - Website crawling
- `VITE_BRANDFETCH_API_KEY` - Brand detection
- `VITE_PAGESPEED_API_KEY` - Performance audit

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Add to .env
VITE_ANTHROPIC_API_KEY=sk-ant-xxx...
```

### 2. Access the Tool
```
https://your-domain.com/demos/growth-audit
```

### 3. Run an Audit
1. Enter website URL
2. Click "Scan My Business"
3. Wait ~30-60 seconds
4. View results with opportunities

## 📊 What It Analyzes

### Business Profile
- Brand identity (name, tagline, colors, fonts)
- Product/service offerings
- Target audience (ICP)
- Geographic locations
- Social media presence
- Technical stack
- SEO fundamentals

### Opportunities (10 Categories)
1. **SEO** - Schema, meta, internal linking
2. **Content** - Blog, FAQs, value props
3. **Performance** - Images, CWV, speed
4. **CRO** - CTAs, forms, trust signals
5. **Local** - GBP, NAP consistency
6. **Social** - Activity, cross-linking
7. **Paid** - Pixels, tracking, landing pages
8. **EmailCRM** - Lead magnets, automation
9. **DataTracking** - GA4, GTM, events
10. **AI** - Chatbots, workflow automation

### Deliverables
- 8-15 prioritized opportunities
- Impact bands (conservative/likely/aggressive)
- Effort levels (low/med/high)
- Confidence scores (0-1)
- Action steps (3-6 per opportunity)
- Evidence links
- Service packages (Starter/Core/Scale)
- 30/60/90 day execution plan
- Sales copy (elevator pitch, email)

## 🔧 API Endpoints

### Create Job
```bash
POST /.netlify/functions/growth-audit-ingest
{
  "websiteUrl": "https://example.com"
}

Response:
{
  "jobId": "uuid-v4",
  "url": "https://example.com",
  "status": "queued"
}
```

### Get Results
```bash
GET /.netlify/functions/growth-audit-stream?jobId=uuid-v4

Response (when complete):
{
  "status": "completed",
  "result": { /* BusinessProfile */ },
  "events": [ /* Stream events */ ]
}
```

## 🏗️ Architecture Flow

```
User Input (URL)
    ↓
Ingest Function (creates job)
    ↓
Stream Function (executes audit)
    ↓
Orchestrator
    ├── Firecrawl/Playwright (crawl site)
    ├── Brandfetch/Vibrant (detect brand)
    ├── PageSpeed (analyze performance)
    ├── Playwright (extract schema/meta)
    ├── Claude Sonnet 4.5 (analyze profile)
    └── Claude Sonnet 4.5 (detect opportunities)
    ↓
Results Page (displays findings)
```

## 📝 Key Functions

### Orchestrator
```javascript
import { GrowthAuditOrchestrator } from '@/lib/growth-audit/orchestrator';

const orchestrator = new GrowthAuditOrchestrator();
const profile = await orchestrator.runAudit(url, onStreamCallback);
```

### Service Mapping
```javascript
import { mapToServicePlan } from '@/lib/growth-audit/ai/mapper';

const plan = await mapToServicePlan(opportunities, selectedIds);
// Returns: { packages, plan30_60_90, notes }
```

### Sales Copy
```javascript
import { generateSalesCopy } from '@/lib/growth-audit/ai/copy';

const copy = await generateSalesCopy(profile, opportunities);
// Returns: { elevator, valueProps, benefitLines, emailSubject, emailBody }
```

## 🎨 UI Components Used

- `Button` - Primary CTAs
- `Input` - URL input field
- `Card` - Container layouts
- `Badge` - Category/status indicators
- `Alert` - Error messages
- Lucide icons - Visual elements

## 🐛 Troubleshooting

### Job Not Found
- Check jobId in URL
- Job may have expired (1 hour TTL)
- Clear browser cache

### Audit Failed
- Verify ANTHROPIC_API_KEY is set
- Check rate limits (50 req/min Tier 1)
- Review Netlify function logs

### Import Errors
- Ensure all dependencies installed: `npm install`
- Verify node-vibrant import: `import { Vibrant } from 'node-vibrant/browser'`

### Slow Results
- Firecrawl API may be rate limited
- Large sites take longer (10+ pages)
- PageSpeed API can be slow

## 📚 Related Docs

- Full integration report: `GROWTH_AUDIT_INTEGRATION_REPORT.md`
- Environment setup: `GROWTH_AUDIT_ENV_VARS.md`
- Changes summary: `GROWTH_AUDIT_CHANGES.md`

## 💰 Cost Per Audit

- Anthropic API: ~$0.15-0.30
- Firecrawl: ~5-10 credits
- Brandfetch: 1 request
- PageSpeed: Free

**Total**: ~$0.15-0.35 + Firecrawl credits
