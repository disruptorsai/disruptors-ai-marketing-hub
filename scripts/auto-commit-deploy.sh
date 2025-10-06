#!/bin/bash

# Auto-commit and deploy monitor script
# Commits changes every 15 minutes and verifies Netlify deployment

INTERVAL=900  # 15 minutes in seconds

echo "🤖 Auto-commit and deploy monitor started"
echo "📅 Interval: 15 minutes"
echo "⏰ Started at: $(date)"
echo ""

while true; do
  # Check if there are any changes
  if [[ -n $(git status -s) ]]; then
    echo "📝 Changes detected at $(date)"

    # Stage all changes
    git add -A

    # Create commit with timestamp
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    git commit -m "chore: Auto-commit checkpoint - $TIMESTAMP

Automated commit from auto-deploy script.
Changes saved and pushed to trigger Netlify deployment.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

    # Push to remote
    echo "📤 Pushing to remote..."
    if git push; then
      echo "✅ Push successful at $(date)"

      # Wait a bit for Netlify to start deployment
      sleep 10

      # Check Netlify deployment status
      echo "🔍 Checking Netlify deployment..."
      npx netlify deploys:list 2>/dev/null | head -10

      echo ""
    else
      echo "❌ Push failed at $(date)"
      echo ""
    fi
  else
    echo "✓ No changes to commit at $(date)"
  fi

  # Wait for next interval
  echo "⏳ Waiting 15 minutes until next check..."
  echo "   Next check at: $(date -v +15M '+%Y-%m-%d %H:%M:%S')"
  echo ""
  sleep $INTERVAL
done
