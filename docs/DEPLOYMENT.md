# Deployment Configuration

## Deployment Strategy

**Two-Tier Deployment System** - Dual Netlify projects for development preview and production deployment.

### Overview

This project uses a **dev → production** deployment workflow:

1. **Development deployments** automatically deploy to `dev.disruptorsmedia.com` for preview and approval
2. **Production deployments** only deploy to `dm4.wjwelsh.com` after full approval from dev site
3. Both Netlify projects connected to the same `disruptors-ai-marketing-hub` GitHub repository

### Deployment Projects

#### Development Project (Auto-Deploy)
- **Site ID**: `62801e39-84b0-4586-a316-6c56a5e55718`
- **Domain**: https://dev.disruptorsmedia.com
- **Purpose**: Automatic preview deployments for testing and approval
- **Trigger**: Every push to any branch
- **Admin Dashboard**: https://app.netlify.com/sites/62801e39-84b0-4586-a316-6c56a5e55718

#### Production Project (Manual Deploy)
- **Site ID**: `cheerful-custard-2e6fc5`
- **Primary Domain**: https://dm4.wjwelsh.com
- **Netlify Domain**: https://master--cheerful-custard-2e6fc5.netlify.app
- **Purpose**: Production deployment after approval
- **Trigger**: Manual deployment only (after dev approval)
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

### Development Deployment (Automatic)

```bash
# Deploy to dev.disruptorsmedia.com (auto-triggered on push)
npm run deploy:dev

# Or manually trigger dev deployment
git push origin <any-branch>

# The deployment-validator agent automatically validates dev deployments
```

**Behavior**:
- Every push to any branch auto-deploys to dev site
- Deployment-validator agent runs comprehensive testing
- Health checks validate critical paths and functionality
- Results appear at https://dev.disruptorsmedia.com

### Production Deployment (Manual Only)

```bash
# Deploy to dm4.wjwelsh.com (ONLY after dev approval)
npm run deploy:prod

# Manual production deployment workflow:
# 1. Test thoroughly on dev.disruptorsmedia.com
# 2. Get approval for production deployment
# 3. Run production deploy command
# 4. Deployment-validator agent validates production deployment
```

**Important**: Production deployments should ONLY occur after:
- Full testing on dev site
- Approval from stakeholders
- All automated tests passing
- Manual verification complete

### Check Deployment Status

```bash
# Show status for both dev and production deployments
npm run deploy:status

# Dev site status
npx netlify api getSite --data='{"site_id": "62801e39-84b0-4586-a316-6c56a5e55718"}'

# Production site status
npx netlify api getSite --data='{"site_id": "cheerful-custard-2e6fc5"}'

# List recent deploys for dev
npx netlify deploys:list --site=62801e39-84b0-4586-a316-6c56a5e55718

# List recent deploys for production
npx netlify deploys:list --site=cheerful-custard-2e6fc5
```

### Rollback Deployment

```bash
# Rollback dev deployment
npm run deploy:rollback:dev <deployment-id>

# Rollback production deployment
npm run deploy:rollback:prod <deployment-id>

# Or via Netlify dashboard
```

## Automatic Deployment

### Git Integration

**Development Site (Auto-Deploy)**:
- **Trigger**: Push to ANY branch
- **Domain**: https://dev.disruptorsmedia.com
- **Site ID**: `62801e39-84b0-4586-a316-6c56a5e55718`
- **Validation**: Automatic deployment-validator agent runs after each deploy

**Production Site (Manual Only)**:
- **Trigger**: Manual deployment command only
- **Domain**: https://dm4.wjwelsh.com
- **Site ID**: `cheerful-custard-2e6fc5`
- **Validation**: Deployment-validator agent runs after manual deploy
- **Requirement**: Must be approved on dev site first

### Deployment Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Development Workflow                         │
└─────────────────────────────────────────────────────────────────┘

1. Code Changes → Git Push
   └─► Automatic deploy to dev.disruptorsmedia.com

2. Deployment-Validator Agent
   └─► Runs comprehensive testing suite
   └─► Health checks on critical paths
   └─► Performance validation
   └─► Functional testing

3. Manual Review on Dev Site
   └─► Test all features
   └─► Verify functionality
   └─► Get stakeholder approval

4. Production Deployment (Manual)
   └─► Run: npm run deploy:prod
   └─► Deploys to dm4.wjwelsh.com
   └─► Deployment-validator validates production

5. Post-Production Validation
   └─► Monitor production health
   └─► Verify critical paths
   └─► Check analytics
```

### Build Notifications

**Development Deploys**:
- Netlify build notifications
- GitHub commit status
- Deployment-validator agent reports

**Production Deploys**:
- Email notifications (if configured)
- Slack notifications (if configured)
- GitHub commit status
- Deployment-validator comprehensive report
- Manual verification required

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

## Deployment Checklists

### Pre-Development Deployment (Automatic)

Before pushing code (triggers auto-deploy to dev):

- [ ] `npm run lint` passes locally
- [ ] `npm run build` succeeds locally
- [ ] No console errors in dev environment
- [ ] Code changes committed with descriptive message

**Note**: Dev deployment happens automatically on push. The deployment-validator agent will catch issues.

### Development Site Verification

After auto-deploy to dev.disruptorsmedia.com:

- [ ] Build succeeded on Netlify
- [ ] Deployment-validator agent passed all tests
- [ ] Visit https://dev.disruptorsmedia.com
- [ ] Test new features/changes
- [ ] Check for console errors
- [ ] Verify API calls succeed
- [ ] Test authentication flows
- [ ] Check Netlify function logs
- [ ] Performance looks acceptable
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

### Pre-Production Deployment (Manual)

Before deploying to production (dm4.wjwelsh.com):

- [ ] **REQUIRED**: Full approval from dev site testing
- [ ] All dev deployment checks passed
- [ ] Stakeholder approval received
- [ ] Environment variables verified in production Netlify
- [ ] Database migrations applied to production (if any)
- [ ] Performance tested on dev (Lighthouse > 90)
- [ ] Security headers verified
- [ ] Error handling tested on dev
- [ ] Critical user journeys tested on dev
- [ ] Rollback plan prepared
- [ ] Team notified of production deployment

### Production Deployment Execution

```bash
# 1. Final verification
npm run lint
npm run build

# 2. Deploy to production
npm run deploy:prod

# 3. Monitor deployment
npm run deploy:watch
```

### Post-Production Verification

After deployment to dm4.wjwelsh.com:

- [ ] Build succeeded on Netlify
- [ ] Deployment-validator agent passed all tests
- [ ] Visit https://dm4.wjwelsh.com
- [ ] Test critical paths (homepage, modules, auth)
- [ ] Check for console errors
- [ ] Verify API calls succeed
- [ ] Test authentication flows
- [ ] Monitor Netlify function logs for errors
- [ ] Check performance metrics (Core Web Vitals)
- [ ] Verify analytics tracking
- [ ] Test form submissions
- [ ] Verify AI modules functionality
- [ ] Check Business Brain integration
- [ ] Monitor error rates for 24 hours

## Related Documentation

- `docs/BUILD_OPTIMIZATION.md` - Build configuration
- `docs/architecture/NETLIFY_FUNCTIONS.md` - Function details
- `docs/workflows/GIT.md` - Git workflow
- `docs/workflows/TESTING.md` - Testing procedures
- `docs/TECHNOLOGY_STACK.md` - Technology stack
