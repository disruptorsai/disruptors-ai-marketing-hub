# Blog QA System Implementation Plan

**Date:** October 31, 2025
**Status:** Phase 1 - Implementation In Progress
**Goal:** Replace all simulated QA checks with real API integrations per Executive Summary

---

## Phase 1: Real API Integration (1 week)

### 1.1 LanguageTool Integration (Grammar & Style)
**API:** LanguageTool API (self-hosted or cloud)
**Package:** `languagetool-api` or direct HTTP calls
**Cost:** Free tier (20 req/day) or $59/year for 40k requests

**Implementation:**
```javascript
// netlify/functions/blog-run-qa.js - runGrammarCheck()
import { LanguageToolClient } from 'languagetool-api'

const languageTool = new LanguageToolClient({
  url: process.env.LANGUAGETOOL_API_URL || 'https://api.languagetool.org/v2/',
  apiKey: process.env.LANGUAGETOOL_API_KEY
})

async function runGrammarCheck(draft) {
  const result = await languageTool.check({
    text: draft.content,
    language: 'en-US',
    level: 'picky'
  })

  return {
    stage: 'grammar',
    status: result.matches.length === 0 ? 'passed' : 'warning',
    tool_used: 'languagetool-api',
    issues_found: result.matches.map(m => ({
      type: m.rule.category.id,
      text: m.context.text,
      suggestion: m.replacements[0]?.value,
      severity: m.rule.category.name === 'GRAMMAR' ? 'high' : 'medium'
    }))
  }
}
```

**Environment Variables:**
```bash
LANGUAGETOOL_API_URL=https://api.languagetoolplus.com/v2/check  # or self-hosted
LANGUAGETOOL_API_KEY=your_api_key
```

---

### 1.2 Perspective API Integration (Toxicity & Bias)
**API:** Google Perspective API
**Package:** `@google-cloud/perspective` or direct HTTP
**Cost:** Free (1 QPS limit)

**Implementation:**
```javascript
// netlify/functions/blog-run-qa.js - runToxicityCheck()
import { AnnotateRequest } from '@google-cloud/perspective'

async function runToxicityCheck(draft) {
  const response = await fetch('https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      comment: { text: draft.content },
      requestedAttributes: {
        TOXICITY: {},
        SEVERE_TOXICITY: {},
        IDENTITY_ATTACK: {},
        INSULT: {},
        PROFANITY: {},
        THREAT: {}
      },
      key: process.env.PERSPECTIVE_API_KEY
    })
  })

  const data = await response.json()

  const toxicityScore = data.attributeScores.TOXICITY.summaryScore.value
  const severeToxicity = data.attributeScores.SEVERE_TOXICITY.summaryScore.value

  return {
    stage: 'toxicity',
    status: toxicityScore < 0.1 ? 'passed' : 'failed',
    tool_used: 'perspective-api',
    output_data: {
      toxicity_score: toxicityScore,
      severe_toxicity: severeToxicity,
      identity_attack: data.attributeScores.IDENTITY_ATTACK.summaryScore.value,
      insult: data.attributeScores.INSULT.summaryScore.value,
      profanity: data.attributeScores.PROFANITY.summaryScore.value,
      threat: data.attributeScores.THREAT.summaryScore.value
    },
    issues_found: toxicityScore >= 0.1 ? [{
      type: 'toxicity_detected',
      severity: 'high',
      score: toxicityScore
    }] : []
  }
}
```

**Environment Variables:**
```bash
PERSPECTIVE_API_KEY=your_google_api_key
```

---

### 1.3 Google Fact Check API Integration
**API:** Google Fact Check Tools API
**Package:** Direct HTTP calls
**Cost:** Free

