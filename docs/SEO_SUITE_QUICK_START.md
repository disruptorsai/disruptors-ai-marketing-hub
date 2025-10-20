# SEO Suite - Quick Start Guide

**Get from zero to generating landing pages in 10 minutes**

---

## ⚡ Prerequisites

- [ ] Admin Nexus access (click logo 5x or `Ctrl+Shift+D`)
- [ ] DataForSEO account and API credentials
- [ ] Database migration applied
- [ ] Business Brain created (optional but recommended)

---

## 🚀 3-Step Setup

### Step 1: Database Migration (2 minutes)

**Option A: Automated Script**
```bash
# Set environment variables
export VITE_SUPABASE_URL="your_supabase_url"
export VITE_SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Run migration script
node scripts/apply-seo-suite-migration.js
```

**Option B: Manual via Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase/migrations/20251016_seo_suite_infrastructure.sql`
3. Copy all contents
4. Paste into SQL Editor
5. Click "Run"

**Verify Migration:**
```sql
SELECT COUNT(*) FROM landing_page_templates;
-- Should return 3 (default templates)
```

### Step 2: Configure API Credentials (1 minute)

Add to `.env` file:
```env
# DataForSEO API (required)
DATAFORSEO_LOGIN=your_email@example.com
DATAFORSEO_PASSWORD=your_dataforseo_password

# Already configured (verify these exist)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_ANTHROPIC_API_KEY=your_anthropic_key
```

**Get DataForSEO Credentials:**
1. Sign up: https://app.dataforseo.com/register
2. Verify email
3. Dashboard → API Access
4. Note your login (email) and password

### Step 3: Access SEO Suite (1 minute)

1. Start dev server: `npm run dev:netlify`
2. Open browser to `http://localhost:8888`
3. Access Admin Nexus:
   - Click logo 5 times quickly, OR
   - Press `Ctrl+Shift+D`
4. Login with admin credentials
5. Click "SEO Suite" in navigation (Target icon 🎯)

**You're ready!** 🎉

---

## 📖 Usage Guide

### Workflow 1: Discover Keywords (5 minutes)

1. **Research Tab** → Click **NEW_RESEARCH**

2. **Enter seed keyword:**
   ```
   Example: "ai marketing automation"
   ```

3. **Configure discovery:**
   - Location: United States
   - Language: English
   - Methods:
     - ✅ Keyword Suggestions (comprehensive)
     - ✅ Related Keywords (semantic)
     - ☑️ Question Keywords (optional)
   - Filters:
     - Min Volume: 100
     - Max Difficulty: 60
     - Exclude: "free|cheap|scam"

4. **Click DISCOVER_KEYWORDS**
   - Wait 10-30 seconds
   - Typically finds 200-500 keywords

5. **Review results:**
   - Sort by opportunity score (auto-sorted)
   - Click **SELECT HIGH PRIORITY** for quick selection
   - Or manually select specific keywords

6. **Click SAVE_X_KEYWORDS**
   - Keywords saved to database
   - Available for landing page generation

**What You Get:**
- 50-100 high-opportunity keywords
- Opportunity scores (0-100)
- Priority classification (critical/high/medium/low)
- Search volume, difficulty, CPC data

---

### Workflow 2: Generate Landing Pages (3 minutes per page)

1. **Landing Pages Tab** → Click **GENERATE_PAGE**

2. **Step 1: Select**
   - Choose keyword from list
     ```
     Example: "ai marketing automation software"
     Priority: High | Score: 78.5
     ```
   - Choose template: "How-To Guide"
   - Select Business Brain: "Your Company Name"

3. **Step 2: Configure**
   - Generation method: **Hybrid** (recommended)
   - Fill template variables:
     ```
     keyword: ai marketing automation software
     business_name: Disruptors & Co
     topic: marketing automation with AI
     difficulty_level: Intermediate
     time_required: 45 minutes
     ```

4. **Step 3: Generate**
   - Click **GENERATE**
   - Wait 15-25 seconds
   - AI creates unique content with Business Brain context

5. **Step 4: Preview**
   - Review metrics:
     - ✅ Uniqueness: 92%
     - ✅ Word count: 1,847
     - ✅ Keyword density: 2.3%
     - ✅ Read time: 10 min
   - Edit title/slug/meta if needed
   - Preview content
   - Choose action:
     - **SAVE_DRAFT** - Review later
     - **PUBLISH** - Go live immediately

**What You Get:**
- 1,500-2,000 word landing page
- SEO-optimized with target keyword
- 85%+ unique content
- Business Brain personalization
- Auto-generated title, slug, meta description

---

### Workflow 3: Monitor Performance (Ongoing)

1. **Analytics Tab**

