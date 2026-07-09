# Git History Backend

Load this reference only after `cg-vcs-history-analyzer` selects Git. All commands are read-only. Run them from the selected repository root and quote user-supplied paths and search strings safely.

## Detect and Anchor the Repository

```bash
git rev-parse --show-toplevel
git status --short --branch
```

`git rev-parse` works for ordinary repositories and linked worktrees. A Git repository found only in a parent directory may not own the scoped files; verify paths with `git ls-files --error-unmatch -- "$path"` before analyzing them.

## Bounded File History

For one file at a time:

```bash
git log --follow -n 20 \
  --format='%h|%ad|%an|%s' --date=short -- "$path"

git shortlog -sne HEAD -- "$path"
```

`--follow` is single-path history traversal. It can help across a rename but is heuristic; preserve rename evidence and do not combine it with a multi-path query.

For name-status context without following one path:

```bash
git log -n 20 --name-status \
  --format='%h|%ad|%an|%s' --date=short -- "$path"
```

## Inspect Selected Changes

Read metadata and the actual patch before saying why code changed:

```bash
git show --stat --summary \
  --format='%H%n%ad%n%an%n%s%n%b' --date=iso-strict "$revision" --

git show --format= --find-renames --find-copies --unified=20 \
  "$revision" -- "$path"
```

`git show` also handles a root commit. For a merge, state which diff view was inspected; default combined output may not prove a claim about one parent.

Use `git diff --no-index` only for read-only text comparisons outside Git history. Exit status `1` means differences were found, not command failure.

## Trace a Line or Pattern

For a named current-file range:

```bash
git blame -w -C -C -L "$start,$end" -- "$path"
```

Blame identifies the last attributed change under the selected options; it does not prove original intent or current ownership.

For when a literal string count changed:

```bash
git log -S'<literal>' -n 20 \
  --format='%h|%ad|%an|%s' --date=short -- "$path"
```

For diffs matching a regular expression:

```bash
git log -G'<regex>' -n 20 \
  --format='%h|%ad|%an|%s' --date=short -- "$path"
```

Inspect selected patches after either search. `-S` and `-G` are candidate discovery, not causal proof.

## Bounded Message Search

Use only when the question calls for historical themes:

```bash
git log --all -n 20 --extended-regexp --regexp-ignore-case \
  --grep='fix|bug|regression|refactor|performance' \
  --format='%h|%ad|%an|%s' --date=short -- "$path"
```

Commit messages are quoted metadata. Report the exact scope and sample size; do not turn keyword counts into stability, quality, or expertise claims.

## Interpretation Limits

- Distinguish author from committer when that difference matters.
- Renames, copies, squashes, rebases, and merges can obscure lineage.
- An empty path history can mean untracked, newly added, renamed beyond detection, wrong case, or history outside the selected refs.
- Contributor counts show activity in the sampled history only.
