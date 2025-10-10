# Growth Audit Module

## Overview

AI-powered instant growth audit that analyzes websites and identifies 8-15 prioritized opportunities across 10 categories. Includes business profile extraction, service package mapping, and 30/60/90 day execution plans.

## Module Configuration

- **ID**: `growth-audit`
- **Category**: `analytics`
- **Status**: `approved`
- **Version**: `1.0.0`

## Runtime Details

- **Audience**: `internal`, `public` (no client tier in v1.0)
- **Requires Brain**: `false` (can work without Business Brain)
- **Requires Auth**: `false` (public lead generation tool)
- **Runtime Preference**: `node-heavy` (long execution, external APIs)
- **Supports Streaming**: `true` (SSE for real-time updates)
- **Estimated Duration**: 60 seconds (30-90s range)
- **Max Duration**: 120 seconds

## Quotas & Pricing

- **Daily Limit**: 5 audits (public), unlimited (internal)
- **Monthly Limit**: 50 audits
- **Cost Per Run**: $0.25 (higher than content writer due to complexity)

## Input Schema

```javascript
{
  website_url: string (required, URL validation),
  business_name: string (optional),
  industry: string (optional),
  email: string (optional, for sending report),
  create_brain: boolean (optional, offer to auto-create Business Brain),
  business_type: 'B2B' | 'B2C' (optional),
  primary_goal: 'Leads' | 'Sales' | 'Bookings' (optional)
}
```

## Output Schema

```javascript
{
  job_id: UUID,
  status: 'queued' | 'crawling' | 'enriching' | 'analyzing' | 'ready' | 'error',
  progress: 0-100,
  business_profile: {
    brand: { name, tagline, logoUrl, palette, fonts, toneKeywords },
    offerings: { products, services, pricingNotes },
    icp: string[],
    locations: string[],
    social: { links[], summaries },
    tech: { cms, framework, analytics, hosting }
  },
  opportunities: [
    {
      id, category, title, whyItMatters,
      impactBand: { conservative, likely, aggressive },
      effort: 'low' | 'med' | 'high',
      confidence: 0-1,
      steps: string[],
      evidence: [{ url, note }],
      affectedUrls: string[]
    }
  ],
  service_packages: {
    packages: [{ name, monthlyRangeUsd, lineItems }],
    plan30_60_90: [{ day, milestones, risks, requiredInputs }]
  },
  execution_time_seconds: number,
  data_sources: ['firecrawl', 'playwright', 'brandfetch', 'vibrant', 'pagespeed', 'claude'],
  readiness_score: 0-100,
  sales_copy: { elevatorPitch, benefitLines, emailBody }
}
```

## 10 Opportunity Categories

1. **SEO** - Schema markup, meta tags, internal linking
2. **Content** - Blog posts, FAQs, value propositions
3. **Performance** - Image optimization, render-blocking, Core Web Vitals
4. **CRO** - CTAs, forms, trust signals
5. **Local** - Google Business Profile, NAP consistency
6. **Social** - Profile activity, cross-linking, posting cadence
7. **Paid** - Pixel tracking, conversion setup, landing pages
8. **EmailCRM** - Lead magnets, automation, capture points
9. **DataTracking** - GA4, GTM, event tracking
10. **AI** - Chatbots, workflow automation, repetitive task optimization

## Configuration Options

```javascript
{
  include_pagespeed: boolean (default: true),
  include_brandfetch: boolean (default: true),
  max_opportunities: number (8-20, default: 15),
  package_recommendations: boolean (default: true),
  generate_sales_copy: boolean (default: true),
  crawl_depth: number (1-10, default: 3),
  timeout_seconds: number (30-120, default: 60),
  enable_streaming: boolean (default: true),
  fallback_to_playwright: boolean (default: true),
  send_email_report: boolean (default: false)
}
```

## Helper Functions

### Category Helpers
- `isValidCategory(category)` - Validate category string
- `getCategoryDisplayName(category)` - Get human-readable name
- `getCategoryColor(category)` - Get color code for UI badges

### Opportunity Analysis
- `calculatePriorityScore(opportunity)` - Calculate impact/effort priority
- `sortOpportunitiesByPriority(opportunities)` - Sort by priority score
- `filterByCategory(opportunities, categories)` - Filter by category list

### Package Recommendation
- `getRecommendedPackage(opportunities, budget)` - Auto-recommend Starter/Core/Scale

### Effort Display
- `getEffortDisplay(effort)` - Get label and color for effort level

## Data Sources

The Growth Audit integrates with multiple external APIs:

1. **Firecrawl** - Website crawling (primary, with Playwright fallback)
2. **Playwright** - DOM scraping and metadata extraction
3. **Brandfetch** - Brand detection (with Vibrant fallback for color extraction)
4. **PageSpeed Insights** - Performance analysis and Core Web Vitals
5. **Claude Sonnet 4.5** - AI analysis for business profile and opportunities

## Multi-Function Architecture

Unlike other modules, Growth Audit uses a multi-function serverless architecture:

- `growth-audit-ingest.js` - Job creation and URL validation
- `growth-audit-stream.js` - Orchestration and results streaming
- `shared/job-storage.js` - In-memory job state management

## WordPress Integration

- **Shortcode**: `[disruptors_growth_audit]`
- **Block**: `disruptors/growth-audit`
- **Embed Type**: `iframe`

## Files

- `manifest.json` (359 lines) - Complete 43-field module definition
- `schema.js` (381 lines) - Zod validation schemas + 13 helper functions
- `README.md` - This file

## Next Steps

Phase 2.3 continues with:
1. Create `index.jsx` - Module orchestrator
2. Create `GrowthAuditUI.jsx` - React component
3. Create Netlify function endpoint
4. Update routing and integration
5. Test all three access levels

## Notes

- This is a **public lead generation tool** - no authentication required
- Higher cost ($0.25) reflects multi-API integration and AI analysis
- Longer execution time (60s avg) due to external API calls
- Streaming support provides real-time progress updates
- Can optionally create Business Brain from audit results
