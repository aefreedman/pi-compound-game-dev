# Compound Game Dev

Compound Game Dev is a Pi workflow package for game-development teams that want repeatable planning, work, review, todo, and learning-capture workflows without assuming a single engine, version-control system, tracker, or build pipeline.

The package adapts the Compound Engineering idea for game development. Game projects vary widely: Unity, Unreal, Godot, custom engines, Git, PlasticSCM, Perforce, Codecks, GitHub, spreadsheets, bespoke asset pipelines, and manual review processes may all appear. Compound Game Dev workflows inspect the local project and follow project-specific guidance instead of guessing.

## Install

From GitHub:

```bash
pi install git:git@github.com:aefreedman/pi-compound-game-dev.git
```

Local development install:

```bash
pi install <path-to-pi-compound-game-dev>
```

Project-local install:

```bash
pi install -l <path-to-pi-compound-game-dev>
```

## Project stack guidance

Projects using this package should document their game-development stack expectations in `AGENTS.md` or a similar project-local guidance file. Useful details include:

- engine and project layout
- version-control system and branch/checkin policy
- project tracker or todo workflow
- build/test commands and validation expectations
- asset/content pipeline constraints
- review, playtest, screenshot, and release expectations

The `cg-*` workflows read that local guidance when present and ask targeted questions when the stack is unclear.

## Commands

Prompt filenames map to Pi slash commands:

- `/cg-plan` - create implementation plans
- `/cg-work` - execute an existing plan/spec/todo
- `/cg-review` - review changes and create actionable findings
- `/cg-review-resolve` - review, triage new findings, and resolve ready todos
- `/cg-loop` - run plan -> work -> review -> todo resolution
- `/cg-loop-existing-plan` - run work -> review -> todo resolution from an existing plan
- `/cg-resolve-todo-parallel` - resolve ready todos efficiently
- `/cg-triage` - triage pending todo files
- `/cg-compound` - document solved problems and learnings
- `/cg-changelog` - draft changelogs from available work sources

No compatibility aliases are provided for old workflow command names or earlier draft prefix conventions.

## Included skills

- `file-todos`
- `git-worktree`
- `unity-docs`

## Companion packages

- `pi-subagents` - recommended for multi-agent research/review workflows and package-owned agent discovery
- `pi-codecks` - optional Codecks tracker integration
- `pi-plastic` - optional PlasticSCM integration
- `pi-unity` - optional Unity tooling and screenshot workflows
- `pi-extras` - optional utility prompts/skills such as `/continue` and `streamlining-skills`

Workflows degrade gracefully when optional companion packages are unavailable.

## Package contents

- prompt templates under `prompts/`
- prompt reference material under `references/`
- helper skills under `skills/`
- package-owned agent definitions under `agents/`
- package maintenance notes under `docs/`, including output format contracts and removed-agent return paths
- registration extensions under `extensions/`

## Testing

```bash
npm test
```

## License

MIT. See `LICENSE`.

This package includes material adapted from the EveryInc Compound Engineering plugin. See `NOTICE.md` for attribution details.
