# Routing System

## Overview

The application implements a distinctive custom routing architecture managed in `src/pages/index.jsx`, providing centralized control over all page components and their URL mappings.

## Key Features

- **70+ page components** centrally imported and mapped in a `PAGES` object
- **URL-to-component mapping** handled by `_getCurrentPage()` function
- **Layout wrapper system** where `Layout.jsx` wraps all pages and receives `currentPageName` prop
- **Dual routing definition** with both custom mapping and React Router `<Routes>`
- **Lazy loading strategy**: All pages except Home are lazy-loaded using React.lazy() with Suspense
- **Demo pages** (3D/animation heavy) are lazy-loaded to defer ~2MB physics bundle until needed

## Page Patterns

### Core Pages
- Home, About, Contact, Work, Solutions, Blog system

### Work Case Studies
Pattern: `work-[client-name].jsx`
- `work-abc-plumbing.jsx`
- `work-defg-construction.jsx`
- etc.

### Solutions Pages
Pattern: `solutions-[service].jsx`
- `solutions-seo.jsx`
- `solutions-web-design.jsx`
- `solutions-content-marketing.jsx`
- etc.

### Demo Pages
- `/demos/growth-audit` - Growth Audit landing page
- `/demos/growth-audit/:jobId` - Growth Audit results
- `/demos/keyword-research` - Keyword Research tool
- `/demos/ai-content-writer` - AI Content Writer demo

### App Pages
- `/app/content-writer` - AI Content Writer (authenticated)
- `/app/business-brain` - Business Brain Manager (authenticated)

### Utility Pages
- Assessment, Calculator, Gallery, Podcast, Privacy, Terms, etc.

## Implementation Details

### Custom Routing Function

```javascript
// src/pages/index.jsx
const _getCurrentPage = () => {
  const path = window.location.pathname

  // Home page
  if (path === '/' || path === '') return 'Home'

  // Remove leading slash and get first segment
  const segment = path.substring(1).split('/')[0]

  // Map to page component
  const pageName = Object.keys(PAGES).find(key =>
    key.toLowerCase() === segment.toLowerCase()
  )

  return pageName || 'NotFound'
}
```

### PAGES Object

```javascript
const PAGES = {
  Home: HomePage,
  About: lazy(() => import('./about')),
  Contact: lazy(() => import('./contact')),
  Work: lazy(() => import('./work')),
  // ... 70+ pages
}
```

### Layout Integration

```javascript
// Layout wrapper receives current page name
const currentPageName = _getCurrentPage()

return (
  <Layout currentPageName={currentPageName}>
    <Suspense fallback={<LoadingSpinner />}>
      {PAGES[currentPageName]}
    </Suspense>
  </Layout>
)
```

### React Router Integration

The application uses both custom routing AND React Router for compatibility:

```javascript
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/about" element={<About />} />
  <Route path="/demos/growth-audit/:jobId" element={<GrowthAuditResults />} />
  {/* ... all routes defined */}
</Routes>
```

## Lazy Loading Strategy

### Immediate Loading
Only the Home page is loaded immediately to optimize initial bundle size.

```javascript
import HomePage from './home'
```

### Lazy Loaded Pages
All other pages use React.lazy() for code splitting:

```javascript
const About = lazy(() => import('./about'))
const Contact = lazy(() => import('./contact'))
// etc.
```

### Heavy Pages (3D/Animation)
Demo pages with heavy dependencies (Spline, GSAP, physics) are especially important to lazy load:

```javascript
const SplineDemo = lazy(() => import('./demos/spline-demo'))
// Defers ~2MB physics bundle until needed
```

## Benefits

1. **Centralized Management** - All routes defined in one place
2. **Type Safety** - Single source of truth for page names
3. **Performance** - Lazy loading reduces initial bundle size
4. **Flexibility** - Easy to add/remove pages
5. **Layout Integration** - Layout component knows which page is active
6. **SEO Friendly** - Works with React Router for proper routing

## Migration Notes

When adding a new page:

1. Create the page component in `src/pages/`
2. Import it in `src/pages/index.jsx` (lazy if not Home)
3. Add to `PAGES` object
4. Add React Router `<Route>` definition
5. Update navigation components if needed

## Related Files

- `src/pages/index.jsx` - Central routing configuration (70+ pages)
- `src/components/layout/Layout.jsx` - Layout wrapper component
- `src/components/shared/Navigation.jsx` - Navigation component
