import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";

const commands = readFileSync(new URL("../skills/file-todos/references/commands.md", import.meta.url), "utf8").replace(/\r\n/g, "\n");

assert(!/\bfind\b/.test(commands), "File-todo shell fallbacks must not require GNU find.");
assert(!/-printf\b/.test(commands), "File-todo shell fallbacks must not use GNU find -printf.");
assert(!/\bdate\s+-d\b/.test(commands), "File-todo shell fallbacks must not use GNU date -d.");

assert(commands.includes("Bash syntax") && commands.includes("naked PowerShell cmdlets"), "Expected shell fallback commands to identify their shell context.");
assert(commands.includes("exit status `1`") && commands.includes("successful empty result") && commands.includes("exit status `2`"), "Expected ripgrep no-match guidance.");
assert(commands.includes("rg -l --glob '*-ready-p1-*.md' '^dependencies: \\[\\]' \"${TODOS_ROOT}\""), "Expected ready-P1 search to use a concrete root with an rg glob.");
assert(!commands.includes('"${TODOS_ROOT}"/*-ready-p1-*.md'), "Ready-P1 search must not pass an unmatched wildcard as a literal rg root.");

for (const pattern of ["*-pending-*.md", "*.md", "*-p1-*.md"]) {
  assert(
    commands.includes(`for todo in "\${TODOS_ROOT}"/${pattern}; do\n  [ -f "\${todo}" ] || continue`),
    `Expected a safe top-level glob loop for ${pattern}.`,
  );
}

console.log("pi-compound-game-dev file-todos portable shell tests passed");
