---
description: Run plan -> work -> review -> resolve-todo-parallel as one continuous loop
---
## Orchestration

- Delegate specialist work only from the root workflow session when helpful.
- Delegated workers must return handoffs rather than spawning more workers.
- Nested delegation is blocked at runtime.

<plan_input>$ARGUMENTS</plan_input>

## Package File Loading

CRITICAL: Use `cg_read_reference` for Compound Game Dev package prompt and reference files.

- Pass package-relative paths such as `prompts/cg-plan.md` or `references/_shared/vcs-detection.md`.
- When an instruction says to load, use, read, or follow a package prompt/reference path, call `cg_read_reference` for that path.
- Do NOT use `read` with `prompts/...` or `references/...`; file tools resolve relative to the current project cwd, not this package.

## Input handling

- Use `$ARGUMENTS` only for step 1 (`cg-plan`).
- All subsequent steps must use outputs/artifacts from the previous step.

## Execution rules

- Execute all stages in order without stopping between stages.
- Do not ask the user follow-up questions during execution.
- If ambiguity or blockers appear, apply the safest default and continue.
- If a specific item cannot be completed safely, mark that item blocked with reason and continue all remaining in-scope work.
- Only the root workflow session may spawn subagents for subtasks. Delegated workers must return parent handoffs instead of spawning further specialists.

## Branch safety (mandatory)

Before running any write-producing stage, detect VCS and enforce branch safety.

- Always run on a dedicated sub-branch for this loop run.
   - Use a branch name derived from the plan with adequate disambiguation; do not use a name like `loop-[date]` that another agent could independently pick as a branch name for a separate loop pass.
- Never perform write operations on top-level branches.
- Run non-interactively: do not ask branch-choice prompts.

Top-level branch rules:

- Git top-level: branch name has no `/` segment (examples: `main`, `dev`, `master`, `release`).
- Plastic top-level: branch matches `^/[^/]+$` (examples: `/main`, `/dev`).

Default branch creation when currently on top-level branch:

- Git: create `loop/<YYYYMMDD>-<short-plan>` from current branch.
- Plastic: create `<current-branch>/loop-<YYYYMMDD>` from current branch.

## Commit/checkin safety (mandatory)

- Use atomic commits/checkins for resolved work whenever feasible.
- Prefer one logical fix per commit/checkin (for example, one todo/finding per change unit).
- Do not mix unrelated changes in a single commit/checkin.
- Apply this to both `cg-work` and `cg-resolve-todo-parallel` stages.

# Execution Stages

1. Load `prompts/cg-plan.md` with `cg_read_reference`, then run that local planning workflow with `<plan_input>`.
   - Capture the generated plan artifact path.

2. Load `prompts/cg-work.md` with `cg_read_reference`, then run that local work-execution workflow using the plan artifact path from step 1.
   - Capture the produced review target (PR URL/number, branch, or equivalent).
   - Ensure the work is executed on the dedicated sub-branch for this run.
   - Use atomic commits.

3. Load `prompts/cg-review.md` with `cg_read_reference`, then run that local review workflow using step 2 output.

4. Auto-triage newly-created todo files:
   - Attempt to resolve all findings.
   - Promote matching pending todos to ready automatically.
   - Leave any un-resolvable todos pending.

5. Load `prompts/cg-resolve-todo-parallel.md` with `cg_read_reference`, then run that local todo-resolution workflow on the ready todos from step 4.
   - Prefer resolving `p1` first, then `p2`, then `p3`.
   - Ensure fixes are committed/checkedin atomically before marking todos complete.
   - Continue until all in-scope todos are resolved or marked blocked with reason.

## Completion criteria

- Complete only after all four stages finish and all in-scope todos are handled.
- Provide a concise final summary including:
  - plan artifact path
  - work/review target used
  - branch used (and whether it was created in this run)
  - todos promoted to ready
  - todos resolved and blocked (with reasons)
  - commit/checkin mapping for resolved items
