import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { siteConfig, validateSiteUrl } from "../../config/site";
import {
  getAllEntries,
  getEntriesByKind,
  getEntry,
} from "../../lib/content";
import { stripAgentQuickStart } from "../../lib/presentation";

function fixtureContent(files: Record<string, string>): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "site-content-"));
  for (const [relativePath, content] of Object.entries(files)) {
    const filePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content.replace(/^\n/, ""), "utf8");
  }
  return root;
}

test("the canonical site origin is HTTPS, has no trailing slash, and uses neutral identity", () => {
  assert.equal(siteConfig.url, "https://example.com");
  assert.equal(siteConfig.name, "Your Name");
  assert.equal(siteConfig.title, "Your Name — Projects and Thoughts");
  assert.equal(siteConfig.email, "hello@example.com");
  assert.equal(validateSiteUrl("https://example.org"), "https://example.org");

  for (const invalid of [
    "http://example.org",
    "https://example.org/",
    "https://example.org/path",
    "https://example.org?query=yes",
    "not a URL",
  ]) {
    assert.throws(() => validateSiteUrl(invalid), /valid HTTPS origin without a trailing slash/);
  }
});

function validEntry(overrides = ""): string {
  return `---
title: "Fixture entry"
slug: "fixture-entry"
summary: "A sufficiently detailed summary for a valid fixture entry."
date: "2025-01-01"
content_updated: "2025-01-02"
language: "en"
topics: ["Testing"]
${overrides}---

Fixture body.
`;
}

test("the public catalog is normalized, stable, and excludes drafts", () => {
  const entries = getAllEntries();

  assert.deepEqual(
    entries.map((entry) => entry.title),
    [
      "Personal Site Foundation",
      "Keeping decisions visible",
      "Neighborhood Field Guide",
      "Designing for durable discovery",
      "A slower, better publishing loop",
      "Small Tools Collection",
      "A practical note on better project handoffs",
      "Reading Room",
    ],
  );
  assert.equal(entries.length, 8);
  assert.equal(getEntriesByKind("project").length, 4);
  assert.equal(getEntriesByKind("writing").length, 4);
  assert.equal(getEntriesByKind("post").length, 4);
  assert.equal(entries.some((entry) => entry.slug === "unpublished-workbench-note"), false);

  for (const entry of entries) {
    assert.equal("data" in entry, false);
    assert.equal("frontmatter" in entry, false);
    assert.equal("draft" in entry, false);
    assert.match(entry.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(entry.contentUpdated >= entry.datePublished);
    assert.equal(entry.dateModified, entry.contentUpdated);
  }
});

test("canonical slugs and declared aliases resolve to the same public entry", () => {
  const canonical = getEntry("writing", "designing-for-durable-discovery");
  const alias = getEntry("writing", "/blog/durable-discovery");

  assert.ok(canonical);
  assert.equal(alias?.url, canonical.url);
  assert.equal(alias?.markdownUrl, `${canonical.url}.md`);
  assert.equal(getEntry("writing", "unpublished-workbench-note"), null);
});

test("agent quick starts are excluded from human content without mutating their source", () => {
  const source = `Human-facing conclusion.\n\n***\n\n## Agent Quick Start\n\n\`\`\`\nMachine instructions.\n\`\`\``;

  assert.equal(stripAgentQuickStart(source), "Human-facing conclusion.");
  assert.match(source, /## Agent Quick Start/);
});

test("private repositories cannot carry a URL", () => {
  const contentDirectory = fixtureContent({
    "projects/fixture-entry.md": validEntry(`repository:
  visibility: "private"
  url: "https://example.com/private-repository"
  created: "2024-12-01"
  updated: "2025-01-01"
`),
  });

  assert.throws(
    () => getAllEntries({ contentDirectory }),
    /invalid frontmatter.*url|Unrecognized key/i,
  );
});

test("validation rejects malformed slugs, non-HTTPS URLs, and reversed dates", () => {
  const invalid = validEntry(`sources:
  - title: "Unsafe source"
    url: "http://example.com/source"
`)
    .replace('slug: "fixture-entry"', 'slug: "Fixture Entry"')
    .replace('content_updated: "2025-01-02"', 'content_updated: "2024-12-31"');
  const contentDirectory = fixtureContent({
    "posts/fixture-entry.md": invalid,
  });

  assert.throws(
    () => getAllEntries({ contentDirectory }),
    /slug must use lowercase kebab case|absolute HTTPS|cannot be earlier/i,
  );
});

test("aliases are unique across published and draft records", () => {
  const first = validEntry(`aliases: ["/blog/shared-alias"]
`);
  const second = validEntry(`aliases: ["/blog/shared-alias"]
draft: true
`)
    .replace('title: "Fixture entry"', 'title: "Second fixture"')
    .replace('slug: "fixture-entry"', 'slug: "second-fixture"');
  const contentDirectory = fixtureContent({
    "posts/fixture-entry.md": first,
    "posts/second-fixture.md": second,
  });

  assert.throws(() => getAllEntries({ contentDirectory }), /Alias .* is shared by/);
});

test("aliases cannot replace reserved application routes", () => {
  const contentDirectory = fixtureContent({
    "posts/fixture-entry.md": validEntry(`aliases: ["/about"]
`),
  });

  assert.throws(
    () => getAllEntries({ contentDirectory }),
    /Alias cannot replace a reserved application route: \/about/,
  );
});
