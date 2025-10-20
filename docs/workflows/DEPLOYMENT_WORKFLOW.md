# Deployment Workflow

## Overview

This guide provides step-by-step instructions for deploying updates to the Disruptors AI Marketing Hub using our **two-tier deployment system**.

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Deployment Flow                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Git Push (Any Branch)                                      │
│         ↓                                                   │
│  [AUTO] Dev Deployment                                      │
│         ↓                                                   │
│  https://dev.disruptorsmedia.com                           │
│         ↓                                                   │
│  Validation & Testing                                       │
│         ↓                                                   │
│  Approval Process                                           │
│         ↓                                                   │
│  [MANUAL] Production Deployment                             │
│         ↓                                                   │
│  https://dm4.wjwelsh.com                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Development Deployment (Automatic)

### 1. Code Changes

Make your code changes in your local development environment:

```bash
# Make code changes
# Edit files as needed

# Verify locally
npm run dev

# Run linting
npm run lint

# Test build
npm run build
```

### 2. Commit Changes

Commit your changes with a descriptive message:

```bash
# Stage changes
git add .

# Commit with message
git commit -m "feat: Add new feature description"

# Alternative: Use auto-commit
npm run auto-commit
```

### 3. Push to GitHub

Push your changes to trigger automatic dev deployment:

```bash
# Push to current branch
git push origin <branch-name>

# Or use helper script
npm run push
```

**What Happens Next**:
- Netlify detects the push via webhook
- Builds the project on dev site (`62801e39-84b0-4586-a316-6c56a5e55718`)
- Deploys to https://dev.disruptorsmedia.com
- Deployment-validator agent runs automatically
- Results logged to console and report generated

### 4. Monitor Dev Deployment

Check the deployment status:

```bash
# View deployment status
npm run deploy:status:dev

# List recent dev deployments
npm run deploy:list:dev

# Watch deployment in real-time
npm run deploy:watch
```

### 5. Validate on Dev Site

Once deployed, test on the dev site:

```bash
# Run validation manually
npm run deploy:validate:dev
```

**Manual Testing Checklist**:
- [ ] Visit https://dev.disruptorsmedia.com
- [ ] Test new features/changes
- [ ] Check for console errors
- [ ] Verify navigation works
- [ ] Test authentication (if applicable)
- [ ] Test AI modules (if applicable)
- [ ] Check mobile responsiveness
- [ ] Verify Netlify functions work

### 6. Review Test Results

The deployment-validator agent creates a report:

```bash
# View the report
cat temp/dev-deployment-report.md
```

## Production Deployment (Manual)

### Prerequisites

Before deploying to production, ensure:

- [ ] All testing on dev site is complete
- [ ] All dev deployment tests passed
- [ ] Stakeholder approval received
- [ ] No console errors on dev site
- [ ] Performance is acceptable
- [ ] Database migrations applied (if any)
- [ ] Environment variables verified

### 1. Pre-Production Verification

Run final checks before production deployment:

```bash
# Lint check
npm run lint

# Build verification
npm run build

# Check deployment status
npm run deploy:status

# Verify environment variables
npm run deploy:sync-env
```

### 2. Database Migrations (If Needed)

Apply any database changes before code deployment:

```bash
# Check migration status
npm run db:migrations

# Apply migrations
npm run deploy:supabase

# Verify migrations
npm run db:health
```

### 3. Deploy to Production

Trigger manual production deployment:

```bash
# Deploy to production
npm run deploy:prod
```

**What Happens**:
- Script builds the project
- Deploys to Netlify production site (`cheerful-custard-2e6fc5`)
- Deployment-validator agent runs comprehensive tests
- Full validation suite executes
- Report generated with results

### 4. Monitor Production Deployment

Watch the deployment progress:

```bash
# Monitor deployment
npm run deploy:watch

# Check production status
npm run deploy:status:prod

# List production deployments
npm run deploy:list:prod
```

### 5. Validate Production Deployment

Run comprehensive production validation:

```bash
# Validate production deployment
npm run deploy:validate:prod
```

### 6. Post-Production Verification

After deployment completes, perform manual verification:

**Critical Path Testing**:
- [ ] Visit https://dm4.wjwelsh.com
- [ ] Homepage loads without errors
- [ ] Navigation works correctly
- [ ] Authentication flows work
- [ ] AI modules are functional
- [ ] Forms submit successfully
- [ ] Admin console accessible
- [ ] No console errors

**Performance Testing**:
- [ ] Page load times acceptable
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing
- [ ] Mobile performance good

**API Integration Testing**:
- [ ] Supabase connections work
- [ ] Netlify functions respond
- [ ] External APIs functional
- [ ] No API errors in logs

### 7. Monitor Production Health

Continue monitoring after deployment:

```bash
# Monitor for 1 hour
npm run deploy:watch

# Check function logs
npx netlify functions:list
npx netlify logs:function <function-name>

# Monitor errors
npm run telemetry:status
```

## Rollback Procedures

### Rolling Back Dev Deployment

If dev deployment has issues:

```bash
# List recent dev deployments
npm run deploy:list:dev

# Rollback to specific deployment
npm run deploy:rollback:dev <deployment-id>
```

### Rolling Back Production Deployment

If production deployment fails or has critical issues:

```bash
# IMMEDIATE ROLLBACK
npm run deploy:rollback:prod <previous-deployment-id>

# Alternative: Via Netlify CLI
npx netlify api restoreSiteDeploy \
  --data='{"site_id": "cheerful-custard-2e6fc5", "deploy_id": "<deploy-id>"}'
```

