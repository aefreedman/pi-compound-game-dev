# Repository Research Efficiency

Use this reference when planning, reviewing, or delegating repository research. The goal is enough evidence to guide the next planning step, not a complete repository audit.

---

## Root Fast Pass Before Delegation

The root/orchestrator agent should do a short fast pass before launching `cg-repo-researcher`:

1. Read `AGENTS.md` or equivalent local guidance when present.
2. Detect VCS and workspace style:
   - Plastic: `cm status` succeeds or `.plastic/` exists.
   - Git: `.git/` exists and Plastic was not detected.
3. Discover repo-local ignore files such as `ignore.conf`, `cloaked.conf`, `.gitignore`, or engine-specific ignore files.
4. List top-level roots and likely source/content roots.
5. Run one to three focused searches using terms from the feature request.
6. Pass candidate terms, likely roots, relevant files already found, VCS type, and ignore-file notes to delegated agents.

The root agent remains responsible for the investigation. Subagent output is a parallel evidence source to verify and synthesize, not a substitute for the root agent reading the most relevant files.

---

## Plastic-Aware Search

`rg` does not automatically honor Plastic SCM ignore/cloak files. In Plastic workspaces, include root ignore files explicitly when present:

```bash
rg --ignore-file ignore.conf --ignore-file cloaked.conf --files .
rg --ignore-file ignore.conf --ignore-file cloaked.conf -n "SearchTerm" .
```

If an ignore file is absent, omit that flag instead of failing the search.

Prefer running searches from the resolved workspace root so relative ignore patterns apply correctly.

---

## Bounded Delegation Contract

When delegating repository research, provide:

- Feature summary and 3-8 concrete search terms/symbols.
- Candidate roots discovered by the root fast pass.
- Files already read or known-relevant paths.
- VCS type and ignore-file instructions.
- Desired depth: `fast`, `focused`, or `deep`.

Default depth is `fast`:

- Search only likely roots first.
- Read only the top 3-6 high-signal files.
- Stop once there are 2-4 relevant patterns or clear evidence that no local pattern was found in scope.
- Return uncertainty instead of expanding to the whole repo without a reason.

Use `focused` when a feature crosses a known subsystem and needs more evidence. Use `deep` only when the user explicitly asks for broad subsystem mapping or the root fast pass shows high architectural risk.

---

## Tool Use

Use the strongest available project/package tools for the source being searched:

- Use `cg_search_artifacts` for project-local Markdown artifacts under `docs/` and `todos/` when it is available; it is faster and more structured than ad hoc Markdown scans.
- Use raw `rg` for source code, assets/content files, exact symbols, exact errors, filenames, and body-text verification.
- Use VCS-specific tools for VCS facts: Plastic tools/`cm` in Plastic workspaces, Git tools/`git` in Git repositories.
- Use `cg_read_reference` for Compound Game Dev package references rather than reading package files through project-relative paths.
- Use companion engine/package documentation tools when present and relevant, but do not make them hard dependencies.

## Search Strategy

Prefer narrow, staged searches:

1. Search guidance/docs first: `AGENTS.md`, README, setup docs, package manifests, and project conventions. Use `cg_search_artifacts` for `docs/`/`todos/` when available.
2. Search likely source/content roots with file-type globs.
3. Search exact symbols, filenames, serialized keys, component names, and user-facing terms.
4. Read selected files directly and capture line references.

Avoid:

- Repeated whole-repo `rg` scans when a scoped root is known.
- Reading generated, cache, build, dependency, or imported vendor directories unless the feature specifically touches them.
- Mapping every directory in a large project.
- Reading more files after enough evidence has been found for planning.

If a broad search is slow or noisy, report the slow/noisy query and narrow the scope instead of continuing indefinitely.

---

## Output Expectations

Return a concise handoff:

```markdown
## Repository Research Summary

### Search Scope
- VCS: plastic|git|none
- Ignore handling: [files/tools used]
- Roots searched: [paths]
- Depth: fast|focused|deep

### Relevant Patterns
- [file:line,line-range] - [pattern]

### Not Found / Uncertain
- [what was searched and not found]

### Recommended Next Reads
- [path] - [why the root agent should read it]
```

Prefer evidence shortlists over broad inventories. Include line numbers for claims that influence the plan.
