# Blog Orchestrator Agent - Semantic Structure 2025

**Version:** 2025.1
**Last Updated:** January 15, 2025
**Status:** Production

---

## Agent Description

Use this agent for comprehensive blog content management with **2025 semantic HTML standards**. This agent generates blogs with proper `<article>`, `<header>`, `<section>`, and `<aside>` elements, includes key takeaways summaries, sticky table of contents, strategic CTAs, and full WCAG 2.1 AA accessibility compliance.

**Key Features:**
- ✅ Semantic HTML5 structure
- ✅ Key Takeaways summary section (3-6 bullets)
- ✅ Auto-generated Table of Contents
- ✅ Strategic CTA placement (sidebar + footer)
- ✅ Schema.org microdata for rich snippets
- ✅ Full accessibility (WCAG 2.1 AA)
- ✅ Performance optimized (Lighthouse 95+ target)
- ✅ AI humanization for detection bypass

---

## When to Invoke

**AUTO-TRIGGERED Keywords:**
- "blog", "blog post", "article", "semantic blog"
- "write blog", "generate blog", "create blog content"
- "blog with takeaways", "blog with TOC"
- "accessible blog", "SEO blog"
- "migrate blogs", "update blog structure"

**USER REQUESTS Examples:**
- "Write a semantic blog post about AI marketing"
- "Generate blog with key takeaways and FAQ section"
- "Create accessible blog post with proper headings"
- "Migrate existing blogs to 2025 standards"
- "Validate blog semantic structure"

**PROACTIVE TRIGGERS:**
- New blog generation requests
- Blog migration tasks
- Semantic validation failures
- Admin Nexus blog editing

---

## Semantic Blog Structure

### Complete Article Template

```jsx
<article itemScope itemType="https://schema.org/BlogPosting">
  {/* 1. Article Header with Semantic Metadata */}
  <header>
    <span className="category-badge">{category}</span>
    <h1 itemProp="headline">{title}</h1>
    <h2 className="subtitle">{subtitle}</h2>

    <div className="metadata">
      <address itemProp="author">{authorName}</address>
      <time dateTime="YYYY-MM-DD" itemProp="datePublished">{publishDate}</time>
      <span>{readingTime} min read</span>
    </div>
  </header>

  {/* 2. Key Takeaways Section (Required) */}
  <aside role="complementary" aria-label="Key takeaways">
    <h2>Key Takeaways</h2>
    <ul>
      <li>Actionable insight 1 with specific benefit</li>
      <li>Strategic recommendation 2 with clear outcome</li>
      <li>Critical point 3 with measurable result</li>
      <li>Important data 4 with context</li>
      <li>Final takeaway 5 with next step</li>
    </ul>
  </aside>

  {/* 3. Main Content Sections */}
  <section id="section-id">
    <h2>Descriptive Section Heading</h2>
    <p>Content paragraphs (max 4 lines each)</p>

    <h3>Subsection Heading</h3>
    <p>More detailed content</p>
  </section>

  {/* 4. FAQ Section (Required) */}
  <section id="faq">
    <h2>Frequently Asked Questions</h2>
    <h3>Question 1?</h3>
    <p>Answer in 2-3 sentences with examples.</p>
    {/* Exactly 5 questions total */}
  </section>

  {/* 5. Social Sharing */}
  <aside role="complementary" aria-label="Share this article">
    <h3>Share this article</h3>
    {/* Social buttons */}
  </aside>
</article>

{/* 6. Related Posts Section */}
<section aria-label="Related articles">
  <h2>Related Articles</h2>
  {/* 3 related post cards */}
</section>

{/* 7. Footer CTA */}
<section aria-label="Call to action">
  <h2>Ready to Get Started?</h2>
  <button>Primary CTA</button>
</section>
```

---

## Blog Generation Prompt Template (2025.1)

### Complete Prompt for Claude Sonnet 4.5

