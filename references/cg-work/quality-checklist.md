# Quality Checklist for Work Execution

This file contains quality assurance steps to run before shipping work.

---

## Scope Discipline

Before implementing rename/replacement work, confirm whether the current task is full replacement, migration/conversion to one canonical workflow, backward-compatible support, or historical alias preservation. Do not keep old names, add adapters, or create compatibility paths unless the plan/user explicitly calls for them.

For Unity UI Toolkit work, prefer UXML for structure, USS for styling/layout/interaction states, and C# for behavior/data binding. If significant UI styling or durable layout is being written directly in C#, pause and check whether it belongs in USS/UXML instead.

When implementing a plan, keep the work framed as the target design. Do not preserve old concepts, old plan comparisons, or "not the old system" language in code/docs unless it is needed for explicit migration or historical traceability.

## Authored Content and Data Validation

For Unity authored-content changes (assets, catalogs, layouts, progression graphs, content mappings, save/config data), prefer validation that can fail at edit/design time before runtime playthroughs:

- Add or run EditMode tests for asset references, invariants, and load/traversal rules.
- Add or run editor validators when designers or agents need visible errors before entering Play Mode.
- Validate missing assets, invalid references, duplicate IDs, unreachable graph/content states, and malformed data close to the authoring surface.

Do not rely only on "start the mission/scene and see what breaks" when the issue can be detected from authored data. Runtime/manual validation is still useful, but it should not be the first practical failure signal for deterministic content errors.

For tests over designer-authored data, distinguish stable contracts from mutable content. Avoid permanent magic-number assertions over changeable designer values; if a migration temporarily freezes exact data to guard refactor safety, remove or relax those assertions after the stable schema/invariants are protected.

## Unity Process Safety

Unity allows only one process per project folder. For a single Unity project, run batchmode compile checks and Unity Test Framework test runs serially. Do not issue multiple `unity_launch_batchmode` calls for the same project in the same parallel tool turn.

Before the first Unity batchmode compile or Unity Test Framework run in a session, load the `unity-batchmode-tests` skill when the `pi-unity` package is available. It contains the current packaged-tool workflow, lockfile guidance, and test-result/log-file conventions.

For Unity Test Framework runs, do not pass `-quit` with `-runTests`; the test runner controls process exit. Use absolute `-testResults` and `-logFile` paths when practical.

## Windows Command Safety

When using shell/Python helpers on Windows projects, keep commands portable and UTF-8 safe:

- Prefer Pi `read` for file inspection and `rg` for search before ad hoc Python parsing.
- Avoid passing wildcard path segments such as `Packages/com.example*` as literal search roots; prefer searching a concrete root with `-g` include/exclude globs.
- If the project documents a local agent Python utility environment, resolve that executable from the coordination/project root before use; do not assume `.pi-python-tools/...` exists relative to a workspace subfolder.
- Before relying on non-stdlib imports, run a tiny import check with the chosen Python executable so missing packages fail early and clearly.
- If Python must print non-ASCII text, set UTF-8 output explicitly or write UTF-8 files instead of relying on the console code page.

## Core Quality Checks

Run every check that applies to the detected project, changed scope, and documented project workflow. Record `not applicable` or `blocked` with evidence when a configured check does not exist or cannot run safely; never claim an unrun check passed.

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

### 1. Run Applicable Test Suites

```bash
# Run project-defined tests relevant to the changed scope from AGENTS.md or project docs.
# For Unity projects, see the Unity Test Framework section below.
# For packages/tools in this repo, use the package-local test command when present.
```

**Verify:**
- Applicable configured tests pass
- No new in-scope test failures
- Required coverage or evidence targets are met when the project defines them

If no relevant test suite exists, record that explicitly and rely on the project-approved validation path. If tests fail, classify whether the failure is caused by the change, pre-existing, or an infrastructure/harness problem before deciding whether to fix or block.

---

### 2. Run Linting (Per AGENTS.md)

Check AGENTS.md for project-specific linting configuration:

If you delegate linting to `cg-lint-specialist`, use `agentScope: "both"`, follow references/_shared/subagent-execution-profiles.md, and default the brief to `check-only` for the changed files. Inherit the parent execution profile unless a cheap, easily verified lint slice clearly benefits from lower thinking. Authorize `fix-authorized` mode only through an explicit follow-up with a bounded file allowlist. The lint agent never commits, checks in, or pushes; the root session owns any separately authorized VCS write.

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

## Reviewer Agents (Optional and Concern-Driven)

Do not select reviewers solely by file count. A one-file credential or save-schema change may need specialist review, while a large generated/content-only change may not.

Use the applicability table and current briefs in `references/cg-review/agent-prompts.md`; use `references/cg-review/conditional-agents.md` for migration and deployment. Do not duplicate reviewer prompts here.

When delegating:

- only the root/orchestrator session invokes subagents
- invoke package-owned agents with `agentScope: "both"` and project-agent confirmation enabled
- follow references/_shared/subagent-execution-profiles.md, inheriting by default and choosing non-inherited model/thinking values per actual review slice
- provide exact changed files/roots, concern, known evidence, read-only authority, validation expectations, and a stop condition
- select by concrete concern and specialist ownership
- reserve `cg-pattern-specialist` for an explicitly requested cross-codebase consistency/duplication audit, not routine review
- launch independent selected reviewers in parallel when practical, then synthesize verdicts, findings, confidence, evidence/validation limits, and out-of-scope handoffs

`No concrete findings`, `Not applicable`, and a recorded blocker are valid outcomes. Address or explicitly accept P1 findings before shipping; preserve unresolved P2/P3 items as scoped follow-ups when appropriate.

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
- [ ] Applicable project-defined tests pass, or `not applicable`/blocked evidence is recorded
- [ ] Applicable lint/static checks pass, or `not applicable`/blocked evidence is recorded (`cg-lint-specialist` defaults to check-only)
- [ ] Code follows existing patterns
- [ ] Design references implemented correctly (if applicable)
- [ ] Before/after screenshots captured and uploaded (for UI changes)
- [ ] Commit messages follow conventional format
- [ ] PR/code review description includes summary, testing notes, and screenshots
- [ ] Reviewer agents run for complex/risky changes (if needed)
- [ ] No console errors or warnings

---

## When to Skip Reviewer Agents

Skip specialist review when the changed scope has no concrete concern owned by that specialist and project tests/manual validation provide sufficient evidence. Documentation, configuration, tests, and small changes can still warrant security, integrity, architecture, or agent-surface review when their actual behavior crosses those boundaries.

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
  echo "Review check-only lint evidence first."
  echo "  If fixes are desired, explicitly authorize a bounded fix pass or fix manually."
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
1. Unity batchmode compile validation (Unity projects, mandatory when safe to launch)
2. Run applicable project-defined tests
3. Run applicable lint/static checks
4. Perform applicable manual verification
5. Run concern-driven reviewer agents when warranted
6. Complete the final checklist with pass, not-applicable, or blocked evidence
