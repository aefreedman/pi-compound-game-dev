# Research Agents for Feature Planning

This file contains the definitions and prompts for research agents used during feature planning.

When running from a coordination root, pass resolved `WORKSPACE_ROOT`,
`DOCS_ROOT`, and `TODOS_ROOT` into each subagent prompt so searches stay in the
correct workspace. Also pass root fast-pass findings from
references/_shared/repo-research-efficiency.md so delegated research stays
bounded. Invoke package-owned `cg-*` agents with `agentScope: "both"` so they remain discoverable when Compound Game Dev is installed project-locally; keep project-agent confirmation enabled.

---

## Local Research (Always Run - Routed)

Gather local codebase context and documented learnings before deciding whether supplemental research or docs cross-checks are needed.

Before delegation, the root/orchestrator agent performs the short fast pass from references/_shared/repo-research-efficiency.md. This keeps the main agent involved in the initial investigation and supports an explicit route decision instead of always asking subagents to map the repository.

Default to direct root-agent `rg`/read work for small, linear code investigations. Use deterministic repository search/excerpt tools when available for mechanical batched candidate discovery over known roots/terms. Use `cg-repo-researcher` only when the code research burden is large enough to benefit from parallelism.

Default to direct root-agent `cg_search_artifacts` or targeted `rg` for `${DOCS_ROOT}/solutions/` searches. The indexed docs search path is usually fast enough that a learnings subagent adds overhead rather than value. Use `cg-learnings-researcher` only for broad docs exploration that can run independently while the root agent or repo-research spikes inspect code.

When using repo researchers, run one or more `cg-repo-researcher` spikes in parallel from the root/orchestrator session after the fast pass. Prefer multiple small repo-research spikes over one broad repo-research task. Each repo researcher should receive one narrow question, 1-2 candidate roots, 3-6 candidate terms, already-read files, VCS type, ignore-file handling, a depth budget, and a target runtime of about 45 seconds or less.

### 1. cg-repo-researcher

**Purpose:** Run a fast, bounded evidence spike over one narrow area of the codebase.

The repo researcher is intentionally only a little more structured than the root agent running `rg` directly. Its main value is parallelism and isolation, not deeper synthesis. The root agent owns interpretation and planning.

If the feature spans multiple areas and would otherwise require roughly 10+ serial search/read operations or several minutes of attention, launch multiple `cg-repo-researcher` calls in parallel, each with a different slice. Example slices: UI surface, runtime behavior, editor/tooling, save/config data, content/asset pipeline.

Do not delegate just because a search exists. If the root agent can answer with roughly 6-8 targeted search/read operations over 1-2 obvious roots, use tools directly instead.

If you delegate to `cg-repo-researcher`, pass a bounded spike brief like:

```text
Run a fast repository research spike for one narrow slice. Do not map the whole repo, do not synthesize the plan, and do not continue after enough evidence exists. Target completion: ~45 seconds or less.

Feature background: {feature_description}
Slice question: {one narrow question this agent should answer}

Fast-pass findings from root agent:
- WORKSPACE_ROOT: {workspace_root}
- VCS: {plastic|git|none}
- Ignore handling: {e.g., use --ignore-file ignore.conf --ignore-file cloaked.conf when present}
- Scoped roots for this slice, max 1-2: {candidate_roots}
- Candidate terms/symbols for this slice, 3-6: {candidate_terms}
- Already-read or known-relevant files: {known_files}
- Project type hints: {engine/tool hints; if Unity detected and relevant to this slice, apply references/_shared/unity-repo-research.md guidance}
- Depth: {fast|focused|deep; default fast}

Fast depth limits:
- Search scoped roots first with VCS-aware ignore handling.
- Run only 2-3 targeted searches unless a result clearly points to one more.
- Read only the top 1-4 high-signal files.
- Return 2-4 evidence bullets or a scoped not-found result.
- Report uncertainty instead of expanding to generated, dependency, cache, build, vendor, or whole-repo searches.

Return only:
- Slice question, roots searched, terms searched, commands run, VCS/ignore handling, depth used, and stop reason
- Candidate files with why each is likely relevant
- Evidence bullets with compact file:line references and optional 1-3 line excerpts when useful
- Scoped not-found/uncertain notes
- Next reads for the root agent, if any
```

---

### 2. cg-learnings-researcher

**Purpose:** Optional broad search of documented solutions under `${DOCS_ROOT}/solutions/` for relevant gotchas, patterns, and lessons learned.

Do not delegate routine solution-doc lookups. The root agent should usually call `cg_search_artifacts` or targeted `rg` directly because indexed docs search is fast and the root agent must synthesize the findings anyway.

Delegate to `cg-learnings-researcher` only when the docs search itself has enough breadth to benefit from parallelism, such as many possible terms/modules, a large solution corpus, or a need to keep docs exploration running while code research proceeds.

If you delegate to `cg-learnings-researcher`, pass it a bounded brief like:

```text
Search for documented solutions and learnings related to this feature. Use `cg_search_artifacts` when available; otherwise fall back to rg/Grep-first filtering. For broad feature research, combine a structured/scoped indexed pass, a `matchMode="any"` indexed recall pass, and raw `rg` verification for exact symbols/error text before reading final markdown sources.

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

### From cg-repo-researcher spike(s):
- Slice question, roots searched, terms searched, commands run, VCS/ignore handling, depth budget, and stop reason
- Candidate files with why each may matter
- Evidence bullets with relevant file paths and line numbers, compacted by shared root and same-file line groups when useful
- Optional short excerpts that reduce immediate re-reading
- Scoped not-found/uncertain areas
- Recommended next reads for the root agent, if any

Do not treat repo-researcher summaries as final planning conclusions. The root agent should read or verify the most important evidence before relying on it.

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
1. Root/orchestrator agent performs the fast pass from references/_shared/repo-research-efficiency.md
2. If the fast pass detects Unity, load references/_shared/unity-repo-research.md and apply only relevant constraints to the chosen route
3. Choose the code research route: direct root-agent tools for small/linear work, deterministic search/excerpt tools for mechanical candidate discovery when available, or parallel repo-research spikes for larger independent slices
4. Search `${DOCS_ROOT}/solutions/` directly with `cg_search_artifacts` or targeted `rg` by default; delegate to `cg-learnings-researcher` only for broad docs exploration that benefits from parallelism
5. If using repo researchers, split repo research into 1-4 narrow slices; prefer multiple parallel fast slices over one broad subagent task
6. Make separate decisions for broad supplemental research and authoritative docs cross-checks based on the criteria above
7. Gather broad supplemental research only when needed
8. Perform a lightweight docs cross-check when the feature relies on external API/tool behavior and suitable docs or tools are available
9. Reconcile local patterns with docs and documented workarounds; flag unresolved contradictions as risks or open questions
10. Consolidate root fast-pass findings, direct/tool/subagent evidence, learnings, and any docs checks
11. Proceed to planning phase
