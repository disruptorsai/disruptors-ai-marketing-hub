# Blog Humanization System

**Date:** October 31, 2025
**Status:** ✅ Production Ready
**Purpose:** Transform AI-generated blog content to sound natural and bypass AI detection

---

## Overview

The Blog Humanization System integrates with the existing blog QA pipeline to detect AI-generated content and transform it into natural, human-like writing. It uses a multi-provider fallback system for maximum reliability and cost optimization.

## Architecture

### Three-Tier Provider System

```
1st Priority: EdgeShop.ai (FREE)
   ↓ (if fails)
2nd Priority: Undetectable.ai (PAID - $5-19/mo)
   ↓ (if fails)
3rd Priority: Claude Sonnet 4.5 (FALLBACK - existing API key)
```

### Integration Points

1. **Standalone Endpoint**: `/.netlify/functions/blog-humanize`
2. **QA Pipeline Integration**: Automatic AI detection in `blog-run-qa.js`
3. **MCP Desktop Usage**: Via `ai-humanizer-mcp-server` in Claude Desktop

---

## Provider Details

### 1. EdgeShop.ai (Free - Undocumented)

**API Endpoint:** `https://api.edgeshop.ai/rewrite/text-detection`

**Features:**
- AI detection via COPYLEAKS and HEMINGWAY
- No API key required
- Free to use

**Limitations:**
- Detection only (not humanization)
- Undocumented API (may change or break)
- No SLA or support

**Best for:** Free AI detection during QA checks

### 2. Undetectable.ai (Paid - Reliable)

**API Endpoint:** `https://api.undetectable.ai/`

**Features:**
- AI detection scoring (0.0-1.0)
- Full text humanization
- Readability control (High School, College, etc.)
- Strength settings (More Human, Balanced, More Readable)

**Pricing:**
- Free trial: 100 words
- Starter: $5/month for 10,000 words
- Pro: $19/month for 50,000 words

**Best for:** Production humanization with reliable API

### 3. Claude Sonnet 4.5 (Fallback)

**Model:** `claude-sonnet-4-20250514`

**Features:**
- Prompt-based humanization
- High quality output
- Uses existing Anthropic API key

**Pricing:**
- $0.003 per 1K input tokens
- $0.015 per 1K output tokens
- ~$0.02-0.04 per blog post

**Best for:** Fallback when other providers fail

---

## Usage

### Option 1: Standalone Humanization Endpoint

Humanize a blog post via Netlify function:

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/blog-humanize \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "uuid-here",
    "provider": "auto",
    "saveToDatabase": true
  }'
```

**Request Body:**
```typescript
{
  "postId": "uuid",           // Post ID from database
  "content": "text...",       // Or provide content directly
  "provider": "auto",         // 'auto', 'edgeshop', 'undetectable', 'claude'
  "saveToDatabase": true      // Save humanized version to posts table
}
```

**Response:**
```typescript
{
  "success": true,
  "postId": "uuid",
  "humanizedContent": "...",
  "originalLength": 5000,
  "humanizedLength": 4950,
  "sectionsProcessed": 6,
  "cost": 0.05,
  "savedToDatabase": true
}
```

### Option 2: Integrated QA Pipeline

The humanization system is automatically integrated into `blog-run-qa.js`:

```bash
# Run QA pipeline (includes AI detection step)
curl -X POST https://your-site.netlify.app/.netlify/functions/blog-run-qa \
  -H "Content-Type: application/json" \
  -d '{"draftId": "uuid-here"}'
```

**AI Detection Results:**
```typescript
{
  "ai_detection": {
    "status": "passed",        // or "warning" if AI score > 30%
    "tool_used": "edgeshop",
    "output_data": {
      "ai_score": 0.15,        // 15% AI-detected (good)
      "threshold": 0.30,       // Warning threshold
      "detection_details": {...}
    },
    "issues_found": [],        // Populated if AI score too high
    "cost_usd": 0.0
  }
}
```

If AI score > 30%, the QA system flags it with a warning suggesting humanization.

### Option 3: Manual Programmatic Use

Use the humanization library directly in your code:

```javascript
import { humanizeText, humanizeBlogPost } from './netlify/functions/shared/humanize-text.js';

// Humanize simple text
const result = await humanizeText('Your AI-generated text here', {
  preferredProvider: 'auto',   // or 'edgeshop', 'undetectable', 'claude'
  maxLength: 50000
});

