# Deployment Validator Agent Rules

## Overview

The **deployment-validator agent** automatically validates deployments to both development and production environments, ensuring comprehensive testing and health checks are performed after each deployment.

## Dual Deployment Configuration

### Development Environment
- **Site ID**: `62801e39-84b0-4586-a316-6c56a5e55718`
- **Domain**: https://dev.disruptorsmedia.com
- **Trigger**: Automatic on every Git push
- **Validation**: Comprehensive but non-blocking
- **Purpose**: Preview and approval testing

### Production Environment
- **Site ID**: `cheerful-custard-2e6fc5`
- **Domain**: https://dm4.wjwelsh.com
- **Trigger**: Manual deployment only
- **Validation**: Comprehensive and critical
- **Purpose**: Live production site

## Automatic Trigger Conditions

The deployment-validator agent MUST automatically trigger on:

### Development Triggers (Auto-Deploy)
1. **Git Push Events**: Any push to any branch
2. **Netlify Build Completion**: Build success on dev site (`62801e39-84b0-4586-a316-6c56a5e55718`)
3. **Deploy Success Webhook**: Netlify webhook confirms deployment

### Production Triggers (Manual Deploy)
1. **Manual Deploy Command**: `npm run deploy:prod` execution
2. **Netlify Build Completion**: Build success on production site (`cheerful-custard-2e6fc5`)
3. **Deploy Success Webhook**: Netlify webhook confirms production deployment

### Health Check Failures
1. **404 Errors**: Critical pages returning 404
2. **500 Errors**: Server errors on any endpoint
3. **API Failures**: Supabase or Netlify function failures
4. **Authentication Errors**: Login/signup failures

## Validation Test Suite

### Level 1: Critical Path Tests (REQUIRED)

**Must pass for both dev and production**:

1. **Homepage Load**
   - Status: 200 OK
   - No console errors
   - Hero section renders
   - Navigation functional

2. **Authentication System**
   - Login page loads
   - Signup page loads
   - Google OAuth button present
   - No authentication errors

3. **Core Pages Load**
   - `/about` - 200 OK
   - `/services` - 200 OK
   - `/contact` - 200 OK
   - `/pricing` - 200 OK

4. **AI Modules Access**
   - `/app/keyword-research` - Loads (auth required)
   - `/app/ai-content-writer` - Loads (auth required)
   - `/app/growth-audit` - Loads (auth required)

5. **Admin Console**
   - `/admin/secret` - Login page loads
   - No 404 on admin routes

6. **Netlify Functions**
   - Health check endpoint responds
   - No function timeout errors
   - Environment variables accessible

### Level 2: Performance Tests (RECOMMENDED)

**Important but not blocking**:

1. **Page Load Times**
   - Homepage: < 3 seconds
   - Module pages: < 4 seconds
   - Admin pages: < 5 seconds

2. **Core Web Vitals**
   - LCP (Largest Contentful Paint): < 2.5s
   - FID (First Input Delay): < 100ms
   - CLS (Cumulative Layout Shift): < 0.1

3. **Lighthouse Scores**
   - Performance: > 85
   - Accessibility: > 90
   - Best Practices: > 90
   - SEO: > 90

### Level 3: Functional Tests (COMPREHENSIVE)

**Thorough validation for production**:

1. **User Journeys**
   - Complete signup flow
   - Login with email/password
   - Login with Google OAuth
   - Access AI modules
   - Generate keyword research
   - Create content with AI writer
   - Run growth audit

2. **Business Brain**
   - Create new brain
   - Add fact to brain
   - Query brain knowledge
   - Use brain in content generation

3. **Admin Functions**
   - Login to admin console
   - View dashboard
   - Access content management
   - Check telemetry data

4. **Form Submissions**
   - Contact form submits
   - Newsletter signup works
   - Lead magnet downloads

5. **API Integration**
   - Supabase connections work
   - DataForSEO API functional
   - Anthropic API functional
   - Google Gemini API functional
   - Firecrawl API functional

## Environment-Specific Rules

### Development Environment Rules

**Purpose**: Fast feedback for iterative development

1. **Test Scope**: Level 1 (Critical Path) + partial Level 2
2. **Failure Response**: Report issues but don't block
3. **Performance Tolerance**: More lenient thresholds
4. **Retry Logic**: Don't retry failed tests (fail fast)
5. **Notification**: Report to developer console only
6. **Frequency**: Every deployment (high frequency)