**Implementation:**
```javascript
// netlify/functions/blog-run-qa.js - runFactCheck()
async function runFactCheck(draft) {
  // Step 1: Extract claims using Claude (keep this part)
  const claims = await extractFactualClaims(draft.content)

  // Step 2: Verify claims using Google Fact Check API
  const verifiedClaims = await Promise.all(
    claims.map(async claim => {
      const query = encodeURIComponent(claim.text)
      const response = await fetch(
        `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${query}&key=${process.env.GOOGLE_FACT_CHECK_API_KEY}`
      )

      const data = await response.json()

      if (!data.claims || data.claims.length === 0) {
        return {
          claim: claim.text,
          verified: false,
          confidence: 0.0,
          source: 'no_fact_check_found',
          reason: 'No fact-check results found for this claim'
        }
      }

      const bestMatch = data.claims[0]
      const rating = bestMatch.claimReview[0].textualRating.toLowerCase()

      const verified = ['true', 'mostly true', 'accurate'].some(r => rating.includes(r))

      return {
        claim: claim.text,
        verified,
        confidence: verified ? 0.9 : 0.3,
        source: bestMatch.claimReview[0].publisher.name,
        rating: bestMatch.claimReview[0].textualRating,
        url: bestMatch.claimReview[0].url
      }
    })
  )

  const issuesFound = verifiedClaims.filter(c => !c.verified || c.confidence < 0.7)

  return {
    stage: 'fact_check',
    status: issuesFound.length === 0 ? 'passed' : 'warning',
    tool_used: 'google-fact-check-api',
    output_data: { verified_claims: verifiedClaims },
    issues_found: issuesFound.map(i => ({
      type: 'unverified_claim',
      claim: i.claim,
      severity: 'high',
      source: i.source,
      rating: i.rating
    }))
  }
}
```

**Environment Variables:**
```bash
GOOGLE_FACT_CHECK_API_KEY=your_google_api_key
```

---

### 1.4 SerpAPI Integration (Plagiarism & Source Verification)
**API:** SerpAPI (Google Search API)
**Package:** `serpapi` npm package
**Cost:** $50-75/month (100-1000 searches)

**Implementation:**
```javascript
// netlify/functions/blog-run-qa.js - runPlagiarismCheck()
import { getJson } from 'serpapi'

async function runPlagiarismCheck(draft) {
  // Extract key phrases (first 3-5 unique sentences)
  const sentences = draft.content.split(/[.!?]+/).filter(s => s.trim().length > 50).slice(0, 5)

  const plagiarismResults = await Promise.all(
    sentences.map(async sentence => {
      const cleanSentence = sentence.trim().substring(0, 200)

      const response = await getJson({
        engine: "google",
        q: `"${cleanSentence}"`,
        api_key: process.env.SERPAPI_KEY,
        num: 10
      })

      // Filter out our own domain
      const externalMatches = response.organic_results.filter(
        r => !r.link.includes('disruptorsmedia.com') && !r.link.includes('dm4.wjwelsh.com')
      )

      return {
        sentence: cleanSentence,
        matches: externalMatches.length,
        sources: externalMatches.slice(0, 3).map(r => ({
          title: r.title,
          url: r.link,
          snippet: r.snippet
        }))
      }
    })
  )

  const totalMatches = plagiarismResults.reduce((sum, r) => sum + r.matches, 0)
  const plagiarismScore = Math.min(totalMatches / (sentences.length * 10), 1.0)

  const matchedSources = plagiarismResults.filter(r => r.matches > 0)

  return {
    stage: 'plagiarism',
    status: plagiarismScore < 0.15 ? 'passed' : 'failed',
    tool_used: 'serpapi',
    output_data: {
      plagiarism_score: plagiarismScore,
      matched_sources: matchedSources
    },
    issues_found: plagiarismScore >= 0.15 ? [{
      type: 'high_plagiarism',
      severity: 'high',
      score: plagiarismScore,
      details: `${matchedSources.length} sentences found on external sites`
    }] : []
  }
}
```

**Environment Variables:**
```bash
SERPAPI_KEY=your_serpapi_key
```

---

### 1.5 Pre-Publish Gate Enforcement
**File:** `netlify/functions/blog-publish.js`

