# MCP Portable Configuration - Quick Start

The fastest way to get your MCP servers synced across computers.

## 5-Minute Setup

### On Your Current Machine

```bash
# 1. Export your configuration
npm run mcp:export

# 2. Create GitHub repo (do this on github.com first)
#    - Go to https://github.com/new
#    - Name: mcp-config
#    - Make it PRIVATE
#    - Don't initialize with README

# 3. Push to GitHub
cd mcp-portable-config
git init
git add .
git commit -m "Initial MCP configuration"
git remote add origin https://github.com/YOUR_USERNAME/mcp-config.git
git push -u origin main
```

### On a New Machine

```bash
# 1. Clone your config
git clone https://github.com/YOUR_USERNAME/mcp-config.git ~/mcp-config

# 2. Run installer
cd ~/mcp-config
./install.sh

# 3. Copy your .env file
#    Get from password manager or secure location
cp /secure/path/.env .env

# 4. Apply configuration
npm run mcp:import

# 5. Restart Claude Code
```

Done! Your MCP servers are now configured.

## Daily Usage

### Update After Changes
```bash
npm run mcp:export
npm run mcp:push
```

### Sync on Another Machine
```bash
npm run mcp:pull
npm run mcp:import
# Restart Claude Code
```

## What Gets Synced?

✅ **Synced to GitHub:**
- MCP server configurations
- Profile settings
- Credential templates
- Installation scripts
- Documentation

❌ **NOT Synced (stays local):**
- Actual API keys (.env file)
- Backup files
- Temporary files
- Machine-specific paths

## Commands

| Command | What It Does |
|---------|-------------|
| `npm run mcp:export` | Save current config to portable format |
| `npm run mcp:import` | Apply portable config to this machine |
| `npm run mcp:push` | Export and push to GitHub |
| `npm run mcp:pull` | Pull latest from GitHub |
| `npm run mcp:sync` | Two-way sync (pull + push) |
| `npm run mcp:validate` | Check if credentials are complete |

## Profiles

Switch between server configurations:

```bash
# Minimal (3 servers) - fastest
npm run mcp:profile:minimal

# Dev (7 servers) - balanced
npm run mcp:profile:dev

# Full (22 servers) - everything
npm run mcp:profile:full
```

## Security Checklist

- [x] Repository is set to **Private**
- [x] .env file is in .gitignore
- [x] Never commit actual API keys
- [x] Store .env in password manager
- [x] Rotate keys every 90 days
- [x] Use read-only tokens where possible

## Need Help?

- Full documentation: [README.md](./README.md)
- GitHub setup: [GITHUB_SETUP.md](./GITHUB_SETUP.md)
- Get API keys: [credentials.md](./credentials.md)
- Main project docs: [../docs/MCP_SERVER_MANAGEMENT.md](../docs/MCP_SERVER_MANAGEMENT.md)

## Troubleshooting

**Can't push to GitHub?**
```bash
# Make sure you've created the repo on GitHub first
# Then set the remote:
git remote add origin https://github.com/YOUR_USERNAME/mcp-config.git
```

**Missing credentials?**
```bash
# Check what's missing
npm run mcp:validate

# Copy template
cp .env.template .env
# Edit .env with your API keys
```

**Config not applying?**
```bash
# Verify import worked
cat ~/.cursor/mcp.json

# Restart Claude Code completely
# Close all windows and reopen
```

## Video Tutorials

Coming soon:
- Initial setup walkthrough
- Multi-machine sync
- Team sharing best practices
- Credential management

## Support

Questions? Check:
1. [README.md](./README.md) - Complete documentation
2. [GITHUB_SETUP.md](./GITHUB_SETUP.md) - Detailed GitHub guide
3. [credentials.md](./credentials.md) - Where to get API keys
4. GitHub Issues on your mcp-config repo
