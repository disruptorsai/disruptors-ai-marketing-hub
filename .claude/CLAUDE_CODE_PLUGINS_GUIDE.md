# Claude Code Plugins - Complete Guide

**Last Updated**: 2025-10-21
**Claude Code Version**: 2.0+
**Plugin Support**: Public Beta (October 2025)

---

## What are Claude Code Plugins?

Plugins are **installable collections** that can include:
- **Slash commands**: Custom commands like `/deploy` or `/audit`
- **Subagents**: Specialized AI agents for specific tasks
- **MCP servers**: Tool integrations and data sources
- **Hooks**: Automated behaviors triggered by events

**Why they matter**: Share workflows, automate repetitive tasks, and customize Claude Code for your team's needs.

---

## Quick Start: Installing Plugins

### Method 1: Via Plugin Marketplace (Recommended)

```bash
# Step 1: Add a marketplace (one-time)
/plugin marketplace add anthropics/plugin-marketplace

# Step 2: Browse available plugins
/plugin

# Step 3: Select plugin to install
# Follow on-screen prompts

# Step 4: Restart Claude Code
# Required for plugins to take effect
```

### Method 2: Direct Installation (Git Repo)

```bash
# Install from any git repository
/plugin install https://github.com/user/repo-name

# Or use shorthand for GitHub repos
/plugin install user/repo-name

# Restart Claude Code
```

### Method 3: Local Development Plugin

```bash
# Install from local directory
/plugin install /path/to/my-plugin

# Useful for testing plugins you're developing
```

---

## Popular Plugin Marketplaces

### Official Anthropic Marketplace
```bash
/plugin marketplace add anthropics/plugin-marketplace
```

### Community Plugin Hub (227+ plugins)
```bash
/plugin marketplace add jeremylongshore/claude-code-plugins-plus
```
**Includes**: Skills Powerkit (first Agent Skills plugin)

### Composio Workflow Plugins
```bash
/plugin marketplace add composio/claude-code-plugins
```
**Focus**: Coding workflow improvements

---

## Creating Your Own Plugin

### Basic Plugin Structure

```
my-awesome-plugin/
├── .claude-plugin/
│   ├── plugin.json          # Required: Plugin metadata
│   └── marketplace.json     # Optional: For marketplaces
├── commands/                 # Optional: Slash commands
│   ├── deploy.md
│   ├── audit.md
│   └── optimize.md
├── agents/                   # Optional: Subagents
│   └── deployment-validator.md
├── mcp.json                  # Optional: MCP server configs
├── hooks/                    # Optional: Event hooks
│   ├── pre-commit.sh
│   └── post-deploy.js
└── README.md                 # Recommended: Usage docs
```

### Step 1: Create plugin.json

**File**: `.claude-plugin/plugin.json`

```json
{
  "name": "disruptors-deployment-toolkit",
  "description": "Automated deployment validation and rollback for Disruptors AI",
  "version": "1.0.0",
  "author": "Disruptors AI Team",
  "homepage": "https://github.com/disruptors-ai/claude-plugin-deployment",
  "license": "MIT",
  "keywords": ["deployment", "validation", "netlify", "supabase"],
  "claudeVersion": ">=2.0.0",
  "dependencies": {
    "mcp-servers": ["supabase-mcp", "netlify-mcp"]
  }
}
```

**Required Fields**:
- `name`: Unique plugin identifier (lowercase, hyphens)
- `description`: One-line summary
- `version`: Semantic versioning (1.0.0)
- `author`: Your name or organization

**Optional Fields**:
- `homepage`: Git repository or documentation URL
- `license`: MIT, Apache-2.0, etc.
- `keywords`: For searchability in marketplaces
- `claudeVersion`: Minimum Claude Code version required
- `dependencies`: Required MCP servers or other plugins

### Step 2: Create Slash Commands

**File**: `commands/deploy-validate.md`

