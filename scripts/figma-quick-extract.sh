#!/bin/bash

# Figma Quick Extract Helper
# Simplified wrapper for extract-figma-rest-api.js

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
EXTRACTOR="$SCRIPT_DIR/extract-figma-rest-api.js"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎨 Figma Quick Extract${NC}"
echo "======================================"
echo ""

# Check if file key provided
if [ -z "$1" ]; then
  echo -e "${YELLOW}Usage:${NC}"
  echo "  ./scripts/figma-quick-extract.sh <file-key-or-url> [node-ids]"
  echo ""
  echo -e "${YELLOW}Examples:${NC}"
  echo "  ./scripts/figma-quick-extract.sh abc123def456"
  echo "  ./scripts/figma-quick-extract.sh https://www.figma.com/file/abc123/Design"
  echo "  ./scripts/figma-quick-extract.sh abc123def456 1:2,1:3"
  echo ""
  echo -e "${YELLOW}Recent extractions:${NC}"
  ls -1t "$PROJECT_ROOT/public/figma-imports/"*.json 2>/dev/null | head -5 || echo "  (none yet)"
  echo ""
  exit 0
fi

# Check for API key
if [ -z "$FIGMA_API_KEY" ]; then
  if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | grep FIGMA_API_KEY | xargs)
  fi
fi

if [ -z "$FIGMA_API_KEY" ]; then
  echo -e "${RED}❌ Error: FIGMA_API_KEY not found${NC}"
  echo "Please set FIGMA_API_KEY in your .env file"
  exit 1
fi

# Run extraction
echo -e "${BLUE}Running extraction...${NC}"
echo ""

cd "$PROJECT_ROOT"
node "$EXTRACTOR" "$@"

# Show recent files
echo ""
echo -e "${GREEN}📁 Recent extractions:${NC}"
ls -1t "$PROJECT_ROOT/public/figma-imports/"*.json 2>/dev/null | head -3 | while read file; do
  echo -e "  ${BLUE}→${NC} $(basename "$file")"
done

echo ""
echo -e "${GREEN}✨ Done!${NC}"
