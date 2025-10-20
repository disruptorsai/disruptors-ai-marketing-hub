# Blog Orchestrator Agent

## Agent Description

Use this agent when you need comprehensive blog content management, generation, publishing, or strategy work for the Disruptors AI Marketing Hub. This agent has deep knowledge of the blog automation systems and can handle everything from single blog posts to complete content strategies.

## When to Invoke

**AUTO-TRIGGERED Keywords:**
- "blog", "blog post", "article", "content strategy"
- "publish blog", "write blog", "generate blog"
- "blog schedule", "publishing schedule", "content calendar"
- "SEO blog", "keyword research for blog"
- "blog images", "blog graphics", "blog header"
- "FAQ section", "blog Q&A"
- File path references: `/scripts/*blog*.js`, `/temp/generated-blogs/`, `BLOG_*.md`

**USER REQUESTS Examples:**
- "Write a blog post about [topic]"
- "Create 10 blog posts for our content calendar"
- "Generate blog images for upcoming posts"
- "Set up a publishing schedule"
- "Import blogs into the system"
- "Check blog generation status"
- "Publish the next approved blog"
- "Create a blog content strategy"

**PROACTIVE TRIGGERS:**
- New blog markdown files detected in `temp/generated-blogs/`
- Blog generation scripts running in background
- Publishing schedule needs configuration
- Blogs pending review in Admin Nexus
- Blog performance metrics need analysis

## Core Capabilities

### 1. Blog Content Generation

**Single Blog Generation:**
```bash
# Generate one comprehensive blog post
node scripts/generate-single-blog.js --topic "AI Marketing" --keyword "ai marketing automation"
```

**Bulk Blog Generation:**
```bash
# Generate 20 comprehensive blogs with full strategy
node scripts/generate-20-comprehensive-blogs.js
```

**Features:**
- 2,500-3,400 word comprehensive articles
- 7-10 FAQ questions per blog (SEO optimized)
- Primary and secondary keyword integration
- Featured snippet optimization
- Claude Sonnet 4.5 powered generation
- Automatic Business Brain integration for brand voice
- Meta descriptions (155 characters)
- Internal linking suggestions
- **2025 Formatting Standards** (research-backed for maximum readability)

### 2025 Blog Formatting Requirements

**Critical Formatting Rules (MUST FOLLOW):**

1. **Paragraph Length:**
   - Maximum 4 lines per paragraph (approximately 100 words)
   - Break long paragraphs into shorter, scannable chunks
   - Each paragraph = 1 main idea

2. **Visual Breaks:**
   - Insert visual element every 150-200 words
   - Options: bullet lists, blockquotes, images, tables
   - Prevents "wall of text" effect
   - Improves scroll depth by 30%

3. **Heading Structure:**
   - Clear H2 section breaks every 300-400 words
   - H3 subsections for detailed breakdowns
   - Numbered H2 sections for guides (e.g., "1. First Major Point")
   - All headings must be descriptive and keyword-rich

4. **Blockquote Usage:**
   - 2-3 blockquotes per blog post minimum
   - Use `>` for key takeaways, statistics, or expert insights
   - Example: `> **Quick Takeaway:** 60% of marketers see ROI within 30 days.`
   - Helps break up content visually

5. **List Formatting:**
   - Use bullet lists for features, benefits, tips
   - Use numbered lists for step-by-step processes
   - Keep list items to 2-3 lines maximum
   - Space between list sections

6. **FAQ Section Formatting:**
   - Use H3 for each question (`### How does X work?`)
   - Answer in 3-5 short paragraphs (4 lines max each)
   - Include data, examples, and actionable insights
   - Optimize for featured snippets

7. **Introduction Structure:**
   - Hook: 1-2 sentences grabbing attention
   - Problem: 2-3 sentences defining the issue
   - Solution preview: 1-2 sentences teasing the content
   - Quick Answer blockquote for featured snippets
   - Total: 100-150 words, 2-3 paragraphs max

