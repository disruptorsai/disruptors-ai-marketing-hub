# Testing & Quality Assurance

## Testing Approach

This project uses **manual browser testing** - no automated test framework is configured.

## Manual Testing Checklist

### 1. Functionality Testing

#### Core Pages
- [ ] Home page loads correctly
- [ ] About page displays all content
- [ ] Contact form submits successfully
- [ ] Work portfolio pages load
- [ ] Solutions pages display correctly
- [ ] Blog system works (if implemented)

#### Authentication
- [ ] Login modal appears
- [ ] Google OAuth login works
- [ ] Email/password login works
- [ ] Password reset works
- [ ] Session persistence works
- [ ] Logout works correctly

#### App Pages (Authenticated)
- [ ] `/app/content-writer` loads with brain
- [ ] `/app/business-brain` displays correctly
- [ ] Protected routes redirect to login
- [ ] Business Brain auto-loads

#### Admin Access
- [ ] Secret access pattern works (5 logo clicks OR Ctrl+Shift+D)
- [ ] Matrix login appears
- [ ] Admin authentication works
- [ ] Admin dashboard loads
- [ ] All 11 modules accessible
- [ ] Emergency exit works (Ctrl+Shift+Escape)

#### Modules
- [ ] Keyword Research module works
- [ ] AI Content Writer generates content
- [ ] Growth Audit completes successfully
- [ ] Quotas enforced correctly
- [ ] Telemetry tracked

### 2. Performance Testing

#### Page Load Times
- [ ] Home page < 3 seconds
- [ ] Lazy-loaded pages < 2 seconds
- [ ] Admin pages < 2 seconds
- [ ] Heavy 3D pages < 5 seconds

#### Animation Performance
- [ ] GSAP animations smooth (60fps)
- [ ] Framer Motion transitions fluid
- [ ] Spline 3D scenes responsive
- [ ] No jank or stuttering
- [ ] Mobile performance acceptable

#### Bundle Size
- [ ] Initial bundle < 500KB gzipped
- [ ] Lazy chunks < 250KB each
- [ ] Total page size reasonable
- [ ] Images optimized

### 3. Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### 4. Responsive Design

Test breakpoints:
- [ ] Mobile (320px - 640px)
- [ ] Tablet (641px - 1024px)
- [ ] Desktop (1025px+)
- [ ] Large desktop (1440px+)

### 5. Error Handling

#### Expected Errors
- [ ] Login with invalid credentials shows error
- [ ] Form validation works
- [ ] API errors display user-friendly messages
- [ ] 404 page shows for invalid routes
- [ ] Network errors handled gracefully

#### Edge Cases
- [ ] Empty states display correctly
- [ ] Loading states show
- [ ] Long content doesn't break layout
- [ ] Special characters handled
- [ ] XSS attempts blocked

## Debugging Procedures

### Client-Side Errors

#### Browser Console

```javascript
// Check for errors
console.error // Red errors
console.warn // Yellow warnings
console.log // Debug info
```

**Common errors to check:**
- React errors (component issues)
- Network errors (failed API calls)
- JavaScript errors (syntax, runtime)
- CORS errors (cross-origin issues)

#### Network Tab

Check for:
- Failed API requests (status 4xx, 5xx)
- Slow requests (> 1 second)
- Large payloads (> 1MB)
- Incorrect request/response formats

### Server-Side Errors

#### Netlify Function Logs

1. Go to https://app.netlify.com/projects/cheerful-custard-2e6fc5
2. Navigate to Functions tab
3. Click function name
4. View logs

**Look for:**
- Function invocation errors
- Timeout errors (> 26 seconds)
- Environment variable issues
- API errors (third-party services)

### Database Errors

#### Supabase Dashboard

1. Go to Supabase dashboard
2. Navigate to Table Editor
3. Check data integrity
4. Review RLS policies
5. Check auth users

**Common issues:**
- RLS policy blocking operations
- Missing columns
- Data type mismatches
- Foreign key violations

## Code Quality Checks

### ESLint

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

**Before every commit:**
- Run `npm run lint`
- Fix all errors
- Review warnings

### Common ESLint Rules

