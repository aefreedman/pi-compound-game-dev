# Detail Level Templates

This file documents the three template levels for plan creation and when to use each.

---

## Template Selection

Choose the appropriate detail level based on feature complexity, team needs, and implementation clarity.

---

## Level 1: Minimal (Quick Plan)

**Best for:**
- Simple bugs with clear fix
- Small improvements to existing features
- Clear features with obvious implementation
- Solo development with no handoff needed
- Exploration or prototyping

**Template:** `assets/plan-template-minimal.md`

**Includes:**
- Problem statement or feature description
- Basic acceptance criteria
- Essential context only
- MVP code examples (optional)
- Basic references

**Planning scope:** Minimal detail for straightforward work

**Example use cases:**
- "Fix null reference in PlayerController"
- "Add speed boost power-up"
- "Update button text and styling"
- "Fix typo in error message"

---

## Level 2: Standard Plan

**Best for:**
- Most features (80% of cases)
- Complex bugs requiring investigation
- Team collaboration scenarios
- Features with stakeholder review
- Cross-functional work

**Template:** `assets/plan-template-standard.md`

**Includes everything from Minimal plus:**
- Detailed background and motivation
- Technical considerations
- Success metrics
- Dependencies and risks
- Implementation suggestions
- Testing strategy

**Planning scope:** Standard detail for most work

**Example use cases:**
- "Add multiplayer lobby functionality"
- "Improve enemy encounter spawning"
- "Optimize rendering performance in a busy scene"
- "Add save-slot selection to the main menu"

---

## Level 3: Comprehensive Plan

**Best for:**
- Major features spanning several systems
- Architectural changes affecting gameplay, tools, content, or build pipelines
- Complex engine/package/platform integrations
- High-risk changes to save data, content pipelines, or release-critical flows

**Template:** `assets/plan-template-comprehensive.md`

**Includes everything from Standard plus:**
- Detailed implementation plan with phases
- Technical approach and affected systems
- Validation and evidence plan
- Risk mitigation strategies
- Documentation requirements

**Planning scope:** Comprehensive detail for large or high-risk work

**Example use cases:**
- "Add multi-platform cross-save system"
- "Rework the save data format for a shipped game"
- "Replace the character controller used across all player abilities"
- "Move a content pipeline to Addressables"

---

## Comparison Table

| Aspect | Minimal | Standard | Comprehensive |
|--------|---------|----------|---------------|
| **Planning Scope** | Minimal | Standard | Comprehensive |
| **Sections** | 3-4 | 8-10 | 10-12 |
| **Detail Level** | Essential only | Standard | Detailed |
| **Code Examples** | Optional | Optional | Optional |
| **Phases** | Single phase | Single phase | Multiple phases |
| **Alternatives** | None | Brief if useful | Only when needed |
| **Risk Analysis** | Brief | Detailed | Comprehensive |
| **Best For** | Solo, clear | Standard feature work | Major, high-risk |

---

## Selection Guidance

### Ask yourself:

1. **Complexity**: How complex is this feature/fix?
   - Simple → Minimal
   - Moderate → Standard
   - Complex → Comprehensive

2. **Collaboration**: Who else needs to understand this?
   - Just me → Minimal
   - Project collaborators → Standard
   - Multiple systems or release-critical stakeholders → Comprehensive

3. **Risk**: What's the impact if this goes wrong?
   - Low impact → Minimal
   - Moderate impact → Standard
   - High impact/compliance → Comprehensive

4. **Uncertainty**: How clear is the implementation approach?
   - Very clear → Minimal
   - Some exploration needed → Standard
   - Significant research required → Comprehensive

5. **Scope**: How much coordination and follow-through will implementation require?
   - Narrow and straightforward → Minimal
   - Moderate and multi-step → Standard
   - Broad, phased, or high-coordination → Comprehensive

---

## When in Doubt

**Default to Standard.**

It's better to have slightly more detail than needed than to discover missing context mid-implementation.

You can always simplify a plan, but adding detail later disrupts flow.

---

## Usage

**Load this file when:** User needs to choose a detail level for their plan.

**Present options:**
```markdown
## Choose Implementation Detail Level

**Minimal** (Quick Plan)
   Best for: Simple bugs, small improvements, clear features

**Standard** (Recommended)
   Best for: Most features, complex bugs, team collaboration

**Comprehensive**
   Best for: Major features, architectural changes, high-risk work

Which level would you like? (Minimal/Standard/Comprehensive)
```

Then load the corresponding template from `assets/`.
