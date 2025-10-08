# AI Content Writer System

**Implementation Date**: January 8, 2025
**Status**: ✅ Complete
**Route**: `/ai-content-writer`
**Component**: `src/pages/ai-content-writer.jsx`

---

## Overview

The **AI Content Writer** is a comprehensive Business Brain-powered blog content generation system that enables users to create, edit, and publish SEO-optimized blog articles using AI assistance.

### Key Features

- **Brain-Powered Generation**: Uses Business Brain knowledge base for contextual content
- **4-Tab Workflow**: Title → Article → Editor → Library
- **ReactQuill WYSIWYG**: Rich text editing with full formatting toolbar
- **Auto-Markdown Conversion**: Automatically converts markdown to HTML
- **SEO Management**: Meta titles, descriptions, and slug optimization
- **Publishing Workflow**: 5-status system (Draft → Needs Review → Approved → Scheduled → Published)
- **Responsive Design**: Fully responsive with Radix UI components

---

## System Architecture

### Component Structure

```
src/pages/ai-content-writer.jsx
├─ AIContentWriter (Main Component)
│  ├─ TitleGenerator (Tab 1)
│  ├─ ArticleGenerator (Tab 2)
│  ├─ PostEditor (Tab 3)
│  └─ ContentLibrary (Tab 4)
```

### Dependencies

**Installed**:
- `react-quill@^2.0.0` - WYSIWYG editor
- `react-quill/dist/quill.snow.css` - Editor styles

**Existing**:
- `@supabase/supabase-js` - Database operations
- `sonner` - Toast notifications
- `lucide-react` - Icons
- Radix UI components (Button, Card, Input, Select, Tabs, Badge, Label, Textarea)

### Database Schema

The system uses the `posts` table with the following columns:

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brain_id UUID REFERENCES business_brains(id) ON DELETE CASCADE,

  -- Content
  title TEXT NOT NULL,
  content TEXT,
  primary_keyword TEXT,
  secondary_keywords TEXT,

  -- SEO Metadata
  meta_title TEXT,
  meta_description TEXT,
  slug TEXT UNIQUE,

  -- Publishing
  status TEXT DEFAULT 'Draft',
  scheduled_date TIMESTAMPTZ,

  -- Metadata
  ai_generated BOOLEAN DEFAULT false,
  created_by TEXT,
  editor_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Migration**: `supabase/migrations/20250108_ai_content_writer_columns.sql`

---

## User Workflow

### 1. Title Generator (Tab 1)

**Purpose**: Generate 5 SEO-optimized blog titles

**Inputs**:
- Topic/Subject (required)
- Primary Keyword (optional)
- Number of Titles (default: 5, range: 1-10)

**Process**:
1. User enters topic and keyword
2. Click "Generate Titles"
3. System calls `BrainAPI.generateContent(brainId, 'blog_title', { topic, primaryKeyword, titleCount })`
4. AI returns 5 titles optimized for SEO
5. User selects one title
6. Click "Use Selected Title" → advances to Article Generator

**Output**: Selected title stored in `localStorage` for next tab

### 2. Article Generator (Tab 2)

**Purpose**: Generate full 1500-3000 word blog articles

**Inputs**:
- Article Title (auto-populated from Tab 1 or manual entry)
- Primary Keyword
- Secondary Keywords (comma-separated)
- Target Word Count (slider: 1500-3000 words)

**Process**:
1. User configures article parameters
2. Click "Generate Article"
3. System calls `BrainAPI.generateContent(brainId, 'blog_article', { topic, primaryKeyword, secondaryKeywords, targetWordCount })`
4. AI generates comprehensive article with:
   - Compelling introduction (150-200 words)
   - 6-8 main sections with H2 headings
   - 5 FAQ questions
   - Strong conclusion with CTA
5. Content appears in ReactQuill editor with real-time word count
6. User reviews/edits content
7. Click "Save Draft" → saves to database with status='Draft'

**Output**: New post in database, advances to Content Library

### 3. Post Editor (Tab 3)

**Purpose**: Edit existing posts with WYSIWYG editor

**Features**:
- **Post Selector**: Left sidebar with all posts (filterable by brain)
- **WYSIWYG Editor**: ReactQuill with rich formatting toolbar
- **Auto-Markdown Conversion**: Detects markdown and converts to HTML
- **Publishing Status**: 5 states (Draft, Needs Review, Approved, Scheduled, Published)
- **SEO Fields**: Meta title, meta description, slug
- **Scheduling**: Calendar picker for scheduled publish date
- **Editorial Notes**: Internal notes for team collaboration

