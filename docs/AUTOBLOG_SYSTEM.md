# AutoBlog System Documentation

## Overview

The AutoBlog System is an AI-powered blog article generation system integrated into the Disruptors AI Marketing Hub. It uses Anthropic's Claude Sonnet 4.5 to automatically generate SEO-optimized, brand-aligned blog articles based on titles and keywords.

## System Architecture

### Components

1. **Blog Management Interface** (`src/pages/blog-management.jsx`)
   - Spreadsheet-like UI for managing blog posts
   - "Write Articles" button triggers AI generation
   - Real-time progress tracking during generation
   - Integration with Supabase database

2. **Anthropic Blog Writer** (`src/lib/anthropic-blog-writer.js`)
   - Core AI generation logic using Anthropic API
   - System prompt engineering for SEO optimization
   - Batch processing with rate limiting
   - Progress callbacks for UI updates

3. **Supabase Posts Table** (Database)
   - Stores all blog post data
   - Schema includes title, content, SEO fields, metadata
   - Supports drafts and published states

### Data Flow

```
┌─────────────────────┐
│  Google Sheets      │ (Optional source)
│  (Legacy system)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Blog Management    │ ◄──── User creates/edits posts
│  Interface          │       - Adds titles
└──────────┬──────────┘       - Sets keywords
           │                  - Configures metadata
           │
           │ [User clicks "Write Articles"]
           │
           ▼
┌─────────────────────┐
│  Anthropic API      │ ◄──── System prompt + post data
│  (Claude Sonnet)    │       - Title
└──────────┬──────────┘       - Primary keyword
           │                  - Secondary keyword
           │                  - Target URL
           │                  - Location (optional)
           │
           │ [Generated article content]
           │
           ▼
┌─────────────────────┐
│  Blog Management    │ ◄──── User reviews generated content
│  UI Update          │       - Edits if needed
└──────────┬──────────┘       - Approves quality
           │
           │ [User clicks "Send to Supabase"]
           │
           ▼
┌─────────────────────┐
│  Supabase Database  │ ◄──── Posts stored/updated
│  (posts table)      │       - content field populated
└─────────────────────┘       - read_time calculated
```

## System Prompt

The system uses a sophisticated prompt engineered for blog content generation following the official [Blog Content Standards](./BLOG_CONTENT_STANDARDS.md). All generated articles adhere to these standards:

### Core Requirements (from Blog Content Standards)
- **Minimum 1,200 words** in narrative, conversational style
- **No em dashes** - use commas or parentheses instead
- **Maximum 2 lists** total per article
- **5 FAQ questions** with ### headings
- **No generic headings** like "Introduction" or "Conclusion"
- **Primary keyword** in H1 and first 150 words
- **1-2 internal links** to relevant pages
- **1-2 external links** to authoritative sources
- **Markdown-only output** (no code fences)

### Additional Optimizations

The system prompt also includes these enhancements:

### SEO Optimization
- **Primary keyword targeting**: Main keyword integrated throughout
- **Secondary keyword support**: Related keyword for semantic depth
- **AIO & GEO optimization**: Formatted for AI Overviews and LLM citations
- **Answer Box format**: Direct, quotable answers upfront
- **Entity-rich phrasing**: Names, tools, standards, locations
- **Structured data hints**: Schema.org guidance included

### Brand Voice (Disruptors & Co)
- **Bold and attention-grabbing**: No generic corporate speak
- **Occasionally contrarian**: Challenges conventional wisdom
- **No fluff**: Every sentence adds value
- **Conversation-starter**: Built to engage and provoke thought
- **Target audience**: Non-experts in skilled trades and service businesses

### Content Structure
1. **H1**: Article title
2. **H2 Answer Box**: 3-5 sentence direct answer
3. **Key Facts**: Mini-table or brief list
4. **H2 Core Strategy**: Mapped to search intent
   - H3: Step-by-step process
   - H3: Tools & setup (Ahrefs-focused)
   - H3: Troubleshooting & edge cases
5. **H2 Local SEO Block**: (if location provided)
6. **H2 Measurement Plan**: KPIs and tracking
7. **H2 FAQs**: 5 questions based on search intent
8. **H2 Schema Hint**: Structured data recommendations

