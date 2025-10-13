# MCP Server Management - Quick Reference

Quick command cheat sheet for managing 22 MCP servers.

## Commands

| Command | Description |
|---------|-------------|
| `npm run mcp:list` | List all servers with status |
| `npm run mcp:toggle` | Show current configuration |
| `npm run mcp:profile:minimal` | Switch to minimal (3 servers) |
| `npm run mcp:profile:dev` | Switch to dev (7 servers) |
| `npm run mcp:profile:full` | Switch to full (22 servers) |
| `npm run mcp:enable -- <servers>` | Enable specific servers |
| `npm run mcp:disable -- <servers>` | Disable specific servers |
| `/mcp` (in Claude Code) | Interactive management |

## Profiles

### Minimal (3 servers)
```bash
npm run mcp:profile:minimal
```
**Servers:** memory, filesystem, sequential-thinking

### Dev (7 servers)
```bash
npm run mcp:profile:dev
```
**Servers:** + github, netlify, vercel, digitalocean

### Full (22 servers)
```bash
npm run mcp:profile:full
```
**Servers:** All enabled

## Server Categories

### Core (3)
`memory` `filesystem` `sequential-thinking`

### Development (7)
`github` `netlify` `vercel` `digitalocean` `railway` `figma-developer` `cursor-talk-to-figma`

### Web & Content (5)
`firecrawl` `fetch` `puppeteer` `dataforseo` `nano-banana`

### Integrations (7)
`cloudinary` `replicate` `airtable` `n8n-mcp` `gohighlevel` `apify-modern` `MCP_DOCKER`

## Examples

```bash
# Check what's running
npm run mcp:toggle

# Start lean
npm run mcp:profile:minimal

# Add GitHub integration
npm run mcp:enable -- github

# Remove unused servers
npm run mcp:disable -- puppeteer airtable railway

# Full power
npm run mcp:profile:full
```

## Configuration Files

- **MCP Config:** `~/.cursor/mcp.json`
- **Backup:** `~/.cursor/mcp.json.backup`
- **Profiles:** `scripts/mcp-profiles.json`
- **Manager:** `scripts/mcp-manager.js`

## Troubleshooting

### Restore backup
```bash
cp ~/.cursor/mcp.json.backup ~/.cursor/mcp.json
```

### Check status
```bash
npm run mcp:toggle
```

### Reset to full
```bash
npm run mcp:profile:full
```

---

See [MCP_SERVER_MANAGEMENT.md](./MCP_SERVER_MANAGEMENT.md) for complete documentation.
