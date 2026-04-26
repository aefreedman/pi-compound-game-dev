import { readFile } from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";

const TEXT_EXTENSIONS = new Set([
  ".md",
  ".markdown",
  ".txt",
  ".json",
  ".yaml",
  ".yml",
  ".ts",
  ".js",
  ".sh",
]);

function normalizeForCompare(value: string): string {
  const normalized = path.resolve(value);
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

function normalizeInputPath(input: string): string {
  return input.trim().replace(/^@+/, "").replace(/\\/g, "/");
}

function resolvePackageReference(packageRoot: string, rawPath: string): string {
  const requestedPath = normalizeInputPath(rawPath);

  if (!requestedPath) {
    throw new Error("Reference path is required.");
  }

  if (path.isAbsolute(requestedPath)) {
    throw new Error("Use a package-relative reference path, not an absolute path.");
  }

  const absolutePath = path.resolve(packageRoot, requestedPath);
  const normalizedRoot = normalizeForCompare(packageRoot);
  const normalizedTarget = normalizeForCompare(absolutePath);
  const rootWithSeparator = normalizedRoot.endsWith(path.sep) ? normalizedRoot : `${normalizedRoot}${path.sep}`;

  if (normalizedTarget !== normalizedRoot && !normalizedTarget.startsWith(rootWithSeparator)) {
    throw new Error(`Reference path escapes the package root: ${rawPath}`);
  }

  const extension = path.extname(absolutePath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(extension)) {
    throw new Error(`Unsupported reference file extension: ${extension || "<none>"}`);
  }

  return absolutePath;
}

function sliceLines(text: string, offset?: number, limit?: number): string {
  if (offset === undefined && limit === undefined) return text;

  const lines = text.split(/\r?\n/);
  const start = Math.max((offset ?? 1) - 1, 0);
  const end = limit === undefined ? undefined : start + Math.max(limit, 0);
  return lines.slice(start, end).join("\n");
}

export default function registerCompoundGameDevReferenceReader(pi: ExtensionAPI) {
  const extensionDir = path.dirname(fileURLToPath(import.meta.url));
  const packageRoot = path.resolve(extensionDir, "..");

  pi.registerTool({
    name: "cg_read_reference",
    label: "Read Compound Game Dev Reference",
    description: "Read a Compound Game Dev package reference file by package-relative path.",
    promptSnippet: "Read Compound Game Dev package reference files by package-relative path",
    promptGuidelines: [
      "Use cg_read_reference for Compound Game Dev package references such as references/cg-plan/research-agents.md instead of the read tool with ../references paths.",
      "Pass cg_read_reference package-relative paths only; do not pass project cwd-relative paths or absolute local package paths.",
    ],
    parameters: Type.Object({
      path: Type.String({ description: "Package-relative path such as references/cg-plan/research-agents.md" }),
      offset: Type.Optional(Type.Number({ description: "1-indexed line number to start reading from" })),
      limit: Type.Optional(Type.Number({ description: "Maximum number of lines to return" })),
    }),
    prepareArguments(args) {
      if (!args || typeof args !== "object") return args;
      const input = args as { path?: unknown };
      if (typeof input.path === "string") {
        return { ...args, path: normalizeInputPath(input.path) };
      }
      return args;
    },
    async execute(_toolCallId, params) {
      try {
        const absolutePath = resolvePackageReference(packageRoot, params.path);
        const text = await readFile(absolutePath, "utf8");
        const output = sliceLines(text, params.offset, params.limit);
        const normalizedPackagePath = path.relative(packageRoot, absolutePath).replace(/\\/g, "/");

        return {
          content: [{ type: "text" as const, text: output }],
          details: {
            path: normalizedPackagePath,
            absolutePath,
            offset: params.offset,
            limit: params.limit,
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text" as const, text: message }],
          details: { path: params.path, error: message },
          isError: true,
        };
      }
    },
  });
}