### Hard Style Rules
- ✅ At least 1,200 words
- ✅ Narrative style with H1/H2/H3 formatting
- ✅ 1-2 internal links to {{TARGET_URL}}
- ✅ 1-2 external links to authoritative sources
- ✅ 5 FAQs driven by real search intent
- ❌ No em dashes
- ❌ Maximum two lists total
- ❌ No first-person language
- ❌ No generic headings ("Introduction", "Conclusion")

### Uniqueness Engine
Each article randomly selects from these variations to ensure diversity:
- **Opening Hook**: curiosity gap | micro-story | myth-bust | high-stakes | data snapshot
- **Narrative Frame**: mentor-apprentice | job-site checklist | field report | customer turning point | cost-leak autopsy
- **Metaphor Theme**: toolbox | blueprint | relay race | triage room | pit crew
- **Proof Device**: mini case | before/after | 30-day plan | competitor delta | KPI math
- **CTA Flavor**: quick win | measure KPI | compare benchmark | save checklist

## Usage Guide

### Prerequisites

1. **Environment Variables** (`.env` file):
   ```bash
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Anthropic API Access**:
   - Sign up at [console.anthropic.com](https://console.anthropic.com)
   - Create an API key
   - Note: Uses Claude Sonnet 4.5 (model: `claude-sonnet-4-20250514`)

3. **Supabase Database**:
   - Posts table must exist with proper schema
   - Run migrations: `npm run db:setup`

### Step-by-Step Workflow

#### 1. Access Blog Management
Navigate to `/blog-management` in your admin dashboard:
- 5 logo clicks in 3 seconds OR `Ctrl+Shift+D` activates admin access
- Login with Matrix-style authentication
- Click "Blog Management" in admin menu

#### 2. Pull Existing Posts
```
Options:
A. Pull from Supabase: Click "Pull from Supabase" button
B. Pull from Google Sheets: Click "Pull from Sheets" (if configured)
C. Create new posts: Click "Add Post" button
```

#### 3. Prepare Posts for Generation
Ensure each post has:
- ✅ **Title**: Clear, descriptive article title
- ✅ **SEO Keywords**: Primary and secondary keywords (comma-separated)
- ✅ **Tags**: Alternative keyword source if seo_keywords empty
- ⚠️ **Content**: Should be empty or minimal (<200 characters)
- 📍 **Location** (optional): For local SEO optimization

**Example Post Setup**:
```javascript
{
  title: "How a 360 Marketing Agency Builds Revenue Streams You Never Knew Existed",
  seo_keywords: ["marketing agency", "revenue streams", "business growth"],
  tags: ["marketing", "agency", "revenue"],
  category: "Marketing Strategy",
  content: "", // Empty - ready for generation
  location: "" // Optional: "Austin, TX" for local SEO
}
```

#### 4. Generate Articles
Click the **"Write Articles"** button:
- System checks for VITE_ANTHROPIC_API_KEY
- Filters posts without content (or <200 chars)
- Shows confirmation dialog with count
- Generates articles with progress tracking
- Updates posts in real-time

**Progress Indicator**:
```
🤖 Generating articles: 3/8 - "How a 360 Marketing Agency..."
```

#### 5. Review Generated Content
After generation:
- Click cells to edit content inline
- Use "Preview Post" (👁️) to see rendering
- Use "Auto-Enrich Fields" (✨) to generate:
  - Slug (from title)
  - Meta description (from excerpt)
  - Read time (from word count)
  - Tags (from content keywords)

#### 6. Send to Supabase
Click **"Send to Supabase"** button:
- Updates existing posts (by slug)
- Creates new posts if slug not found
- Shows success/error summary
- Console logs detailed results

#### 7. Publish Posts
For each post:
- Set `is_published` to `true`
- Set `publishDate` to desired date
- Click "Approve & Publish" (✓) button
- Optionally generate featured image (🖼️)

### Auto-Fill Feature Integration

The **"Auto-Fill All"** button complements article generation:
- Generates slugs from titles
- Creates excerpts (if content exists, uses first 200 chars)
- Sets default categories ("AI & Marketing")
- Sets default images (Unsplash placeholders)
- Staggers publish dates (every 3 days)
- Calculates read times

**Recommended Workflow**:
1. Click "Auto-Fill All" → Sets metadata defaults
2. Click "Write Articles" → Generates full content
3. Review and edit inline
4. Click "Send to Supabase" → Saves to database

## Keyword Extraction Logic

The system intelligently extracts keywords for article generation:

```javascript
// Priority order:
1. seo_keywords field (preferred)
2. tags field (fallback)
3. category field (last resort)

