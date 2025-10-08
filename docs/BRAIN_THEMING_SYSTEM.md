# Business Brain Theming System

## Overview

The Brain Theming System allows app interfaces to dynamically inherit styling (colors, typography, logos) from each user's Business Brain. This creates a personalized, white-label experience where every user sees the app styled with their own brand identity.

## Architecture

### Components

1. **`useBrainTheming` Hook** (`src/hooks/useBrainTheming.js`)
   - Loads user's Business Brain
   - Parses brand data (colors, typography, logo)
   - Injects CSS custom properties into document root
   - Returns theme object and brain data
   - Automatically uses default Disruptors theme if no brain exists

2. **`BrainThemedLayout` Component** (`src/components/layout/BrainThemedLayout.jsx`)
   - Wrapper layout for app pages
   - Automatically applies brain theming
   - Includes loading and error states
   - Optional brain info header
   - Utility components (BrandedHeading, BrandedButton, BrandedCard)

3. **CSS Custom Properties**
   - `--brand-primary`: Primary brand color
   - `--brand-secondary`: Secondary brand color
   - `--brand-accent`: Accent color
   - `--brand-neutral`: Neutral color
   - `--font-heading`: Heading font family
   - `--font-body`: Body font family
   - `--font-accent`: Accent font family
   - `--brand-logo-url`: Logo URL (for background-image)

## Brain Data Structure

Business Brain stores brand identity in JSONB columns:

```sql
-- brand_colors JSONB
{
  "primary": "#C9A53B",
  "secondary": "#2C6BAA",
  "accent": "#C96F4C",
  "neutral": "#3C7A6A"
}

-- typography JSONB
{
  "heading": "'Raleway', sans-serif",
  "body": "'Inter', sans-serif",
  "accent": "'Playfair Display', serif"
}

-- logo_urls JSONB
{
  "primary": "https://example.com/logo.png",
  "icon": "https://example.com/icon.png",
  "dark": "https://example.com/logo-dark.png",
  "light": "https://example.com/logo-light.png"
}
```

## Implementation Guide

### Basic Usage

Wrap your app page with `BrainThemedLayout`:

```jsx
import BrainThemedLayout from '@/components/layout/BrainThemedLayout';

export default function MyApp() {
  return (
    <BrainThemedLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Your app content */}
      </div>
    </BrainThemedLayout>
  );
}
```

### Using CSS Variables in Tailwind

```jsx
// Text color
<h1 className="text-[var(--brand-primary)]">
  Heading with primary brand color
</h1>

// Background color
<div className="bg-[var(--brand-secondary)]">
  Background with secondary color
</div>

// Border color
<button className="border-2 border-[var(--brand-primary)]">
  Button with brand border
</button>

// Font family
<p className="font-[var(--font-body)]">
  Text with brand font
</p>
```

### Using CSS Variables in Inline Styles

```jsx
// Simple color
<div style={{ color: 'var(--brand-primary)' }}>
  Styled text
</div>

// Multiple properties
<div style={{
  backgroundColor: 'var(--brand-secondary)',
  color: 'white',
  fontFamily: 'var(--font-heading)',
  borderColor: 'var(--brand-primary)',
}}>
  Fully branded component
</div>

// Logo as background image
<div style={{
  backgroundImage: 'var(--brand-logo-url)',
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  height: '60px',
  width: '200px',
}}>
</div>
```

### Using Utility Components

```jsx
import { BrandedHeading, BrandedButton, BrandedCard } from '@/components/layout/BrainThemedLayout';

// Branded heading
<BrandedHeading level={1}>
  My Branded Title
</BrandedHeading>

// Branded button variants
<BrandedButton variant="primary">Primary Action</BrandedButton>
<BrandedButton variant="secondary">Secondary Action</BrandedButton>
<BrandedButton variant="accent">Accent Action</BrandedButton>
<BrandedButton variant="outline">Outline Action</BrandedButton>

// Branded card
<BrandedCard>
  <h3>Card Title</h3>
  <p>Card content with branded border</p>
</BrandedCard>
```

### Advanced: Direct Hook Usage

For custom theming logic, use the hook directly:

```jsx
import { useBrainTheming } from '@/hooks/useBrainTheming';

export default function CustomThemedComponent() {
  const { theme, brain, loading, error, reload } = useBrainTheming();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1 style={{ color: theme.colors.primary }}>
        Welcome to {brain.business_name}
      </h1>

      <button
        style={{
          backgroundColor: theme.colors.primary,
          fontFamily: theme.typography.heading,
        }}
      >
        Branded Button
      </button>

      {theme.logoUrl && (
        <img src={theme.logoUrl} alt="Logo" />
      )}
    </div>
  );
}
```

## Example: Full Page Integration

