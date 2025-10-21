# MCP Server Toggle Guide - Claude Code

**Last Updated**: 2025-10-21
**Purpose**: Learn how to enable/disable MCP servers in Claude Code to optimize performance and context window usage

---

## Why Toggle MCP Servers?

### Context Window Impact
- **Each MCP server adds tools** to Claude's context
- **Active servers consume tokens** even when not used
- **Example**: 10 MCPs with 5 tools each = 50 tool definitions in every conversation

### Performance Benefits
- **Faster responses**: Fewer tools to evaluate
- **Lower costs**: Reduced token consumption
- **Better focus**: Only relevant tools available
- **Easier debugging**: Fewer variables when troubleshooting

### Use Cases
- **Project-specific MCPs**: Enable Figma MCP only when working on design
- **Seasonal tools**: Disable marketing audit MCP outside campaign season
- **Development vs. Production**: Different MCP sets for different environments
- **Testing unstable servers**: Enable only when debugging

---

## Method 1: /mcp Command (Recommended)

**The easiest and most user-friendly method.**

### View All MCP Servers

```bash
# Open MCP management interface
/mcp
```

**What you'll see**:
```
MCP Servers (8 active, 3 disabled)

✅ supabase-mcp          Database operations
✅ netlify-mcp           Deployment management
✅ gsap-master-mcp       Animation assistance
✅ github-mcp            Repository operations
✅ cloudinary-mcp        Image optimization
✅ filesystem-mcp        File operations
✅ sequential-thinking    Extended thinking
✅ brave-search-mcp      Web search

⏸️  spline-mcp           3D modeling (disabled)
⏸️  replicate-mcp        AI image generation (disabled)
⏸️  figma-mcp            Design integration (disabled)
```

### Toggle Individual Servers

**In the /mcp interface**:
1. Select server to toggle
2. Click "Disable" or "Enable"
3. Changes take effect immediately (no restart needed)

**Via @mention activation** (session-only):
```bash
# Temporarily enable disabled server for current conversation
@spline-mcp help me create a 3D scene

# Server becomes available for this chat only
# Automatically disabled after conversation ends
```

---

## Method 2: Configuration File

**For programmatic control and automation.**

### Location

**Global configuration**:
```
~/.claude.json
```

**Windows**:
```
C:\Users\YourName\.claude.json
```

**Mac/Linux**:
```
/Users/yourname/.claude.json
```

### Configuration Structure

```json
{
  "mcpServers": {
    "supabase-mcp": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase"],
      "env": {
        "SUPABASE_URL": "https://ubqxflzuvxowigbjmqfb.supabase.co",
        "SUPABASE_ANON_KEY": "your_anon_key_here"
      }
    },
    "netlify-mcp": {
      "command": "npx",
      "args": ["-y", "@netlify/mcp-server"],
      "env": {
        "NETLIFY_AUTH_TOKEN": "your_token_here"
      }
    }
  },
  "_disabled_mcpServers": {
    "spline-mcp": {
      "command": "npx",
      "args": ["-y", "spline-mcp-server"],
      "env": {
        "SPLINE_API_KEY": "your_key_here"
      }
    }
  }
}
```

### Toggle by Moving Between Sections

**To disable a server**:
```bash
# Move from mcpServers to _disabled_mcpServers
# Option 1: Manual edit
# Edit ~/.claude.json and move server config

# Option 2: Use jq (command-line JSON processor)
jq '.`_disabled_mcpServers`["spline-mcp"] = .mcpServers["spline-mcp"] | del(.mcpServers["spline-mcp"])' ~/.claude.json > ~/.claude.json.tmp && mv ~/.claude.json.tmp ~/.claude.json

# Option 3: Use project script (if available)
npm run mcp:disable -- spline-mcp
```

**To enable a server**:
```bash
# Move from _disabled_mcpServers to mcpServers
jq '.mcpServers["spline-mcp"] = .`_disabled_mcpServers`["spline-mcp"] | del(.`_disabled_mcpServers`["spline-mcp"])' ~/.claude.json > ~/.claude.json.tmp && mv ~/.claude.json.tmp ~/.claude.json

# Or use project script
npm run mcp:enable -- spline-mcp
```

---

## Method 3: Project-Level Scripts (Disruptors AI)

**Pre-configured scripts for this project.**

### Available Commands

```bash
# List all MCP servers and status
npm run mcp:list

# Enable specific servers (comma-separated)
npm run mcp:enable -- supabase-mcp gsap-master-mcp netlify-mcp

# Disable specific servers
npm run mcp:disable -- spline-mcp replicate-mcp

# Check current status
npm run mcp:status

# View current configuration
npm run mcp:toggle
```

