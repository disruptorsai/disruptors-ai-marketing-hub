# MCP Global Setup - Complete Configuration Guide

**Date:** 2025-11-05
**Status:** ✅ Complete
**Global Config Location:** `C:\Users\Will\.claude\mcp.json`
**Project Config Location:** `C:\Users\Will\OneDrive\Documents\Projects\dm4\disruptors-ai-marketing-hub\mcp.json`

---

## Overview

Your MCP ecosystem is now split between **global** (system-wide) and **project-specific** configurations for optimal context management and reusability.

### Total Servers: 28 MCP Servers

- **Global Servers:** 24 servers (available across all projects)
- **Project-Specific Servers:** 4 servers (unique to this project)

---

## Global MCP Servers (24 Total)

**Location:** `C:\Users\Will\.claude\mcp.json`

These servers are available in **ALL** Claude Code sessions across **ALL** projects on this machine.

### Core Services (4)
1. **memory** - Persistent context across sessions
2. **sequential-thinking** - Enhanced multi-step reasoning
3. **fetch** - Web content fetching
4. **context7** - Upstash context management

### Development Tools (3)
5. **github** - Repository management (your PAT configured)
6. **playwright** - Browser automation with PDF support
7. **puppeteer** - Headless Chrome automation

### Cloud Deployment (4)
8. **netlify** - Serverless functions & deployment (your auth token)
9. **vercel** - Modern web deployment (will-4496s-projects)
10. **digitalocean** - Cloud infrastructure (apps, databases, droplets)
11. **railway** - Container-based hosting

### AI Services (3)
12. **replicate** - AI model execution (your token configured)
13. **nano-banana** - Google Gemini integration (your API key)
14. **firecrawl** - Web scraping (your API key: fc-d10...)

### Animation & 3D (5)
15. **threejs** - Three.js manipulation
16. **mcp-three** - GLTF to React Three Fiber conversion
17. **gsap-master** - GSAP animation patterns
18. **magic-ui** - Magic UI components
19. **aceternity-ui** - Aceternity UI components

### Data & Media (5)
20. **supabase** - Database operations (project: ubqxflzuvxowigbjmqfb)
21. **airtable** - Database management (your API key)
22. **cloudinary** - Image/video optimization (cloud: dvcvxhzmt)
23. **dataforseo** - SEO keyword research (will@disruptorsmedia.com)
24. **figma** - Design integration (your API key)

**Bonus:**
25. **apify-modern** - Advanced web scraping (URL-based)

---

## Project-Specific MCP Servers (4 Total)

**Location:** `C:\Users\Will\OneDrive\Documents\Projects\dm4\disruptors-ai-marketing-hub\mcp.json`

These servers ONLY load when working in **this specific project** because they contain project-specific configurations:

### Why These Are Project-Specific:

1. **filesystem** - Path specific to this project directory
   - Path: `C:\Users\Will\OneDrive\Documents\Projects`

2. **n8n-mcp** - Hardcoded to your n8n.cloud instance
   - URL: `https://willdisrupt.app.n8n.cloud/api/v1`
   - Not reusable across projects

3. **gohighlevel** - Hardcoded location ID
   - Location: `1DrJ590uuFroxuiy2iME`
   - Specific to this CRM setup

4. **spline** - Custom local server configuration
   - Path: `spline-mcp-server/bin/cli.js`
   - Project-specific 3D assets

---

## How It Works

### Configuration Precedence

1. **Global Config Loads First:** All 24 global servers load in every Claude Code session
2. **Project Config Merges:** When in this project, 4 additional project-specific servers load
3. **Total Available:** 24 + 4 = **28 MCP servers** when working in this project

### No Conflicts