**Toolbar Features**:
- Headers (H2, H3, H4)
- Bold, Italic, Underline, Strike
- Ordered/Unordered Lists
- Links, Images
- Blockquotes, Code Blocks

**Process**:
1. Select post from left sidebar
2. Edit content in ReactQuill
3. Update SEO metadata
4. Set publishing status
5. Schedule publish date (optional)
6. Click "Save Changes"

**Auto-Markdown Conversion**:
```javascript
// Detects if content starts with markdown syntax
if (content.startsWith('#') || content.startsWith('* ') || content.startsWith('- ')) {
  // Converts markdown to HTML automatically
  convertMarkdownToHTML(content);
}
```

### 4. Content Library (Tab 4)

**Purpose**: Manage all blog posts

**Features**:
- **Search**: Full-text search across title and keywords
- **Filter by Status**: All, Draft, Needs Review, Approved, Scheduled, Published
- **Sort Options**: Newest, Oldest, Title A-Z, Title Z-A, Status
- **Post Cards**: Display title, status, keywords, word count, publish date
- **Actions**: Edit (→ Tab 3), Delete
- **Pagination**: 10 posts per page
- **Indicators**: AI-generated (Bot icon) vs. Manual (User icon)

**Empty State**: Guides users to create first article in "Write Article" tab

---

## API Integration

### BrainAPI Methods Used

**Title Generation**:
```javascript
const result = await BrainAPI.generateContent(brainId, 'blog_title', {
  topic: 'How to improve SEO',
  primaryKeyword: 'SEO optimization',
  titleCount: 5
});

// Returns: { titles: ['Title 1', 'Title 2', ...] }
```

**Article Generation**:
```javascript
const result = await BrainAPI.generateContent(brainId, 'blog_article', {
  topic: 'Complete Guide to SEO',
  primaryKeyword: 'SEO guide',
  secondaryKeywords: ['keyword research', 'on-page SEO'],
  targetWordCount: 1800
});

// Returns: { content: '<h2>Introduction</h2><p>...</p>' }
```

**Brain Loading**:
```javascript
const brain = await BrainAPI.getBrainByUser(userId);
```

### Supabase Operations

**Save Draft**:
```javascript
await supabase.from('posts').insert([{
  brain_id: brainId,
  title: 'Blog Title',
  content: '<p>Content...</p>',
  primary_keyword: 'SEO',
  secondary_keywords: 'keyword1, keyword2',
  status: 'Draft',
  ai_generated: true,
  created_by: 'system'
}]);
```

**Update Post**:
```javascript
await supabase.from('posts')
  .update({
    title, content, status, meta_title, meta_description, slug, scheduled_date
  })
  .eq('id', postId);
```

**Load Posts**:
```javascript
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('brain_id', brainId)
  .order('created_at', { ascending: false });
```

**Delete Post**:
```javascript
await supabase.from('posts').delete().eq('id', postId);
```

---

## Content Generation Prompts

### Title Generation Prompt Pattern

```
Based on the following SEO keywords, generate a list of 5 engaging and SEO-friendly blog post titles.

These titles should be designed for comprehensive, long-form content (1500-1800 words).

Keywords: ${primaryKeyword}

REQUIREMENTS:
- Titles should suggest in-depth, comprehensive coverage of the topic
- Include power words that indicate thorough content (Complete Guide, Ultimate, etc.)
- Optimize for search intent and user engagement
- Ensure titles can support 1500-1800 word articles

Return the titles as a JSON object with a single key "titles" which is an array of strings.
```

### Article Generation Prompt Pattern

```
You are an expert SEO content writer. Write a comprehensive, high-quality blog post.

Blog Post Title: "${title}"
Primary Keywords: ${primaryKeyword}
Secondary Keywords: ${secondaryKeywords}
Target Length: MINIMUM ${targetWordCount} words

CRITICAL WORD COUNT REQUIREMENT:
- The article MUST be at least ${targetWordCount} words long
- Count only actual content words, not HTML tags
- If under ${targetWordCount} words, add more detailed explanations, examples, case studies

MANDATORY STRUCTURE REQUIREMENTS:
- Compelling introduction (150-200 words)
- At least 6-8 main content sections with H2 subheadings (200-250 words each)
- Each section should include specific examples, actionable tips
- FAQ section with 5 comprehensive questions and answers (50-100 words per answer)
- Strong conclusion with clear call-to-action (100-150 words)

CONTENT DEPTH REQUIREMENTS:
- Naturally incorporate the primary keywords throughout
- Include specific examples, case studies, statistics
- Provide step-by-step instructions where applicable
- Add industry insights and expert perspectives
- Include actionable takeaways in each section

MANDATORY FAQ SECTION:
- Add "Frequently Asked Questions" section before conclusion
- Include exactly 5 relevant FAQs with detailed answers
- Format each FAQ with H3 tags for questions and paragraph tags for answers

Output the full article content in HTML format. Do not include the title in the body.
```

