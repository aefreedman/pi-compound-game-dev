# Issue Tracker Integration

This file defines a provider-oriented interface for tracker integration.

Before any file-based search or output, resolve artifact roots via
../_shared/artifact-root-resolution.md to get `DOCS_ROOT` and
`TODOS_ROOT`.

---

## Tracker Detection

Detect the configured issue tracker from AGENTS.md:

```bash
# Detect issue tracker configuration
if [ -f "AGENTS.md" ]; then
  ISSUE_TRACKER=$(grep -i "^issue_tracker:" AGENTS.md | cut -d: -f2 | xargs)
elif [ -f "../AGENTS.md" ]; then
  # Check parent when running from a nested workspace
  ISSUE_TRACKER=$(grep -i "^issue_tracker:" ../AGENTS.md | cut -d: -f2 | xargs)
else
  ISSUE_TRACKER="none"
fi

# Normalize unknown or empty values to file-based flow
case "$ISSUE_TRACKER" in
  github|codecks|none)
    ;;
  *)
    ISSUE_TRACKER="none"
    ;;
esac

echo "🔍 Issue tracker: $ISSUE_TRACKER"
```

---

## AGENTS.md Configuration

Add this to your project's `AGENTS.md` file:

```markdown
---
issue_tracker: github  # Options: github, codecks, none
---
```

**Supported trackers:**
- `github` - GitHub Issues and PRs
- `codecks` - Codecks cards
- `none` - File-based tracking only (logical docs/todos mapped by resolved roots)

---

## Tracker Interface

Use the same high-level flow regardless of provider:

1. Detect and normalize `ISSUE_TRACKER`
2. Search related work for `$KEYWORD`
3. Create external record from `$PLAN_FILE_PATH` (optional)
4. Fall back to `none` when tracker is missing/unknown

---

## Searching for Related Work

Search for related issues based on detected tracker:

### GitHub

```bash
if [ "$ISSUE_TRACKER" = "github" ]; then
  echo "Searching GitHub issues and PRs..."
  
  # Search issues
  gh issue list --search "$KEYWORD" --limit 10 --json number,title,url \
    --jq '.[] | "#\(.number): \(.title) - \(.url)"'
  
  # Search PRs
  gh pr list --search "$KEYWORD" --limit 10 --json number,title,url \
    --jq '.[] | "#\(.number): \(.title) - \(.url)"'
  
  echo ""
  echo "Related work found in GitHub"
fi
```

**Features:**
- Search across issues and PRs
- Returns issue number, title, and URL
- Supports GitHub's advanced search syntax

---

### Codecks

```text
if ISSUE_TRACKER == "codecks":
  use codecks_card_search with title=KEYWORD, location="any", limit=10
  return matching card ids, titles, and locations
```

**Features:**
- Search cards by title
- Returns card ids and titles
- Uses the Codecks integration tools

---

### None (File-Based Tracking)

```bash
if [ "$ISSUE_TRACKER" = "none" ] || [ "$ISSUE_TRACKER" = "" ]; then
  echo "📚 Searching local documentation (no issue tracker configured)..."
  
  # Search solutions
  if [ -d "${DOCS_ROOT}/solutions" ]; then
    echo ""
    echo "Related solutions:"
    grep -r "$KEYWORD" "${DOCS_ROOT}/solutions/" --include="*.md" -l | head -10
  fi
  
  # Search plans
  if [ -d "${DOCS_ROOT}/plans" ]; then
    echo ""
    echo "Related plans:"
    grep -r "$KEYWORD" "${DOCS_ROOT}/plans/" --include="*.md" -l | head -10
  fi
  
  # Search planning artifacts
  if [ -d "${DOCS_ROOT}/planning artifacts" ]; then
    echo ""
    echo "Related planning artifacts:"
    grep -r "$KEYWORD" "${DOCS_ROOT}/planning artifacts/" --include="*.md" -l | head -10
  fi
  
  echo ""
  echo "File-based tracking works without external issue tracker"
fi
```

