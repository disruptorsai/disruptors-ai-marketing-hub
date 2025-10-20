# Blog Orchestrator Agent - Agent Descriptor

## Agent System Integration

Add this to your agent system's available agents list:

```
- blog-orchestrator: Use this agent for all blog-related tasks including content generation, publishing management, SEO optimization, and blog strategy. AUTO-TRIGGERED by keywords: "blog", "blog post", "article", "content strategy", "publish", "SEO blog", "FAQ", or file paths containing "blog". PROACTIVE USE for blog generation monitoring, publishing schedule configuration, and content strategy creation. (Tools: *)
```

## Detailed Description

**Use this agent when:**

1. **Content Generation:**
   - User mentions "write a blog", "create blog posts", "generate article"
   - Need to create single blog or bulk blog content (up to 20+ blogs)
   - Requires 2,500-3,400 word comprehensive articles with 7-10 FAQs
   - SEO-optimized content with primary/secondary keywords

2. **Publishing Management:**
   - User requests "publish blog", "schedule blog posts", "set up content calendar"
   - Configure publishing schedules (3x/week → 2x/week automation)
   - Approve and publish blogs from Admin Nexus queue
   - Manage blog approval workflow

3. **Image Generation:**
   - User needs "blog images", "blog graphics", "header images"
   - Generate professional 1536x1024 header images using OpenAI gpt-image-1
   - Batch image generation for multiple blogs

4. **Strategy & Planning:**
   - User requests "blog content strategy", "keyword research for blogs"
   - Create 30/60/90-day blog content calendars
   - Competitor analysis and SEO opportunity identification
   - ICP-focused topic selection

5. **Monitoring & Analytics:**
   - Background blog generation process running
   - Check status of bulk blog generation jobs
   - Monitor publishing schedule adherence
   - Import/export blog content

**Auto-Triggered Keywords:**
- "blog", "blog post", "article", "write blog", "publish blog"
- "content strategy", "content calendar", "publishing schedule"
- "SEO blog", "keyword research", "FAQ section"
- "blog images", "blog header", "featured image"
- File paths: `/scripts/*blog*.js`, `/temp/generated-blogs/`, `BLOG_*.md`

**Proactive Triggers:**
- Blog generation scripts running in background
- New markdown files in `temp/generated-blogs/`
- Blogs pending review in Admin Nexus
- Publishing schedule needs configuration
- Blog performance analysis needed

## Core Capabilities Summary

**Generation:**
- Single or bulk blog generation (up to 20+ blogs)
- Claude Sonnet 4.5 powered content
- 2,500-3,400 words per blog
- 7-10 FAQ questions per blog
- Automatic Business Brain integration
- SEO optimization with primary/secondary keywords

**Publishing:**
- Automated publishing schedules (Phase 1: 3x/week, Phase 2: 2x/week)
- Blog approval workflow management
- Scheduled publishing dates
- Buffer management (maintains 10+ approved blogs)

**Images:**
- OpenAI gpt-image-1 generation (NOT DALL-E)
- 1536x1024 professional header images
- Batch generation for multiple blogs

**Strategy:**
- Keyword research integration (DataForSEO)
- Competitor analysis
- ICP-focused topic selection
- 30/60/90-day content calendars

**Tools:**
- `generate-20-comprehensive-blogs.js` - Bulk generation
- `generate-single-blog.js` - Single blog
- `generate-blog-post-images.js` - Image generation
- `configure-blog-publishing-schedule.js` - Publishing setup
- `import-generated-blogs.js` - Import utility
- `monitor-blog-generation.js` - Progress monitoring

## Example Invocations

**Example 1: Generate Content Strategy**
```
User: "Create a 30-day blog content strategy for our AI marketing platform"
Assistant: "I'm using the blog-orchestrator agent to research keywords, analyze competitors, and generate a comprehensive 30-day blog strategy with publishing schedule."
<Task tool invocation to blog-orchestrator agent>
blog-orchestrator: "Analyzing AI marketing keyword opportunities... [creates 13-blog strategy] Strategy created with Mon/Wed/Fri publishing schedule for 30 days. Generating first 3 blogs now..."
```

**Example 2: Publish Blog**
```
User: "Publish the approved blog post about AI ROI"
Assistant: "I'm using the blog-orchestrator agent to publish the approved blog post."
<Task tool invocation to blog-orchestrator agent>
blog-orchestrator: "Found approved blog: 'AI Marketing ROI 2025'... Publishing now... ✅ Published at /blog/ai-marketing-roi-2025"
```

**Example 3: Monitor Generation**
```
System: [Background process detected: generate-20-comprehensive-blogs.js]
Assistant: "I'm activating the blog-orchestrator agent to monitor the blog generation process."
<Task tool invocation to blog-orchestrator agent>
blog-orchestrator: "Monitoring blog generation... Progress: 6/20 blogs (30% complete). Estimated completion: 35 minutes. All blogs include FAQ sections. Will notify when complete."
```

**Example 4: Create Single Blog**
```
User: "Write a blog post about AI-powered email marketing with FAQ section"
Assistant: "I'm using the blog-orchestrator agent to generate a comprehensive blog post about AI email marketing."
<Task tool invocation to blog-orchestrator agent>
blog-orchestrator: "Researching 'AI email marketing' keywords... Generating 2,800-word blog with 8 FAQ questions... Creating header image... ✅ Blog generated and saved. Review at Admin Nexus (/admin/secret → Blog Management)"
```

## Integration with Existing Systems

**Admin Nexus:**
- Blog Management module at `/admin/secret`
- Approval workflow: pending_review → approved → scheduled → published
- Real-time blog queue management

**Business Brain:**
- Automatic brand voice integration
- Company-specific facts and data
- Unique value propositions

**Supabase:**
- `posts` table for all blog data
- `system_settings` for publishing schedules
- Real-time subscriptions for updates

## Performance Metrics

- **Single Blog:** 2-3 minutes
- **20 Blogs:** 40-60 minutes
- **Image Generation:** 15-20 seconds per image
- **Cost per Blog:** $0.60-0.75 (content) + $0.02-0.03 (image)

## When NOT to Use

- Simple text content (not blog posts)
- Social media posts (use social media agent)
- Email newsletters (use email agent)
- Landing page copy (use copywriting agent)
- Product descriptions (use product content agent)

---

**For full documentation, see:** `docs/agents/BLOG_ORCHESTRATOR_AGENT.md`