- Project config **supplements** global config (doesn't override)
- No duplicate server names between global and project configs
- Clean separation of concerns

---

## Benefits of This Setup

### ✅ Global Benefits

1. **Reusability:** Use same servers across all projects (GitHub, Netlify, AI services)
2. **Single Update:** Update credentials once, available everywhere
3. **Consistency:** Same development environment across all projects
4. **Reduced Redundancy:** No need to reconfigure servers for each project

### ✅ Project-Specific Benefits

1. **Isolation:** Project-specific servers don't pollute global namespace
2. **Custom Configs:** Filesystem paths, n8n URLs, GHL locations stay project-specific
3. **Portability:** Project config can be committed to git (with secrets in .env)
4. **Flexibility:** Different projects can have different n8n/GHL configs

---

## Usage Examples

### When Working in This Project

```bash
# All 28 servers available:
# - 24 global servers (memory, github, netlify, supabase, etc.)
# - 4 project servers (filesystem, n8n-mcp, gohighlevel, spline)
```

### When Working in Another Project

```bash
# Only 24 global servers available:
# - Core tools (memory, fetch, sequential-thinking)
# - Dev tools (github, playwright, netlify)
# - AI services (replicate, gemini, firecrawl)
# - Animation/3D (gsap, threejs, magic-ui)
# - Data (supabase, cloudinary, airtable)

# Add project-specific servers to that project's mcp.json as needed
```

---

## Credential Security

### Global Config (`C:\Users\Will\.claude\mcp.json`)

**Contains actual API keys/tokens:**
- GitHub PAT
- Netlify Auth Token
- DigitalOcean Token
- Firecrawl API Key
- DataForSEO Password
- Gemini API Key
- Replicate Token
- Cloudinary Credentials
- Airtable API Key
- Figma API Key
- Supabase Access Token

**Security:** ✅ File is in `.claude` directory (not in git, not shared)

### Project Config (`mcp.json`)

**Contains project-specific credentials:**
- n8n API Key
- GoHighLevel API Key
- Spline API Key (empty)

**Security:** ⚠️ File is in project directory (could be committed to git)
- Consider moving secrets to `.env` file
- Use `${ENV_VAR}` syntax in mcp.json
- Add `.env` to `.gitignore`

---

## Maintenance & Updates

### Updating Global Servers

**Add New Global Server:**
```json
// Edit C:\Users\Will\.claude\mcp.json
{
  "mcpServers": {
    "new-server": {
      "command": "npx",
      "args": ["-y", "new-mcp-server@latest"]
    }
  }
}
```

**Restart Claude Code** to load changes.

### Updating Project Servers

**Add Project-Specific Server:**
```json
// Edit project mcp.json
{
  "mcpServers": {
    "custom-server": {
      "command": "node",
      "args": ["path/to/server.js"]
    }
  }
}
```

**Restart Claude Code** or reload project.

### Rotating Credentials

**Global Credentials:**
1. Update in `C:\Users\Will\.claude\mcp.json`
2. Changes apply to ALL projects immediately
3. Restart Claude Code

**Project Credentials:**
1. Update in project `mcp.json` or `.env`
2. Changes apply only to this project
3. Restart Claude Code

---

## Migration to New Computer

### Step 1: Backup Global Config

```bash
# Copy global config
copy C:\Users\Will\.claude\mcp.json ~/Dropbox/claude-backup/

# Or push to private git repo
git add .claude/mcp.json
git commit -m "Backup global MCP config"
git push
```

### Step 2: On New Computer

```bash
# Copy global config to new machine
copy ~/Dropbox/claude-backup/mcp.json C:\Users\Will\.claude\

# Or pull from git
git clone https://github.com/yourusername/dotfiles.git
copy dotfiles/mcp.json C:\Users\Will\.claude\
```

### Step 3: Clone Project

```bash
git clone https://github.com/yourusername/project.git
cd project
# Project mcp.json loads automatically
```

---

## Troubleshooting

### Global Server Not Loading

**Issue:** Server configured globally but not available.

**Solution:**
1. Check `C:\Users\Will\.claude\mcp.json` exists
2. Verify JSON syntax is valid
3. Restart Claude Code completely
4. Check server name matches exactly (case-sensitive)

### Project Server Conflicts

**Issue:** Duplicate server names between global and project.

**Solution:**
- Rename one of the servers
- Remove duplicate from project config (prefer global)
- Use different server names

### Credentials Not Working

**Issue:** API keys not recognized.

**Solution:**
1. Verify keys in global config are correct
2. Check for typos in API keys
3. Ensure no extra whitespace
4. Test API keys independently (curl/Postman)
5. Rotate keys if expired

### Too Many Servers

**Issue:** 28 servers is too much context.

**Solution:**
Use the profile system to disable unused servers:

```bash
# Minimal (3 servers)
npm run mcp:profile:minimal

# Dev (7 servers)
npm run mcp:profile:dev

# Full (all servers)
npm run mcp:profile:full
```

---

## Summary

✅ **Global Config:** `C:\Users\Will\.claude\mcp.json` (24 servers)
✅ **Project Config:** `mcp.json` (4 servers)
✅ **Total Available:** 28 servers when in this project
✅ **Reusable:** Global servers work across all projects
✅ **Flexible:** Project servers stay isolated
✅ **Secure:** Credentials properly managed
✅ **Portable:** Easy to migrate to new machines

---

## Next Steps

1. ✅ Global config created with 24 servers
2. ✅ Project config reduced to 4 servers
3. ⏳ Test global setup (restart Claude Code)
4. ⏳ Verify all servers load correctly
5. ⏳ Consider moving project secrets to `.env`
6. ⏳ Backup global config to cloud storage
7. ⏳ Update documentation if needed

---

## Related Documentation

- [MCP Server Management](./MCP_SERVER_MANAGEMENT.md) - Profile system
- [MCP Quick Reference](./MCP_QUICK_REFERENCE.md) - Command cheat sheet
- [MCP Ecosystem](./integrations/MCP_ECOSYSTEM.md) - Full server details
- [Global MCP Setup Guide](./GLOBAL_MCP_AND_AGENTS_SETUP.md) - Cross-project setup
