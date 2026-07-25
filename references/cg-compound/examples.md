# Example Output

## Single Verified Solution

```
Scanning conversation for solved-problem candidates...

Found 1 candidate:
1. [~10:30am] NullReferenceException in PlayerController.Update

Verified 1 solution candidate.
Confirmation provenance: The reported player scenario was reproduced before the change and passed afterward without the original exception.
Observed evidence: The same scene and input sequence completed successfully after the null guard was added.
Remaining validation gap: Other PlayerController states were not exercised.

Documenting verified solution 1 of 1...
Problem: NullReferenceException in PlayerController.Update
```

## Multiple Candidates (Mixed Provenance)

```
Found 3 solved-problem candidates:
1. NullReferenceException in PlayerController
2. GetComponent performance in Combat system
3. Missing semicolon in UIManager

Verified candidate 1: direct validation reproduced the reported failure, then the equivalent scenario passed.
Verified candidate 2: the user explicitly confirmed that the measured Combat slowdown was resolved in the original scenario.
Skipped candidate 3: "done" described implementation completion, but no confirmation provenance tied it to a reported outcome.

Documenting verified solution 1 of 2...
Documenting verified solution 2 of 2...
```
