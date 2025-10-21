# Claude Code Documentation Sentinel - Scheduler Setup

## Overview

This document explains how to set up automated scheduled checks for the Claude Code Documentation Sentinel across all your repositories.

## Scheduling Options

### Option 1: Manual Invocation (Recommended for Testing)

**Daily Check**:
```bash
# Run from any repository
claude "Run the claude-code-documentation-sentinel agent for a daily health check"
```

**Weekly Audit**:
```bash
claude "Run the claude-code-documentation-sentinel agent for a comprehensive weekly audit"
```

**Monthly Deep Dive**:
```bash
claude "Run the claude-code-documentation-sentinel agent for a monthly deep dive analysis"
```

### Option 2: Git Hooks (Project-Level)

Create `.git/hooks/post-commit` to run checks after commits:

```bash
#!/bin/bash
# Post-commit hook for Claude Code health monitoring

# Only run on specific branches
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" == "main" || "$BRANCH" == "master" ]]; then
  echo "Running Claude Code health check..."
  # This would require Claude CLI integration
fi
```

### Option 3: GitHub Actions (Repository-Level)

Create `.github/workflows/claude-code-health.yml`:

```yaml
name: Claude Code Health Check

on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM
    - cron: '0 10 * * 1' # Weekly on Monday at 10 AM
  workflow_dispatch:      # Manual trigger

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Claude Code Sentinel
        run: |
          # Integration with Claude Code CLI
          echo "Health check triggered"
          # Generate report

      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: claude-code-health-report
          path: temp/claude-code-health/*.md
```

### Option 4: Cron Jobs (System-Level - Linux/Mac)

**Edit crontab**:
```bash
crontab -e
```

**Add scheduled tasks**:
```cron
# Daily check at 9 AM
0 9 * * * cd ~/projects/disruptors-ai-marketing-hub && /usr/local/bin/claude "Run claude-code-documentation-sentinel daily check" >> ~/claude-sentinel.log 2>&1

# Weekly audit on Monday at 10 AM
0 10 * * 1 cd ~/projects/disruptors-ai-marketing-hub && /usr/local/bin/claude "Run claude-code-documentation-sentinel weekly audit" >> ~/claude-sentinel.log 2>&1

# Monthly deep dive on 1st at 11 AM
0 11 1 * * cd ~/projects/disruptors-ai-marketing-hub && /usr/local/bin/claude "Run claude-code-documentation-sentinel monthly deep dive" >> ~/claude-sentinel.log 2>&1
```

### Option 5: Windows Task Scheduler (System-Level - Windows)

**Create scheduled tasks**:

1. Open Task Scheduler
2. Create New Task
3. Set trigger (daily/weekly/monthly)
4. Set action:
   - Program: `cmd.exe`
   - Arguments: `/c cd C:\path\to\repo && claude "Run claude-code-documentation-sentinel daily check"`

**PowerShell Script** (save as `run-sentinel.ps1`):
```powershell
# Claude Code Sentinel - Automated Health Check
$repos = @(
    "C:\Users\Will\OneDrive\Documents\Projects\dm4\disruptors-ai-marketing-hub",
    "C:\path\to\other\repo"
)

foreach ($repo in $repos) {
    Write-Host "Checking $repo..."
    Set-Location $repo
    & claude "Run claude-code-documentation-sentinel daily check"
}
```

**Schedule with Task Scheduler**:
- Daily: 9:00 AM
- Weekly: Monday 10:00 AM
- Monthly: 1st day, 11:00 AM

### Option 6: npm Scripts (Recommended for Development)

Add to `package.json`:

```json
{
  "scripts": {
    "sentinel:daily": "echo 'Running daily health check...' && node -e \"console.log('Use Claude Code to invoke sentinel agent')\"",
    "sentinel:weekly": "echo 'Running weekly audit...'",
    "sentinel:monthly": "echo 'Running monthly deep dive...'",
    "sentinel:now": "echo 'Running immediate health check...'"
  }
}
```

Then run manually:
```bash
npm run sentinel:daily
npm run sentinel:weekly
npm run sentinel:monthly
```

