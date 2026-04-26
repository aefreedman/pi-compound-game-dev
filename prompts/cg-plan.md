---
description: Transform feature descriptions into well-structured project plans following Compound Game Dev conventions
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

# Planning Features Skill

Purpose: produce a clear plan document. Do not code.
Note: the current year is 2026 for plan dates.

## Requirements

- Generated plans must include test-development recommendations.
- This requirement still applies when the project lacks a comprehensive test framework.


## Feature Description Required

<feature_description> $ARGUMENTS </feature_description>

If missing, ask for a clear feature description.

## External File Loading

CRITICAL: Use relative path references and load files only when needed for the current step.

- Do NOT preemptively load all reference files.
- Treat loaded references as mandatory instructions for the active task scope.
- Follow nested `@...` references recursively only when relevant.
- For long files, use Read with `offset`/`limit` to load only needed sections.

## Workflow

### Step 0: Resolve Artifact Roots

Load ../references/_shared/artifact-root-resolution.md and
../references/_shared/artifact-path-contract.md.


### Step 1: Local Research (Always)

Load ../references/cg-plan/research-agents.md and run:

- cg-repo-researcher
- cg-learnings-researcher

### Step 1.5: Supplemental Research (Conditional)

Use criteria in ../references/cg-plan/research-agents.md.

### Step 1.6: Consolidate Findings

- Include file references with line numbers.
- Capture institutional learnings from `${DOCS_ROOT}/solutions/`.
- Include source links if supplemental research was needed.

### Step 2: Choose Detail Level

Use ../references/cg-plan/detail-level-templates.md.

### Step 3: SpecFlow Analyzer

Use ../references/cg-plan/specflow.md.

### Step 4: Write the Plan

Load the template:

- Minimal: ../references/cg-plan/assets/plan-template-minimal.md
- Standard: ../references/cg-plan/assets/plan-template-standard.md
- Comprehensive: ../references/cg-plan/assets/plan-template-comprehensive.md

Apply ../references/cg-plan/formatting-guidelines.md.

### Step 5: Output

Write to:

- Logical path: `docs/plans/YYYY-MM-DD-<type>-<descriptive-name>-plan.md`
- Physical path: `${DOCS_ROOT}/plans/YYYY-MM-DD-<type>-<descriptive-name>-plan.md`

### Step 6: Issue Creation (Optional)

Use ../references/cg-plan/issue-tracker-integration.md.
Use `issue_tracker: github|codecks|none` in AGENTS.md; treat missing/unknown values as `none`.

## Reference Files (Load On Demand)

1. Research agents -> ../references/cg-plan/research-agents.md
2. Detail level selection -> ../references/cg-plan/detail-level-templates.md
3. SpecFlow -> ../references/cg-plan/specflow.md
4. Formatting -> ../references/cg-plan/formatting-guidelines.md
5. Templates -> ../references/cg-plan/assets/plan-template-minimal.md,
   ../references/cg-plan/assets/plan-template-standard.md,
   ../references/cg-plan/assets/plan-template-comprehensive.md
6. Issue creation -> ../references/cg-plan/issue-tracker-integration.md
7. Artifact root resolution -> ../references/_shared/artifact-root-resolution.md
8. Artifact path contract -> ../references/_shared/artifact-path-contract.md

## Ambiguity Handling

Do not run a separate pre-planning discovery workflow. If the feature description is unclear, ask targeted clarification questions inline, one at a time, before writing the plan.