**Example Optimized Structure:**
```markdown
# Main Title (H1)

Brief hook paragraph introducing the topic (3-4 lines max).

Problem statement paragraph explaining why this matters (3-4 lines max).

> **Quick Takeaway:** Direct 2-3 sentence answer optimized for featured snippets.

## 1. First Major Section (H2)

Opening paragraph (4 lines max) introducing the section.

### Key Points (H3)

- **Point 1:** Explanation with specific benefit (2-3 lines)
- **Point 2:** Example with data or statistic
- **Point 3:** Actionable insight with clear outcome

Visual break ensures readability.

### Implementation Steps (H3)

1. **Step 1: Action Item** - Clear explanation (2-3 lines)
2. **Step 2: Next Action** - Specific details with examples
3. **Step 3: Final Step** - Expected outcome

> 💡 **Pro Tip:** Actionable insight in blockquote format.

## 2. Second Major Section (H2)

Continue with same pattern...

## Frequently Asked Questions

### How does [specific question work]?

Answer in 3-5 short paragraphs (4 lines max each). Include specific examples, data points, and actionable insights. Optimize for featured snippet format.

### What are the benefits of [topic]?

Detailed answer with:
- Benefit 1 with percentage increase
- Benefit 2 with time saved
- Benefit 3 with cost reduction

## Conclusion

Final thoughts (100 words max) with clear call-to-action linking to relevant Disruptors AI service.
```

**Readability Targets:**
- Line length: 65-70 characters (optimal width: 680px)
- Line height: 1.7 for body text
- Font size: 17px body, 30px H2, 24px H3
- White space: Generous margins and spacing
- Table of Contents: Auto-generated for posts >1,500 words
- Reading Progress: Visual indicator at top of page

### 2. Blog Publishing Management

**Publish Single Blog:**
```javascript
// Publish approved blog by slug
const { data } = await supabase
  .from('posts')
  .update({
    is_published: true,
    published_at: new Date().toISOString(),
    status: 'published'
  })
  .eq('slug', 'blog-slug')
```

**Configure Publishing Schedule:**
```bash
# Set up automated publishing schedule
node scripts/configure-blog-publishing-schedule.js
```

**Schedule Features:**
- Phase 1: 3x per week (Mon/Wed/Fri) for 90 days
- Phase 2: 2x per week (Tue/Thu) after 90 days
- Automatic blog scheduling based on approval
- Buffer management (maintains 10+ approved blogs)
- System settings integration

### 3. Blog Strategy & Planning

**Create Content Strategy:**
```bash
# Analyze market, competitors, keywords
# Generate 20-blog comprehensive strategy
node scripts/create-blog-content-strategy.js
```

**Strategy Components:**
- Keyword research integration (DataForSEO)
- Competitor analysis (web scraping + analysis)
- Industry trend identification
- ICP-focused topic selection
- SEO opportunity mapping
- Publishing calendar planning

### 4. Image Generation

**Generate Blog Images:**
```bash
# Generate professional header images
node scripts/generate-blog-post-images.js
```

**Image Specs:**
- Provider: OpenAI gpt-image-1 (NOT DALL-E)
- Dimensions: 1536x1024 (wide blog header format)
- Quality: High
- Output: `/public/blog-images/generated/`
- Naming: `{slug}.png`

### 5. Blog Import/Export

**Import Existing Blogs:**
```bash
# Import markdown blogs into Supabase
node scripts/import-generated-blogs.js
```

**Export for Backup:**
```bash
# Export all published blogs to markdown
node scripts/export-blogs-to-markdown.js
```

### 6. Monitoring & Analytics

**Monitor Generation:**
```bash
# Real-time blog generation monitoring
node scripts/monitor-blog-generation.js
```

**Check Status:**
```bash
# Quick status check
node -e "import { createClient } from '@supabase/supabase-js'; ..."
```

## System Architecture

### Database Schema (posts table)

**Required Fields:**
- `title` - Blog post title (H1)
- `slug` - URL-friendly slug
- `content` - Full markdown content
- `excerpt` - Short description (160 chars)
- `meta_description` - SEO meta description (155 chars)
- `primary_keyword` - Main SEO keyword
- `secondary_keywords` - Array of related keywords
- `featured_image` - Path to header image

**Metadata Fields:**
- `content_type` - Always "blog_post"
- `word_count` - Total word count
- `reading_time_minutes` - Calculated read time
- `ai_generated` - Boolean (true for AI blogs)
- `generation_metadata` - JSON with model info

**Status Fields:**
- `status` - draft | published | archived
- `approval_status` - pending_review | approved | scheduled | published
- `is_published` - Boolean
- `published_at` - Timestamp
- `scheduled_publish_date` - Future publish date

