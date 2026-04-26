# Output Template

Return only the content inside the code block.

Use the Keep a Changelog 1.1.0 structure: a `# Changelog` title, a short format note, dated release/window headings, and standard change categories.

```markdown
# Changelog

All notable changes for [PROJECT_OR_WINDOW] are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [VERSION_OR_WINDOW_LABEL] - [YYYY-MM-DD]

### Added

- [New feature or capability summary] [traceability refs]
  - Access: [Command/menu/setting path, if confidently known]

### Changed

- [Changed behavior, workflow, content, or implementation summary] [traceability refs]

### Deprecated

- [Soon-to-be removed feature, command, setting, or workflow] [traceability refs]

### Removed

- [Removed feature, command, setting, workflow, or content] [traceability refs]

### Fixed

- [Bug fix summary] [traceability refs]

### Security

- [Security/privacy/secrets/trust-boundary fix summary] [traceability refs]
```

## Category Rules

Include only categories that have entries. Use the standard Keep a Changelog categories when possible:

- `Added` for new features, commands, content, tools, or capabilities.
- `Changed` for changes in existing functionality.
- `Deprecated` for features still available but planned for removal.
- `Removed` for removed features.
- `Fixed` for bug fixes.
- `Security` for vulnerability, privacy, secrets, permission, or trust-boundary fixes.

For breaking changes, put the item in the most relevant category and start the entry with `**Breaking:**`.

## Traceability Rules

- Include traceability IDs where possible: Codecks cards, issue numbers, PRs, changesets, commits, or review links.
- For Codecks items in markdown-capable contexts, prefer `[ABC-7](https://<tld>.codecks.io/ABC-7)`.
- Do not wrap markdown links and groups of links in extra grouping parentheses.
- Keep traceability at the end of the entry unless it hurts readability.

## Access Detail Rule

- Add `Access: ...` as a sub-bullet only when confidently derivable from source artifacts.
- Keep it practical: where to click, run, enable, or see the change.
- Do not invent access details.

## No-Changes Message

If no items match the window:

```markdown
# Changelog

All notable changes for [PROJECT_OR_WINDOW] are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [VERSION_OR_WINDOW_LABEL] - [YYYY-MM-DD]

No notable changes.
```
