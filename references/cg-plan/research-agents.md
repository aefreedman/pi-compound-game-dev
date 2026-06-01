# Research Agents for Feature Planning

This file contains the definitions and prompts for research agents used during feature planning.

When running from a coordination root, pass resolved `WORKSPACE_ROOT`,
`DOCS_ROOT`, and `TODOS_ROOT` into each subagent prompt so searches stay in the
correct workspace.

---

## Local Research (Always Run - Parallel)

These agents gather context from the local codebase and documented learnings. Run them in parallel before deciding whether supplemental research or docs cross-checks are needed.

Run `cg-repo-researcher` and `cg-learnings-researcher` in parallel from the root/orchestrator session before deciding whether supplemental research or docs cross-checks are needed.

### 1. cg-repo-researcher

**Purpose:** Understand existing patterns, conventions, and technology familiarity in the codebase.

If you delegate to `cg-repo-researcher`, pass it a brief like:

```text
Analyze the codebase for patterns and conventions related to this feature:

Feature: {feature_description}

Research focus:
- Existing patterns: How is similar functionality implemented?
- Technology familiarity: Is this tech stack already used in the project?
- AGENTS.md guidance: Are there documented conventions for this type of work?
- Pattern consistency: What naming, structure, and style conventions should be followed?
- File organization: Where should new code live based on existing structure?

Return:
- Relevant file paths with line numbers (e.g., Assets/Scripts/PlayerController.cs:42)
- Compact same-file references when useful (e.g., Assets/Scripts/PlayerController.cs:42,88-104)
- A shared reference root if it avoids repeating a long path prefix
- Code examples showing existing patterns
- AGENTS.md conventions (if any)
- Technology assessment (familiar vs new to this project)
- Recommended file locations for new code
- Consistency notes (naming, style, architecture)
```

---

### 2. cg-learnings-researcher

**Purpose:** Search documented solutions under `${DOCS_ROOT}/solutions/` for relevant gotchas, patterns, and lessons learned.

If you delegate to `cg-learnings-researcher`, pass it a brief like:

```text
Search for documented solutions and learnings related to this feature:

Feature: {feature_description}

Research focus:
- ${DOCS_ROOT}/solutions/: Any documented problems/solutions that apply?
- Gotchas: Known issues or pitfalls to avoid
- Patterns: Recommended approaches from past experience
- Lessons learned: What worked or didn't work in similar situations
- Related problems: Similar features or fixes documented

Return:
- Relevant solution documents with file paths
- Key insights from past problems
- Gotchas to avoid (with examples)
- Recommended patterns from institutional knowledge
- Cross-references to related solutions
```

---

## Supplemental Research and Authoritative Docs Cross-Checks

The package no longer registers generic external-research agents for best practices or framework documentation. Those versions were too web-framework-biased for game-development workflows.

Distinguish two kinds of research after local research completes:

1. **Broad supplemental research** - deeper game-dev-specific investigation for gaps, unfamiliar territory, high-risk domains, or open-ended approach selection.
2. **Authoritative docs cross-check** - a lightweight verification pass against project-appropriate engine, framework, SDK, package, platform, or tool documentation when the plan depends on external API behavior.

Strong local patterns may skip broad supplemental research, but they do not automatically skip an authoritative docs cross-check for API-sensitive behavior. Local examples can be stale, workaround-driven, or accidentally inconsistent with documented package behavior.

Compound Game Dev must stay engine/tool agnostic. Do not assume Unity, Unreal, Godot, or any companion Pi documentation package is present. Use available sources in this order:

1. Project guidance from `AGENTS.md`, README, local docs, and package/tool docs checked into the project.
2. Engine/package/platform documentation included with the project or installed locally.
3. Available Pi documentation tools or skills for the detected stack, if they exist in the active session.
4. Official vendor documentation reachable through available tools.

If no appropriate documentation source or tool is available, say so. Do not claim an authoritative docs check was performed.

---

## Research Decision Criteria

**When to run broad supplemental research or a docs cross-check:**

### High-Risk Topics → Always Research

These topics warrant broad supplemental research regardless of local context:
- **Security**: Authentication, authorization, data privacy, encryption
- **Payments**: Financial transactions, billing, payment processing
- **External APIs**: Third-party integrations, OAuth, webhooks
- **Data Privacy**: GDPR, CCPA, PII handling
- **Compliance**: HIPAA, SOC2, regulatory requirements

**Why:** The cost of missing something is too high. Supplemental research provides a safety net.

### Strong Local Context → May Skip Broad Supplemental Research

Skip broad supplemental research when:
- Codebase has good examples of similar functionality
- AGENTS.md has specific guidance for this feature type
- User knows exactly what they want (detailed requirements)
- Technology is already well-used in the project
- Recent similar work is documented in `${DOCS_ROOT}/solutions/`

