# Blog Formatting System

## Overview

The blog detail page uses **ReactMarkdown** with **GitHub Flavored Markdown (GFM)** support to render beautiful, professional blog content optimized for maximum readability based on 2025 best practices.

## 2025 Enhancements (October 2025)

### Research-Backed Improvements
- **Optimal Content Width**: 680px (down from 896px) for 65-70 characters per line
- **Line Height**: 1.7 (up from 1.625) for improved readability
- **Reading Progress Bar**: Visual scroll indicator at top of page
- **Table of Contents**: Auto-generated from H2/H3 headings for posts >1,500 words
- **Enhanced Visual Hierarchy**: Increased section spacing, better H2 styling
- **Mobile-First Design**: Collapsible TOC, responsive layout
- **Improved Metadata Display**: Prominent read time badge

## Libraries Used

### 1. react-markdown
- **Purpose:** Converts Markdown to React components
- **Version:** Latest
- **Why:** Safe, performant, and React-friendly markdown rendering

### 2. remark-gfm
- **Purpose:** GitHub Flavored Markdown support
- **Features:**
  - Tables
  - Task lists
  - Strikethrough text
  - Autolinks
  - Footnotes

### 3. rehype-raw
- **Purpose:** Allows raw HTML in markdown
- **Use Case:** When markdown includes HTML tags (e.g., `<details>`, `<summary>`)

## Typography & Styling

### Comprehensive Prose Classes

All blog content is styled using Tailwind's `@tailwindcss/typography` plugin with extensive customization:

#### Headings

**H1 (Main Title)**
- Font Size: 4xl (2.25rem / 36px)
- Margin Bottom: 1.5rem
- Line Height: Tight
- Color: Gray-900
- Font Weight: Bold

**H2 (Section Headers)**
- Font Size: 3xl (1.875rem / 30px)
- Margin Top: 3rem
- Margin Bottom: 1.25rem
- Line Height: Tight
- Border Bottom: 1px gray-200
- Padding Bottom: 0.75rem
- Color: Gray-900
- Font Weight: Bold

**H3 (Subsection Headers)**
- Font Size: 2xl (1.5rem / 24px)
- Margin Top: 2rem
- Margin Bottom: 1rem
- Line Height: Snug
- Color: Gray-900
- Font Weight: Bold

**H4 (Minor Headers)**
- Font Size: xl (1.25rem / 20px)
- Margin Top: 1.5rem
- Margin Bottom: 0.75rem
- Color: Gray-900
- Font Weight: Bold

#### Body Text

**Paragraphs**
- Font Size: 17px
- Color: Gray-700
- Line Height: Relaxed
- Margin Bottom: 1.5rem

**Links**
- Color: Indigo-600
- Font Weight: Medium
- No underline by default
- Hover: Underline + Indigo-700

**Strong (Bold)**
- Color: Gray-900
- Font Weight: Bold

**Emphasis (Italic)**
- Color: Gray-700
- Style: Italic

#### Special Elements

**Blockquotes**
- Border Left: 4px indigo-500
- Background: Indigo-50
- Padding: 1rem left, 1rem right, 1rem vertical
- Italic text
- Rounded right corners
- Margin: 1.5rem vertical

**Inline Code**
- Background: Indigo-50
- Color: Indigo-700
- Padding: 0.25rem horizontal, 0.125rem vertical
- Rounded corners
- Font: Monospace
- Font Size: 15px

**Code Blocks**
- Background: Gray-900
- Color: Gray-100
- Padding: 1.5rem
- Rounded: XL (0.75rem)
- Shadow: Large
- Overflow: Auto horizontal
- Margin: 2rem vertical

#### Lists

**Unordered Lists (Bullets)**
- Style: Disc
- Margin Left: 2rem
- Margin Bottom: 1.5rem
- Item Spacing: 0.5rem

**Ordered Lists (Numbers)**
- Style: Decimal
- Margin Left: 2rem
- Margin Bottom: 1.5rem
- Item Spacing: 0.5rem

**List Items**
- Color: Gray-700
- Line Height: Relaxed
- Padding Left: 0.5rem

#### Tables

**Table Container**
- Border Collapse: Collapse
- Width: Full
- Margin: 2rem vertical
- Shadow: Medium
- Rounded: Large
- Overflow: Hidden

**Table Headers (th)**
- Background: Gray-100
- Padding: 1rem
- Text Align: Left
- Font Weight: Bold
- Color: Gray-900
- Border Bottom: 2px gray-300

**Table Data (td)**
- Border: 1px gray-200
- Padding: 1rem
- Color: Gray-700