```
You are generating a comprehensive blog post with SEMANTIC HTML STRUCTURE optimized for 2025 SEO, accessibility, and UX standards.

**CRITICAL OUTPUT REQUIREMENTS:**

1. **YAML Front Matter** (metadata section):
```yaml
---
title: "Primary Keyword-Rich Title (50-60 chars)"
subtitle: "Compelling tagline expanding on title (80-100 chars)"
category: "Marketing" | "AI" | "Strategy" | "Tools"
author_name: "Disruptors Team"
estimated_reading_time: 8
key_takeaways:
  - "AI marketing automation reduces content creation time by 60% while maintaining quality"
  - "Personalization at scale increases email open rates by 40% and conversions by 28%"
  - "Integration with existing CRM systems takes only 1-2 hours with modern platforms"
  - "ROI typically appears within 30-45 days of implementation with proper setup"
  - "No technical expertise required - all major platforms offer drag-and-drop interfaces"
primary_keyword: "ai marketing automation"
secondary_keywords: ["marketing ai tools", "automated marketing", "ai email marketing"]
meta_description: "Discover how AI marketing automation can transform your business. Learn proven strategies, implementation steps, and ROI timelines. Get started today."
---
```

2. **Content Structure** (Pure Markdown):

**Opening (First 150 words):**
- Strong hook (curiosity gap, micro-story, contrarian statement, or data snapshot)
- Primary keyword in first 2 sentences
- Clear value proposition
- 2-3 short paragraphs (3-4 lines each)

**Main Sections:**
Each section MUST:
- Start with descriptive H2 heading (include keywords naturally)
- Open with 1-2 paragraph introduction (4 lines max each)
- Use H3 subheadings for detailed breakdowns
- Include visual breaks every 150-200 words:
  * Bullet lists (3-7 items)
  * Numbered steps
  * Blockquotes for key insights
  * Tables for comparisons (if necessary)

**Formatting Rules:**
- Paragraphs: 2-4 sentences (max 100 words)
- Lists: Maximum 2 lists per article
- Blockquotes: 2-3 minimum per post for visual breaks
  ```markdown
  > **Key Insight:** Specific data point or actionable takeaway in 1-2 sentences.
  ```
- Bold: Use sparingly for key terms only
- Links: 1-2 internal + 1-2 external authoritative sources

**FAQ Section** (Exactly 5 questions):
```markdown
## Frequently Asked Questions

### How does [specific feature] work in practice?
Direct answer in 2-3 sentences with real examples. Include specific data points and actionable next steps for readers.

### What are the main benefits of [topic]?
- **Benefit 1:** 40% increase in efficiency with specific metric
- **Benefit 2:** $5,000/month cost savings on average
- **Benefit 3:** 3x faster implementation vs traditional methods

### How long does it take to see measurable results?
Realistic timeline with conditional factors. Most businesses see initial improvements within 2-3 weeks, with full ROI typically appearing in 30-45 days after proper setup and optimization.

### What tools or resources are needed to get started?
List specific platforms, budgets, and time requirements. Include pros/cons and recommendation for the target audience.

### What are the most common mistakes to avoid?
Identify 3-4 critical pitfalls with brief explanations and how to prevent them based on real-world experience.
```

**Conclusion:**
- Summarize 3-4 key points (100 words max)
- Reinforce primary benefit
- Clear call-to-action
- Link to relevant service/tool

**SEMANTIC REQUIREMENTS:**

✅ Word Count: 1,200+ words (target: 2,500-3,000)
✅ Key Takeaways: Exactly 5 actionable bullets (60-80 chars each)
✅ Subtitle: 80-100 characters, compelling hook
✅ FAQ Questions: Exactly 5 with H3 headings
✅ Heading Structure: H2 every 300-400 words
✅ Visual Breaks: Every 150-200 words
✅ Blockquotes: 2-3 minimum
✅ Primary Keyword: Title + first 150 words + conclusion
✅ Links: 1-2 internal + 1-2 external
✅ Images: Alt text for all (if included)

**SEO OPTIMIZATION:**

- Primary keyword in H1 title (naturally)
- Primary keyword in first 2 sentences
- Primary keyword in at least one H2 heading
- Secondary keywords distributed throughout
- Meta description: 150-160 characters with keyword
- Featured snippet optimization in intro
- FAQ section optimized for Answer Boxes
- Internal linking to related content
- External links to authoritative sources (.gov, .edu, industry leaders)

**ACCESSIBILITY STANDARDS:**

- Descriptive headings (no "Introduction", "Conclusion")
- Logical heading hierarchy (H1 → H2 → H3)
- Meaningful link text (no "click here")
- Simple language with jargon defined
- Short paragraphs for scannability
- All images need alt text (if included)

**VOICE & TONE:**

- Conversational but professional
- Confident without condescension
- Data-driven with specific examples
- Actionable insights throughout
- No fluff - every sentence adds value
- Bold and attention-grabbing (Disruptors brand voice)
- Occasionally contrarian (challenges conventional wisdom)

Now generate a comprehensive blog post about:

**Topic:** {TOPIC}
**Primary Keyword:** {PRIMARY_KEYWORD}
**Target Audience:** {ICP_DESCRIPTION}
**Business Context:** {BUSINESS_BRAIN_FACTS}

Output pure Markdown with YAML front matter. No code fences. No meta commentary.
```

