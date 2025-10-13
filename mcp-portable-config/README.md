# Portable MCP Configuration

Sync your complete MCP server setup across multiple computers.

## Features

- 22 pre-configured MCP servers
- Profile system (minimal/dev/full)
- Credential templating for security
- Cross-computer synchronization
- Cloud backup via GitHub
- One-command setup on new machines

## Quick Setup

### On Your Current Machine (Export)

```bash
# Export your current configuration
npm run mcp:export

# Push to GitHub (first time)
npm run mcp:push
```

### On a New Machine (Import)

```bash
# Clone your config repo
git clone https://github.com/YOUR_USERNAME/mcp-config.git ~/mcp-config

# Install to new machine
cd ~/mcp-config
./install.sh

# Configure credentials
cp .env.template .env
# Edit .env with your API keys

# Apply configuration
npm run mcp:sync
```

## Directory Structure

```
mcp-portable-config/
├── README.md              # This file
├── mcp-config.json        # MCP server definitions
├── mcp-profiles.json      # Profile configurations
├── .env.template          # Credential template (no secrets)
├── .env.example           # Example with fake values
├── install.sh             # New machine setup script
├── sync.js                # Sync script
└── credentials.md         # Where to get API keys
```

## Files Included

### mcp-config.json
Complete MCP server configuration with all 22 servers.

### mcp-profiles.json
Three profiles:
- **minimal**: 3 servers (memory, filesystem, sequential-thinking)
- **dev**: 7 servers (+ github, netlify, vercel, digitalocean)
- **full**: All 22 servers

### .env.template
Template for all required credentials (no actual secrets).

## Synchronization

### Push Changes
```bash
npm run mcp:export   # Export current config
npm run mcp:push     # Push to GitHub
```

### Pull Changes
```bash
npm run mcp:pull     # Pull from GitHub
npm run mcp:import   # Apply to local machine
```

### Full Sync
```bash
npm run mcp:sync     # Two-way sync
```

## Credentials Management

**IMPORTANT**: Never commit actual credentials to git!

1. Use `.env.template` for structure
2. Copy to `.env` and fill in real values
3. `.env` is in `.gitignore` (never committed)
4. Share `.env.template` with team (no secrets)

## Security Best Practices

- Keep `.env` file local only
- Use environment-specific credentials
- Rotate keys periodically
- Use read-only tokens where possible
- Review `credentials.md` for key sources

## Cloud Backup

Configuration syncs to private GitHub repo:
- Automatic versioning
- History tracking
- Easy rollback
- Share with team (without secrets)

## Supported Platforms

- macOS (tested)
- Linux (tested)
- Windows (WSL recommended)

## Troubleshooting

### Configuration not syncing?
```bash
# Check sync status
npm run mcp:status

# Force re-sync
npm run mcp:sync --force
```

### Missing credentials?
```bash
# List required credentials
npm run mcp:credentials

# Validate current credentials
npm run mcp:validate
```

### Starting fresh?
```bash
# Reset to defaults
npm run mcp:reset

# Re-import from cloud
npm run mcp:import
```

## Migration Guide

### Moving to a new computer:

1. On old machine: `npm run mcp:export && npm run mcp:push`
2. On new machine: Clone repo → `./install.sh`
3. Copy `.env` file manually (or recreate from template)
4. Run `npm run mcp:import`
5. Restart Claude Code

## Advanced Usage

### Custom Profiles

Edit `mcp-profiles.json`:
```json
{
  "frontend": ["memory", "filesystem", "github", "netlify", "cloudinary"],
  "backend": ["memory", "filesystem", "github", "railway", "airtable"],
  "content": ["memory", "filesystem", "nano-banana", "firecrawl"]
}
```

Apply custom profile:
```bash
node scripts/mcp-manager.js profile frontend
```

### Environment-Specific Configs

```bash
# Export with environment tag
npm run mcp:export -- --env=work

# Import specific environment
npm run mcp:import -- --env=work
```

## Support

See main documentation:
- [MCP Server Management](../docs/MCP_SERVER_MANAGEMENT.md)
- [MCP Quick Reference](../docs/MCP_QUICK_REFERENCE.md)
