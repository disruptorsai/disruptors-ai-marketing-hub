# Development Workflow

## Development Environment

### Start Development Server

```bash
# Frontend only (Vite)
npm run dev

# Frontend + Netlify functions
npm run dev:netlify

# With auto-commit
npm run dev:auto

# Safe mode (no automation)
npm run dev:safe
```

**Important:** Use `npm run dev:netlify` when working with Growth Audit, Marketing Audit, Business Brain, or any features requiring Netlify functions.

### Auto-Commit System

Enabled via `npm run dev:auto`:

**Features:**
- Intelligent change detection
- Semantic commit messages
- Automatic changelog updates
- Documentation synchronization
- Integration management

**Configuration:**
- Commit frequency: On save + file watch
- Message format: Semantic versioning
- Auto-changelog: Enabled

## Automation Scripts

### Changelog Management

```bash
# Add changelog entry
npm run changelog:add

# Flush pending entries
npm run changelog:flush

# Create release
npm run changelog:release

# Check status
npm run changelog:status
```

### Database Management

```bash
# Setup database
npm run db:setup

# Apply Business Brain migration
node scripts/apply-business-brain-migration.js

# Verify migration
node scripts/verify-business-brain-tables.cjs

# Apply Modules migration
node scripts/apply-modules-migration.js

# Seed modules
node scripts/seed-modules.js
```

### MCP Server Management

```bash
# Start orchestrator
npm run mcp:start

# Check status
npm run mcp:status

# Health check
npm run mcp:health

# Monitor
npm run mcp:monitor

# Optimize
npm run mcp:optimize

# Security audit
npm run mcp:security
```

## Code Quality

### Linting

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

**Always run `npm run lint` before commits**

### Code Standards

- **ESLint** - React and accessibility rules
- **Radix UI patterns** - Consistent component composition
- **TypeScript adoption** - Use for utilities
- **JSDoc documentation** - Public APIs

## Component Development

### Creating New Components

#### UI Components (Radix UI)

```javascript
// src/components/ui/my-component.jsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export const MyComponent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('base-classes', className)}
      {...props}
    />
  )
})
MyComponent.displayName = 'MyComponent'
```

#### Shared Components

```javascript
// src/components/shared/MyFeature.jsx
import { useState } from 'react'

export default function MyFeature({ title, children }) {
  const [state, setState] = useState(null)

  return (
    <div className="my-feature">
      <h2>{title}</h2>
      {children}
    </div>
  )
}
```

### Component Patterns

1. **Functional components with hooks**
2. **JSDoc documentation for public APIs**
3. **Consistent Radix UI composition patterns**
4. **Environment-aware service selection**

## Animation Development

### Framer Motion (UI Interactions)

```javascript
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {content}
</motion.div>
```

### GSAP (Scroll Animations)

```javascript
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function MyComponent() {
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
          end: 'top 50%',
          scrub: true
        }
      }
    )
  }, [])

  return <div ref={ref}>{content}</div>
}
```

### Spline 3D

```javascript
import Spline from '@splinetool/react-spline'

<Spline
  scene="https://prod.spline.design/..."
  onLoad={(spline) => {
    // Control scene programmatically
    spline.setVariable('rotation', 45)
  }}
/>
```

## Data Layer Development

### Always Use Custom SDK

```javascript
import sdk from '@/lib/custom-sdk'

// Create
const post = await sdk.create('posts', { ... })

// Read
const posts = await sdk.getAll('posts')
const post = await sdk.getById('posts', id)

// Update
await sdk.update('posts', id, { ... })

// Delete
await sdk.delete('posts', id)
```

### Centralized Supabase Clients

```javascript
import { supabase, supabaseAdmin } from '@/lib/supabase-client'

// User operations
const { data } = await supabase.from('posts').select('*')

// Admin operations (server-side only)
const { data } = await supabaseAdmin.from('posts').select('*')
```

## Module Development

### Creating New Module

```bash
# Copy template
cp -r src/modules/_template src/modules/my-module

# Update files:
# 1. manifest.json - Module definition
# 2. index.jsx - Module orchestration
# 3. MyModuleUI.jsx - React component
# 4. schema.js - Zod validation
# 5. README.md - Documentation
```

### Module Structure

```javascript
// manifest.json - 43 required fields
{
  "id": "my-module",
  "slug": "my-module",
  "name": "My Module",
  "description": "...",
  "category": "seo",
  "status": "testing",
  "audience": ["internal"],
  "requires_brain": true,
  "requires_auth": true,
  // ... more fields
}
```

## Testing

### Manual Browser Testing

No automated test framework - verify through manual testing:

1. Start dev server: `npm run dev:netlify`
2. Open browser to `http://localhost:8888`
3. Test all functionality
4. Check browser console for errors
5. Verify network requests
6. Test on different browsers
7. Test responsive design

### Error Debugging

- **Browser console** - Client-side errors
- **Network tab** - API requests
- **Netlify function logs** - Server-side errors
- **ESLint** - Code quality issues

## Common Workflows

### Adding New Page

1. Create page component in `src/pages/`
2. Import in `src/pages/index.jsx` (lazy if not Home)
3. Add to `PAGES` object
4. Add React Router `<Route>` definition
5. Update navigation if needed
6. Test routing

### Adding New Netlify Function

1. Create function in `netlify/functions/`
2. Export `handler` function
3. Configure in `netlify.toml` if needed
4. Test locally with `npm run dev:netlify`
5. Deploy and verify

### Updating Environment Variables

1. Update `.env` file locally
2. Update Netlify environment variables:
   ```bash
   npm run deploy:sync-env
   ```
3. Redeploy to apply changes

## Performance Optimization

### Lazy Loading

```javascript
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'))

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

### Code Splitting

Vite automatically splits code - see `vite.config.js` for manual chunk configuration.

### Image Optimization

```javascript
// Use appropriate formats
<img src="image.webp" alt="..." />

// Lazy load images
<img loading="lazy" src="..." alt="..." />

// Cloudinary optimization
const optimizedUrl = cloudinary.url('image.jpg', {
  width: 800,
  quality: 'auto',
  format: 'auto'
})
```

## Best Practices

1. **Run lint before commits** - `npm run lint`
2. **Use path alias** - `@/` for imports
3. **Follow naming conventions** - See FILE_ORGANIZATION.md
4. **Document complex logic** - JSDoc comments
5. **Test locally first** - Before deploying
6. **Use Custom SDK** - For all data operations
7. **Import from centralized locations** - Avoid creating new clients
8. **Monitor performance** - Check bundle size
9. **Handle errors gracefully** - User-friendly messages
10. **Keep dependencies updated** - Regular updates

## Related Documentation

- `docs/workflows/TESTING.md` - Testing procedures
- `docs/workflows/GIT.md` - Git workflow
- `docs/architecture/FILE_ORGANIZATION.md` - File structure
- `docs/architecture/DATA_LAYER.md` - Data operations
- `docs/BUILD_OPTIMIZATION.md` - Build configuration