---

## Database Schema (posts table)

### New Semantic Fields (2025.1)

```sql
-- Semantic metadata
subtitle TEXT,                    -- 80-100 char tagline
author_name TEXT DEFAULT 'Disruptors Team',
key_takeaways JSONB DEFAULT '[]'::jsonb,
table_of_contents JSONB DEFAULT '[]'::jsonb,
cta_config JSONB DEFAULT '{}'::jsonb,

-- Technical tracking
semantic_structure_version TEXT DEFAULT '2025.1',
accessibility_metadata JSONB DEFAULT '{}'::jsonb,
performance_score INTEGER,
last_seo_audit TIMESTAMPTZ
```

### Example Data Structures

**key_takeaways JSON:**
```json
{
  "takeaways": [
    "AI marketing automation reduces content creation time by 60%",
    "Personalization increases email open rates by 40% and conversions by 28%",
    "CRM integration takes 1-2 hours with modern AI platforms",
    "ROI appears within 30-45 days of proper implementation",
    "No technical expertise required with drag-and-drop interfaces"
  ],
  "generated_at": "2025-01-15T09:30:00Z",
  "validated": true
}
```

**table_of_contents JSON:**
```json
[
  { "level": 2, "text": "Understanding AI Marketing Automation", "id": "understanding-ai-marketing-automation" },
  { "level": 3, "text": "Core Components", "id": "core-components" },
  { "level": 2, "text": "Implementation Strategy", "id": "implementation-strategy" },
  { "level": 3, "text": "Step 1: Platform Selection", "id": "step-1-platform-selection" },
  { "level": 2, "text": "Frequently Asked Questions", "id": "frequently-asked-questions" }
]
```

**cta_config JSON:**
```json
{
  "sidebar": {
    "enabled": true,
    "title": "Ready to Transform Your Marketing?",
    "description": "Get personalized AI recommendations for your business.",
    "button_text": "Get Started Free",
    "button_link": "/app/signup"
  },
  "footer": {
    "enabled": true,
    "title": "Ready to Take the Next Step?",
    "description": "Join 500+ businesses using AI to dominate their markets.",
    "button_text": "Start Your Free Trial",
    "button_link": "/app/signup"
  }
}
```

---

## Blog Generation Workflow

### 1. Generate New Semantic Blog

```javascript
import { generateSemanticBlog } from '../scripts/generate-semantic-blog.js';

const blog = await generateSemanticBlog({
  topic: 'AI Marketing Automation for Service Businesses',
  primaryKeyword: 'ai marketing automation',
  secondaryKeywords: ['marketing ai tools', 'automated marketing'],
  businessBrain: businessBrainContext // Auto-loaded
});

// Output:
// - Full markdown content with YAML front matter
// - Auto-generated key takeaways (5 bullets)
// - Auto-extracted table of contents
// - Featured image (gpt-image-1, 1536x1024)
// - Inserted into posts table with semantic_structure_version: '2025.1'
```

### 2. Migrate Existing Blog

```bash
# Dry run (preview changes)
node scripts/migrate-blogs-to-semantic.js --dry-run --batch-size=10

# Migrate specific blog
node scripts/migrate-blogs-to-semantic.js --specific-slug=blog-slug

# Migrate batch
node scripts/migrate-blogs-to-semantic.js --batch-size=20
```

**Migration Process:**
1. Extract headings → generate TOC
2. Use Claude to generate:
   - Subtitle from content
   - 5 key takeaways
3. Set default CTA config
4. Update semantic_structure_version to '2025.1'

### 3. Validate Semantic Compliance

```bash
# Validate all published blogs
node scripts/validate-semantic-blogs.js

# Validate specific blog
node scripts/validate-semantic-blogs.js --slug=blog-slug

# Generate detailed report
node scripts/validate-semantic-blogs.js --report
```

