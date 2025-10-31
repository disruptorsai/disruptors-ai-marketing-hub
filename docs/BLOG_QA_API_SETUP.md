# Blog QA API Setup Guide

**Date:** October 31, 2025
**Status:** Implementation Complete - Requires API Keys
**Purpose:** Real API integration for quality control per Executive Summary requirements

---

## Overview

The blog QA system now uses **real API integrations** instead of simulations for:
1. **Grammar & Style**: LanguageTool API
2. **Toxicity Detection**: Google Perspective API
3. **Fact-Checking**: Google Fact Check Tools API
4. **Plagiarism Detection**: SerpAPI (Google Search)

All checks gracefully fall back to Claude or simulation if API keys are not configured.

---

## API Requirements

### 1. LanguageTool API (Grammar & Style)

**What it does**: Detects grammar, spelling, and style issues in English text

**Pricing**:
- **Free Tier**: 20 requests/day (sufficient for testing)
- **Premium**: $59/year for 40,000 requests (~110 checks/day)
- **Business**: Custom pricing for higher volumes

**Setup**:
1. Go to https://languagetoolplus.com/
2. Create account and get API key
3. Or self-host: https://github.com/languagetool-org/languagetool

**Environment Variables**:
```bash
# Option 1: Cloud API (Recommended)
LANGUAGETOOL_API_URL=https://api.languagetoolplus.com/v2/check
LANGUAGETOOL_API_KEY=your_api_key_here

# Option 2: Self-Hosted
LANGUAGETOOL_API_URL=http://localhost:8010/v2/check
# No API key needed for self-hosted
```

**Testing**:
```bash
curl -X POST "https://api.languagetool.org/v2/check" \
  -d "text=This is an example of text with erors." \
  -d "language=en-US"
```

---

### 2. Google Perspective API (Toxicity Detection)

**What it does**: Detects toxic, abusive, or harmful language using ML models

**Pricing**: **FREE** (with 1 QPS rate limit - sufficient for blog publishing)

**Setup**:
1. Go to https://console.cloud.google.com/
2. Enable Perspective API
3. Create API key

**Detailed Steps**:
```bash
# 1. Go to Google Cloud Console
https://console.cloud.google.com/

# 2. Create new project or select existing

# 3. Enable Perspective API
https://console.cloud.google.com/apis/library/commentanalyzer.googleapis.com

# 4. Create credentials
- Go to "Credentials" tab
- Click "Create Credentials" → "API Key"
- Copy the API key
- (Optional) Restrict key to Perspective API only
```

**Environment Variables**:
```bash
PERSPECTIVE_API_KEY=your_google_api_key_here
```

**Testing**:
```bash
curl -X POST "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": {"text": "This is a test comment"},
    "requestedAttributes": {"TOXICITY": {}}
  }'
```

---

### 3. Google Fact Check Tools API (Fact Verification)

**What it does**: Searches fact-checking organizations for verification of claims

**Pricing**: **FREE**

**Setup**:
1. Go to https://console.cloud.google.com/
2. Enable Fact Check Tools API
3. Use same API key as Perspective API

**Detailed Steps**:
```bash
# 1. Go to Google Cloud Console
https://console.cloud.google.com/

# 2. Enable Fact Check Tools API
https://console.cloud.google.com/apis/library/factchecktools.googleapis.com

# 3. Use existing API key from Perspective API setup
# (Or create new restricted key for Fact Check API only)
```

**Environment Variables**:
```bash
GOOGLE_FACT_CHECK_API_KEY=your_google_api_key_here
# Can be same as PERSPECTIVE_API_KEY
```

**Testing**:
```bash
curl "https://factchecktools.googleapis.com/v1alpha1/claims:search?query=climate%20change&key=YOUR_API_KEY"
```

---

### 4. SerpAPI (Plagiarism Detection via Google Search)

**What it does**: Searches Google for exact phrase matches to detect plagiarism

**Pricing**:
- **Free Trial**: 100 searches/month
- **Starter**: $50/month for 5,000 searches
- **Pro**: $150/month for 20,000 searches

**Setup**:
1. Go to https://serpapi.com/
2. Create account
3. Get API key from dashboard

**Environment Variables**:
```bash
SERPAPI_KEY=your_serpapi_key_here
```

**Testing**:
```bash
curl "https://serpapi.com/search.json?engine=google&q=test&api_key=YOUR_API_KEY"
```

---

## Complete Environment Variables

Add these to your `.env` file:

