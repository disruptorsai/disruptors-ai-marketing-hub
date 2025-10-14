# Base44 Automated Database Provisioning - Setup Guide

**Last Updated:** October 13, 2025
**Version:** 1.0.0

This guide explains how to set up automatic database provisioning for Base44 app migrations using Neon, Supabase, or Docker.

---

## Overview

The Base44 Migration Specialist agent now **automatically provisions databases** for each migrated app. This means:

- ✅ **No manual database setup** required
- ✅ **10x faster migrations** (from hours to minutes)
- ✅ **Zero configuration** for users
- ✅ **Automatic fallback** if primary provider unavailable

---

## How It Works

When you start a Base44 migration, the agent automatically:

1. **Analyzes the app** (entities, integrations, features)
2. **Provisions a database automatically** using:
   - **Neon** (primary - serverless PostgreSQL)
   - **Supabase** (fallback - full backend platform)
   - **Docker** (local development fallback)
3. **Generates `.env` file** with connection credentials
4. **Asks only essential questions** (authentication, AI, deployment)
5. **Migrates the app** with database ready to use

**Result:** Database is provisioned in 10-30 seconds automatically!

---

## Setup Instructions

### Option 1: Neon (Recommended)

**Why Neon:**
- ✅ Instant provisioning (10 seconds)
- ✅ Serverless (scales to zero - free when not in use)
- ✅ Generous free tier (10 projects, 3GB each)
- ✅ No credit card required
- ✅ Perfect for Base44 migrations

**Setup Steps:**

1. **Create Neon Account**
   - Go to: https://console.neon.tech/signup
   - Sign up with GitHub or email
   - No credit card required

2. **Generate API Key**
   - Visit: https://console.neon.tech/app/settings/api-keys
   - Click "Create new API key"
   - Name it: `Base44 Migration Agent`
   - Copy the key (starts with `neon_api_...`)

3. **Add to Environment**
   ```bash
   # Add to your .env file
   NEON_API_KEY=neon_api_xxxxxxxxxxxxxxxxxxxxx
   ```

4. **Test It**
   ```bash
   node scripts/auto-provision-database.js test-app
   ```

   You should see:
   ```
   🚀 Creating Neon database for "test-app"...
   ✅ Neon database created!
      Project ID: ep-cool-darkness-123456
      Region: aws-us-east-1
      Postgres: 16
   ✅ SUCCESS: Neon database provisioned!
   ```

**That's it!** Your agent can now create unlimited databases automatically.

---

### Option 2: Supabase (Fallback)

**Why Supabase:**
- ✅ Includes database + auth + storage + real-time
- ✅ Unlimited free projects (pause after 7 days inactivity)
- ✅ Same stack as your current Disruptors app
- ⚠️ Takes 2-3 minutes to provision (vs 10 seconds for Neon)

**Setup Steps:**

1. **Get Personal Access Token**
   - Go to: https://supabase.com/dashboard/account/tokens
   - Click "Generate new token"
   - Name it: `Base44 Migration Agent`
   - Select scopes: `all` (or at minimum: `projects.create`, `projects.read`)
   - Copy the token (starts with `sbp_...`)

2. **Get Organization ID** (Optional - auto-detects if not provided)
   - Go to: https://supabase.com/dashboard
   - Click on your organization name
   - Copy the org ID from URL: `https://supabase.com/dashboard/org/[ORG_ID]`

3. **Add to Environment**
   ```bash
   # Add to your .env file
   SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxxx
   SUPABASE_ORG_ID=your-org-id-here  # Optional
   ```

4. **Test It**
   ```bash
   node scripts/auto-provision-database.js test-app --provider=supabase
   ```

**Rate Limits:** 60 requests per minute (plenty for migrations)

---

### Option 3: Docker (Local Development)

**Why Docker:**
- ✅ Completely free
- ✅ No API keys needed
- ✅ Perfect for local development and testing
- ✅ Works offline
- ⚠️ Requires Docker Desktop installed

**Setup Steps:**

1. **Install Docker Desktop**
   - Download: https://www.docker.com/products/docker-desktop/
   - Install and start Docker Desktop
   - Verify: `docker --version`

