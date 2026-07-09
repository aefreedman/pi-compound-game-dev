import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const packageRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const scriptRelativePath = "skills/git-worktree/scripts/worktree-manager.sh";
const scriptPath = join(packageRoot, ...scriptRelativePath.split("/"));

function run(command: string, args: string[]) {
  return spawnSync(command, args, {
    cwd: packageRoot,
    encoding: "utf8",
    shell: false,
  });
}

function readTarMember(tar: Buffer, expectedName: string): Buffer {
  for (let offset = 0; offset + 512 <= tar.length; ) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;

    const name = header.subarray(0, 100).toString("utf8").replace(/\0.*$/s, "");
    const sizeText = header.subarray(124, 136).toString("ascii").replace(/\0.*$/s, "").trim();
    const size = Number.parseInt(sizeText || "0", 8);
    const dataStart = offset + 512;

    if (name === expectedName) return tar.subarray(dataStart, dataStart + size);
    offset = dataStart + Math.ceil(size / 512) * 512;
  }

  throw new Error(`Missing tar member: ${expectedName}`);
}

const attributes = readFileSync(join(packageRoot, ".gitattributes"), "utf8");
assert.match(attributes, /^\*\.sh text eol=lf$/m, "Shell scripts must be checked out with LF line endings.");
assert(!readFileSync(scriptPath).includes(13), "worktree-manager.sh source must not contain carriage returns.");

const syntaxCheck = run("bash", ["-n", scriptPath]);
assert.equal(syntaxCheck.status, 0, syntaxCheck.stderr || "worktree-manager.sh failed bash -n.");

const worktreeCheck = run("git", ["rev-parse", "--is-inside-work-tree"]);
if (worktreeCheck.status === 0 && worktreeCheck.stdout.trim() === "true") {
  const attributeCheck = run("git", ["check-attr", "eol", "--", scriptRelativePath]);
  assert.equal(attributeCheck.status, 0, attributeCheck.stderr || "git check-attr failed.");
  assert.match(attributeCheck.stdout, /: eol: lf\s*$/, "Git must resolve the worktree script's eol attribute to lf.");
}

const packDirectory = mkdtempSync(join(tmpdir(), "pi-compound-pack-"));
try {
  const npmExecPath = process.env.npm_execpath;
  const packed = npmExecPath
    ? run(process.execPath, [npmExecPath, "pack", "--silent", "--pack-destination", packDirectory])
    : run("npm", ["pack", "--silent", "--pack-destination", packDirectory]);
  assert.equal(packed.status, 0, packed.error?.message || packed.stderr || packed.stdout || "npm pack failed.");

  const archives = readdirSync(packDirectory).filter((name) => name.endsWith(".tgz"));
  assert.equal(archives.length, 1, `Expected one package archive, found ${archives.length}.`);

  const tar = gunzipSync(readFileSync(join(packDirectory, archives[0])));
  const packedScript = readTarMember(tar, `package/${scriptRelativePath}`);
  assert(!packedScript.includes(13), "Packed worktree-manager.sh must not contain carriage returns.");
} finally {
  rmSync(packDirectory, { recursive: true, force: true });
}

console.log("pi-compound-game-dev shell packaging tests passed");