**Features:**
- Search across local documentation directories
- No external dependencies required
- Works offline
- Full-text search in markdown files

---

## Creating External Records

### GitHub

```bash
if [ "$ISSUE_TRACKER" = "github" ]; then
  echo "Creating GitHub issue..."
  
  # Use title from Step 2 (already in context)
  gh issue create \
    --title "$ISSUE_TYPE: $ISSUE_TITLE" \
    --body-file "$PLAN_FILE_PATH"
  
  ISSUE_URL=$(gh issue view --json url --jq '.url')
  echo "✅ Issue created: $ISSUE_URL"
fi
```

**Input:**
- `$ISSUE_TYPE` - feat, fix, refactor (from Step 2)
- `$ISSUE_TITLE` - Title without type prefix
- `$PLAN_FILE_PATH` - Path to the plan markdown file

**Output:**
- GitHub issue URL
- Issue number for reference

---

### Codecks

```text
if ISSUE_TRACKER == "codecks":
  use codecks_card_create with title=ISSUE_TITLE and content from PLAN_FILE_PATH
  optionally set deck/milestone per project conventions
  return created card id
```

**Input:**
- `$ISSUE_TITLE` - Full title
- `$PLAN_FILE_PATH` - Path to the plan markdown file

**Output:**
- Codecks card ID

---

### None (File-Based)

```bash
if [ "$ISSUE_TRACKER" = "none" ] || [ "$ISSUE_TRACKER" = "" ]; then
  echo "📁 File-based tracking (no external issue tracker)"
  echo ""
  echo "Plan created: $PLAN_FILE_PATH"
  echo ""
  echo "Track this work using:"
  echo "  - Plan file: $PLAN_FILE_PATH (implementation tracking)"
  echo "  - Todo files: ${TODOS_ROOT}/ (if using file-todos system)"
  echo "  - Solution docs: ${DOCS_ROOT}/solutions/ (after completion)"
  echo ""
  echo "💡 Consider adding an issue tracker to AGENTS.md:"
  echo "   issue_tracker: github|codecks|none"
fi
```

**Output:**
- Plan file path
- Guidance on file-based tracking
- Suggestion to configure issue tracker

---

## After Issue Creation

After creating an issue (or noting file-based tracking), report the created tracking link without adding a generic next-step menu:

```markdown
## Issue Created

**Tracker:** github
**Issue:** #123 - feat: Add player dash
**URL:** https://github.com/org/repo/issues/123
**Plan:** docs/plans/2026-02-04-feat-add-player-dash-plan.md (workspace-root relative logical path)
```

---

## Error Handling

### Missing or Unknown Tracker

```bash
if [ -z "$ISSUE_TRACKER" ] || [ "$ISSUE_TRACKER" = "" ]; then
  ISSUE_TRACKER="none"
fi

case "$ISSUE_TRACKER" in
  github|codecks|none)
    ;;
  *)
    ISSUE_TRACKER="none"
    ;;
esac

if [ "$ISSUE_TRACKER" = "none" ]; then
  echo "ℹ️ Using file-based tracking (issue_tracker: none)"
fi
```

### Tracker Tooling Not Available

```bash
if [ "$ISSUE_TRACKER" = "github" ] && ! command -v gh &>/dev/null; then
  echo "⚠️ GitHub CLI (gh) not found"
  echo "   Install: https://cli.github.com/"
  echo ""
  echo "Alternative: Create issue manually in GitHub web UI"
  echo "   Use plan file contents: $PLAN_FILE_PATH"
fi
```

```text
if ISSUE_TRACKER == "codecks" and Codecks integration is unavailable:
  create a card manually in Codecks
  use plan file contents from PLAN_FILE_PATH
```

---

## Usage

**Load this file when:**
- Searching for related work during planning
- Creating an external record after plan generation
- Need to detect which tracker to use

**Workflow:**
1. Detect tracker from AGENTS.md
2. Search for related work (optional)
3. Create plan file
4. Create external record using detected tracker (optional)
5. Report created/linked tracking record