**Table Rows (tr)**
- Border Bottom: 1px gray-200
- Hover: Gray-50 background

#### Images

- Rounded: XL (0.75rem)
- Shadow: Large
- Margin: 2.5rem vertical
- Border: 1px gray-200

#### Horizontal Rules

- Margin: 3rem vertical
- Border Color: Gray-300

## Markdown Rendering Pipeline

```jsx
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeRaw]}
>
  {post.content}
</ReactMarkdown>
```

### Pipeline Flow

1. **Input:** Raw Markdown from `post.content` (Supabase)
2. **Remark Processing:** `remarkGfm` adds GFM support
3. **Rehype Processing:** `rehypeRaw` allows raw HTML
4. **Output:** React components with proper HTML structure
5. **Styling:** Tailwind prose classes style the rendered HTML

## Supported Markdown Features

### Basic Formatting

```markdown
**Bold text**
*Italic text*
~~Strikethrough~~ (GFM)
`Inline code`
```

### Headings

```markdown
# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading
```

### Links

```markdown
[Link text](https://example.com)
https://auto-linked-url.com (GFM)
```

### Lists

```markdown
- Unordered item 1
- Unordered item 2
  - Nested item

1. Ordered item 1
2. Ordered item 2
   1. Nested numbered item
```

### Task Lists (GFM)

```markdown
- [x] Completed task
- [ ] Incomplete task
```

### Blockquotes

```markdown
> This is a blockquote.
> It can span multiple lines.
```

### Code Blocks

````markdown
```javascript
function example() {
  return "Syntax highlighted code";
}
```
````

### Tables (GFM)

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### Images

```markdown
![Alt text](/path/to/image.jpg)
```

### Horizontal Rules

```markdown
---
```

## Blog Generation Integration

### Generated Markdown Structure

All AI-generated blogs include:

1. **H1 Title** - Main blog title
2. **Introduction** - 100-150 words with hook
3. **5-7 H2 Sections** - Main content sections
4. **H3 Subsections** - Detailed breakdowns
5. **Blockquotes** - Important callouts (using `>`)
6. **Bold Statistics** - `**60% of marketers**`
7. **Bullet Lists** - Scannable information
8. **Numbered Lists** - Step-by-step guides
9. **Code Blocks** - Technical examples (when relevant)
10. **Tables** - Comparison data (when relevant)
11. **H2 FAQ Section** - 7-10 H3 questions with answers
12. **Strong CTA** - Call-to-action at end

### Example Generated Structure

```markdown
# Main Blog Title

Introduction paragraph with compelling hook. **Bold statistics** for emphasis.

> Quick Answer: Direct 3-5 sentence answer for featured snippets.

## First Major Section

Content here with **bold key phrases** and detailed explanations.

### Subsection Example

More detailed content with:
- Bullet point 1
- Bullet point 2
- Bullet point 3

### Another Subsection

Numbered steps:
1. First step
2. Second step
3. Third step

## Frequently Asked Questions

### How does X work?

Detailed answer to question 1 with examples and data.

### What are the benefits of Y?

Detailed answer to question 2 with specific outcomes.

## Conclusion

Final thoughts and call-to-action.
```

## Visual Design

### Color Scheme

- **Primary:** Indigo (indigo-500, indigo-600, indigo-700)
- **Text:** Gray scale (gray-700 for body, gray-900 for headings)
- **Backgrounds:** White/Gray-50 for contrast
- **Accents:** Indigo-50 for code and blockquotes

### Spacing System

- **Headings:** Large top margins for clear section breaks
- **Paragraphs:** 1.5rem bottom margin for readability
- **Lists:** 0.5rem item spacing
- **Sections:** 2-3rem vertical spacing

### Typography Hierarchy

```
H1: 36px (4xl)
H2: 30px (3xl)
H3: 24px (2xl)
H4: 20px (xl)
Body: 17px
Code: 15px
```

## Readability Optimizations

### Line Length

- Max width: 680px (optimal for readability)
- Paragraph width: 65-70 characters average (industry standard)
- Research-backed: 45-75 characters per line ideal, 66 is perfect
- Previous width (896px) was 30% too wide

### Line Height

- Headings: Tight/Snug (1.25-1.375)
- Body: 1.7 (research-backed optimal, up from 1.625)
- Lists: 1.7 for better line-to-line transition
- Research shows 1.7 significantly improves readability

### Font Stack

- Headings: System UI fonts (bold)
- Body: System UI fonts (regular)
- Code: Monospace system fonts

## SEO Optimization

### Structured Content

- Proper heading hierarchy (H1 → H2 → H3)
- Semantic HTML from markdown
- Alt text on images
- Descriptive link text