console.log(result.humanizedText);
console.log(`AI Score: ${result.aiScore}`);
console.log(`Cost: $${result.cost}`);

// Humanize full blog post (section-by-section)
const blogResult = await humanizeBlogPost(blogMarkdown, {
  preferredProvider: 'undetectable'
});

console.log(`Humanized ${blogResult.sectionsProcessed} sections`);
console.log(`Total cost: $${blogResult.totalCost}`);
```

---

## Setup

### Step 1: Environment Variables

Add to your `.env` file:

```bash
# REQUIRED: Anthropic API key (fallback provider)
VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxx

# OPTIONAL: Undetectable.ai (paid, reliable humanization)
UNDETECTABLE_API_KEY=your_undetectable_api_key

# EdgeShop.ai requires no API key
```

### Step 2: Install Dependencies

Already installed in the project:
- `@anthropic-ai/sdk` (Claude fallback)
- `@supabase/supabase-js` (database integration)

### Step 3: Deploy to Netlify

The functions are automatically deployed with your site:
- `netlify/functions/blog-humanize.js`
- `netlify/functions/blog-run-qa.js` (updated with AI detection)
- `netlify/functions/shared/humanize-text.js` (shared utility)

---

## Testing

### Run Test Suite

```bash
node scripts/test-blog-humanization.js
```

**Test Coverage:**
1. Simple text humanization
2. Multi-provider fallback testing
3. Blog post section-by-section humanization
4. Database integration (real post)
5. EdgeShop.ai direct API test

**Test with Specific Provider:**
```bash
node scripts/test-blog-humanization.js --provider=undetectable
node scripts/test-blog-humanization.js --provider=claude
```

**Test with Real Post:**
```bash
node scripts/test-blog-humanization.js --postId=your-post-uuid
```

### Expected Test Output

```
🚀 Blog Humanization System - Test Suite
============================================================
Test run: 2025-10-31T12:00:00.000Z
Provider preference: auto

🔍 Environment Check:
  VITE_ANTHROPIC_API_KEY: ✅ Set
  UNDETECTABLE_API_KEY: ⚠️  Not set (optional)
  VITE_SUPABASE_URL: ✅ Set
  VITE_SUPABASE_SERVICE_ROLE_KEY: ✅ Set

🧪 TEST 1: Simple Text Humanization
============================================================
Provider: auto
Sample text length: 857 chars