**Why:** Broad supplemental research adds little value when local patterns are clear.

**Important:** This skip decision does not cover authoritative docs cross-checks. If the plan relies on external engine/framework/package/platform API behavior, still perform a lightweight docs cross-check when suitable docs or tools are available.

### External API or Tool Behavior → Cross-Check Authoritative Docs

Run a lightweight docs cross-check when the feature depends on behavior from:
- Game engines and editor APIs
- Engine packages, plugins, SDKs, middleware, or platform services
- Serialization, asset pipelines, build pipelines, package managers, testing frameworks, or content import/export tools
- Runtime subsystems such as input, physics, animation, audio, rendering, networking, UI, navigation, save data, localization, or async/task/coroutine systems

**Why:** Local usage should be reconciled with the documented behavior of the engine/package/tool. Common local patterns may still be outdated, accidental, or an undocumented workaround.

When local patterns conflict with authoritative docs:
- Search `${DOCS_ROOT}/solutions/` and project guidance for an intentional workaround.
- If a workaround is documented, cite it and follow the project-specific workaround.
- If no workaround is documented, flag the mismatch as a planning risk or open question.
- Do not silently treat local usage as correct just because it is common.

### Uncertainty or Unfamiliar Territory → Research

Run broad supplemental research when:
- User is exploring options (not sure of approach)
- Codebase has no examples of this functionality
- New technology or framework being introduced
- Complex algorithm or data structure needed
- Performance-critical code (optimization strategies)

**Why:** Project-specific external references help when local context is insufficient.

---

## Research Decision Announcement

After local research completes, announce both decisions: broad supplemental research and authoritative docs cross-check.

**Examples:**

```
Your codebase has solid patterns for this feature.
   Found 3 similar implementations in the gameplay source tree.
   Skipping broad supplemental research.
   This is a project-local content change with no external API behavior assumptions, so no docs cross-check is needed.
```

```
Your codebase has solid patterns for this feature.
   Found 3 similar implementations in the gameplay source tree.
   Skipping broad supplemental research.
   This touches engine/package API behavior, and an appropriate docs source is available, so I am doing a lightweight authoritative docs cross-check.
```

```
🔍 This involves payment processing (high-risk).
   Gathering supplemental security references.
```

```
🔍 No existing examples found in codebase.
   Gathering supplemental implementation references.
```

```
⚡ You provided detailed requirements and clear approach.
   Codebase patterns match your needs.
   Skipping broad supplemental research.
   The feature depends on package API behavior, but no suitable docs source/tool is available; I will flag docs verification as an open risk.
```

**User can redirect:** If the decision doesn't match their intent, user can request research be added or skipped.

---

## Consolidating Research Findings

After all research completes, consolidate findings:

### From cg-repo-researcher:
- Relevant file paths with line numbers, compacted by shared root and same-file line groups when useful
- Code examples showing existing patterns
- AGENTS.md conventions
- Recommended file locations

### From cg-learnings-researcher:
- Relevant solution documents
- Key insights and gotchas
- Recommended patterns from institutional knowledge
- Cross-references

### From supplemental research or docs cross-checks (if performed):
- Official engine/package/platform/tool documentation
- Project-relevant game-dev practices
- Version compatibility notes
- Source URLs, local docs paths, or documentation tool/page identifiers
- Reconciliation notes for any mismatch between local patterns and authoritative docs

### Present consolidated summary:

```markdown
## Research Findings Summary

### Existing Patterns
References use paths relative to the main gameplay source root unless noted.

- Player movement: `PlayerController.cs:42,88-104`
- Input handling: `InputManager.cs:15`
- Animation system: `AnimationController.cs:78`

### Institutional Knowledge
- ${DOCS_ROOT}/solutions/player-null-reference-fix.md: Always null-check Rigidbody references
- ${DOCS_ROOT}/solutions/physics-performance.md: Use layer masks for physics queries

### Supplemental Research / Docs Cross-Check (if performed)
- Official engine/package docs: [source path, tool page identifier, or URL]
- Version compatibility note: [engine/package/platform version relevance]
- Reconciliation note: [local pattern agrees with docs, documented workaround applies, or mismatch flagged as risk]
```

---

## Usage

**Load this file when:** Planning a feature and need to gather research context.

**Execution order:**
1. Run local research agents in parallel (always)
2. Make separate decisions for broad supplemental research and authoritative docs cross-checks based on the criteria above
3. Gather broad supplemental research only when needed
4. Perform a lightweight docs cross-check when the feature relies on external API/tool behavior and suitable docs or tools are available
5. Reconcile local patterns with docs and documented workarounds; flag unresolved contradictions as risks or open questions
6. Consolidate all findings
7. Proceed to planning phase
