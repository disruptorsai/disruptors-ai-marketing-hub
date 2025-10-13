# MCP Quick Fix Guide
## Immediate Actions for Optimal Health

**Last Updated:** October 13, 2025

---

## Critical Issue: Supabase MCP Server Missing

### Problem
Supabase MCP server is defined but not active in Cursor configuration. This limits database operations to manual SDK usage.

### Impact
- MEDIUM - Missing real-time database operations via MCP
- Currently using `@supabase/supabase-js` SDK directly
- No schema introspection or migration management via MCP

### Solution

#### Step 1: Generate Supabase Access Token
1. Go to https://supabase.com/dashboard
2. Select your project: `ubqxflzuvxowigbjmqfb`
3. Navigate to Settings > API
4. Generate a new Access Token (Personal Access Token)
5. Copy the token

#### Step 2: Add Token to Environment
```bash
# Edit .env file
nano /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub/.env

# Replace this line:
SUPABASE_ACCESS_TOKEN=your_supabase_access_token_here

# With your actual token:
SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Step 3: Add Supabase Server to Cursor Config
```bash
# Edit Cursor MCP config
nano ~/.cursor/mcp.json

# Add this block to "mcpServers" section:
"supabase": {
  "command": "npx",
  "args": [
    "-y",
    "@supabase/mcp-server-supabase@latest",
    "--project-ref=ubqxflzuvxowigbjmqfb"
  ],
  "env": {
    "SUPABASE_ACCESS_TOKEN": "YOUR_TOKEN_HERE"
  }
}
```

#### Step 4: Restart Claude Code
- Close and reopen Claude Code
- Verify server is loaded: Type `/mcp` or check status

#### Step 5: Test Connection
```bash
npm run mcp:list
# Should show "supabase" in the list
```

---

## Warning: Cloudinary API Secret Missing

### Problem
Cloudinary configured but API Secret is placeholder. Read operations work, write operations fail.

### Impact
- LOW - Media read operations functional
- Upload/transformation operations unavailable
- No immediate business impact (using client SDK for uploads)

### Solution

#### Option 1: Get from Cloudinary Dashboard
1. Go to https://cloudinary.com/console
2. Navigate to Dashboard
3. Find "API Secret" (click eye icon to reveal)
4. Copy secret

#### Option 2: Get from Environment
```bash
# If you have it elsewhere, find it:
env | grep CLOUDINARY_API_SECRET
```

#### Update .env
```bash
# Replace placeholder:
CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here

# With actual secret:
CLOUDINARY_API_SECRET=CNppaSbbi3IevxjuRvg5-8CKCds
```

---

## Optimization: Profile Switching

### Current State
- Profile: Full Stack (22 servers)
- Startup time: ~10-15 seconds
- Memory usage: HIGH

### Recommended State
- Profile: Dev (7 servers)
- Startup time: ~3-5 seconds
- Memory usage: MEDIUM

### When to Use Each Profile

#### Minimal (3 servers)
**Use for:** Basic file operations, note-taking, simple tasks
```bash
npm run mcp:profile:minimal
```
**Servers:** memory, filesystem, sequential-thinking

#### Dev (7 servers) - RECOMMENDED FOR DAILY WORK
**Use for:** Development, coding, git operations, deployments
```bash
npm run mcp:profile:dev
```
**Servers:** memory, filesystem, sequential-thinking, github, netlify, vercel, digitalocean

#### Full (22 servers) - CURRENT
**Use for:** Multi-service integrations, content generation, infrastructure work
```bash
npm run mcp:profile:full
```
**Servers:** All 22 servers

### Quick Switch
```bash
# Morning routine: Switch to dev
npm run mcp:profile:dev

# Before content work: Switch to full
npm run mcp:profile:full

# End of day: Switch to minimal
npm run mcp:profile:minimal
```

---

## Configuration Sync

### Export Current Config
```bash
# Export to portable config
npm run mcp:export

# Verify export
cat mcp-portable-config/mcp-config.json
```

### Backup to GitHub
```bash
# First time setup
cd mcp-portable-config
git init
git remote add origin https://github.com/YOUR_USERNAME/mcp-config.git

# Regular backups
npm run mcp:push
```

### Sync Across Machines
```bash
# On new machine
npm run mcp:pull
npm run mcp:import

# Restart Claude Code
```

---

## Health Monitoring

### One-Time Health Check
```bash
npm run mcp:toggle
# Shows current status and profile match
```

### Continuous Monitoring (Optional)
```bash
# Start monitoring (runs in foreground)
npm run mcp:monitor

