# Install Your Plugin Right Now

## On This Computer

### Step 1: Add Your Marketplace

In Claude Code terminal or VS Code, run:

```bash
/plugin marketplace add TechIntegrationLabs/disruptors-ai-marketing-hub
```

### Step 2: List Available Plugins

```bash
/plugin list
```

You should see: `disruptors-mcp-suite`

### Step 3: Install the Plugin

```bash
/plugin install disruptors-mcp-suite
```

### Step 4: Verify Installation

```bash
/plugin list
```

Should show plugin as installed.

### Step 5: Check MCP Servers

```bash
/mcp list
```

Should show your 22 MCP servers.

### Step 6: Restart Claude Code

**IMPORTANT:** Close ALL Claude Code windows completely and reopen.

MCP servers only initialize on startup.

---

## Troubleshooting on This Computer

### If marketplace add fails:

The plugin files are in your repo, so try:

```bash
# Navigate to your project
cd /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub

# Verify files exist
ls -la .claude-plugin/
ls -la .mcp.json

# Try adding as local plugin
/plugin add ./
```

### If MCP servers don't show:

```bash
# Check if .env file exists
ls -la .env

# If not, copy from template
cp .env.template .env

# Edit .env with your credentials
# (You already have credentials from earlier)

# Restart Claude Code
```

---

## On a Different Computer

### Step 1: Clone Your Project

```bash
cd ~/Documents/Projects
git clone https://github.com/TechIntegrationLabs/disruptors-ai-marketing-hub.git
cd disruptors-ai-marketing-hub
```

### Step 2: Copy Environment File

```bash
# Get .env from password manager or secure location
# NEVER commit .env to git!

# Place in project root
cp /secure/location/.env .env
```

### Step 3: Add Plugin Marketplace

In Claude Code:

```bash
/plugin marketplace add TechIntegrationLabs/disruptors-ai-marketing-hub
```

### Step 4: Install Plugin

```bash
/plugin install disruptors-mcp-suite
```

### Step 5: Verify

```bash
/plugin list
/mcp list
```

### Step 6: Restart Claude Code

Close completely and reopen.

---

## Alternative: Local Plugin Installation

If you're already in the project directory:

```bash
# Add as local plugin
/plugin add ./

# Or specify path
/plugin add /Users/disruptors/Documents/DM4/disruptors-ai-marketing-hub
```

---

## Profile Switching

After installation:

```bash
# Start with dev profile (7 servers)
/mcp profile dev

# Or minimal (3 servers - fastest)
/mcp profile minimal

# Or full (22 servers - everything)
/mcp profile full
```

---

## Verifying It Works

```bash
# Check plugin status
/plugin list

# Check MCP servers
/mcp list

# Check specific server status
/mcp status

# Test a server (like GitHub)
/mcp restart github
/mcp logs github
```

---

## Quick Reference

| Command | What It Does |
|---------|-------------|
| `/plugin marketplace add TechIntegrationLabs/disruptors-ai-marketing-hub` | Add your marketplace |
| `/plugin list` | List installed plugins |
| `/plugin install disruptors-mcp-suite` | Install your plugin |
| `/plugin enable disruptors-mcp-suite` | Enable plugin |
| `/plugin disable disruptors-mcp-suite` | Disable plugin |
| `/mcp list` | List MCP servers |
| `/mcp status` | Check server health |
| `/mcp profile dev` | Switch to dev profile |
| `/mcp restart github` | Restart specific server |
| `/mcp logs github` | View server logs |

---

## Next Steps

1. Try installing on this computer now
2. Test MCP servers work
3. Try profile switching
4. Install on another computer to verify portability