**Development Test Configuration**:
```javascript
{
  environment: "development",
  siteId: "62801e39-84b0-4586-a316-6c56a5e55718",
  domain: "https://dev.disruptorsmedia.com",
  testLevels: ["critical", "performance-basic"],
  blocking: false,
  retries: 0,
  timeout: 30000, // 30 seconds
  performanceThresholds: {
    lcp: 4000, // More lenient
    fid: 200,
    cls: 0.2
  }
}
```

### Production Environment Rules

**Purpose**: Ensure production quality and reliability

1. **Test Scope**: All Levels (1, 2, 3)
2. **Failure Response**: BLOCK deployment and alert team
3. **Performance Tolerance**: Strict production thresholds
4. **Retry Logic**: Retry failed tests up to 3 times
5. **Notification**: Email + Slack + console
6. **Frequency**: Only on manual deployments

**Production Test Configuration**:
```javascript
{
  environment: "production",
  siteId: "cheerful-custard-2e6fc5",
  domain: "https://dm4.wjwelsh.com",
  testLevels: ["critical", "performance", "functional"],
  blocking: true,
  retries: 3,
  timeout: 60000, // 60 seconds
  performanceThresholds: {
    lcp: 2500, // Strict
    fid: 100,
    cls: 0.1
  },
  notifications: {
    email: true,
    slack: true,
    console: true
  }
}
```

## Validation Workflow

### Development Deployment Flow

```
1. Code Push → GitHub
   └─► Netlify webhook triggers build

2. Build Completes on Dev Site
   └─► deployment-validator agent activates

3. Level 1: Critical Path Tests (30s)
   ├─► Homepage test
   ├─► Auth pages test
   ├─► Core pages test
   └─► Netlify functions test

4. Level 2: Basic Performance Tests (30s)
   ├─► Page load times
   └─► Basic Lighthouse audit

5. Generate Report
   ├─► Console output
   └─► Create temp/dev-deployment-report.md

6. If Failures
   └─► Log issues (non-blocking)
   └─► Continue deployment

7. Deployment Complete
   └─► Site live at dev.disruptorsmedia.com
```

### Production Deployment Flow

```
1. Manual Deploy Command
   └─► npm run deploy:prod

2. Pre-Flight Checks
   ├─► Verify dev site approval
   ├─► Check environment variables
   └─► Confirm database migrations

3. Build Triggers on Production Site
   └─► Netlify build starts

4. Build Completes
   └─► deployment-validator agent activates

5. Level 1: Critical Path Tests (60s)
   ├─► All critical paths verified
   └─► No errors allowed

6. Level 2: Performance Tests (60s)
   ├─► Full Lighthouse audit
   ├─► Core Web Vitals check
   └─► Load time verification

7. Level 3: Functional Tests (120s)
   ├─► User journey tests
   ├─► Business Brain tests
   ├─► Admin console tests
   └─► API integration tests

8. Generate Comprehensive Report
   ├─► Email to team
   ├─► Slack notification
   ├─► Console output
   └─► Create temp/prod-deployment-report.md

9. If ANY Failures
   ├─► HALT deployment
   ├─► Rollback to previous version
   ├─► Alert team immediately
   └─► Generate failure diagnostic

10. If All Pass
    └─► Deployment Complete
    └─► Monitor for 1 hour
    └─► Site live at dm4.wjwelsh.com
```

## Agent Behavior Rules

### DO Automatically

1. **Monitor both Netlify sites** for deployment events
2. **Detect build completions** via webhooks or polling
3. **Run appropriate test suite** based on environment
4. **Generate detailed reports** for every deployment
5. **Alert on critical failures** in production
6. **Track deployment history** and success rates
7. **Provide rollback recommendations** on failures

### DON'T Do

1. **Don't block dev deployments** - Report only
2. **Don't retry tests** in development (fail fast)
3. **Don't spam notifications** for dev deployments
4. **Don't deploy to production** without approval
5. **Don't skip critical tests** even if time-consuming
6. **Don't ignore health check failures**

## Failure Response Procedures

### Development Failure

```javascript
if (devTestFails) {
  log.warn('Development test failed:', testName);
  generateReport('dev-failure-report.md');
  continueDeployment(); // Non-blocking
}
```

### Production Failure

