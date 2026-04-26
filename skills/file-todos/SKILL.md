---
name: file-todos
description: Manage file-based todo tracking in the todos/ directory
---
# File-Based Todo Tracking Skill

## Overview

Todos are markdown files in logical `todos/` with YAML frontmatter and structured sections.
Physical location is resolved via `${TODOS_ROOT}`.
Use this skill to create, triage, and update file-based todos.

## File Naming Convention

```
{issue_id}-{status}-{priority}-{description}.md
```

- issue_id: sequential number (001, 002, ...)
- status: pending | ready | complete
- priority: p1 | p2 | p3
- description: kebab-case

## File Structure

Use the template at ../file-todos/assets/todo-template.md.

Required sections:

- Problem Statement
- Findings
- Proposed Solutions
- Recommended Action
- Acceptance Criteria
- Work Log

## When to Create a Todo

Create a todo when work is more than trivial, needs research,
has dependencies, or requires triage. Act immediately for trivial fixes.

## External File Loading

CRITICAL: Use relative path references and load files only when needed for the current step.

- Do NOT preemptively load all reference files.
- Treat loaded references as mandatory instructions for the active task scope.
- Follow nested `@...` references recursively only when relevant.
- For long files, use Read with `offset`/`limit` to load only needed sections.

## Root Resolution Requirement

Before any todo read/write, load:

- ../../references/_shared/artifact-root-resolution.md
- ../../references/_shared/artifact-path-contract.md

Then operate on `${TODOS_ROOT}` while keeping logical naming (`todos/...`) in
templates and user-facing descriptions.

## Reference Files (Load On Demand)

1. Template -> ../file-todos/assets/todo-template.md
2. Triage -> ../file-todos/references/triage.md
3. Dependencies -> ../file-todos/references/dependencies.md
4. Work logs -> ../file-todos/references/work-logs.md
5. Commands -> ../file-todos/references/commands.md
6. Integration -> ../file-todos/references/integration.md
7. Artifact root resolution -> ../../references/_shared/artifact-root-resolution.md
8. Artifact path contract -> ../../references/_shared/artifact-path-contract.md
