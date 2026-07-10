# Review Agent Routing and Briefs

Use this reference to select only the review agents that match the change. Pass `$CHANGED_FILES`, `$PR_TITLE`, `$FOCUS_AREAS`, `$FILE_COUNT`, stack/project hints, and known evidence or constraints.

When invoking package-owned `cg-*` agents, use `agentScope: "both"` so agents remain discoverable when Compound Game Dev is installed project-locally. Rely on the runtime's Pi-trust-aware policy: trusted projects run without another prompt, while untrusted interactive projects retain one fallback decision per session. Apply references/_shared/subagent-execution-profiles.md per review slice: inherit by default, use low/medium for easily verified bounded checks, and reserve higher thinking for ambiguity or risk rather than agent title alone.

Before delegation, load applicable project guidance. If Unity is detected, load `references/_shared/unity-review-guidance.md` and pass only the checks relevant to each specialist. Do not ask every agent to rediscover the whole project.

## Selection Table

| Agent | Use when | Skip when |
|---|---|---|
| `cg-vcs-history-analyzer` | A bounded history question could explain changed code or a suspicious pattern | History is irrelevant, files are untracked, or no specific question exists |
| `cg-architecture-specialist` | Code changes affect boundaries, dependencies, contracts, or lifecycle ownership | Text/content-only change with no structural consequence |
| `cg-code-simplicity-reviewer` | Implementation code may contain avoidable complexity | Generated/content-only change or no concrete simpler path is plausible |
| `cg-security-reviewer` | The change touches secrets, privacy, unsafe inputs, trust boundaries, accounts, services, mods, networking, commerce, or release security | No concrete security/privacy surface exists |
| `cg-data-integrity-reviewer` | Persisted state, serialization, saves, stable references, schemas, or atomic writes change | No persisted or serialized state is affected |
| `cg-agent-native-reviewer` | The product intentionally exposes an agent-facing capability or changes an existing agent surface | The product has no intended agent surface |
| `cg-learnings-researcher` | A broad project solutions corpus may contain relevant prior incidents or patterns and parallel search is worthwhile | A few direct `cg_search_artifacts`/`rg` queries are sufficient |
| `cg-pattern-specialist` | The user explicitly requests a bounded cross-module consistency or duplication audit | Routine changed-file/PR review |

Migration and deployment routing are defined in `references/cg-review/conditional-agents.md`.

## Brief: VCS History

```text
Read-only history question: [specific question]
Files (max 5):
$CHANGED_FILES
Known VCS/root: [if known]
Relevant range: [if any]

Inspect bounded history and selected diffs. Separate observations from inferences, report uncertainty, and stop when the question is answered.
```

## Brief: Architecture

```text
Review structural consequences in:
$CHANGED_FILES

Title: $PR_TITLE
Focus: $FOCUS_AREAS
Relevant architecture/project guidance: [paths or summary]

Review only boundaries, dependency direction, contracts, and lifecycle/resource ownership. Require concrete mechanisms and route local simplicity, performance, persistence, migration, security, and deployment concerns to their owners.
```

## Brief: Simplicity

```text
Review accidental complexity in:
$CHANGED_FILES

Requirements and focus: $FOCUS_AREAS
Relevant local examples/conventions: [paths or summary]

Report only concrete simpler alternatives that preserve required behavior. Suppress generic naming/style cleanup and broad refactors.
```

## Brief: Security

```text
Review concrete security/privacy risk in:
$CHANGED_FILES

Title: $PR_TITLE
Relevant trust surfaces: [accounts/networking/mods/services/files/platform/etc.]

Establish protected assets, actor/access, reachable path, impact, controls, and confidence. Redact secrets and avoid live/destructive validation.
```

## Brief: Data Integrity

```text
Review persisted-state correctness in:
$CHANGED_FILES

Affected stores/readers/writers: [known context]
Relevant save/schema/serialization guidance: [paths or summary]

Focus on invariants, compatibility, defaults, stable references, atomicity, interruption, and corruption paths. Route concrete transformations to migration and privacy to security.
```

## Brief: Agent-Native

```text
Review the intended agent-facing surface changed by:
$CHANGED_FILES

Intended user outcomes and agent capabilities: [known context]
Authorization/context model: [known context]

Assess intended capability coverage, context, shared-state visibility, safeguards, and observable outcomes. Do not require parity where no agent surface is intended or where an explicit safety/platform exception applies.
```

## Brief: Learnings

```text
Search project solution documentation for prior learnings relevant to this review.

Changed files: $CHANGED_FILES
Title: $PR_TITLE
Focus: $FOCUS_AREAS
Resolved docs/solutions roots: [paths]
Known searches already run: [terms/results]

Use bounded indexed search plus exact verification. Read source markdown before citation. Return evidence and applicability confidence, not a full implementation plan.
```

## Brief: Pattern Audit

Use only for an explicitly requested broader audit.

```text
Audit this cross-codebase pattern question: [specific question]
Bounded roots/modules: [paths]
Exclusions and sample limits: [scope]
Known baseline/convention: [guidance or representative paths]

Compare multiple implementations, record searches and negative evidence, respect intentional variation, and avoid routine PR-review concerns owned by architecture or simplicity.
```

## Execution Pattern

1. Select only applicable agents from the table and conditional-agent criteria.
2. Give every selected agent one bounded question, exact files/roots, known parent evidence, mutation authority (normally read-only), validation expectations, and a stop condition.
3. Launch independent selected agents in one parallel delegation call when practical, using `agentScope: "both"`.
4. Treat `Not applicable`, `No concrete findings`, and scoped negative evidence as valid results.
5. Wait for selected results, run any truly conditional migration/deployment reviews, then synthesize without duplicating findings across owners.
