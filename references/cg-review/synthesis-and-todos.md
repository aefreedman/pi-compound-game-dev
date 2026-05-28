# Synthesis and Todo Creation

## Synthesis Tasks

- Collect findings from all review agents.
- Drop findings that target protected artifacts (see ../_shared/protected-artifacts.md).
- Categorize by type (security, performance, architecture, quality).
- Assign severity (P1/P2/P3).
- Remove duplicates and overlaps.
- Estimate effort (small/medium/large).

## Severity Definitions

- P1: Critical, blocks merge (security, data loss, breaking change).
- P2: Important, should fix (architecture, performance, reliability).
- P3: Nice-to-have (cleanup, minor improvements).

## Todo Creation (Required)

All findings must become files under `${TODOS_ROOT}` using the file-todos skill.
Create todos immediately after synthesis; do not ask for approval first.

If launched from a coordination root, pass resolved `WORKSPACE_ROOT` and
`TODOS_ROOT` into any subagent prompts used for todo creation.

Use the template:
- ../../skills/file-todos/assets/todo-template.md

Naming convention:
- `{issue_id}-{status}-{priority}-{description}.md`

Status values:
- pending, ready, complete

Priority values:
- p1, p2, p3

Tags:
- Always include `code-review` plus domain tags (security, performance, architecture).

## Creation Modes

- Direct creation: write files with the template.
- Parallel subagents: use when findings count is large.
