# Plastic Workflow (Merge Changesets)

Use this workflow only when source selection resolves to Plastic.

## Default Target

- Default integration target branch: `/dev`
- Allow override through argument hint: `branch:/main` (or another branch)

## Data to Collect

- Changeset ID
- Comment/message
- Owner/contributor
- Date
- Branch target
- Merge/integration signal
- Usage/access hints from merge comments or linked work items (when available)

## Query Strategy

1. Read recent changesets on the target branch in the selected time window.
2. Filter for merge/integration changesets using available metadata and/or comment heuristics.
3. If merge-only filtering yields no results, fall back to recent target-branch changesets with a clear note.
4. Extract concise access details when explicitly present in comments or linked tracker metadata.

Tool-first examples:

```text
plastic_currentBranch()
plastic_status()
```

Shell fallback examples:

```bash
cm find changeset "where branch='/dev'" --orderby="date desc" --limit=200 --format="{changesetid}|{date}|{owner}|{comment}{newline}"
```

## Merge Signal Heuristics

Treat a changeset as merge-related when one or more are true:
- Native merge metadata indicates integration into target branch
- Comment includes merge indicators (`merge`, `integrate`, `merged`, `cherry-pick`)
- Branch relationship indicates integration flow into target

## Traceability Format

- Use changeset references as `(cs:12345)`

## Usage Detail Extraction

Plastic comments are often brief. Include a "How to access" line only when clear, explicit guidance exists.
Do not infer UI paths from file names alone.