2. **No Configuration Needed**
   - Docker provisioning works automatically
   - No API keys required
   - Creates local PostgreSQL containers

3. **Test It**
   ```bash
   node scripts/auto-provision-database.js test-app --provider=docker
   ```

   Creates:
   - Docker container: `test-app-postgres`
   - Database on port: `5432` (or next available)
   - Persistent storage: `./docker/test-app-data/`

4. **Manage Containers**
   ```bash
   # List running containers
   docker ps

   # Stop a database
   docker stop test-app-postgres

   # Start again
   docker start test-app-postgres

   # Remove database
   docker rm -f test-app-postgres
   docker volume rm test-app-data
   ```

---

## Priority Order

The agent tries providers in this order:

1. **Neon** (if `NEON_API_KEY` present)
   - Best option: instant, serverless, generous free tier

2. **Supabase** (if `SUPABASE_ACCESS_TOKEN` present)
   - Good option: includes auth/storage, same stack

3. **Docker** (if Docker running)
   - Fallback: local development, always works

**Pro Tip:** Set up both Neon and Docker for maximum flexibility:
- Neon for production/staging deployments
- Docker for local development and testing

---

## Comparison Table

| Feature | Neon | Supabase | Docker |
|---------|------|----------|--------|
| **Setup Time** | 10 seconds | 2-3 minutes | 30 seconds |
| **Free Tier** | 10 projects | Unlimited | Free (DIY) |
| **API Required** | Yes | Yes | No |
| **Internet Required** | Yes | Yes | No |
| **Scales to Zero** | ✅ Yes | ⚠️ Pauses after 7 days | ❌ No |
| **Includes Auth** | ❌ No | ✅ Yes | ❌ No |
| **Best For** | Production | Full-stack apps | Local dev |
| **Cost** | $0-19/mo | $0-25/mo | Free |

---

## Usage Examples

### Example 1: Automatic Provisioning (Neon)

```bash
# Agent automatically uses Neon (if API key present)
node scripts/auto-provision-database.js crm-app

# Output:
# 🚀 Creating Neon database for "crm-app"...
# ✅ Neon database created!
# 📝 Environment file created: .env.crm-app
# ✅ SUCCESS: Neon database provisioned!
```

### Example 2: Force Specific Provider

```bash
# Force Docker for local development
node scripts/auto-provision-database.js local-dev --provider=docker

# Force Supabase (even if Neon available)
node scripts/auto-provision-database.js staging-app --provider=supabase
```

### Example 3: Custom Region

```bash
# Deploy to EU region
node scripts/auto-provision-database.js eu-app --region=aws-eu-west-1
```

### Example 4: From Migration Agent

When you use the Base44 Migration Specialist agent:

```
User: "Migrate the app in temp/crm-export/"

Agent:
📂 Verified: temp/crm-export/ accessible
📊 Initial scan: 145 files detected

Phase 1: Deep Analysis (In Progress)
[analyzing...]

✅ Phase 1 Complete!

Phase 1.5: Automated Database Provisioning
🚀 Creating Neon database for "crm-app"...
✅ Neon database created in 12 seconds!

Database details saved to .env.crm-app
- Provider: Neon
- Host: ep-cool-darkness-123456.us-east-1.aws.neon.tech
- Database: crm-app
- Connection string: postgresql://...

Now I just need to ask you about:
1. Authentication
2. AI provider
3. File storage
4. Email service
5. Deployment
6. Integration
7. Business Brain
8. Migration approach
9. Timeline

[Agent continues with 9 questions instead of 10]
```

---

## Generated Files

After provisioning, the agent creates:

### `.env.[app-name]`
```bash
# Database Configuration for crm-app
# Generated: 2025-10-13T10:30:00.000Z
# Provider: NEON

# Database Connection
DATABASE_URL="postgresql://user:pass@host/dbname"
DB_HOST="ep-cool-darkness-123456.us-east-1.aws.neon.tech"
DB_PORT="5432"
DB_NAME="crm-app"
DB_USER="neondb_owner"
DB_PASSWORD="xxxxx"
DB_SSL_MODE="require"

# Neon Specific
NEON_PROJECT_ID="ep-cool-darkness-123456"
NEON_BRANCH="main"

# Dashboard URL
DASHBOARD_URL="https://console.neon.tech/app/projects/ep-cool-darkness-123456"

# Created at: 2025-10-13T10:30:00.000Z
```

