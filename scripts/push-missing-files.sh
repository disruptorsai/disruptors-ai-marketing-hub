#!/bin/bash

# Push missing blog automation files to remote seoverhaul branch
# This script uploads files that were not pushed by the MCP agent

REPO="TechIntegrationLabs/disruptors-ai-marketing-hub"
BRANCH="seoverhaul"

echo "=== Pushing Missing Blog Automation Files to $BRANCH ==="

# Function to upload a file
upload_file() {
  local file_path="$1"
  local commit_msg="$2"

  echo "Uploading: $file_path"

  # Encode file to base64
  local content=$(base64 -i "$file_path")

  # Upload via GitHub API
  gh api repos/$REPO/contents/$file_path \
    --method PUT \
    -f message="$commit_msg" \
    -f content="$content" \
    -f branch="$BRANCH" \
    --jq '.content.name' 2>&1

  if [ $? -eq 0 ]; then
    echo "✅ $file_path uploaded successfully"
  else
    echo "❌ Failed to upload $file_path"
  fi

  echo ""
}

# Upload missing Netlify functions
upload_file \
  "netlify/functions/admin-blog-generator.js" \
  "feat: Add admin-blog-generator for batch blog generation"

upload_file \
  "netlify/functions/admin-blog-scheduler.js" \
  "feat: Add admin-blog-scheduler for automated publishing"

upload_file \
  "netlify/functions/admin-image-generator.js" \
  "feat: Add admin-image-generator for AI image generation"

# Upload missing migration
upload_file \
  "supabase/migrations/20250119_enhanced_blog_system.sql" \
  "feat: Add enhanced blog system database migration"

echo "=== Upload Complete ==="
echo "Verify at: https://github.com/$REPO/tree/$BRANCH"
