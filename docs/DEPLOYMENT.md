# Deployment Configuration

## Platform

**Netlify** with automatic Git deployment

## Site Information

- **Site ID**: `cheerful-custard-2e6fc5`
- **Primary Domain**: https://dm4.wjwelsh.com
- **Netlify Domain**: https://master--cheerful-custard-2e6fc5.netlify.app
- **Admin Dashboard**: https://app.netlify.com/projects/cheerful-custard-2e6fc5

## Build Configuration

### Build Settings

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"
```

### Build Command

```bash
npm run build
```

Runs Vite build process:
- Bundles all JavaScript
- Processes CSS with Tailwind
- Optimizes images
- Generates dist/ folder

### Publish Directory

```
dist/
```

Contains:
- index.html
- assets/ (JS, CSS bundles)
- images/
- videos/
- Other static assets

### Functions Directory

```
netlify/functions/
```

Contains 11 serverless functions (see `docs/architecture/NETLIFY_FUNCTIONS.md`)

## Deployment Commands

### Production Deployment

```bash
# Full-stack production deployment
npm run deploy:prod

# Or manually
git push origin master
```

### Preview Deployment

```bash
# Deploy preview (branch deployment)
npm run deploy:netlify

# Or
git push origin feature-branch
```

### Check Deployment Status

```bash
# Show deployment status and history
npm run deploy:status

# Or use Netlify CLI
npx netlify deploys:list
```

### Rollback Deployment

```bash
# Rollback to previous deployment
npm run deploy:rollback <deployment-id>

# Or via Netlify dashboard
```

## Automatic Deployment

### Git Integration

**Trigger**: Push to any branch

**Production Branch**: `master`
- Automatic deploy to production domain
- https://dm4.wjwelsh.com

**Feature Branches**: Any other branch
- Automatic deploy to preview URL
- https://[branch]--cheerful-custard-2e6fc5.netlify.app

### Build Notifications

Notifications sent to:
- Email (if configured)
- Slack (if configured)
- GitHub commit status

## SPA Routing

### _redirects File

```
# public/_redirects
/*    /index.html   200
```

Ensures all routes handled by React Router.

## Security Headers

### Content Security Policy (CSP)

```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = '''
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https: blob:;
      connect-src 'self'
        https://ubqxflzuvxowigbjmqfb.supabase.co
        https://api.openai.com
        https://api.anthropic.com
        https://generativelanguage.googleapis.com
        https://api.replicate.com
        https://api.firecrawl.dev
        https://api.brandfetch.io
        https://pagespeedonline.googleapis.com;
      frame-src 'self' https://prod.spline.design;
    '''
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## Environment Variables

### Netlify Dashboard

1. Go to https://app.netlify.com/projects/cheerful-custard-2e6fc5
2. Navigate to Site settings → Environment variables
3. Add/update variables

### Sync Environment Variables

```bash
# Sync from local .env to Netlify
npm run deploy:sync-env
```

### Required Variables

```bash
# Supabase (REQUIRED)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_SERVICE_ROLE_KEY=...

# AI Services
VITE_ANTHROPIC_API_KEY=...
VITE_OPENAI_API_KEY=...
VITE_GEMINI_API_KEY=...

# Growth Audit
VITE_FIRECRAWL_API_KEY=...

# Keyword Research
DATAFORSEO_LOGIN=...
DATAFORSEO_PASSWORD=...
```

## Function Configuration

### Function Settings

```toml
# netlify.toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[functions."growth-audit-ingest"]]
  timeout = 26

[[functions."growth-audit-stream"]]
  timeout = 26
```

### External Dependencies

```toml
[functions]
  external_node_modules = [
    "@ai-sdk/openai",
    "@ai-sdk/anthropic",
    "ai",
    "playwright",
    "playwright-core",
    "chromium-bidi",
    "@mendable/firecrawl-js",
    "node-vibrant",
    "culori"
  ]
```

### Function Timeout

**Free Tier**: 26 seconds maximum

Strategies for long-running operations:
- Job queue pattern (Growth Audit)
- SSE streaming (return immediately, stream results)
- Background processing
- Chunked operations

## Caching

### Asset Caching

```toml
# netlify.toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=604800"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
```

### Cache-Control Strategy

- **Immutable assets** (JS bundles, CSS with hash): 1 year
- **Images**: 1 week
- **HTML**: No cache (always fresh)

## Performance Optimization

### Build Optimization

See `docs/BUILD_OPTIMIZATION.md` for details:
- Manual chunk splitting
- Code splitting
- Lazy loading
- Image optimization

### Deploy Speed

Typical deploy times:
- Build: 2-3 minutes
- Function deployment: 30 seconds
- Total: < 4 minutes

## Monitoring

### Deploy Logs

View in Netlify dashboard:
1. Go to https://app.netlify.com/projects/cheerful-custard-2e6fc5
2. Click on deploy
3. View logs

### Function Logs

1. Navigate to Functions tab
2. Click function name
3. View invocation logs

### Real-Time Monitoring

```bash
# Watch deployment in real-time
npm run deploy:watch
```

## Database Deployment

### Supabase Migrations

```bash
# Deploy database migrations
npm run deploy:supabase
```

Apply migrations via Supabase dashboard or CLI.

## Domain Configuration

### Custom Domain

**Primary**: https://dm4.wjwelsh.com

Configured in Netlify dashboard:
1. Site settings → Domain management
2. Add custom domain
3. Configure DNS records
4. Enable HTTPS (automatic via Let's Encrypt)

### SSL Certificate

- **Provider**: Let's Encrypt
- **Auto-renewal**: Enabled
- **HTTPS redirect**: Enabled

## Rollback Procedures

### Via Netlify Dashboard

1. Go to Deploys tab
2. Find previous deployment
3. Click "Publish deploy"
4. Confirm rollback

### Via CLI

```bash
# List recent deploys
npx netlify deploys:list

# Restore specific deploy
npm run deploy:rollback <deploy-id>
```

## Troubleshooting

### Build Failures

Common causes:
- **Linting errors** - Run `npm run lint` locally
- **TypeScript errors** - Fix type issues
- **Missing dependencies** - Check package.json
- **Environment variables** - Verify all required vars set

### Function Errors

Common causes:
- **Timeout** - Function exceeds 26 seconds
- **Missing env vars** - Check Netlify environment variables
- **Dependency issues** - Verify external_node_modules in netlify.toml
- **Memory limit** - Optimize memory usage

### Deploy Not Updating

Solutions:
- Clear Netlify cache
- Trigger manual deploy
- Check git branch is correct
- Verify build command runs locally

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests pass locally
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Feature tested in preview deployment
- [ ] Performance tested (Lighthouse > 90)
- [ ] Security headers configured
- [ ] Error handling tested
- [ ] Rollback plan ready

## Post-Deployment Verification

After deployment:

- [ ] Visit production URL
- [ ] Test critical paths
- [ ] Check for console errors
- [ ] Verify API calls succeed
- [ ] Test authentication
- [ ] Monitor function logs
- [ ] Check performance metrics
- [ ] Verify analytics tracking

## Related Documentation

- `docs/BUILD_OPTIMIZATION.md` - Build configuration
- `docs/architecture/NETLIFY_FUNCTIONS.md` - Function details
- `docs/workflows/GIT.md` - Git workflow
- `docs/workflows/TESTING.md` - Testing procedures
- `docs/TECHNOLOGY_STACK.md` - Technology stack