```bash
# ========================================
# BLOG QA SYSTEM - REAL API INTEGRATION
# ========================================

# Grammar & Style (LanguageTool)
LANGUAGETOOL_API_URL=https://api.languagetoolplus.com/v2/check
LANGUAGETOOL_API_KEY=your_languagetool_api_key

# Toxicity Detection (Google Perspective API)
PERSPECTIVE_API_KEY=your_google_api_key

# Fact-Checking (Google Fact Check Tools API)
GOOGLE_FACT_CHECK_API_KEY=your_google_api_key  # Can be same as PERSPECTIVE_API_KEY

# Plagiarism Detection (SerpAPI)
SERPAPI_KEY=your_serpapi_key
```

**Note**: All APIs gracefully fall back if keys are not configured. The system will:
- Use Claude for grammar checking if LanguageTool key missing
- Skip toxicity check if Perspective API key missing
- Skip fact verification if Fact Check API key missing
- Skip plagiarism check if SerpAPI key missing

---

## Cost Breakdown

### Free Tier (Testing)
- **LanguageTool**: 20 checks/day (FREE)
- **Perspective API**: Unlimited at 1 QPS (FREE)
- **Fact Check API**: Unlimited (FREE)
- **SerpAPI**: 100 searches/month (FREE trial)
- **Total**: $0/month

### Production (Low Volume - 20 blogs/month)
- **LanguageTool Premium**: $59/year ≈ $5/month
- **Perspective API**: FREE
- **Fact Check API**: FREE
- **SerpAPI Starter**: $50/month
- **Total**: ~$55/month

### Production (High Volume - 100+ blogs/month)
- **LanguageTool Premium**: $59/year ≈ $5/month (40k requests/year = 110 checks/day)
- **Perspective API**: FREE
- **Fact Check API**: FREE
- **SerpAPI Pro**: $150/month (20k searches/month)
- **Total**: ~$155/month

---

## Testing the QA Pipeline

### 1. Create Test Blog Post

```javascript
// Run blog generation script
node scripts/generate-20-comprehensive-blogs.js
```

### 2. Run Enhanced QA Pipeline

The new enhanced QA function is at:
```
netlify/functions/blog-run-qa-enhanced.js
```

To test locally:
```bash
# Start Netlify dev server
npm run dev:netlify

# Call QA endpoint
curl -X POST http://localhost:8888/.netlify/functions/blog-run-qa-enhanced \
  -H "Content-Type: application/json" \
  -d '{"draftId": "your-post-id"}'
```

### 3. Check QA Results

Expected response:
```json
{
  "success": true,
  "passed": true,
  "results": {
    "summary": {
      "total_checks": 6,
      "passed": 5,
      "warnings": 1,
      "failed": 0,
      "critical_failures": 0
    },
    "results": {
      "grammar": {
        "status": "passed",
        "tool_used": "languagetool-api",
        "issues_found": []
      },
      "toxicity": {
        "status": "passed",
        "tool_used": "perspective-api",
        "output_data": {
          "toxicity_score": 0.02
        }
      },
      "fact_check": {
        "status": "passed",
        "tool_used": "google-fact-check-api"
      },
      "plagiarism": {
        "status": "passed",
        "tool_used": "serpapi",
        "output_data": {
          "plagiarism_score": 0.05
        }
      }
    }
  }
}
```

### 4. Test Pre-Publish Gate

```bash
# Attempt to publish post without QA
curl -X POST http://localhost:8888/.netlify/functions/blog-publish-gated \
  -H "Content-Type: application/json" \
  -d '{"postId": "your-post-id"}'

# Expected: 403 error - QA not run

# Run QA, then publish
curl -X POST http://localhost:8888/.netlify/functions/blog-publish-gated \
  -H "Content-Type: application/json" \
  -d '{"postId": "your-post-id"}'

# Expected: 200 success if QA passed
```

---

## Switching to Production

### Step 1: Rename Files

```bash
# Replace old QA function with enhanced version
mv netlify/functions/blog-run-qa.js netlify/functions/blog-run-qa-old.js
mv netlify/functions/blog-run-qa-enhanced.js netlify/functions/blog-run-qa.js

# Replace old publish function with gated version
mv netlify/functions/blog-publish.js netlify/functions/blog-publish-old.js
mv netlify/functions/blog-publish-gated.js netlify/functions/blog-publish.js
```

### Step 2: Deploy to Netlify

