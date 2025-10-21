# Instagram Carousel Generator - Development Progress

**Last Updated**: 2025-10-21
**Status**: Phase 2 Complete - Ready for Backend Function & Frontend

---

## ✅ Completed (Phase 1 & 2)

### Phase 1: Foundation
- ✅ **Database Schema** (`supabase/migrations/20251021_carousel_generator_infrastructure.sql`)
  - `carousel_generations` table with full JSONB strategy tracking
  - `carousel_research_cache` table for Instagram pattern analysis
  - `carousel-images` storage bucket with RLS policies
  - Helper functions for quota tracking and carousel completion

- ✅ **Module Manifest** (`src/modules/carousel-generator/manifest.json`)
  - Quota limits: 10/month clients, unlimited internal
  - Access levels configured (internal/client/public)
  - API requirements documented
  - Pricing structure defined (~$0.20-$0.30 per carousel)

- ✅ **Comprehensive PRD** (`src/modules/carousel-generator/PRD.md`)
  - Complete architecture documentation
  - User flows (Simple & Advanced modes)
  - Technical implementation guide
  - Testing strategy
  - Deployment plan
  - Migration instructions for new sessions

### Phase 2: Core Utilities

- ✅ **Instagram Scraper** (`netlify/functions/carousel-utils/instagram-scraper.js`)
  - Firecrawl integration for carousel research
  - Pattern analysis (slide types, engagement rates)
  - Caching system with quality scoring
  - Fallback mock data
  - **Key Features**:
    - Scrapes top Instagram accounts by industry
    - Analyzes 10+ successful carousels
    - Identifies winning patterns (e.g., "80% use real faces in slide 1")
    - Caches results for 7 days

- ✅ **Image Strategy AI** (`netlify/functions/carousel-utils/image-strategy-ai.js`)
  - Claude Sonnet 4.5 decision engine
  - Determines optimal image strategy per slide:
    - `generate`: AI generation from scratch
    - `download`: Download existing image
    - `download_modify`: Download + Nano Banana edit
    - `download_combine`: Download multiple + Nano Banana compose
  - Cost estimation per slide
  - Strategy regeneration for individual slides
  - Fallback strategy generation
  - **Key Features**:
    - Research-informed decisions
    - Detailed reasoning explanations
    - Exact search queries for downloads
    - Nano Banana modification instructions

- ✅ **Image Downloader** (`netlify/functions/carousel-utils/image-downloader.js`)
  - Multi-source image acquisition:
    - Google Custom Search API (primary)
    - Unsplash API (high-quality stock)
    - Pexels API (alternative stock)
    - Brand assets (placeholder for future)
  - Automatic fallback chain
  - Image validation (size, format)
  - Parallel download support
  - **Key Features**:
    - Commercial license filtering
    - Size/quality preferences
    - Metadata fetching
    - Retry logic with exponential backoff

- ✅ **Nano Banana Processor** (`netlify/functions/carousel-utils/nano-banana-processor.js`)
  - Wrapper for `src/lib/gemini-image.js` (existing)
  - Single image editing with carousel-specific prompts
  - Multi-image composition
  - Temp file management
  - Retry logic (Nano Banana can be inconsistent)
  - Batch processing with concurrency control
  - **Key Features**:
    - Instagram-optimized prompts (1080x1080px)
    - Text overlay formatting (headline + body)
    - Brand context injection
    - Automatic cleanup of temp files

- ✅ **Carousel Exporter** (`netlify/functions/carousel-utils/carousel-exporter.js`)
  - ZIP archive generation
  - Canva-compatible JSON export
  - Instagram caption suggestions
  - Hashtag generation by industry
  - Shareable link creation
  - **Key Features**:
    - Complete export package with all formats
    - Auto-generated captions with CTAs
    - Metadata files
    - Size estimation

---

## ⏸️ Next Steps (Phase 3: Backend Function)

### Main Netlify Function
**File**: `netlify/functions/module-carousel-generator.js`

**Needs to handle 3 actions**:

1. **`outline` action**:
   - Receive: topic, slideCount, styleTemplate, userId
   - Fetch Business Brain context
   - Run Instagram research (or use cache)
   - Generate strategy with Claude
   - Return: Strategy JSON for user preview (Advanced Mode) or auto-proceed (Simple Mode)