```jsx
import React from 'react';
import BrainThemedLayout, { BrandedHeading, BrandedButton, BrandedCard } from '@/components/layout/BrainThemedLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AIContentWriter() {
  return (
    <BrainThemedLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Branded heading with custom styling */}
        <BrandedHeading level={1} className="text-4xl mb-2">
          AI Content Writer
        </BrandedHeading>

        <p className="text-muted-foreground mb-8">
          Generate SEO-optimized content with your brand voice
        </p>

        {/* Use standard Radix UI components with brain theming */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <BrandedCard>
            <h3 className="text-lg font-semibold text-[var(--brand-primary)] mb-2">
              Brand Voice
            </h3>
            <p className="text-sm text-muted-foreground">
              All content uses your unique brand voice and tone
            </p>
          </BrandedCard>

          <BrandedCard>
            <h3 className="text-lg font-semibold text-[var(--brand-primary)] mb-2">
              SEO Optimized
            </h3>
            <p className="text-sm text-muted-foreground">
              Automatically optimized for search engines
            </p>
          </BrandedCard>

          <BrandedCard>
            <h3 className="text-lg font-semibold text-[var(--brand-primary)] mb-2">
              AI Powered
            </h3>
            <p className="text-sm text-muted-foreground">
              Claude Sonnet 4.5 generates high-quality content
            </p>
          </BrandedCard>
        </div>

        {/* Action buttons with brand colors */}
        <div className="flex gap-4">
          <BrandedButton variant="primary">
            Generate Content
          </BrandedButton>
          <BrandedButton variant="outline">
            View Library
          </BrandedButton>
        </div>
      </div>
    </BrainThemedLayout>
  );
}
```

## Which Apps Should Use Brain Theming?

### ✅ Apps That Should Use Brain Theming

1. **AI Content Writer** - Content generation interface should match user's brand
2. **Business Brain Manager** - Dashboard for managing brain data
3. **Growth Audit** - Personalized audit reports with client branding
4. **Future AI Tools** - Any client-facing AI generation interfaces

### ⚠️ Apps That May Not Need Brain Theming

1. **Admin Interfaces** - Internal admin tools (Content Management, Team Management)
2. **Public Marketing Site** - Main Disruptors & Co marketing pages
3. **Authentication Pages** - Login/signup should remain branded as Disruptors

## Default Theme Fallback

When no brain exists or user is not authenticated, the system uses Disruptors & Co default theme:

```javascript
{
  colors: {
    primary: '#C9A53B',   // Muted Gold
    secondary: '#2C6BAA', // Lapis Blue
    accent: '#C96F4C',    // Terracotta
    neutral: '#3C7A6A',   // Verdigris Green
  },
  typography: {
    heading: "'Raleway', sans-serif",
    body: "'Inter', sans-serif",
    accent: "'Playfair Display', serif",
  },
  logoUrl: null,
}
```

## Performance Considerations

- **CSS Custom Properties**: Injected once on mount, no re-renders
- **Brain Loading**: Cached in hook state, only loads once per session
- **Theme Cleanup**: Automatically removes theme variables on unmount
- **Loading State**: Optional loading skeleton while brain data loads

## Testing

### Test with Different Brains

```javascript
// Create test brain with custom colors
const testBrain = {
  business_name: 'Test Business',
  brand_colors: {
    primary: '#FF6B35',
    secondary: '#004E89',
    accent: '#F77F00',
    neutral: '#06A77D',
  },
  typography: {
    heading: "'Montserrat', sans-serif",
    body: "'Open Sans', sans-serif",
    accent: "'Merriweather', serif",
  },
  logo_urls: {
    primary: 'https://example.com/logo.png',
  },
};
```

### Debug CSS Variables

Open browser DevTools → Elements → :root and inspect computed styles:

```css
:root {
  --brand-primary: #C9A53B;
  --brand-secondary: #2C6BAA;
  --brand-accent: #C96F4C;
  --brand-neutral: #3C7A6A;
  --font-heading: 'Raleway', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-accent: 'Playfair Display', serif;
  --brand-logo-url: url(https://example.com/logo.png);
}
```

## Future Enhancements

1. **Theme Presets**: Pre-built color palettes for quick setup
2. **Dark Mode**: Auto-generate dark mode variants from brand colors
3. **Accessibility**: Ensure contrast ratios meet WCAG standards
4. **Animation Preferences**: Use brain data to customize animation styles
5. **Layout Preferences**: Allow users to choose layout density/spacing
6. **Font Loading**: Automatically load custom fonts from Google Fonts
7. **Design System Export**: Export theme as Figma/Tailwind config

## Related Documentation

- `docs/BUSINESS_BRAIN_COMPLETE_SYSTEM.md` - Business Brain system overview
- `docs/BUSINESS_BRAIN_INTEGRATION_GUIDE.md` - Brain integration guide
- `docs/AUTHENTICATION_SYSTEM.md` - User authentication and brain loading
- `docs/APP_INTEGRATION_GUIDE.md` - App interface integration patterns

## Questions?

For implementation help, see example in `src/pages/ai-content-writer.jsx` or contact the development team.