```bash
# Ensure environment variables are set in Netlify
# Go to: Site settings → Environment variables

# Add all API keys:
LANGUAGETOOL_API_KEY=xxx
PERSPECTIVE_API_KEY=xxx
GOOGLE_FACT_CHECK_API_KEY=xxx
SERPAPI_KEY=xxx

# Deploy
npm run deploy:dev  # Test on dev first
npm run deploy:prod # Deploy to production after testing
```

### Step 3: Verify in Production

```bash
# Check function logs
npx netlify functions:list
npx netlify logs function blog-run-qa --site=your-site-id

# Test with real blog post
# - Generate blog
# - Run QA
# - Check Admin Nexus for results
# - Attempt publish
# - Verify gate enforcement works
```

---

## Troubleshooting

### LanguageTool API Errors

**Issue**: 400 Bad Request
**Solution**: Check API URL format
```bash
# Correct format:
LANGUAGETOOL_API_URL=https://api.languagetoolplus.com/v2/check

# Wrong format (missing /v2/check):
LANGUAGETOOL_API_URL=https://api.languagetoolplus.com
```

**Issue**: 403 Forbidden
**Solution**: Verify API key is valid and not expired

**Issue**: Rate limit exceeded
**Solution**: Upgrade to premium plan or wait for quota reset

---

### Perspective API Errors

**Issue**: 400 - Text too long
**Solution**: API has 20KB limit. Text is auto-truncated in code.

**Issue**: 429 - Rate limit exceeded
**Solution**: Free tier has 1 QPS limit. Add delay between requests if batch processing.

**Issue**: 403 - API not enabled
**Solution**: Enable Perspective API in Google Cloud Console

---

### Fact Check API Errors

**Issue**: No results found for claim
**Solution**: Not an error - claim is not verified by fact-checkers. Returns `verified: false`.

**Issue**: 403 - API not enabled
**Solution**: Enable Fact Check Tools API in Google Cloud Console

---

### SerpAPI Errors

**Issue**: 401 - Invalid API key
**Solution**: Verify API key from dashboard

**Issue**: 429 - Search limit exceeded
**Solution**: Upgrade plan or wait for monthly quota reset

**Issue**: No organic results
**Solution**: Normal for unique/original sentences. Returns `plagiarism_score: 0.0`.

---

## Monitoring

### Check API Usage

**LanguageTool**:
- Dashboard: https://languagetoolplus.com/account
- Shows: Requests used / Total limit

**Google APIs** (Perspective + Fact Check):
- Dashboard: https://console.cloud.google.com/apis/dashboard
- Shows: Requests per day/month

**SerpAPI**:
- Dashboard: https://serpapi.com/dashboard
- Shows: Searches used / Monthly limit

### Cost Tracking

Add to blog QA results:
```javascript
// Each QA result includes cost_usd field
{
  "grammar": { "cost_usd": 0.001 },
  "toxicity": { "cost_usd": 0.0 },
  "fact_check": { "cost_usd": 0.0 },
  "plagiarism": { "cost_usd": 0.01 }
}
// Total per blog: ~$0.011
```

Track monthly:
```sql
SELECT
  SUM((qa_results->'results'->'grammar'->>'cost_usd')::decimal) as grammar_cost,
  SUM((qa_results->'results'->'plagiarism'->>'cost_usd')::decimal) as plagiarism_cost,
  COUNT(*) as total_qa_runs
FROM posts
WHERE last_qa_run >= date_trunc('month', CURRENT_DATE);
```

---

## Next Steps

### Phase 2: MCP Framework Integration
- Create MCP servers for each QA tool
- Use OpenAI Agents SDK or Anthropic MCP
- Modular, swappable tool integrations

### Phase 3: Automated Policy Monitoring
- Google Search Central docs watcher
- Search Status Dashboard alerts
- Slack notifications on policy changes

### Phase 4: Evidence Logging
- Structured audit packages per blog
- Ready for Google reconsideration requests
- Compliance documentation

---

## Support & Documentation

- **LanguageTool Docs**: https://languagetool.org/http-api/swagger-ui/#!/default/post_check
- **Perspective API Docs**: https://developers.perspectiveapi.com/s/
- **Fact Check API Docs**: https://developers.google.com/fact-check/tools/api/reference/rest
- **SerpAPI Docs**: https://serpapi.com/search-api

---

**Last Updated**: October 31, 2025
**Maintainer**: Disruptors AI Development Team
**Status**: Production-Ready (Requires API Keys)
