# Routing System

## Overview

The application implements a distinctive custom routing architecture managed in `src/pages/index.jsx`, providing centralized control over all page components and their URL mappings.

## Key Features

- **74+ page components** centrally imported and mapped in a `PAGES` object
- **URL-to-component mapping** handled by `_getCurrentPage()` function
- **Layout wrapper system** where `Layout.jsx` wraps all pages and receives `currentPageName` prop
- **Dual routing definition** with both custom mapping and React Router `<Routes>` (75 routes)
- **Lazy loading strategy**: All pages except Home are lazy-loaded using React.lazy() with Suspense (71 lazy imports)
- **Demo pages** (3D/animation heavy) are lazy-loaded to defer ~2MB physics bundle until needed
- **Retry logic**: Uses `lazyWithRetry()` utility to handle chunk loading failures during deployments

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
function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0]; // Returns first page (Home) if not found
}
```

### PAGES Object

```javascript
// Home page loaded immediately for faster initial render
import Home from "./Home.jsx";

// All other pages lazy loaded with retry logic
const Assessment = lazyWithRetry(() => import('./assessment.jsx'));
const Calculator = lazyWithRetry(() => import('./calculator.jsx'));
// ... 71+ lazy loaded pages

const PAGES = {
  Home: Home,
  tools: Tools,
  assessment: Assessment,
  calculator: Calculator,
  "marketing-audit": MarketingAudit,
  // ... 74+ total pages
}
```

### Layout Integration

```javascript
// PagesContent wrapper uses useLocation inside Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    return (
        <Layout currentPageName={currentPage}>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Routes defined here */}
                </Routes>
            </Suspense>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
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
import Home from "./Home.jsx";
```

### Lazy Loaded Pages with Retry Logic
All other pages use `lazyWithRetry()` utility for code splitting with automatic retry on chunk load failure:

```javascript
const Assessment = lazyWithRetry(() => import('./assessment.jsx'));
const Calculator = lazyWithRetry(() => import('./calculator.jsx'));
const About = lazyWithRetry(() => import('./about.jsx'));
// etc. (71 lazy loaded components)
```

The `lazyWithRetry()` utility from `@/utils/lazyWithRetry` automatically retries failed chunk loads, handling deployment scenarios where old chunks are no longer available.

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

- `src/pages/index.jsx` - Central routing configuration (74+ pages, 75 routes, 71 lazy imports)
- `src/utils/lazyWithRetry.js` - Lazy loading utility with automatic retry logic
- `src/pages/Layout.jsx` - Layout wrapper component
- `src/components/shared/Navigation.jsx` - Navigation component
