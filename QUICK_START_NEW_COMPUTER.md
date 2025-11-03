# Quick Start: Transfer to New Computer

Complete development environment setup in 3 steps.

## Step 1: Transfer Files

### Option A: Git Clone (Recommended)

```bash
git clone https://github.com/YOUR_USERNAME/disruptors-ai-marketing-hub.git
cd disruptors-ai-marketing-hub
```

### Option B: Manual Copy

Copy the entire repository folder to your new computer via USB drive or cloud storage.

## Step 2: Copy .env File

**IMPORTANT**: The `.env` file is NOT in the repository (for security).

From your original computer:
1. Copy `.env` file from project root
2. Transfer it to new computer (via USB, email draft, secure cloud)
3. Place in project root on new computer

## Step 3: Run Setup Script

```bash
node scripts/setup-new-computer.js
```

This will automatically:
- ✅ Verify Node.js 18+ installed
- ✅ Check .env file has required credentials
- ✅ Install npm dependencies (1,451 packages)
- ✅ Configure 24 MCP servers with your API keys
- ✅ Verify git configuration
- ✅ Test build process

**Time:** 3-5 minutes

## Done!

Restart Claude Code and you're ready to develop.

```bash
# Start development server
npm run dev

# Or with Netlify functions
npm run dev:netlify
```

## Verify Everything Works

```bash
# Check MCP servers
npm run mcp:list

# Should show 24 servers configured
```

## Troubleshooting

### Setup Script Fails

**Missing .env file:**
- Make sure you copied `.env` from your original computer
- File must be in project root (not in a subdirectory)

**Node.js version:**
- Requires Node.js 18 or higher
- Download from: https://nodejs.org/

**Permission errors:**
- Run terminal as administrator (Windows)
- Or use `sudo` (Mac/Linux)

### MCP Servers Not Loading

1. Restart Claude Code completely (not just reload)
2. Check config file exists:
   - Windows: `C:\Users\YourName\.cursor\mcp.json`
   - Mac: `~/.cursor/mcp.json`
   - Linux: `~/.config/cursor/mcp.json`

### Different MCP Servers Than Original Computer

**This is normal!** Agents/subagents are built into Claude Code, not the repository.

What IS synced:
- ✅ 24 MCP servers (GitHub, Netlify, Supabase, etc.)
- ✅ All environment variables and API keys
- ✅ Project dependencies and configuration
- ✅ Git settings and branch state

What is NOT synced:
- ❌ Built-in Claude Code agents (these come with Claude Code itself)
- ❌ Global Claude Code settings/preferences
- ❌ Claude Code version

**Solution**: Update to the latest Claude Code version if agents differ.

## What Gets Configured

### 24 MCP Servers
- memory, filesystem, sequential-thinking (core)
- github (version control)
- vercel, netlify, railway, digitalocean (cloud)
- figma-developer (design)
- firecrawl, fetch, puppeteer, apify-modern (web)
- nano-banana, replicate (AI)
- cloudinary (media)
- airtable (data)
- n8n-mcp, gohighlevel (automation)
- dataforseo (SEO)
- MCP_DOCKER, context7, archon

### Environment Variables (42 total)
- Supabase (database)
- AI services (OpenAI, Anthropic, Gemini)
- Cloud platforms (Netlify, Vercel, DigitalOcean)
- Third-party APIs (Firecrawl, DataForSEO, etc.)

### NPM Dependencies (1,451 packages)
- React, Vite, React Router
- Tailwind CSS, Radix UI
- GSAP, Framer Motion, Spline
- AI SDKs and more

## Optional: Choose MCP Profile

Reduce active servers for better performance:

```bash
# Minimal (3 servers) - Fastest
npm run mcp:profile:minimal

# Development (7 servers) - Good balance
npm run mcp:profile:dev

# Full (24 servers) - All features
npm run mcp:profile:full
```

## Next Steps

1. ✅ Restart Claude Code
2. ✅ Start dev server: `npm run dev:netlify`
3. ✅ Read `CLAUDE.md` for development guide
4. ✅ Review `docs/` for system documentation

## Support Files

- `SETUP_NEW_COMPUTER.md` - Detailed setup guide
- `CLAUDE.md` - Development commands and best practices
- `mcp-portable-config/README.md` - MCP configuration details

## Time Savings

**Manual setup:** ~2-3 hours
**Automated setup:** ~3-5 minutes
**Saved:** 2+ hours per new computer! ⚡
