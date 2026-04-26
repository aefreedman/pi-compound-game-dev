---
description: Review changes using stack-aware multi-agent analysis
---
## Orchestration

- Delegate specialist work only from the root workflow session when helpful.
- Delegated workers must return handoffs rather than spawning more workers.
- Nested delegation is blocked at runtime.

## Game-Development Stack Awareness

- Read project-specific stack guidance from `AGENTS.md` or a similar project-local guidance file when present.
- Detect what can be detected about the engine, VCS, project tracker, build/test pipeline, and content pipeline.
- Ask targeted questions for missing stack facts instead of assuming Git, GitHub, Unity, PlasticSCM, Codecks, or any other tool.
- Use companion Pi packages when available and relevant; otherwise provide a clear fallback.

# Reviewing Code Skill

Purpose: perform a thorough review using parallel agents and structured synthesis.

## External File Loading

CRITICAL: Use relative path references and load files only when needed for the current step.

- Do NOT preemptively load all reference files.
- Treat loaded references as mandatory instructions for the active task scope.
- Follow nested `@...` references recursively only when relevant.
- For long files, use Read with `offset`/`limit` to load only needed sections.

## Workflow

### Step 0: Detect VCS

Load ../references/_shared/vcs-detection.md and branch to Git or Plastic flow.

### Step 1: Determine Review Target and Setup

- Git: load ../references/cg-review/git-workflow.md.
- Plastic: load ../references/cg-review/plastic-workflow.md and `using-plastic` skill.

Ensure code is ready in a worktree/workspace before analysis.

### Step 2: Collect Review Context

Use the VCS workflow to collect:

- Changed files
- Review title/body
- Focus areas
- File count

### Step 3: Launch Parallel Review Agents

Use prompts in ../references/cg-review/agent-prompts.md.

### Step 4: Run Conditional Agents (If Needed)

Use criteria and prompts in ../references/cg-review/conditional-agents.md.

### Step 5: Synthesize Findings and Create Todos

Load:

- ../references/cg-review/synthesis-and-todos.md
- ../references/_shared/protected-artifacts.md
- ../references/_shared/artifact-root-resolution.md
- ../references/_shared/artifact-path-contract.md

Create todos using the file-todos skill.

### Step 6: Generate Summary Report

Use ../references/cg-review/assets/summary-template.md.

### Step 7: Optional Unity Testing

See ../references/cg-review/unity-testing.md.

## Error Handling

See ../references/cg-review/error-handling.md.

## Reference Files (Load On Demand)

1. VCS detection -> ../references/_shared/vcs-detection.md
2. Git workflow -> ../references/cg-review/git-workflow.md
3. Plastic workflow -> ../references/cg-review/plastic-workflow.md
4. Core agents -> ../references/cg-review/agent-prompts.md
5. Conditional agents -> ../references/cg-review/conditional-agents.md
6. Synthesis/todos -> ../references/cg-review/synthesis-and-todos.md
7. Summary -> ../references/cg-review/assets/summary-template.md
8. Artifact root resolution -> ../references/_shared/artifact-root-resolution.md
9. Artifact path contract -> ../references/_shared/artifact-path-contract.md

On-demand:

- Protected artifacts -> ../references/_shared/protected-artifacts.md
- Unity testing -> ../references/cg-review/unity-testing.md
- Error handling -> ../references/cg-review/error-handling.md

## Success Criteria

- VCS detected and target checked out.
- Context collected for agents.
- Agents completed (core + conditional).
- Findings synthesized and todos created.
- Summary report generated.
