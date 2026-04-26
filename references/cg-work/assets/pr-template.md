# GitHub Pull Request Template

Use this template when creating PRs via `gh pr create`.

## Template Content

```markdown
## Summary
- {WHAT_WAS_BUILT}
- {WHY_IT_WAS_NEEDED}
- {KEY_DECISIONS_MADE}

## Testing
- Automated validation: {TEST_COMMANDS_AND_RESULTS}
- Manual validation: {TESTING_STEPS}

## Screenshots / Captures
{SCREENSHOTS_OR_CAPTURE_LINKS_FOR_VISUAL_CHANGES_ONLY}

## Design / Reference Links
{LINKS_IF_RELEVANT}

---
Co-Authored-By: <AI Assistant Name>
```

## Required Behavior

- Always include the attribution footer.
- Include screenshots/captures when the change is visual.
- Omit the screenshots/captures section or write `Not applicable - non-visual change` for non-visual work.
- Include design/reference links only when they informed the change.

## Variables

- `{WHAT_WAS_BUILT}` - features/fixes implemented
- `{WHY_IT_WAS_NEEDED}` - problem statement or motivation
- `{KEY_DECISIONS_MADE}` - important technical or design decisions
- `{TEST_COMMANDS_AND_RESULTS}` - tests/builds/checks run and outcomes
- `{TESTING_STEPS}` - manual gameplay/editor/tooling validation
- `{SCREENSHOTS_OR_CAPTURE_LINKS_FOR_VISUAL_CHANGES_ONLY}` - visual evidence for UI/gameplay/art changes
- `{LINKS_IF_RELEVANT}` - design docs, cards, references, or related work
