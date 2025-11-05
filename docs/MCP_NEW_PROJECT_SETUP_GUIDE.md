# Setting Up MCPs in a New Project/Repository

**Quick Answer:** If you're using Claude Code, you already have 24 MCP servers available globally in every project with zero setup! 🎉

---

## Understanding Global vs Project MCPs

### Global MCPs (Already Configured)
- **Location:** `C:\Users\Will\.claude\mcp.json`
- **Available In:** ALL Claude Code sessions, ALL projects
- **Setup Required:** ✅ Already done (you have 24 servers)
- **When They Load:** Automatically when Claude Code starts

### Project MCPs (Optional)
- **Location:** `<project-root>/mcp.json`
- **Available In:** Only that specific project
- **Setup Required:** Only if you need project-specific configs
- **When They Load:** Automatically when working in that project

---

## Scenario 1: New Project with Global MCPs Only

**Use Case:** Most projects - you just want the standard dev tools

### Steps:

```bash
# 1. Create new project
mkdir my-new-project
cd my-new-project
git init

# 2. Open in Claude Code
code .
# Or start Claude Code and open this folder

# 3. That's it! 🎉
# All 24 global MCPs are already available:
# - memory, sequential-thinking, fetch
# - github, netlify, vercel, digitalocean, railway
# - playwright, puppeteer, firecrawl
# - replicate, nano-banana (Gemini)
# - supabase, airtable, cloudinary, dataforseo, figma
# - threejs, gsap-master, magic-ui, aceternity-ui, mcp-three
# - context7, apify-modern
```

**Verify MCPs are loaded:**
- In Claude Code, type `@` and you'll see all available MCP tools
- Or just start asking Claude to use them: "Search GitHub for React examples"

### No Configuration Needed
- No `mcp.json` file required
- No environment setup
- No installation steps
- Everything works immediately

---

## Scenario 2: New Project with Project-Specific MCPs

**Use Case:** Project needs custom filesystem path, project-specific database, or custom n8n instance

### Steps:

```bash
# 1. Create new project
mkdir my-custom-project
cd my-custom-project

# 2. Create project-specific mcp.json
# Only add servers that need project-specific config
```

### Example: E-commerce Project with Custom Supabase

```json
{
  "_comment": "Project-specific MCPs for E-commerce Platform",
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem@latest",
        "C:\\Users\\Will\\Projects\\ecommerce-platform"
      ]
    },
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=different-project-id-here"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "different-token-here"
      }
    }
  }
}
```

**What Happens:**
- Global supabase MCP (ubqxflzuvxowigbjmqfb) is **replaced** by this project-specific one
- All other global MCPs still available
- This project now has its own database access

### Example: Marketing Agency with Client-Specific n8n

```json
{
  "_comment": "Client-specific automation workflow",
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["-y", "n8n-mcp-server@latest"],
      "env": {
        "N8N_API_URL": "https://client-xyz.app.n8n.cloud/api/v1",
        "N8N_API_KEY": "client-xyz-api-key-here"
      }
    },
    "airtable": {
      "command": "npx",
      "args": ["-y", "airtable-mcp-server"],
      "env": {
        "AIRTABLE_API_KEY": "client-specific-key",
        "AIRTABLE_BASE_ID": "appXYZ123"
      }
    }
  }
}
```

---

## Scenario 3: Setting Up in Cursor IDE

**Important:** Cursor uses a different configuration location than Claude Code!

### Cursor Global MCP Location:
```
Windows: C:\Users\Will\.cursor\mcp.json
Mac/Linux: ~/.cursor/mcp.json
```

### Setup Steps:

```bash
# 1. Check if Cursor global config exists
ls -la "C:/Users/Will/.cursor/mcp.json"

# 2. If it doesn't exist, copy from Claude Code
copy "C:\Users\Will\.claude\mcp.json" "C:\Users\Will\.cursor\mcp.json"

# 3. Restart Cursor

# 4. Open any project
# All global MCPs now available in Cursor
```

### Differences: Claude Code vs Cursor

| Feature | Claude Code | Cursor |
|---------|-------------|--------|
| Global Config | `~/.claude/mcp.json` | `~/.cursor/mcp.json` |
| Project Config | `<project>/mcp.json` | `<project>/mcp.json` |
| Auto-loads Global | ✅ Yes | ✅ Yes |
| MCP Tools Visible | Via `@` mention | Via Composer |
| Configuration | Same JSON format | Same JSON format |

**Pro Tip:** Keep both in sync by creating a symlink:
```bash
# Windows (run as Administrator)
mklink "C:\Users\Will\.cursor\mcp.json" "C:\Users\Will\.claude\mcp.json"

# Mac/Linux
ln -s ~/.claude/mcp.json ~/.cursor/mcp.json
```

---

## Scenario 4: Team Collaboration

**Use Case:** Share MCP setup with team members

### Option A: Global Config Template (Recommended)

**Create a team template file:**

`mcp-global-template.json`:
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory@latest"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github@latest"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PAT}"
      }
    },
    "netlify": {
      "command": "npx",
      "args": ["-y", "@netlify/mcp@latest"],
      "env": {
        "NETLIFY_AUTH_TOKEN": "${NETLIFY_TOKEN}"
      }
    }
  }
}
```

**Team member setup:**
```bash
# 1. Clone template
copy mcp-global-template.json C:\Users\[Username]\.claude\mcp.json

# 2. Create .env file with their credentials
# .env
GITHUB_PAT=their_github_token
NETLIFY_TOKEN=their_netlify_token

