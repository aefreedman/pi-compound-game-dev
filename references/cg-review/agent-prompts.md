# Standardized Agent Prompts

This file contains the prompts for all review agents. Pass context variables (`$CHANGED_FILES`, `$PR_TITLE`, `$FOCUS_AREAS`, `$FILE_COUNT`) to each agent.

---

## Parallel Agents (Always Run)

Run ALL of these agents at the same time, passing full context to each:

### 1. cg-vcs-history-analyzer

Analyze file evolution and contributor patterns.

If you delegate this review to `cg-vcs-history-analyzer`, pass it a brief like:

```text
Analyze file history for these changed files:
$CHANGED_FILES

Focus on:
- Recent change patterns and evolution
- Key contributors and domain expertise
- Recurring issues or bug fix patterns
- Historical context relevant to this review

Return:
- Timeline of significant changes
- Key contributors per file
- Recurring patterns and themes
- Insights and recommendations for review focus
```

---

### 2. cg-pattern-specialist

Check for design patterns, anti-patterns, naming.

If you delegate this review to `cg-pattern-specialist`, pass it a brief like:

```text
Analyze patterns and anti-patterns in these changed files:
$CHANGED_FILES

Review focus: $FOCUS_AREAS

Check for:
- Design patterns and anti-patterns
- Naming consistency (Unity conventions: PascalCase for public, camelCase for private)
- Code duplication between files
- Unity-specific issues:
  * Update/FixedUpdate with heavy operations or allocations
  * GameObject.Find() or FindObjectOfType() in frequently called methods
  * Missing null checks for Unity object references
  * String-based method calls (SendMessage, Invoke)
  * LINQ or allocations in hot paths
  * Unoptimized physics queries (missing layer masks)
- Architectural boundary violations

Return findings with:
- Severity: P1 (critical - blocks merge), P2 (important - should fix), P3 (nice-to-have)
- File references with line numbers (e.g., PlayerController.cs:123)
- Specific code examples
- Actionable recommendations
```

---

### 3. cg-architecture-specialist

Evaluate architectural decisions and system design.

If you delegate this review to `cg-architecture-specialist`, pass it a brief like:

```text
Review architectural decisions in these changed files:
$CHANGED_FILES

Title: $PR_TITLE
Focus: $FOCUS_AREAS

Evaluate:
- System design and component interactions
- Separation of concerns and modularity
- Dependency management and coupling
- Layer violations or architectural boundaries
- Unity-specific architecture (Component pattern, ScriptableObject architecture, etc.)
- Scalability and maintainability implications
- Technical debt introduction or reduction

Return:
- Architectural assessment with severity (P1/P2/P3)
- Component interaction diagrams (text-based)
- Boundary violations with file:line references
- Recommendations for architectural improvements
```

---

### 4. cg-security-reviewer

Identify security vulnerabilities and risks.

If you delegate this review to `cg-security-reviewer`, pass it a brief like:

```text
Analyze security implications of changes in:
$CHANGED_FILES

Title: $PR_TITLE

Check for:
- Secrets or credentials in code, assets, scenes, prefabs, configs, logs, or build output
- Player data exposure, privacy, telemetry, account, commerce, or entitlement risks
- Trust-boundary issues in network messages, remote config, mods, plugins, downloadable content, or asset bundles
- Untrusted input, unsafe deserialization, file path, URL, or command construction risks
- Platform SDK permission, privacy, signing, or release-build diagnostic risks
- Web/service checks only where relevant to changed backend, account, commerce, telemetry, launcher, or web-view surfaces

Return findings with:
- Severity: P1 (critical security issue), P2 (potential vulnerability), P3 (security hardening)
- Concrete risk scenario and affected trust boundary
- File:line references
- Mitigation recommendations with code examples
```

---

### 5. cg-data-integrity-reviewer

Verify data handling and state management.

If you delegate this review to `cg-data-integrity-reviewer`, pass it a brief like:

```text
Review data integrity in these changed files:
$CHANGED_FILES

Title: $PR_TITLE

Check for:
- State management consistency
- Null reference handling
- Race conditions or timing issues
- Data validation and constraints
- Unity serialization issues (SerializeField, [NonSerialized])
- ScriptableObject data integrity
- Save/load data consistency
- Event ordering and initialization

Return findings with:
- Severity: P1 (data corruption risk), P2 (inconsistency risk), P3 (data quality improvement)
- File:line references
- Scenarios where data integrity could fail
- Recommendations with validation code examples
```

---

### 6. cg-agent-native-reviewer

Verify new features are accessible to AI agents.

If you delegate this review to `cg-agent-native-reviewer`, pass it a brief like:

```text
Review AI agent accessibility for changes in:
$CHANGED_FILES

Title: $PR_TITLE
Focus: $FOCUS_AREAS

Verify:
- New features have CLI/API access (not just GUI)
- Configuration is file-based or programmatically accessible
- Commands have --help documentation
- Error messages are actionable and parseable
- Output formats support automation (JSON, structured text)
- Workflows are agent-friendly (no interactive prompts that block)

Return findings with:
- Severity: P2 (feature not agent-accessible), P3 (could improve agent UX)
- File:line references
- Examples of agent friction points
- Recommendations for agent-friendly interfaces
```

---

### 7. cg-code-simplicity-reviewer

Identify unnecessary complexity.

If you delegate this review to `cg-code-simplicity-reviewer`, pass it a brief like:

```text
Review code simplicity and clarity in:
$CHANGED_FILES

Focus: $FOCUS_AREAS

Check for:
- Over-engineering or premature abstraction
- Unnecessary complexity
- Code that could be simplified without losing functionality
- Unclear variable/method names
- Overly nested logic
- Large methods that should be broken down
- Duplicate or redundant code
- Comments explaining what (instead of why)

Return findings with:
- Severity: P2 (significant complexity), P3 (simplification opportunity)
- File:line references
- Simplified alternatives with code examples
- Rationale for simplification
```

---

### 8. cg-learnings-researcher

Search documented solutions for relevant institutional knowledge.

If you delegate this review to `cg-learnings-researcher`, pass it a brief like:

```text
Search docs/solutions/ for documented learnings relevant to this review:

Changed files:
$CHANGED_FILES

Title: $PR_TITLE
Focus: $FOCUS_AREAS
File count: $FILE_COUNT

Research focus:
- Prior solutions related to changed modules and patterns
- Known gotchas, regressions, and anti-patterns to verify
- Proven approaches that should guide review recommendations
- Related incidents/fixes that may predict risk in this change

Return:
- Relevant docs/solutions file paths
- Key insights and why they apply to this review
- Specific checks reviewers should perform in changed files
- Recommended safeguards or follow-up validation
- "No relevant learnings found" if nothing applicable is documented
```

---

## Execution Pattern

Launch all 8 agents in parallel from the root/orchestrator session using one parallel delegation step.

For the real run:
- delegate all eight specialists together rather than one by one
- pass the full review context (`$CHANGED_FILES`, `$PR_TITLE`, `$FOCUS_AREAS`, `$FILE_COUNT`) to each specialist
- wait for all results before proceeding to conditional agents and synthesis.