2. **`generate_slide` action**:
   - Receive: slide data, strategy, brainContext
   - Execute strategy:
     - If `generate`: Call gpt-image-1
     - If `download`: Call image-downloader
     - If `download_modify`: Download + Nano Banana edit
     - If `download_combine`: Download multiple + Nano Banana compose
   - Upload to Supabase Storage
   - Return: Image URL + metadata

3. **`export` action**:
   - Receive: carouselId
   - Fetch carousel from database
   - Generate exports (ZIP, Canva JSON, captions)
   - Return: Export package

**Key Integration Points**:
```javascript
import { scrapeInstagramCarousels, getCachedOrFreshResearch } from './carousel-utils/instagram-scraper.js';
import { generateCarouselStrategy, regenerateSlideStrategy } from './carousel-utils/image-strategy-ai.js';
import { searchAndDownloadImage, downloadMultipleImages } from './carousel-utils/image-downloader.js';
import { processCarouselImage, processWithRetry } from './carousel-utils/nano-banana-processor.js';
import { exportCompletePackage } from './carousel-utils/carousel-exporter.js';
import { supabaseAdmin } from './shared/supabase-client.js';
import OpenAI from 'openai';
```

---

## ⏸️ Remaining Work (Phase 4-6)

### Phase 4: Frontend Components
- [ ] `TopicInput.jsx` - Topic, slide count, style selector
- [ ] `StrategyPreview.jsx` - Advanced Mode strategy review UI
- [ ] `ProgressTracker.jsx` - Real-time slide generation progress
- [ ] `SlideEditor.jsx` - Individual slide regeneration
- [ ] `ExportOptions.jsx` - Download buttons (PNG, ZIP, Canva)
- [ ] `CarouselGeneratorUI.jsx` - Main orchestrator component

### Phase 5: Integration
- [ ] Add route to module system
- [ ] Wire up quota tracking
- [ ] Test with real Business Brain data
- [ ] End-to-end testing

### Phase 6: Polish & Deploy
- [ ] Module README.md
- [ ] Telemetry tracking
- [ ] Error handling edge cases
- [ ] Deploy database migration
- [ ] Deploy to production

---

## File Structure Status

```
✅ = Complete | ⏸️ = TODO

src/modules/carousel-generator/
├── manifest.json                          ✅
├── PRD.md                                 ✅
├── PROGRESS.md                            ✅ (this file)
├── schema.js                              ⏸️
├── CarouselGeneratorUI.jsx                ⏸️
├── components/
│   ├── TopicInput.jsx                    ⏸️
│   ├── StrategyPreview.jsx               ⏸️
│   ├── ProgressTracker.jsx               ⏸️
│   ├── SlideEditor.jsx                   ⏸️
│   └── ExportOptions.jsx                 ⏸️
└── README.md                              ⏸️

netlify/functions/
├── module-carousel-generator.js           ⏸️ (NEXT!)
└── carousel-utils/
    ├── instagram-scraper.js               ✅
    ├── image-strategy-ai.js               ✅
    ├── image-downloader.js                ✅
    ├── nano-banana-processor.js           ✅
    └── carousel-exporter.js               ✅

supabase/migrations/
└── 20251021_carousel_generator_infrastructure.sql  ✅
```

---

## How to Resume in New Session

If this session ends, start a new session with:

```
"Continue building the Instagram Carousel Generator module for Disruptors AI Marketing Hub.

Progress so far (read these files):
1. src/modules/carousel-generator/PRD.md (full specification)
2. src/modules/carousel-generator/PROGRESS.md (current status)

Completed:
✅ Database schema + storage
✅ Module manifest
✅ All 5 utility modules (scraper, strategy AI, downloader, Nano Banana, exporter)

Next task:
Build the main Netlify function handler (module-carousel-generator.js) that orchestrates all utilities.

Reference the PRD Section 'Technical Implementation' for integration patterns."
```

---

## Key Design Decisions Made

