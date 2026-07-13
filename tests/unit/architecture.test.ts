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