**Use in your app:**
```javascript
import { config } from 'dotenv';
config({ path: '.env.crm-app' });

// Connection string ready to use
const connectionString = process.env.DATABASE_URL;
```

---

## Troubleshooting

### Problem: "NEON_API_KEY not found"

**Solution:**
1. Check `.env` file has the key
2. Restart your terminal/IDE to load new env variables
3. Or export temporarily: `export NEON_API_KEY=your-key`

### Problem: "Neon API error (429): Rate limit exceeded"

**Solution:**
- Neon allows 700 requests/minute
- Wait 1 minute and try again
- Or use Docker fallback: `--provider=docker`

### Problem: "Docker is not running"

**Solution:**
1. Open Docker Desktop
2. Wait for Docker to start (green indicator)
3. Verify: `docker info`
4. Try again

### Problem: "Supabase project not ready within 5 minutes"

**Solution:**
- Supabase can take 2-5 minutes to provision
- Check Supabase dashboard for project status
- If stuck, manually unpause the project
- Or use Neon instead (much faster)

### Problem: Port 5432 already in use (Docker)

**Solution:**
```bash
# Find what's using port 5432
netstat -ano | findstr :5432  # Windows
lsof -i :5432                  # Mac/Linux

# Stop existing PostgreSQL
# Then try again - Docker will use next available port
```

---

## Advanced Configuration

### Multiple Apps

Create databases for multiple apps:
```bash
node scripts/auto-provision-database.js app1
node scripts/auto-provision-database.js app2
node scripts/auto-provision-database.js app3
```

Each gets its own:
- Neon project (or Docker container)
- `.env.[app-name]` file
- Isolated database

### Cleanup

Remove provisioned databases:

**Neon:**
```bash
# Via dashboard: https://console.neon.tech
# Delete project manually
```

**Supabase:**
```bash
# Via dashboard: https://supabase.com/dashboard
# Settings > General > Delete project
```

**Docker:**
```bash
docker rm -f app-name-postgres
docker volume rm app-name-data
```

---

## API Key Security

**IMPORTANT:** Keep your API keys secure!

### Best Practices:

1. **Never commit `.env` files**
   ```bash
   # Add to .gitignore
   .env
   .env.*
   ```

2. **Use different keys for different environments**
   - Development: Limited scope key
   - Production: Separate key with stricter limits

3. **Rotate keys periodically**
   - Neon: Generate new key every 90 days
   - Supabase: Regenerate tokens quarterly

4. **Revoke compromised keys immediately**
   - Neon: https://console.neon.tech/app/settings/api-keys
   - Supabase: https://supabase.com/dashboard/account/tokens

---

## FAQ

### Q: Can I use Neon and Supabase together?

**A:** Yes! The agent tries Neon first, then falls back to Supabase if Neon fails. You can have both API keys configured.

### Q: What's the cost after free tier?

**Neon:** $19/month for extra projects beyond 10 free
**Supabase:** $25/month for Pro plan with better limits
**Docker:** Always free (you manage infrastructure)

### Q: Can I migrate existing databases?

**A:** Yes! The provisioning script only creates NEW databases. To migrate existing data:
1. Create new database with script
2. Use `pg_dump` and `pg_restore` to copy data
3. Update your app's connection string

### Q: How many databases can I create?

**Neon Free:** 10 projects
**Supabase Free:** Unlimited (pause after 7 days)
**Docker:** Unlimited (limited by your disk space)

### Q: What if all providers fail?

**A:** The agent falls back to asking you to manually set up a database and provides instructions. This rarely happens if you have at least Docker running.

---

## Next Steps

1. **Set up Neon API key** (5 minutes)
2. **Test provisioning** with a dummy app
3. **Start migrating** Base44 apps automatically!

The Base44 Migration Specialist agent will handle everything else automatically.

---

## Support

- **Neon Docs:** https://neon.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Docker Docs:** https://docs.docker.com

---

**Status:** ✅ Production Ready
**Automated:** ✅ Yes
**Manual Setup Required:** ❌ No (after initial API key setup)