**Validation Checks:**
- ✅ Subtitle length (50-120 chars)
- ✅ Key takeaways count (3-6)
- ✅ TOC presence (>1500 words)
- ✅ Word count (≥1200)
- ✅ H2 sections (≥3)
- ✅ FAQ section present
- ✅ FAQ questions (exactly 5)
- ✅ Primary keyword in title
- ✅ Primary keyword in first 500 chars
- ✅ Meta description (150-160 chars)
- ✅ Images with alt text
- ✅ Heading hierarchy valid
- ✅ Semantic version = 2025.1

---

## Rendering System

### Blog Detail Page (Semantic Layout)

**File:** `src/pages/blog-detail-semantic.jsx`

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────┐
│                      Breadcrumbs                         │
├───────────┬────────────────────────┬─────────────────────┤
│           │   Article Header       │                     │
│           │   - H1 Title           │                     │
│   Sticky  │   - H2 Subtitle        │    Sticky CTA       │
│   Table   │   - Metadata           │    Sidebar          │
│   of      ├────────────────────────┤    (XL only)        │
│  Contents │   Key Takeaways        │                     │
│  (280px)  │   (Aside)              │                     │
│           ├────────────────────────┤                     │
│           │   Main Content         │                     │
│           │   (680px max width)    │                     │
│           ├────────────────────────┤                     │
│           │   FAQ Section          │                     │
│           ├────────────────────────┤                     │
│           │   Social Share         │                     │
├───────────┴────────────────────────┴─────────────────────┤
│   Related Posts (3-column grid)                          │
├──────────────────────────────────────────────────────────┤
│   Footer CTA (full-width)                                │
└──────────────────────────────────────────────────────────┘
```

**Key Features:**
- Sticky TOC with active section highlighting
- Mobile-responsive collapsible TOC
- Key Takeaways summary (aside element)
- Strategic CTA placement (sidebar + footer)
- Reading progress bar
- Schema.org JSON-LD for rich snippets
- ARIA labels and roles throughout
- Keyboard navigation support

---

## Admin Nexus Integration

### Blog Editor Updates

**New Semantic Fields Tab:**

1. **Subtitle Editor**
   - Character counter (target: 80-100)
   - Auto-suggestions from content
   - Preview how it appears on blog page

2. **Key Takeaways Editor**
   - 3-6 bullet point inputs
   - Drag-to-reorder bullets
   - Character counter per bullet (60-80)
   - Auto-generation button (uses Claude)

3. **Table of Contents Preview**
   - Auto-generated from headings
   - Manual override option
   - Anchor link validation

4. **CTA Configuration**
   - Sidebar CTA toggle + editor
   - Footer CTA toggle + editor
   - Preview both placements

5. **Semantic Validation Panel**
   - Real-time compliance checking
   - Issue highlighting with fixes
   - Validation score display

---

## Performance & Accessibility

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Performance | 95+ | TBD |
| First Contentful Paint | <1.8s | TBD |
| Largest Contentful Paint | <2.5s | TBD |
| Time to Interactive | <3.5s | TBD |
| Cumulative Layout Shift | <0.1 | TBD |
| Total Blocking Time | <300ms | TBD |

### Accessibility Compliance (WCAG 2.1 AA)

✅ **Semantic HTML:**
- Proper use of `<article>`, `<header>`, `<section>`, `<aside>`, `<nav>`
- Meaningful heading hierarchy (H1 → H2 → H3)
- `<time>` elements with `datetime` attribute
- `<address>` for author information

✅ **ARIA Attributes:**
- `role="complementary"` for sidebars
- `role="navigation"` for TOC
- `aria-label` on all sections
- `aria-current` for active TOC items

✅ **Keyboard Navigation:**
- All interactive elements tabbable
- Skip to main content link
- Focus indicators visible
- Keyboard shortcuts for TOC

✅ **Screen Reader Optimization:**
- Descriptive alt text on all images (min 10 chars)
- Meaningful link text (no "click here")
- Proper label associations
- Live region announcements for dynamic content

✅ **Color Contrast:**
- Body text: 10.7:1 ratio (AAA)
- Headings: 17.1:1 ratio (AAA)
- Links: 7.1:1 ratio (AA)
- Interactive elements: 3:1 minimum (AA)

---

## Migration Guide

### Phase 1: Top Priority Blogs (Week 1)

**Target:** Top 10 traffic blogs

```bash
# 1. Identify top traffic blogs
node scripts/identify-top-traffic-blogs.js --limit=10

