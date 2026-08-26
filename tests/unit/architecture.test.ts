import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const projectRoot = process.cwd();

function listSourceFiles(directory: string): string[] {
  const root = path.join(projectRoot, directory);
  return fs.readdirSync(root, { recursive: true, encoding: "utf8" })
    .filter((entry) => /\.(?:ts|tsx|js|jsx)$/.test(entry))
    .map((entry) => path.join(directory, entry).split(path.sep).join("/"))
    .sort();
}

test("the foundation stays server-first and contains no agent or chat runtime", () => {
  const sourceFiles = ["app", "components", "lib"].flatMap(listSourceFiles);
  const clientModules = sourceFiles.filter((file) =>
    /^\s*["']use client["'];?/m.test(
      fs.readFileSync(path.join(projectRoot, file), "utf8"),
    ),
  );
  const routeHandlers = sourceFiles.filter((file) => file.endsWith("/route.ts"));
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"),
  );
  const runtimeDependencies = Object.keys(packageJson.dependencies ?? {});

  assert.deepEqual(clientModules, ["components/site-header.tsx"]);
  assert.deepEqual(routeHandlers, []);
  assert.equal(
    runtimeDependencies.some((dependency) =>
      /(?:^|[-_/])(?:ai|openai|anthropic|langchain|chat)(?:$|[-_/])/i.test(
        dependency,
      ),
    ),
    false,
  );
});

test("the full dependency graph stays covered by the security audit", () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"),
  );
  const packageLock = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "package-lock.json"), "utf8"),
  );
  const workflow = fs.readFileSync(
    path.join(projectRoot, ".github/workflows/ci.yml"),
    "utf8",
  );
  const braceExpansionVersions = Object.entries(
    packageLock.packages as Record<string, { version?: string }>,
  )
    .filter(([packagePath]) => packagePath.endsWith("node_modules/brace-expansion"))
    .map(([, metadata]) => metadata.version)
    .filter((version): version is string => Boolean(version));

  assert.equal(packageJson.devDependencies["eslint-config-next"], undefined);
  assert.equal(packageJson.scripts.audit, "npm audit --audit-level=high");
  assert.match(workflow, /run: npm run audit/);
  assert.doesNotMatch(workflow, /npm audit[^\n]*--omit=dev/);
  assert.ok(braceExpansionVersions.length > 0);
  assert.equal(
    braceExpansionVersions.every(
      (version) =>
        version.localeCompare("5.0.9", undefined, { numeric: true }) >= 0,
    ),
    true,
  );
});