```markdown
---
description: Validate deployment before pushing to production
usage: /deploy-validate [site-id]
aliases: [deploy-check, validate-deploy]
---

# Deployment Validation Command

Runs comprehensive validation checks before deployment.

## What Claude Should Do:

1. **Check Environment**:
   - Verify all required environment variables are set
   - Check `.env` file exists and has correct structure
   - Validate API keys are not expired

2. **Run Tests**:
   - Execute `npm run lint`
   - Run `npm run build` to ensure no build errors
   - Check for TypeScript errors

3. **Validate Configuration**:
   - Ensure `netlify.toml` is properly configured
   - Check Supabase migrations are up to date
   - Verify MCP servers are correctly configured

4. **Security Checks**:
   - Scan for exposed credentials in code
   - Check that `.env` is in `.gitignore`
   - Validate RLS policies on database

5. **Generate Report**:
   - Create validation report in `temp/deployment-validation-YYYY-MM-DD.md`
   - List all passed/failed checks
   - Provide remediation steps for failures

## Example Usage:

```bash
# Validate dev deployment
/deploy-validate dev

# Validate production deployment
/deploy-validate prod
```

## Expected Output:

```
✅ Environment variables: 12/12 set
✅ Linting: 0 errors
✅ Build: Success
✅ Security: No exposed credentials
⚠️  Migrations: 1 pending migration detected

Recommendation: Apply migration before deploying
Command: npm run db:migrate
```
```

### Step 3: Create Subagents (Optional)

**File**: `agents/cost-optimizer.md`

```markdown
---
name: cost-optimizer
description: Scans codebase for opportunities to migrate from Sonnet to Haiku
triggers:
  - "analyze costs"
  - "optimize spending"
  - "cost optimization"
---

# Cost Optimizer Agent

Use this agent when you need to identify cost optimization opportunities in AI model usage.

## Capabilities

This agent analyzes your codebase to find:
1. Files using Claude Sonnet 4.5 that could use Haiku 4.5
2. Test data generation scripts
3. Simple CRUD operations
4. Formatting and validation tasks
5. Structured data operations

## Analysis Process

The agent will:
1. **Scan for Model Usage**: Find all files using `claude-3-5-sonnet` or `claude-sonnet-4`
2. **Categorize Operations**: Classify tasks as content generation, logic, or data processing
3. **Identify Candidates**: Find operations where 90% quality is acceptable
4. **Calculate Savings**: Estimate monthly cost reduction
5. **Generate Migration Plan**: Provide step-by-step migration instructions

## Output Deliverables

- **Cost Analysis Report**: `temp/cost-optimization-YYYY-MM-DD.md`
- **Migration Candidates**: List of files with savings estimates
- **Testing Strategy**: How to validate Haiku quality
- **Implementation Guide**: Code changes needed

## Example Invocation

```bash
# Analyze entire codebase
claude "Use the cost-optimizer agent to find savings opportunities"

# Analyze specific directory
claude "Use cost-optimizer agent on the scripts/ directory"
```

## Success Metrics

- Files identified for migration
- Estimated monthly savings ($)
- Quality threshold maintained (90%+)
- Implementation time required
```

### Step 4: Add MCP Servers (Optional)

**File**: `mcp.json`

```json
{
  "mcpServers": {
    "deployment-validator": {
      "command": "npx",
      "args": ["-y", "deployment-validator-mcp"],
      "env": {
        "NETLIFY_AUTH_TOKEN": "${NETLIFY_AUTH_TOKEN}",
        "SUPABASE_URL": "${VITE_SUPABASE_URL}"
      }
    },
    "cost-analyzer": {
      "command": "node",
      "args": ["./mcp-servers/cost-analyzer.js"],
      "env": {
        "ANTHROPIC_API_KEY": "${VITE_ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

### Step 5: Create Hooks (Optional)

**File**: `hooks/pre-commit.sh`

```bash
#!/bin/bash
# Pre-commit hook for deployment validation

echo "🔍 Running deployment validation..."

# Check for exposed credentials
if grep -r "eyJhbGci" docs/ 2>/dev/null; then
    echo "❌ CRITICAL: Exposed JWT token found in documentation"
    echo "   Please replace with placeholders before committing"
    exit 1
