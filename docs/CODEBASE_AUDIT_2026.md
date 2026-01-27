# Codebase Audit Report - January 2026

> **Audit Date:** 2026-01-26
> **Branch:** v6 (cleanup branch)
> **Purpose:** Identify unused code for removal, prepare for developer handoff

---

## Executive Summary

This audit identified significant amounts of dead code accumulated over the project's development. The codebase has grown organically with features that were partially implemented, deprecated, or superseded by newer systems.

### Key Findings

| Category | Count | Action Taken |
|----------|-------|--------------|
| Unused page files | 6 | Removed (conservative) |
| Unused Netlify functions | 10 | Removed |
| Demo/test routes | 11 | Kept (may be useful) |
| Dev variant pages | 6 | Kept (for comparison) |
| Unorganized scripts | 150+ | Reorganized |

---

## 1. Dead Code Removed (Conservative Cleanup)

### 1.1 Unused Page Files (Deleted)

These files existed but were **never routed** in `src/pages/index.jsx`:

| File | Reason for Removal |
|------|-------------------|
| `src/pages/blog-detail-OLD-BACKUP.jsx` | Old backup file, superseded by `blog-detail.jsx` |
| `src/pages/resources-old.jsx` | Deprecated placeholder page |
| `src/pages/brain-setup.jsx` | Never integrated into routing |
| `src/pages/lead-magnet-gated.jsx` | Lead magnet system not completed |
| `src/pages/lead-magnet-landing.jsx` | Lead magnet system not completed |
| `src/pages/work-simple.jsx` | Unused variant of work page |

### 1.2 Unused Netlify Functions (Deleted)

These functions existed but were **never called** from the frontend:

| Function | Purpose | Why Unused |
|----------|---------|------------|
| `admin-blog-scheduler.js` | Blog scheduling | Feature not implemented |
| `ai-match.js` | AI matching | Feature abandoned |
| `blog-create-draft.js` | Create blog drafts | Moved to admin panel |
| `blog-generate-ideas.js` | Generate blog ideas | Moved to admin panel |
| `blog-publish.js` | Publish blogs | Moved to admin panel |
| `blog-publish-gated.js` | Gated blog publishing | Feature abandoned |
| `blog-run-qa.js` | Blog QA checking | Moved to admin panel |
| `blog-run-qa-enhanced.js` | Enhanced QA | Moved to admin panel |
| `screenshot-capture.js` | Screenshot capture | Replaced by scripts |
| `seo-audit-analyzer.js` | SEO analysis | Replaced by growth-audit |

---

## 2. Code Kept (May Remove Later)

### 2.1 Demo Routes (11 routes)

These are development/testing pages that may be useful for demos:

```
/animations-demo
/video-scrub-demo
/text-glitch-demo
/demos (index)
/demos/hero-focus
/demos/benefits-driven
/demos/social-proof
/demos/interactive
/demos/conversion
/demos/best-of-all
/demos/growth-audit
/demos/keyword-research
/demos/ai-content-writer
```

**Recommendation:** Keep for now. Consider removing if not used for client demos.

### 2.2 Dev Variant Pages (6 pages)

These appear to be A/B testing or comparison versions:

```
/Home-dev
/about-dev
/solutions-dev
/work-dev
/resources-dev
/contact-dev
```

**Recommendation:** Keep for now. Remove after confirming no active A/B tests.

### 2.3 ConnectQR Kiosk System (7 routes)

Event check-in system at `/connectqr1/*`:

```
/connectqr1 (welcome)
/connectqr1/checkin
/connectqr1/poll
/connectqr1/success
/connectqr1/scan
/connectqr1/itinerary
/connectqr1/results
```

**Recommendation:** Keep if events are still planned. Consider archiving if no events scheduled.

### 2.4 Hidden Utility Pages (2 routes)

Internal tools:

```
/graveyard-archive - Archives removed content
/screenshot-manager - Screenshot capture tool
```

**Recommendation:** Keep for internal use.

---

## 3. Scripts Organization

Scripts were reorganized from 150+ files in root into logical directories:

### 3.1 New Script Structure

```
scripts/
├── active/                 # Currently used scripts
│   ├── deployment/         # Deployment and health checks
│   ├── database/          # Database utilities
│   ├── mcp/               # MCP management
│   └── changelog/         # Release management
├── archived/              # Old migration scripts (kept for reference)
│   ├── migrations/        # One-time database migrations
│   └── analysis/          # Historical analysis scripts
└── README.md              # Script documentation
```

### 3.2 Active Scripts (Referenced in package.json)

These scripts are actively used and documented:

| Script | npm Command | Purpose |
|--------|-------------|---------|
| `auto-commit.js` | `npm run dev:auto` | Development auto-commit |
| `changelog-manager.js` | `npm run changelog:*` | Release management |
| `check-telemetry-status.js` | `npm run telemetry:status` | Dashboard monitoring |
| `deployment-orchestrator.js` | `npm run deploy:*` | Deployment management |
| `mcp-toggle.js` | `npm run mcp:*` | MCP server management |

---

## 4. Netlify Functions Inventory

### 4.1 Active Functions (25 functions)