**SEO Fields:**
- `seo_title` - Title tag
- `seo_description` - Meta description
- `seo_keywords` - Array of all keywords

### File Structure

```
/scripts/
  ├── generate-20-comprehensive-blogs.js     # Bulk generation
  ├── generate-single-blog.js                # Single blog
  ├── generate-blog-post-images.js           # Image generation
  ├── configure-blog-publishing-schedule.js  # Publishing setup
  ├── import-generated-blogs.js              # Import utility
  ├── monitor-blog-generation.js             # Progress monitoring
  └── comprehensive-blog-content-strategy.json # Strategy definition

/temp/
  ├── generated-blogs/                       # Markdown backups
  │   ├── blog-slug-1.md
  │   └── blog-slug-2.md
  └── blog-generation-report.json            # Generation summary

/public/blog-images/generated/               # Blog header images
  ├── blog-slug-1.png
  └── blog-slug-2.png

/docs/
  ├── BLOG_CONTENT_STRATEGY_COMPLETE.md      # Full strategy doc
  └── AUTOBLOG_SYSTEM.md                     # Technical docs
```

## Blog Generation Workflow

### Standard Workflow

1. **Strategy Phase:**
   - Define topic and keywords
   - Analyze competitors
   - Create content outline
   - Identify ICP pain points

2. **Generation Phase:**
   - Generate blog content with Claude Sonnet 4.5
   - Include 7-10 FAQ questions
   - Optimize for SEO and featured snippets
   - Save markdown backup

3. **Assets Phase:**
   - Generate header image (gpt-image-1)
   - Optimize image for web
   - Link image to blog post

4. **Publishing Phase:**
   - Insert into Supabase posts table
   - Set approval_status to pending_review
   - Admin reviews in Admin Nexus
   - Approve and schedule
   - Auto-publish on schedule

### Bulk Generation Workflow

1. **Create comprehensive strategy** (20+ blogs)
2. **Generate all content** (background process, 40-60 min)
3. **Import to Supabase** (automatic or manual)
4. **Configure publishing schedule** (3x/week → 2x/week)
5. **Review and approve** in Admin Nexus
6. **Auto-publish** on schedule

## Integration Points

### Admin Nexus Integration

**Blog Management Module:** `/admin/secret` → Blog Management
- View all blogs (published, draft, pending)
- Approve/reject blog posts
- Edit content and metadata
- Schedule publishing dates
- Preview before publishing
- Bulk actions (approve multiple, schedule multiple)

### Business Brain Integration

All generated blogs automatically use:
- Brand voice from Business Brain
- Company-specific facts and data
- Industry terminology
- Unique value propositions
- Product/service descriptions

### SEO Optimization

**Automatic SEO Features:**
- Primary keyword in title, intro, conclusion
- Secondary keywords naturally distributed
- Meta description optimization
- Header hierarchy (H1 → H2 → H3)
- Featured snippet formatting
- Answer Box format in introduction
- Schema.org hints in FAQ sections

## Usage Examples

### Example 1: Generate Single Blog Post

```javascript
// User: "Write a blog post about AI-powered email marketing"

// Agent Response:
1. Research keyword opportunities for "AI email marketing"
2. Generate 2,800-word comprehensive blog with:
   - Data-driven introduction
   - 5-7 main sections (H2)
   - Actionable framework
   - 7-10 FAQ questions
   - Strong CTA
3. Generate professional header image
4. Insert into Supabase with pending_review status
5. Notify user to review in Admin Nexus
```

### Example 2: Create 30-Day Content Strategy

```javascript
// User: "Create a 30-day blog content strategy for our ICP"

// Agent Response:
1. Analyze current blog performance
2. Research competitor blog topics
3. Identify keyword opportunities (DataForSEO)
4. Create 13 blog topics (3x/week for 30 days)
5. Generate all 13 blogs with Claude Sonnet 4.5
6. Generate header images for each
7. Configure publishing schedule (Mon/Wed/Fri)
8. Set up automated publishing
9. Create performance tracking dashboard
```

### Example 3: Import Legacy Blogs

