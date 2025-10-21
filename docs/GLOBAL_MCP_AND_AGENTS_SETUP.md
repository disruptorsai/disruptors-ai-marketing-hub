# Global MCP Servers and Agents Setup Guide

Complete guide to configuring MCP servers and agents globally for use across all projects and repositories.

## Why Global Configuration?

**Benefits:**
- Use MCP servers across all projects without duplication
- Maintain single source of truth for credentials
- Update once, available everywhere
- Faster setup for new projects
- Consistent development environment

**Use Cases:**
- Personal development machine
- Team-wide standardization
- Multi-repository workflows
- Cross-project agents

## MCP Server Configuration Levels

### 1. Global MCP Configuration

**Location (Claude Code):**
```
Windows: C:\Users\[YourUsername]\.claude\mcp.json
Mac/Linux: ~/.claude/mcp.json
```

**Location (Cursor):**
```
Windows: C:\Users\[YourUsername]\.cursor\mcp.json
Mac/Linux: ~/.cursor/mcp.json
```

**When to Use:**
- MCP servers you use across ALL projects
- Servers with global credentials (GitHub, Netlify, etc.)
- Development tools (Sequential Thinking, Memory)
- AI services (Replicate, OpenAI, Gemini)

### 2. Project-Specific MCP Configuration

**Location:**
```
<project-root>/mcp.json
```

**When to Use:**
- Project-specific credentials (Supabase, Airtable)
- Custom MCP servers built for this project
- Client-specific integrations
- Override global configuration

**Priority:** Project-specific config takes precedence over global.

## Setting Up Global MCP Servers

### Step 1: Create Global Config Directory

**Windows:**
```bash
mkdir C:\Users\[YourUsername]\.claude
```

**Mac/Linux:**
```bash
mkdir -p ~/.claude
```

### Step 2: Create Global mcp.json

Create the file at the location above with this template:

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory@latest"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking@latest"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch@latest"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github@latest"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest", "--caps=pdf"]
    },
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "your_key_here"
      }
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "puppeteer-mcp-claude"]
    },
    "replicate": {
      "command": "npx",
      "args": ["-y", "replicate-mcp"],
      "env": {
        "REPLICATE_API_TOKEN": "your_token_here"
      }
    },
    "nano-banana": {
      "command": "npx",
      "args": ["-y", "nano-banana-mcp"],
      "env": {
        "GEMINI_API_KEY": "your_key_here"
      }
    },
    "threejs": {
      "command": "npx",
      "args": ["-y", "three-js-mcp"]
    },
    "mcp-three": {
      "command": "npx",
      "args": ["mcp-three"]
    },
    "magic-ui": {
      "command": "npx",
      "args": ["-y", "@magicuidesign/mcp@latest"]
    },
    "aceternity-ui": {
      "command": "npx",
      "args": ["aceternityui-mcp"]
    },
    "gsap-master": {
      "command": "npx",
      "args": ["-y", "bruzethegreat-gsap-master-mcp-server@latest"]
    }
  }
}
```

### Step 3: Add Environment Variables

For MCP servers that require API keys, you have two options:

**Option A: Environment Variables (Recommended)**

Create a global `.env` file:

**Windows:**
```bash
C:\Users\[YourUsername]\.claude\.env
```

**Mac/Linux:**
```bash
~/.claude/.env
```

**Contents:**
```env
GITHUB_PERSONAL_ACCESS_TOKEN=github_pat_xxxxx
FIRECRAWL_API_KEY=fc-xxxxx
REPLICATE_API_TOKEN=r8_xxxxx
GEMINI_API_KEY=AIzaSyxxxxx
OPENAI_API_KEY=sk-xxxxx
NETLIFY_AUTH_TOKEN=nfp_xxxxx
```

**Option B: Inline in mcp.json**

Keep credentials in the `mcp.json` file (less secure, but simpler):
```json
{
  "env": {
    "API_KEY": "your_actual_key_here"
  }
}
```

## Setting Up Global Agents

### Agent Directory Structure

**Global Agents Location (Recommended):**

Create a shared agents directory:

**Windows:**
```bash
C:\Users\[YourUsername]\.claude\global-agents\
```

**Mac/Linux:**
```bash
~/.claude/global-agents/
```

**Project Agents Location:**
```bash
<project-root>/.claude/agents/
```

### Global Agents Setup Process

#### Step 1: Create Global Agents Directory

```bash
mkdir C:\Users\[YourUsername]\.claude\global-agents
```

#### Step 2: Copy Agent Files

Copy any agent `.md` files you want to use globally:

**Example Agents to Make Global:**
```bash
# Copy from current project
copy .claude\agents\ui-ux-master-orchestrator.md C:\Users\[YourUsername]\.claude\global-agents\