fi

# Check for .env in tracked files
if git diff --cached --name-only | grep -q ".env$"; then
    echo "❌ CRITICAL: Attempting to commit .env file"
    echo "   This file should be in .gitignore"
    exit 1
fi

# Run linter
if ! npm run lint; then
    echo "❌ Linting failed - fix errors before committing"
    exit 1
fi

echo "✅ All pre-commit checks passed"
exit 0
```

Make executable:
```bash
chmod +x hooks/pre-commit.sh
```

---

## Publishing Your Plugin

### Option 1: GitHub Repository

```bash
# 1. Create GitHub repo
git init
git add .
git commit -m "Initial plugin release"
git remote add origin https://github.com/your-username/your-plugin
git push -u origin main

# 2. Create release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 3. Share with others
# Users can install with:
# /plugin install your-username/your-plugin
```

### Option 2: Create a Marketplace

**File**: `.claude-plugin/marketplace.json`

```json
{
  "name": "Disruptors AI Toolkit Marketplace",
  "description": "Official plugins for Disruptors AI workflows",
  "homepage": "https://github.com/disruptors-ai/claude-plugins",
  "plugins": [
    {
      "name": "deployment-validator",
      "description": "Automated deployment validation",
      "repository": "https://github.com/disruptors-ai/plugin-deployment",
      "version": "1.0.0",
      "author": "Disruptors AI",
      "keywords": ["deployment", "validation"]
    },
    {
      "name": "cost-optimizer",
      "description": "AI model cost optimization scanner",
      "repository": "https://github.com/disruptors-ai/plugin-cost-optimizer",
      "version": "1.2.0",
      "author": "Disruptors AI",
      "keywords": ["cost", "optimization", "haiku"]
    }
  ]
}
```

Users add your marketplace:
```bash
/plugin marketplace add disruptors-ai/claude-plugins
```

---

## Plugin Ideas for Disruptors AI

### 1. Deployment Toolkit Plugin

**Commands**:
- `/deploy-validate` - Pre-deployment validation
- `/deploy-rollback <id>` - Quick rollback to previous deployment
- `/deploy-health` - Check deployment health

**Agents**:
- `deployment-validator` - Comprehensive deployment checks
- `rollback-orchestrator` - Safe rollback procedures

**Value**: Save 15-20 minutes per deployment

### 2. Database Migration Helper

**Commands**:
- `/migrate-preview` - Preview migration before applying
- `/migrate-rollback` - Rollback last migration
- `/migrate-validate` - Check migration safety

**Agents**:
- `migration-analyzer` - Analyze migration impact
- `schema-validator` - Validate schema changes

**Value**: Reduce migration errors by 80%

### 3. Cost Optimization Scanner

**Commands**:
- `/cost-analyze` - Scan for cost optimization opportunities
- `/haiku-test <file>` - Test file with Haiku 4.5
- `/cost-report` - Generate cost optimization report

**Agents**:
- `cost-optimizer` - Find Haiku migration candidates
- `quality-validator` - Ensure Haiku quality meets standards

**Value**: $35-50/month savings

### 4. Security Audit Plugin

**Commands**:
- `/security-scan` - Scan for exposed credentials
- `/rls-validate` - Check Supabase RLS policies
- `/env-check` - Validate environment variables

**Hooks**:
- `pre-commit` - Block commits with exposed secrets
- `pre-push` - Run security scan before push

**Value**: Prevent security incidents

### 5. MCP Health Monitor

**Commands**:
- `/mcp-health` - Check all MCP server health
- `/mcp-optimize` - Optimize MCP configuration
- `/mcp-debug <server>` - Debug MCP server issues

**Agents**:
- `mcp-orchestrator` - Manage MCP servers
- `mcp-optimizer` - Optimize context window usage

**Value**: Improve Claude Code performance

---

## Plugin Best Practices

### 1. Clear Documentation
- Include README.md with usage examples
- Document all slash commands
- Provide troubleshooting guide
- Include changelog for version updates

### 2. Error Handling
- Provide clear error messages
- Include remediation steps
- Graceful degradation when dependencies missing
- Validate inputs before execution

### 3. Security
- Never hardcode credentials
- Use environment variables
- Validate permissions before destructive operations
- Scan for secrets in hooks

### 4. Performance
- Keep commands fast (< 5 seconds)
- Use caching where appropriate
- Minimize context window usage
- Parallel execution for independent operations

### 5. Versioning
- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Document breaking changes
- Provide migration guides
- Test with multiple Claude Code versions

---

## Troubleshooting

### Plugin Not Loading

**Issue**: Installed plugin doesn't appear in `/plugin` menu

**Solutions**:
1. Restart Claude Code (required after installation)
2. Check `~/.claude/plugins/` directory exists
3. Verify `plugin.json` is valid JSON
4. Check Claude Code version meets `claudeVersion` requirement

### Slash Command Not Working

**Issue**: `/mycommand` returns "command not found"

**Solutions**:
1. Verify command file exists in `commands/` directory
2. Check markdown frontmatter has `description` field
3. Ensure command file name matches command (e.g., `deploy.md` for `/deploy`)
4. Restart Claude Code after adding new commands

### MCP Server Fails to Start

**Issue**: Plugin's MCP server shows error in `/mcp` menu

**Solutions**:
1. Check environment variables are set correctly
2. Verify `mcp.json` command path is correct
3. Test MCP server independently: `npx server-name`
4. Check Claude Code logs: `~/.claude/logs/`

### Agent Not Triggering

**Issue**: Subagent doesn't activate on trigger keywords

**Solutions**:
1. Verify agent file in `agents/` directory
2. Check frontmatter `triggers` array
3. Use exact trigger phrases from documentation
4. Restart Claude Code to reload agent definitions

---

## Advanced: Plugin Development Workflow

### 1. Local Development

```bash
# Create plugin directory
mkdir -p ~/.claude/plugins/my-plugin
cd ~/.claude/plugins/my-plugin

