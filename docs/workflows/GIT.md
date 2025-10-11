# Git Workflow

## Branch Strategy

### Main Branch

**`master`** (NOT `main`) - Production-ready code

- Deploys automatically to production
- Protected branch
- All changes via pull requests (recommended)

### Feature Branches

Use descriptive branch names:

```bash
# Create feature branch
git checkout -b feature-name

# Examples:
git checkout -b update1
git checkout -b add-keyword-research
git checkout -b fix-login-bug
```

## Commit Workflow

### Manual Commits

```bash
# Stage changes
git add .

# Commit with message
git commit -m "feat: Add keyword research module

Added complete keyword research module with DataForSEO integration.
Includes UI, API integration, and demo page.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote
git push origin feature-name
```

### Auto-Commit System

Enabled via `npm run dev:auto`:

```bash
# Start development with auto-commit
npm run dev:auto

# Changes automatically committed on save
# Semantic messages generated automatically
# Changelog updated automatically
```

**Features:**
- Intelligent change detection
- Semantic commit messages
- Automatic changelog updates
- Documentation synchronization

## Commit Message Format

### Structure

```
<type>: <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Test changes
- `chore` - Build/tooling changes

### Examples

```bash
# Feature
git commit -m "feat: Add Growth Audit module"

# Bug fix
git commit -m "fix: Resolve login redirect issue"

# Documentation
git commit -m "docs: Update API documentation"

# Refactor
git commit -m "refactor: Simplify routing logic"
```

## Git Commands

### Common Operations

```bash
# Check status
git status

# View differences
git diff

# View staged differences
git diff --staged

# View commit history
git log --oneline -10

# View branch status
git branch -v

# Switch branches
git checkout branch-name

# Create and switch to new branch
git checkout -b new-branch-name

# Pull latest changes
git pull origin master

# Push changes
git push origin branch-name

# Merge branch
git merge feature-branch

# Rebase (interactive)
git rebase -i HEAD~3
```

### Undoing Changes

```bash
# Discard local changes
git checkout -- filename

# Unstage file
git reset HEAD filename

# Amend last commit
git commit --amend

# Reset to previous commit (dangerous!)
git reset --hard HEAD~1

# Revert commit (safe)
git revert commit-hash
```

## Pull Request Workflow

### Creating Pull Request

```bash
# 1. Create feature branch
git checkout -b feature-name

# 2. Make changes and commit
git add .
git commit -m "feat: Add feature"

# 3. Push to remote
git push -u origin feature-name

# 4. Create PR using GitHub CLI
gh pr create --title "Add feature" --body "$(cat <<'EOF'
## Summary
- Added feature X
- Updated documentation
- Tested on all browsers

## Test plan
- [ ] Manual testing complete
- [ ] No console errors
- [ ] Lighthouse score > 90

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### PR Best Practices

1. **Write clear title** - Describe what the PR does
2. **Provide context** - Explain why the change is needed
3. **Include test plan** - How was it tested?
4. **Keep it focused** - One feature/fix per PR
5. **Request reviews** - Get feedback before merging

## Commit Guidelines

### Git Safety Protocol

**NEVER:**
- Update git config
- Run destructive commands (`push --force` to main/master)
- Skip hooks (`--no-verify`, `--no-gpg-sign`)
- Commit secrets (.env, credentials.json)
- Amend other developers' commits

**ALWAYS:**
- Create commits only when requested
- Check authorship before amending
- Verify commits aren't pushed before amending
- Use semantic commit messages
- Include co-author attribution

### Pre-Commit Checklist

Before committing:

- [ ] Run `npm run lint`
- [ ] Fix all ESLint errors
- [ ] Review changes (`git diff`)
- [ ] Test functionality
- [ ] Check for secrets
- [ ] Write clear commit message

## Hooks

### Pre-Commit Hook

Automatically runs before commit:

```bash
# Runs ESLint
npm run lint

# If errors, commit blocked
# Fix errors and try again
```

### Post-Commit Hook