copy .claude\agents\gsap-animation-master.md C:\Users\[YourUsername]\.claude\global-agents\

copy .claude\agents\documentation-synchronization-engine.md C:\Users\[YourUsername]\.claude\global-agents\

copy .claude\agents\performance-auditor.md C:\Users\[YourUsername]\.claude\global-agents\

copy .claude\agents\seo-optimizer.md C:\Users\[YourUsername]\.claude\global-agents\
```

#### Step 3: Symlink or Reference in Projects

**Option A: Symlink (Recommended for Unix/Mac)**
```bash
ln -s ~/.claude/global-agents ~/.claude/agents
```

**Option B: Copy to Each Project**
```bash
# In each new project
mkdir .claude/agents
copy C:\Users\[YourUsername]\.claude\global-agents\*.md .claude\agents\
```

**Option C: Environment Variable Reference**

Create a script that copies global agents to current project:

**Windows (PowerShell):**
```powershell
# sync-agents.ps1
$globalAgents = "$env:USERPROFILE\.claude\global-agents"
$projectAgents = ".claude\agents"

if (-not (Test-Path $projectAgents)) {
    New-Item -ItemType Directory -Path $projectAgents
}

Copy-Item "$globalAgents\*.md" -Destination $projectAgents -Force
Write-Host "Global agents synced to project!"
```

**Mac/Linux (Bash):**
```bash
#!/bin/bash
# sync-agents.sh
GLOBAL_AGENTS="$HOME/.claude/global-agents"
PROJECT_AGENTS=".claude/agents"

