# Blog Formatting Guide

## Magazine-Quality Blog Post Formatting

The blog detail page now features **magazine-quality typography** and **interactive components** for an enhanced reading experience. This guide shows how to leverage these features in your blog content.

---

## Typography Enhancements

### Automatic Styling

The blog detail page automatically applies professional typography:

- **Large, gradient headings** with smooth scroll animations
- **Spacious line height** (1.8) for better readability
- **First paragraph enhancement** - Larger font size (20px) with medium weight
- **Beautiful blockquotes** with gradient backgrounds
- **Custom list styling** with indigo bullet points
- **Code blocks** with syntax highlighting and copy buttons
- **Tables** with hover effects and gradient headers

### Heading Hierarchy

```markdown
# Main Title (5xl, gradient text)

## Major Section (4xl, bottom border)

### Subsection (3xl, indigo color)

#### Detail Section (2xl)

##### Minor Detail (xl)
```

**Spacing:**
- H1: 8rem bottom margin
- H2: 20rem top margin, 8rem bottom
- H3: 16rem top margin, 6rem bottom
- Paragraphs: 8rem bottom margin

---

## Interactive Components

### 1. Highlight Boxes

Add special callout boxes using markers at the start of paragraphs:

#### Key Takeaway
```markdown
[KEY] This is an important point that readers should remember.
```

#### Tip
```markdown
[TIP] Here's a helpful tip for your readers.
```

#### Warning
```markdown
[WARNING] Be careful about this potential issue.
```

#### Info
```markdown
[INFO] Additional information that provides context.
```

**Result:** Renders as a beautiful gradient box with icons and borders.

---

### 2. Pull Quotes

Create magazine-style pull quotes:

```markdown
> This is an inspiring quote that deserves extra attention. — Author Name
```

**Features:**
- Gradient purple/indigo background
- Decorative quote marks
- Author attribution
- Floating option for desktop

---

### 3. Code Blocks with Copy Button

Standard markdown code blocks automatically get enhanced:

````markdown
```javascript
function example() {
  console.log("This code block has a copy button!");
}
```
````

**Features:**
- macOS-style window controls
- Language indicator
- One-click copy button
- Syntax highlighting
- Dark theme

---

### 4. Social Share Buttons

Automatically added at the bottom of every article:
- Twitter
- LinkedIn
- Facebook
- Copy Link

---

### 5. Collapsible FAQ Sections

**Auto-detected** when heading contains "FAQ", "Frequently Asked", or "Questions":

```markdown
### Frequently Asked Questions

#### What is this feature?

Answer content here.

#### How do I use it?

More answer content.
```

**Features:**
- Smooth expand/collapse animation
- Gradient backgrounds
- Chevron indicators
- Hover effects

---

## Advanced Markdown Features

### Tables

```markdown
| Feature       | Status    | Priority |
|---------------|-----------|----------|
| Typography    | Complete  | High     |
| Interactive   | Complete  | High     |
| Performance   | Optimized | Medium   |
```

**Auto-styling:**
- Gradient header (indigo to purple)
- Hover row highlighting
- Rounded corners
- Shadow effects

### Lists

#### Unordered Lists
```markdown
- First item with custom bullet
- Second item
  - Nested item
- Third item
```

**Styling:** Custom indigo arrow bullets (▸)

#### Ordered Lists
```markdown
1. First step
2. Second step
3. Third step
```

**Styling:** Large indigo numbers

### Images

```markdown
![Alt text](image-url.jpg)
```

**Auto-enhancements:**
- Rounded corners (2xl)
- Shadow effects
- Border and ring
- Lazy loading

### Horizontal Rules

```markdown
---
```

**Renders as:** Gradient divider line

---

## Best Practices

### 1. Content Structure

```markdown
# Article Title (in frontmatter, not body)

First paragraph is automatically enhanced with larger text.

## Introduction

Content here...

## Main Content Section 1

### Subsection 1.1

[KEY] Use highlight boxes for important points.

## Main Content Section 2

> Important quote here — Expert Name

## Frequently Asked Questions

### Question 1?
Answer 1

### Question 2?
Answer 2

## Conclusion

Final thoughts...
```

### 2. Readability Tips

- **Paragraph length**: Keep to 3-5 sentences max
- **Heading frequency**: One H2 every 300-500 words
- **Whitespace**: Let content breathe with spacing
- **Emphasis**: Use **bold** for key terms, *italic* for emphasis
- **Lists**: Break down complex information
- **Code blocks**: Always specify language

### 3. Visual Hierarchy

1. **H1**: Article title (one per article)
2. **H2**: Major sections (4-6 per article)
3. **H3**: Subsections (2-3 per H2)
4. **H4**: Detail sections (sparingly)
5. **Blockquotes**: 1-2 per article for key quotes
6. **Highlight boxes**: 3-5 per article for key points

---

## Component Reference

### CollapsibleSection
Location: `src/components/blog/CollapsibleSection.jsx`
- Auto-detects FAQ sections
- Smooth animations
- Customizable

### HighlightBox
Location: `src/components/blog/HighlightBox.jsx`
- Types: tip, warning, info, success, key
- Icon integration
- Gradient backgrounds

### PullQuote
Location: `src/components/blog/PullQuote.jsx`
- Author attribution
- Decorative quotes
- Gradient styling

### CodeBlock
Location: `src/components/blog/CodeBlock.jsx`
- Copy functionality
- Language detection
- Dark theme

### SocialShare
Location: `src/components/blog/SocialShare.jsx`
- Platform integration
- Copy link
- Hover animations

---

## Writing for Maximum Impact

### Opening Paragraph
Make it count - automatically styled larger and bolder:
```markdown
Artificial intelligence is transforming how businesses approach marketing,
enabling personalization at scale and data-driven decision-making that was
impossible just a few years ago.
```

### Use Highlight Boxes Strategically
```markdown
[KEY] AI marketing tools can increase conversion rates by up to 30% when
properly implemented with human oversight and brand consistency.
```

### Break Up Long Content
```markdown
## Main Section

Content paragraph 1...

### Detail Subsection

More specific content...

[TIP] Use subsections to maintain reader engagement.

### Another Subsection

Continued content...
```

### Include Pull Quotes
```markdown
> The future of marketing isn't about replacing humans with AI—it's about
empowering marketers with AI to do more creative and strategic work.
— Sarah Johnson, CMO
```

---

## Performance Considerations

All enhancements are optimized for:
- **Fast loading**: Lazy loading for components
- **Smooth animations**: GPU-accelerated transforms
- **Mobile responsive**: Touch-friendly interactions
- **Accessibility**: Proper semantic HTML and ARIA labels

---

## Examples in Action

See these blog posts for formatting inspiration:
- `/blog?slug=ai-marketing-trends-2025`
- `/blog?slug=content-strategy-guide`
- `/blog?slug=seo-best-practices`

---

## Questions?

Refer to component source code in `src/components/blog/` for advanced customization options.
