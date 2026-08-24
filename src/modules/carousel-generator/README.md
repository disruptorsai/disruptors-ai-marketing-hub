# Instagram Carousel Generator

AI-powered Instagram carousel generator with intelligent image sourcing, editing, and composition. Analyzes successful carousels to determine optimal image strategies.

## Features

- **Intelligent Image Strategy**: AI analyzes successful Instagram carousels to decide whether each slide should be generated, downloaded, edited, or composed
- **Multi-Source Image Acquisition**: Downloads from Google Image Search, Unsplash, Pexels, or brand assets
- **Nano Banana Editing**: Uses Google Gemini 2.5 Flash Image to edit downloaded photos with natural language
- **Multi-Image Composition**: Combines multiple images into cohesive slides
- **Business Brain Integration**: Personalizes content with brand voice, industry context, and key facts
- **Simple & Advanced Modes**: Fully automatic or review strategy before generation
- **Multiple Export Formats**: Individual PNGs, ZIP archive, Canva-compatible JSON
- **Instagram Captions**: AI-generated captions and hashtags

## Quick Start

1. **Access the module** at `/app/carousel-generator`
2. **Enter carousel topic** (e.g., "5 AI Tools for Real Estate Agents")
3. **Select slide count** (3-10 slides)
4. **Choose style template** (Educational, Promotional, Storytelling, or Statistical)
5. **Click "Generate Carousel"** (Simple Mode) or "Generate Strategy" (Advanced Mode)
6. **Wait 2-3 minutes** while AI researches, strategizes, and generates
7. **Download exports** (ZIP, individual PNGs, Canva JSON)
8. **Copy Instagram caption** and post!

## How It Works

### Phase 1: Research & Strategy

1. Scrapes successful Instagram carousels in your industry using Firecrawl
2. Analyzes patterns (engagement, slide types, image strategies)
3. Claude Sonnet 4.5 generates outline with per-slide image strategies
4. Advanced Mode: User reviews and can modify strategy

### Phase 2: Image Acquisition

For each slide, AI's chosen strategy is executed:

- **GENERATE**: OpenAI gpt-image-1 creates image from scratch
- **DOWNLOAD**: Searches Google/Unsplash/Pexels and downloads best match
- **DOWNLOAD_MODIFY**: Downloads image + Nano Banana editing (color grade, text overlay, effects)
- **DOWNLOAD_COMBINE**: Downloads multiple images + Nano Banana composition

### Phase 3: Export & Delivery

- Uploads all slides to Supabase Storage
- Generates ZIP archive
- Creates Canva-compatible JSON
- Generates Instagram captions with hashtags

## Pricing

- **Base Cost**: $0.07 (research + strategy generation)
- **Generated Image**: $0.02-$0.19 per image
- **Downloaded Image**: $0.00
- **Nano Banana Edit/Compose**: $0.039 per operation
- **Typical Carousel**: $0.20-$0.30 for 5 slides

AI intelligently minimizes cost by preferring download+edit over generation when appropriate.

## Quotas

- **Internal Team**: Unlimited
- **Client Users**: 10 carousels per month
- **Public**: Not available (authentication required)

## Required Environment Variables

```bash
# AI Services
VITE_ANTHROPIC_API_KEY=sk-ant-...       # Claude Sonnet 4.5
VITE_GEMINI_API_KEY=...                 # Gemini Nano Banana
VITE_OPENAI_API_KEY=sk-proj-...         # gpt-image-1
VITE_FIRECRAWL_API_KEY=fc-...           # Instagram scraping

# Optional Image Sources
GOOGLE_CUSTOM_SEARCH_API_KEY=...
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=...
UNSPLASH_ACCESS_KEY=...
PEXELS_API_KEY=...
```

## Database Tables

- `carousel_generations` - Carousel records with slides, strategy, costs
- `carousel_research_cache` - Cached Instagram research (7-day refresh)
- `carousel-images` storage bucket - Generated slide images

## API Endpoint

**POST** `/.netlify/functions/module-carousel-generator`

### Actions

#### `generate_all` (Simple Mode)
```json
{
  "action": "generate_all",
  "topic": "5 AI Tools to Close More Real Estate Deals",
  "slide_count": 5,
  "style_template": "educational",
  "advanced_mode": false
}
```

#### `outline` (Advanced Mode - Step 1)
```json
{
  "action": "outline",
  "topic": "Why Your CRM is Costing You Money",
  "slide_count": 7,
  "style_template": "promotional"
}
```

#### `export` (Get ZIP/Canva JSON/Captions)
```json
{
  "action": "export",
  "carousel_id": "uuid-here"
}
```

## File Structure

```
src/modules/carousel-generator/
├── manifest.json                   # Module metadata
├── schema.js                       # Input/output schemas
├── CarouselGeneratorUI.jsx         # Main UI orchestrator
├── components/
│   ├── TopicInput.jsx             # Step 1: Topic input
│   ├── ProgressTracker.jsx        # Step 2: Generation progress
│   └── ExportOptions.jsx          # Step 3: Download options
└── README.md

netlify/functions/
├── module-carousel-generator.js    # Main handler
└── carousel-utils/
    ├── instagram-scraper.js        # Firecrawl integration
    ├── image-strategy-ai.js        # Claude strategy generation
    ├── image-downloader.js         # Google/Unsplash/Pexels
    ├── nano-banana-processor.js    # Gemini editing wrapper
    └── carousel-exporter.js        # ZIP/Canva JSON generation
```

## Examples

### Real Estate
**Topic**: "5 AI Tools to Close More Real Estate Deals"
**Strategy**: Slide 1 downloads realtor headshot + dramatic edit. Slides 2-5 mix UI screenshots composed with brand overlays.

### SaaS
**Topic**: "Why Your CRM is Costing You Money"
**Strategy**: Slide 1 generates abstract illustration. Slides 2-4 download competitor screenshots + edit. Slide 5 generates CTA visual.

### Coaching
**Topic**: "Transform Your Mindset in 30 Days"
**Strategy**: All slides download transformation photos + Nano Banana edits for text overlays and consistency.

## Troubleshooting

### "Generation Failed"
- Check all required API keys are set
- Verify Business Brain exists for authenticated user
- Check Netlify function logs
- Ensure Supabase storage bucket exists

### "Quota Exceeded"
- Check `carousel_generations` table for usage
- Internal users have unlimited access
- Clients limited to 10/month

### "No images found"
- At least one image source API must be configured
- Google Custom Search requires both API key and Search Engine ID
- Fallback chain: Google → Unsplash → Pexels

### Slow Generation
- Typical: 2-3 minutes for 5 slides
- Research: ~30 seconds
- Per-slide: ~20-40 seconds
- Nano Banana editing can be slow (retry helps)

## Future Enhancements

- **Instagram Scheduling**: Post directly to Instagram
- **A/B Testing**: Generate 2 versions, track performance
- **Template Library**: Save successful carousels as reusable templates
- **Video Slides**: Support video in carousel (Veo/Kling)
- **Multi-Platform**: LinkedIn, Twitter carousel support
- **Brand Assets Upload**: Custom logos, fonts, templates

## Support

For issues or questions:
1. Check Netlify function logs
2. Verify environment variables
3. Check database migration status
4. Review PRD at `src/modules/carousel-generator/PRD.md`

---

**Version**: 1.0.0
**Status**: Active
**Last Updated**: 2025-10-21
