# Git Workflow for Work Execution

This file contains Git-specific operations for setting up, executing, and shipping work.

## Workflow Scope (Mandatory)

- Use this file only when detected VCS is Git.
- If detected VCS is Plastic, stop this workflow and load ./plastic-workflow.md.
- Do not execute Plastic checkin/switch/review instructions while following this Git workflow.
- Once this workflow is active, Git branch/commit policy in this file is authoritative.
- Ignore Plastic checkin guidance and any conflicting cross-VCS write policy while this workflow is active.

## Active Workflow Lock (Mandatory)

- Set `ACTIVE_VCS_WORKFLOW=git` for the current run.
- Do not load or apply instructions from `plastic-workflow.md` after this lock is set.
- If instructions conflict, follow this file for branch-type commit behavior.

---

## Step 1: Setup Git Environment

Check the current branch and branch type, then offer options:

```bash
current_branch=$(git branch --show-current)
default_branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')

# Fallback if remote HEAD isn't set
if [ -z "$default_branch" ]; then
  default_branch=$(git rev-parse --verify origin/main >/dev/null 2>&1 && echo "main" || echo "master")
fi

echo "Current branch: $current_branch"
echo "Default branch: $default_branch"

if [[ "$current_branch" == */* ]]; then
  branch_type="sub-branch"
else
  branch_type="top-level"
fi

echo "Branch type: $branch_type"
```

---

### If Already on Sub-Branch

**If already on a sub-branch** (branch name contains `/`):

Interactive mode may ask:

"Continue working on `$current_branch`, or create a new branch?"

**Options:**
- **Continue** → Proceed to Phase 2 (Execute)
- **Create new** → Follow Option A or B below

**Non-interactive workflow callers (mandatory default):**

- Do not ask branch-choice prompts.
- If caller policy requires a dedicated run branch (for example, `cg-loop`), create a child branch and continue there.
- Otherwise, continue on the current sub-branch.

---

### If On Top-Level Branch

Choose how to proceed:

**Non-interactive workflow callers (mandatory default):**

- Do not ask branch-choice prompts.
- Use Option A (create a new branch) automatically.
- Do not use Option C in non-interactive mode.

#### Option A: Create a New Branch

```bash
git pull origin $current_branch
git checkout -b task/short-description
```

**Branch naming convention:**
- Use meaningful name based on the work
- Examples: `feat/user-authentication`, `fix/email-validation`, `refactor/api-client`

#### Option B: Use a Worktree (Recommended for Parallel Development)

```bash
skill: git-worktree
# The skill will create a new sub-branch from the current branch in an isolated worktree
```

**When to use worktree:**
- Working on multiple features simultaneously
- Want to keep the default branch clean while experimenting
- Plan to switch between branches frequently

#### Option C: Continue on Top-Level Branch

**Requires explicit user confirmation.**

- Only proceed after user explicitly says "yes, commit to [current_branch]"
- **Never commit directly to a top-level branch without explicit instruction**

---

## Step 2: Incremental Commits During Execution

After completing each task, evaluate whether to create an incremental commit.

### Commit Permission by Branch Type

- Top-level branches (`^[^/]+$`): create commits only when the user explicitly instructs.
- Sub-branches (for example, `feat/*`, `fix/*`, `bugfix/*`, `task/*`): create atomic commits by default.
- On sub-branches created by the agent in the current run, prefer one logical change per commit and avoid mixing unrelated changes.

### Commit Decision Table

| Commit when... | Don't commit when... |
|----------------|---------------------|
| Logical unit complete (model, service, component) | Small part of a larger unit |
| Tests pass + meaningful progress | Tests failing |
| About to switch contexts (backend → frontend) | Purely scaffolding with no behavior |
| About to attempt risky/uncertain changes | Would need a "WIP" commit message |

**Heuristic:** "Can I write a commit message that describes a complete, valuable change? If yes, commit. If the message would be 'WIP' or 'partial X', wait."

### Incremental Commit Workflow

```bash
# 1. Verify tests pass (use project's test command)
# Examples: bin/rails test, npm test, pytest, go test, etc.

# 2. Stage only files related to this logical unit (not `git add .`)
git add <files related to this logical unit>

# 3. Commit with conventional message (no attribution footer for incremental commits)
git commit -m "feat(scope): description of this unit"
```

**Load conventional commit format from:** ../_shared/conventional-commits.md

**Examples:**
```bash
git commit -m "feat(auth): add login form component"
git commit -m "feat(auth): implement JWT validation middleware"
git commit -m "test(auth): add login integration tests"
```

