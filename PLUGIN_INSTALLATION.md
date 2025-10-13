# Disruptors MCP Suite - Claude Code Plugin Installation

**Transform your manual MCP configuration into a one-command plugin install!**

## 🎯 What's New?

You now have a **proper Claude Code plugin** instead of manual MCP configuration. This means:

✅ **One-command installation**: `/plugin install disruptors-mcp-suite`
✅ **Easy toggle**: Enable/disable all servers instantly
✅ **Profile switching**: Minimal, Dev, or Full mode
✅ **Team sharing**: Everyone gets same config
✅ **Automatic updates**: Pull latest from GitHub

---

## 🚀 Quick Start (New Computer)

### Step 1: Add the Marketplace

```bash
# In Claude Code terminal or VS Code
/plugin marketplace add TechIntegrationLabs/mcp-config
```

### Step 2: Install the Plugin

```bash
/plugin install disruptors-mcp-suite
```

### Step 3: Configure Credentials

```bash
# Copy environment template
cp .env.template .env

# Edit .env with your API keys
# (Get .env from password manager or secure location)
```

### Step 4: Restart Claude Code

Completely close and reopen Claude Code for MCP servers to initialize.

---

## 🔄 Plugin Commands

### Installation & Management

```bash
# List available plugins
/plugin list

# Install plugin
/plugin install disruptors-mcp-suite

# Enable/disable plugin
/plugin enable disruptors-mcp-suite
/plugin disable disruptors-mcp-suite

# Uninstall plugin
/plugin uninstall disruptors-mcp-suite

# Update plugin
/plugin update disruptors-mcp-suite
```

### Profile Switching

```bash
# Switch to minimal mode (3 servers)
/mcp profile minimal

# Switch to dev mode (7 servers)
/mcp profile dev

# Switch to full mode (22 servers)
/mcp profile full
```

### MCP Server Management

```bash
# List all MCP servers
/mcp list

# Check server status
/mcp status

# Restart specific server
/mcp restart github

# View server logs
/mcp logs github
```

---

## 📦 What's Included

### 22 Pre-Configured MCP Servers

**Development (7):**
- `memory` - Persistent memory across sessions
- `filesystem` - File system access with configurable path
- `sequential-thinking` - Enhanced reasoning capabilities
- `github` - Repository management and PR workflows
- `netlify` - Deployment and site management
- `supabase` - Database operations and queries
- `cloudinary` - Image and video management

**AI Services (4):**
- `nano-banana` - Google Gemini AI integration
- `replicate` - AI model inference
- `firecrawl` - Web scraping and crawling
- `puppeteer` - Browser automation

**Cloud Platforms (3):**
- `vercel` - Deployment platform (remote)
- `railway` - Container hosting
- `digitalocean` - Cloud infrastructure

**Integrations (6):**
- `n8n-mcp` - Workflow automation
- `gohighlevel` - CRM and marketing automation
- `dataforseo` - Keyword research and SEO
- `figma-developer` - Design tool integration
- `cursor-talk-to-figma` - Enhanced Figma interaction
- `apify-modern` - Web scraping (remote)

**Utilities (2):**
- `fetch` - Web fetching capabilities
- `airtable` - Database integration

---

## 🎛️ Profile Modes

### Minimal Profile (3 servers)
**Best for**: Basic development, fastest performance

- memory
- filesystem
- sequential-thinking

### Dev Profile (7 servers)
**Best for**: Full-stack development, balanced performance

- All minimal servers +
- github
- netlify
- supabase
- cloudinary

### Full Profile (22 servers)
**Best for**: Maximum capabilities, comprehensive development

- All servers enabled

---

## 🔐 Environment Variables

The plugin uses environment variable expansion for security. Configure in `.env`:

### Required for Core Servers

```bash
# GitHub
GITHUB_PERSONAL_ACCESS_TOKEN=your_token

# Netlify
NETLIFY_AUTH_TOKEN=your_token

# Supabase
SUPABASE_ACCESS_TOKEN=your_token
SUPABASE_PROJECT_REF=your_project_ref

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Optional Services

```bash
# AI Services
GEMINI_API_KEY=your_key
REPLICATE_API_TOKEN=your_token

