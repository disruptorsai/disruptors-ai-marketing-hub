# DEPLOYMENT POLICY

**CRITICAL: Read this first before any deployment operations**

## Domain Structure

This project has **TWO COMPLETELY SEPARATE** deployment environments:

### 1. Development Site (Claude Code Target)
- **Domain**: https://dev.disruptorsmedia.com
- **Netlify Site ID**: `62801e39-84b0-4586-a316-6c56a5e55718`
- **Purpose**: Testing, preview, validation, approval
- **Deployment**: Automatic on every `git push`
- **Claude Code Role**: ALL deployments go here

### 2. Production Site (User Managed - FORBIDDEN)
- **Domain**: https://disruptorsmedia.com
- **Management**: Separate Netlify project managed by user
- **Purpose**: Live production site serving actual users
- **Deployment**: User manually updates after dev approval
- **Claude Code Role**: NEVER TOUCH - User manages manually

## Deployment Rules for Claude Code

### ✅ ALLOWED Operations

1. **Deploy to dev site** (`npm run deploy:dev`)
2. **Check dev status** (`npm run deploy:status`)
3. **List dev deploys** (`npm run deploy:list`)
4. **Rollback dev** (`npm run deploy:rollback`)
5. **Watch dev deployments** (`npm run deploy:watch`)
6. **Validate dev** (`npm run deploy:validate`)
7. **Sync environment variables** to dev site (`npm run deploy:sync-env`)

### ❌ FORBIDDEN Operations

1. **NEVER deploy to production** - No production deployment commands exist
2. **NEVER reference old dm4.wjwelsh.com domain** - Domain no longer exists
3. **NEVER reference cheerful-custard-2e6fc5 site ID** - Old production project
4. **NEVER suggest production deployments** - User manages production manually
5. **NEVER push changes to production** - Production is separate project

## Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                  CORRECT DEPLOYMENT WORKFLOW                     │
└─────────────────────────────────────────────────────────────────┘

1. Code Changes
   └─► Claude Code makes changes
   └─► Commits to git

2. Deploy to Dev (Automatic)
   └─► git push triggers auto-deploy
   └─► Deploys to dev.disruptorsmedia.com
   └─► Deployment validator runs tests

3. Testing on Dev
   └─► User tests at dev.disruptorsmedia.com
   └─► Verifies all features work
   └─► Approves changes

4. Production Update (User Managed)
   └─► User manually updates disruptorsmedia.com
   └─► Through separate Netlify project
   └─► Claude Code is NOT involved
```

## Common Mistakes to Avoid

### ❌ Wrong: Trying to deploy to production
```bash
# THESE COMMANDS DO NOT EXIST AND SHOULD NEVER BE CREATED
npm run deploy:prod          # REMOVED
npm run deploy:status:prod   # REMOVED
npm run deploy:list:prod     # REMOVED
npm run deploy:rollback:prod # REMOVED
```

### ✅ Correct: Deploy to dev only
```bash
# Deploy to dev
git push origin <branch>

# Or manually trigger dev deploy
npm run deploy:dev

# Check dev status
npm run deploy:status

# List dev deployments
npm run deploy:list
```

## Available Commands

All deployment commands target **dev site only**:

- `npm run deploy:dev` - Deploy to dev.disruptorsmedia.com
- `npm run deploy:status` - Check dev deployment status
- `npm run deploy:list` - List recent dev deployments
- `npm run deploy:rollback <id>` - Rollback dev deployment
- `npm run deploy:watch` - Watch dev deployment in real-time
- `npm run deploy:validate` - Validate dev deployment
- `npm run deploy:sync-env` - Sync environment variables to dev
- `npm run deploy:supabase` - Deploy database migrations

## Environment Isolation

### Dev Environment
- Site ID: `62801e39-84b0-4586-a316-6c56a5e55718`
- Domain: dev.disruptorsmedia.com
- Netlify Dashboard: https://app.netlify.com/sites/62801e39-84b0-4586-a316-6c56a5e55718
- Environment variables managed through Claude Code
- Automatic deployments enabled
- Connected to GitHub repository

### Production Environment
- Domain: disruptorsmedia.com
- **Separate Netlify project** (different site ID)
- **User manages manually**
- **Claude Code has NO access**
- **Independent from dev site**

## Domain Migration History

### Old (Deprecated)
- ❌ dm4.wjwelsh.com - REMOVED
- ❌ Site ID: cheerful-custard-2e6fc5 - OLD PRODUCTION

### Current (Active)
- ✅ dev.disruptorsmedia.com - Dev site (Claude Code)
- ✅ disruptorsmedia.com - Production (User managed)

## Key Principles

1. **Separation of Concerns**: Dev and production are completely separate projects
2. **User Control**: User has complete control over production updates
3. **Safety First**: Claude Code cannot accidentally deploy to production
4. **Clear Boundaries**: Dev site for testing, production for live users
5. **No Direct Access**: Claude Code never has production credentials

## Emergency Rollback

### Dev Site Rollback
```bash
# List recent deployments
npm run deploy:list

# Rollback to specific deployment
npm run deploy:rollback <deployment-id>
```

### Production Site Rollback
**User manages through their own Netlify project**. Claude Code is not involved.

## Questions?

- **"Can I deploy to production?"** - No, user manages production manually
- **"What happened to dm4.wjwelsh.com?"** - Domain removed, use disruptorsmedia.com
- **"Where is production site?"** - Separate Netlify project managed by user
- **"Can I check production status?"** - No, user manages production
- **"Should I create production commands?"** - No, production is user-managed

## Summary

**Remember**:
- ✅ Deploy to **dev.disruptorsmedia.com** (always)
- ❌ Never touch **disruptorsmedia.com** (user manages)
- 🔒 Production is a **separate project** (no access)