// Extraction:
const keywords = post.seo_keywords || post.tags || '';
const keywordArray = typeof keywords === 'string'
  ? keywords.split(',').map(k => k.trim())
  : Array.isArray(keywords) ? keywords : [];

const primaryKeyword = keywordArray[0] || post.title;
const secondaryKeyword = keywordArray[1] || keywordArray[0] || post.category;
```

### Best Practices for Keyword Setup

**Good Example**:
```javascript
{
  title: "Why Smart Businesses Choose a Podcasting & SEO Agency",
  seo_keywords: ["podcasting agency", "SEO agency", "podcast marketing"],
  tags: ["podcasting", "SEO", "marketing"],
  category: "Content Marketing"
}
// Generates: Primary="podcasting agency", Secondary="SEO agency"
```

**Suboptimal Example**:
```javascript
{
  title: "Some Random Title",
  seo_keywords: "", // Empty!
  tags: "generic, vague", // Too generic
  category: "Uncategorized"
}
// Generates: Primary="Some Random Title", Secondary="generic" (poor SEO)
```

## API Rate Limiting

To prevent API throttling:
- **Batch processing**: Processes posts sequentially
- **2-second delay**: Between each article generation
- **Progress callbacks**: Real-time UI updates
- **Error handling**: Continues on failure, logs errors

```javascript
// Rate limiting implementation
if (i < posts.length - 1) {
  await new Promise(resolve => setTimeout(resolve, 2000));
}
```

### Estimated Generation Times

| Posts | Total Time | Cost (Approx) |
|-------|-----------|---------------|
| 1     | ~30 sec   | $0.50         |
| 5     | ~3 min    | $2.50         |
| 10    | ~6 min    | $5.00         |
| 20    | ~12 min   | $10.00        |

*Based on Claude Sonnet 4.5 pricing and 1,200-1,500 word articles*

## Database Schema Integration

### Supabase Posts Table

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content fields
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT, -- Generated by AutoBlog system
  content_type TEXT DEFAULT 'blog',

  -- Media
  featured_image TEXT,
  gallery_images TEXT[],

  -- Author
  author_id UUID REFERENCES auth.users(id),

  -- Categorization
  category TEXT,
  tags TEXT[], -- Used for keyword extraction

  -- Publishing
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,

  -- SEO fields
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[], -- Primary source for article generation

  -- Metadata
  read_time_minutes INTEGER, -- Auto-calculated after generation
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Field Mapping: Blog Management → Supabase

| Blog Management Field | Supabase Column | Notes |
|-----------------------|----------------|-------|
| `title` | `title` | Direct mapping |
| `slug` | `slug` | Auto-generated from title |
| `excerpt` | `excerpt` | First 200 chars of content |
| `content` | `content` | **Generated by AI** |
| `seo_keywords` | `seo_keywords` | Array of keywords |
| `tags` | `tags` | Fallback for keywords |
| `category` | `category` | Content category |
| `image` / `imageUrl` | `featured_image` | URL string |
| `is_published` | `is_published` | Boolean |
| `publishDate` | `published_at` | ISO timestamp |
| `metaDescription` | `seo_description` | Truncated excerpt |
| `author` | `author_id` | User UUID (manual mapping) |
| `read_time_minutes` | `read_time_minutes` | Words / 200 |

## Error Handling

### Common Errors and Solutions

#### 1. Missing API Key
**Error**: `VITE_ANTHROPIC_API_KEY not configured`

**Solution**:
```bash
# Add to .env file
VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxx
```

#### 2. All Posts Have Content
**Error**: `All posts already have content. Clear content to regenerate articles.`

**Solution**:
- Edit posts in UI and clear `content` field
- Or create new posts without content
- System skips posts with >200 characters of content

#### 3. API Rate Limiting
**Error**: `429 Too Many Requests`

**Solution**:
- System has built-in 2-second delays
- If error persists, check Anthropic console usage limits
- Consider upgrading API tier for higher rate limits

#### 4. Generation Failures
**Warning**: `Generated X articles, Y failed`

**Solution**:
- Check browser console for detailed error messages
- Common causes:
  - Invalid API key
  - Network issues
  - Malformed post data (missing title)
- Failed posts remain unchanged; retry after fixing issues

## Advanced Configuration

### Custom Target URLs for Internal Links

Edit `src/lib/anthropic-blog-writer.js`:

```javascript
// Default target URL for all articles
targetUrl = 'https://dm4.wjwelsh.com'

