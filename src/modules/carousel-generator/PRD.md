# Instagram Carousel Generator - Comprehensive PRD

**Project**: Intelligent Instagram Carousel Generator with AI Image Strategy
**Created**: 2025-10-21
**Status**: In Development
**Priority**: High
**Estimated Completion**: 3-5 days

---

## Executive Summary

Build a Business Brain-powered Instagram carousel generator module that **intelligently decides** for each slide whether to:
1. Generate images from scratch (OpenAI gpt-image-1)
2. Download existing images (Google Image Search, Unsplash, Pexels)
3. Download + Modify with Nano Banana (Google Gemini 2.5 Flash Image editing)
4. Download + Combine with Nano Banana (multi-image composition)

The AI analyzes successful Instagram carousels in the user's industry (scraped with Firecrawl) to determine optimal image strategies, resulting in professional carousels at ~$0.20-$0.30 cost (vs $2+ for manual design).

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [User Flows](#user-flows)
4. [Technical Implementation](#technical-implementation)
5. [Database Schema](#database-schema)
6. [API Integrations](#api-integrations)
7. [File Structure](#file-structure)
8. [Implementation Checklist](#implementation-checklist)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Plan](#deployment-plan)
11. [Success Metrics](#success-metrics)
12. [Known Constraints](#known-constraints)
13. [Future Enhancements](#future-enhancements)

---

## Project Overview

### Problem Statement

Current Instagram carousel creation requires:
- Manual image sourcing (stock photos, screenshots, custom designs)
- Expensive design tools (Canva Pro, Adobe)
- Time-consuming process (30-60 min per carousel)
- Inconsistent quality and brand alignment

### Solution

An AI-powered carousel generator that:
- **Researches** successful carousels in user's industry via Firecrawl
- **Analyzes** patterns to determine optimal image strategies
- **Intelligently sources** images (generate, download, edit, or compose)
- **Personalizes** content using Business Brain data
- **Exports** in multiple formats (PNG, ZIP, Canva JSON)

### Key Innovations

1. **Image Strategy AI**: Claude Sonnet 4.5 decides the best image sourcing method per slide based on research
2. **Hybrid Sourcing**: Mixes AI generation, web downloads, and Nano Banana editing for optimal quality/cost
3. **Instagram Research**: Scrapes real successful carousels for data-driven decisions
4. **Business Brain Integration**: Injects brand voice, industry context, and key facts automatically
5. **Two-Mode UX**: Simple (autopilot) and Advanced (strategy review) for different user types

---

## Architecture

### Three-Phase Flow

```
Phase 1: Research & Strategy (AI Decision Engine)
┌─────────────────────────────────────────────────────────────┐
│ Input: Topic, Business Brain, Style Template               │
│                                                             │
│ 1. Scrape successful IG carousels (Firecrawl)             │
│ 2. Analyze patterns (engagement, slide types)              │
│ 3. Claude Sonnet 4.5 generates outline + image strategies  │
│ 4. User reviews (Advanced) or auto-proceeds (Simple)       │
│                                                             │
│ Output: Carousel outline with per-slide strategies         │
└─────────────────────────────────────────────────────────────┘
                            ↓
Phase 2: Image Acquisition & Processing
┌─────────────────────────────────────────────────────────────┐
│ For each slide, execute AI's chosen strategy:              │
│                                                             │
│ • GENERATE: gpt-image-1 with text-in-image prompt         │
│ • DOWNLOAD: Google/Unsplash/Pexels API search             │
│ • DOWNLOAD_MODIFY: Download + Nano Banana geminiEdit()    │
│ • DOWNLOAD_COMBINE: Download multiple + geminiCompose()   │
│                                                             │
│ Real-time progress updates to frontend                     │
│                                                             │
│ Output: 3-10 carousel slides as PNG files                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
Phase 3: Export & Delivery
┌─────────────────────────────────────────────────────────────┐
│ • Upload all slides to Supabase Storage (carousel-images)  │
│ • Generate download options:                               │
│   - Individual PNGs                                         │
│   - ZIP archive                                            │
│   - Canva-compatible JSON                                  │
│ • Display in carousel preview UI                           │
│ • Track to carousel_generations table                      │
└─────────────────────────────────────────────────────────────┘
```

### System Components

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
│                                                              │
│  CarouselGeneratorUI.jsx                                    │
│  ├── TopicInput.jsx                                         │
│  ├── StrategyPreview.jsx (Advanced Mode)                   │
│  ├── ProgressTracker.jsx                                    │
│  └── ExportOptions.jsx                                      │
└──────────────────────────────────────────────────────────────┘
                            ↕ HTTP
┌──────────────────────────────────────────────────────────────┐
│              NETLIFY FUNCTION (Backend)                      │
│                                                              │
│  module-carousel-generator.js                               │
│  ├── Handles: outline, generate_slide, export              │
│  └── Orchestrates utility modules                           │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                   UTILITY MODULES                            │
│                                                              │
│  carousel-utils/                                            │
│  ├── instagram-scraper.js      → Firecrawl integration     │
│  ├── image-strategy-ai.js      → Claude decision engine     │
│  ├── image-downloader.js        → Google/Unsplash/Pexels    │
│  ├── nano-banana-processor.js  → Edit/Compose wrapper       │
│  └── carousel-exporter.js      → ZIP/Canva JSON             │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                           │
│                                                              │
│  • Claude Sonnet 4.5         → Strategy generation          │
│  • OpenAI gpt-image-1        → Image generation             │
│  • Gemini Nano Banana        → Image editing/compositing    │
│  • Firecrawl                 → Instagram scraping           │
│  • Google Image Search       → Image downloads              │
│  • Unsplash/Pexels           → Stock photo downloads        │
│  • Supabase                  → Database + Storage           │
└──────────────────────────────────────────────────────────────┘
```

---

## User Flows

### Simple Mode (Autopilot)

```
1. User Input
   └─ Topic: "5 AI tools for real estate agents"
   └─ Slide Count: 5
   └─ Style: Educational
   └─ Click "Generate Carousel"

2. Behind the Scenes (User sees loading spinner)
   └─ Scrape Instagram for "real estate AI tools" carousels
   └─ Claude analyzes and creates outline + strategy
   └─ Execute strategy for each slide:
       • Slide 1: Download realtor face + Nano Banana edit
       • Slide 2: Download CRM UI + brand template, compose
       • Slide 3: Generate AI concept illustration
       • Slide 4: Download analytics dashboard + modify
       • Slide 5: Download CTA template + modify

3. Result
   └─ User sees completed 5-slide carousel
   └─ Options: Download PNG, Download ZIP, Copy to Canva
```

### Advanced Mode (Power Users)

```
1. User Input (same as Simple Mode)

2. Strategy Preview Screen
   ┌────────────────────────────────────────────────────────┐
   │ Carousel Strategy - 5 Slides                           │
   │                                                        │
   │ Slide 1: Stop Losing Leads While You Sleep            │
   │ ├─ Strategy: Download + Modify                        │
   │ ├─ Download: "stressed realtor phone notifications"   │
   │ ├─ Modify: Dramatic color grade, overlay text         │
   │ └─ Cost: $0.039                                        │
   │    [Edit Strategy]                                     │
   │                                                        │
   │ Slide 2: AI Lead Response in 60 Seconds               │
   │ ├─ Strategy: Download + Combine                       │
   │ ├─ Download: "CRM mobile app UI clean"                │
   │ ├─ Download: Brand text overlay template              │
   │ ├─ Compose: Blend UI with branded overlay             │
   │ └─ Cost: $0.039                                        │
   │    [Edit Strategy]                                     │
   │                                                        │
   │ ... (Slides 3-5) ...                                   │
   │                                                        │
   │ Total Estimated Cost: $0.23                            │
   │                                                        │
   │ [Regenerate Strategy] [Edit Individual] [Proceed →]  │
   └────────────────────────────────────────────────────────┘

3. User Edits (Optional)
   └─ Click "Edit Strategy" on Slide 1
   └─ Change method to "Generate" instead
   └─ AI regenerates just that slide's strategy

4. Generation
   └─ Real-time progress tracker:
       ✓ Slide 1 complete (3.2s)
       ⏳ Slide 2 generating...
       ⏸️ Slide 3 pending
       ⏸️ Slide 4 pending
       ⏸️ Slide 5 pending

5. Result (same as Simple Mode)
```

---

## Technical Implementation

### Phase 1: Research & Strategy

**File**: `carousel-utils/instagram-scraper.js`

```javascript
// Scrape Instagram carousels
const research = await scrapeInstagramCarousels({
  industry: brain.industry,
  topic: userTopic,
  limit: 10
});

// Cache results
await supabase.from('carousel_research_cache').upsert({
  industry: brain.industry,
  carousel_examples: research.carousels,
  pattern_insights: research.analysis
});
```

**File**: `carousel-utils/image-strategy-ai.js`

```javascript
// Generate strategy with Claude
const strategy = await generateCarouselStrategy({
  topic: userTopic,
  slideCount: 5,
  styleTemplate: 'educational',
  brainContext: {
    business_name: brain.business_name,
    industry: brain.industry,
    brand_voice: brain.brand_voice,
    target_audience: brain.target_audience,
    key_facts: brain.facts
  },
  researchData: research
});

// Returns:
{
  slides: [
    {
      slide: 1,
      text: "Hook headline",
      image_description: "...",
      image_strategy: {
        method: "download_modify",
        reasoning: "Slide 1 with real faces performs 40% better...",
        sources: ["google_image_search:stressed realtor phone"],
        modifications: "Add dramatic color grade, overlay text",
        estimated_cost: 0.039
      }
    }
  ],
  total_estimated_cost: 0.23
}
```

### Phase 2: Image Acquisition

**File**: `carousel-utils/image-downloader.js`

```javascript
// Search and download images
const imageBuffer = await searchAndDownloadImage({
  query: "stressed realtor phone notifications night",
  source: "google_image_search", // or "unsplash", "pexels"
  filters: {
    size: "large",
    license: "commercial"
  }
});
```

**File**: `carousel-utils/nano-banana-processor.js`

```javascript
// Edit downloaded image
import { geminiEdit, geminiCompose } from '@/lib/gemini-image.js';

// Method 1: Edit single image
const editedBuffer = await geminiEdit({
  imagePath: tempPath,
  prompt: `Edit this image for Instagram carousel slide 1.

  Modifications: Add dramatic color grade, increase contrast, subtle vignette

  Add text overlay in bold modern font: "${slideText}"

  Style: Professional real estate, Instagram-ready, 1080x1080px`
});

// Method 2: Compose multiple images
const composedBuffer = await geminiCompose({
  imagePaths: [crm_ui_screenshot, brand_template],
  prompt: `Compose these images into Instagram carousel slide 2.

  Instructions: Blend UI screenshot with branded text overlay template

  Add text overlay: "${slideText}"

  Final style: Clean, professional, 1080x1080px`
});
```

**File**: `module-carousel-generator.js` (Main handler)

```javascript
// Execute slide generation
if (strategy.method === 'generate') {
  imageBuffer = await openai.images.generate({
    model: 'gpt-image-1',
    prompt: enhancedPrompt,
    size: '1024x1024'
  });
}
else if (strategy.method === 'download') {
  imageBuffer = await downloadImage(strategy.sources[0]);
}
else if (strategy.method === 'download_modify') {
  const sourceImage = await downloadImage(strategy.sources[0]);
  imageBuffer = await geminiEdit({
    imagePath: saveTemp(sourceImage),
    prompt: buildEditPrompt(slide, strategy)
  });
}
else if (strategy.method === 'download_combine') {
  const sourceImages = await Promise.all(
    strategy.sources.map(downloadImage)
  );
  imageBuffer = await geminiCompose({
    imagePaths: sourceImages.map(saveTemp),
    prompt: buildComposePrompt(slide, strategy)
  });
}

// Upload to storage
const { data } = await supabase.storage
  .from('carousel-images')
  .upload(`${userId}/${carouselId}/slide_${slide.slide}.png`, imageBuffer);
```

### Phase 3: Export

**File**: `carousel-utils/carousel-exporter.js`

```javascript
// Generate ZIP archive
export async function exportAsZip(slides, carouselId) {
  const zip = new JSZip();

  for (const slide of slides) {
    const imageBuffer = await downloadFromStorage(slide.image_url);
    zip.file(`slide_${slide.slide}.png`, imageBuffer);
  }

  return await zip.generateAsync({ type: 'nodebuffer' });
}

// Generate Canva JSON
export function exportAsCanvaJSON(slides) {
  return {
    version: '1.0',
    type: 'carousel',
    slides: slides.map(slide => ({
      id: slide.slide,
      image_url: slide.image_url,
      text: slide.text,
      dimensions: { width: 1080, height: 1080 }
    }))
  };
}
```

---

## Database Schema

### Table: `carousel_generations`

```sql
CREATE TABLE carousel_generations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  brain_id UUID REFERENCES business_brains(id),

  -- Inputs
  topic TEXT NOT NULL,
  slide_count INTEGER CHECK (slide_count >= 3 AND slide_count <= 10),
  style_template TEXT, -- 'educational', 'promotional', 'storytelling'
  advanced_mode BOOLEAN DEFAULT FALSE,

  -- Strategy
  strategy_json JSONB, -- Full AI-generated strategy
  research_examples JSONB, -- Instagram research data

  -- Results
  slides_json JSONB, -- Final slides with image URLs

  -- Status
  status TEXT, -- 'pending' | 'researching' | 'strategy_ready' | 'generating' | 'complete' | 'failed'
  error_message TEXT,

  -- Analytics
  total_cost NUMERIC(10, 4),
  generation_duration_ms INTEGER,
  user_approved_strategy BOOLEAN,
  regeneration_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

### Table: `carousel_research_cache`

```sql
CREATE TABLE carousel_research_cache (
  id UUID PRIMARY KEY,
  industry TEXT UNIQUE NOT NULL,
  topic_keywords TEXT[],

  carousel_examples JSONB, -- Scraped IG data
  average_engagement_rate NUMERIC(5, 4),
  top_performing_patterns TEXT[],
  data_quality_score NUMERIC(3, 2),

  last_updated TIMESTAMP DEFAULT NOW(),
  update_frequency_days INTEGER DEFAULT 7,
  scrape_count INTEGER DEFAULT 0
);
```

### Storage Bucket: `carousel-images`

```
carousel-images/
├── {user_id}/
│   ├── {carousel_id}/
│   │   ├── slide_1.png
│   │   ├── slide_2.png
│   │   ├── slide_3.png
│   │   ├── slide_4.png
│   │   └── slide_5.png
```

---

## API Integrations

### Required APIs

1. **Claude Sonnet 4.5** (`VITE_ANTHROPIC_API_KEY`)
   - Strategy generation
   - Cost: ~$0.05 per carousel

2. **OpenAI gpt-image-1** (`VITE_OPENAI_API_KEY`)
   - Image generation (when strategy = "generate")
   - Cost: $0.02-$0.19 per image

3. **Google Gemini Nano Banana** (`VITE_GEMINI_API_KEY`)
   - Image editing (`geminiEdit`)
   - Multi-image composition (`geminiCompose`)
   - Cost: $0.039 per operation

4. **Firecrawl** (`VITE_FIRECRAWL_API_KEY`)
   - Instagram carousel scraping
   - Cost: ~$0.01 per scrape

### Optional APIs

5. **Google Custom Search** (`GOOGLE_CUSTOM_SEARCH_API_KEY`, `GOOGLE_CUSTOM_SEARCH_ENGINE_ID`)
   - Image downloads
   - Free tier: 100 queries/day

6. **Unsplash** (`UNSPLASH_ACCESS_KEY`)
   - Stock photo downloads
   - Free tier: 50 requests/hour

7. **Pexels** (`PEXELS_API_KEY`)
   - Stock photo downloads
   - Free tier: 200 requests/hour

---

## File Structure

```
src/modules/carousel-generator/
├── manifest.json                   ✅ COMPLETE
├── PRD.md                          ✅ COMPLETE (this file)
├── schema.js                       ⏸️ TODO
├── CarouselGeneratorUI.jsx         ⏸️ TODO
├── components/
│   ├── TopicInput.jsx             ⏸️ TODO
│   ├── StrategyPreview.jsx        ⏸️ TODO
│   ├── ProgressTracker.jsx        ⏸️ TODO
│   ├── SlideEditor.jsx            ⏸️ TODO
│   └── ExportOptions.jsx          ⏸️ TODO
└── README.md                       ⏸️ TODO

netlify/functions/
├── module-carousel-generator.js    ⏸️ TODO (main handler)
└── carousel-utils/
    ├── instagram-scraper.js        ✅ COMPLETE
    ├── image-strategy-ai.js        ✅ COMPLETE
    ├── image-downloader.js         ⏸️ TODO
    ├── nano-banana-processor.js    ⏸️ TODO
    └── carousel-exporter.js        ⏸️ TODO

supabase/migrations/
└── 20251021_carousel_generator_infrastructure.sql  ✅ COMPLETE

src/lib/
└── gemini-image.js                 ✅ EXISTING (no changes needed)
```

---

## Implementation Checklist

### Phase 1: Foundation ✅
- [x] Create database schema migration
- [x] Create module manifest.json
- [x] Create Instagram scraper (Firecrawl)
- [x] Create image strategy AI (Claude)
- [x] Write comprehensive PRD

### Phase 2: Core Utilities ⏸️
- [ ] Create image downloader (Google/Unsplash/Pexels)
- [ ] Create Nano Banana processor wrapper
- [ ] Create carousel exporter (ZIP, Canva JSON)
- [ ] Create module schema.js

### Phase 3: Backend Function ⏸️
- [ ] Build main Netlify function handler
- [ ] Implement "outline" action (research + strategy)
- [ ] Implement "generate_slide" action (image acquisition)
- [ ] Implement "export" action (ZIP/JSON generation)
- [ ] Add error handling and retries
- [ ] Add quota tracking integration

### Phase 4: Frontend UI ⏸️
- [ ] Build TopicInput component
- [ ] Build StrategyPreview component (Advanced Mode)
- [ ] Build ProgressTracker component
- [ ] Build SlideEditor component (individual regeneration)
- [ ] Build ExportOptions component
- [ ] Wire up main CarouselGeneratorUI orchestrator
- [ ] Add loading states and error handling

### Phase 5: Integration ⏸️
- [ ] Add route to module system (`src/pages/index.jsx`)
- [ ] Add to module registry
- [ ] Test with real Business Brain data
- [ ] Verify quota tracking
- [ ] Test all export formats

### Phase 6: Polish & Deploy ⏸️
- [ ] Write module README.md
- [ ] Add telemetry tracking
- [ ] Performance optimization
- [ ] Error handling edge cases
- [ ] Deploy database migration
- [ ] Deploy to production

---

## Testing Strategy

### Unit Tests
- Instagram scraper pattern analysis
- Strategy validation logic
- Cost calculation accuracy
- Export format generation

### Integration Tests
- End-to-end carousel generation (Simple Mode)
- Strategy preview and modification (Advanced Mode)
- Image acquisition fallbacks (API failures)
- Storage upload and retrieval

### Manual QA Checklist
- [ ] Generate 3-slide carousel (Educational)
- [ ] Generate 10-slide carousel (Promotional)
- [ ] Test Simple Mode autopilot flow
- [ ] Test Advanced Mode strategy editing
- [ ] Regenerate individual slides
- [ ] Download PNG, ZIP, Canva JSON
- [ ] Test with different industries
- [ ] Test quota limits
- [ ] Test error states (API failures)
- [ ] Verify costs match estimates

---

## Deployment Plan

### Pre-Deployment
1. Apply database migration:
   ```bash
   # Connect to Supabase SQL Editor
   # Run: supabase/migrations/20251021_carousel_generator_infrastructure.sql
   ```

2. Verify environment variables:
   ```bash
   VITE_ANTHROPIC_API_KEY=sk-ant-...
   VITE_GEMINI_API_KEY=...
   VITE_OPENAI_API_KEY=sk-proj-...
   VITE_FIRECRAWL_API_KEY=fc-...
   GOOGLE_CUSTOM_SEARCH_API_KEY=... (optional)
   GOOGLE_CUSTOM_SEARCH_ENGINE_ID=... (optional)
   UNSPLASH_ACCESS_KEY=... (optional)
   PEXELS_API_KEY=... (optional)
   ```

3. Create storage bucket:
   ```sql
   -- Already in migration, but verify:
   SELECT * FROM storage.buckets WHERE id = 'carousel-images';
   ```

### Deployment Steps
1. Deploy backend functions:
   ```bash
   npm run build
   # Netlify auto-deploys functions
   ```

2. Test on dev site first:
   ```bash
   npm run deploy:dev
   # Test at https://dev.disruptorsmedia.com/app/carousel-generator
   ```

3. Monitor for errors:
   - Check Netlify function logs
   - Monitor Supabase dashboard
   - Track costs in OpenAI/Anthropic dashboards

4. Deploy to production:
   ```bash
   npm run deploy:prod
   ```

---

## Success Metrics

### Performance Metrics
- **Generation Time**: < 3 minutes for 5-slide carousel
- **Strategy Accuracy**: > 80% user approval rate in Advanced Mode
- **Cost per Carousel**: $0.20-$0.30 average
- **Error Rate**: < 5% failed generations

### Business Metrics
- **Monthly Active Users**: Track module usage
- **Quota Utilization**: Client vs Internal usage
- **Regeneration Rate**: < 20% (indicates good strategy quality)
- **Export Format Preference**: PNG vs ZIP vs Canva

### Quality Metrics
- **User Satisfaction**: Post-generation survey (1-5 stars)
- **Time Saved**: Compare to manual creation (30-60 min → 3 min)
- **Brand Consistency**: Review generated content for brand alignment

---

## Known Constraints

### Technical Limitations
1. **Instagram Scraping**: Firecrawl may hit rate limits or blocks
   - Mitigation: Implement caching (7-day refresh)
   - Fallback: Use mock research data

2. **Image Quality**: Downloaded images may not be perfect
   - Mitigation: Use high-quality search filters
   - Fallback: Allow user to re-roll specific slides

3. **Nano Banana Consistency**: Editing results can vary
   - Mitigation: Provide specific, detailed prompts
   - Fallback: Retry with adjusted prompts

4. **Cost Variability**: User modifications can increase costs
   - Mitigation: Show cost preview in Advanced Mode
   - Hard limit: $1.00 max per carousel

### Business Constraints
1. **Quota Limits**: 10/month for clients
   - Monitor usage closely
   - Add upgrade prompts

2. **API Costs**: Variable based on image strategies
   - Track costs per user
   - Implement budget alerts

---

## Future Enhancements

### Phase 2 Features
1. **Instagram Scheduling Integration**: Post directly to Instagram
2. **A/B Testing**: Generate 2 versions, track performance
3. **Template Library**: Save successful carousels as templates
4. **Collaborative Editing**: Multi-user carousel creation
5. **Video Slides**: Support video in carousel (Veo/Kling integration)
6. **Multi-Platform**: LinkedIn, Twitter carousel support

### Advanced Features
1. **Brand Asset Upload**: Let users upload logos, templates
2. **Custom Fonts**: Use brand fonts in text overlays
3. **Animation**: Add subtle motion to static slides
4. **Analytics Dashboard**: Track carousel performance after posting
5. **AI Captions**: Generate Instagram captions for carousels

---

## Migration Instructions for New Session

If this session fails and you need to resume in a new session:

### Context to Provide
1. **Show this file**: `src/modules/carousel-generator/PRD.md`
2. **Highlight completed files**:
   - `supabase/migrations/20251021_carousel_generator_infrastructure.sql`
   - `src/modules/carousel-generator/manifest.json`
   - `netlify/functions/carousel-utils/instagram-scraper.js`
   - `netlify/functions/carousel-utils/image-strategy-ai.js`

3. **Next steps** (refer to Implementation Checklist Phase 2):
   - Create `image-downloader.js`
   - Create `nano-banana-processor.js`
   - Create `carousel-exporter.js`
   - Build main Netlify function

### Key Context Points
- **Existing integrations**: Nano Banana code already exists in `src/lib/gemini-image.js`
- **Firecrawl setup**: Already used elsewhere in project
- **Business Brain**: Existing table `business_brains` with `brain_facts`
- **Module system**: Follow patterns from `keyword-research` and `ai-content-writer` modules

### Command to Resume
```
"Continue building the Instagram Carousel Generator module.

Completed so far:
- Database schema (migration file exists)
- Module manifest
- Instagram scraper utility
- Image strategy AI utility

Next: Build image-downloader.js utility for Google/Unsplash/Pexels image search and download. Reference the existing gemini-image.js for Nano Banana integration patterns."
```

---

## Questions & Clarifications

### Resolved
✅ What is "nano banana"? → Google Gemini 2.5 Flash Image (image editing/composition)
✅ Research source? → Firecrawl scraping + cached fallback
✅ Image sources priority? → Google Image Search (primary), Unsplash/Pexels (secondary), brand assets (tertiary)
✅ Strategy UI? → Advanced Mode toggle (show strategy preview)

### Open Questions
- Should we cache image search results to avoid re-downloading?
- Maximum carousel generation retries before giving up?
- Should we watermark generated carousels with "Powered by Disruptors AI"?

---

## Appendix

### Example Strategy Output (Claude)

```json
{
  "slides": [
    {
      "slide": 1,
      "text": "Stop Losing Leads While You Sleep",
      "image_description": "Stressed real estate agent looking at phone with notification flood at night",
      "image_strategy": {
        "method": "download_modify",
        "reasoning": "Research shows 80% of top-performing carousels use real faces in slide 1 for emotional connection. Download authentic realtor photo and enhance with dramatic editing.",
        "sources": ["google_image_search:stressed real estate agent phone notifications night professional"],
        "modifications": "Add cinematic color grade (cool blue tones), increase contrast by 30%, add subtle vignette, overlay bold white text with semi-transparent dark background for readability",
        "estimated_cost": 0.039
      }
    },
    {
      "slide": 2,
      "text": "AI Lead Response in 60 Seconds\n\nAutomate instant follow-ups when prospects fill out contact forms. AI can qualify leads and book appointments while you focus on closings.",
      "image_description": "Modern CRM mobile app interface showing automated chat response",
      "image_strategy": {
        "method": "download_combine",
        "reasoning": "Need to show specific functionality. Download clean CRM UI screenshot and compose with brand text template for professional, trust-building visual.",
        "sources": [
          "google_image_search:CRM mobile app interface clean professional",
          "brand_assets:text_overlay_template"
        ],
        "modifications": "Composite CRM screenshot as background (60% opacity), overlay brand text template in foreground, ensure headline and paragraph are clearly readable, add subtle drop shadow for depth",
        "estimated_cost": 0.039
      }
    }
  ],
  "total_estimated_cost": 0.23,
  "strategy_confidence": "high",
  "key_decisions": [
    "Slide 1 uses real face based on 80% of top carousels in real estate",
    "Text overlays on all slides per 85% industry standard",
    "Download+modify approach balances authenticity with brand consistency",
    "Estimated 40% higher engagement vs pure AI-generated images"
  ]
}
```

### Example Nano Banana Edit Prompt

```
Edit this image for Instagram carousel slide 1.

Original image context: Professional real estate agent looking stressed at phone with notifications

Target transformation:
- Add cinematic color grade (cool blue tones for nighttime feel)
- Increase contrast by 30% for dramatic effect
- Add subtle vignette (darken edges)
- Add text overlay in bold sans-serif font:

  Headline (72pt, white, heavy): "Stop Losing Leads While You Sleep"

- Place text in upper-left to middle-left area
- Add semi-transparent dark overlay behind text (20% black) for readability
- Ensure high contrast between text and background

Brand context:
- Business: Disruptors AI
- Industry: Real Estate
- Voice: Professional, urgent, results-focused
- Target: Real estate agents using AI

Output: Polished Instagram carousel slide 1, 1080x1080px, ready to post
```

---

**End of PRD**

*Last Updated: 2025-10-21*
*Status: In Development*
*Next Review: After Phase 2 completion*
