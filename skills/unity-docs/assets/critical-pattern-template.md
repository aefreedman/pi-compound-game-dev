# Critical Pattern Template

Use this template when adding a pattern to `docs/solutions/patterns/critical-patterns.md`:

---

## N. [Pattern Name] (ALWAYS REQUIRED)

### ❌ WRONG ([Will cause X error])
```csharp
// Example showing wrong approach in Unity C#
void Start()
{
    _rigidbody.velocity = Vector3.zero; // Null reference if component missing
}
```

### ✅ CORRECT
```csharp
// Example showing correct approach
void Start()
{
    _rigidbody = GetComponent<Rigidbody>();
    if (_rigidbody != null)
    {
        _rigidbody.velocity = Vector3.zero;
    }
}
```

**Why:** [Technical explanation of why this is required in Unity]

**Placement/Context:** [When this applies - e.g., "In MonoBehaviour lifecycle methods", "When accessing components"]

**Documented in:** `docs/solutions/[category]/[filename].md`

---

**Instructions:**
1. Replace N with the next pattern number
2. Replace [Pattern Name] with descriptive title
3. Fill in WRONG example with Unity C# code that causes the problem
4. Fill in CORRECT example with the solution
5. Explain the technical reason in "Why"
6. Clarify when this pattern applies in "Placement/Context"
7. Link to the full troubleshooting doc where this was originally solved