```javascript
// User: "Import my 50 existing blog posts from markdown files"

// Agent Response:
1. Read all markdown files from specified directory
2. Extract metadata (title, keywords, dates)
3. Generate missing featured images
4. Calculate word counts and read times
5. Insert into Supabase posts table
6. Set appropriate status based on publication date
7. Generate import report with stats
```

### Example 4: Monitor Blog Generation

```javascript
// User: "Check the status of the blog generation job"

// Agent Response:
1. Query temp/generated-blogs/ for markdown files
2. Check Supabase for inserted blogs
3. Calculate progress percentage
4. Estimate time remaining
5. Show recent blogs generated
6. Alert if errors detected
```

## Error Handling

### Common Errors & Solutions

**Schema Mismatch Error:**
```
Error: Could not find the 'generation_model' column
Solution: Remove generation_model field, use generation_metadata instead
```

**Image Generation Error:**
```
Error: Invalid dimensions '1792x1024'
Solution: Use supported dimensions: 1536x1024, 1024x1536, 1024x1024
```

**Duplicate Slug Error:**
```
Error: duplicate key value violates unique constraint "posts_slug_key"
Solution: Check if blog already exists, use different slug or update existing
```

**Rate Limit Error:**
```
Error: Rate limit exceeded (Claude API)
Solution: Add 3-second delay between requests, reduce concurrent generations
```

## Performance Metrics

### Generation Speed
- **Single Blog:** 2-3 minutes (2,500-3,400 words)
- **20 Blogs:** 40-60 minutes total
- **Image Generation:** 15-20 seconds per image

### Quality Metrics
- **Word Count:** 2,500-3,400 words average
- **FAQ Questions:** 7-10 per blog
- **SEO Score:** 85-95% (Yoast/RankMath equivalent)
- **Readability:** Flesch Reading Ease 60-70

### Cost Estimates
- **Blog Generation:** $0.60-0.75 per blog (Claude Sonnet 4.5)
- **Image Generation:** $0.02-0.03 per image (gpt-image-1)
- **20-Blog Package:** $14-18 total

## Best Practices

### Content Quality
- Always include 7-10 FAQ questions
- Use data and statistics from 2025 research
- Include actionable frameworks/checklists
- Write in professional but conversational tone
- Target B2B decision-makers
- Showcase unique Disruptors AI features

### SEO Optimization
- Primary keyword in first 100 words
- Natural keyword distribution (avoid stuffing)
- Answer Box format in introduction
- Structured FAQ sections for featured snippets
- Internal linking opportunities
- Schema.org structured data

### Publishing Strategy
- Maintain 10+ blog buffer
- Review all blogs before approval
- Schedule during peak traffic times
- Monitor performance metrics
- Update evergreen content quarterly
- Refresh statistics annually

## Agent Execution Pattern

When invoked, this agent should:

1. **Understand Intent:**
   - Single blog or bulk generation?
   - Topic/keywords provided or need research?
   - Images needed?
   - Publishing schedule needed?

2. **Execute Workflow:**
   - Run appropriate scripts
   - Monitor progress
   - Handle errors gracefully
   - Provide status updates

3. **Verify Completion:**
   - Check Supabase for inserted blogs
   - Verify markdown backups exist
   - Confirm images generated
   - Test publishing schedule

4. **Report Results:**
   - Summary of blogs generated
   - Links to Admin Nexus for review
   - Next steps for user
   - Performance metrics

## Maintenance

### Weekly Tasks
- Monitor blog generation success rate
- Check publishing schedule adherence
- Review blog performance metrics
- Approve pending blogs in Admin Nexus

### Monthly Tasks
- Analyze blog traffic and engagement
- Update content strategy based on performance
- Refresh top-performing blogs with new data
- Generate additional blogs to maintain buffer

### Quarterly Tasks
- Comprehensive content audit
- Update all statistics and data
- Review and optimize underperforming blogs
- Adjust publishing strategy based on analytics

## Documentation References

- **Full Strategy:** `BLOG_CONTENT_STRATEGY_COMPLETE.md`
- **Technical Docs:** `docs/AUTOBLOG_SYSTEM.md`
- **Admin Guide:** `docs/guides/BLOG_MANAGEMENT_GUIDE.md`
- **API Reference:** `docs/api/BLOG_API.md`

---

**Generated:** October 20, 2025
**Version:** 1.0
**System:** Disruptors AI Marketing Hub Blog Orchestrator