### Profile Management

**Pre-configured server sets for different scenarios.**

#### Minimal Profile (3 servers)
```bash
npm run mcp:profile:minimal
```

**Enabled MCPs**:
- `filesystem-mcp` - File operations
- `sequential-thinking` - Extended thinking
- `brave-search-mcp` - Web search

**Use when**: Quick tasks, minimal context needed, cost optimization

#### Development Profile (7 servers)
```bash
npm run mcp:profile:dev
```

**Enabled MCPs**:
- All minimal servers +
- `supabase-mcp` - Database operations
- `netlify-mcp` - Deployment management
- `github-mcp` - Repository operations
- `gsap-master-mcp` - Animation assistance

**Use when**: Active development, common workflows

#### Full Profile (27 servers)
```bash
npm run mcp:profile:full
```

**Enabled MCPs**: All available servers

**Use when**: Complex tasks requiring multiple integrations

### Cross-Computer Synchronization

```bash
# Export current configuration
npm run mcp:export
# Creates: mcp-portable-config/active-config.json

# Import configuration on another machine
npm run mcp:import

# Two-way sync via GitHub
npm run mcp:push   # Upload to GitHub
npm run mcp:pull   # Download from GitHub
npm run mcp:sync   # Bidirectional sync
```

---

## MCP Server Inventory (Disruptors AI)

### Essential Servers (Always Enabled)

| Server | Purpose | Context Impact |
|--------|---------|----------------|
| `filesystem-mcp` | File operations | Low (5 tools) |
| `sequential-thinking` | Extended thinking | Low (3 tools) |
| `brave-search-mcp` | Web search | Medium (8 tools) |

### Development Servers (Enable When Coding)

| Server | Purpose | Context Impact |
|--------|---------|----------------|
| `supabase-mcp` | Database operations | High (20+ tools) |
| `netlify-mcp` | Deployment management | Medium (12 tools) |
| `github-mcp` | Repository operations | Medium (15 tools) |
| `gsap-master-mcp` | Animation assistance | Low (6 tools) |

### Specialized Servers (Enable As Needed)

| Server | Purpose | When to Enable |
|--------|---------|----------------|
| `spline-mcp` | 3D modeling | Working on 3D scenes |
| `figma-mcp` | Design integration | Design reviews |
| `replicate-mcp` | AI image generation | Creating marketing assets |
| `cloudinary-mcp` | Image optimization | Media management |
| `playwright-mcp` | Browser automation | E2E testing |
| `puppeteer-mcp` | Web scraping | Data extraction |
| `airtable-mcp` | Database/CRM | Data management |

---

## Best Practices

### 1. Start Minimal

```bash
# Begin with minimal profile
npm run mcp:profile:minimal

# Add servers only when needed
npm run mcp:enable -- supabase-mcp

# Remove when done
npm run mcp:disable -- supabase-mcp
```

**Why**: Reduces context clutter, faster responses

### 2. Monitor Context Usage

```bash
# Use /mcp to see active servers
/mcp

# Count tools in current context
# (shown in MCP interface)

# Aim for < 50 total tools for optimal performance
```

### 3. Session-Specific Activation

```bash
# For one-off tasks, use @mention instead of enabling globally
@figma-mcp extract colors from this design

# Server available for this conversation only
# Doesn't affect global configuration
```

### 4. Project-Specific Profiles

Create `.claude/mcp-profile.json` in your project:

```json
{
  "name": "Disruptors AI - Marketing Campaign",
  "description": "MCPs for marketing campaign work",
  "servers": [
    "filesystem-mcp",
    "sequential-thinking",
    "brave-search-mcp",
    "replicate-mcp",
    "cloudinary-mcp",
    "supabase-mcp"
  ]
}
```

Then load:
```bash
npm run mcp:load-profile
```

### 5. Disable Expensive Servers

**High token consumption**:
- Servers with 20+ tools
- Servers with large data schemas
- Servers with complex permissions

**When to disable**:
- Not actively using
- Cost optimization mode
- Simple conversational tasks

---

## Troubleshooting

### MCP Server Won't Disable

**Issue**: Server shows as disabled but still appears in context

**Solution**:
```bash
# 1. Restart Claude Code
# Exit and relaunch

# 2. Verify configuration
cat ~/.claude.json | grep "server-name"

# 3. Check for duplicate entries
# Search ~/.claude.json for server name
# Remove duplicates

# 4. Clear cache
rm -rf ~/.claude/cache/
```

