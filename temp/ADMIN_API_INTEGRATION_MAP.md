# Admin Nexus - API Integration Map

**Date**: 2025-10-26
**Purpose**: Complete mapping of all API endpoints, Netlify functions, and integration points

---

## API Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Nexus Frontend                      │
│                   (React SPA - Port 8888)                     │
└─────────────────┬───────────────────────────┬─────────────────┘
                  │                           │
                  │                           │
        ┌─────────▼────────┐        ┌────────▼─────────┐
        │  Netlify         │        │  Supabase        │
        │  Functions       │        │  Database        │
        │  (20 endpoints)  │        │  (Direct queries)│
        └──────┬───────────┘        └────────┬─────────┘
               │                             │
               │                             │
        ┌──────▼──────────────────────────────▼──────┐
        │         External APIs                      │
        │  - DataForSEO                              │
        │  - Anthropic Claude                        │
        │  - OpenAI (gpt-image-1)                    │
        │  - Firecrawl                               │
        │  - BrandFetch                              │
        └────────────────────────────────────────────┘
```

---

## Netlify Functions Inventory

### Category: AI Content Generation

#### 1. module-ai-content-writer.js ✅
**Path**: `netlify/functions/module-ai-content-writer.js`
**Status**: ✅ Active
**Used By**: Blog Management module
**Method**: POST
**Purpose**: AI-powered blog content generation

**Request Body**:
```json
{
  "contentType": "blog_post",
  "topic": "AI Marketing",
  "keywords": ["ai", "marketing", "automation"],
  "tone": "professional",
  "length": "long"
}
```

**Response**:
```json
{
  "success": true,
  "content": {
    "title": "...",
    "content": "...",
    "excerpt": "...",
    "seo_title": "...",
    "seo_description": "..."
  },
  "usage": {
    "tokens": 2500,
    "cost": 0.025
  }
}
```

**External APIs**:
- Anthropic Claude Sonnet 4.5

**Database Tables**:
- Writes to `posts`
- Logs usage in `telemetry_events`

---

#### 2. admin-image-generator.js ✅
**Path**: `netlify/functions/admin-image-generator.js`
**Status**: ✅ Active
**Used By**: Media Library, Blog Management
**Method**: POST
**Purpose**: Generate AI images for blog posts and media

**Request Body**:
```json
{
  "prompt": "Modern AI marketing office",
  "style": "photorealistic",
  "dimensions": "1536x1024"
}
```

**Response**:
```json
{
  "success": true,
  "imageUrl": "https://...",
  "metadata": {
    "model": "gpt-image-1",
    "prompt": "...",
    "cost": 0.08
  }
}
```

**External APIs**:
- OpenAI gpt-image-1 (NOT DALL-E)

**Database Tables**:
- Writes to `site_media`
- Logs generation in `telemetry_events`

---

### Category: SEO & Keyword Research

#### 3. dataforseo-keywords.js ✅
**Path**: `netlify/functions/dataforseo-keywords.js`
**Status**: ✅ Active
**Used By**: SEO Suite, Blog Management
**Method**: POST
**Purpose**: Keyword research via DataForSEO

**Request Body**:
```json
{
  "keyword": "ai marketing",
  "location": "United States",
  "language": "en"
}
```

**Response**:
```json
{
  "success": true,
  "keywords": [
    {
      "keyword": "ai marketing tools",
      "search_volume": 5400,
      "competition": 0.67,
      "cpc": 4.50
    }
  ],
  "relatedKeywords": [...],
  "questions": [...]
}
```

**External APIs**:
- DataForSEO

**Database Tables**:
- Can write to `seo_keywords`

---

#### 4. seo-audit-analyzer.js ✅
**Path**: `netlify/functions/seo-audit-analyzer.js`
**Status**: ✅ Active
**Used By**: SEO Audit Tool
**Method**: POST
**Purpose**: Comprehensive SEO audit of a URL

**Request Body**:
```json
{
  "url": "https://example.com",
  "depth": "full"
}
```

**Response**:
```json
{
  "success": true,
  "audit": {
    "score": 85,
    "issues": [...],
    "recommendations": [...],
    "technical": {...},
    "content": {...},
    "backlinks": {...}
  }
}
```

**External APIs**:
- DataForSEO
- PageSpeed Insights
- Custom crawlers

**Database Tables**:
- Writes to `seo_audits`
- Writes to `seo_issues`

---

#### 5. seo-audit-stream.js ✅
**Path**: `netlify/functions/seo-audit-stream.js`
**Status**: ✅ Active
**Used By**: SEO Audit Tool
**Method**: GET (SSE)
**Purpose**: Streaming SEO audit with real-time updates

**Query Params**:
- `url`: Target URL
- `sessionId`: Audit session ID

**Response**: Server-Sent Events stream
```
event: progress
data: {"step": "crawling", "progress": 25}

