import { strict as assert } from "node:assert";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import registerArtifactSearch from "../extensions/artifact-search";
import registerReferenceReader from "../extensions/read-reference";
import registerRepoSearch from "../extensions/repo-search";

const fixtureUrl = new URL("./fixtures/legacy-tool-contract.json", import.meta.url);

type RegisteredTool = {
  name: string;
  label: string;
  description: string;
  promptSnippet?: string;
  promptGuidelines?: string[];
  parameters: unknown;
  prepareArguments?: (args: unknown) => unknown;
  execute: (...args: any[]) => Promise<any>;
};

function capture(register: (pi: any) => void): RegisteredTool {
  let tool: RegisteredTool | undefined;
  let registrationCount = 0;
  register({
    on() {},
    registerTool(value: RegisteredTool) { registrationCount += 1; tool = value; },
  });
  assert.equal(registrationCount, 1, "Expected extension factory to register exactly one tool.");
  assert(tool, "Expected extension to register one tool.");
  return tool;
}

function shape(value: unknown): unknown {
  if (value === null) return "null";
  if (Array.isArray(value)) return value.length ? [shape(value[0])] : [];
  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, shape(child)]));
  }
  return typeof value;
}

async function captureContracts() {
  const root = await mkdtemp(path.join(tmpdir(), "cg-legacy-contract-"));
  const artifact = capture(registerArtifactSearch);
  const reference = capture(registerReferenceReader);
  const repo = capture(registerRepoSearch);
  const signal = new AbortController().signal;
  try {
    await mkdir(path.join(root, "docs", "solutions"), { recursive: true });
    await mkdir(path.join(root, "src"), { recursive: true });
    await writeFile(path.join(root, "docs", "solutions", "sample.md"), "---\ntags: [sample]\n---\n# Sample Solution\n\ncontractneedle\n", "utf8");
    await writeFile(path.join(root, "src", "sample.ts"), "export const contractneedle = true;\n", "utf8");

    const artifactSuccess = await artifact.execute("artifact-success", { query: "contractneedle", freshnessMode: "strict", explain: true }, signal, undefined, { cwd: root });
    const artifactFailure = await artifact.execute("artifact-failure", { indexPath: "../outside.json" }, signal, undefined, { cwd: root });
    const preparedReference = reference.prepareArguments?.({ path: " @references\\_shared\\vcs-detection.md ", offset: 1, limit: 2 });
    const referenceSuccess = await reference.execute("reference-success", preparedReference, signal, undefined, { cwd: root });
    const referenceFailure = await reference.execute("reference-failure", { path: "../outside.md" }, signal, undefined, { cwd: root });
    const repoSuccess = await repo.execute("repo-success", { queries: [{ id: "contract", pattern: "contractneedle" }], workspaceRoot: root, roots: ["src"] }, signal, undefined, { cwd: root });
    let repoFailure: unknown;
    try {
      await repo.execute("repo-failure", { queries: [{ pattern: "x" }], workspaceRoot: path.join(root, "missing") }, signal, undefined, { cwd: root });
    } catch (error) {
      repoFailure = { throws: true, message: error instanceof Error ? error.message.replaceAll("\\", "/").replace(root.replaceAll("\\", "/"), "<root>") : String(error) };
    }

    const metadata = (tool: RegisteredTool) => ({
      name: tool.name,
      label: tool.label,
      description: tool.description,
      promptSnippet: tool.promptSnippet,
      promptGuidelines: tool.promptGuidelines,
    });
    return {
      schemaVersion: 1,
      tools: {
        cg_read_reference: {
          metadata: metadata(reference),
          parameters: JSON.parse(JSON.stringify(reference.parameters)),
          preparedArguments: preparedReference,
          successShape: shape(referenceSuccess),
          failureShape: shape(referenceFailure),
        },
        cg_search_artifacts: {
          metadata: metadata(artifact),
          parameters: JSON.parse(JSON.stringify(artifact.parameters)),
          successShape: shape(artifactSuccess),
          failureShape: shape(artifactFailure),
        },
        cg_search_repo: {
          metadata: metadata(repo),
          parameters: JSON.parse(JSON.stringify(repo.parameters)),
          successShape: shape(repoSuccess),
          failure: repoFailure,
        },
      },
    };
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

const actual = await captureContracts();
if (process.env.UPDATE_LEGACY_TOOL_CONTRACT === "1") {
  await mkdir(new URL("./fixtures/", import.meta.url), { recursive: true });
  await writeFile(fixtureUrl, `${JSON.stringify(actual, null, 2)}\n`, "utf8");
} else {
  const expected = JSON.parse(await readFile(fixtureUrl, "utf8"));
  assert.deepEqual(actual, expected, "Registered legacy schemas or representative success/failure result shapes changed.");
}

console.log("pi-compound-game-dev legacy tool contract tests passed");
