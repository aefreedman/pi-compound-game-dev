# Harbor departure: synthetic representative slice

All names, copy, and logic here are invented public fixtures. This is readable pseudocode, not Ink, Yarn, or an executable dialogue contract. `option` bodies resume after the choice when they do not jump; `detour` returns to its caller; `jump` transfers without returning. A real adaptation must confirm its target language semantics.

## Authority packet

- Scope: the harbor keeper's departure conversation only; no surrounding project is assumed.
- Source logic: entering with `routeKnown = false` and `departed = false`, all three choices are available in the listed order. Both departure choices teach the safe route and set `departed = true`; leaving does neither. No other state changes.
- Accepted target copy: the copy bank below supersedes source prose, but not source logic. Every displayed line and option label is fixed for this example. The repeated `All right.` is intentional local connective copy.
- Editable target: the proposed layout below. Source packet and copy bank are read-only. Unresolved authority would block adaptation, not permit inventing wording.

## Source packet (logic, not a node plan)

1. Greeting passage offers `Take me across.`, `What is the safe route?`, and `Not tonight.`.
2. Direct-departure passage acknowledges the choice, then teaches the route before boarding.
3. Route-answer passage acknowledges the question and introduces the same route explanation, then boards.
4. Route explanation passage identifies the blue lanterns and warns that the red lantern marks shoals; learning it sets `routeKnown = true`.
5. Boarding passage commits departure and closes the conversation at the ferry.
6. Leaving passage closes the conversation at the quay without learning or departure.

The direct reply belongs in its option body, not a new node merely because source passage 2 exists. The route question earns a separate answer beat before the shared explanation.

## Accepted copy bank

```json
{
  "greeting": "Keeper: The ferry is ready. What will you do?",
  "choices": ["Take me across.", "What is the safe route?", "Not tonight."],
  "acknowledgement": "Keeper: All right.",
  "answer": "Keeper: There is a safe channel, if you know its signs.",
  "route": [
    "Keeper: Follow the blue lanterns until the channel bends east.",
    "Keeper: Keep clear of the red lantern; it marks the shoals, not the landing."
  ],
  "boarding": "Keeper: Step aboard. We leave now.",
  "leaving": "Keeper: Then I will keep the ferry here."
}
```

## Proposed target layout

```text
entry harbor
  say greeting
  option choices[0]
    say acknowledgement
    detour safe-route
  option choices[1]
    say acknowledgement
    jump route-question
  option choices[2]
    say leaving
    exit quay
  # The direct option falls through here after the detour returns.
  say boarding
  set departed = true
  exit ferry

beat route-question
  say answer
  detour safe-route
  say boarding
  set departed = true
  exit ferry

shared safe-route
  say route[0]
  say route[1]
  set routeKnown = true
  return
```

## Compact entry/exit review

Entry: harbor, route unknown, not departed. Choices remain available in their accepted order.

- **Take me across.** → local acknowledgement → route explanation → return → natural fallthrough to boarding → ferry; route known and departed.
- **What is the safe route?** → local acknowledgement → jump to an answer that responds to the question → route explanation → return to the answer's caller continuation → boarding → ferry; route known and departed. The jump deliberately skips the direct option's continuation rather than accidentally boarding twice.
- **Not tonight.** → leaving reply → quay; route remains unknown, not departed. No route lecture or boarding occurs after this exit.

`safe-route` has two distinct external call sites, from the direct option and the question beat, and contains the substantive navigation explanation with its learning effect. Both callers enter without route knowledge and resume into boarding. There is no self-call: a self-reference would not establish reuse. The one-line acknowledgement stays local to each option; identical wording alone does not justify a shared extraction. The short boarding line also stays in its conversational context. Layout follows the conversation, not the six source passage boundaries; this is not a recommended node count.

Unresolved decisions: none within the synthetic packet. For a real target, confirm choice fallthrough, detour return, state persistence, and terminal-exit semantics before implementation; repeated entry with prior route knowledge is outside this slice. Human acceptance and runtime playthrough are not supplied by this example or its static regression checks. Review this bounded slice before requesting any broader conversion.
