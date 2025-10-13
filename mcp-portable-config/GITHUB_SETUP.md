# GitHub Cloud Sync Setup Guide

Step-by-step guide to sync your MCP configuration across computers using GitHub.

## Overview

This system allows you to:
- ✅ Backup MCP configuration to GitHub
- ✅ Sync across multiple computers
- ✅ Version control your setup
- ✅ Share with team (without exposing credentials)
- ✅ Easy recovery if machine fails

## Security Notice

**IMPORTANT**: The .env file (with actual credentials) is **NOT** synced to GitHub.
- Only configuration structure is synced
- All API keys remain local to your machine
- .env is in .gitignore (never committed)
- Share .env.template instead (no secrets)

## Setup Steps

### 1. Create Private GitHub Repository

```bash
# On GitHub.com:
1. Go to https://github.com/new
2. Name: mcp-config (or your preferred name)
3. ⚠️ Set to **Private** (important for security)
4. ✅ Initialize with README
5. Click "Create repository"
```

### 2. Export Current Configuration

From your project directory:

```bash
# Export your current MCP setup (strips credentials automatically)
npm run mcp:export

# This creates mcp-portable-config/mcp-config.json
```

### 3. Initialize Git in Portable Config

```bash
cd mcp-portable-config

# Initialize git repo
git init

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/mcp-config.git

# Check .gitignore is working
git status

# You should see:
# ✅ mcp-config.json
# ✅ mcp-profiles.json
# ✅ .env.template
# ✅ install.sh
# ✅ README.md
# ✅ credentials.md
#
# ❌ NOT .env (this should NOT appear)
```

### 4. Initial Push

```bash
# Stage all files
git add .

# Create first commit
git commit -m "Initial MCP configuration"

# Push to GitHub
git push -u origin main
# (or 'master' depending on your default branch)
```

### 5. Verify on GitHub

1. Go to your repository on GitHub
2. Verify these files are present:
   - ✅ mcp-config.json
   - ✅ mcp-profiles.json
   - ✅ .env.template
   - ✅ .gitignore
   - ✅ install.sh
   - ✅ README.md
   - ✅ credentials.md

3. **CRITICAL CHECK**: Verify .env is **NOT** visible
   - If you see .env in the repo: **DELETE REPO IMMEDIATELY**
   - Rotate all API keys
   - Start over with proper .gitignore

## Usage Workflows

### Updating Configuration

When you change MCP servers:

```bash
# 1. Export latest config
npm run mcp:export

# 2. Push to GitHub
npm run mcp:push

# Done! Changes are now in cloud
```

### Setting Up New Computer

On a fresh machine:

```bash
# 1. Clone your config repo
git clone https://github.com/YOUR_USERNAME/mcp-config.git ~/mcp-config

# 2. Run installer
cd ~/mcp-config
./install.sh

# 3. Copy .env from secure location
# Option A: Copy from password manager
# Option B: Copy from old machine via secure method
# Option C: Recreate from .env.template

# 4. Install in Claude Code
npm run mcp:import

# 5. Restart Claude Code
```

### Syncing Between Computers

**Computer A (make changes):**
```bash
npm run mcp:export
npm run mcp:push
```

**Computer B (apply changes):**
```bash
npm run mcp:pull
npm run mcp:import
# Restart Claude Code
```

### Two-Way Sync

If both computers have changes:

```bash
npm run mcp:sync
# This will:
# 1. Export your local changes
# 2. Pull remote changes
# 3. Merge (manual conflict resolution if needed)
# 4. Push combined result
```

## Advanced: Multiple Profiles

Store different configurations for different contexts:

```bash
# Export with profile tag
npm run mcp:export -- --profile=work
npm run mcp:export -- --profile=personal
npm run mcp:export -- --profile=travel

# Import specific profile
npm run mcp:import -- --profile=work
```

## Credential Management

### Secure Credential Sharing (Team)

1. **Never commit .env to git**
2. Use password manager for team sharing:
   - 1Password (teams)
   - LastPass (business)
   - Bitwarden (self-hosted option)

3. Store .env in password manager:
   - Create secure note
   - Paste entire .env contents
   - Share with team members

### Backup .env File

Since .env is never in git, back it up securely:

```bash
# Option 1: Encrypted backup
gpg --symmetric --cipher-algo AES256 .env
# Creates: .env.gpg (upload to secure cloud storage)

# To restore:
gpg --decrypt .env.gpg > .env

# Option 2: Password manager
# Copy entire .env to secure note in 1Password/LastPass

# Option 3: Encrypted USB drive
# Keep physical backup on encrypted drive
```

## Troubleshooting

### .env File Was Accidentally Committed

**IMMEDIATE ACTION REQUIRED:**

```bash
# 1. Delete repository on GitHub immediately
# 2. Rotate ALL API keys in .env
# 3. Update .gitignore to include .env
# 4. Create new repository
# 5. Start over with clean setup
```

### Sync Conflicts

If both machines have changes:

```bash
# Pull latest
npm run mcp:pull

# Review conflicts
git status

# Resolve manually, then:
git add .
git commit -m "Resolve sync conflict"
npm run mcp:push
```

### Lost .env File

Restore from backup:

```bash
# From password manager
# Copy .env contents from secure note

# From encrypted backup
gpg --decrypt .env.gpg > .env

# From another machine
# Use secure transfer (not email!)
```

### GitHub Authentication Issues

```bash
# Use personal access token
# 1. Go to: https://github.com/settings/tokens
# 2. Generate new token (classic)
# 3. Select scopes: repo
# 4. Use token as password when pushing

# Or setup SSH keys
ssh-keygen -t ed25519 -C "your_email@example.com"
# Add key to GitHub: https://github.com/settings/keys
```

## Security Best Practices

### Repository Settings

1. ✅ Keep repository **Private**
2. ✅ Enable branch protection on main/master
3. ✅ Require code review for merges
4. ✅ Enable security alerts
5. ✅ Scan for secrets regularly

### Access Control

1. Only invite trusted team members
2. Use separate repos for different teams
3. Review access permissions quarterly
4. Remove access when team members leave

### Audit Trail

GitHub provides complete history:

```bash
# View all changes
git log --oneline

# View specific file history
git log --follow mcp-config.json

# Compare versions
git diff HEAD~1 mcp-config.json

# Restore old version
git checkout <commit-hash> mcp-config.json
```

## Automation (Advanced)

### Automatic Sync on Changes

Add to ~/.bashrc or ~/.zshrc:

```bash
# Auto-export MCP config on change
alias mcp-save='cd ~/projects/mcp-config && npm run mcp:export && npm run mcp:push && cd -'

# Auto-sync daily
# Add to crontab: crontab -e
0 9 * * * cd ~/mcp-config && npm run mcp:sync
```

### GitHub Actions (Optional)

Create `.github/workflows/validate.yml` in your mcp-config repo:

```yaml
name: Validate MCP Config

on: [push]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Validate JSON
        run: |
          jq empty mcp-config.json
          jq empty mcp-profiles.json
      - name: Check for secrets
        run: |
          ! grep -r "sk-" .
          ! grep -r "ghp_" .
```

## Related Documentation

- [README.md](./README.md) - Main documentation
- [credentials.md](./credentials.md) - Where to get API keys
- [.env.template](./.env.template) - Credential template

## Need Help?

- GitHub Docs: https://docs.github.com/
- Git Basics: https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control
- Security Issues: Rotate all keys immediately, then contact team