event: issue
data: {"severity": "high", "message": "Missing meta description"}

event: complete
data: {"score": 85, "issues": 12}
```

**External APIs**:
- Same as seo-audit-analyzer

**Database Tables**:
- Same as seo-audit-analyzer

---

### Category: Growth & Marketing Audits

#### 6. module-growth-audit.js ✅
**Path**: `netlify/functions/module-growth-audit.js`
**Status**: ✅ Active
**Used By**: Growth Audit module (public-facing)
**Method**: POST
**Purpose**: Comprehensive growth audit

**Request Body**:
```json
{
  "website": "https://example.com",
  "email": "user@example.com",
  "industry": "SaaS"
}
```

**Response**:
```json
{
  "success": true,
  "audit": {
    "overall_score": 72,
    "categories": {
      "seo": {...},
      "content": {...},
      "technical": {...},
      "marketing": {...}
    },
    "recommendations": [...]
  }
}
```

**External APIs**:
- DataForSEO
- Firecrawl
- PageSpeed Insights
- BrandFetch

**Database Tables**:
- Writes audit results
- Logs in `telemetry_events`

---

#### 7. growth-audit-stream.js ✅
**Path**: `netlify/functions/growth-audit-stream.js`
**Status**: ✅ Active
**Used By**: Growth Audit module
**Method**: GET (SSE)
**Purpose**: Streaming growth audit

Similar to seo-audit-stream but for full growth audits.

---

#### 8. growth-audit-ingest.js ⚠️
**Path**: `netlify/functions/growth-audit-ingest.js`
**Status**: ⚠️ Uncertain
**Used By**: Growth Audit module
**Method**: POST
**Purpose**: Ingest audit data for processing

Needs verification of current status.

---

#### 9. marketing-audit-analyze.js ✅
**Path**: `netlify/functions/marketing-audit-analyze.js`
**Status**: ✅ Active
**Used By**: Marketing audit feature
**Method**: POST
**Purpose**: Marketing-specific analysis

**Request Body**:
```json
{
  "website": "https://example.com",
  "focusAreas": ["content", "social", "email"]
}
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "content_strategy": {...},
    "social_presence": {...},
    "email_marketing": {...},
    "recommendations": [...]
  }
}
```

**External APIs**:
- Various marketing data sources

---

### Category: Event Management

#### 10. checkin-confirm.js ⚠️
**Path**: `netlify/functions/checkin-confirm.js`
**Status**: ⚠️ Uncertain
**Used By**: Event check-in system
**Method**: POST
**Purpose**: Confirm event check-in

**Request Body**:
```json
{
  "email": "attendee@example.com",
  "eventId": "event-123"
}
```

Needs verification and testing.

---

### Category: Integrations

#### 11. ghl-calendar-booking.js ⚠️
**Path**: `netlify/functions/ghl-calendar-booking.js`
**Status**: ⚠️ Uncertain
**Used By**: GoHighLevel integration
**Method**: POST
**Purpose**: Calendar booking integration

Needs verification of current usage.

---

### Category: Utilities (Carousel)

#### 12-17. Carousel Utilities ⚠️
**Paths**:
- `netlify/functions/carousel-utils/image-downloader.js`
- `netlify/functions/carousel-utils/image-strategy-ai.js`
- `netlify/functions/carousel-utils/carousel-exporter.js`
- `netlify/functions/carousel-utils/nano-banana-processor.js`
- `netlify/functions/carousel-utils/instagram-scraper.js`

**Status**: ⚠️ Uncertain - May be legacy
**Purpose**: Social media carousel generation

Needs review for current relevance.

---

### Category: SEO Audit Utilities

#### 18-20. SEO Audit Helpers ✅
**Paths**:
- `netlify/functions/seo-audit/report-generator.js`
- `netlify/functions/seo-audit/analyzer.js`
- `netlify/functions/seo-audit/scraper.js`
- `netlify/functions/seo-audit/dataforseo.js`

**Status**: ✅ Active
**Used By**: SEO Audit Tool
**Purpose**: Supporting utilities for SEO audits

---

## Missing API Endpoints

### HIGH Priority (Blocking Module Functionality)

#### Business Brain API
**Status**: 🔴 Missing or incomplete
**Required By**: Business Brain Builder module
**Endpoints Needed**:
- `POST /api/business-brain/create` - Create new brain
- `GET /api/business-brain/:id` - Get brain details
- `PUT /api/business-brain/:id` - Update brain
- `DELETE /api/business-brain/:id` - Delete brain
- `POST /api/business-brain/:id/facts` - Add facts
- `POST /api/business-brain/:id/onboard` - Run onboarding conversation
- `GET /api/business-brain/:id/generate` - Generate content with brain context

**Implementation Priority**: 🔥 CRITICAL

---

#### Team Permissions API
**Status**: 🔴 Missing
**Required By**: Team Management module
**Endpoints Needed**:
- `POST /api/team/roles` - Create/update roles
- `GET /api/team/:memberId/permissions` - Get permissions
- `PUT /api/team/:memberId/permissions` - Update permissions
- `GET /api/team/activity` - Get team activity logs

**Implementation Priority**: 🔥 HIGH

---

#### Media Optimization API
**Status**: 🔴 Missing
**Required By**: Media Library module
**Endpoints Needed**:
- `POST /api/media/optimize` - Optimize images
- `POST /api/media/bulk-upload` - Bulk upload
- `GET /api/media/usage/:id` - Get usage stats
- `POST /api/media/ai-tag` - AI-powered tagging

**Implementation Priority**: 🟡 MEDIUM

---

### MEDIUM Priority (Stub Modules)

#### Brand DNA API
**Status**: 🔴 Not implemented
**Required By**: Brand DNA Builder (stub)
**Endpoints Needed**:
- `POST /api/brand/profile` - Create brand profile
- `GET /api/brand/profile/:id` - Get profile
- `PUT /api/brand/profile/:id` - Update profile
- `POST /api/brand/guidelines` - Save guidelines
- `POST /api/brand/assets` - Upload brand assets

**Implementation Priority**: 🟡 MEDIUM

---

#### Agent Builder API
**Status**: 🔴 Not implemented
**Required By**: Agent Builder, Agent Chat (stubs)
**Endpoints Needed**:
- `POST /api/agents/create` - Create AI agent
- `POST /api/agents/:id/train` - Train agent
- `POST /api/agents/:id/chat` - Chat with agent (SSE)
- `GET /api/agents/:id/conversations` - Get conversation history
- `POST /api/agents/:id/deploy` - Deploy agent

**Implementation Priority**: 🟡 MEDIUM

---

#### Workflow Engine API
**Status**: 🔴 Not implemented
**Required By**: Workflow Manager (stub)
**Endpoints Needed**:
- `POST /api/workflows/create` - Create workflow
- `POST /api/workflows/:id/execute` - Execute workflow
- `GET /api/workflows/:id/history` - Get execution history
- `POST /api/workflows/:id/triggers` - Configure triggers

**Implementation Priority**: 🟢 LOW

---

#### Integration Management API
**Status**: 🔴 Not implemented
**Required By**: Integrations Hub (stub)
**Endpoints Needed**:
- `POST /api/integrations/connect` - Connect integration
- `GET /api/integrations` - List integrations
- `POST /api/integrations/:id/webhook` - Configure webhook
- `GET /api/integrations/:id/status` - Check status

**Implementation Priority**: 🟢 LOW

---

## Direct Supabase Integration

### Custom SDK Usage
**File**: `src/lib/custom-sdk.js`
**Purpose**: Base44-compatible API over Supabase
**Used By**: Data Manager, most CRUD operations

**Entities Available**:
- Post
- TeamMember
- Service
- CaseStudy
- Testimonial
- ContactSubmission
- Lead
- LeadInteraction
- Setting
- Media
- Profile
- PageView

**Methods**:
- `entity.list(orderBy, limit)` - Get records
- `entity.get(id)` - Get single record
- `entity.create(data)` - Create record
- `entity.update(id, data)` - Update record
- `entity.delete(id)` - Delete record

---

### Supabase Admin Client
**File**: `src/lib/supabase-client.js`
**Export**: `supabaseAdmin`
**Purpose**: Service role access for admin operations
**Used By**: All admin modules needing elevated permissions

**Key Features**:
- Bypasses Row Level Security (RLS)
- Full database access
- Used for admin dashboards
- Audit logging capabilities

---

## External API Dependencies

### 1. Anthropic Claude API ✅
**Service**: Claude Sonnet 4.5
**Used By**: AI Content Writer, AutoBlog
**API Key**: `VITE_ANTHROPIC_API_KEY`
**Status**: ✅ Configured
**Monthly Cost**: Variable (pay-per-token)
**Rate Limits**: Check current usage

---

### 2. OpenAI API ✅
**Service**: gpt-image-1 ONLY (NOT DALL-E)
**Used By**: Image generator
**API Key**: `VITE_OPENAI_API_KEY`
**Status**: ✅ Configured
**Monthly Cost**: ~$0.08 per image
**Rate Limits**: Standard tier

**CRITICAL**: Runtime validation blocks DALL-E models

---

### 3. DataForSEO API ✅
**Service**: Keyword research, SEO data
**Used By**: SEO Suite, keyword research
**Credentials**:
- `DATAFORSEO_LOGIN`
- `DATAFORSEO_PASSWORD`
**Status**: ✅ Configured
**Monthly Cost**: Based on usage
**Rate Limits**: Check account

---

### 4. Firecrawl API ✅
**Service**: Web scraping
**Used By**: Growth Audit
**API Key**: `VITE_FIRECRAWL_API_KEY`
**Status**: ✅ Configured
**Monthly Cost**: Variable
**Rate Limits**: Check plan

---

### 5. Google Gemini API ⚠️
**Service**: gemini-2.5-flash-image-preview
**Used By**: Alternative image generation
**API Key**: `VITE_GEMINI_API_KEY`
**Status**: ⚠️ Configured but uncertain usage
**Monthly Cost**: Free tier available

---

### 6. BrandFetch API ⚠️
**Service**: Brand assets and info
**Used By**: Growth Audit
**API Key**: `VITE_BRANDFETCH_API_KEY`
**Status**: ⚠️ Optional
**Monthly Cost**: Free tier available

---

### 7. PageSpeed Insights API ⚠️
**Service**: Performance metrics
**Used By**: SEO Audit, Growth Audit
**API Key**: `VITE_PAGESPEED_API_KEY`
**Status**: ⚠️ Optional (can work without)
**Monthly Cost**: Free with limits

---

## API Testing Strategy

### Automated Tests Needed:
- [ ] Netlify function health checks
- [ ] External API connectivity tests
- [ ] Database query performance tests
- [ ] Rate limit monitoring
- [ ] Error handling verification

### Manual Testing Checklist:
- [ ] Test each Netlify function individually
- [ ] Verify external API keys valid
- [ ] Check database permissions
- [ ] Test error scenarios
- [ ] Verify rate limiting works

---

## Performance Considerations

### Current Issues:
- No caching on API responses
- Repeated expensive queries
- No request deduplication
- No loading state management

### Recommended Improvements:
1. **Implement React Query**
   - Cache API responses
   - Automatic refetching
   - Loading/error states
   - Request deduplication

2. **Add API Gateway Layer**
   - Rate limiting
   - Request logging
   - Response caching
   - Error tracking

3. **Database Query Optimization**
   - Add indexes on frequently queried columns
   - Implement pagination
   - Use materialized views for complex queries

---

## Security Considerations

### Current Security:
✅ Service role for admin operations
✅ API keys in environment variables
✅ HTTPS for all requests
✅ Row Level Security on Supabase

### Improvements Needed:
- [ ] Add request rate limiting
- [ ] Implement API key rotation
- [ ] Add request signing
- [ ] Implement audit logging for all API calls
- [ ] Add IP whitelisting for admin endpoints

---

## Monitoring & Observability

### Current Status:
⚠️ Limited monitoring
⚠️ Basic error logging
❌ No performance tracking
❌ No cost monitoring

### Recommendations:
1. **Add Sentry or similar** - Error tracking
2. **Implement custom telemetry** - Track API usage
3. **Monitor external API costs** - Alert on budget exceeded
4. **Track performance metrics** - API response times
5. **Log all admin actions** - Audit trail

---

## Next Steps

### Immediate (Week 1):
1. [ ] Verify all existing endpoints functional
2. [ ] Test external API connectivity
3. [ ] Document any broken endpoints
4. [ ] Create API health check dashboard

### Short-term (Week 2-4):
1. [ ] Implement missing Business Brain API
2. [ ] Complete Team Permissions API
3. [ ] Add Media Optimization API
4. [ ] Improve error handling

### Medium-term (1-2 months):
1. [ ] Implement stub module APIs
2. [ ] Add caching layer
3. [ ] Improve monitoring
4. [ ] Add comprehensive testing

---

**Last Updated**: 2025-10-26
**Next Review**: After endpoint verification
