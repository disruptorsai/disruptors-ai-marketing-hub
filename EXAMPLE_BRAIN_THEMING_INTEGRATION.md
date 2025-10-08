# Example: Integrating Brain Theming into AI Content Writer

This document shows a complete before/after example of integrating Brain Theming into the AI Content Writer app.

## Before (Generic Styling)

```jsx
export default function AIContentWriter() {
  const [userBrain, setUserBrain] = useState(null);
  const [loading, setLoading] = useState(true);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">AI Content Writer</h1>
        <p className="text-muted-foreground">
          Generate SEO-optimized blog content powered by your Business Brain
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="titles">Generate Titles</TabsTrigger>
          <TabsTrigger value="article">Write Article</TabsTrigger>
          {/* ... more tabs */}
        </TabsList>
      </Tabs>
    </div>
  );
}
```

## After (Brain-Themed Styling)

```jsx
import BrainThemedLayout, { BrandedHeading, BrandedButton } from '@/components/layout/BrainThemedLayout';
import { useBrainTheming } from '@/hooks/useBrainTheming';

export default function AIContentWriter() {
  const { theme, brain, loading } = useBrainTheming();

  if (loading) {
    return (
      <BrainThemedLayout showLoading={true}>
        {/* Loading state handled by layout */}
      </BrainThemedLayout>
    );
  }

  return (
    <BrainThemedLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Branded header with user's brand colors and fonts */}
        <div className="mb-8">
          <BrandedHeading level={1} className="text-4xl mb-2">
            AI Content Writer
          </BrandedHeading>
          <p className="text-muted-foreground">
            Generate SEO-optimized blog content for{' '}
            <span className="font-semibold text-[var(--brand-primary)]">
              {brain?.business_name || 'your business'}
            </span>
          </p>
        </div>

        {/* Brand-colored stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[var(--brand-primary)]/10 to-[var(--brand-primary)]/5 border-2 border-[var(--brand-primary)]/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[var(--brand-primary)] mb-2">
              Brand Voice Active
            </h3>
            <p className="text-sm text-muted-foreground">
              All content matches your unique brand voice
            </p>
          </div>

          <div className="bg-gradient-to-br from-[var(--brand-secondary)]/10 to-[var(--brand-secondary)]/5 border-2 border-[var(--brand-secondary)]/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[var(--brand-secondary)] mb-2">
              SEO Optimized
            </h3>
            <p className="text-sm text-muted-foreground">
              Automatically optimized for search engines
            </p>
          </div>

          <div className="bg-gradient-to-br from-[var(--brand-accent)]/10 to-[var(--brand-accent)]/5 border-2 border-[var(--brand-accent)]/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[var(--brand-accent)] mb-2">
              AI Powered
            </h3>
            <p className="text-sm text-muted-foreground">
              Claude Sonnet 4.5 generates high-quality content
            </p>
          </div>
        </div>

        {/* Tabs with branded active state */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger
              value="titles"
              className="data-[state=active]:bg-[var(--brand-primary)] data-[state=active]:text-white"
            >
              Generate Titles
            </TabsTrigger>
            <TabsTrigger
              value="article"
              className="data-[state=active]:bg-[var(--brand-primary)] data-[state=active]:text-white"
            >
              Write Article
            </TabsTrigger>
            {/* ... more tabs */}
          </TabsList>
        </Tabs>
      </div>
    </BrainThemedLayout>
  );
}
```

## Key Changes

### 1. Wrap with BrainThemedLayout

```jsx
<BrainThemedLayout>
  {/* Your app content */}
</BrainThemedLayout>
```

**Benefits:**
- Automatically loads user's brain
- Injects CSS custom properties
- Handles loading/error states
- Optional brain info header

### 2. Use BrandedHeading Component

```jsx
<BrandedHeading level={1} className="text-4xl mb-2">
  AI Content Writer
</BrandedHeading>
```

**Result:** Heading uses user's brand heading font and primary color

### 3. Apply Brand Colors to UI Elements