# Marketing
DATAFORSEO_USERNAME=your_email
DATAFORSEO_PASSWORD=your_password
N8N_API_KEY=your_key
GHL_API_KEY=your_key

# Design
FIGMA_API_KEY=your_key

# Cloud
DIGITALOCEAN_API_TOKEN=your_token
RAILWAY_API_TOKEN=your_token
AIRTABLE_API_KEY=your_key
```

See `.env.template` for complete list with documentation.

---

## 🔄 Updating Your Plugin

### On This Computer (After Changes)

```bash
# 1. Commit changes
git add .
git commit -m "Update MCP configuration"
git push

# 2. Update version in plugin.json
# Bump version: 1.0.0 → 1.0.1

# 3. Push to GitHub
git push
```

### On Other Computers

```bash
# Update plugin to latest version
/plugin update disruptors-mcp-suite

# Or reinstall
/plugin uninstall disruptors-mcp-suite
/plugin install disruptors-mcp-suite
```

---

## 🆚 Plugin vs Manual Configuration

### OLD Way (Manual Configuration)

```bash
# Manual export/import
npm run mcp:export
npm run mcp:import

# Edit mcp-config.json manually
# Run sync scripts
npm run mcp:sync
```

### NEW Way (Plugin System)

```bash
# One command install
/plugin install disruptors-mcp-suite

# One command toggle
/plugin enable disruptors-mcp-suite
/plugin disable disruptors-mcp-suite

# Profile switching
/mcp profile dev
```

**Benefits:**
- ✅ No manual scripts needed
- ✅ Integrated with Claude Code
- ✅ Team-wide consistency
- ✅ Automatic updates
- ✅ Easy enable/disable

---

## 🛠️ Troubleshooting

### Plugin Not Loading

```bash
# Check plugin status
/plugin list

# View Claude Code logs
# Look for plugin initialization errors

# Reinstall
/plugin uninstall disruptors-mcp-suite
/plugin install disruptors-mcp-suite
```

### MCP Servers Not Starting

```bash
# Check server status
/mcp status

# View specific server logs
/mcp logs github

# Restart server
/mcp restart github

# Check .env file exists and has credentials
ls -la .env
```

### Missing Credentials

```bash
# Copy template
cp .env.template .env

# Validate environment variables
cat .env | grep -v "^#" | grep "="

# Test specific server
/mcp restart github
/mcp logs github
```

### Profile Not Switching

```bash
# Force profile change
/mcp profile dev --force

# Restart Claude Code completely
# Close all windows and reopen
```

---

## 📚 Additional Resources

- **Plugin Repository**: https://github.com/TechIntegrationLabs/mcp-config
- **MCP Documentation**: https://docs.claude.com/en/docs/claude-code/mcp
- **Plugin System Guide**: https://www.anthropic.com/news/claude-code-plugins
- **Credential Sources**: See `.env.template` for API key URLs

---

## 🎯 Next Steps

1. **Install the plugin**: `/plugin install disruptors-mcp-suite`
2. **Configure credentials**: Copy and edit `.env` file
3. **Choose profile**: Start with `dev` profile
4. **Test servers**: Check `/mcp status`
5. **Share with team**: Send them the marketplace URL

---

## 🤝 Team Sharing

Share with your team:

```bash
# Step 1: Add marketplace
/plugin marketplace add TechIntegrationLabs/mcp-config

# Step 2: Install plugin
/plugin install disruptors-mcp-suite

# Step 3: Get .env from team password manager
# (Never commit .env to git!)

# Step 4: Restart Claude Code
```

Everyone gets the same MCP servers, profiles, and configuration!

---

## 🔒 Security Notes

**Always secure:**
- ✅ `.env` stays local (in `.gitignore`)
- ✅ Store `.env` in password manager
- ✅ Share `.env.template` (no secrets)
- ✅ Use team password manager for credentials

**Never commit:**
- ❌ `.env` file
- ❌ API keys
- ❌ Passwords
- ❌ Access tokens

---

**Ready to upgrade? Install your plugin now!**

```bash
/plugin marketplace add TechIntegrationLabs/mcp-config
/plugin install disruptors-mcp-suite
```