# Stop: Press Ctrl+C
```

### Validate Credentials
```bash
npm run mcp:validate
# Shows which credentials are missing/placeholder
```

---

## Emergency Recovery

### Config Broken?
```bash
# Restore from backup
cp ~/.cursor/mcp.json.backup ~/.cursor/mcp.json

# Or reset to minimal
npm run mcp:profile:minimal
```

### Servers Not Loading?
```bash
# Check what's actually running
ps aux | grep mcp

# Kill stuck processes
pkill -f "mcp"

# Restart Claude Code
```

### Lost Configuration?
```bash
# Pull from GitHub backup
npm run mcp:pull

# Import to local
npm run mcp:import
```

---

## Common Commands Reference

### Server Management
```bash
npm run mcp:list              # List all servers with status
npm run mcp:toggle            # Show current configuration
npm run mcp:enable -- <name>  # Enable specific server
npm run mcp:disable -- <name> # Disable specific server
```

### Profile Management
```bash
npm run mcp:profile:minimal   # 3 servers
npm run mcp:profile:dev       # 7 servers (recommended)
npm run mcp:profile:full      # 22 servers (current)
```

### Configuration Sync
```bash
npm run mcp:export     # Export current config
npm run mcp:import     # Import portable config
npm run mcp:push       # Backup to GitHub
npm run mcp:pull       # Restore from GitHub
npm run mcp:sync       # Two-way sync
```

### Health & Validation
```bash
npm run mcp:validate   # Check credentials
npm run mcp:health     # Full health check (slow)
npm run mcp:monitor    # Continuous monitoring
npm run mcp:optimize   # Performance optimization
```

---

## Credential Sources

### Required Credentials
| Service | Get From | Documentation |
|---------|----------|---------------|
| GitHub Token | https://github.com/settings/tokens | Generate new PAT |
| Netlify Token | https://app.netlify.com/user/applications | Create personal access token |
| Supabase Token | https://supabase.com/dashboard | Project Settings > API |
| Cloudinary Secret | https://cloudinary.com/console | Dashboard > API Keys |
| Firecrawl Key | https://firecrawl.dev/dashboard | API Keys section |

### Optional Credentials
| Service | Get From | Required For |
|---------|----------|--------------|
| ElevenLabs | https://elevenlabs.io/api | Voice generation |
| BrandFetch | https://brandfetch.com/api | Brand detection |
| PageSpeed | https://console.cloud.google.com | Performance audits |

---

## Performance Tips

### Reduce Startup Time
1. Switch to Dev profile (saves ~7 seconds)
2. Remove unused servers
3. Use minimal profile when not actively developing

### Reduce API Costs
1. Monitor quota usage: Check service dashboards
2. Use caching where possible
3. Batch operations

### Reduce Memory Usage
1. Disable unused integrations
2. Close unused terminals
3. Restart Claude Code periodically

---

## Security Checklist

- [ ] Rotate GitHub PAT every 90 days
- [ ] Use read-only tokens where possible
- [ ] Never commit `.env` file
- [ ] Keep `.cursor/mcp.json` permissions at 600
- [ ] Review active tokens monthly
- [ ] Set up rate limit alerts
- [ ] Use environment-specific credentials

---

## Getting Help

### Documentation
- Full Report: `/MCP_HEALTH_REPORT.md`
- Management Guide: `/docs/MCP_SERVER_MANAGEMENT.md`
- Quick Reference: `/docs/MCP_QUICK_REFERENCE.md`
- Ecosystem Guide: `/docs/integrations/MCP_ECOSYSTEM.md`

### Diagnostic Commands
```bash
# Show full configuration
cat ~/.cursor/mcp.json | jq .

# Count active servers
cat ~/.cursor/mcp.json | jq '.mcpServers | length'

# List server names
cat ~/.cursor/mcp.json | jq -r '.mcpServers | keys[]' | sort

# Check for disabled servers
cat ~/.cursor/mcp.json | jq '._disabled'
```

### Support Contacts
- MCP Documentation: https://modelcontextprotocol.io
- Supabase Support: https://supabase.com/support
- Netlify Support: https://netlify.com/support

---

**Quick Fix Guide Prepared By:** Claude Code Global Orchestration Manager
**For:** Disruptors AI Marketing Hub
**Date:** October 13, 2025
