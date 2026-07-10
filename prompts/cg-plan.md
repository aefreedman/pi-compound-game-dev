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
- Do not call `cg_read_reference` again for the same unchanged section during the current uncompacted workflow phase. Reuse loaded instructions; reload after compaction only when they are no longer retained, or when a later stage explicitly needs a different section or updated content.
- Do NOT preemptively load all reference files.
- Treat loaded references as mandatory instructions for the active task scope.
- For long files, use `cg_read_reference` with `offset`/`limit` to load only needed sections.

## Workflow

### Step 0: Resolve Artifact Roots

Load references/_shared/artifact-root-resolution.md and
references/_shared/artifact-path-contract.md.


### Step 1: Local Research (Always)

Only the root/orchestrator session may invoke subagents. Delegated workers must complete their bounded direct task or return a parent handoff rather than launching this planning workflow or nested specialists.

Load references/cg-plan/research-agents.md, references/_shared/repo-research-efficiency.md, and references/_shared/subagent-execution-profiles.md.

Run the root fast pass from references/_shared/repo-research-efficiency.md before choosing a research route: read local guidance, detect VCS, discover ignore files, identify likely source/content roots, classify authoritative/read-only inputs versus implementation and generated targets, and run a few focused searches from the feature terms. If the fast pass detects a Unity project, load references/_shared/unity-repo-research.md and apply it conditionally; otherwise stay engine/tool agnostic.

Then choose the fastest honest research route:

- Research directly with root-agent tools when the next step is a linear investigation: 1-2 obvious roots/files, a single subsystem/question, up to roughly 6-8 targeted search/read operations, and only a few files to inspect.
- Use `cg_search_repo` when available for mechanical candidate discovery over known roots/terms; treat it as bounded VCS-/Unity-aware `rg` evidence, not as synthesis. Only completed `no_matches` query/root cells are negative evidence.
- Use `cg-repo-researcher` only when the research burden is large enough to gain speed from parallelism: 2+ independent slices, likely 10+ serial search/read operations or several minutes of attention, and each slice can be bounded to about 45 seconds or less.
- When using repo researchers, prefer 2-4 parallel calls for separate roots/subsystems/questions. Each brief must include one narrow question, 1-2 candidate roots, 3-6 terms/symbols, VCS/ignore instructions, desired depth, and the ~45 second target.
- Do not ask a repo researcher to understand the whole feature or synthesize the plan; the root agent owns synthesis.
- Search `${DOCS_ROOT}/solutions/` directly with `cg_search_artifacts` or targeted `rg` by default; use `cg-learnings-researcher` only for broad docs exploration that is large enough to benefit from running in parallel with code research.

### Step 1.5: Supplemental Research and Docs Cross-Check (Conditional)

Use criteria in references/cg-plan/research-agents.md. Make separate decisions for broad supplemental research and lightweight authoritative docs cross-checks when the plan depends on external engine/framework/package/platform/tool API behavior.

### Step 1.6: Consolidate Findings

- Include file references with line numbers.
- Use compact file-reference formatting from references/cg-plan/formatting-guidelines.md: declare shared path roots once, group same-file line numbers, use line ranges for related blocks, and use an evidence index for dense reference sets.
- Capture institutional learnings from `${DOCS_ROOT}/solutions/`.
- Include source links, local docs paths, or documentation tool/page identifiers if supplemental research or a docs cross-check was performed.

### Step 2: Choose Detail Level

Use references/cg-plan/detail-level-templates.md.

### Step 3: SpecFlow Analysis

Use references/cg-plan/specflow.md. Analyze directly for a small flow surface or delegate `cg-spec-flow-analyzer` with `agentScope: "both"`, bounded read-only inputs, and its exact output contract when an isolated pass is worthwhile.

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
2. Subagent execution profiles -> references/_shared/subagent-execution-profiles.md
3. Detail level selection -> references/cg-plan/detail-level-templates.md
4. SpecFlow -> references/cg-plan/specflow.md
5. Formatting -> references/cg-plan/formatting-guidelines.md
6. Templates -> references/cg-plan/assets/plan-template-minimal.md,
   references/cg-plan/assets/plan-template-standard.md,
   references/cg-plan/assets/plan-template-comprehensive.md
7. Issue creation -> references/cg-plan/issue-tracker-integration.md
8. Artifact root resolution -> references/_shared/artifact-root-resolution.md
9. Artifact path contract -> references/_shared/artifact-path-contract.md
10. Repo research efficiency -> references/_shared/repo-research-efficiency.md
10. Unity repo research (conditional) -> references/_shared/unity-repo-research.md

## Ambiguity Handling

Do not run a separate pre-planning discovery workflow. If the feature description is unclear, ask targeted clarification questions inline, one at a time, before writing the plan.
