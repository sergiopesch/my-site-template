import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { getAllEntries } from "../../lib/content";
import {
  checkArtifacts,
  createArtifacts,
  FIXED_OUTPUT_PATHS,
  renderMarkdownDocument,
  writeArtifacts,
} from "../../scripts/generate-machine-content";

test("generation is deterministic and every checked-in output is exact", () => {
  const entries = getAllEntries();
  const first = createArtifacts(entries);
  const second = createArtifacts(entries);

  assert.deepEqual(second, first);
  assert.equal(Object.keys(first).length, FIXED_OUTPUT_PATHS.length + entries.length);

  const result = checkArtifacts(first, { publicDirectory: path.join(process.cwd(), "public") });
  assert.deepEqual(result, { clean: true, missing: [], changed: [], stale: [] });
});

test("drafts and private repository URLs are absent from every public surface", () => {
  const entries = getAllEntries();
  const artifacts = createArtifacts(entries);
  const combined = Object.values(artifacts).join("\n");

  assert.equal(combined.includes("Unpublished workbench note"), false);
  assert.equal(combined.includes("unpublished-workbench-note"), false);

  const index = JSON.parse(artifacts["content-index.json"]);
  const project = index.items.find(
    (item: { slug: string }) => item.slug === "small-tools-collection",
  );
  assert.deepEqual(Object.keys(project.repository).sort(), ["created", "updated", "visibility"]);
  assert.equal(project.repository.visibility, "private");

  const privateUrl = "https://example.com/never-publish-this-private-repository";
  const poisonedEntries = entries.map((entry) =>
    entry.slug === "small-tools-collection"
      ? {
          ...entry,
          repository: { ...entry.repository, url: privateUrl } as typeof entry.repository,
        }
      : entry,
  );
  assert.equal(Object.values(createArtifacts(poisonedEntries)).join("\n").includes(privateUrl), false);
});

test("feeds contain writing only while discovery surfaces contain every entry", () => {
  const entries = getAllEntries();
  const artifacts = createArtifacts(entries);
  const feed = JSON.parse(artifacts["feed.json"]);
  const index = JSON.parse(artifacts["content-index.json"]);

  assert.deepEqual(
    feed.items.map((item: { title: string }) => item.title),
    [
      "Keeping decisions visible",
      "Designing for durable discovery",
      "A slower, better publishing loop",
      "A practical note on better project handoffs",
    ],
  );
  assert.equal(artifacts["rss.xml"].includes("Personal Site Foundation"), false);
  assert.equal(index.items.length, entries.length);
  assert.match(artifacts["sitemap.xml"], /<loc>https:\/\/example\.com\/contact<\/loc>/);
  assert.ok(artifacts["llms.txt"].indexOf("## Key pages") < artifacts["llms.txt"].indexOf("## Projects"));
  assert.match(artifacts["llms.txt"], /\[Contact\]\(https:\/\/example\.com\/contact\)/);

  for (const entry of entries) {
    const indexed = index.items.find((item: { id: string }) => item.id === entry.url);
    const expectedHash = createHash("sha256")
      .update(renderMarkdownDocument(entry), "utf8")
      .digest("hex");
    assert.equal(indexed.markdown_sha256, expectedHash);
    assert.match(indexed.markdown_sha256, /^[a-f0-9]{64}$/);
  }
});

test("agent quick starts stay in retrieval artifacts but not reader surfaces", () => {
  const entries = getAllEntries().map((entry) =>
    entry.slug === "designing-for-durable-discovery"
      ? {
          ...entry,
          body: `${entry.body}\n\n***\n\n## Agent Quick Start\n\n\`\`\`\nMachine instructions.\n\`\`\``,
        }
      : entry,
  );
  const artifacts = createArtifacts(entries);
  const feed = JSON.parse(artifacts["feed.json"]);
  const index = JSON.parse(artifacts["content-index.json"]);
  const feedEntry = feed.items.find(
    (item: { url: string }) => item.url.endsWith("/writing/designing-for-durable-discovery"),
  );
  const indexedEntry = index.items.find(
    (item: { slug: string }) => item.slug === "designing-for-durable-discovery",
  );

  assert.doesNotMatch(feedEntry.content_text, /Agent Quick Start/);
  assert.doesNotMatch(artifacts["rss.xml"], /Agent Quick Start/);
  assert.match(indexedEntry.content_text, /Agent Quick Start/);
  assert.match(
    artifacts["writing/designing-for-durable-discovery.md"],
    /## Agent Quick Start/,
  );
});

test("writer removes stale Markdown and check mode reports drift without mutation", () => {
  const publicDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "site-public-"));
  const artifacts = createArtifacts(getAllEntries());
  writeArtifacts(artifacts, { publicDirectory });

  const stalePath = path.join(publicDirectory, "writing", "stale-entry.md");
  fs.writeFileSync(stalePath, "stale\n", "utf8");
  const beforeCheck = fs.readFileSync(stalePath, "utf8");
  const dirty = checkArtifacts(artifacts, { publicDirectory });

  assert.deepEqual(dirty.stale, ["writing/stale-entry.md"]);
  assert.equal(dirty.clean, false);
  assert.equal(fs.readFileSync(stalePath, "utf8"), beforeCheck);

  writeArtifacts(artifacts, { publicDirectory });
  assert.equal(fs.existsSync(stalePath), false);
  assert.equal(checkArtifacts(artifacts, { publicDirectory }).clean, true);
});

test("writer rejects output paths outside its explicit allowlist", () => {
  const publicDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "site-public-"));
  assert.throws(
    () => writeArtifacts({ "../escape.txt": "no\n" }, { publicDirectory }),
    /Refusing unexpected generated output path/,
  );
});

test("checker rejects symbolic links in managed Markdown directories", () => {
  const publicDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "site-public-"));
  const artifacts = createArtifacts(getAllEntries());
  writeArtifacts(artifacts, { publicDirectory });

  const target = path.join(publicDirectory, "outside.md");
  const link = path.join(publicDirectory, "writing", "linked.md");
  fs.writeFileSync(target, "not generated\n", "utf8");
  fs.symlinkSync(target, link);

  assert.throws(
    () => checkArtifacts(artifacts, { publicDirectory }),
    /Generated output path contains a symbolic link/,
  );
});