```javascript
if (prodTestFails) {
  log.error('PRODUCTION TEST FAILED:', testName);

  if (retriesRemaining > 0) {
    retry(testName);
  } else {
    haltDeployment();
    rollbackToPrevious();
    alertTeam({
      email: true,
      slack: true,
      urgency: 'CRITICAL'
    });
    generateDiagnostic('prod-failure-diagnostic.md');
  }
}
```

## Monitoring and Alerting

### Development Monitoring

- **Console logs**: All test results
- **Local report**: `temp/dev-deployment-report.md`
- **No external alerts**: Keep it quiet for frequent deploys

### Production Monitoring

- **Email alerts**: Send to team@disruptorsmedia.com
- **Slack notifications**: #deployments channel
- **Dashboard update**: Update deployment status dashboard
- **Comprehensive report**: `temp/prod-deployment-report.md`
- **24-hour monitoring**: Continue monitoring for errors

## Integration Points

### Netlify Webhooks

Configure webhooks in both Netlify projects:

**Development Site**:
- Webhook URL: `https://dm4.wjwelsh.com/.netlify/functions/deployment-webhook`
- Events: `deploy-succeeded`, `deploy-failed`
- Site ID: `62801e39-84b0-4586-a316-6c56a5e55718`

**Production Site**:
- Webhook URL: `https://dm4.wjwelsh.com/.netlify/functions/deployment-webhook`
- Events: `deploy-succeeded`, `deploy-failed`
- Site ID: `cheerful-custard-2e6fc5`

### Agent Configuration

The deployment-validator agent should read configuration from:

```javascript
// .claude/agents/deployment-validator-config.json
{
  "dev": {
    "siteId": "62801e39-84b0-4586-a316-6c56a5e55718",
    "domain": "https://dev.disruptorsmedia.com",
    "autoTrigger": true,
    "testSuite": "basic",
    "blocking": false
  },
  "production": {
    "siteId": "cheerful-custard-2e6fc5",
    "domain": "https://dm4.wjwelsh.com",
    "autoTrigger": false,
    "testSuite": "comprehensive",
    "blocking": true
  }
}
```

## Reporting Format

### Development Report Template

```markdown
# Development Deployment Report

**Site**: dev.disruptorsmedia.com
**Deployment ID**: [deploy-id]
**Timestamp**: [timestamp]
**Branch**: [branch-name]

## Critical Path Tests
- ✅ Homepage: Passed (1.2s)
- ✅ Authentication: Passed
- ✅ Core Pages: Passed
- ⚠️ Modules: Slow load time (4.2s)

## Performance Tests
- ⚠️ Lighthouse: 78 (below 85 target)
- ✅ LCP: 3.1s (acceptable for dev)
- ✅ CLS: 0.08

## Summary
Deployment successful with minor performance issues.
Safe to continue testing on dev site.

**Action Required**: Optimize module loading for production.
```

### Production Report Template

```markdown
# Production Deployment Report

**Site**: dm4.wjwelsh.com
**Deployment ID**: [deploy-id]
**Timestamp**: [timestamp]
**Approval**: [approver-name]
**Dev Test Results**: ✅ All passed

## Critical Path Tests (REQUIRED)
- ✅ Homepage: Passed (0.8s)
- ✅ Authentication: Passed
- ✅ Core Pages: All passed
- ✅ Modules: All functional
- ✅ Admin Console: Functional
- ✅ Netlify Functions: All responding

## Performance Tests
- ✅ Lighthouse: 94
- ✅ LCP: 1.8s
- ✅ FID: 45ms
- ✅ CLS: 0.05

## Functional Tests
- ✅ User signup: Working
- ✅ Login flows: Working
- ✅ AI modules: All functional
- ✅ Business Brain: Working
- ✅ Admin console: Working
- ✅ Form submissions: Working

## API Integration
- ✅ Supabase: Connected
- ✅ DataForSEO: Responding
- ✅ Anthropic: Responding
- ✅ Gemini: Responding
- ✅ Firecrawl: Responding

## Summary
✅ DEPLOYMENT SUCCESSFUL

All tests passed. Production site is healthy.
Monitoring will continue for 24 hours.

**Status**: LIVE at https://dm4.wjwelsh.com
```

## Related Documentation

- `docs/DEPLOYMENT.md` - Complete deployment guide
- `docs/workflows/DEPLOYMENT_WORKFLOW.md` - Step-by-step workflow
- `CLAUDE.md` - Quick deployment commands
- `netlify.toml` - Netlify configuration
