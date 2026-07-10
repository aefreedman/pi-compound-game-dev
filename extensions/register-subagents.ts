import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const PACKAGE_AGENT_REGISTRY_SYMBOL = Symbol.for("pi.subagent-tools.agent-dir-registry");

type RegisteredPackageAgentDir = {
  agentDir: string;
  packageRoot: string;
  packageName?: string;
  registeredBy?: string;
};

type PackageAgentRegistry = {
  packageAgentDirs: RegisteredPackageAgentDir[];
};

function getRegistry(): PackageAgentRegistry {
  const globalState = globalThis as Record<PropertyKey, unknown>;
  const existing = globalState[PACKAGE_AGENT_REGISTRY_SYMBOL];
  if (existing && typeof existing === "object") {
    return existing as PackageAgentRegistry;
  }
  const created: PackageAgentRegistry = { packageAgentDirs: [] };
  globalState[PACKAGE_AGENT_REGISTRY_SYMBOL] = created;
  return created;
}

function normalizeExistingPath(targetPath: string): string {
  const resolved = (() => {
    try {
      return fs.realpathSync.native(targetPath);
    } catch {
      return path.resolve(targetPath);
    }
  })();
  return resolved.replace(/\\/g, "/");
}

function samePath(a: string, b: string): boolean {
  const normalizeForCompare = (value: string) => {
    const normalized = path.normalize(value);
    return process.platform === "win32" ? normalized.toLowerCase() : normalized;
  };
  return normalizeForCompare(a) === normalizeForCompare(b);
}

function readPackageName(packageRoot: string): string | undefined {
  try {
    const raw = fs.readFileSync(path.join(packageRoot, "package.json"), "utf-8");
    const parsed = JSON.parse(raw) as { name?: unknown };
    return typeof parsed.name === "string" && parsed.name.trim() ? parsed.name.trim() : undefined;
  } catch {
    return undefined;
  }
}

export default function registerCompoundGameDevAgents(_pi: ExtensionAPI) {
  const extensionDir = path.dirname(fileURLToPath(import.meta.url));
  const packageRoot = normalizeExistingPath(path.resolve(extensionDir, ".."));
  const agentDir = normalizeExistingPath(path.join(packageRoot, "agents"));

  try {
    if (!fs.statSync(agentDir).isDirectory()) return;
  } catch {
    return;
  }

  const registry = getRegistry();
  const packageName = readPackageName(packageRoot) ?? "@aefree/pi-compound-game-dev";
  const entry: RegisteredPackageAgentDir = {
    agentDir,
    packageRoot,
    packageName,
    registeredBy: fileURLToPath(import.meta.url),
  };

  const existing = registry.packageAgentDirs.find(
    (candidate) => samePath(candidate.agentDir, entry.agentDir) && samePath(candidate.packageRoot, entry.packageRoot),
  );

  if (existing) {
    existing.packageName = existing.packageName ?? entry.packageName;
    existing.registeredBy = existing.registeredBy ?? entry.registeredBy;
    return;
  }

  registry.packageAgentDirs.push(entry);
}
