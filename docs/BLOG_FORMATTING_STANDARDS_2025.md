# Blog Formatting Standards 2025

**Last Updated:** January 2, 2025
**Status:** ✅ ACTIVE - All blogs must follow these standards

---

## Overview

These are the MANDATORY formatting standards for all Disruptors AI blog posts. Every blog generated, published, or migrated MUST conform to these exact specifications.

## Visual Design Standards

### Layout Structure

**Clean, modern, readable blog design:**

1. **Gray Background**: `bg-gray-50` (#f9fafb) - Easy on the eyes
2. **Hero Section**: Dark gradient header (`from-gray-900 via-gray-800 to-black`)
3. **Content Width**: Max 768px (`max-w-3xl`) for optimal readability
4. **Centered Layout**: All content centered with consistent padding
5. **Featured Image**: Elevated shadow with -mt-20 overlap effect

### Typography Hierarchy

**Inline CSS Typography (EXACT SPECIFICATIONS):**

```css
/* BASE STYLES */
.prose {
    color: #374151;
    font-size: 1.125rem; /* 18px base text */
    line-height: 1.9; /* Perfect readability */
}

/* HEADINGS */
.prose h1 {
    font-size: 2.5rem; /* 40px */
    font-weight: 800;
    color: #111827;
    margin-top: 3rem; /* 48px */
    margin-bottom: 1.5rem; /* 24px */
    line-height: 1.2;
}

.prose h2 {
    font-size: 2rem; /* 32px */
    font-weight: 700;
    color: #111827;
    margin-top: 4rem; /* 64px - HUGE spacing before sections */
    margin-bottom: 1.5rem; /* 24px */
    line-height: 1.3;
    padding-bottom: 0.5rem; /* 8px */
    border-bottom: 2px solid #e5e7eb; /* Visual separator */
}

.prose h3 {
    font-size: 1.5rem; /* 24px */
    font-weight: 700;
    color: #1f2937;
    margin-top: 3rem; /* 48px */
    margin-bottom: 1rem; /* 16px */
    line-height: 1.4;
}

.prose h4 {
    font-size: 1.25rem; /* 20px */
    font-weight: 600;
    color: #1f2937;
    margin-top: 2rem; /* 32px */
    margin-bottom: 1rem; /* 16px */
}

/* PARAGRAPHS */
.prose p {
    font-size: 1.125rem; /* 18px */
    line-height: 1.9; /* 1.9 is the sweet spot */
    color: #374151;
    margin-bottom: 2rem; /* 32px between paragraphs */
}

.prose p:first-of-type {
    font-size: 1.25rem; /* 20px - Lead paragraph */
    line-height: 1.8;
}

/* LISTS */
.prose ul,
.prose ol {
    margin: 2rem 0; /* 32px */
    padding-left: 1.5rem; /* 24px */
}

.prose li {
    font-size: 1.125rem; /* 18px */
    line-height: 1.9;
    margin: 1rem 0; /* 16px between items */
    color: #374151;
}

.prose li::marker {
    color: #2563eb; /* Blue markers */
    font-weight: 600;
}

/* BLOCKQUOTES */
.prose blockquote {
    border-left: 4px solid #2563eb;
    padding: 1.5rem 2rem; /* 24px 32px */
    margin: 3rem 0; /* 48px */
    background: #f9fafb;
    border-radius: 0 0.5rem 0.5rem 0;
    font-style: italic;
    color: #4b5563;
    font-size: 1.125rem; /* 18px */
}

/* CODE */
.prose code {
    background: #f3f4f6;
    padding: 0.2rem 0.5rem;
    border-radius: 0.25rem;
    font-family: 'Courier New', monospace;
    font-size: 0.95em;
    color: #be123c; /* Rose red */
}

.prose pre {
    background: #1f2937; /* Dark gray */
    color: #f3f4f6;
    padding: 1.5rem;
    border-radius: 0.75rem;
    overflow-x: auto;
    margin: 2.5rem 0; /* 40px */
    line-height: 1.7;
}

/* IMAGES */
.prose img {
    border-radius: 0.75rem;
    margin: 3rem 0; /* 48px */
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* TABLES */
.prose table {
    width: 100%;
    border-collapse: collapse;
    margin: 2.5rem 0; /* 40px */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border-radius: 0.5rem;
    overflow: hidden;
}

.prose th {
    background: #f9fafb;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #111827;
    border-bottom: 2px solid #e5e7eb;
}

.prose td {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
}

.prose tr:hover {
    background: #f9fafb;
}

/* HORIZONTAL RULES */
.prose hr {
    border: none;
    height: 1px;
    background: linear-gradient(to right, transparent, #d1d5db, transparent);
    margin: 4rem 0; /* 64px */
}
```

## Content Structure Requirements

### Page Structure (React Component)

```jsx
<div className="min-h-screen bg-gray-50">
    {/* Hero Section */}
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-20">
            {/* Back Button */}
            <a href="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
            </a>

            {/* Category Badge */}
            <span className="inline-block px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-full">
                {post.category}
            </span>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-8">
                {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-300">
                <User /> <Calendar /> <Clock />
            </div>
        </div>
    </div>

    {/* Featured Image */}
    <div className="max-w-5xl mx-auto -mt-20 px-6">
        <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img src={post.featured_image} alt={post.title} />
        </div>
    </div>

    {/* Article Content */}
    <article className="max-w-3xl mx-auto px-6 py-20">
        <div className="prose prose-lg prose-gray max-w-none">
            {/* Inline CSS from above */}
            <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* Tags */}
        <div className="mt-16 pt-8 border-t border-gray-200">
            {/* Gray tag pills */}
        </div>

        {/* Share Buttons */}
        <div className="mt-12 pt-8 border-t border-gray-200">
            {/* Twitter + LinkedIn */}
        </div>
    </article>

    {/* CTA Section */}
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        {/* Full-width conversion CTA */}
    </div>
</div>
```

## Spacing Rules (CRITICAL)

**These spacing values create the "breathing room" that makes blogs readable:**

### Vertical Spacing

| Element | Top Margin | Bottom Margin |
|---------|-----------|---------------|
| H2 | 4rem (64px) | 1.5rem (24px) |
| H3 | 3rem (48px) | 1rem (16px) |
| H4 | 2rem (32px) | 1rem (16px) |
| Paragraph | 0 | 2rem (32px) |
| Lists | 2rem (32px) | 2rem (32px) |
| Blockquotes | 3rem (48px) | 3rem (48px) |
| Images | 3rem (48px) | 3rem (48px) |
| Code Blocks | 2.5rem (40px) | 2.5rem (40px) |
| Tables | 2.5rem (40px) | 2.5rem (40px) |
| HR | 4rem (64px) | 4rem (64px) |

### Line Height Standards

| Element | Line Height |
|---------|-------------|
| Body Text | 1.9 |
| Lead Paragraph | 1.8 |
| Headings H1-H2 | 1.2-1.3 |
| Headings H3-H5 | 1.4 |
| Lists | 1.9 |
| Blockquotes | 1.7 |
| Code Blocks | 1.7 |

## Component Standards

### Hero Section

**Requirements:**
- Dark gradient background
- Max-width 4xl (1024px)
- Back to blog link with arrow icon
- Category badge (blue)
- Title: 5xl mobile, 6xl desktop
- Metadata row: User, Calendar, Clock icons

### Featured Image

**Requirements:**
- Max-width 5xl (1280px)
- -mt-20 overlap effect with hero
- rounded-2xl border radius
- shadow-2xl elevation
- Full responsive (w-full h-auto)

### Article Container

**Requirements:**
- Max-width 3xl (768px) - EXACT reading width
- py-20 vertical padding
- px-6 horizontal padding
- Centered with mx-auto

### Tags Section

**Requirements:**
- mt-16 top margin
- pt-8 top padding
- border-t border-gray-200
- Gray pills (bg-gray-100, text-gray-700)
- Hover state (bg-gray-200)
- Hash symbol prefix (#tag)

### Share Buttons

**Requirements:**
- Twitter: bg-blue-500, hover:bg-blue-600
- LinkedIn: bg-blue-700, hover:bg-blue-800
- px-6 py-3 padding
- rounded-lg corners
- font-medium weight

### CTA Section

**Requirements:**
- Full-width gradient (from-blue-600 to-indigo-700)
- Max-width 4xl container
- py-20 vertical padding
- Centered text
- White button on colored background
- Bold CTA copy

## Color Palette

### Primary Colors

| Element | Color | Hex |
|---------|-------|-----|
| Background | Gray 50 | #f9fafb |
| Body Text | Gray 700 | #374151 |
| Headings | Gray 900 | #111827 |
| Links | Blue 600 | #2563eb |
| Code Inline | Rose 700 | #be123c |
| Code Background | Gray 100 | #f3f4f6 |
| Blockquote Border | Blue 600 | #2563eb |
| Blockquote Background | Gray 50 | #f9fafb |

### Accent Colors

| Element | Color | Hex |
|---------|-------|-----|
| Hero Gradient Start | Gray 900 | #111827 |
| Hero Gradient End | Black | #000000 |
| CTA Gradient Start | Blue 600 | #2563eb |
| CTA Gradient End | Indigo 700 | #4338ca |
| Category Badge | Blue 600 | #2563eb |
| List Markers | Blue 600 | #2563eb |

## SEO Requirements

### Meta Structure

Every blog MUST have:
- Title tag (50-60 characters)
- Meta description (150-160 characters)
- Primary keyword in H1
- Featured image with alt text
- Schema.org Article markup
- Open Graph tags
- Twitter Card tags

### Content Structure

- Minimum 1,200 words
- Maximum 3,500 words
- 7-10 FAQ questions (H3 format)
- Internal links (2-3 minimum)
- External authoritative links (1-2)
- Primary keyword density: 1-2%
- Keyword in first 150 words

## Implementation Checklist

Before publishing ANY blog, verify:

- [ ] Gray background (`bg-gray-50`)
- [ ] Max-width 768px content (`max-w-3xl`)
- [ ] 64px spacing before H2 sections (`mt-4rem` = `margin-top: 4rem`)
- [ ] 32px spacing between paragraphs (`mb-2rem`)
- [ ] 18px body text with 1.9 line-height
- [ ] 20px lead paragraph
- [ ] H2 sections have bottom border (`border-bottom: 2px solid #e5e7eb`)
- [ ] Blue list markers (`color: #2563eb`)
- [ ] Blockquotes with left border and gray background
- [ ] Featured image with shadow and overlap
- [ ] Dark hero section with gradient
- [ ] Category badge
- [ ] Share buttons (Twitter + LinkedIn)
- [ ] Full-width CTA at bottom
- [ ] Tags section above share buttons
- [ ] Inline CSS styles included in component

## Validation

Run these checks on every blog before publishing:

1. **Visual Check**: Does it look clean and easy to read?
2. **Spacing Check**: Is there 64px before every H2?
3. **Width Check**: Is content constrained to 768px?
4. **Color Check**: Is background gray-50?
5. **Typography Check**: Is body text 18px with 1.9 line-height?
6. **Component Check**: Are all sections present (hero, image, content, tags, share, CTA)?

## Agent Integration

The Blog Orchestrator Agent MUST:
- Generate all blogs with inline CSS matching these specs
- Never deviate from spacing values
- Always use exact color codes
- Maintain 768px content width
- Include all required sections
- Validate before publishing

---

**Questions?** Reference: `src/pages/blog-detail.jsx` for complete implementation

**Status**: ✅ Active as of January 2, 2025