// Or customize per article:
const targetUrl = post.category === 'SEO'
  ? 'https://dm4.wjwelsh.com/solutions-seo'
  : 'https://dm4.wjwelsh.com';
```

### Location-Based SEO

Add location field to blog management for local SEO:

```javascript
{
  title: "Best HVAC Marketing Strategies in Austin",
  seo_keywords: ["HVAC marketing", "Austin HVAC", "local SEO"],
  location: "Austin, TX" // Triggers local SEO block
}
```

### Adjusting Article Length

Edit system prompt in `src/lib/anthropic-blog-writer.js`:

```javascript
// Default: 1,200 words minimum
"Write at least 1,200 words in narrative style..."

// For longer articles:
"Write at least 2,000 words in narrative style..."
```

### Model Configuration

```javascript
// Current model (recommended)
model: 'claude-sonnet-4-20250514' // Claude Sonnet 4.5

// For faster, cheaper generation (less quality):
model: 'claude-sonnet-3-7-20250219' // Claude Sonnet 3.7

// For maximum quality (slower, expensive):
model: 'claude-opus-4-20250514' // Claude Opus 4.1
```

## Integration with Existing Systems

### Google Sheets Integration
AutoBlog system works alongside Google Sheets:
1. Pull posts from Google Sheets → Blog Management
2. Generate articles with "Write Articles"
3. Push updated posts back to Google Sheets (optional)
4. Send to Supabase for permanent storage

### Cloudinary Image Integration
Generate featured images after article generation:
1. Click "Generate Image" (🖼️) button
2. Uses AI image generation (separate system)
3. Uploads to Cloudinary
4. Updates `featured_image` field

### Deployment Integration
After generating and publishing articles:
1. Articles stored in Supabase
2. Netlify deployment auto-triggers (if configured)
3. Blog pages render from Supabase data
4. SEO metadata included in page headers

## Performance Optimization

### Browser Considerations
**Security Warning**: Currently uses `dangerouslyAllowBrowser: true`

**Production Recommendation**: Implement backend proxy
```javascript
// Backend endpoint (Node.js/Express)
app.post('/api/generate-article', async (req, res) => {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY // Server-side only
  });
  // ... generation logic
});
```

### Caching Strategy
Future enhancement: Cache generated articles
```javascript
// Check cache before generating
const cached = await getCachedArticle(title, keywords);
if (cached) return cached;

