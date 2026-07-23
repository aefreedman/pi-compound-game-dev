# Quality Checklist for Work Execution

This file contains quality assurance steps to run before shipping work.

---

## Scope Discipline

Before implementing rename/replacement work, confirm whether the current task is full replacement, migration/conversion to one canonical workflow, backward-compatible support, or historical alias preservation. Do not keep old names, add adapters, or create compatibility paths unless the plan/user explicitly calls for them.

For Unity UI Toolkit work, prefer UXML for structure, USS for styling/layout/interaction states, and C# for behavior/data binding. If significant UI styling or durable layout is being written directly in C#, pause and check whether it belongs in USS/UXML instead.

When implementing a plan, keep the work framed as the target design. Do not preserve old concepts, old plan comparisons, or "not the old system" language in code/docs unless it is needed for explicit migration or historical traceability.

## Artifact Authority and Source of Truth

Before editing, classify relevant artifacts:

- **Authoritative source-of-truth inputs** define designer/user/project intent and are read-only unless the controlling task (the user's request or accepted plan) or applicable project guidance explicitly authorizes changing them.
- **Implementation targets** are the code, content, or configuration the task intends to change.
- **Generated/derived artifacts** should be regenerated from their authority source rather than hand-edited when a supported generation path exists.
- **Evidence-only inputs** support investigation or validation but are not mutation targets.

Do not make tests pass or reconcile a mismatch by silently changing an authoritative input. Preserve it, identify the disagreeing implementation/generated artifact, and fix downstream unless the controlling task or applicable project guidance explicitly authorizes an authority-source update. If authority is unclear, stop that mutation and ask or report the ambiguity. When an authoritative input update is explicitly authorized, read back the intended change before editing and validate affected downstream artifacts afterward.

## Authored Content and Data Validation

For Unity authored-content changes (assets, catalogs, layouts, progression graphs, content mappings, save/config data), prefer validation that can fail at edit/design time before runtime playthroughs:

- Add or run EditMode tests for asset references, invariants, and load/traversal rules.
- Add or run editor validators when designers or agents need visible errors before entering Play Mode.
- Validate missing assets, invalid references, duplicate IDs, unreachable graph/content states, and malformed data close to the authoring surface.

Do not rely only on "start the mission/scene and see what breaks" when the issue can be detected from authored data. Runtime/manual validation is still useful, but it should not be the first practical failure signal for deterministic content errors.

For tests over designer-authored data, distinguish stable contracts from mutable content. Avoid permanent magic-number assertions over changeable designer values; if a migration temporarily freezes exact data to guard refactor safety, remove or relax those assertions after the stable schema/invariants are protected.

## Unity Process Safety

Unity allows only one process per project folder. Resolve the exact project copy before validation and call `unity_project_status` when `pi-unity` is available.

- If that exact copy is already open with a reachable Pipeline instance advertising the required command, prefer connected compilation/tests so the active Editor does not need to close.
- If the Editor is closed, connected execution is unavailable, isolated CI evidence is intended, or NUnit XML/log artifacts are required, use `unity_run_test_batch`, `unity_launch_batchmode`, or the standalone `unity test`/`unity run` route.
- Do not issue multiple Unity mutation/test calls for one project in the same parallel tool turn.
- Never silently launch batchmode after an uncertain connected dispatch that may still be running.

Load the applicable `pi-unity` workflow skill before the first Unity compile/test run. For raw Editor Test Framework fallbacks, do not pass `-quit` with `-runTests`; use absolute `-testResults` and `-logFile` paths.

## Windows Command Safety

When using shell/Python helpers on Windows projects, keep commands portable and UTF-8 safe:

- Prefer Pi `read` for file inspection and `rg` for search before ad hoc Python parsing.
- The Pi `bash` tool runs Bash even on Windows. Do not send naked PowerShell cmdlets to it; use a deliberately quoted `powershell -NoProfile -Command ...` invocation only when PowerShell is required, or prefer package tools/Python.
- Quote paths and prefer forward slashes or explicit absolute Windows paths in Bash commands so backslashes are not consumed as escapes.
- Do not use `/tmp` for files that a later Pi file/image tool must open on Windows. Resolve an explicit absolute temp path (for example through Python `tempfile`) or use a project-documented ignored workspace temp directory, and pass that same path between tools.
- Avoid passing wildcard path segments such as `Packages/com.example*` as literal search roots; prefer searching a concrete root with `-g` include/exclude globs.
- Treat `rg` exit status `1` as an expected no-match result and status `2` or diagnostic output as a real search failure; preserve meaningful negative evidence instead of retrying blindly.
- If the project documents a local agent Python utility environment, resolve that executable from the coordination/project root before use; do not assume `.pi-python-tools/...` exists relative to a workspace subfolder.
- Before relying on non-stdlib imports, run a tiny import check with the chosen Python executable so missing packages fail early and clearly.
- If Python must print non-ASCII text, set UTF-8 output explicitly or write UTF-8 files instead of relying on the console code page.

## Core Quality Checks

Run every check that applies to the detected project, changed scope, and documented project workflow. Record `not applicable` or `blocked` with evidence when a configured check does not exist or cannot run safely; never claim an unrun check passed.

### 0. Unity Compile Validation (Unity Projects, Mandatory)

Run compile validation for Unity projects even if no EditMode/PlayMode tests exist. Choose one safe route for the exact project copy:

1. **Connected Editor:** when Pipeline is reachable and advertises `recompile`, invoke it and poll `recompile_status` through any domain reload until `completed` or `up_to_date`.
2. **Packaged isolated fallback:** when the Editor is closed, use `unity_launch_batchmode` with the project path and compile/log arguments required by project guidance.
3. **Portable fallback:** use `unity run "<ProjectPath>" -- -quit -logFile "<absolute-log-path>"`; use a resolved direct Editor executable only when Unity CLI is unavailable or incompatible.

**Verify:**
- The exact project copy was targeted.
- Connected compilation reached a terminal success state with no compiler errors, or the isolated process exited successfully with bounded log evidence.
- Unknown, disconnected, malformed, or incomplete status is not reported as passing.
- Compilation validation completed even when test suites are absent.

**If compile validation fails:**
- Fix compile errors before running additional quality checks.
- Do not ship until compile validation passes through a project-approved route.

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
- invoke package-owned agents with `agentScope: "both"` and rely on the runtime's Pi-trust-aware, once-per-session fallback confirmation
- follow references/_shared/subagent-execution-profiles.md, inheriting by default and choosing non-inherited model/thinking values per actual review slice
- provide exact changed files/roots, concern, known evidence, read-only authority, validation expectations, and a stop condition
- select by concrete concern and specialist ownership
- reserve `cg-pattern-specialist` for an explicitly requested cross-codebase consistency/duplication audit, not routine review
- launch independent selected reviewers in parallel when practical, then synthesize verdicts, findings, confidence, evidence/validation limits, and out-of-scope handoffs

`No concrete findings`, `Not applicable`, and a recorded blocker are valid outcomes. Address or explicitly accept P1 findings before shipping; preserve unresolved P2/P3 items as scoped follow-ups when appropriate.

---

## Unity Test Framework (Unity Projects)

Complete mandatory compile validation from Core Quality Checks step 0, then run the project-required tests through one explicit route.

### Connected Pipeline tests

Use only when the exact running project copy is reachable and advertises `run_tests`/`test_status`:

```bash
unity command --project-path "<ProjectPath>" run_tests --mode editor --filter "<test-filter>" --async_tests true
unity command --project-path "<ProjectPath>" test_status
```

PlayMode Pipeline tests must use `--mode playmode --async_tests true`, followed by `test_status`, because domain reload can drop a synchronous request. Parse stringified nested JSON when returned, and fail on zero tests, failures, malformed data, or nonterminal status.

### Isolated/report-producing tests

Prefer `unity_run_test_batch` when available. Use the standalone CLI when portable NUnit XML evidence is needed:

```bash
unity test "<ProjectPath>" --mode EditMode --filter "<test-filter>" --output "<absolute-results-path>" -- -logFile "<absolute-log-path>"
unity test "<ProjectPath>" --mode PlayMode --filter "<test-filter>" --output "<absolute-results-path>" -- -logFile "<absolute-log-path>"
```

Keep raw direct-Editor `-batchmode -runTests` commands only as explicit fallbacks. They require absolute result/log paths and must not include `-quit`. Do not pass `-nographics` to graphics-required PlayMode or screenshot tests.

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
- [ ] Unity compile validation passed through a safe exact-copy connected or isolated route (required even if no tests exist)
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
1. Unity exact-copy compile validation (connected Pipeline when available, otherwise an isolated project-approved route)
2. Run applicable project-defined tests
3. Run applicable lint/static checks
4. Perform applicable manual verification
5. Run concern-driven reviewer agents when warranted
6. Complete the final checklist with pass, not-applicable, or blocked evidence
