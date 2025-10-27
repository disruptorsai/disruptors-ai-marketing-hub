# Blog Typography Spacing Reference

This document shows the exact spacing applied to your blog detail pages following research-backed best practices.

## Vertical Rhythm Formula

**Base Calculation:**
- Line height: 1.65 (31.35px at 19px font)
- Paragraph spacing: 28px (7 × 4px Tailwind units)
- Heading spacing (before): 2× paragraph spacing = 56px minimum

## Heading Hierarchy & Spacing

### H1 - Main Article Title (rarely in content)
- **Font Size:** 36px (text-4xl)
- **Line Height:** 1.2
- **Margin Top:** 0px (mt-0)
- **Margin Bottom:** 40px (mb-10)
- **Font Weight:** Extrabold (800)
- **Color:** Gray-900
- **Use Case:** Main title at top of article (usually in hero section)

---

### H2 - Major Section Headers
- **Font Size:** 30px (text-3xl)
- **Line Height:** 1.25
- **Margin Top:** 80px (mt-20) - **2× paragraph spacing for clear separation**
- **Margin Bottom:** 32px (mb-8)
- **Font Weight:** Extrabold (800)
- **Color:** Gray-900
- **Visual Style:** Bottom border (2px gray-200), padding-bottom 20px
- **Use Case:** Main sections like "Introduction", "Key Benefits", "Conclusion"

**Spacing Example:**
```
[Previous paragraph ends]
← 80px gap (clear visual break) →
## Major Section Heading
← 32px gap →
First paragraph of new section...
```

---

### H3 - Subsection Headers
- **Font Size:** 24px (text-2xl)
- **Line Height:** 1.3
- **Margin Top:** 64px (mt-16) - **Significant breathing room**
- **Margin Bottom:** 24px (mb-6)
- **Font Weight:** Bold (700)
- **Color:** Gray-800
- **Use Case:** Subsections within major sections

**Spacing Example:**
```
[Previous paragraph ends]
← 64px gap →
### Subsection Heading
← 24px gap →
First paragraph...
```

---

### H4 - Minor Section Headers
- **Font Size:** 20px (text-xl)
- **Line Height:** 1.35
- **Margin Top:** 48px (mt-12)
- **Margin Bottom:** 16px (mb-4)
- **Font Weight:** Bold (700)
- **Color:** Gray-800
- **Use Case:** Smaller sections or topic breaks

---

### H5 - Smallest Headers
- **Font Size:** 18px (text-lg)
- **Line Height:** 1.4
- **Margin Top:** 40px (mt-10)
- **Margin Bottom:** 12px (mb-3)
- **Font Weight:** Semibold (600)
- **Color:** Gray-700
- **Use Case:** Minor subsections, rarely used

---

## Body Text Spacing

### Paragraphs
- **Font Size:** 19px
- **Line Height:** 1.65 (31.35px)
- **Margin Bottom:** 28px (mb-7)
- **Max Width:** 75 characters (optimal readability)
- **Color:** Gray-700

### First Paragraph (Intro)
- **Font Size:** 21px (slightly larger)
- **Line Height:** 1.65
- **Color:** Gray-800 (slightly darker)
- **Purpose:** Draws reader into article

### Lists
- **Item Spacing:** 12px between items (space-y-3)
- **Margin Bottom:** 28px (mb-7)
- **Line Height:** 1.65
- **Max Width:** 75 characters

---

## Other Elements

### Blockquotes
- **Margin Top/Bottom:** 40px (my-10)
- **Padding:** 20px vertical, 24px left, 16px right
- **Border:** 4px left border (gray-300)
- **Background:** Gray-50
- **Font Style:** Italic

### Code Blocks
- **Margin Top/Bottom:** 40px (my-10)
- **Border Radius:** 8px (rounded-lg)
- **Shadow:** Large shadow

### Images
- **Margin Top/Bottom:** 56px (my-14)
- **Border Radius:** 8px (rounded-lg)
- **Border:** 1px gray-200

### Horizontal Rules (Dividers)
- **Margin Top/Bottom:** 64px (my-16) - **Creates major breaks**
- **Height:** 1px
- **Color:** Gray-300

---

## Visual Spacing Diagram

```
┌─────────────────────────────────────┐
│ H2 Section Heading                  │ ← 80px above
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
└─────────────────────────────────────┘
                                        ← 32px below
┌─────────────────────────────────────┐
│ Paragraph text continues here       │
│ with proper line height of 1.65...  │
└─────────────────────────────────────┘
                                        ← 28px gap
┌─────────────────────────────────────┐
│ Another paragraph follows with      │
│ consistent spacing...                │
└─────────────────────────────────────┘
                                        ← 64px gap
┌─────────────────────────────────────┐
│ H3 Subsection Heading               │
└─────────────────────────────────────┘
                                        ← 24px below
┌─────────────────────────────────────┐
│ Subsection content begins...        │
└─────────────────────────────────────┘
```

---

## Key Improvements from Previous Version

### Before:
- ❌ Inconsistent spacing (mt-16, mt-12, mt-10, mt-8)
- ❌ Line height too high (1.8) - text felt disconnected
- ❌ No mathematical relationship between elements
- ❌ Yellow backgrounds everywhere distracting

### After:
- ✅ **Systematic vertical rhythm** (based on line-height / 1.5)
- ✅ **2× rule** for heading spacing (80px, 64px, 48px, 40px)
- ✅ **Optimal line height** (1.65 for body, 1.2-1.35 for headings)
- ✅ **Clear visual hierarchy** through spacing alone
- ✅ **75-character line length** for maximum readability
- ✅ **Clean, professional appearance** - no excessive decoration

---

## Reading Experience

This spacing creates a comfortable reading rhythm where:
1. **Major sections** have clear visual breaks (80px)
2. **Subsections** are distinct but connected (64px)
3. **Paragraphs** flow naturally (28px between)
4. **Headings** draw the eye without overwhelming
5. **Content** feels organized and professional

The spacing follows principles used by high-end publications like Medium, The New York Times, and The Verge.
