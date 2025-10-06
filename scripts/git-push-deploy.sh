#!/bin/bash

# Git push wrapper that automatically triggers Netlify deployment
# Usage: ./scripts/git-push-deploy.sh [git push arguments]

echo "🚀 Git Push + Netlify Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Execute git push with all provided arguments
echo "📤 Pushing to remote..."
if git push "$@"; then
  echo "✅ Git push successful"

  # Check if we're on master branch
  BRANCH=$(git rev-parse --abbrev-ref HEAD)

  if [ "$BRANCH" = "master" ]; then
    echo ""
    echo "🔧 Triggering Netlify deployment..."

    # Trigger Netlify build hook
    RESPONSE=$(curl -s -X POST -w "\n%{http_code}" https://api.netlify.com/build_hooks/68e32c4e3bf38e7ffb682234)
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
      echo "✅ Netlify deployment triggered successfully"
      echo ""
      echo "📊 Monitor deployment:"
      echo "   https://app.netlify.com/sites/cheerful-custard-2e6fc5/deploys"
      echo ""
      echo "🌐 Live site:"
      echo "   https://dm4.wjwelsh.com"
    else
      echo "⚠️  Warning: Netlify build hook returned HTTP $HTTP_CODE"
      echo "   Deployment may not have triggered"
    fi
  else
    echo "ℹ️  Skipping Netlify deploy (not on master branch)"
  fi
else
  echo "❌ Git push failed"
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
