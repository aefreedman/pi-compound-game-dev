# Quality Checklist for Work Execution

This file contains quality assurance steps to run before shipping work.

---

## Unity Process Safety

Unity allows only one process per project folder. For a single Unity project, run batchmode compile checks and Unity Test Framework test runs serially. Do not issue multiple `unity_launch_batchmode` calls for the same project in the same parallel tool turn.

For Unity Test Framework runs, do not pass `-quit` with `-runTests`; the test runner controls process exit. Use absolute `-testResults` and `-logFile` paths when practical.

## Core Quality Checks (Always Run)

Run these checks before submitting any PR or code review:

### 0. Unity Batchmode Compile Validation (Unity Projects, Mandatory)

Run this validation for Unity projects even if no EditMode/PlayMode tests exist.

```bash
# Validate project compiles in Unity batchmode
unity -batchmode -projectPath . \
  -quit \
  -logFile -
```

**Verify:**
- Unity batchmode exits successfully
- No compile errors in output
- Compilation validation completed even when test suites are absent

**If compile validation fails:**
- Fix compile errors before running any additional quality checks
- Do not ship until batchmode compile validation passes

### 1. Run Full Test Suite

```bash
# Run the project's configured test command from AGENTS.md or project docs.
# For Unity projects, see the Unity Test Framework section below.
# For packages/tools in this repo, use the package-local test command when present.
```

**Verify:**
- All tests pass
- No new test failures
- Code coverage maintained or improved

**If tests fail:**
- Fix failures immediately
- Don't proceed to linting until tests pass
- Create new tests for new functionality

---

### 2. Run Linting (Per AGENTS.md)

Check AGENTS.md for project-specific linting configuration:

If you delegate linting to `cg-lint-specialist`, give it a brief focused on the changed files and fixing lint issues.

Use the project's native lint/format/static-analysis command. For Unity projects, this may be an editor validation step, Roslyn analyzer, formatting command, package-specific script, or build pipeline check documented by the project.

**Verify:**
- No linting errors
- Warnings addressed or documented
- Code style follows project conventions

---

### 3. Manual Verification

**For all changes:**
- [ ] Code follows existing patterns (checked against similar code)
- [ ] Design references implemented correctly (if applicable)
- [ ] No console errors or warnings in development
- [ ] All action items are complete and tracking checkboxes are up to date

**For visual UI/gameplay changes:**
- [ ] Before/after screenshots or capture evidence collected
- [ ] Manual testing in target environments
- [ ] Accessibility/usability checked for affected inputs, readability, and feedback states

**For data, content, or pipeline changes:**
- [ ] Backward compatibility maintained, or breaking change documented
- [ ] Save/content migration validated if applicable
- [ ] Error handling tested for failed loads, missing assets, or invalid data

---

## Reviewer Agents (Optional - Use Selectively)

**Don't use by default.** Use reviewer agents only when:

- Large refactor affecting many files (10+)
- Security-sensitive changes (authentication, permissions, data access)
- Complex algorithms or business logic
- User explicitly requests thorough review

**For most features:** tests + linting + following patterns is sufficient.

---

### When to Use Which Reviewer

#### cg-code-simplicity-reviewer

**Use when:**
- Large refactor with many abstractions
- New architectural patterns introduced
- Code feels "too clever" or over-engineered
- Significant complexity added

If you delegate to `cg-code-simplicity-reviewer`, pass it a brief like:

```text
Review changes for simplicity and clarity.

Changed files: [list]

Check for:
- Over-engineering or premature abstraction
- Unnecessary complexity
- Code that could be simplified without losing functionality
- Unclear variable/method names
- Overly nested logic
- Large methods that should be broken down

Return findings with file:line references and simplified alternatives.
```

---

#### cg-security-reviewer

**Use when:**
- Secrets, credentials, signing keys, or service tokens may be exposed
- Player data, telemetry, account, commerce, entitlement, or privacy-sensitive flows changed
- Networked gameplay, backend communication, remote config, mods, plugins, or downloadable content changed
- Platform SDK permissions, store privacy requirements, or release-build diagnostics changed
- Web/service/API surfaces are touched by the game or tooling

If you delegate to `cg-security-reviewer`, pass it a brief like:

```text
Analyze security implications of changes.

Changed files: [list]

Check for:
- Secrets or credentials in code, assets, scenes, prefabs, configs, logs, or build output
- Player data exposure, privacy, telemetry, account, commerce, or entitlement risks
- Trust-boundary issues in network messages, remote config, mods, plugins, downloadable content, or asset bundles
- Untrusted input or deserialization risks
- Web/service checks only where relevant to changed backend, account, commerce, telemetry, launcher, or web-view surfaces

Return findings with severity (P1 = critical, P2 = potential, P3 = hardening).
```

