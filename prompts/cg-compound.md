---
description: Capture solved problems and compound team knowledge
---
# cg-compound

Purpose: detect multiple solved problems in a session and document each using `unity-docs` sequentially.

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

### Step 1: Detect and Verify Solved-Problem Candidates

- Scan conversation for confirmation phrases as discovery signals, not proof by themselves.
- Extract context windows, problem indicators, and the confirmation provenance for each candidate.
- Require at least one recorded provenance source tied directly to the reported outcome: explicit user confirmation, direct validation of the reported scenario, a reproduced failure followed by a passing equivalent check, or another direct recorded evidence source.
- Keep the resolution and root-cause claim within what that evidence supports. If provenance is absent or a generic phrase such as "done" is not tied to the original symptom, skip solution-document creation rather than presenting an investigation as solved.
- Create a short description per verified solution candidate.

See references/cg-compound/detection-phrases.md.

### Step 2: Document Each Solution (Sequential)

- Invoke `unity-docs` one verified solution at a time.
- Provide a focus hint (problem, timestamp, candidate phrase, confirmation provenance, observed evidence, and remaining validation gaps).
- Require the generated solution document to record that validation/confirmation evidence.
- Wait for completion before moving on.

### Step 3: Summary Report

Use references/cg-compound/summary-template.md.

## Error Handling

See references/cg-compound/error-handling.md.

## Reference Files (Load On Demand)

1. Detection phrases -> references/cg-compound/detection-phrases.md
2. Summary -> references/cg-compound/summary-template.md
3. Artifact root resolution -> references/_shared/artifact-root-resolution.md
4. Artifact path contract -> references/_shared/artifact-path-contract.md

On-demand:

- Examples -> references/cg-compound/examples.md
- Best practices -> references/cg-compound/best-practices.md
- Future enhancements -> references/cg-compound/future-enhancements.md
