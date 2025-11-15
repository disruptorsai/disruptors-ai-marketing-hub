#!/bin/bash

echo "🔑 GitHub Multi-Account Setup for Mac"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check for existing keys
echo -e "${BLUE}Step 1: Checking existing SSH keys...${NC}"
if [ -f ~/.ssh/id_ed25519_github ]; then
  echo -e "${GREEN}✅ Found: ~/.ssh/id_ed25519_github (TechIntegrationLabs)${NC}"
else
  echo -e "${YELLOW}⚠️  TechIntegrationLabs key not found${NC}"
fi

if [ -f ~/.ssh/id_ed25519_disruptorsai ]; then
  echo -e "${GREEN}✅ Found: ~/.ssh/id_ed25519_disruptorsai${NC}"
else
  echo -e "${YELLOW}⚠️  disruptorsai key not found - will create${NC}"
fi

echo ""

# Step 2: Create disruptorsai key if it doesn't exist
if [ ! -f ~/.ssh/id_ed25519_disruptorsai ]; then
  echo -e "${BLUE}Step 2: Creating SSH key for disruptorsai account...${NC}"
  read -p "Enter email for disruptorsai GitHub account: " disruptorsai_email
  ssh-keygen -t ed25519 -C "$disruptorsai_email" -f ~/.ssh/id_ed25519_disruptorsai -N ""
  echo -e "${GREEN}✅ Created: ~/.ssh/id_ed25519_disruptorsai${NC}"
  echo ""
else
  echo -e "${BLUE}Step 2: disruptorsai key already exists - skipping${NC}"
  echo ""
fi

# Step 3: Update SSH config
echo -e "${BLUE}Step 3: Updating SSH config...${NC}"

# Backup existing config
if [ -f ~/.ssh/config ]; then
  cp ~/.ssh/config ~/.ssh/config.backup
  echo -e "${GREEN}✅ Backed up existing config to ~/.ssh/config.backup${NC}"
fi

# Create new SSH config
cat > ~/.ssh/config << 'EOF'
# ============================================
# GitHub Multi-Account SSH Configuration
# ============================================

# TechIntegrationLabs Account (Primary)
Host github-techintegration
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github
  IdentitiesOnly yes
  AddKeysToAgent yes

# disruptorsai Account
Host github-disruptorsai
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_disruptorsai
  IdentitiesOnly yes
  AddKeysToAgent yes

# Default fallback to TechIntegrationLabs
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github
  IdentitiesOnly yes
  AddKeysToAgent yes

# ============================================
# Other SSH Hosts (if any)
# ============================================
EOF

echo -e "${GREEN}✅ SSH config updated${NC}"
echo ""

# Step 4: Set correct permissions
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/id_ed25519_* 2>/dev/null
chmod 644 ~/.ssh/id_ed25519_*.pub 2>/dev/null

echo -e "${BLUE}Step 4: Setting correct file permissions...${NC}"
echo -e "${GREEN}✅ Permissions set${NC}"
echo ""

# Step 5: Add keys to SSH agent
echo -e "${BLUE}Step 5: Adding keys to SSH agent...${NC}"
ssh-add ~/.ssh/id_ed25519_github 2>/dev/null && echo -e "${GREEN}✅ Added TechIntegrationLabs key${NC}"
ssh-add ~/.ssh/id_ed25519_disruptorsai 2>/dev/null && echo -e "${GREEN}✅ Added disruptorsai key${NC}"
echo ""

# Step 6: Display public keys for GitHub
echo -e "${BLUE}Step 6: Add these public keys to GitHub accounts:${NC}"
echo ""
echo -e "${YELLOW}TechIntegrationLabs Account:${NC}"
echo "Copy this key and add to: https://github.com/settings/keys"
echo "----------------------------------------"
cat ~/.ssh/id_ed25519_github.pub
echo "----------------------------------------"
echo ""

if [ -f ~/.ssh/id_ed25519_disruptorsai.pub ]; then
  echo -e "${YELLOW}disruptorsai Account:${NC}"
  echo "Copy this key and add to: https://github.com/settings/keys"
  echo "----------------------------------------"
  cat ~/.ssh/id_ed25519_disruptorsai.pub
  echo "----------------------------------------"
  echo ""
fi

# Step 7: Test connections
echo -e "${BLUE}Step 7: Testing SSH connections...${NC}"
echo ""
echo "Testing TechIntegrationLabs connection..."
ssh -T git@github-techintegration 2>&1 | grep -q "successfully authenticated" && \
  echo -e "${GREEN}✅ TechIntegrationLabs connection successful${NC}" || \
  echo -e "${YELLOW}⚠️  TechIntegrationLabs: Add public key to GitHub first${NC}"

if [ -f ~/.ssh/id_ed25519_disruptorsai ]; then
  echo "Testing disruptorsai connection..."
  ssh -T git@github-disruptorsai 2>&1 | grep -q "successfully authenticated" && \
    echo -e "${GREEN}✅ disruptorsai connection successful${NC}" || \
    echo -e "${YELLOW}⚠️  disruptorsai: Add public key to GitHub first${NC}"
fi

echo ""

# Step 8: Update current repo remote
echo -e "${BLUE}Step 8: Update repository remote URLs${NC}"
echo ""
echo "Current repository remote:"
git remote -v | grep origin | head -1
echo ""
echo "Choose which account to use for THIS repository:"
echo "1) TechIntegrationLabs"
echo "2) disruptorsai"
read -p "Enter choice (1 or 2): " choice

case $choice in
  1)
    git remote set-url origin git@github-techintegration:TechIntegrationLabs/disruptors-ai-marketing-hub.git
    echo -e "${GREEN}✅ Remote set to use TechIntegrationLabs account${NC}"
    ;;
  2)
    git remote set-url origin git@github-disruptorsai:TechIntegrationLabs/disruptors-ai-marketing-hub.git
    echo -e "${GREEN}✅ Remote set to use disruptorsai account${NC}"
    ;;
  *)
    echo -e "${YELLOW}⚠️  Skipping remote update${NC}"
    ;;
esac

echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Add public keys to GitHub accounts (if not done):"
echo "   TechIntegrationLabs: https://github.com/settings/keys"
echo "   disruptorsai:        https://github.com/settings/keys"
echo ""
echo "2. Test connections:"
echo "   ssh -T git@github-techintegration"
echo "   ssh -T git@github-disruptorsai"
echo ""
echo "3. For NEW repositories, clone with:"
echo "   TechIntegrationLabs: git clone git@github-techintegration:org/repo.git"
echo "   disruptorsai:        git clone git@github-disruptorsai:org/repo.git"
echo ""
echo "4. For EXISTING repositories, update remote:"
echo "   git remote set-url origin git@github-techintegration:org/repo.git"
echo ""
echo "📖 Full documentation: GITHUB_MULTI_ACCOUNT_SETUP.md"
echo ""