2. **View SERP Tracking:**
   - Current rankings for all landing pages
   - Rank changes (↑↓→)
   - Impressions and clicks (when available)
   - CTR calculation

3. **Identify Opportunities:**
   - Pages ranking 11-20: Optimize to reach top 10
   - Declining rankings: Update content
   - High impressions, low clicks: Improve title/meta
   - Low rankings: May need more backlinks or content update

**What You Get:**
- Real-time ranking data
- Performance trends
- Optimization opportunities
- Success metrics

---

## 🎯 Best Practices

### Keyword Research

**DO:**
- ✅ Use specific seed keywords (not too broad)
- ✅ Set realistic volume minimums (100+ for most niches)
- ✅ Filter by difficulty based on your domain authority
- ✅ Use exclude patterns to filter spam/irrelevant keywords
- ✅ Run multiple research sessions with different seeds

**DON'T:**
- ❌ Use overly broad keywords ("marketing", "software")
- ❌ Ignore keyword difficulty (75+ is very competitive)
- ❌ Set volume too high (you'll miss longtail gems)
- ❌ Skip the exclude patterns (lots of spam keywords exist)

### Landing Page Generation

**DO:**
- ✅ Use Hybrid mode for best quality/speed balance
- ✅ Select Business Brain for personalization
- ✅ Fill all template variables completely
- ✅ Review content before publishing
- ✅ Aim for 85%+ uniqueness score
- ✅ Keep keyword density 1-3%

**DON'T:**
- ❌ Generate pages for keywords you can't reasonably rank for
- ❌ Skip the preview step
- ❌ Accept uniqueness scores below 85%
- ❌ Ignore keyword density warnings (>3% is risky)
- ❌ Generate duplicate content for similar keywords

### Template Selection

**When to use each:**

1. **How-To Guide**
   - Informational keywords
   - Question-based keywords
   - Tutorial content
   - Educational topics

2. **Service + Location**
   - Local SEO
   - Service pages
   - Location-specific content
   - "near me" keywords

3. **Comparison**
   - "X vs Y" keywords
   - Commercial intent
   - Product/service comparisons
   - Buying decision content

---

## 💡 Pro Tips

### Maximize ROI

1. **Target Low-Hanging Fruit First**
   - Filter for keywords with:
     - Difficulty 0-40
     - Volume 100-1,000
     - Critical/High priority
   - These rank fastest with minimal effort

2. **Create Keyword Clusters**
   - Group related keywords
   - Create pillar page + supporting pages
   - Internal link between related pages
   - Builds topical authority

3. **Update Existing Pages**
   - Use Research tab to find new keyword variations
   - Update existing landing pages with new keywords
   - Refresh content every 3-6 months

### Speed Up Generation

1. **Batch Research Sessions**
   - Run 5-10 seed keywords in one session
   - Save all high-priority keywords
   - Have a queue ready for generation

2. **Use Template Mode for Volume**
   - Template-only mode: <1 second per page
   - Good for location variations
   - Example: Same service, 50 cities

3. **Hybrid Mode for Quality**
   - Best balance of speed and quality
   - 15-25 seconds per page
   - Ideal for competitive keywords

### Improve Quality

1. **Create Detailed Business Brains**
   - More context = better content
   - Include services, values, USPs
   - Update regularly with new info

2. **Customize Templates**
   - Edit default templates in database
   - Add industry-specific sections
   - Include your unique processes

3. **Review and Edit**
   - AI is good but not perfect
   - Add specific examples from your business
   - Include data, statistics, case studies

---

## 📊 Expected Results

### Timeline

**Week 1:**
- Research: 200-500 keywords discovered
- Content: 10-20 landing pages published
- Rankings: Pages indexed (not ranking yet)

**Week 2-4:**
- Research: Additional keyword clusters
- Content: 30-50 total landing pages
- Rankings: Pages start appearing in top 100

**Month 2-3:**
- Research: Ongoing discovery and expansion
- Content: 75-100 total landing pages
- Rankings: 20-30% in top 50, 5-10% in top 10

**Month 4-6:**
- Research: Strategic gap filling
- Content: 100-200 landing pages (mature site)
- Rankings: 30-40% in top 50, 15-20% in top 10

### Traffic Estimates

**Conservative (Low Authority Site):**
- Month 1: 10-50 visits/month
- Month 3: 100-300 visits/month
- Month 6: 500-1,500 visits/month

**Moderate (Established Site):**
- Month 1: 50-200 visits/month
- Month 3: 500-1,500 visits/month
- Month 6: 2,000-5,000 visits/month

**Aggressive (High Authority Site):**
- Month 1: 200-500 visits/month
- Month 3: 2,000-5,000 visits/month
- Month 6: 10,000-25,000 visits/month

### Lead Generation

**Typical Conversion Rates:**
- Info content: 1-3% (email signup)
- Service pages: 5-10% (contact form)
- Local pages: 3-7% (phone call/form)

**Example Math (50 landing pages, moderate site):**
```
Month 3:
1,000 visits × 5% conversion = 50 leads
50 leads × $100 avg value = $5,000 value

Month 6:
3,500 visits × 5% conversion = 175 leads
175 leads × $100 avg value = $17,500 value
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "Missing required environment variables"**
- Check `.env` file exists
- Verify `DATAFORSEO_LOGIN` and `DATAFORSEO_PASSWORD`
- Restart dev server after adding variables

**2. "Table 'keywords' does not exist"**
- Database migration not applied
- Run migration script or apply manually via Supabase
- Verify in Supabase Dashboard → Table Editor

**3. "Uniqueness score below threshold (82%)"**
- Content too similar to existing pages
- Try "Full AI" mode instead of "Hybrid"
- Use different template
- Add more specific variables
- Regenerate with different approach

**4. "Keyword density too high (4.2%)"**
- Over-optimization risk
- Accept if 3-4% and natural-sounding
- If >4%, regenerate with looser keyword targeting
- Edit content manually to reduce keyword usage

**5. "No keywords found in research"**
- Seed keyword too specific/niche
- Try broader seed keyword
- Reduce minimum volume filter
- Increase maximum difficulty filter
- Check DataForSEO API credits

### Performance Issues

**Generation taking too long (>60 seconds):**
- Check internet connection
- Verify Anthropic API key is valid
- Try during off-peak hours
- Use Template mode for instant results

**Discovery finding no results:**
- Seed keyword too niche
- Volume/difficulty filters too strict
- Location/language mismatch
- DataForSEO API issue (check account status)

---

## 📚 Next Steps

### After First 10 Pages

1. **Analyze Performance**
   - Check Analytics tab for ranking data
   - Identify top performers
   - Look for patterns in what works

2. **Expand Strategically**
   - Target keywords similar to top performers
   - Build out keyword clusters
   - Create supporting content for pillar pages

3. **Optimize Existing Pages**
   - Update low performers with better content
   - Add internal links to new pages
   - Refresh with current year and new data

### After 50+ Pages

1. **Build Topical Authority**
   - Cover entire keyword clusters
   - Create comprehensive guides
   - Interlink related pages

2. **Track ROI**
   - Set up goal tracking in Google Analytics
   - Monitor lead sources
   - Calculate cost per lead

3. **Scale Operations**
   - Consider bulk generation for location variations
   - Automate with SEO Optimizer Subagent (coming soon)
   - Hire content editor to polish AI content

### Continuous Improvement

1. **Monthly Research**
   - Discover new keywords regularly
   - Track trending topics
   - Find competitor gaps

2. **Quarterly Content Refresh**
   - Update top 20% of pages
   - Refresh statistics and examples
   - Update year references

3. **Annual Strategy Review**
   - Analyze what worked best
   - Refine templates based on performance
   - Adjust keyword targeting strategy

---

## 🎓 Resources

### Documentation
- Full implementation: `docs/SEO_SUITE_IMPLEMENTATION_COMPLETE.md`
- Original plan: `docs/SEO_MODULES_IMPLEMENTATION_PLAN.md`
- Agent spec: `docs/agents/SEO_OPTIMIZER_SUBAGENT_SPEC.md`

### External Resources
- DataForSEO Docs: https://docs.dataforseo.com/v3/
- Claude API Docs: https://docs.anthropic.com/claude/reference
- Google SEO Guide: https://developers.google.com/search/docs

### Support
- GitHub Issues: Report bugs and request features
- Team Chat: Ask questions and share successes
- Documentation: Comprehensive guides and references

---

## ✅ Checklist

**Setup Complete When:**
- [ ] Database migration applied successfully
- [ ] DataForSEO credentials configured in .env
- [ ] SEO Suite accessible at /admin/secret/seo-suite
- [ ] All three tabs visible (Research, Landing Pages, Analytics)
- [ ] Templates loaded (3 default templates visible)

**First Success When:**
- [ ] First keyword research run completed
- [ ] 10+ keywords saved to database
- [ ] First landing page generated with AI
- [ ] Uniqueness score 85%+
- [ ] Page published or saved as draft

**Production Ready When:**
- [ ] 50+ high-quality keywords researched
- [ ] 10+ landing pages published
- [ ] Business Brain configured for personalization
- [ ] Templates customized for your brand
- [ ] Analytics tracking set up

---

**Happy ranking!** 🚀

*Built with ❤️ for Disruptors & Co*
