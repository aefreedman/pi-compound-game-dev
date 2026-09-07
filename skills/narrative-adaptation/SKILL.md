---
name: narrative-adaptation
description: Adapt or review existing branching narrative in a target dialogue format while preserving accepted copy, choices, and source logic. Use for a requested narrative adaptation or representative route review, not general prose editing, graph optimization, or bulk conversion.
---

# Narrative adaptation

Optional, on-demand guidance, not a mandatory game-development phase. It does not authorize project edits or replace project instructions.

## Establish authority

Before drafting, identify the requested slice, applicable project guidance, source logic, accepted target copy, editable target, and read-only inputs. Source logic governs conditions, effects, choices, and outcomes; explicitly accepted target copy governs wording where it supersedes source prose. Preserve required wording and choice labels, order, availability, and consequences. Do not restore superseded source wording or rewrite accepted copy for structural convenience. If authorities conflict or acceptance is unclear, stop the affected adaptation and ask; do not silently pick a winner.

## Adapt the conversation, not the source layout

- Follow forward conversational flow: each reply should answer the selected option and lead naturally to the next beat or exit. Source passage boundaries are evidence, not target node boundaries; never automatically mirror one source passage to one node.
- Prefer natural option fallthrough into the next local beat where the target format supports it. Use a jump for a genuine route transfer, skip, or exit; use a returning detour for a self-contained exchange whose caller should resume afterward. Confirm the target format's actual semantics before emitting executable syntax.
- Extract shared content only when distinct external callers need the same substantive exchange, with compatible entry state and continuation. A one-line acknowledgement is not a reason to extract. Self-reference does not count as reuse. Keep short connective replies local, even when their wording repeats; do not force reuse or erase route-specific context.
- Preserve choice meaning, state changes, and exit behavior before simplifying layout. No universal node count, graph-counting tool, exhaustive edge table, or minimum reuse quota substitutes for reading the conversation.

## Review one representative slice

Before proposing broader conversion, show a small multi-route slice containing ordinary continuation and any meaningful skip, detour, or shared exchange. Read the worked example only when drafting or reviewing that slice: use `cg_read_reference` with package-relative path `skills/narrative-adaptation/references/harbor-slice.md` (not a project-relative file read). If that tool is unavailable, report the missing reference access rather than guessing a project path. Reuse the unchanged reference within the current uncompacted phase; reload after compaction or content changes.

Return a compact human review: authority summary; entry and preconditions; each representative choice's conversational path and exit/effects; why any shared exchange has substantive external reuse; unresolved decisions and validation limits. Read the routes aloud/in sequence, including skipped content and detour return. Ask for acceptance before expanding scope. Structural/example checks prove only the checked document properties, not model behavior or runtime dialogue semantics.

Non-goals: bulk conversion, copy polishing without authorization, source mutation, new dialogue runtimes, graph optimization, or claims that this package fixes uninspected narrative-project instructions.