# Initialize plugin structure
mkdir -p .claude-plugin commands agents hooks
touch .claude-plugin/plugin.json
touch commands/example.md
touch README.md

# Install locally
/plugin install ~/.claude/plugins/my-plugin

# Test changes
# (edit files)
# Restart Claude Code to reload
```

### 2. Testing

```bash
# Test slash command
/example-command

# Test agent
claude "trigger the example agent"

# Test hook
git commit -m "test"

# Check logs
tail -f ~/.claude/logs/plugin-my-plugin.log
```

### 3. Publishing Workflow

```bash
# 1. Update version
# Edit .claude-plugin/plugin.json

# 2. Update changelog
# Edit CHANGELOG.md

# 3. Git commit and tag
git add .
git commit -m "Release v1.1.0"
git tag v1.1.0
git push origin main --tags

# 4. Notify users
# Update marketplace.json if applicable
```

---

## Resources

**Official Documentation**:
- Plugin Docs: https://docs.claude.com/en/docs/claude-code/plugins
- Plugin Announcement: https://www.anthropic.com/news/claude-code-plugins
- MCP Protocol: https://modelcontextprotocol.io

**Community**:
- Plugin Hub: https://github.com/jeremylongshore/claude-code-plugins-plus
- Examples: Browse `/plugin marketplace add anthropics/plugin-marketplace`
- Forum: https://github.com/anthropics/claude-code/discussions

**Tools**:
- Plugin Template: https://github.com/anthropics/claude-plugin-template
- Marketplace Builder: https://github.com/anthropics/plugin-marketplace-template
- Testing Framework: Coming soon

---

## Next Steps

1. **Explore existing plugins**: `/plugin marketplace add anthropics/plugin-marketplace`
2. **Create your first plugin**: Start with a simple slash command
3. **Share with team**: Publish to GitHub for team collaboration
4. **Build automation**: Create plugins for repetitive workflows
5. **Contribute to community**: Share your plugins in marketplaces

**Happy plugin development!** 🚀