---

## UI/UX Patterns

### Tab Navigation

Uses Radix UI Tabs with 4 sections:
1. **Generate Titles** (Sparkles icon)
2. **Write Article** (FileText icon)
3. **Edit & Publish** (Edit3 icon)
4. **Content Library** (Library icon)

### Loading States

- **Spinner**: `<Loader2 className="animate-spin" />` during AI generation
- **Button States**: Disabled with "Generating..." text
- **Page Loader**: Full-page spinner while loading brain

### Toast Notifications

Success:
```javascript
toast.success('Article generated successfully!', {
  description: '1,847 words'
});
```

Error:
```javascript
toast.error('Failed to generate titles', {
  description: error.message
});
```

### Status Badges

Color-coded by status:
- **Draft**: Secondary (gray)
- **Needs Review**: Outline (white with border)
- **Approved**: Default (blue)
- **Scheduled**: Secondary (gray)
- **Published**: Default (blue)

### Word Count Display

Real-time word count badge:
```javascript
<Badge variant="outline">{countWords(content)} words</Badge>
```

### Empty States

Helpful messaging when no content exists:
```
No posts found
Create your first article in the "Write Article" tab
```

---

## Advanced Features

### Auto-Markdown Conversion

Detects markdown patterns and auto-converts to HTML:

```javascript
const isLikelyMarkdown = (content) => {
  const trimmed = content.trim();
  return trimmed.startsWith('#') ||
         trimmed.startsWith('* ') ||
         trimmed.startsWith('- ') ||
         trimmed.includes('```') ||
         /\[.+\]\(.+\)/.test(trimmed); // Markdown links
};
```

Conversion patterns:
- `# Heading` → `<h1>Heading</h1>`
- `## Heading` → `<h2>Heading</h2>`
- `**bold**` → `<strong>bold</strong>`
- `*italic*` → `<em>italic</em>`

### Real-Time Word Count

Utility function that counts words from HTML:
```javascript
const countWords = (html) => {
  const text = html.replace(/<[^>]*>/g, ' ')  // Remove HTML tags
                   .replace(/\s+/g, ' ')       // Normalize whitespace
                   .trim();
  return text.split(' ').filter(word => word.length > 0).length;
};
```

### Pagination

10 posts per page with Previous/Next buttons:
```javascript
const paginatedPosts = filteredPosts.slice(
  (currentPage - 1) * postsPerPage,
  currentPage * postsPerPage
);
```

### Search & Filter

Multi-faceted filtering:
- **Search**: Title, primary keyword, secondary keywords
- **Status Filter**: All, Draft, Needs Review, Approved, Scheduled, Published
- **Sort**: Newest, Oldest, Title A-Z, Title Z-A, Status

---

## Routing Integration

**Route**: `/ai-content-writer`

**Added to**:
- `src/pages/index.jsx` (line 38): Lazy import
- `src/pages/index.jsx` (line 128): PAGES object
- `src/pages/index.jsx` (line 261): Routes definition

**Navigation**:
```jsx
<Link to="/ai-content-writer">AI Content Writer</Link>
```

---

## Error Handling

### Authentication Check

```javascript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  toast.error('Please sign in to use AI Content Writer');
  return;
}
```

### No Brain Found

```jsx
if (!userBrain) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No Business Brain Found</CardTitle>
        <CardDescription>
          You need to create a Business Brain before using the AI Content Writer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => window.location.href = '/business-brain-manager'}>
          Create Business Brain
        </Button>
      </CardContent>
    </Card>
  );
}
```

### API Errors

All API calls wrapped in try/catch with toast notifications:
```javascript
try {
  await BrainAPI.generateContent(...);
} catch (error) {
  console.error('Generation error:', error);
  toast.error('Failed to generate content', {
    description: error.message
  });
}
```

---

## Performance Optimizations

### Lazy Loading

Component is lazy-loaded in routing:
```javascript
const AIContentWriter = lazy(() => import('./ai-content-writer.jsx'));
```

### Memoization

Word count and filtered posts are memoized:
```javascript
const wordCount = useMemo(() => countWords(content), [content]);
const filteredPosts = useMemo(() => { /* filtering logic */ }, [posts, searchQuery]);
```