### 1. **Hybrid Image Sourcing Strategy**
   - Don't just generate everything with AI
   - Mix real photos (downloaded) with AI edits for authenticity
   - Research-driven decisions based on actual Instagram performance

### 2. **Two-Mode UX**
   - **Simple Mode**: Fully automated (no user input after topic)
   - **Advanced Mode**: Preview strategy before expensive image generation
   - Reduces regeneration costs by letting users approve strategy first

### 3. **Fallback Chains**
   - Instagram scraper → Cache → Mock data
   - Google Images → Unsplash → Pexels
   - Strategy generation → Fallback strategy
   - Prevents total failures, always produces output

### 4. **Cost Optimization**
   - Nano Banana edits ($0.039) often cheaper than full generation ($0.02-$0.19)
   - Download + edit approach balances quality and cost
   - Preview costs in Advanced Mode before generation

### 5. **Nano Banana Retry Logic**
   - Nano Banana can be inconsistent
   - Automatic retry (up to 2 attempts)
   - Detailed prompts improve consistency

---

## API Key Requirements

**Required** (module won't work without these):
- `VITE_ANTHROPIC_API_KEY` - Claude Sonnet 4.5 strategy generation
- `VITE_GEMINI_API_KEY` - Nano Banana image editing/composition
- `VITE_OPENAI_API_KEY` - gpt-image-1 generation (when strategy = "generate")
- `VITE_FIRECRAWL_API_KEY` - Instagram carousel scraping

**Optional** (fallbacks exist):
- `GOOGLE_CUSTOM_SEARCH_API_KEY` + `GOOGLE_CUSTOM_SEARCH_ENGINE_ID`
- `UNSPLASH_ACCESS_KEY`
- `PEXELS_API_KEY`

---

## Expected Cost per Carousel

**5-Slide Educational Carousel** (typical):
- Research + Strategy: $0.07 (Claude)
- Slide 1 (download_modify): $0.039 (Nano Banana)
- Slide 2 (download_combine): $0.039 (Nano Banana)
- Slide 3 (generate): $0.02 (gpt-image-1)
- Slide 4 (download_modify): $0.039 (Nano Banana)
- Slide 5 (download): $0.00 (free stock photo)

**Total: ~$0.21**

Compare to:
- Manual design in Canva Pro: $2-5 (30-60 min time)
- Freelancer on Fiverr: $15-50
- Design agency: $100-500

---

## Testing Checklist (for Phase 5)

- [ ] Simple Mode: Generate 5-slide educational carousel
- [ ] Advanced Mode: Review and modify strategy
- [ ] Test all 4 image strategies:
  - [ ] `generate` - AI-generated image
  - [ ] `download` - Stock photo only
  - [ ] `download_modify` - Stock + Nano Banana edit
  - [ ] `download_combine` - Multiple images composed
- [ ] Regenerate individual slide
- [ ] Export as ZIP
- [ ] Export as Canva JSON
- [ ] Verify Instagram captions
- [ ] Test quota limits (10/month for clients)
- [ ] Test with different industries
- [ ] Test error handling (API failures)

---

## Known Limitations & Mitigation

1. **Instagram Scraping Rate Limits**
   - Mitigation: 7-day cache, fallback mock data
   - Future: Build research database over time

2. **Image Download Quality Variance**
   - Mitigation: Try multiple sources, validate before processing
   - Future: User can re-roll individual slides

3. **Nano Banana Inconsistency**
   - Mitigation: Retry logic (2 attempts), very detailed prompts
   - Future: Add quality scoring, auto-retry on low scores

4. **Cost Unpredictability**
   - Mitigation: Show cost preview in Advanced Mode
   - Hard limit: $1.00 max per carousel

---

## Performance Targets

- **Generation Time**: < 3 minutes for 5-slide carousel
  - Research: 10-15 seconds (or instant from cache)
  - Strategy: 5-10 seconds (Claude)
  - Per-slide generation: 20-30 seconds average
  - Export: 5 seconds

- **Success Rate**: > 95% successful generations
  - With fallbacks, should rarely fail completely

- **User Approval Rate**: > 80% in Advanced Mode
  - Indicates AI strategy quality

---

**End of Progress Report**

*Ready to build the main Netlify function handler!*
