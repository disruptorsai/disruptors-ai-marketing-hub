# GitHub Multi-Account Setup Guide
## Use Different GitHub Accounts Per Repository

**Goal**: Configure SSH to use different GitHub accounts for different repositories.

---

## 🔑 Current Setup

You currently have:
- **SSH Key**: `~/.ssh/id_ed25519_github` (currently in use)
- **SSH Config**: Basic config pointing to this key

---

## 📋 Multi-Account Setup Steps

### Step 1: Create SSH Keys for Each Account

You'll need one SSH key per GitHub account.

**Account 1: TechIntegrationLabs (Current)**
```bash
# You already have this key
# ~/.ssh/id_ed25519_github
```

**Account 2: disruptorsai (or other account)**
```bash
# Create new SSH key for second account
ssh-keygen -t ed25519 -C "your-email@disruptorsai-account.com" -f ~/.ssh/id_ed25519_disruptorsai

# When prompted:
# - Press Enter to skip passphrase (or add one for security)
# - Key will be created at: ~/.ssh/id_ed25519_disruptorsai
```

**Account 3: Personal account (if needed)**
```bash
ssh-keygen -t ed25519 -C "your-personal-email@gmail.com" -f ~/.ssh/id_ed25519_personal
```

### Step 2: Add SSH Keys to GitHub Accounts

For each account, add the corresponding public key:

**TechIntegrationLabs Account:**
```bash
# Copy the public key
cat ~/.ssh/id_ed25519_github.pub | pbcopy

# Go to: https://github.com/settings/keys
# Click "New SSH key"
# Title: "Mac - TechIntegrationLabs"
# Paste the key
# Click "Add SSH key"
```

**disruptorsai Account:**
```bash
# Copy the public key
cat ~/.ssh/id_ed25519_disruptorsai.pub | pbcopy

# Switch to disruptorsai GitHub account
# Go to: https://github.com/settings/keys
# Click "New SSH key"
# Title: "Mac - disruptorsai"
# Paste the key
# Click "Add SSH key"
```

### Step 3: Update SSH Config

Edit `~/.ssh/config` to include host aliases for each account:

```bash
# TechIntegrationLabs Account (Main)
Host github-techintegration
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github
  IdentitiesOnly yes

# disruptorsai Account
Host github-disruptorsai
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_disruptorsai
  IdentitiesOnly yes

# Personal Account (if needed)
Host github-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal
  IdentitiesOnly yes

# Default fallback to TechIntegrationLabs
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github
  IdentitiesOnly yes
```

### Step 4: Configure Git Remote Per Repository

For each repository, set the remote URL to use the correct host alias:

**For TechIntegrationLabs repositories:**
```bash
git remote set-url origin git@github-techintegration:TechIntegrationLabs/repo-name.git
```

**For disruptorsai repositories:**
```bash
git remote set-url origin git@github-disruptorsai:disruptorsai/repo-name.git
```

**For personal repositories:**
```bash
git remote set-url origin git@github-personal:yourusername/repo-name.git
```

### Step 5: Test Each Connection

```bash
# Test TechIntegrationLabs
ssh -T git@github-techintegration

# Test disruptorsai
ssh -T git@github-disruptorsai

# Test personal
ssh -T git@github-personal
```

You should see: `Hi [username]! You've successfully authenticated...`

---

## 🎯 Quick Reference

### Current Repository (disruptors-ai-marketing-hub)

**Current remote:**
```bash
git remote -v
# origin  git@github.com:TechIntegrationLabs/disruptors-ai-marketing-hub.git
```

**To use TechIntegrationLabs account:**
```bash
git remote set-url origin git@github-techintegration:TechIntegrationLabs/disruptors-ai-marketing-hub.git
```

**To use disruptorsai account:**
```bash
git remote set-url origin git@github-disruptorsai:TechIntegrationLabs/disruptors-ai-marketing-hub.git
```

### For New Repositories

When cloning a new repository:

**TechIntegrationLabs:**
```bash
git clone git@github-techintegration:TechIntegrationLabs/repo-name.git
```

**disruptorsai:**
```bash
git clone git@github-disruptorsai:disruptorsai/repo-name.git
```

**Personal:**
```bash
git clone git@github-personal:yourusername/repo-name.git
```

---

## 🔧 Advanced Configuration

### Per-Repository Git User Config

Set different name/email per repository:

```bash
# In a TechIntegrationLabs repo
cd /path/to/techintegration-repo
git config user.name "Your Name"
git config user.email "your-email@techintegration.com"

# In a disruptorsai repo
cd /path/to/disruptorsai-repo
git config user.name "Disruptors AI"
git config user.email "your-email@disruptorsai.com"
```

### Global Git User Config (Fallback)