### Server Fails After Re-enabling

**Issue**: Server shows error after being re-enabled

**Solutions**:
```bash
# 1. Check environment variables
echo $SUPABASE_URL
echo $NETLIFY_AUTH_TOKEN

# 2. Test server independently
npx -y @supabase/mcp-server-supabase

# 3. Reinstall MCP server package
npm cache clean --force
npx -y @supabase/mcp-server-supabase

# 4. Check Claude Code logs
tail -f ~/.claude/logs/mcp.log
```

### Can't Find ~/.claude.json

**Issue**: Configuration file doesn't exist

**Solution**:
```bash
# Create default configuration
cat > ~/.claude.json <<'EOF'
{
  "mcpServers": {},
  "_disabled_mcpServers": {}
}
EOF

# Or let Claude Code create it
# Use /mcp command and it will initialize config
```

---

## Advanced: Conditional MCP Loading

### Use Environment Variables

```json
{
  "mcpServers": {
    "production-only-mcp": {
      "command": "npx",
      "args": ["-y", "production-mcp"],
      "enabled": "${NODE_ENV === 'production'}",
      "env": {
        "API_KEY": "${PROD_API_KEY}"
      }
    }
  }
}
```

### Project Detection

Create `.claude/auto-enable-mcps.json`:

```json
{
  "rules": [
    {
      "match": "package.json contains @supabase/supabase-js",
      "enable": ["supabase-mcp"]
    },
    {
      "match": "netlify.toml exists",
      "enable": ["netlify-mcp"]
    },
    {
      "match": "figma files in /design",
      "enable": ["figma-mcp"]
    }
  ]
}
```

### Hook-Based Toggle

Create `.claude/hooks/on-project-open.sh`:

```bash
#!/bin/bash

# Auto-enable MCPs based on project type
if [ -f "package.json" ]; then
    if grep -q "@supabase/supabase-js" package.json; then
        npm run mcp:enable -- supabase-mcp
    fi

    if grep -q "netlify" package.json; then
        npm run mcp:enable -- netlify-mcp
    fi
fi
```

---

## Context Window Optimization Strategy

### Step 1: Measure Current Usage

```bash
# Open /mcp
/mcp

# Note "Total tools: X"
# Target: < 50 tools for optimal performance
```

### Step 2: Identify High-Impact Servers

**Sort by tool count**:
1. Supabase MCP: ~25 tools (database operations)
2. GitHub MCP: ~18 tools (repository management)
3. Netlify MCP: ~15 tools (deployment)
4. Cloudinary MCP: ~12 tools (media)

### Step 3: Optimize Configuration

```bash
# Disable high-tool-count servers not in use
npm run mcp:disable -- supabase-mcp github-mcp

# Enable only when needed
# "Use supabase-mcp to query the database"
@supabase-mcp select * from posts

# Or enable temporarily
npm run mcp:enable -- supabase-mcp
# (work with database)
npm run mcp:disable -- supabase-mcp
```

### Step 4: Monitor Performance

**Metrics to track**:
- Response time: < 2 seconds target
- Token usage: Visible in Claude Code UI
- Tool call success rate: > 95%
- Context window warnings: Should be zero

---

## Quick Reference

### Common Commands

```bash
# View all MCPs
/mcp

# Enable server for one conversation
@server-name task description here

# List all servers
npm run mcp:list

# Enable/disable servers
npm run mcp:enable -- server1 server2
npm run mcp:disable -- server1 server2

# Switch profiles
npm run mcp:profile:minimal
npm run mcp:profile:dev
npm run mcp:profile:full

# Sync configuration
npm run mcp:export
npm run mcp:import
npm run mcp:sync
```

### Profile Recommendations

| Scenario | Profile | Why |
|----------|---------|-----|
| Quick chat | Minimal (3) | Fast, low cost |
| Coding | Dev (7) | Common tools |
| Complex project | Full (27) | All capabilities |
| Cost optimization | Minimal (3) | Minimum tokens |
| Testing | Custom | Enable test-specific MCPs |

---

## Next Steps

1. **Audit current MCPs**: Run `npm run mcp:list`
2. **Identify unused servers**: Note servers you haven't used in 30 days
3. **Switch to minimal profile**: `npm run mcp:profile:minimal`
4. **Enable as needed**: Use @mention or targeted enable commands
5. **Monitor performance**: Track response times and token usage

**Goal**: Optimal balance between capability and performance 🎯
