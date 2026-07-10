import { strict as assert } from "node:assert";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";
import {
  buildRipgrepArgs,
  buildUnityGeneratedExclusions,
  displayPathFromRoot,
  isPathWithin,
  parseRipgrepMatchEvent,
  runRipgrepCell,
  type RepoSearchQuery,
} from "../extensions/repo-search-core";

const literalQuery: RepoSearchQuery = { id: "literal", pattern: "Needle", literal: true };
const args = buildRipgrepArgs({
  root: "/workspace/Game Assets",
  query: literalQuery,
  globs: ["*.cs"],
  ignoreFiles: ["/workspace/ignore.conf"],
  unityExclusions: ["!**/Library/**"],
  includeHidden: false,
  maxMatches: 10,
  maxMatchesPerFile: 3,
});
assert(args.includes("--fixed-strings"), "Literal queries should use ripgrep fixed-string mode.");
assert.deepEqual(args.slice(-4), ["-e", "Needle", "--", "/workspace/Game Assets"], "Pattern and root must be option-safe arguments.");
assert(args.includes("/workspace/ignore.conf") && args.includes("!**/Library/**"), "Expected ignore and Unity exclusion arguments.");

assert(isPathWithin("C:\\Work\\Repo", "C:\\Work\\Repo\\Assets", path.win32), "Expected Windows child containment.");
assert(!isPathWithin("C:\\Work\\Repo", "C:\\Work\\Repository2", path.win32), "Windows prefix siblings must not pass containment.");
assert.equal(displayPathFromRoot("C:\\Work\\Repo", "C:\\Work\\Repo\\Assets\\Code.cs", path.win32), "Assets/Code.cs");
assert(isPathWithin("/Users/dev/repo", "/Users/dev/repo/Assets", path.posix), "Expected macOS/POSIX child containment.");
assert(!isPathWithin("/Users/dev/repo", "/Users/dev/repository2", path.posix), "POSIX prefix siblings must not pass containment.");
assert.equal(displayPathFromRoot("/Users/dev/repo", "/Users/dev/repo/Assets/Code.cs", path.posix), "Assets/Code.cs");

const unityRootExclusions = buildUnityGeneratedExclusions("/workspace/game", ["/workspace/game"], path.posix);
assert(unityRootExclusions.globs.includes("!Library/**") && !unityRootExclusions.globs.includes("!**/Build/**"), "Unity-root searches should exclude only direct generated children.");
const authoredAssetsExclusions = buildUnityGeneratedExclusions("/workspace/game/Assets", ["/workspace/game"], path.posix);
assert.deepEqual(authoredAssetsExclusions, { globs: [], rootExcluded: false }, "Authored subtrees must not recursively exclude same-named folders.");
assert.equal(buildUnityGeneratedExclusions("/workspace/game/Library", ["/workspace/game"], path.posix).rootExcluded, true, "Explicit generated roots should be policy-excluded.");
assert(buildUnityGeneratedExclusions("C:\\workspace", ["C:\\workspace\\game"], path.win32).globs.includes("!game/Library/**"), "Parent searches should scope Unity exclusions to the detected project.");

const parsedEvent = parseRipgrepMatchEvent(JSON.stringify({
  type: "match",
  data: {
    path: { text: "Assets/Code.cs" },
    line_number: 12,
    lines: { text: "const Needle = true;\n" },
    submatches: [{ start: 6, end: 12 }],
  },
}), "/workspace", 80);
assert.deepEqual(parsedEvent, { path: "Assets/Code.cs", line: 12, column: 7, text: "const Needle = true;" });

const preAbortedController = new AbortController();
preAbortedController.abort();
await assert.rejects(runRipgrepCell({
  cwd: process.cwd(),
  root: process.cwd(),
  query: literalQuery,
  globs: [],
  ignoreFiles: [],
  unityExclusions: [],
  includeHidden: false,
  maxMatches: 1,
  maxMatchesPerFile: 1,
  maxSnippetChars: 80,
  timeoutMs: 1000,
  signal: preAbortedController.signal,
}), /cancelled/, "A pre-aborted search must not spawn ripgrep.");

const root = mkdtempSync(path.join(tmpdir(), "cg-search-repo-"));
try {
  const sourceRoot = path.join(root, "Source With Spaces");
  mkdirSync(sourceRoot, { recursive: true });
  writeFileSync(path.join(sourceRoot, "alpha.txt"), "Needle one\nNeedle two\n", "utf8");
  writeFileSync(path.join(sourceRoot, "ignored.txt"), "Needle ignored\n", "utf8");
  const ignoreFile = path.join(root, "ignore.conf");
  writeFileSync(ignoreFile, "ignored.txt\n", "utf8");

  const matched = await runRipgrepCell({
    cwd: root,
    root: sourceRoot,
    query: literalQuery,
    globs: [],
    ignoreFiles: [ignoreFile],
    unityExclusions: [],
    includeHidden: false,
    maxMatches: 10,
    maxMatchesPerFile: 5,
    maxSnippetChars: 120,
    timeoutMs: 10_000,
  });
  assert.equal(matched.status, "matched");
  assert.equal(matched.matches.length, 2);
  assert(matched.matches.every((match) => !match.path.includes("ignored.txt")), "Plastic ignore file should apply to the scoped root.");

  const noMatches = await runRipgrepCell({
    cwd: root,
    root: sourceRoot,
    query: { id: "none", pattern: "Not present", literal: true },
    globs: [],
    ignoreFiles: [],
    unityExclusions: [],
    includeHidden: false,
    maxMatches: 10,
    maxMatchesPerFile: 5,
    maxSnippetChars: 120,
    timeoutMs: 10_000,
  });
  assert.equal(noMatches.status, "no_matches");

  const invalidRegex = await runRipgrepCell({
    cwd: root,
    root: sourceRoot,
    query: { id: "bad", pattern: "(", literal: false },
    globs: [],
    ignoreFiles: [],
    unityExclusions: [],
    includeHidden: false,
    maxMatches: 10,
    maxMatchesPerFile: 5,
    maxSnippetChars: 120,
    timeoutMs: 10_000,
  });
  assert.equal(invalidRegex.status, "invalid_regex");

  const limited = await runRipgrepCell({
    cwd: root,
    root: sourceRoot,
    query: literalQuery,
    globs: [],
    ignoreFiles: [],
    unityExclusions: [],
    includeHidden: false,
    maxMatches: 1,
    maxMatchesPerFile: 5,
    maxSnippetChars: 120,
    timeoutMs: 10_000,
  });
  assert.equal(limited.status, "partial_limit");
  assert.equal(limited.matches.length, 1);
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log("pi-compound-game-dev repository search tests passed");
