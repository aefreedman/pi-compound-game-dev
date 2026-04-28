---
description: Create engaging changelogs from recent completed work
---
# Writing Changelogs

Purpose: generate concise, traceable changelogs from recent completed work across supported sources.

## Input

User input: $ARGUMENTS 

Supported hints:
- Time window: `daily`, `weekly` (previous week starting Monday), or `<days>`
- Source override: `source:github|plastic|codecks`
- Plastic branch override: `branch:/dev` (default) or another branch
- Optional posting intent: `post:discord`

## Package Reference Loading

CRITICAL: Use `cg_read_reference` for Compound Game Dev package reference files.

- Pass package-relative paths such as `references/cg-plan/research-agents.md`.
- When an instruction says to load, use, or see a package reference path, call `cg_read_reference` for that path.
- Do NOT use `read` with `references/...`; file tools resolve relative to the current project cwd, not this package.
- Do NOT preemptively load all reference files.
- Treat loaded references as mandatory instructions for the active task scope.
- For long files, use `cg_read_reference` with `offset`/`limit` to load only needed sections.

## Workflow

### Step 0: Resolve Artifact Roots

Load:
- references/_shared/artifact-root-resolution.md
- references/_shared/artifact-path-contract.md

### Step 1: Parse Time Window

Load references/cg-changelog/time-window.md.

### Step 2: Select Changes Source(s)

Load references/cg-changelog/source-selection.md.

Do not assume GitHub. Select source(s) from:
- GitHub merged PRs
- Plastic merge changesets
- Codecks cards moved to done

If the user explicitly asks for multiple sources (for example, "use both Plastic and Codecks"), collect each requested source independently and track status for each source. Do not collapse a multi-source request into metadata enrichment from one source.

### Step 3: Collect Source Data

Load only the workflow files for selected/requested sources:
- GitHub -> references/cg-changelog/github-workflow.md
- Plastic -> references/cg-changelog/plastic-workflow.md
- Codecks -> references/cg-changelog/codecks-workflow.md

### Step 4: Normalize and Prioritize

Normalize records into a common format and prioritize content:
1. Breaking changes
2. User-facing features
3. Critical bug fixes
4. Performance improvements
5. Developer experience improvements
6. Documentation updates

Also extract concise usage/access details when available, especially for:
- New capabilities
- Menu/navigation changes
- Workflow changes

Examples of access details:
- Command path (`Tools > Missions > Skip Intro`)
- In-editor location (`Window > AI > Session Inspector`)
- Runtime action (`Press F8 to toggle debug overlay`)
- Config path (`Project Settings > Build > Fast Iteration`)

Do not invent access instructions. If source material does not provide enough detail, omit this field.

### Step 5: Render Changelog

Load references/cg-changelog/output-template.md.

Requirements:
- Keep output concise and engaging
- Include traceability references (`#123`, `cs:456`, `https://<tld>.codecks.io/ABC-7`)
- Include a short "How to access" note for user-facing changes when determinable from available information

### Step 6: Optional Discord Posting (Lazy-Load)

Only if the user explicitly asks to post to Discord:
- Load references/cg-changelog/discord-posting.md

Do not load this reference for standard changelog generation.

### Step 7: Error Handling

Load references/cg-changelog/error-handling.md.

## Reference Files (Load On Demand)

1. Source selection -> references/cg-changelog/source-selection.md
2. Time window parsing -> references/cg-changelog/time-window.md
3. GitHub workflow -> references/cg-changelog/github-workflow.md
4. Plastic workflow -> references/cg-changelog/plastic-workflow.md
5. Codecks workflow -> references/cg-changelog/codecks-workflow.md
6. Output template -> references/cg-changelog/output-template.md
7. Error handling -> references/cg-changelog/error-handling.md
8. Discord posting (lazy-load) -> references/cg-changelog/discord-posting.md
9. Artifact root resolution -> references/_shared/artifact-root-resolution.md
10. Artifact path contract -> references/_shared/artifact-path-contract.md