### Performance

- Client-side rendering (React components)
- No heavy JavaScript for markdown parsing
- Efficient re-renders with React

## Accessibility

### Keyboard Navigation

- All links are keyboard accessible
- Proper focus states on interactive elements

### Screen Readers

- Semantic HTML structure
- Proper heading hierarchy
- Alt text on images
- ARIA attributes from ReactMarkdown

### Color Contrast

- WCAG AA compliant color combinations
- Gray-700 on white background (>4.5:1)
- Indigo-600 links (>4.5:1)

## Testing

### Verify Rendering

1. Check all heading levels render correctly
2. Verify lists display with proper styling
3. Test blockquotes show with indigo styling
4. Confirm code blocks have dark background
5. Verify tables render with proper borders
6. Test images display with rounded corners and shadows
7. Check FAQ sections format correctly

### Browser Testing

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Responsive and readable

## Troubleshooting

### Common Issues

**Markdown not rendering:**
- Check ReactMarkdown is imported
- Verify remarkGfm and rehypeRaw are passed as plugins
- Ensure post.content contains valid markdown

**Styling not applied:**
- Verify prose classes are on parent div
- Check Tailwind CSS is properly configured
- Ensure @tailwindcss/typography is installed

**Tables not displaying:**
- Confirm remarkGfm plugin is active
- Check markdown table syntax is correct
- Verify prose-table classes are applied

## New Components (2025)

### ReadingProgress Component

**Location**: `src/components/blog/ReadingProgress.jsx`

**Features**:
- Fixed position at top of viewport
- Smooth spring animation using Framer Motion
- Gradient color (indigo → purple → pink)
- Responds to scroll position
- Shows reading completion percentage visually
- Mobile-friendly (1px height, unobtrusive)

**Implementation**:
```jsx
import ReadingProgress from '../components/blog/ReadingProgress';

// In blog-detail.jsx
<ReadingProgress />
```

### TableOfContents Component

**Location**: `src/components/blog/TableOfContents.jsx`

**Features**:
- Auto-generates from H2 and H3 headings in markdown
- Smooth scroll to sections with 80px offset
- Active section highlighting based on scroll position
- Sticky positioning on desktop (top: 24px)
- Collapsible on mobile devices
- Nested structure for H3 subsections
- Only displays for posts >1,500 words
- Gradient highlight for active section

**Props**:
- `content` (string, required): Raw markdown content
- `wordCount` (number, optional): Total word count for display logic

**Implementation**:
```jsx
import TableOfContents from '../components/blog/TableOfContents';

// Desktop sidebar
<aside className="hidden lg:block">
  <TableOfContents content={post.content} wordCount={wordCount} />
</aside>

// Mobile version
<div className="lg:hidden mb-8">
  <TableOfContents content={post.content} wordCount={wordCount} />
</div>
```

**Heading ID Generation**:
The ReactMarkdown component now includes custom renderers for H2 and H3 that automatically add IDs:

```jsx
components={{
  h2: ({ node, ...props }) => {
    const text = props.children?.[0] || '';
    const id = typeof text === 'string'
      ? text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      : '';
    return <h2 id={id} {...props} />;
  },
  h3: ({ node, ...props }) => {
    const text = props.children?.[0] || '';
    const id = typeof text === 'string'
      ? text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      : '';
    return <h3 id={id} {...props} />;
  }
}}
```

## Future Enhancements

### Phase 2: Enhanced Features (Next Sprint)

1. ✅ **Table of Contents** - COMPLETED
2. ✅ **Reading Progress** - COMPLETED
3. ⏳ **Dark Mode Toggle** - User preference with localStorage
4. ⏳ **Social Sharing Buttons** - Twitter, LinkedIn, Facebook, Copy Link
5. ⏳ **Author Bio Section** - After content, before CTA
6. ⏳ **Related Articles** - 3-4 related posts based on tags

### Phase 3: Advanced Features

1. 🔮 **Syntax Highlighting:** Add `rehype-highlight` for code blocks
2. 🔮 **Copy Code Buttons:** One-click code copying
3. 🔮 **Image Lightbox:** Click to enlarge images
4. 🔮 **Comments System:** Integrate commenting
5. 🔮 **Bookmark Functionality:** Save posts for later
6. 🔮 **Reading History:** Track user reading progress
7. 🔮 **Math Support:** Add `remark-math` for equations
8. 🔮 **Mermaid Diagrams:** Add diagram support

---

**Last Updated:** October 20, 2025
**System:** Disruptors AI Marketing Hub
**Component:** `/src/pages/blog-detail.jsx`