After successful commit:

```bash
# Update changelog
# Sync documentation
# Run auto-commit tasks (if enabled)
```

## Common Workflows

### Feature Development

```bash
# 1. Create branch
git checkout -b add-module-system

# 2. Develop feature
# ... make changes ...

# 3. Commit frequently
git add .
git commit -m "feat: Add module registry"

# 4. Push to remote
git push -u origin add-module-system

# 5. Create PR
gh pr create

# 6. Merge after approval
gh pr merge
```

### Bug Fix

```bash
# 1. Create branch
git checkout -b fix-auth-redirect

# 2. Fix bug
# ... make changes ...

# 3. Test fix
npm run dev:netlify

# 4. Commit
git add .
git commit -m "fix: Resolve auth redirect loop"

# 5. Push and create PR
git push -u origin fix-auth-redirect
gh pr create
```

### Hotfix (Production)

```bash
# 1. Branch from master
git checkout master
git pull origin master
git checkout -b hotfix-critical-bug

# 2. Fix bug
# ... make changes ...

# 3. Test thoroughly
npm run build
npm run preview

# 4. Commit and push
git add .
git commit -m "fix: Critical production bug"
git push -u origin hotfix-critical-bug

# 5. Create PR and merge immediately
gh pr create
gh pr merge --auto
```

## Branch Management

### Keeping Branches Updated

```bash
# Update master
git checkout master
git pull origin master

# Update feature branch with master changes
git checkout feature-branch
git merge master

# Or rebase (cleaner history)
git rebase master
```

### Cleaning Up Branches

```bash
# Delete local branch
git branch -d feature-branch

# Force delete (if not merged)
git branch -D feature-branch

# Delete remote branch
git push origin --delete feature-branch

# Prune deleted remote branches
git fetch --prune
```

## Deployment via Git

### Automatic Deployment

Pushing to `master` triggers automatic deployment:

```bash
git checkout master
git merge feature-branch
git push origin master

# Netlify automatically deploys
# Monitor at: https://app.netlify.com/projects/cheerful-custard-2e6fc5
```

### Preview Deployments

Push to feature branch creates preview:

```bash
git push origin feature-branch

# Preview URL generated automatically
# Check Netlify dashboard for URL
```

## Git Configuration

### Local Configuration

```bash
# Set name
git config user.name "Your Name"

# Set email
git config user.email "your@email.com"

# Set default branch
git config init.defaultBranch master

# Enable auto-rebase
git config pull.rebase true
```

### Global Configuration

```bash
# Enable colors
git config --global color.ui auto

# Set default editor
git config --global core.editor "code --wait"

# Set merge tool
git config --global merge.tool vscode
```

## Best Practices

1. **Commit often** - Small, focused commits
2. **Write clear messages** - Describe what and why
3. **Test before committing** - Ensure code works
4. **Keep branches updated** - Merge master regularly
5. **Review before pushing** - Check `git diff`
6. **Use feature branches** - Don't commit directly to master
7. **Clean up branches** - Delete merged branches
8. **Follow conventions** - Semantic commit messages
9. **Co-author attribution** - Credit collaborators
10. **Never commit secrets** - Use .gitignore

## Troubleshooting

### Merge Conflicts

```bash
# 1. Pull latest changes
git pull origin master

# 2. Resolve conflicts in editor
# Look for <<<<<<< HEAD markers

# 3. Stage resolved files
git add .

# 4. Complete merge
git commit
```

### Accidental Commit

```bash
# Undo last commit (keep changes)
git reset HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Amend last commit
git commit --amend
```

### Lost Commits

```bash
# View reflog
git reflog

# Recover lost commit
git checkout <commit-hash>
git checkout -b recovery-branch
```

## Related Documentation

- `docs/workflows/DEVELOPMENT.md` - Development workflow
- `docs/workflows/TESTING.md` - Testing procedures
- `docs/DEPLOYMENT.md` - Deployment process
- `docs/AUTOMATION_SYSTEM.md` - Auto-commit system