### Efficient Re-renders

Only re-load posts when necessary:
```javascript
useEffect(() => {
  loadPosts();
}, [brainId, statusFilter, sortBy]); // Only when these change
```

---

## Testing Checklist

### Tab 1: Title Generator
- [ ] Enter topic and keyword
- [ ] Click "Generate Titles"
- [ ] Verify 5 titles appear
- [ ] Select a title
- [ ] Click "Use Selected Title"
- [ ] Verify redirect to Tab 2

### Tab 2: Article Generator
- [ ] Verify title auto-populated from Tab 1
- [ ] Enter keywords
- [ ] Adjust word count slider
- [ ] Click "Generate Article"
- [ ] Verify content appears in editor
- [ ] Verify word count displays
- [ ] Click "Save Draft"
- [ ] Verify redirect to Tab 4

### Tab 3: Post Editor
- [ ] Select a post from left sidebar
- [ ] Edit content in ReactQuill
- [ ] Test all toolbar buttons (bold, italic, lists, links, etc.)
- [ ] Update SEO fields (meta title, description, slug)
- [ ] Change status
- [ ] Set scheduled date
- [ ] Click "Save Changes"
- [ ] Verify toast notification

### Tab 4: Content Library
- [ ] Verify posts display
- [ ] Test search functionality
- [ ] Test status filter
- [ ] Test sort options
- [ ] Click Edit → verify redirect to Tab 3
- [ ] Click Delete → verify confirmation
- [ ] Test pagination (if >10 posts)
- [ ] Verify AI/Manual icons display

### Error Cases
- [ ] Not signed in → error message
- [ ] No brain found → prompt to create brain
- [ ] API failure → error toast
- [ ] Empty content → validation error

---

## Future Enhancements

### Phase 2 Features
- [ ] **Version History**: Track content revisions with rollback
- [ ] **Collaboration**: Real-time co-editing with team members
- [ ] **SEO Scoring**: Live SEO analysis (Yoast-style)
- [ ] **Plagiarism Check**: Content originality verification
- [ ] **AI Regeneration**: Regenerate specific sections
- [ ] **Content Templates**: Pre-built templates for common post types
- [ ] **Image Generation**: Auto-generate featured images
- [ ] **Publishing Automation**: Auto-publish scheduled posts
- [ ] **Analytics Integration**: Track post performance
- [ ] **Export Options**: Export to WordPress, Medium, etc.

### Technical Improvements
- [ ] **Server-Side Generation**: Move AI calls to Netlify Functions for security
- [ ] **Rate Limiting**: Prevent API abuse with quotas
- [ ] **Cost Tracking**: Log token usage per generation
- [ ] **Prompt Templates**: Reusable, customizable prompts
- [ ] **Batch Generation**: Generate multiple articles at once
- [ ] **A/B Testing**: Test different titles/content variations

---

## Troubleshooting

### Issue: ReactQuill styles not loading
**Solution**: Ensure `import 'react-quill/dist/quill.snow.css'` is at top of file

### Issue: Word count shows 0
**Solution**: Check that `countWords()` function properly strips HTML tags

### Issue: Auto-markdown not converting
**Solution**: Verify `isLikelyMarkdown()` detection patterns match your markdown

### Issue: Posts not saving
**Solution**: Check Supabase connection, verify `posts` table exists with all columns

### Issue: Brain not loading
**Solution**: Ensure user is authenticated and has created a Business Brain

---

## Maintenance

### Regular Tasks
- Monitor AI generation costs via BrainAPI logs
- Review and optimize prompt templates based on output quality
- Update word count targets based on SEO best practices
- Clean up old draft posts periodically

### Database Maintenance
```sql
-- Find posts with no brain association
SELECT * FROM posts WHERE brain_id IS NULL;

-- Find posts with missing SEO metadata
SELECT * FROM posts WHERE meta_title IS NULL OR slug IS NULL;

-- Archive old drafts (>90 days)
UPDATE posts SET status = 'Archived'
WHERE status = 'Draft' AND created_at < NOW() - INTERVAL '90 days';
```

---

## Credits

**Based on**: Base44 AI Content Writer analysis (`docs/BASE44_AI_CONTENT_WRITER_ANALYSIS.md`)
**Architecture**: Custom rebuild for Disruptors AI Marketing Hub using Supabase
**AI Integration**: Business Brain API (`src/lib/brain-api.js`)
**Implementation**: January 8, 2025

---

**Document Version**: 1.0.0
**Last Updated**: January 8, 2025
**Status**: ✅ Complete Implementation
