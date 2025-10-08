# Growth Audit Environment Variables

This document lists all environment variables required for the Growth Audit feature to function properly.

## Required Environment Variables

### AI Services

#### Anthropic (Required)
```bash
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
```
- **Used for**: Business profile analysis, opportunity detection, service mapping, and sales copy generation
- **Model**: Claude Sonnet 4.5 (`claude-sonnet-4-20250514`)
- **Critical**: YES - The entire audit system depends on this

### Scraping Services

#### Firecrawl (Optional but Recommended)
```bash
VITE_FIRECRAWL_API_KEY=your_firecrawl_api_key
```
- **Used for**: Website crawling and content extraction
- **Fallback**: Playwright scraper if not available
- **Get API Key**: https://firecrawl.dev

#### Brandfetch (Optional)
```bash
VITE_BRANDFETCH_API_KEY=your_brandfetch_api_key
```
- **Used for**: Brand logo and color palette detection
- **Fallback**: Image color extraction with node-vibrant
- **Get API Key**: https://brandfetch.com

### Performance Auditing

#### Google PageSpeed Insights (Optional)
```bash
VITE_PAGESPEED_API_KEY=your_google_pagespeed_api_key
```
- **Used for**: Performance scores and Core Web Vitals
- **Fallback**: API works without key (rate limited)
- **Get API Key**: Google Cloud Console

## Environment File Setup

Create a `.env` file in your project root:

```bash
# AI Services (REQUIRED)
VITE_ANTHROPIC_API_KEY=sk-ant-xxx...

# Scraping Services (OPTIONAL)
VITE_FIRECRAWL_API_KEY=fc-xxx...
VITE_BRANDFETCH_API_KEY=bf-xxx...

# Performance Auditing (OPTIONAL)
VITE_PAGESPEED_API_KEY=AIza...
```

## Fallback Behavior

The Growth Audit system is designed with graceful degradation:

1. **No Firecrawl API**: Falls back to Playwright scraper (slower, but works)
2. **No Brandfetch API**: Falls back to Vibrant color extraction from images
3. **No PageSpeed API**: Uses rate-limited public API (may fail under heavy load)
4. **No Anthropic API**: System will fail - this is the only critical dependency

## Deployment

### Netlify

Add environment variables in Netlify dashboard:

```bash
netlify env:set VITE_ANTHROPIC_API_KEY "sk-ant-xxx..."
netlify env:set VITE_FIRECRAWL_API_KEY "fc-xxx..."
# ... etc
```

Or use the Netlify UI:
1. Go to Site Settings → Environment Variables
2. Add each variable with `VITE_` prefix
3. Deploy to apply changes

### Local Development

1. Copy `.env.example` to `.env`
2. Fill in your API keys
3. Restart dev server

## Security Notes

- All API keys should be kept secret and never committed to git
- The `VITE_` prefix exposes these to the client bundle - use Netlify Functions for sensitive operations
- Service role keys should NEVER be prefixed with `VITE_`

## Testing Configuration

To verify your configuration:

```bash
# Check if environment variables are loaded
npm run dev

# In browser console:
console.log(import.meta.env.VITE_ANTHROPIC_API_KEY ? 'Anthropic ✓' : 'Anthropic ✗')
console.log(import.meta.env.VITE_FIRECRAWL_API_KEY ? 'Firecrawl ✓' : 'Firecrawl ✗')
```

## API Rate Limits

- **Anthropic**: 50 requests/minute (Tier 1), 1,000/minute (Tier 2+)
- **Firecrawl**: Varies by plan (500 credits/month free tier)
- **Brandfetch**: 100 requests/month free tier
- **PageSpeed**: 25,000 requests/day free tier

## Cost Estimates

Per audit run:
- **Anthropic**: ~$0.15-0.30 (profile analysis + opportunities + mapping)
- **Firecrawl**: ~5-10 credits (depends on site size)
- **Brandfetch**: 1 request
- **PageSpeed**: Free

**Total per audit**: ~$0.15-0.35 + Firecrawl credits