These are called by the frontend and should be maintained:

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `admin-blog-generator.js` | POST | Generate blog content |
| `admin-image-generator.js` | POST | Generate images |
| `ai-wizard-populate.js` | POST | AI wizard data |
| `blog-humanize.js` | POST | Humanize AI text |
| `change-request-analyze.js` | POST | Analyze change requests |
| `change-request-automation-analysis.js` | POST | Automation analysis |
| `checkin-confirm.js` | POST | Event check-in |
| `competitor-monitor.js` | POST | Monitor competitors |
| `dataforseo-keywords.js` | POST | Keyword research |
| `ghl-calendar-booking.js` | POST | GoHighLevel booking |
| `growth-audit-ingest.js` | POST | Start growth audit |
| `growth-audit-stream.js` | GET | Stream audit results |
| `lead-access.js` | POST | Lead magnet access |
| `lead-capture.js` | POST | Capture leads |
| `marketing-audit-analyze.js` | POST | Marketing analysis |
| `module-ai-content-writer.js` | POST | Content writer module |
| `module-carousel-generator.js` | POST | Carousel generator |
| `module-growth-audit.js` | POST | Growth audit module |
| `module-keyword-research.js` | POST | Keyword research module |
| `poll-results.js` | GET | Poll results |
| `poll-submit.js` | POST | Submit poll |
| `seo-audit-get.js` | GET | Get SEO audit |
| `seo-audit-stream.js` | GET | Stream SEO audit |
| `seo-generate-landing-page.js` | POST | Generate landing page |
| `session-status.js` | GET | Session status |

### 4.2 Helper Directories

```
netlify/functions/
├── carousel-utils/        # Carousel generation helpers
├── seo-audit/            # SEO audit helpers
└── shared/               # Shared utilities
```

---

## 5. Page Inventory

### 5.1 Core Marketing Pages (14 pages)

```
/ (Home)
/about
/solutions
/work
/contact
/pricing
/faq
/gallery
/podcast
/privacy
/terms
/ai-tools (replaces /resources)
/free-resources
/book-strategy-session
```

### 5.2 Solutions Pages (9 pages)

```
/solutions-ai-automation
/solutions-social-media
/solutions-seo-geo
/solutions-lead-generation
/solutions-paid-advertising
/solutions-podcasting
/solutions-custom-apps
/solutions-crm-management
/solutions-fractional-cmo
```

### 5.3 Work/Case Study Pages (10 pages)

```
/work-saas-content-engine
/work-tradeworx-usa
/work-timber-view-financial
/work-the-wellness-way
/work-sound-corrections
/work-segpro
/work-neuro-mastery
/work-muscle-works
/work-granite-paving
/work-auto-trim-utah
```

### 5.4 App/Tool Pages (6 pages - protected)

```
/business-brain-manager (also /app/business-brain)
/ai-content-writer (also /app/content-writer)
/keyword-research (also /app/keyword-research)
/carousel-generator (also /app/carousel-generator)
/tools-seo-audit
/tools
```

### 5.5 Blog System (3 pages)

```
/blog
/blog-detail
/blog-new
```

### 5.6 Other (5 pages)

```
/assessment
/calculator
/marketing-audit
/event-checkin
/auth/callback
/resources-ai-suitcase-terms-decoded
```

---

## 6. Future Cleanup Recommendations

### Phase 2 (Moderate Cleanup)

1. **Remove demo routes** if not used for client presentations
2. **Remove dev variant pages** after confirming no A/B tests
3. **Archive ConnectQR system** if no events planned

### Phase 3 (Aggressive Cleanup)

1. **Consolidate duplicate components** (TextScramble vs ScrambleText)
2. **Remove historical documentation** from docs/examples/
3. **Archive old migration scripts** to separate repo

---

## 7. Documentation Updates

The following documentation was updated as part of this audit:

1. `CLAUDE.md` - Updated for v6 branch
2. `docs/NEW_DEVELOPER_GUIDE.md` - Created for onboarding
3. `scripts/README.md` - Script organization guide
4. `docs/architecture/FILE_ORGANIZATION.md` - Updated structure

---

## Appendix A: Files Removed

```
# Pages (6 files)
src/pages/blog-detail-OLD-BACKUP.jsx
src/pages/resources-old.jsx
src/pages/brain-setup.jsx
src/pages/lead-magnet-gated.jsx
src/pages/lead-magnet-landing.jsx
src/pages/work-simple.jsx

# Netlify Functions (10 files)
netlify/functions/admin-blog-scheduler.js
netlify/functions/ai-match.js
netlify/functions/blog-create-draft.js
netlify/functions/blog-generate-ideas.js
netlify/functions/blog-publish.js
netlify/functions/blog-publish-gated.js
netlify/functions/blog-run-qa.js
netlify/functions/blog-run-qa-enhanced.js
netlify/functions/screenshot-capture.js
netlify/functions/seo-audit-analyzer.js
```

---

## Appendix B: Bundle Impact

Estimated savings from conservative cleanup:

| Category | Before | After | Savings |
|----------|--------|-------|---------|
| Page files | 68 | 62 | ~30 KB |
| Netlify functions | 35 | 25 | ~52 KB (server) |
| Total source | ~95 KLOC | ~90 KLOC | ~5% |

*Note: Netlify functions don't affect client bundle size.*

---

*Audit performed by Claude Code on 2026-01-26*
*Branch: v6*
