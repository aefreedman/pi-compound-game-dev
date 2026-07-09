# Synthesis and Todo Creation

## Synthesis Tasks

Collect results from selected review agents, not a fixed always-run set.

For each result preserve:

- agent and reviewed scope
- verdict/result/status, including `Not applicable`, `No concrete findings`, or blocker
- findings with severity and confidence
- direct evidence versus inference
- evidence/validation limits and checks not run
- out-of-scope handoffs
- operational artifacts such as deployment checklists, kept separate from defect findings

Drop findings that target protected artifacts (`references/_shared/protected-artifacts.md`). Verify important evidence, remove duplicates, and assign one owning domain. Do not inflate severity to normalize different agent contracts.

## Severity Definitions

- P1: credible release blocker such as severe data loss, security compromise, broken compatibility, or core-system failure
- P2: likely material correctness, operability, or maintainability problem requiring action
- P3: bounded concrete improvement; never generic cleanup

## Todo Creation

Create todo files under `${TODOS_ROOT}` using the `file-todos` skill for accepted actionable findings. Do not create todos for:

- `No concrete findings` or `Not applicable`
- unverified speculation without a concrete mechanism
- duplicate findings already represented by another owner
- deployment/checklist steps that belong in an operational artifact rather than defect tracking

Resolve `WORKSPACE_ROOT`, `DOCS_ROOT`, and `TODOS_ROOT` first. Prefer root-owned deterministic todo creation. If unusually large finding volume justifies delegation, only the root may invoke a bounded worker; provide an exact todo-file allowlist, roots, no VCS/external/nested-delegation authority, and the required file template/output.

Use `skills/file-todos/assets/todo-template.md`.

Naming convention:

- `{issue_id}-{status}-{priority}-{description}.md`
- status: `pending | ready | complete`
- priority: `p1 | p2 | p3`
- tags: include `code-review` plus the owning domain

Every created todo should retain source agent, evidence, impact, recommended validation, and uncertainty needed for later resolution.
