---
description: Transform feature descriptions into well-structured project plans following Compound Game Dev conventions
---
# Planning Features

Purpose: produce a clear plan document. Do not code.
Note: the current year is 2026 for plan dates.

## Requirements

- Generated plans must include test-development recommendations.
- This requirement still applies when the project lacks a comprehensive test framework.


## Feature Description Required

<feature_description> $ARGUMENTS </feature_description>

If missing, ask for a clear feature description.

## Package Reference Loading

CRITICAL: Use `cg_read_reference` for Compound Game Dev package reference files.

- Pass package-relative paths such as `references/cg-plan/research-agents.md`.
- When an instruction says to load, use, or see a package reference path, call `cg_read_reference` for that path.
- Do NOT use `read` with `references/...`; file tools resolve relative to the current project cwd, not this package.
- Do NOT preemptively load all reference files.
- Treat loaded references as mandatory instructions for the active task scope.
- For long files, use `cg_read_reference` with `offset`/`limit` to load only needed sections.

## Workflow

### Step 0: Resolve Artifact Roots

Load references/_shared/artifact-root-resolution.md and
references/_shared/artifact-path-contract.md.


### Step 1: Local Research (Always)

Load references/cg-plan/research-agents.md and run:

- cg-repo-researcher
- cg-learnings-researcher

### Step 1.5: Supplemental Research and Docs Cross-Check (Conditional)

Use criteria in references/cg-plan/research-agents.md. Make separate decisions for broad supplemental research and lightweight authoritative docs cross-checks when the plan depends on external engine/framework/package/platform/tool API behavior.

### Step 1.6: Consolidate Findings

- Include file references with line numbers.
- Capture institutional learnings from `${DOCS_ROOT}/solutions/`.
- Include source links, local docs paths, or documentation tool/page identifiers if supplemental research or a docs cross-check was performed.

### Step 2: Choose Detail Level

Use references/cg-plan/detail-level-templates.md.

### Step 3: SpecFlow Analyzer

Use references/cg-plan/specflow.md.

### Step 4: Write the Plan

Load the template:

- Minimal: references/cg-plan/assets/plan-template-minimal.md
- Standard: references/cg-plan/assets/plan-template-standard.md
- Comprehensive: references/cg-plan/assets/plan-template-comprehensive.md

Apply references/cg-plan/formatting-guidelines.md.

### Step 5: Output

Write to the physical path:

- `${DOCS_ROOT}/plans/YYYY-MM-DD-<type>-<descriptive-name>-plan.md`

### Step 6: Issue Creation (Optional)

Use references/cg-plan/issue-tracker-integration.md.
Use `issue_tracker: github|codecks|none` in AGENTS.md; treat missing/unknown values as `none`.

## Reference Files (Load On Demand)

1. Research agents -> references/cg-plan/research-agents.md
2. Detail level selection -> references/cg-plan/detail-level-templates.md
3. SpecFlow -> references/cg-plan/specflow.md
4. Formatting -> references/cg-plan/formatting-guidelines.md
5. Templates -> references/cg-plan/assets/plan-template-minimal.md,
   references/cg-plan/assets/plan-template-standard.md,
   references/cg-plan/assets/plan-template-comprehensive.md
6. Issue creation -> references/cg-plan/issue-tracker-integration.md
7. Artifact root resolution -> references/_shared/artifact-root-resolution.md
8. Artifact path contract -> references/_shared/artifact-path-contract.md

## Ambiguity Handling

Do not run a separate pre-planning discovery workflow. If the feature description is unclear, ask targeted clarification questions inline, one at a time, before writing the plan.