mkdir -p "$PROJECT_AGENTS"
cp "$GLOBAL_AGENTS"/*.md "$PROJECT_AGENTS/"
echo "Global agents synced to project!"
```

## Recommended Global Configuration

### Essential Global MCP Servers

**Always Global:**
1. **memory** - Persistent memory across sessions
2. **sequential-thinking** - Enhanced reasoning
3. **fetch** - Web fetching capability
4. **github** - GitHub operations (with your PAT)
5. **playwright** - Browser automation
6. **puppeteer** - Headless browser
7. **firecrawl** - Web scraping (with API key)

**UI/UX Development:**
8. **threejs** - Three.js manipulation
9. **mcp-three** - GLTF to R3F conversion
10. **magic-ui** - Magic UI components
11. **aceternity-ui** - Aceternity UI components
12. **gsap-master** - GSAP animation patterns

**AI Services:**
13. **replicate** - AI model execution (with token)
14. **nano-banana** - Google Gemini (with API key)
15. **openai-image** - Image generation (with API key)

### Project-Specific MCP Servers

**Keep in Project Config:**
1. **supabase** - Project-specific database
2. **airtable** - Project-specific bases
3. **netlify** - Deployment (can be global if you manage all sites)
4. **vercel** - Deployment (project-specific)
5. **railway** - Infrastructure (project-specific)
6. **digitalocean** - Infrastructure (can be global)
7. **spline** - Custom Spline server if project-specific

### Essential Global Agents

**Always Available:**
1. **ui-ux-master-orchestrator** - Comprehensive UI/UX expert
2. **gsap-animation-master** - Animation specialist
3. **documentation-synchronization-engine** - Auto-documentation
4. **performance-auditor** - Performance optimization
5. **seo-optimizer** - SEO best practices

**Optional Global:**
6. **deployment-manager** - Deployment orchestration
7. **supabase-database-orchestrator** - Database management

**Project-Specific:**
8. **disruptors-orchestrator** - Project-specific workflow
9. **admin-nexus-orchestrator** - Project-specific admin
10. **blog-orchestrator** - Project-specific blogging

## Usage Across Projects

### Scenario 1: Starting a New Project

**Step 1: Initialize Project**
```bash
mkdir my-new-project
cd my-new-project
npm init -y
```

**Step 2: Sync Global Agents**
```bash
# Windows
powershell -File C:\Users\[YourUsername]\.claude\sync-agents.ps1

# Mac/Linux
~/.claude/sync-agents.sh
```

**Step 3: Create Project MCP Config (Optional)**
```bash
# Only if you need project-specific MCP servers
echo '{"mcpServers": {}}' > mcp.json
```

**Step 4: Start Coding**
- All global MCP servers automatically available
- All global agents available via Task tool
- Project inherits global configuration

### Scenario 2: Adding Project-Specific Config

**mcp.json (Project Override):**
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=project123"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "project_specific_token"
      }
    }
  }
}
```

This will **merge** with global config, adding Supabase only for this project.

## Managing Global Configuration

### Update Global MCPs

**Add New MCP Server Globally:**

Edit `~/.claude/mcp.json`:
```json
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

### Update Global Agents

**Add New Global Agent:**
```bash
# Create agent file
code ~/.claude/global-agents/new-agent.md

# Sync to current project
~/.claude/sync-agents.sh
```

### Version Control for Global Config

**Option 1: Git Repository**

Create a dotfiles repo:
```bash
mkdir ~/dotfiles
cd ~/dotfiles
git init

# Link global config
cp ~/.claude/mcp.json ./claude-mcp.json
ln -s ~/dotfiles/claude-mcp.json ~/.claude/mcp.json

# Link global agents
cp -r ~/.claude/global-agents ./claude-agents
ln -s ~/dotfiles/claude-agents ~/.claude/global-agents

git add .
git commit -m "Initial Claude Code global config"
git push origin main
```

**Option 2: Sync Script**

Create a backup/sync script:
```bash
#!/bin/bash
# backup-claude-config.sh

BACKUP_DIR="$HOME/Dropbox/claude-config"
mkdir -p "$BACKUP_DIR"

cp ~/.claude/mcp.json "$BACKUP_DIR/"
cp -r ~/.claude/global-agents "$BACKUP_DIR/"

echo "Claude config backed up to $BACKUP_DIR"
```

## Current Setup Summary

**Your Disruptors AI Project:**
- ✅ 27 MCP servers configured (project-specific)
- ✅ 16 agents configured (project-specific)
- ✅ New UI/UX servers added (threejs, mcp-three, magic-ui, aceternity-ui)
- ✅ New UI/UX Master Orchestrator agent

**Recommended Next Steps:**

1. **Copy to Global:**
   ```bash
   # Copy current mcp.json to global (edit credentials first!)
   copy mcp.json C:\Users\Will\.claude\mcp.json

   # Copy agents to global
   mkdir C:\Users\Will\.claude\global-agents
   copy .claude\agents\ui-ux-master-orchestrator.md C:\Users\Will\.claude\global-agents\
   copy .claude\agents\gsap-animation-master.md C:\Users\Will\.claude\global-agents\
   copy .claude\agents\performance-auditor.md C:\Users\Will\.claude\global-agents\
   ```

2. **Create Sync Script:**
   ```powershell
   # C:\Users\Will\.claude\sync-agents.ps1
   $globalAgents = "$env:USERPROFILE\.claude\global-agents"
   $projectAgents = ".claude\agents"

   if (-not (Test-Path $projectAgents)) {
       New-Item -ItemType Directory -Path $projectAgents
   }

   Copy-Item "$globalAgents\*.md" -Destination $projectAgents -Force
   Write-Host "Global agents synced!"
   ```

3. **Test in New Project:**
   ```bash
   cd C:\Users\Will\OneDrive\Documents\Projects\test-project
   powershell -File C:\Users\Will\.claude\sync-agents.ps1
   ```

## Troubleshooting

### MCP Server Not Loading

**Issue:** Global MCP server not available in project.

**Solution:**
1. Check global config exists: `cat ~/.claude/mcp.json`
2. Restart Claude Code completely
3. Verify server name matches exactly
4. Check for typos in command/args

### Credentials Not Working

**Issue:** API keys not found.

**Solution:**
1. Use absolute paths in env variables
2. Restart terminal/IDE after setting env vars
3. Check .env file location matches config
4. Use inline credentials in mcp.json temporarily

### Agent Not Found

**Issue:** Global agent not accessible via Task tool.

**Solution:**
1. Check agent file exists: `ls ~/.claude/global-agents/`
2. Verify .md file extension
3. Run sync script to copy to project
4. Restart Claude Code

### Duplicate MCP Servers

**Issue:** Same server in global and project config.

**Solution:**
- Project config takes precedence
- Remove from project config to use global
- Or keep project-specific credentials separate

## Best Practices

1. **Separate Concerns:**
   - Global: Development tools, AI services, GitHub
   - Project: Database, deployment, client APIs

2. **Credential Security:**
   - Use environment variables
   - Never commit credentials to git
   - Use different tokens per machine

3. **Agent Organization:**
   - Global: UI/UX, Animation, Performance, SEO
   - Project: Business logic, workflows, orchestration

4. **Version Control:**
   - Back up global config regularly
   - Use dotfiles repo for portability
   - Document custom MCP servers

5. **Testing:**
   - Test global config in new project
   - Verify agents load correctly
   - Check MCP server connectivity

## Additional Resources

- Claude Code MCP Docs: https://docs.claude.com/en/docs/claude-code/mcp
- MCP Protocol Spec: https://modelcontextprotocol.io/
- Agent Development Guide: `.claude/agents/README.md` (create if needed)
- Your Portable MCP Config: `mcp-portable-config/README.md`

## Version History

- **2025-10-21:** Initial global configuration guide
  - Documented global vs project-specific config
  - Created agent sync workflow
  - Established best practices
  - Added troubleshooting guide
