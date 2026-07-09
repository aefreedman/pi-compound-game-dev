import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";

const commands = readFileSync(new URL("../skills/file-todos/references/commands.md", import.meta.url), "utf8").replace(/\r\n/g, "\n");

assert(!/\bfind\b/.test(commands), "File-todo shell fallbacks must not require GNU find.");
assert(!/-printf\b/.test(commands), "File-todo shell fallbacks must not use GNU find -printf.");
assert(!/\bdate\s+-d\b/.test(commands), "File-todo shell fallbacks must not use GNU date -d.");

for (const pattern of ["*-pending-*.md", "*.md", "*-p1-*.md"]) {
  assert(
    commands.includes(`for todo in "\${TODOS_ROOT}"/${pattern}; do\n  [ -f "\${todo}" ] || continue`),
    `Expected a safe top-level glob loop for ${pattern}.`,
  );
}

console.log("pi-compound-game-dev file-todos portable shell tests passed");