✅ Result: SUCCESS
Provider used: edgeshop
AI Score: 0.85
Cost: $0.0000
Duration: 2.34s
```

---

## API Reference

### `humanizeText(text, options)`

Humanizes a single text block.

**Parameters:**
```typescript
text: string                    // Text to humanize
options?: {
  preferredProvider?: string,   // 'auto', 'edgeshop', 'undetectable', 'claude'
  maxLength?: number,           // Max text length (default: 50000)
  detectOnly?: boolean          // Only detect AI, don't humanize (default: false)
}
```

**Returns:**
```typescript
{
  success: boolean,
  provider: string,              // Which provider was used
  humanizedText: string,         // Humanized output
  originalText: string,
  aiScore: number,              // 0.0-1.0 (AI detection score)
  cost: number,                 // USD cost
  attemptedProviders: string[]  // List of providers tried
}
```

### `humanizeBlogPost(markdown, options)`

Humanizes a full blog post section-by-section.

**Parameters:**
```typescript
markdown: string                // Full blog post markdown
options?: {
  preferredProvider?: string
}
```

**Returns:**
```typescript
{
  success: boolean,
  originalContent: string,
  humanizedContent: string,
  sectionsProcessed: number,
  totalCost: number
}
```

### `humanizeBatch(textArray, options)`

Humanizes multiple text blocks with rate limiting.

**Parameters:**
```typescript
textArray: string[]             // Array of texts to humanize
options?: {...}
```

**Returns:**
```typescript
{
  success: boolean,
  results: Array<{...}>,        // Individual results
  successCount: number,
  failCount: number,
  totalCost: number
}
```

---

## Cost Optimization

### Cost Comparison Per Blog Post (1,500 words)

| Provider | Cost | Speed | Reliability |
|----------|------|-------|-------------|
| EdgeShop.ai | **FREE** | ~2s | ⚠️ Undocumented |
| Undetectable.ai | **$0.15** | ~30s | ✅ Reliable |
| Claude Sonnet 4.5 | **$0.03** | ~10s | ✅ Reliable |

### Recommended Strategy

**For QA Detection Only:**
1. Use EdgeShop.ai (free)
2. Fallback to skip if fails (non-critical)

**For Production Humanization:**
1. Use Undetectable.ai if available ($5-19/mo plan)
2. Fallback to Claude Sonnet 4.5 (uses existing key)
3. Skip EdgeShop.ai (detection-only)

**Monthly Cost Estimate:**

| Scenario | Posts/Month | Provider | Cost |
|----------|-------------|----------|------|
| Low volume | 10 | Claude fallback | $0.30 |
| Medium volume | 50 | Undetectable Starter | $5 |
| High volume | 200 | Undetectable Pro | $19 |

---

## Integration with Existing Systems

### Blog QA Pipeline

AI detection is now step #1 in the QA pipeline:

```javascript
// blog-run-qa.js results
{
  ai_detection: {...},      // NEW: AI detection step
  fact_check: {...},
  grammar: {...},
  toxicity: {...},
  plagiarism: {...},
  originality: {...},
  schema_validation: {...}
}
```

### Admin Nexus Integration

Add humanization button to Blog Manager:

```javascript
// In blog management UI
async function humanizeBlogPost(postId) {
  const response = await fetch('/.netlify/functions/blog-humanize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      postId: postId,
      provider: 'auto',
      saveToDatabase: true
    })
  });

  const result = await response.json();
  alert(`Humanized! AI Score: ${result.aiScore}`);
}
```

### MCP Desktop Integration

Use the `ai-humanizer-mcp-server` in Claude Desktop:

```
"Humanize this blog paragraph: [paste text]"
```

See `docs/BLOG_MCP_FRAMEWORK_SETUP.md` for MCP usage.

---

## Troubleshooting

### Issue: EdgeShop.ai Returns 401/403

**Solution:** EdgeShop.ai may be blocking requests. Falls back to next provider automatically.

### Issue: Undetectable.ai Timeout

**Solution:** API can take 30+ seconds for long texts. Increase timeout or use section-by-section processing.

### Issue: All Providers Failed

**Symptoms:**
```json
{
  "success": false,
  "error": "All humanization providers failed",
  "attemptedProviders": ["edgeshop", "undetectable", "claude"]
}
```

**Solution:**
1. Check `VITE_ANTHROPIC_API_KEY` is set (Claude fallback)
2. Check network connectivity
3. Review function logs for specific errors

### Issue: High AI Detection Score After Humanization

**Solution:** Run humanization twice or use Undetectable.ai with "More Human" strength setting.

---

## Best Practices

### 1. Humanize During Generation, Not After

**❌ Don't:**
```javascript
// Generate 20 blogs, then humanize all
const blogs = await generateBlogs(20);
await humanizeAll(blogs); // Expensive, slow
```

**✅ Do:**
```javascript
// Humanize each blog immediately after generation
for (const topic of topics) {
  const blog = await generateBlog(topic);
  const humanized = await humanizeText(blog);
  await saveToDatabase(humanized);
}
```

### 2. Use Section-by-Section for Long Posts

```javascript
// For blog posts > 2000 words, use humanizeBlogPost
// It automatically splits by H2 sections
const result = await humanizeBlogPost(longBlog);
```

### 3. Set AI Detection Threshold

```javascript
// Only humanize if AI score > 30%
const detection = await humanizeText(text, {
  preferredProvider: 'edgeshop',
  detectOnly: true
});

if (detection.aiScore > 0.3) {
  const humanized = await humanizeText(text, {
    preferredProvider: 'undetectable'
  });
}
```

### 4. Monitor Costs

```javascript
// Track humanization costs
let totalCost = 0;
for (const post of posts) {
  const result = await humanizeText(post.content);
  totalCost += result.cost || 0;
}
console.log(`Total humanization cost: $${totalCost.toFixed(2)}`);
```

---

## Related Documentation

- **MCP Integration**: `docs/BLOG_MCP_FRAMEWORK_SETUP.md`
- **QA Pipeline**: `docs/BLOG_QA_API_SETUP.md`
- **Blog System**: `docs/AUTOBLOG_SYSTEM.md`
- **Content Standards**: `docs/BLOG_CONTENT_STANDARDS.md`

---

## Support

For issues or questions:
1. Check function logs: `npx netlify functions:log blog-humanize`
2. Run test suite: `node scripts/test-blog-humanization.js`
3. Review this documentation
4. Check provider status pages

---

**Last Updated:** October 31, 2025
**Maintainer:** Disruptors AI Development Team
**Status:** ✅ Production Ready