- `react/prop-types` - PropTypes validation
- `jsx-a11y/*` - Accessibility rules
- `no-unused-vars` - Remove unused variables
- `react-hooks/exhaustive-deps` - Hook dependency warnings

## Testing Tools

### Browser DevTools

#### Console
- View errors and warnings
- Test JavaScript snippets
- Debug React components

#### Network
- Monitor API requests
- Check request/response
- Analyze performance

#### Performance
- Lighthouse audits
- Performance profiling
- Memory leaks

#### Application
- View localStorage
- Check cookies
- Inspect service workers

### React DevTools

Install: https://react.dev/learn/react-developer-tools

**Features:**
- Component tree inspection
- Props and state viewing
- Performance profiling
- Hook debugging

## Common Issues & Solutions

### Issue: "Multiple GoTrueClient instances"

**Cause:** Creating new Supabase clients instead of importing from `supabase-client.js`

**Solution:**
```javascript
// ❌ Don't do this
import { createClient } from '@supabase/supabase-js'
const client = createClient(url, key)

// ✅ Do this instead
import { supabase } from '@/lib/supabase-client'
```

### Issue: 404 on Netlify Function Endpoints

**Cause:** Not using `npm run dev:netlify`

**Solution:**
```bash
# Use this for features requiring functions
npm run dev:netlify

# Not this
npm run dev
```

### Issue: Lazy-Loaded Pages Not Found

**Cause:** Incorrect import path or missing component

**Solution:**
```javascript
// Check import path
const About = lazy(() => import('./about')) // ✅
const About = lazy(() => import('./About')) // ❌ (case-sensitive)
```

### Issue: CORS Errors

**Cause:** Missing CORS headers in Netlify functions

**Solution:**
```javascript
return {
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  },
  body: JSON.stringify(data)
}
```

### Issue: Environment Variables Not Working

**Cause:** Missing `VITE_` prefix or not restarted dev server

**Solution:**
```bash
# All client-accessible vars need VITE_ prefix
VITE_SUPABASE_URL=...  # ✅
SUPABASE_URL=...       # ❌ (won't work in client)

# Restart dev server after changing .env
npm run dev:netlify
```

## Performance Monitoring

### Lighthouse Audits

```bash
# Run Lighthouse in Chrome DevTools
1. Open Chrome DevTools
2. Click "Lighthouse" tab
3. Select categories
4. Click "Generate report"
```

**Target scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

### Bundle Analysis

```bash
# Analyze bundle size
npm run build

# Check dist folder
du -sh dist/*
```

### Performance Metrics

Monitor:
- **FCP** (First Contentful Paint) < 1.8s
- **LCP** (Largest Contentful Paint) < 2.5s
- **CLS** (Cumulative Layout Shift) < 0.1
- **TBT** (Total Blocking Time) < 200ms

## Pre-Deployment Checklist

Before deploying to production:

### Code Quality
- [ ] `npm run lint` passes
- [ ] No console errors
- [ ] No console warnings (or justified)
- [ ] Code formatted consistently
- [ ] Comments added where needed

### Functionality
- [ ] All features work as expected
- [ ] Forms validate correctly
- [ ] API calls succeed
- [ ] Error handling works
- [ ] Loading states show

### Performance
- [ ] Lighthouse score > 90
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Bundle size acceptable

### Security
- [ ] No exposed secrets
- [ ] RLS policies correct
- [ ] CORS configured properly
- [ ] Authentication works

### Browser Compatibility
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Safari
- [ ] Tested on mobile

### Responsive Design
- [ ] Mobile layout correct
- [ ] Tablet layout correct
- [ ] Desktop layout correct
- [ ] No horizontal scroll

## Continuous Monitoring

After deployment:

### Monitor Logs
- Netlify function logs
- Browser console errors
- Supabase logs

### Track Metrics
- Page load times
- Error rates
- API response times
- User engagement

### User Feedback
- Bug reports
- Feature requests
- Performance complaints

## Related Documentation

- `docs/workflows/DEVELOPMENT.md` - Development workflow
- `docs/workflows/GIT.md` - Git workflow
- `docs/DEPLOYMENT.md` - Deployment procedures
- `docs/BUILD_OPTIMIZATION.md` - Build configuration
- `docs/PERFORMANCE_OPTIMIZATION_GUIDE.md` - Performance tips
