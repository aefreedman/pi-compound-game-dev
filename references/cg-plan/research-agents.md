# Research Agents for Feature Planning

This file contains the definitions and prompts for research agents used during feature planning.

When running from a coordination root, pass resolved `WORKSPACE_ROOT`,
`DOCS_ROOT`, and `TODOS_ROOT` into each subagent prompt so searches stay in the
correct workspace.

---

## Local Research (Always Run - Parallel)

These agents gather context from the local codebase and documented learnings. Run them in parallel before deciding whether supplemental research is needed.

Run `cg-repo-researcher` and `cg-learnings-researcher` in parallel from the root/orchestrator session before deciding whether supplemental research is needed.

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
- Code examples showing existing patterns
- AGENTS.md conventions (if any)
- Technology assessment (familiar vs new to this project)
- Recommended file locations for new code
- Consistency notes (naming, style, architecture)
```

---

### 2. cg-learnings-researcher

**Purpose:** Search documented solutions in logical `docs/solutions/`
(`${DOCS_ROOT}/solutions/` physically) for relevant gotchas, patterns, and lessons learned.

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

## Supplemental Research (Manual/Tool-Assisted Only)

The package no longer registers generic external-research agents for best practices or framework documentation. Those versions were too web-framework-biased for game-development workflows.

When local research shows a real gap, gather supplemental information directly from project-local guidance, official engine/package documentation, or available documentation tools. Keep supplemental research game-dev-specific and cite the sources used.

---

## Research Decision Criteria

**When to run supplemental research:**

### High-Risk Topics → Always Research

These topics warrant supplemental research regardless of local context:
- **Security**: Authentication, authorization, data privacy, encryption
- **Payments**: Financial transactions, billing, payment processing
- **External APIs**: Third-party integrations, OAuth, webhooks
- **Data Privacy**: GDPR, CCPA, PII handling
- **Compliance**: HIPAA, SOC2, regulatory requirements

**Why:** The cost of missing something is too high. Supplemental research provides a safety net.

### Strong Local Context → Skip Supplemental Research

Skip supplemental research when:
- Codebase has good examples of similar functionality
- AGENTS.md has specific guidance for this feature type
- User knows exactly what they want (detailed requirements)
- Technology is already well-used in the project
- Recent similar work is documented in `${DOCS_ROOT}/solutions/`

**Why:** Supplemental research adds little value when local patterns are clear.

### Uncertainty or Unfamiliar Territory → Research

Run supplemental research when:
- User is exploring options (not sure of approach)
- Codebase has no examples of this functionality
- New technology or framework being introduced
- Complex algorithm or data structure needed
- Performance-critical code (optimization strategies)

**Why:** Project-specific external references help when local context is insufficient.

---

## Research Decision Announcement

After local research completes, announce the decision and proceed:

**Examples:**

```
Your codebase has solid patterns for this feature.
   Found 3 similar implementations in Assets/Scripts/.
   Proceeding without supplemental research.
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
   Proceeding without supplemental research.
```

**User can redirect:** If the decision doesn't match their intent, user can request research be added or skipped.

---

## Consolidating Research Findings

After all research completes, consolidate findings:

### From cg-repo-researcher:
- Relevant file paths (with line numbers)
- Code examples showing existing patterns
- AGENTS.md conventions
- Recommended file locations

### From cg-learnings-researcher:
- Relevant solution documents
- Key insights and gotchas
- Recommended patterns from institutional knowledge
- Cross-references

### From supplemental research (if performed):
- Official engine/package documentation
- Project-relevant game-dev practices
- Version compatibility notes
- Source URLs or local file paths

### Present consolidated summary:

```markdown
## Research Findings Summary

### Existing Patterns
- Player movement: Assets/Scripts/PlayerController.cs:42
- Input handling: Assets/Scripts/InputManager.cs:15
- Animation system: Assets/Scripts/AnimationController.cs:78

### Institutional Knowledge
- ${DOCS_ROOT}/solutions/player-null-reference-fix.md: Always null-check Rigidbody references
- ${DOCS_ROOT}/solutions/physics-performance.md: Use layer masks for physics queries

### Supplemental Research (if performed)
- Unity Input System docs: https://docs.unity3d.com/Packages/com.unity.inputsystem@latest
- Rigidbody reference: https://docs.unity3d.com/Manual/class-Rigidbody.html
- Project-relevant note: Cache frequently accessed components in initialization paths when profiling or hot-path usage justifies it
```

---

## Usage

**Load this file when:** Planning a feature and need to gather research context.

**Execution order:**
1. Run local research agents in parallel (always)
2. Make research decision based on criteria
3. Gather supplemental research directly only when needed
4. Consolidate all findings
5. Proceed to planning phase