## Global vs. Project-Level

### Global Configuration (Recommended)

The sentinel agent is configured globally and can monitor all repositories:

**Location**: `~/.claude/sentinel-config.json` (user home directory)

**Repositories**: Add new repos in config:
```json
{
  "repositories": {
    "disruptors-ai-marketing-hub": {
      "enabled": true,
      "priority": "high"
    },
    "other-project": {
      "enabled": true,
      "priority": "medium"
    }
  }
}
```

### Project-Level Override

Each project can have `.claude/sentinel-config.json` to override global settings.

## Manual Trigger Workflow

### Quick Health Check
```bash
# From project root
claude "Run a quick Claude Code health check using the sentinel agent"
```

### Full Audit with Report
```bash
claude "Run the claude-code-documentation-sentinel agent and generate a comprehensive health report"
```

### Check Specific Aspect
```bash
# Tool usage audit
claude "Run sentinel agent to audit tool usage patterns only"

# Cost optimization analysis
claude "Run sentinel agent to analyze cost optimization opportunities"

# Security audit
claude "Run sentinel agent for security compliance check"
```

## Automated Reporting

### Report Locations
- **Daily**: `temp/claude-code-health/YYYY-MM-DD.md`
- **Weekly**: `docs/claude-code/weekly-audit-YYYY-MM-DD.md`
- **Monthly**: `docs/claude-code/capabilities-YYYY-MM.md`

### Notification Setup

**Slack Integration** (edit `.claude/sentinel-config.json`):
```json
{
  "notifications": {
    "webhooks": {
      "slack": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
    }
  }
}
```

**Email Notifications**:
```json
{
  "notifications": {
    "email": {
      "enabled": true,
      "recipients": ["team@example.com"],
      "digest_frequency": "weekly"
    }
  }
}
```

## Monitoring the Sentinel

### Check Last Run
```bash
# View latest daily report
cat temp/claude-code-health/$(ls -t temp/claude-code-health/ | head -1)

# View all reports
ls -lh temp/claude-code-health/

# Weekly audits
ls -lh docs/claude-code/weekly-audit-*.md
```

### Verify Configuration
```bash
# Check config
cat .claude/sentinel-config.json

# Validate JSON
node -e "console.log(JSON.parse(require('fs').readFileSync('.claude/sentinel-config.json')))"
```

## Troubleshooting

### Sentinel Not Running
1. Check configuration: `.claude/sentinel-config.json`
2. Verify `enabled: true`
3. Check schedule times match your timezone
4. Review logs: `temp/sentinel-debug.log`

### Missing Reports
1. Check `temp/claude-code-health/` directory exists
2. Verify write permissions
3. Check debug log for errors

### Outdated Data
1. Manually trigger: `claude "Run sentinel health check"`
2. Check internet connectivity (fetches docs.claude.com)
3. Clear cache: Delete `.claude/documentation-sentinel/cache/`

## Best Practices

1. **Start Manual**: Run manually for first week to verify behavior
2. **Review Reports**: Check daily reports regularly
3. **Act on Recommendations**: Prioritize high-impact items
4. **Keep Config Updated**: Add new repos to global config
5. **Monitor Trends**: Track health score over time

## Next Steps

1. ✅ Review baseline health report: `temp/claude-code-health/2025-10-21.md`
2. ✅ Choose scheduling method (manual, cron, or GitHub Actions)
3. ✅ Set up notifications (Slack/email)
4. ✅ Run weekly for first month to establish patterns
5. ✅ Automate after confidence established

## Quick Reference

**Daily Check**: `claude "Run sentinel daily check"`
**Weekly Audit**: `claude "Run sentinel weekly audit"`
**Monthly Deep Dive**: `claude "Run sentinel monthly deep dive"`
**View Latest Report**: `cat temp/claude-code-health/$(ls -t temp/claude-code-health/ | head -1)`

---

**Global Config**: `.claude/sentinel-config.json`
**Agent Description**: `.claude/agents/claude-code-documentation-sentinel.md`
**Reports**: `temp/claude-code-health/` and `docs/claude-code/`
