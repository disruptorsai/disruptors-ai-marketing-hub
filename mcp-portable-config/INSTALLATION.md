# Installing Disruptors MCP Suite Plugin on New Devices

This guide shows you how to install the complete MCP server suite on any new device.

## Prerequisites

- Claude Code installed (version 2.0.0 or higher)
- Node.js 18 or higher
- Git
- Access to your `.env` file with API credentials

## Installation Methods

### Method 1: Direct GitHub Clone (Recommended)

**Step 1: Clone the Configuration Repository**

```bash
# Clone to a local directory
git clone https://github.com/TechIntegrationLabs/mcp-config.git ~/mcp-config
cd ~/mcp-config
```

**Step 2: Set Up Credentials**

```bash
# Copy your .env file from secure location
# Option A: If you have it backed up
cp /path/to/secure/backup/.env .env

# Option B: Create from template
cp .env.template .env
# Then edit .env with your API keys
```

**Step 3: Install Dependencies**

```bash
# If the repo has package.json
npm install
```

**Step 4: Apply Configuration to Claude Code**

```bash
# Import MCP configuration to Claude Code
npm run mcp:import
```

**Step 5: Restart Claude Code**

```
1. Close ALL Claude Code windows
2. Completely quit Claude Code (Cmd+Q on Mac, Alt+F4 on Windows)
3. Reopen Claude Code
4. MCP servers will initialize on startup
```

**Step 6: Verify Installation**

In Claude Code, type:
```
/mcp list
```

You should see all 22 servers listed as enabled.

---

### Method 2: Using Claude Code Plugin System (Alternative)

**Step 1: Add Plugin Marketplace**

In Claude Code chat, type:
```
/plugin marketplace add TechIntegrationLabs/mcp-config
```

**Step 2: Install Plugin**

```
/plugin install disruptors-mcp-suite
```

**Step 3: Set Up Credentials**

Navigate to the plugin installation directory and add your `.env` file:

```bash
# Find plugin directory (usually in ~/.claude-plugins/)
cd ~/.claude-plugins/disruptors-mcp-suite

# Copy your .env file
cp /path/to/secure/backup/.env .env
```

**Step 4: Restart Claude Code**

Complete restart required for MCP initialization.

**Step 5: Verify**

```
/plugin list
/mcp list
```

---

## Profile Selection

Choose a profile based on your needs:

### Minimal Profile (3 servers)
Fastest startup, essential functionality only.
```bash
npm run mcp:profile:minimal
```

**Servers:** memory, filesystem, sequential-thinking

### Dev Profile (7 servers)
Balanced for full-stack development.
```bash
npm run mcp:profile:dev
```

**Servers:** memory, filesystem, github, netlify, supabase, cloudinary, sequential-thinking

### Full Profile (22 servers)
All integrations enabled.
```bash
npm run mcp:profile:full
```

**All servers included**

---

## Environment Variables

Your `.env` file should contain these credentials:

### Required for Core Functionality
```bash
# GitHub integration
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxx

# Netlify deployment
NETLIFY_AUTH_TOKEN=xxx

# Vercel deployment
VERCEL_TOKEN=xxx
```

### Optional Services
```bash
# AI services
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
GEMINI_API_KEY=xxx
REPLICATE_API_TOKEN=xxx

# Cloud platforms
DIGITALOCEAN_TOKEN=xxx
RAILWAY_TOKEN=xxx

# Design & automation
FIGMA_ACCESS_TOKEN=xxx
N8N_API_KEY=xxx
GHL_API_KEY=xxx

# Content & media
FIRECRAWL_API_KEY=xxx
DATAFORSEO_USERNAME=xxx
DATAFORSEO_PASSWORD=xxx
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Automation
AIRTABLE_API_KEY=xxx
APIFY_API_TOKEN=xxx
```

See [credentials.md](./credentials.md) for where to get each API key.

---

## Syncing Changes Across Devices

### On Device A (Making Changes)