// Generate and cache
const content = await generateBlogArticle(...);
await cacheArticle(title, keywords, content);
```

## Monitoring and Analytics

### Track Generation Success Rate
Console logs provide insights:
```javascript
console.log('✅ Article generated successfully!');
console.log(`📊 Word count: ~${wordCount} words`);
```

### Review Article Quality
After generation:
1. Check word count (should be 1,200+)
2. Verify H2 Answer Box is present
3. Confirm 5 FAQs included
4. Check internal/external links
5. Review brand voice alignment

### API Usage Tracking
Monitor via Anthropic Console:
- Total API calls
- Token usage (input/output)
- Cost per article
- Error rates

## Troubleshooting Guide

### Issue: Articles Don't Match Brand Voice
**Diagnosis**: System prompt needs adjustment
**Fix**: Edit `SYSTEM_PROMPT` in `src/lib/anthropic-blog-writer.js`
- Emphasize "bold, no-fluff, contrarian" in multiple places
- Add example phrasing
- Specify what to avoid (corporate speak, jargon)

### Issue: Poor Keyword Optimization
**Diagnosis**: Keywords not extracted properly
**Fix**: Ensure `seo_keywords` field populated before generation
```javascript
// Before generating, verify:
console.log('Keywords:', post.seo_keywords);
// Should output: ["primary keyword", "secondary keyword"]
```

### Issue: Articles Too Short
**Diagnosis**: Model not following length requirement
**Fix**: Increase `max_tokens` in API call
```javascript
max_tokens: 4096 // Current
max_tokens: 8192 // For longer articles
```

### Issue: Slow Generation
**Diagnosis**: Sequential processing + 2-second delays
**Fix**: Normal behavior for batch processing
- 1 article: ~30 seconds
- 10 articles: ~6 minutes
- Consider generating in smaller batches

## Future Enhancements

### Planned Features
- [ ] **Selective generation**: Checkboxes to choose specific posts
- [ ] **Content refresh**: Regenerate button for existing articles
- [ ] **A/B testing**: Generate multiple versions, compare performance
- [ ] **Custom prompts**: User-editable system prompts per category
- [ ] **Backend proxy**: Move API calls server-side for security
- [ ] **Image generation**: Auto-generate featured images during article creation
- [ ] **Multi-language**: Generate articles in multiple languages
- [ ] **Content calendar**: Auto-schedule generation based on publish dates

### Potential Integrations
- **WordPress**: Direct publishing to WordPress sites
- **Medium**: Cross-post to Medium platform
- **LinkedIn**: Share as LinkedIn articles
- **Analytics**: Track which AI-generated articles perform best

## API Reference

### `generateBlogArticle(params)`
Generates a single blog article.

**Parameters**:
```typescript
{
  title: string,           // Blog post title
  primaryKeyword: string,  // Main keyword
  secondaryKeyword: string,// Supporting keyword
  targetUrl?: string,      // Internal link target (default: site URL)
  primaryLocation?: string // Location for local SEO (optional)
}
```

**Returns**: `Promise<string>` - Generated article content (HTML/Markdown)

**Example**:
```javascript
const content = await generateBlogArticle({
  title: "Best HVAC Marketing Strategies in 2025",
  primaryKeyword: "HVAC marketing",
  secondaryKeyword: "HVAC advertising",
  targetUrl: "https://dm4.wjwelsh.com/solutions-hvac",
  primaryLocation: "Austin, TX"
});
```

### `batchGenerateArticles(posts, onProgress)`
Generates articles for multiple posts with progress tracking.

**Parameters**:
```typescript
posts: Array<BlogPost>,          // Array of blog post objects
onProgress?: (                   // Optional progress callback
  current: number,
  total: number,
  result: {
    success: boolean,
    title: string,
    error?: string
  }
) => void
```

**Returns**: `Promise<Array<Result>>` - Array of generation results

**Example**:
```javascript
const results = await batchGenerateArticles(
  blogPosts,
  (current, total, result) => {
    console.log(`Progress: ${current}/${total}`);
    console.log(`Current: ${result.title} - ${result.success ? 'Success' : 'Failed'}`);
  }
);

// Results structure:
[
  { postId: 1, success: true, content: "...", title: "Article 1" },
  { postId: 2, success: false, error: "API error", title: "Article 2" }
]
```

## Support and Resources

### Documentation
- **Content Standards**: `docs/BLOG_CONTENT_STANDARDS.md` - Official writing guidelines (NEW)
- **This document**: `docs/AUTOBLOG_SYSTEM.md` - Technical implementation
- **Blog management**: `src/pages/blog-management.jsx` - UI interface
- **AI writer**: `src/lib/anthropic-blog-writer.js` - Generation logic
- **Custom SDK**: `src/lib/custom-sdk.js` - Data layer
- **Blog formatting**: `docs/BLOG_FORMATTING_GUIDE.md` - Visual styling
- **Blog formatting system**: `docs/BLOG_FORMATTING_SYSTEM.md` - ReactMarkdown setup

### External Resources
- [Anthropic API Docs](https://docs.anthropic.com/claude/reference)
- [Claude Prompt Engineering](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [Supabase Database](https://supabase.com/docs/guides/database)

### Getting Help
1. Check browser console for detailed error messages
2. Review Anthropic API console for usage/errors
3. Check Supabase logs for database issues
4. Refer to this documentation for troubleshooting

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintained By**: Disruptors AI Development Team
