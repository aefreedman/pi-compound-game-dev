# Repository Search

`cg_search_repo` provides bounded, deterministic ripgrep searches for project code, assets, and other filesystem content. Use it when search roots and terms are known. Use `cg_search_artifacts` instead for metadata-aware discovery across plans, solutions, and file-based todos.

## Cross-platform execution

The tool launches `rg` directly with an argument array and `shell: false`; it does not construct Bash or PowerShell command strings. Native absolute paths are passed to ripgrep on Windows and macOS, while returned project-relative paths use `/` for consistent agent evidence. Ripgrep must be available on `PATH`.

Every requested root is canonicalized with `realpath`, must exist, and must remain inside `workspaceRoot`. Symlinks are not followed during search. Roots are run independently so nested Plastic ignore rules from one root cannot leak into a sibling root.

## Query model

Each query is independent and has:

- `id` - optional stable label; defaults to `q1`, `q2`, etc.
- `pattern` - required search text.
- `literal` - fixed-string search by default; set `false` for deliberate ripgrep regex.
- `caseSensitive` - `true`, `false`, or omitted for smart-case.

Each query/root pair returns one status:

- `matched` - completed with displayed matches.
- `no_matches` - completed with no matching lines; valid scoped negative evidence.
- `partial_limit` - stopped at the global evidence cap; not negative evidence.
- `invalid_regex`, `timeout`, or `error` - failed/incomplete.
- `root_excluded_by_policy` - requested root is a Unity generated folder excluded by policy.
- `not_run_global_limit` - not run because earlier cells exhausted the global cap.

Never summarize an incomplete status as proof that content is absent.

## Ignore and Unity policy

For each root, the tool walks from `workspaceRoot` toward that root and applies readable `ignore.conf` and `cloaked.conf` files in order. Git ignore behavior remains enabled through ripgrep.

When a Unity project is detected from `Assets/` plus `Packages/manifest.json` or `ProjectSettings/ProjectVersion.txt`, these direct generated/cache/output children of that Unity root are excluded by default (same-named authored folders nested under `Assets/` are not excluded):

- `Library/`
- `Temp/`
- `Logs/`
- `obj/`
- `Build/`
- `Builds/`
- `UserSettings/`
- `.vs/`

Set `includeUnityGenerated: true` only when those outputs are the requested research surface. The result discloses caller-supplied globs plus hidden-file, binary, symlink, Plastic-ignore, and Unity-exclusion policy alongside negative evidence. A complete query/root status matrix is emitted before match excerpts so output truncation cannot hide which searches completed.

## Examples

Literal symbol search across project code:

```text
cg_search_repo queries=[{"id":"resolver","pattern":"ShipLayoutResolver"}] roots=["ws1/nor-unity/Assets/02-Game-Dive/code"] globs=["*.cs"]
```

Several independently attributed searches:

```text
cg_search_repo workspaceRoot="ws1" roots=["nor-unity/Assets"] queries=[{"id":"exact-error","pattern":"Mission layout start node invalid"},{"id":"api-family","pattern":"MissionLayout.*Validate","literal":false}] maxMatches=60
```

Generated-output investigation:

```text
cg_search_repo roots=["nor-unity/Logs"] queries=[{"pattern":"NullReferenceException"}] includeUnityGenerated=true
```

Use targeted `read` calls on the highest-signal returned files. The tool discovers and bounds evidence; the root agent remains responsible for interpretation and synthesis.