```bash
# After enabling/disabling servers or changing config
npm run mcp:export
npm run mcp:push
```

### On Device B (Receiving Changes)

```bash
# Pull latest configuration
npm run mcp:pull

# Apply to Claude Code
npm run mcp:import

# Restart Claude Code
```

### Two-Way Sync

```bash
# Bidirectional sync (push and pull)
npm run mcp:sync
```

---

## Troubleshooting

### MCP Servers Not Showing Up

**Check Claude Code configuration:**
```bash
cat ~/.cursor/mcp.json
```

**Re-import if needed:**
```bash
npm run mcp:import
# Then restart Claude Code completely
```

### Missing Credentials Error

**Validate your .env file:**
```bash
npm run mcp:validate
```

This checks which credentials are missing.

### Configuration Not Syncing

**Check git status:**
```bash
git status
git remote -v
```

**Force re-sync:**
```bash
git pull origin main --rebase
npm run mcp:import
```

### Servers Failing to Initialize

**Check logs:**
- Look for errors in Claude Code output
- Verify API keys are correct
- Test individual server credentials

**Disable problematic servers:**
```bash
npm run mcp:disable -- server-name
```

---

## Team Sharing

### Sharing Configuration (Without Secrets)

1. Team member clones repo
2. Each person creates their own `.env` file
3. `.env` is never committed (in `.gitignore`)
4. Only `.env.template` is shared

### Creating a Private Copy

```bash
# Fork the repo to your own GitHub account
# Then update git remote
git remote set-url origin https://github.com/YOUR_USERNAME/mcp-config.git
```

---

## Updating the Plugin

### Pull Latest Changes

```bash
cd ~/mcp-config
git pull origin main
npm run mcp:import
# Restart Claude Code
```

### Check for Updates

```bash
npm run mcp:status
```

---

## Uninstalling

### Remove from Claude Code

```bash
# Disable all servers
npm run mcp:profile:minimal

# Or remove MCP configuration entirely
rm ~/.cursor/mcp.json
```

### Remove Plugin Files

```bash
rm -rf ~/mcp-config
```

---

## Security Best Practices

- ✅ Keep `.env` file secure (never commit)
- ✅ Use environment-specific credentials
- ✅ Rotate API keys every 90 days
- ✅ Use read-only tokens where possible
- ✅ Keep mcp-config repo private
- ✅ Enable 2FA on GitHub account
- ✅ Store `.env` in password manager

---

## Support

- **Documentation:** [README.md](./README.md)
- **Quick Start:** [QUICK_START.md](./QUICK_START.md)
- **GitHub Setup:** [GITHUB_SETUP.md](./GITHUB_SETUP.md)
- **Credentials:** [credentials.md](./credentials.md)
- **Issues:** https://github.com/TechIntegrationLabs/mcp-config/issues

---

## Command Reference

| Command | Description |
|---------|-------------|
| `npm run mcp:list` | Show all servers and status |
| `npm run mcp:status` | Show current configuration |
| `npm run mcp:export` | Export config to portable format |
| `npm run mcp:import` | Apply config to Claude Code |
| `npm run mcp:push` | Push to GitHub |
| `npm run mcp:pull` | Pull from GitHub |
| `npm run mcp:sync` | Bidirectional sync |
| `npm run mcp:validate` | Check credentials |
| `npm run mcp:profile:minimal` | Switch to minimal (3 servers) |
| `npm run mcp:profile:dev` | Switch to dev (7 servers) |
| `npm run mcp:profile:full` | Switch to full (22 servers) |
| `npm run mcp:enable -- <server>` | Enable specific server |
| `npm run mcp:disable -- <server>` | Disable specific server |

---

## Next Steps

After installation:

1. ✅ Verify all servers with `/mcp list`
2. ✅ Test a server (e.g., try GitHub integration)
3. ✅ Choose appropriate profile for your workflow
4. ✅ Set up automatic sync (optional)
5. ✅ Bookmark this repo for easy access

Enjoy your synchronized MCP development environment across all devices!