```jsx
<div className="bg-gradient-to-br from-[var(--brand-primary)]/10 to-[var(--brand-primary)]/5 border-2 border-[var(--brand-primary)]/20 rounded-lg p-6">
  <h3 className="text-lg font-semibold text-[var(--brand-primary)]">
    Stat Title
  </h3>
</div>
```

**Result:** Cards, borders, and text use user's brand colors

### 4. Style Tab Active States

```jsx
<TabsTrigger
  value="titles"
  className="data-[state=active]:bg-[var(--brand-primary)] data-[state=active]:text-white"
>
  Generate Titles
</TabsTrigger>
```

**Result:** Active tab uses user's primary brand color

### 5. Use BrandedButton for Actions

```jsx
<BrandedButton variant="primary" onClick={handleGenerate}>
  Generate Content
</BrandedButton>

<BrandedButton variant="outline" onClick={handleCancel}>
  Cancel
</BrandedButton>
```

**Result:** Buttons styled with user's brand colors

## Visual Comparison

### User A: Construction Company
```javascript
// Brand colors
{
  primary: '#FF6B35',    // Orange
  secondary: '#004E89',  // Navy Blue
  accent: '#F77F00',     // Bright Orange
}
```

**UI appears with:** Orange headings, navy accents, warm gradient backgrounds

### User B: Law Firm
```javascript
// Brand colors
{
  primary: '#1A3A52',    // Dark Blue
  secondary: '#8B7355',  // Gold/Brown
  accent: '#C4A35A',     // Light Gold
}
```

**UI appears with:** Dark blue headings, gold accents, professional gradient backgrounds

### User C: Tech Startup
```javascript
// Brand colors
{
  primary: '#7C3AED',    // Purple
  secondary: '#06B6D4',  // Cyan
  accent: '#F59E0B',     // Amber
}
```

**UI appears with:** Purple headings, cyan accents, vibrant gradient backgrounds

## Advanced: Branded Components

Create reusable branded components for consistent theming:

```jsx
// src/components/branded/BrandedStatCard.jsx
export function BrandedStatCard({ title, description, variant = 'primary' }) {
  const colorVar = `--brand-${variant}`;

  return (
    <div
      className={`
        bg-gradient-to-br
        from-[var(${colorVar})]/10
        to-[var(${colorVar})]/5
        border-2
        border-[var(${colorVar})]/20
        rounded-lg
        p-6
        hover:border-[var(${colorVar})]/40
        transition-colors
      `}
    >
      <h3 className={`text-lg font-semibold text-[var(${colorVar})] mb-2`}>
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

// Usage
<BrandedStatCard
  variant="primary"
  title="Brand Voice Active"
  description="All content matches your unique brand voice"
/>
```

## Testing Your Integration

1. **Create test brain with custom colors:**
   ```bash
   node scripts/create-test-user.js test@example.com password123 "Test Co" https://test.com construction
   ```

2. **Update brain colors in Supabase:**
   ```sql
   UPDATE business_brains
   SET brand_colors = '{"primary": "#FF6B35", "secondary": "#004E89"}'::jsonb
   WHERE business_name = 'Test Co';
   ```

3. **Login and verify theming:**
   - Navigate to `/app/content-writer`
   - Inspect elements to see CSS variables
   - Verify colors match your brain's brand_colors

4. **Test with different brains:**
   - Create multiple test users with different brand colors
   - Verify each sees their own branded interface

## Complete File Example

See the full implementation in:
- `src/pages/ai-content-writer.jsx` (after theming integration)
- `src/hooks/useBrainTheming.js` (brain theming hook)
- `src/components/layout/BrainThemedLayout.jsx` (layout wrapper)

## Next Steps

1. **Integrate into Business Brain Manager:**
   - Update `src/pages/business-brain-manager.jsx` with BrainThemedLayout

2. **Create branded component library:**
   - Build reusable branded components in `src/components/branded/`

3. **Update admin modules:**
   - Decide which admin modules should use brain theming

4. **Extend brain data:**
   - Add more brand settings (logo usage, animation preferences, etc.)
