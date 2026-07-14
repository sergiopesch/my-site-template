import assert from "node:assert/strict";
import test from "node:test";

import { getEntry } from "../../lib/content";
import {
  buildBreadcrumbJsonLd,
  buildEntryJsonLd,
  buildEntryMetadata,
  serializeJsonLd,
} from "../../lib/seo";

test("entry metadata, JSON-LD, breadcrumbs, and Markdown use one canonical URL", () => {
  const entry = getEntry("writing", "designing-for-durable-discovery");
  assert.ok(entry);

  const metadata = buildEntryMetadata(entry);
  const jsonLd = buildEntryJsonLd(entry);
  const breadcrumbs = buildBreadcrumbJsonLd(entry);
  const article = jsonLd["@graph"].find((item) => item["@type"] === "BlogPosting");
  const mainEntityOfPage = article?.mainEntityOfPage as
    | Record<string, unknown>
    | undefined;
  const finalBreadcrumb = breadcrumbs.itemListElement.at(-1);

  assert.equal(metadata.alternates.canonical, entry.url);
  assert.equal(metadata.openGraph.url, entry.url);
  assert.equal(metadata.alternates.types["text/markdown"], entry.markdownUrl);
  assert.equal(article?.url, entry.url);
  assert.equal(mainEntityOfPage?.["@id"], entry.url);
  assert.equal(finalBreadcrumb?.item, entry.url);
});

test("JSON-LD serialization cannot terminate its script element", () => {
  const payload = {
    value: "</script><script>alert('unsafe')</script>",
    separators: "\u2028\u2029&<>",
  };
  const serialized = serializeJsonLd(payload);

  assert.equal(serialized.includes("</script>"), false);
  assert.equal(serialized.includes("<script>"), false);
  assert.match(serialized, /\\u003c\/script\\u003e/);
  assert.deepEqual(JSON.parse(serialized), payload);
});

test("private project JSON-LD never emits codeRepository", () => {
  const entry = getEntry("project", "small-tools-collection");
  assert.ok(entry);
  const graph = buildEntryJsonLd(entry)["@graph"];
  const project = graph.find((item) => item["@id"] === `${entry.url}#work`);

  assert.ok(project);
  assert.equal(Object.hasOwn(project, "codeRepository"), false);
  assert.equal(serializeJsonLd(project).includes("codeRepository"), false);
});
