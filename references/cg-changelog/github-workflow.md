# GitHub Workflow (Merged PRs)

Use this workflow only when source selection resolves to GitHub.

## Data to Collect

- PR number
- Title
- Body/description
- Labels
- Author
- Merge timestamp
- Linked issues (if present)
- Breaking change indicators
- Usage/access hints for team adoption (command paths, menu paths, settings locations, shortcuts)

## Query Strategy

1. Resolve base branch:
   - Prefer repository default branch
   - Fallback to `main`, then `master`
2. List merged PRs within time window.
3. Read PR metadata for classification and issue context.
4. Extract practical usage details from PR body/linked issues when present.

Example commands:

```bash
gh pr list --state merged --limit 100 --json number,title,author,labels,mergedAt,baseRefName
gh pr view <number> --json body,labels,closingIssuesReferences,author
```

## Classification Hints

- Breaking changes: `breaking`, `breaking-change`, or explicit breaking language in title/body
- Features: `feature`, `enhancement`
- Bugs: `bug`, `fix`, `hotfix`
- Other: chore, refactor, docs, maintenance

## Traceability Format

- Use PR references as `(#123)`
- Include linked issue references when available

## Usage Detail Extraction

When a PR introduces user-facing capability changes, look for explicit adoption clues in:
- PR description sections like "How to test", "Usage", "Manual QA", "Notes"
- Linked issue acceptance criteria
- Release checklist comments

Capture concise details such as:
- `How to access: Tools > Missions > Skip Intro`
- `How to access: /cg-plan --fast`

If unclear, do not guess.