```bash
# Set global defaults
git config --global user.name "Your Default Name"
git config --global user.email "your-default@email.com"
```

### Automatic User Config by Directory

Use conditional includes in `~/.gitconfig`:

```bash
# Edit ~/.gitconfig
[user]
  name = Your Default Name
  email = default@email.com

[includeIf "gitdir:~/Documents/TechIntegration/"]
  path = ~/.gitconfig-techintegration

[includeIf "gitdir:~/Documents/DisruptorsAI/"]
  path = ~/.gitconfig-disruptorsai
```

Then create `~/.gitconfig-techintegration`:
```bash
[user]
  name = TechIntegration Name
  email = your@techintegration.com
```

And `~/.gitconfig-disruptorsai`:
```bash
[user]
  name = Disruptors AI
  email = your@disruptorsai.com
```

---

## 🚨 Troubleshooting

### "Permission denied (publickey)" Error

1. Check SSH key is added to GitHub:
   ```bash
   cat ~/.ssh/id_ed25519_github.pub
   # Copy and verify it's in GitHub settings
   ```

2. Test SSH connection:
   ```bash
   ssh -T git@github-techintegration
   ```

3. Check SSH agent:
   ```bash
   ssh-add -l
   # If empty, add keys:
   ssh-add ~/.ssh/id_ed25519_github
   ssh-add ~/.ssh/id_ed25519_disruptorsai
   ```

### "Could not read from remote repository"

1. Verify remote URL uses correct host:
   ```bash
   git remote -v
   ```

2. Update to correct host alias:
   ```bash
   git remote set-url origin git@github-techintegration:org/repo.git
   ```

### Wrong Account Being Used

1. Check which key is being used:
   ```bash
   GIT_SSH_COMMAND="ssh -v" git fetch
   # Look for "Offering public key" line
   ```

2. Force specific key:
   ```bash
   GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519_github" git push
   ```

---

## 📝 Quick Setup Script

Save this as `setup-github-accounts.sh`:

```bash
#!/bin/bash

echo "🔑 GitHub Multi-Account Setup"
echo ""

# Create SSH keys if they don't exist
if [ ! -f ~/.ssh/id_ed25519_disruptorsai ]; then
  echo "Creating SSH key for disruptorsai account..."
  ssh-keygen -t ed25519 -C "email@disruptorsai.com" -f ~/.ssh/id_ed25519_disruptorsai -N ""
  echo "✅ Created: ~/.ssh/id_ed25519_disruptorsai"
fi

# Create SSH config
cat > ~/.ssh/config << 'EOF'
# TechIntegrationLabs Account
Host github-techintegration
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github
  IdentitiesOnly yes

# disruptorsai Account
Host github-disruptorsai
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_disruptorsai
  IdentitiesOnly yes

# Default fallback
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github
  IdentitiesOnly yes
EOF

echo "✅ SSH config updated"
echo ""
echo "📋 Next steps:"
echo "1. Add public keys to GitHub accounts:"
echo "   TechIntegrationLabs: cat ~/.ssh/id_ed25519_github.pub | pbcopy"
echo "   disruptorsai:        cat ~/.ssh/id_ed25519_disruptorsai.pub | pbcopy"
echo ""
echo "2. Test connections:"
echo "   ssh -T git@github-techintegration"
echo "   ssh -T git@github-disruptorsai"
echo ""
echo "3. Update repo remotes:"
echo "   git remote set-url origin git@github-techintegration:org/repo.git"
```

Make it executable:
```bash
chmod +x setup-github-accounts.sh
./setup-github-accounts.sh
```

---

## ✅ Verification Checklist

- [ ] SSH keys created for each account
- [ ] Public keys added to respective GitHub accounts
- [ ] SSH config updated with host aliases
- [ ] SSH connections tested successfully
- [ ] Repository remotes updated to use correct hosts
- [ ] Git user config set per repository (if needed)
- [ ] Test push to each account works

---

## 🎉 Done!

You can now:
- Push to different GitHub accounts from the same machine
- Clone repos using specific accounts
- Keep work and personal projects separate
- No more authentication errors!

**Example Workflow:**

```bash
# Working on TechIntegrationLabs project
cd ~/Documents/DM4/disruptors-ai-marketing-hub
git remote set-url origin git@github-techintegration:TechIntegrationLabs/disruptors-ai-marketing-hub.git
git push origin updateplus
# ✅ Uses TechIntegrationLabs account

# Working on disruptorsai project
cd ~/Documents/disruptorsai-project
git remote set-url origin git@github-disruptorsai:disruptorsai/project-name.git
git push origin main
# ✅ Uses disruptorsai account
```

---

**Created**: 2025-01-15
**Status**: Ready to implement