**Note:** Incremental commits use clean conventional messages **without** attribution footers. The final commit (Phase 4) includes full attribution.

---

## Step 3: Final Commit

After all work is complete and quality checks pass:

- If still on a top-level branch and no explicit commit instruction was given, stop before commit and report a ready-to-commit summary.

```bash
git add .
git status  # Review what's being committed
git diff --staged  # Check the changes

# Commit with conventional format and attribution
git commit -m "$(cat <<'EOF'
feat(scope): description of what and why

Brief explanation if needed.

Co-Authored-By: <AI Assistant Name>
EOF
)"
```

**Load commit format from:** ../_shared/conventional-commits.md

**Example:**
```bash
git commit -m "$(cat <<'EOF'
feat(auth): implement user authentication system

Adds JWT-based authentication with login, logout, and token refresh.
Includes password hashing with bcrypt and session management.

Closes #42

Co-Authored-By: <AI Assistant Name>
EOF
)"
```

---

## Step 4: Create Pull Request

Push the branch and create a PR:

```bash
git push -u origin feature-branch-name

gh pr create --title "Feature: [Description]" --body "$(cat <<'EOF'
## Summary
- What was built
- Why it was needed
- Key decisions made

## Testing
- Tests added/modified
- Manual testing performed

## Before / After Screenshots
| Before | After |
|--------|-------|
| ![before](URL) | ![after](URL) |

## Design References
[Link to design docs, concept art, or UI mockups if applicable]

---
Co-Authored-By: <AI Assistant Name>
EOF
)"
```

**Load PR template from:** `assets/pr-template.md`

**Capture PR URL:**
```bash
PR_URL=$(gh pr view --json url --jq '.url')
echo "✅ Pull request created: $PR_URL"
```

---

## Commands Reference

### Branch Operations
```bash
# Check current branch
git branch --show-current

# Get default branch
git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@'

# Create new branch
git checkout -b feature-name

# Switch branch
git checkout branch-name
```

### Commit Operations
```bash
# Stage specific files
git add file1.cs file2.cs

# Stage all changes
git add .

# View status
git status

# View staged changes
git diff --staged

# Commit
git commit -m "message"

# Amend last commit (use with caution)
git commit --amend
```

### Remote Operations
```bash
# Push new branch
git push -u origin branch-name

# Push to existing branch
git push origin branch-name

# Pull latest
git pull origin branch-name
```

### Pull Request Operations
```bash
# Create PR
gh pr create --title "Title" --body "Body"

# View PR
gh pr view

# Get PR URL
gh pr view --json url --jq '.url'
```

---

## Error Handling

### Branch Already Exists

```bash
if git show-ref --verify --quiet refs/heads/feature-name; then
  echo "⚠️ Branch 'feature-name' already exists locally"
  echo "Options:"
  echo "  1. Switch to existing branch: git checkout feature-name"
  echo "  2. Delete and recreate: git branch -D feature-name && git checkout -b feature-name"
  echo "  3. Use different name"
fi
```

### Uncommitted Changes

```bash
if ! git diff-index --quiet HEAD --; then
  echo "⚠️ You have uncommitted changes"
  echo "Options:"
  echo "  1. Commit them: git add . && git commit"
  echo "  2. Stash them: git stash"
  echo "  3. Discard them: git reset --hard (CAUTION)"
fi
```

### Push Failed

```bash
if ! git push -u origin feature-name; then
  echo "⚠️ Push failed"
  echo "Possible reasons:"
  echo "  - Remote branch has changes you don't have locally"
  echo "  - Network issue"
  echo ""
  echo "Try: git pull origin feature-name --rebase"
fi
```

### PR Creation Failed

```bash
if ! gh pr create ...; then
  echo "⚠️ PR creation failed"
  echo "Possible reasons:"
  echo "  - gh CLI not authenticated: gh auth login"
  echo "  - No remote branch: git push -u origin feature-name"
  echo "  - PR already exists for this branch"
  echo ""
  echo "Manual PR creation:"
  echo "  1. Go to GitHub repository"
  echo "  2. Click 'Pull requests' → 'New pull request'"
  echo "  3. Select your branch: $current_branch"
fi
```

---

## Usage

**Load this file when:** Using Git for version control during work execution.

**Execution order:**
1. Setup: Check branch, create new or use worktree
2. Execute: Make incremental commits as logical units complete
3. Final: Create final commit with attribution
4. Ship: Push and create PR
