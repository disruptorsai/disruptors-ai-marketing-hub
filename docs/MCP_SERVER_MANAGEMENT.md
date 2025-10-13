# MCP Server Management System

Complete guide to managing your 22 MCP (Model Context Protocol) servers with profiles, toggles, and categories.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Server Profiles](#server-profiles)
- [Available Servers](#available-servers)
- [Command Reference](#command-reference)
- [Slash Command](#slash-command)

## Overview

The MCP Server Management System provides centralized control over all 22 MCP servers configured in your environment.

## Quick Start

### Using npm Scripts

```bash
# List all servers and their status
npm run mcp:list

# Switch to minimal profile (3 servers)
npm run mcp:profile:minimal

# Switch to dev profile (7 servers)
npm run mcp:profile:dev

# Switch to full profile (22 servers)
npm run mcp:profile:full

# Show current status
npm run mcp:toggle

# Enable specific servers
npm run mcp:enable -- github netlify cloudinary

# Disable specific servers
npm run mcp:disable -- puppeteer dataforseo
```

### Using Slash Command in Claude Code

Simply type `/mcp` in your Claude Code session and follow the interactive prompts.

## Server Profiles

### Minimal (3 servers)
- **Purpose:** Essential MCP functionality only
- **Servers:** memory, filesystem, sequential-thinking

### Dev (7 servers)
- **Purpose:** Development-focused workflow  
- **Servers:** memory, filesystem, sequential-thinking, github, netlify, vercel, digitalocean

### Full (22 servers)
- **Purpose:** Complete MCP ecosystem
- **Servers:** All 22 servers enabled

## Available Servers

### Core Services (3)
- memory, filesystem, sequential-thinking

### Development Tools (7)
- github, netlify, vercel, digitalocean, railway, figma-developer, cursor-talk-to-figma

### Web & Content (5)
- firecrawl, fetch, puppeteer, dataforseo, nano-banana

### Integrations & APIs (7)
- cloudinary, replicate, airtable, n8n-mcp, gohighlevel, apify-modern, MCP_DOCKER

## See Also

- [MCP Quick Reference](./MCP_QUICK_REFERENCE.md) - Quick command cheat sheet
- [MCP Ecosystem](./integrations/MCP_ECOSYSTEM.md) - Full MCP server documentation
