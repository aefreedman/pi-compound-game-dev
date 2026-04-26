# Removed Agents and Game-Dev Return Paths

This package removed several inherited Compound Engineering agents because they did not produce useful results in game-development workflows and carried strong web-framework assumptions.

## Removed from package-owned agent setup

| Removed agent | Former path | Why removed | Possible game-dev replacement |
|---|---|---|---|
| `best-practices-researcher` | `agents/research/best-practices-researcher.md` | Mapped research topics to Rails/Ruby, React, frontend design, generic web best practices, and tool-specific documentation lookup behavior instead of game-production context. | `cg-game-dev-practices-researcher`: focuses on engine/project conventions, genre examples, production constraints, platform requirements, performance budgets, accessibility, and official engine/package guidance. |
| `framework-docs-researcher` | `agents/research/framework-docs-researcher.md` | Assumed web framework/gem workflows such as `bundle show`, Gemfile.lock, and generic framework/library docs. | `cg-engine-docs-researcher`: focuses on official Unity/Unreal/Godot/custom-engine docs, package versions, platform SDK notes, engine migration notes, and source links relevant to the current project stack. |
| `performance-oracle` | `agents/review/performance-oracle.md` | Prioritized database indexes, CDN/cache layers, frontend bundle size, DOM work, API response targets, and Rails/ActiveRecord details. | `cg-performance-reviewer` or `cg-runtime-performance-specialist`: focuses on frame time, allocations/GC, Update/FixedUpdate hot paths, rendering, physics, asset loading, memory budgets, platform constraints, and profiling evidence. Web/service checks remain a subset for live-service, account, commerce, telemetry, or backend surfaces. |

## What was removed overall

The removed setup mostly covered broad web/software concerns:

- Rails/Ruby and gem-specific discovery
- React/frontend bundle and DOM performance
- generic web API/service research
- CDN/database/cache optimization as default performance concerns
- tool-specific documentation lookup instructions
- generic best-practice research that did not reliably route toward game-development sources

## What the game-dev equivalents should preserve

If any of these return, the replacement should be package-owned, `cg-` prefixed, and game-dev-native from the first instruction:

- Read `AGENTS.md` or equivalent project-local stack guidance first.
- Prefer local codebase conventions and documented project learnings before external research.
- Use official engine/package/platform docs when supplemental research is needed.
- Include web/service checks only when the change actually touches live-service, account, commerce, telemetry, backend, or web surfaces.
- Return concise, actionable findings with file paths, evidence, and project-relevant validation steps.
- Avoid tool-specific lookup names unless the workflow genuinely requires that tool.

## Reintroduction checklist

Before adding a replacement agent:

1. Choose a plain `cg-`-prefixed name, e.g. `cg-performance-reviewer`.
2. Add the agent file under the appropriate `agents/` subfolder.
3. Update every prompt/reference that delegates to the agent.
4. Add validation that removed legacy names do not return accidentally.
5. Smoke test the agent on a real game-dev change before making it part of a default workflow.
