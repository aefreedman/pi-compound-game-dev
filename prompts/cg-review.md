---
description: Review changes using stack-aware multi-agent analysis
---
# Reviewing Code

Purpose: perform a thorough review using parallel agents and structured synthesis.

## Package Reference Loading

CRITICAL: Use `cg_read_reference` for Compound Game Dev package reference files.

- Pass package-relative paths such as `references/cg-plan/research-agents.md`.
- When an instruction says to load, use, or see a package reference path, call `cg_read_reference` for that path.
- Do NOT use `read` with `references/...`; file tools resolve relative to the current project cwd, not this package.
- Do NOT preemptively load all reference files.
- Treat loaded references as mandatory instructions for the active task scope.
- For long files, use `cg_read_reference` with `offset`/`limit` to load only needed sections.

## Workflow

### Step 0: Detect VCS

Load references/_shared/vcs-detection.md and branch to Git or Plastic flow.

### Step 1: Determine Review Target and Setup

- Git: load references/cg-review/git-workflow.md.
- Plastic: load references/cg-review/plastic-workflow.md and `using-plastic` skill.

Ensure code is ready in a worktree/workspace before analysis.

### Step 2: Collect Review Context

Use the VCS workflow to collect:

- Changed files
- Review title/body
- Focus areas
- File count

Also collect lightweight stack/scope hints from changed file paths and local guidance. If Unity is detected, load references/_shared/unity-review-guidance.md and pass its relevant checks as conditional context to review agents. Otherwise keep stack guidance engine/tool agnostic.

### Step 3: Launch Parallel Review Agents

Use the applicability table and briefs in references/cg-review/agent-prompts.md. Select only relevant specialists, focus each on changed files and directly related evidence, and reserve `cg-pattern-specialist` for explicitly requested cross-codebase audits. Invoke package-owned agents with `agentScope: "both"` so project-local installations remain discoverable; keep project-agent confirmation enabled.

### Step 4: Run Conditional Agents (If Needed)

Use criteria and prompts in references/cg-review/conditional-agents.md.

### Step 5: Synthesize Findings and Create Todos

Load:

- references/cg-review/synthesis-and-todos.md
- references/_shared/protected-artifacts.md
- references/_shared/artifact-root-resolution.md
- references/_shared/artifact-path-contract.md

Create todos using the file-todos skill.

### Step 6: Generate Summary Report

Use references/cg-review/assets/summary-template.md.

### Step 7: Optional Unity Testing

See references/cg-review/unity-testing.md.

## Error Handling

See references/cg-review/error-handling.md.

## Reference Files (Load On Demand)

1. VCS detection -> references/_shared/vcs-detection.md
2. Git workflow -> references/cg-review/git-workflow.md
3. Plastic workflow -> references/cg-review/plastic-workflow.md
4. Core agents -> references/cg-review/agent-prompts.md
5. Conditional agents -> references/cg-review/conditional-agents.md
6. Synthesis/todos -> references/cg-review/synthesis-and-todos.md
7. Summary -> references/cg-review/assets/summary-template.md
8. Artifact root resolution -> references/_shared/artifact-root-resolution.md
9. Artifact path contract -> references/_shared/artifact-path-contract.md

On-demand:

- Protected artifacts -> references/_shared/protected-artifacts.md
- Unity testing -> references/cg-review/unity-testing.md
- Unity review guidance -> references/_shared/unity-review-guidance.md
- Error handling -> references/cg-review/error-handling.md

## Success Criteria

- VCS detected and target checked out.
- Context collected for agents.
- Agents completed (core + conditional).
- Findings synthesized and todos created.
- Summary report generated.
