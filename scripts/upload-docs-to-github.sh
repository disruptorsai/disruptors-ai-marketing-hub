#!/bin/bash

# Upload documentation files directly to remote seoverhaul branch
# Bypasses local git corruption

REPO="TechIntegrationLabs/disruptors-ai-marketing-hub"
BRANCH="seoverhaul"

echo "=== Uploading Documentation to $BRANCH ==="

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

# Upload documentation files
upload_file \
  "BLOG_SYSTEM_READINESS_REPORT.md" \
  "docs: Add blog system deployment checklist and readiness status"

upload_file \
  "MERGE_VERIFICATION_REPORT.md" \
  "docs: Add merge verification report for seoverhaul branch"

upload_file \
  "scripts/check-blog-db-status.mjs" \
  "feat: Add database verification script for blog automation"

upload_file \
  "scripts/push-missing-files.sh" \
  "feat: Add GitHub API upload script for missing files"

echo "=== Upload Complete ==="
echo "Verify at: https://github.com/$REPO/tree/$BRANCH"