**Rollback Checklist**:
1. Identify the issue
2. Get last known good deployment ID
3. Execute rollback command
4. Verify rollback succeeded
5. Test critical paths
6. Notify team
7. Investigate root cause

## Emergency Procedures

### Critical Production Failure

If production site is down or broken:

1. **Immediate Response**:
   ```bash
   # Quick rollback to last known good
   npm run deploy:rollback:prod
   ```

2. **Verify Rollback**:
   - Visit https://dm4.wjwelsh.com
   - Test critical paths
   - Check error logs

3. **Team Notification**:
   - Email team
   - Post in Slack #deployments
   - Document incident

4. **Root Cause Analysis**:
   - Review deployment logs
   - Check error reports
   - Identify what went wrong

5. **Fix and Redeploy**:
   - Fix the issue locally
   - Test on dev site thoroughly
   - Redeploy to production when ready

### Dev Site Issues

If dev site has issues (non-critical):

1. **Continue Development**:
   - Dev issues don't block production
   - Fix in next commit
   - Push fix to trigger new dev deployment

2. **Manual Fix**:
   ```bash
   # Make fixes
   git add .
   git commit -m "fix: Resolve dev site issue"
   git push origin <branch>
   ```

## Deployment Schedule

### Development Deployments
- **Frequency**: As often as needed
- **Timing**: Anytime during work hours
- **Approval**: Not required
- **Validation**: Automatic

### Production Deployments
- **Frequency**: After thorough testing on dev
- **Timing**: During business hours (preferred)
- **Approval**: Required from stakeholder
- **Validation**: Comprehensive

**Recommended Schedule**:
- **Major updates**: Deploy to dev daily, to prod weekly
- **Minor updates**: Deploy to dev multiple times daily, to prod as needed
- **Hotfixes**: Deploy to dev immediately, to prod after quick testing
- **Emergency fixes**: Fast-track through dev, deploy to prod ASAP

## Best Practices

### Development Deployment

1. **Commit Often**: Small, frequent commits are easier to test and debug
2. **Test Locally First**: Always run `npm run dev` and `npm run build` locally
3. **Descriptive Commits**: Use clear commit messages
4. **Monitor Results**: Check dev site after each deployment
5. **Fix Fast**: If dev breaks, fix and redeploy quickly

### Production Deployment

1. **Test Thoroughly**: Comprehensive testing on dev site first
2. **Get Approval**: Always get stakeholder approval
3. **Deploy During Business Hours**: Easier to monitor and respond to issues
4. **Backup Plan**: Always know your rollback deployment ID
5. **Monitor Closely**: Watch production for 1 hour after deployment
6. **Document Changes**: Update changelog and documentation

### General Guidelines

1. **Database First**: Apply database migrations before code deployment
2. **Environment Variables**: Verify all env vars are set correctly
3. **Dependencies**: Test dependency changes thoroughly
4. **Breaking Changes**: Plan and communicate breaking changes
5. **Performance**: Monitor performance impact of changes
6. **Security**: Verify security implications of changes

## Troubleshooting

### Build Failures

**Dev Build Fails**:
```bash
# Check build logs
npm run deploy:status:dev

# Test locally
npm run build

# Fix issues and push again
git add .
git commit -m "fix: Build error"
git push
```

**Production Build Fails**:
```bash
# Check logs
npm run deploy:status:prod

# If critical, rollback immediately
npm run deploy:rollback:prod

# Fix and redeploy when ready
```

### Validation Failures

**Dev Validation Fails**:
- Review validation report
- Fix issues locally
- Push fix to dev
- Non-blocking, continue development

**Production Validation Fails**:
- CRITICAL - immediate attention required
- Rollback if necessary
- Review comprehensive failure report
- Fix issues on dev first
- Redeploy after thorough testing

### Environment Variable Issues

```bash
# Sync environment variables from local to Netlify
npm run deploy:sync-env

# Verify variables are set
npm run deploy:status
```

### Function Errors

```bash
# Check function logs
npx netlify functions:list
npx netlify logs:function <function-name>

# Test function locally
npm run dev:functions
```

## Monitoring and Alerts

### Deployment Monitoring

**Development**:
- Console logs
- Deployment reports in `temp/`
- No external alerts

**Production**:
- Email notifications
- Slack alerts (#deployments)
- Dashboard updates
- Comprehensive reports
- 24-hour monitoring

### Health Checks

```bash
# Check telemetry and system health
npm run telemetry:status

# Monitor database health
npm run db:health

# Check deployment status
npm run deploy:status
```

## Quick Reference

### Development Deployment

```bash
# 1. Make changes and commit
git add .
git commit -m "feat: Description"

# 2. Push to trigger auto-deploy
git push origin <branch>

# 3. Check status
npm run deploy:status:dev

# 4. Validate
npm run deploy:validate:dev
```

### Production Deployment

```bash
# 1. Verify prerequisites
npm run lint && npm run build

# 2. Deploy to production
npm run deploy:prod

# 3. Monitor
npm run deploy:watch

# 4. Validate
npm run deploy:validate:prod
```

### Emergency Rollback

```bash
# Dev rollback
npm run deploy:rollback:dev <id>

# Production rollback
npm run deploy:rollback:prod <id>
```

## Related Documentation

- `docs/DEPLOYMENT.md` - Complete deployment configuration
- `docs/agents/DEPLOYMENT_VALIDATOR_RULES.md` - Agent validation rules
- `CLAUDE.md` - Quick command reference
- `netlify.toml` - Netlify configuration
- `docs/BUILD_OPTIMIZATION.md` - Build optimization guide
