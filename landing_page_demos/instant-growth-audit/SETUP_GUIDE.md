# 📖 Instant Growth Audit - Setup Guide

## 🎯 What You've Built

A **production-ready AI-powered growth audit tool** that:

1. **Accepts any business URL** → Validates and normalizes input
2. **Crawls & scrapes website** → Firecrawl + Playwright fallback
3. **Detects brand identity** → Logo, colors, typography from Brandfetch or images
4. **Runs performance audits** → PageSpeed Insights + Core Web Vitals
5. **AI analyzes business** → Claude Sonnet 4 extracts profile, offerings, ICP
6. **Identifies opportunities** → 8-15 growth gaps with impact/effort scoring
7. **Maps to services** → Starter/Core/Scale packages with 30/60/90 plans
8. **Streams results live** → SSE-powered real-time UI updates

## 🏗️ Architecture Summary

### **Frontend** (Next.js 15 + React 19)
- `/` - Landing page with URL input
- `/scan/[id]` - Live scanning interface with SSE
- Real-time streaming updates via EventSource

### **API Routes**
- `POST /api/ingest` - Creates job, returns jobId
- `GET /api/stream?jobId=...` - SSE stream with live updates

### **AI Layer** (4 Specialized Agents)
1. **Business Analyzer** - Extracts company profile
2. **Opportunity Detector** - Identifies growth gaps
3. **Service Mapper** - Creates execution plans
4. **Copy Stylist** - Generates sales content

### **Scraping Pipeline**
1. **Firecrawl** (Primary) - Fast, handles JS
2. **Playwright** (Fallback) - For complex sites
3. **Brandfetch** - Brand assets
4. **PageSpeed Insights** - Performance data

## ⚙️ Installation Steps

### 1. Install Dependencies

```bash
cd landing_page_demos/instant-growth-audit
npm install
```

**Note**: You may need to add `@types/uuid` for TypeScript:
```bash
npm install --save-dev @types/uuid
```

### 2. Get API Keys

#### **Required:**

**Anthropic Claude** (AI Analysis)
- Sign up: https://console.anthropic.com/
- Go to API Keys
- Create new key → Copy `ANTHROPIC_API_KEY`

**Firecrawl** (Web Scraping)
- Sign up: https://firecrawl.dev/
- Get API key from dashboard
- Copy `FIRECRAWL_API_KEY`

#### **Recommended:**

**Brandfetch** (Brand Detection)
- Sign up: https://brandfetch.com/
- Get API key
- Without this, falls back to image color extraction

**Google PageSpeed Insights** (Performance)
- Go to: https://developers.google.com/speed/docs/insights/v5/get-started
- Enable API → Create credentials
- Copy `PAGESPEED_API_KEY`

#### **Optional:**

**OpenAI** (Alternative AI)
- https://platform.openai.com/api-keys
- Can use GPT-4 instead of Claude

### 3. Configure Environment

Create `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-api03-xxx
FIRECRAWL_API_KEY=fc-xxx

# Recommended
BRANDFETCH_API_KEY=xxx
PAGESPEED_API_KEY=AIzaSyxxx

# Optional
OPENAI_API_KEY=sk-xxx
BRAVE_SEARCH_API_KEY=xxx
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## 🧪 Testing

### Test the Landing Page
1. Enter a URL (e.g., `shopify.com`)
2. Click "Scan My Business"
3. Should redirect to `/scan/[jobId]`

### Test the Scanning Flow
1. Should see live progress updates:
   - "Crawling website..."
   - "Detecting brand..."
   - "Running performance audit..."
   - "AI analyzing business profile..."
   - "Identifying growth opportunities..."
2. Results appear after ~30 seconds

### Expected Output
- **Brand Identity**: Name, logo, color palette
- **Growth Opportunities**: 8-15 items with:
  - Title, description
  - Impact/effort scores
  - Confidence rating
  - Evidence URLs

## 🐛 Troubleshooting

### Issue: "Failed to start audit"
**Solution**: Check API keys in `.env.local`

### Issue: "Connection lost" during scan
**Solution**:
- Check Firecrawl API key
- Verify URL is accessible
- Try a different URL

### Issue: TypeScript errors
**Solution**:
```bash
npm install --save-dev @types/uuid @types/culori
```

### Issue: No brand colors detected
**Solution**:
- Add `BRANDFETCH_API_KEY`
- Or: App will extract from images (slower)

### Issue: No opportunities found
**Solution**:
- Check `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
- Verify AI credits/quota

## 📦 Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard

### Environment Variables in Vercel
1. Go to Project Settings → Environment Variables
2. Add all keys from `.env.local`
3. Redeploy

## 🎨 Customization

### Change Primary Color
Edit `tailwind.config.ts`:
```ts
colors: {
  primary: '221.2 83.2% 53.3%', // Your HSL color
}
```

### Change AI Model
Edit `lib/ai/analyzer.ts`:
```ts
// Use GPT-4 instead of Claude
model: openai('gpt-4o')
```

### Adjust Scan Depth
Edit `lib/orchestrator.ts`:
```ts
const pages = await this.firecrawl.crawlSite(url, 20); // Increase from 10
```

## 🚀 Next Steps (Optional Enhancements)

### 1. Add Persistent Storage
- Set up Supabase for job storage
- Store results for later retrieval
- Add user accounts

### 2. Enhance UI
- Add Framer Motion animations
- Integrate Lenis smooth scroll
- Build plan composer (right rail)

### 3. Add Export Features
- PDF generation with Playwright
- Email delivery system
- Calendar integration (Calendly/Cal.com)

### 4. Advanced Features
- Opportunity filtering/sorting
- Package customization
- ROI calculator
- Competitor comparison

## 📊 Performance Benchmarks

**Target Metrics:**
- Time to First Wow: ≤5s (brand detection)
- Full Analysis: ≤30s
- Core Web Vitals: LCP <2.5s, INP <200ms, CLS <0.1

**Optimization Tips:**
- Enable Vercel Edge functions
- Add Redis for job caching
- Implement queue system (Inngest/Trigger.dev)

## 🔐 Security Checklist

- [x] URL validation on all inputs
- [ ] Rate limiting (TODO)
- [x] Respects robots.txt
- [x] No sensitive data storage
- [ ] API key rotation (recommended)
- [ ] CORS configuration (if needed)

## 📝 File Structure Reference

```
instant-growth-audit/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── scan/[id]/page.tsx         # Scanning interface
│   ├── api/
│   │   ├── ingest/route.ts        # Create job
│   │   └── stream/route.ts        # SSE stream
│   └── globals.css
├── components/ui/                  # UI components
├── lib/
│   ├── types.ts                   # All TypeScript types
│   ├── utils.ts                   # Utilities
│   ├── orchestrator.ts            # Main coordinator
│   ├── ai/                        # AI agents
│   ├── scrapers/                  # Web scraping
│   └── audits/                    # Performance checks
├── .env.local                     # Your API keys
└── README.md
```

## 🆘 Support

For issues:
1. Check console logs in browser
2. Check terminal logs for API errors
3. Verify all API keys are valid
4. Test with known-good URLs (shopify.com, stripe.com)

## ✅ Launch Checklist

Before showing to clients:

- [ ] All API keys configured
- [ ] Tested with 5+ different websites
- [ ] Landing page loads quickly
- [ ] SSE streaming works smoothly
- [ ] Results display correctly
- [ ] Error states handled gracefully
- [ ] Mobile responsive
- [ ] Deployed to production URL

---

**You're ready to launch!** 🎉

Run `npm run dev` and test with real URLs. The app will analyze any business and provide actionable insights in ~30 seconds.