# 3. Replace ${GITHUB_PAT} with actual values in mcp.json
# Or set system environment variables
```

### Option B: Project-Only MCPs (No Global Needed)

**Commit `mcp.json` to git:**
```json
{
  "mcpServers": {
    "memory": {"command": "npx", "args": ["-y", "@modelcontextprotocol/server-memory@latest"]},
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github@latest"],
      "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"}
    }
  }
}
```

**Team members:**
```bash
# 1. Clone repo
git clone https://github.com/team/project.git

# 2. Create .env file
echo "GITHUB_PERSONAL_ACCESS_TOKEN=your_token" > .env

# 3. Open in Claude Code/Cursor
# MCPs load automatically
```

---

## Scenario 5: Minimal Setup (Bare Bones)

**Use Case:** Quick prototype, don't need all 24 servers

### Option 1: Use Global Minimal Profile
```bash
npm run mcp:profile:minimal
# Disables all but 3 servers: memory, filesystem, sequential-thinking
```

### Option 2: New Project with Only What You Need
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory@latest"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github@latest"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token"
      }
    }
  }
}
```

---

## Real-World Examples

### Example 1: Simple Blog Project

**No project mcp.json needed!**

Just use global MCPs:
- `memory` - Remember context across sessions
- `github` - Version control
- `netlify` - Deploy
- `cloudinary` - Optimize images
- `supabase` - Database (your default project)

Everything already configured globally. Zero setup.

### Example 2: Client WordPress Site

**Create project `mcp.json`:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem@latest",
        "C:\\Users\\Will\\Projects\\client-wordpress-site"
      ]
    },
    "airtable": {
      "command": "npx",
      "args": ["-y", "airtable-mcp-server"],
      "env": {
        "AIRTABLE_API_KEY": "client_specific_key",
        "AIRTABLE_BASE_ID": "appClientBase123"
      }
    }
  }
}
```

**Why:**
- Custom filesystem path for this client
- Client-specific Airtable base
- All other global MCPs still available

### Example 3: Multi-Tenant SaaS

**Each tenant environment has own `mcp.json`:**

`/projects/saas-tenant-a/mcp.json`:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=tenant-a-project-id"
      ],
      "env": {"SUPABASE_ACCESS_TOKEN": "tenant_a_token"}
    }
  }
}
```

`/projects/saas-tenant-b/mcp.json`:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=tenant-b-project-id"
      ],
      "env": {"SUPABASE_ACCESS_TOKEN": "tenant_b_token"}
    }
  }
}
```

**Result:** Different Supabase database per tenant, all other MCPs global.

---

## Common Questions

### Q: Do I need to install anything?

**A:** No! MCPs are installed on-demand via `npx`. First use downloads automatically.

### Q: What if I want different credentials per project?

**A:** Override in project `mcp.json`:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github@latest"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "different_token_for_this_project"
      }
    }
  }
}
```

### Q: How do I know which MCPs are loaded?

**A:** In Claude Code:
1. Type `@` and look at available tools
2. Or ask: "What MCP servers are available?"
3. Or run: `npm run mcp:list` (if project has the script)

### Q: Can I disable global MCPs for a project?

**A:** Yes, create `mcp.json` with `"_disabled"`:
```json
{
  "_disabled": {
    "digitalocean": true,
    "railway": true,
    "airtable": true
  }
}
```

### Q: What about security/secrets in project mcp.json?

**A:** Best practice:
```bash
# 1. Create .env file (add to .gitignore)
echo "GITHUB_PERSONAL_ACCESS_TOKEN=your_token" > .env

# 2. Use environment variable syntax in mcp.json
{
  "mcpServers": {
    "github": {
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}

# 3. Share mcp.json (no secrets), team members add their own .env
```

---

## Quick Setup Checklist

### New Project (Most Common)
- [ ] Create project directory
- [ ] Open in Claude Code
- [ ] ✅ Done! 24 global MCPs already available
- [ ] (Optional) Add project `mcp.json` if needed

### New Project with Custom MCPs
- [ ] Create project directory
- [ ] Create `mcp.json` with project-specific servers
- [ ] Create `.env` with secrets (add to `.gitignore`)
- [ ] Open in Claude Code
- [ ] Verify MCPs load: type `@` and check available tools

### Setup on New Computer
- [ ] Copy `C:\Users\Will\.claude\mcp.json` from old computer
- [ ] Place in `C:\Users\[NewUsername]\.claude\mcp.json`
- [ ] Update any paths (filesystem server)
- [ ] Restart Claude Code
- [ ] All projects now have global MCPs

### Setup for Team Member
- [ ] Share `mcp-global-template.json` (no secrets)
- [ ] Team member copies to `~/.claude/mcp.json`
- [ ] Team member fills in their own API keys
- [ ] Restart Claude Code
- [ ] Clone project repos - work immediately

---

## Summary

### The TL;DR:

**Starting a new project with Claude Code?**
1. Create project folder
2. Open in Claude Code
3. You're done - 24 MCPs already available

**Need project-specific configs?**
1. Create `mcp.json` in project root
2. Add only project-specific servers
3. Restart Claude Code
4. Global + project MCPs = total available

**Want this in Cursor?**
1. Copy `~/.claude/mcp.json` to `~/.cursor/mcp.json`
2. Restart Cursor
3. Same experience as Claude Code

---

## Next Steps

1. Try creating a new test project
2. Open in Claude Code
3. Ask Claude: "What MCP servers do you have access to?"
4. See all 24 global servers listed
5. Start building! 🚀
