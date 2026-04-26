# Plastic SCM Code Review Template

Use this template when preparing a Plastic code review description.

Agent workflow preference: use `plastic_*` tools first for status, branch, and diff context; keep `cm ...` snippets as manual fallback.

## Template Content

```markdown
## Summary
- {WHAT_WAS_BUILT}
- {WHY_IT_WAS_NEEDED}
- {KEY_DECISIONS_MADE}

## Reviewer Assignment
- Reviewer: {REVIEWER_NAME}
- Assignment confirmed: {YES_OR_NO}

## Testing
- Automated validation: {TEST_COMMANDS_AND_RESULTS}
- Unity Test Framework: {EDITMODE_RESULTS} EditMode, {PLAYMODE_RESULTS} PlayMode
- Manual validation: {TESTING_STEPS}

## Screenshots / Captures
{SCREENSHOTS_OR_CAPTURE_LINKS_FOR_VISUAL_CHANGES_ONLY}

## Design / Reference Links
{LINKS_IF_RELEVANT}

## Changeset Info
- Branch: {BRANCH_NAME}
- Changeset: {CHANGESET_ID}

---
Co-Authored-By: <AI Assistant Name>
```

## Required Behavior

- Always include the attribution footer.
- Include screenshots/captures when the change is visual.
- Omit the screenshots/captures section or write `Not applicable - non-visual change` for non-visual work.
- Include design/reference links only when they informed the change.
- Include branch and changeset identifiers when available.
- Confirm reviewer assignment when the Plastic workflow supports it; otherwise note that assignment must be completed manually.

## Variables

- `{WHAT_WAS_BUILT}` - features/fixes implemented
- `{WHY_IT_WAS_NEEDED}` - problem statement or motivation
- `{KEY_DECISIONS_MADE}` - important technical or design decisions
- `{REVIEWER_NAME}` - assigned reviewer name/handle
- `{YES_OR_NO}` - whether assignment was completed
- `{TEST_COMMANDS_AND_RESULTS}` - tests/builds/checks run and outcomes
- `{EDITMODE_RESULTS}` / `{PLAYMODE_RESULTS}` - Unity Test Framework results if applicable
- `{TESTING_STEPS}` - manual gameplay/editor/tooling validation
- `{SCREENSHOTS_OR_CAPTURE_LINKS_FOR_VISUAL_CHANGES_ONLY}` - visual evidence for UI/gameplay/art changes
- `{LINKS_IF_RELEVANT}` - design docs, cards, references, or related work
- `{BRANCH_NAME}` - Plastic branch name
- `{CHANGESET_ID}` - Plastic changeset ID

## Manual Fallback

If code review creation is unavailable via CLI, provide the filled template to the user and state that the review must be created in the Plastic UI or the project's configured review tool.