**Implementation:**
```javascript
// netlify/functions/blog-publish.js
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { postId } = JSON.parse(event.body)

    // GET QA RESULTS FROM DATABASE
    const { data: qaResults, error } = await supabase
      .from('posts')
      .select('qa_results, qa_passed, qa_issues')
      .eq('id', postId)
      .single()

    if (error) throw error

    // ENFORCE GATE: Block if QA not passed
    if (!qaResults || !qaResults.passed) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          success: false,
          error: 'QA_CHECKS_FAILED',
          message: 'Cannot publish: QA checks have not passed',
          issues: qaResults?.issues || [],
          requiredActions: [
            'Review and fix all high-severity issues',
            'Re-run QA pipeline',
            'Ensure all critical checks pass',
            'Or request manual override from admin'
          ],
          qaDetails: {
            totalChecks: qaResults?.summary?.total_checks || 0,
            passed: qaResults?.summary?.passed || 0,
            warnings: qaResults?.summary?.warnings || 0,
            failed: qaResults?.summary?.failed || 0,
            criticalFailures: qaResults?.summary?.critical_failures || 0
          }
        })
      }
    }

    // PROCEED WITH PUBLISH
    const { data: published, error: publishError } = await supabase
      .from('posts')
      .update({
        status: 'published',
        is_published: true,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select()
      .single()

    if (publishError) throw publishError

    console.log(`✅ Published post ${postId}`)

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Post published successfully',
        post: published,
        qaVerification: 'All quality checks passed'
      })
    }

  } catch (error) {
    console.error('Publish error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    }
  }
}
```

---

## Implementation Steps

### Step 1: Install Dependencies
```bash
npm install languagetool-api serpapi --save
```

### Step 2: Add Environment Variables
Update `.env` file:
```bash
# QA Tools - Real APIs
LANGUAGETOOL_API_URL=https://api.languagetoolplus.com/v2/check
LANGUAGETOOL_API_KEY=your_key
PERSPECTIVE_API_KEY=your_google_api_key
GOOGLE_FACT_CHECK_API_KEY=your_google_api_key
SERPAPI_KEY=your_serpapi_key
```

### Step 3: Update blog-run-qa.js
Replace all simulated functions with real API integrations.

### Step 4: Update blog-publish.js
Add pre-publish gate enforcement.

### Step 5: Test Complete Workflow
1. Generate test blog post
2. Run QA pipeline
3. Verify all real API calls work
4. Test publish gate blocks failed QA
5. Fix issues and re-run QA
6. Verify publish succeeds after QA passes

---

## Cost Analysis

### Monthly Costs (Projected)
- **LanguageTool Cloud**: $5-20/month (up to 40k requests)
- **Perspective API**: Free (1 QPS limit sufficient for our use case)
- **Google Fact Check API**: Free
- **SerpAPI**: $50-75/month (100-1000 searches)
- **Claude Sonnet 4.5** (existing): $15-20/month
- **OpenAI gpt-image-1** (existing): $2-3/month

**Total**: ~$72-118/month (vs. current $17-23/month)
**Increase**: +$55-95/month
**ROI**: Risk mitigation - avoiding Google manual penalties worth thousands

---

## Testing Checklist

- [ ] LanguageTool API connection works
- [ ] Grammar issues detected correctly
- [ ] Perspective API toxicity detection works
- [ ] Fact Check API returns verification results
- [ ] SerpAPI plagiarism detection works
- [ ] Claude claim extraction still works
- [ ] Pre-publish gate blocks failed QA
- [ ] Pre-publish gate allows passed QA
- [ ] All QA results saved to database
- [ ] Admin can view QA details
- [ ] Error handling for API failures
- [ ] Rate limiting respected
- [ ] Cost tracking implemented

---

## Next Steps

**Immediate (Today)**:
1. Install `languagetool-api` and `serpapi` packages
2. Add environment variables
3. Update `blog-run-qa.js` with real API integrations
4. Update `blog-publish.js` with pre-publish gate
5. Test with sample blog post

**This Week**:
1. Complete Phase 1 implementation
2. Test all APIs with real blog content
3. Document API setup in BLOG_QA_API_SETUP.md
4. Update blog-orchestrator agent with new QA flow
5. Deploy to dev environment
6. Monitor API costs and performance

**Next Week (Phase 2)**:
1. MCP framework integration
2. Automated policy monitoring
3. Evidence logging system

---

**Status**: Ready to implement
**Priority**: HIGH
**Estimated Time**: 3-4 hours for Phase 1
**Risk Level**: LOW (all APIs well-documented, fallback to Claude on failure)
