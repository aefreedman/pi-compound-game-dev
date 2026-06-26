# Git Workflow for Code Review

This file contains Git-specific operations for code review setup and context collection.

---

## Step 1: Determine Review Target

<task_list>

- [ ] Determine review type: PR number (numeric), GitHub URL, branch name, or empty (current branch)
- [ ] Check current git branch
- [ ] If ALREADY on the target branch → proceed with analysis on current branch
- [ ] If DIFFERENT branch than the review target → offer to use worktree: "Use git-worktree skill for isolated review"
- [ ] Fetch PR metadata using `gh pr view --json` for title, body, files, linked issues
- [ ] Use gh pr checkout to switch to the PR branch
- [ ] Set up language-specific analysis tools

Ensure that the code is ready for analysis (either in worktree or on current branch). ONLY then proceed to the next step.

</task_list>

---

## Step 2: Collect Review Context

Before launching review agents, gather sufficient scoped context about the changes to pass to each agent. Do not perform broad repository research here; agents should focus on changed files and directly related local patterns.

```bash
# Get PR metadata and changed files
if [ -n "$PR_NUMBER" ]; then
  # Using PR number
  PR_TITLE=$(gh pr view "$PR_NUMBER" --json title --jq '.title')
  PR_BODY=$(gh pr view "$PR_NUMBER" --json body --jq '.body')
  BASE_BRANCH=$(gh pr view "$PR_NUMBER" --json baseRefName --jq '.baseRefName')
  CHANGED_FILES=$(gh pr view "$PR_NUMBER" --json files --jq '.files[].path' | sed 's/^/- /')
elif [ -n "$BRANCH_NAME" ]; then
  # Using branch name
  PR_TITLE="Branch: $BRANCH_NAME"
  PR_BODY=$(git log --oneline -5 "$BRANCH_NAME")
  BASE_BRANCH="main"
  CHANGED_FILES=$(git diff --name-only "$BASE_BRANCH...$BRANCH_NAME" | sed 's/^/- /')
else
  # Using current branch
  CURRENT_BRANCH=$(git branch --show-current)
  PR_TITLE="Branch: $CURRENT_BRANCH"
  PR_BODY=$(git log --oneline -5)
  BASE_BRANCH="main"
  CHANGED_FILES=$(git diff --name-only "$BASE_BRANCH..." | sed 's/^/- /')
fi

# Extract focus areas from title and body
FOCUS_AREAS=$(echo "$PR_TITLE $PR_BODY" | grep -oE '\b(fix|bug|feature|refactor|performance|security|optimization|migration|upgrade|new)\b' | sort -u | tr '\n' ', ' | sed 's/,$//')

# Count files for context
FILE_COUNT=$(echo "$CHANGED_FILES" | grep -c '^- ')

echo "📊 Review Context:"
echo "   Title: $PR_TITLE"
echo "   Files Changed: $FILE_COUNT"
echo "   Focus: $FOCUS_AREAS"
```

**Context Variables Ready for Agents:**

After running the section above, you will have:
- `$CHANGED_FILES` - Newline-separated list of file paths (with `- ` prefix)
- `$PR_TITLE` - Title/description of changes
- `$FOCUS_AREAS` - Comma-separated keywords extracted from title/body
- `$FILE_COUNT` - Number of changed files

These variables should be passed to agents in their prompts.

---

## Worktree Strategy

If the current branch is different from the review target, offer to use git worktree for isolated review:

```bash
CURRENT_BRANCH=$(git branch --show-current)
TARGET_BRANCH="[branch from PR or argument]"

if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
  echo "Current branch: $CURRENT_BRANCH"
  echo "Review target: $TARGET_BRANCH"
  echo ""
  echo "Recommendation: Use git worktree for isolated review"
  echo "This preserves your current work while reviewing the target branch"
  echo ""
  echo "Use: /git-worktree skill"
fi
```

---

## Commands Reference

### GitHub CLI Commands

```bash
# View PR metadata
gh pr view <PR_NUMBER> --json title,body,files,baseRefName

# Checkout PR branch
gh pr checkout <PR_NUMBER>

# Get changed files
gh pr view <PR_NUMBER> --json files --jq '.files[].path'
```

### Git Commands

```bash
# Check current branch
git branch --show-current

# Get changed files (compared to base branch)
git diff --name-only <BASE_BRANCH>...<TARGET_BRANCH>

# Get recent commits
git log --oneline -5 <BRANCH_NAME>

# Create worktree for isolated review
git worktree add ../review-worktree <TARGET_BRANCH>
```