# 2. Migrate with manual review
node scripts/migrate-blogs-to-semantic.js --batch-size=10 --dry-run

# 3. Review generated metadata in Admin Nexus

# 4. Apply migration
node scripts/migrate-blogs-to-semantic.js --batch-size=10

# 5. Validate
node scripts/validate-semantic-blogs.js --report
```

### Phase 2: Recent Blogs (Week 2)

**Target:** Next 20 recent blogs

```bash
# Automated migration with spot-check validation
node scripts/migrate-blogs-to-semantic.js --batch-size=20
```

### Phase 3: Remaining Blogs (Week 3)

**Target:** All remaining published blogs

```bash
# Migrate all legacy blogs
node scripts/migrate-blogs-to-semantic.js --all
```

### Phase 4: Validation & Optimization (Week 4)

```bash
# System-wide validation
node scripts/validate-semantic-blogs.js --report

# Fix any failing blogs manually in Admin Nexus

# Performance audit
npm run perf:audit

# Accessibility audit
npm run a11y:audit
```

---

## Quality Assurance Checklist

### Pre-Publish Checklist

**Semantic Structure:**
- [ ] semantic_structure_version = '2025.1'
- [ ] Subtitle: 80-100 characters
- [ ] Key takeaways: 3-6 bullets, 60-80 chars each
- [ ] Table of contents: auto-generated from H2/H3
- [ ] CTA config: sidebar + footer both set

**Content Quality:**
- [ ] Word count ≥ 1,200 words
- [ ] Title includes primary keyword
- [ ] First 150 words include primary keyword
- [ ] H2 sections: minimum 3
- [ ] FAQ section present with exactly 5 questions
- [ ] Paragraphs: 2-4 sentences max
- [ ] Visual breaks every 150-200 words

**SEO:**
- [ ] Meta description: 150-160 characters
- [ ] Primary keyword naturally distributed
- [ ] 1-2 internal links with descriptive anchors
- [ ] 1-2 external links to authoritative sources
- [ ] Featured snippet optimization in intro

**Accessibility:**
- [ ] All images have alt text (min 10 chars)
- [ ] Heading hierarchy valid (no skipped levels)
- [ ] Links have meaningful text
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation tested

**Technical:**
- [ ] Featured image: 1536x1024, <200KB
- [ ] Reading time accurate
- [ ] Schema.org metadata complete
- [ ] Social share links functional
- [ ] Related posts populated

---

## Troubleshooting

### Common Issues

**Issue:** Migration fails with "Invalid subtitle length"
**Fix:** Manually set subtitle in Admin Nexus or re-run with different content preview

**Issue:** TOC not appearing on blog page
**Fix:** Ensure word count >1,500 and table_of_contents field populated

**Issue:** Key takeaways not displaying
**Fix:** Check key_takeaways.takeaways array exists and has 3-6 items

**Issue:** Validation failing on old blogs
**Fix:** Run migration script first, then validate

**Issue:** CTA not showing on sidebar
**Fix:** Check screen size (sidebar CTA only on XL screens, 1280px+)

---

## Resources

### Documentation
- `docs/SEMANTIC_BLOG_REDESIGN_2025.md` - Complete implementation guide
- `docs/BLOG_CONTENT_STANDARDS.md` - Writing guidelines
- `docs/BLOG_ACCESSIBILITY_GUIDE.md` - Accessibility requirements

### Components
- `src/components/blog/SemanticBlogTemplate.jsx` - All semantic components
- `src/pages/blog-detail-semantic.jsx` - Semantic blog renderer

### Scripts
- `scripts/generate-semantic-blog.js` - Generate new blog with 2025.1 structure
- `scripts/migrate-blogs-to-semantic.js` - Migrate legacy blogs
- `scripts/validate-semantic-blogs.js` - Validate compliance

### Admin Nexus
- `/admin/secret` → Blog Management → Semantic Structure tab

---

**Last Updated:** January 15, 2025
**Version:** 2025.1
**Maintained By:** Disruptors AI Development Team
