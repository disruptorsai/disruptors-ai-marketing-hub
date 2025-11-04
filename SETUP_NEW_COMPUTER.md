# Setup New Computer Guide

This guide helps you transfer the complete Disruptors AI development environment to a new computer.

## Prerequisites

- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **Git**: Download from [git-scm.com](https://git-scm.com/)
- **Claude Code**: Installed on the new computer

## Transfer Files

### Method 1: Git Clone (Recommended)

```bash
git clone https://github.com/YOUR_USERNAME/disruptors-ai-marketing-hub.git
cd disruptors-ai-marketing-hub
```

### Method 2: Manual Copy

Copy the entire repository folder to your new computer via:
- USB drive
- Cloud storage (Google Drive, OneDrive, Dropbox)
- Network transfer

## Setup Steps

### 1. Copy .env File

The `.env` file contains your API keys and is NOT in the repository (for security).

**From your original computer:**
- Copy `.env` file from the project root
- Transfer it to the new computer
- Place it in the project root on the new computer

### 2. Run Automated Setup

Open terminal in the project directory and run:

```bash
node scripts/setup-new-computer.js
```

This script will automatically:
- ✅ Verify Node.js version
- ✅ Check .env file exists with required keys
- ✅ Install npm dependencies
- ✅ Configure 22 MCP servers with your credentials
- ✅ Verify git configuration
- ✅ Test build process
- ✅ Print next steps

### 3. Restart Claude Code

After the setup completes:
1. Close Claude Code completely
2. Reopen Claude Code
3. MCP servers will now be loaded

### 4. Verify Setup

Check MCP servers are working:

```bash
npm run mcp:list
```

You should see 22 MCP servers listed.

## Optional: Choose MCP Profile

You can reduce the number of active MCP servers for better performance:

```bash
# Minimal (3 servers) - Fastest, basic functionality
npm run mcp:profile:minimal

# Development (7 servers) - Good balance
npm run mcp:profile:dev

# Full (22 servers) - All features
npm run mcp:profile:full
```

## Start Development

```bash
# Frontend only
npm run dev

# With Netlify functions (required for Growth Audit, Business Brain)
npm run dev:netlify
```

## Troubleshooting

### MCP Servers Not Loading

1. Check Claude Code config file location:
   - Windows: `C:\Users\YourName\.cursor\mcp.json`
   - Mac: `~/.cursor/mcp.json`
   - Linux: `~/.config/cursor/mcp.json`

2. Verify file exists and contains your servers

3. Restart Claude Code

### Missing Environment Variables

Run validation:

```bash
npm run mcp:validate
```

This shows which credentials are missing from your .env file.

### Build Errors

Clear node_modules and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Git Configuration

If git user is not configured:

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

## Manual MCP Import (Alternative)

If the automated script fails, you can manually import:

```bash
npm run mcp:import
```

Then edit the generated config file to replace credential placeholders with actual values from your .env file.

## MCP Configuration Files

The following files control MCP setup:

- `mcp-portable-config/mcp-config.json` - Server configurations
- `mcp-portable-config/mcp-profiles.json` - Predefined profiles
- `.env` - Your API credentials (NOT in repo)

## Syncing Between Computers

After initial setup, you can sync MCP changes:

```bash
# On Computer A (make changes)
npm run mcp:export
git add mcp-portable-config/
git commit -m "Update MCP config"
git push

# On Computer B (get changes)
git pull
npm run mcp:import
```

## What Gets Configured

### MCP Servers (22 total)

**Core:**
- memory, filesystem, sequential-thinking

**Version Control:**
- github

**Cloud Platforms:**
- vercel, netlify, railway, digitalocean

**Design:**
- figma-developer, cursor-talk-to-figma

**Web Scraping:**
- firecrawl, fetch, puppeteer, apify-modern

**AI Services:**
- nano-banana, replicate

**Media:**
- cloudinary

**Data:**
- airtable

**Automation:**
- n8n-mcp, gohighlevel

**SEO:**
- dataforseo

**Infrastructure:**
- MCP_DOCKER

### Environment Variables

From your .env file:
- Supabase credentials
- AI API keys (OpenAI, Anthropic, Gemini)
- MCP server credentials (GitHub, Netlify, etc.)
- Third-party service keys

### NPM Dependencies

All packages from package.json:
- React, Vite, React Router
- Tailwind CSS, Radix UI
- GSAP, Framer Motion, Spline
- Supabase client
- AI SDKs (Anthropic, OpenAI, Google)
- And more...

## Deployment Configuration

The setup includes two-tier deployment:

**Dev (Automatic):**
- Every `git push` deploys to dev.disruptorsmedia.com
- Site ID: 62801e39-84b0-4586-a316-6c56a5e55718

**Production (Manual):**
- Run `npm run deploy:prod` after testing on dev
- Site: dm4.wjwelsh.com
- Site ID: cheerful-custard-2e6fc5

## Next Steps

1. ✅ Complete this setup guide
2. ✅ Restart Claude Code
3. ✅ Verify MCP servers: `npm run mcp:list`
4. ✅ Start dev server: `npm run dev:netlify`
5. ✅ Read CLAUDE.md for development guidelines
6. ✅ Review docs/ for system documentation

## Support

If you encounter issues:

1. Check CLAUDE.md for development commands
2. Review docs/TECHNOLOGY_STACK.md
3. Verify .env has all required keys
4. Check Node.js version (must be 18+)
5. Ensure Claude Code is latest version

## Files to Transfer

Required files to transfer from original computer:
- ✅ Entire repository (via git clone or manual copy)
- ✅ `.env` file (manual copy - NOT in repo)

Optional (will be regenerated):
- node_modules (will be installed by setup script)
- build/dist folders (will be created when you build)
