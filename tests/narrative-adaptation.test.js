import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";

// Static package/document regression checks only; no model or dialogue interpreter.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");
const skill = read("skills/narrative-adaptation/SKILL.md");
const example = read("skills/narrative-adaptation/references/harbor-slice.md");
const pkg = JSON.parse(read("package.json"));
assert(pkg.pi.skills.includes("./skills"));
assert.match(skill, /^---\nname: narrative-adaptation\ndescription: ([^\n]{1,1024})\n---/);
assert.match(skill, /not general prose editing/);
assert.match(skill, /cg_read_reference/);
assert.match(skill, /skills\/narrative-adaptation\/references\/harbor-slice.md/);
for (const boundary of ["Source logic governs", "accepted target copy governs", "stop the affected adaptation", "natural option fallthrough", "Self-reference does not count as reuse", "No universal node count", "uninspected narrative-project instructions"]) {
  assert(skill.includes(boundary), `Missing guidance boundary: ${boundary}`);
}

const copy = JSON.parse(example.match(/```json\n([\s\S]*?)\n```/)[1]);
assert.deepEqual(copy.choices, ["Take me across.", "What is the safe route?", "Not tonight."]);
assert.equal(copy.greeting, "Keeper: The ferry is ready. What will you do?");
assert.equal(copy.acknowledgement, "Keeper: All right.");
assert.equal(copy.answer, "Keeper: There is a safe channel, if you know its signs.");
assert.deepEqual(copy.route, [
  "Keeper: Follow the blue lanterns until the channel bends east.",
  "Keeper: Keep clear of the red lantern; it marks the shoals, not the landing.",
]);
assert.equal(copy.boarding, "Keeper: Step aboard. We leave now.");
assert.equal(copy.leaving, "Keeper: Then I will keep the ferry here.");
const layout = example.match(/```text\n([\s\S]*?)\n```/)[1];

// Pin this specific public example's authored layout, not a generic graph metric.
function checkSlice(text) {
  assert.match(text, /option choices\[0\]\n    say acknowledgement\n    detour safe-route\n  option choices\[1\]\n    say acknowledgement\n    jump route-question\n  option choices\[2\]\n    say leaving\n    exit quay/);
  assert.match(text, /# The direct option falls through here after the detour returns\.\n  say boarding\n  set departed = true\n  exit ferry/);
  assert.match(text, /beat route-question\n  say answer\n  detour safe-route\n  say boarding\n  set departed = true\n  exit ferry/);
  assert.equal(text.split("shared safe-route\n")[1], "  say route[0]\n  say route[1]\n  set routeKnown = true\n  return");
  for (const [, key, index] of text.matchAll(/say (\w+)(?:\[(\d+)\])?/g)) {
    assert(index === undefined ? typeof copy[key] === "string" : typeof copy[key]?.[Number(index)] === "string", `Unresolved copy: ${key}`);
  }
}
checkSlice(layout);
assert.throws(() => checkSlice(layout.replace("    exit quay", "    jump route-question")), "Leaving must not teach the route or depart.");
assert.throws(() => checkSlice(layout.replace("  say route[1]\n", "")), "Shared explanation must preserve the shoals warning.");
assert.throws(() => checkSlice(layout.replace("  return", "  detour safe-route\n  return")), "Self-call is not external reuse.");
assert.throws(() => checkSlice(layout.replace("    say acknowledgement", "    detour acknowledgement")), "Do not extract the local one-line connective.");
assert.match(example, /Unresolved decisions: none within the synthetic packet/);
assert.match(example, /Human acceptance and runtime playthrough are not supplied/);
console.log("narrative-adaptation static skill/example checks passed (no model or runtime execution)");
