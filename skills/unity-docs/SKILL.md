---
name: unity-docs
description: Capture solved Unity problems as categorized documentation with YAML frontmatter for fast lookup
---
# unity-docs Skill

Purpose: document solved Unity problems into logical `docs/solutions/`
with validated YAML frontmatter.

## External File Loading

CRITICAL: Use relative path references and load files only when needed for the current step.

- Do NOT preemptively load all reference files.
- Treat loaded references as mandatory instructions for the active task scope.
- Follow nested `@...` references recursively only when relevant.
- For long files, use Read with `offset`/`limit` to load only needed sections.

## Workflow

### Step 0: Resolve Artifact Roots

Load ../../references/_shared/artifact-root-resolution.md and
../../references/_shared/artifact-path-contract.md.

### Step 1: Detect Confirmation

Only proceed for non-trivial solutions. If in doubt, ask for clarification.

### Step 2: Gather Context

Required:

- Module/subsystem
- Exact symptoms or error message
- Investigation attempts
- Root cause
- Solution and prevention
- Environment details (Unity version, platform, render pipeline)

If critical context is missing, ask and wait.

### Step 3: Check Existing Docs (Optional)

Search `${DOCS_ROOT}/solutions/` for similar issues. If found, ask whether to
create a new doc, update existing, or link.

### Step 4: Generate Filename

Format: `[sanitized-symptom]-[module]-[YYYYMMDD].md`

### Step 5: Validate YAML Schema (Blocking)

Validate against:

- ../unity-docs/schema.yaml
- ../unity-docs/references/yaml-schema.md

Do not proceed if validation fails.

### Step 6: Create Documentation

Use ../unity-docs/assets/resolution-template.md and write to:

- Logical path: `docs/solutions/<category>/<filename>.md`
- Physical path: `${DOCS_ROOT}/solutions/<category>/<filename>.md`

### Step 7: Critical Pattern Recommendation

After creating the documentation, assess whether the solution should be elevated to a critical pattern.

Recommend elevation only when the documented solution is likely to prevent repeated high-impact failures, such as:

- a recurring Unity-specific failure mode or team-wide pitfall
- a bug pattern that can cause data loss, broken builds, major content loss, or player-facing regressions
- a non-obvious engine/editor/package interaction that future work is likely to hit again
- a project convention that should become required reading before touching a subsystem

If the doc meets that bar, tell the user why and recommend creating a critical pattern entry using ../unity-docs/assets/critical-pattern-template.md. Do not auto-promote without explicit confirmation.

If it does not meet that bar, state that no critical-pattern elevation is recommended and why.

## Reference Files (Load On Demand)

1. YAML schema -> ../unity-docs/schema.yaml
2. YAML guide -> ../unity-docs/references/yaml-schema.md
3. Resolution template -> ../unity-docs/assets/resolution-template.md
4. Artifact root resolution -> ../../references/_shared/artifact-root-resolution.md
5. Artifact path contract -> ../../references/_shared/artifact-path-contract.md

On-demand:

- Error handling -> ../unity-docs/references/error-handling.md
- Quality guidelines -> ../unity-docs/references/quality-guidelines.md
- Example -> ../unity-docs/references/example.md
- Critical pattern template -> ../unity-docs/assets/critical-pattern-template.md