---

#### cg-architecture-specialist

**Use when:**
- New modules or components added
- Significant refactoring
- Cross-cutting concerns introduced
- Architectural boundaries changed
- New design patterns applied

If you delegate to `cg-architecture-specialist`, pass it a brief like:

```text
Review architectural decisions in changes.

Changed files: [list]

Evaluate:
- System design and component interactions
- Separation of concerns and modularity
- Dependency management and coupling
- Layer violations or architectural boundaries
- Scalability and maintainability implications
- Technical debt introduction or reduction

Return assessment with severity (P1/P2/P3) and recommendations.
```

---

### Running Reviewer Agents

**Run reviewers in parallel** from the root/orchestrator session.

For the real run:
- delegate the selected reviewers together rather than sequentially
- give each reviewer a focused brief for its concern area
- wait for all reviewer results before deciding what to fix

**After agents complete:**
- Review findings
- Address critical (P1) issues before shipping
- Document P2/P3 issues as follow-up todos if needed
- Present findings to user if significant concerns

---

## Unity Test Framework (Unity Projects)

For Unity projects, run Unity Test Framework tests:

Before running tests, complete mandatory batchmode compile validation from Core Quality Checks step 0.

### EditMode Tests

```bash
# Via Unity CLI (batch mode)
unity -runTests -batchmode -projectPath . \
  -testPlatform EditMode \
  -testResults EditModeResults.xml \
  -logFile -

# Check results
if [ -f EditModeResults.xml ]; then
  echo "✅ EditMode tests complete"
  # Parse results for failures
else
  echo "⚠️ EditMode tests failed to run"
fi
```

### PlayMode Tests

```bash
# Via Unity CLI (batch mode)
unity -runTests -batchmode -projectPath . \
  -testPlatform PlayMode \
  -testResults PlayModeResults.xml \
  -logFile -

# Check results
if [ -f PlayModeResults.xml ]; then
  echo "✅ PlayMode tests complete"
  # Parse results for failures
else
  echo "⚠️ PlayMode tests failed to run"
fi
```

### Manual Testing in Unity Editor

For UI or gameplay changes:
1. Open Unity Editor
2. Open affected scenes
3. Enter Play Mode
4. Test functionality manually
5. Check Console for errors/warnings
6. Capture screenshots (see screenshot-capture.md)

---

## Final Validation Checklist

Before creating PR/code review, verify:

- [ ] All clarifying questions asked and answered
- [ ] All action items are complete and tracking checkboxes are up to date
- [ ] Unity batchmode compile validation passed (Unity projects; required even if no tests exist)
- [ ] Tests pass (run project's test command)
- [ ] Linting passes (use `cg-lint-specialist` or the project's native linter commands)
- [ ] Code follows existing patterns
- [ ] Design references implemented correctly (if applicable)
- [ ] Before/after screenshots captured and uploaded (for UI changes)
- [ ] Commit messages follow conventional format
- [ ] PR/code review description includes summary, testing notes, and screenshots
- [ ] Reviewer agents run for complex/risky changes (if needed)
- [ ] No console errors or warnings

---

## When to Skip Reviewer Agents

**Skip reviewer agents for:**
- Simple bug fixes (< 3 files changed)
- Documentation updates
- Config changes
- Test additions only
- Trivial refactoring (renaming, moving files)

**Reason:** Tests + linting + pattern matching catches most issues. Reviewer agents add significant time for marginal benefit on simple changes.

---

## Error Handling

### Tests Failing

```bash
if ! [test command]; then
  echo "⚠️ Tests failing"
  echo ""
  echo "Do NOT proceed to linting or PR creation"
  echo "Fix test failures first"
  echo ""
  echo "View test output above for details"
  exit 1
fi
```

### Linting Errors

```bash
if ! [lint command]; then
  echo "⚠️ Linting errors found"
  echo ""
  echo "Use the lint specialist or your native lint command to fix them:"
  echo "  Run the lint specialist on the changed files, or fix them manually."
  echo ""
  echo "Or fix manually and re-run linting"
  exit 1
fi
```

### Reviewer Agent Concerns

```bash
if [reviewer finds P1 issues]; then
  echo "⚠️ Critical issues found by reviewer"
  echo ""
  echo "Address P1 findings before shipping:"
  [list P1 issues]
  echo ""
  echo "Fix these issues and re-run quality checks"
  exit 1
fi
```

---

## Usage

**Load this file when:** Running quality checks before shipping (Phase 3 of work execution).

**Execution order:**
1. Unity batchmode compile validation (Unity projects, always)
2. Run tests (always)
3. Run linting (always)
4. Manual verification (always)
5. Reviewer agents (conditional - only for complex/risky changes)
6. Final checklist (always)
