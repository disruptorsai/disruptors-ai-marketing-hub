# Claude Code Setup Guide

## Overview

Claude Code has been successfully installed and integrated into your project. This guide covers the installation, configuration, and usage of Claude Code with your existing MCP (Model Context Protocol) setup.

## Installation Status

✅ **Claude Code v2.0.14** - Installed and ready
✅ **MCP Integration** - Configured with your existing servers
✅ **Package Scripts** - Added to package.json
✅ **Configuration** - Setup complete

## Available Commands

### Basic Commands

```bash
# Start Claude Code with all MCP servers
npm run claude:start

# Start interactive IDE session
npm run claude:interactive

# Chat with Claude Code (non-interactive)
npm run claude:chat

# Show help information
npm run claude:help

# Check version
npm run claude:version

# Check integration status
npm run claude:status
```

### Advanced Commands

```bash
# Setup/update Claude Code integration
npm run claude:setup

# Direct access to Claude Code
npx @anthropic-ai/claude-code --help

# Run with specific MCP configuration
npx @anthropic-ai/claude-code --mcp-config mcp.json

# Start with IDE integration
npx @anthropic-ai/claude-code --ide
```

## Configuration Files

### `.claude-config.json`
- Main configuration file for Claude Code
- Defines MCP server connections
- Sets permission modes and allowed tools

### `mcp-claude.json`
- Claude Code compatible MCP server configuration
- Includes 23 configured servers (Supabase, Netlify, GitHub, etc.)
- Fixed schema issues for Claude Code compatibility
- Excludes URL-based servers (vercel, apify) that aren't supported

## MCP Server Integration

Claude Code is configured to work with your existing MCP servers:

- **Supabase** - Database operations
- **Netlify** - Deployment management
- **GitHub** - Repository operations
- **Firecrawl** - Web scraping
- **Playwright** - Browser automation
- **Cloudinary** - Media management
- **Memory** - Knowledge persistence
- **Filesystem** - File operations
- **And many more...**

## Usage Examples

### 1. Start Interactive Session
```bash
npm run claude:start
```
This will start Claude Code with access to all 23 configured MCP servers and project context.

**Note**: The first time you use MCP servers, Claude Code will request permission for each tool. This is normal security behavior.

### 2. Quick Chat
```bash
npm run claude:chat "Help me understand this codebase structure"
```

### 3. IDE Integration
```bash
npm run claude:interactive
```
This connects Claude Code to your IDE for enhanced code assistance.

### 4. Project-Specific Commands
```bash
# Ask about your database schema
npx @anthropic-ai/claude-code --mcp-config mcp.json "Show me the database schema"

# Get help with deployment
npx @anthropic-ai/claude-code --mcp-config mcp.json "Help me deploy to Netlify"

# Analyze code performance
npx @anthropic-ai/claude-code --mcp-config mcp.json "Review the performance of my React components"
```

## Integration Script

The `scripts/claude-code-integration.js` script provides utilities for:

- Checking installation status
- Setting up configuration
- Managing package.json scripts
- Running Claude Code with project context

## Troubleshooting

### Common Issues

1. **Permission Errors**
   ```bash
   # Use the bypass flag for trusted directories
   npx @anthropic-ai/claude-code --dangerously-skip-permissions
   ```

2. **MCP Server Errors**
   ```bash
   # Enable debug mode to see MCP errors
   npx @anthropic-ai/claude-code --debug
   ```

3. **Version Issues**
   ```bash
   # Update to latest version
   npm install -g @anthropic-ai/claude-code@latest
   ```

### Getting Help

- Run `npm run claude:help` for command-line help
- Check the integration status with `npm run claude:status`
- Review the configuration in `.claude-config.json`

## Security Notes

- Claude Code has access to your project files and MCP servers
- Use `--dangerously-skip-permissions` only in trusted environments
- Review the allowed tools in your configuration
- Be cautious with API keys and sensitive data

## Next Steps

1. **Test the Installation**: Run `npm run claude:start` to begin using Claude Code
2. **Explore MCP Integration**: Ask Claude Code about your project using the available MCP servers
3. **IDE Integration**: Try `npm run claude:interactive` for enhanced IDE features
4. **Customize**: Modify `.claude-config.json` to adjust settings and permissions

## Support

For issues with Claude Code:
- Check the official documentation
- Run `npm run claude:help` for command options
- Use the integration script for status checks

Your Claude Code installation is now ready for use with your comprehensive MCP server setup!
