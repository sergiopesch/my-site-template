#!/usr/bin/env node

import fs from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { siteConfig } from "../config/site";
import {
  getAllEntries,
  type ContentOptions,
  type PublishedEntry,
} from "../lib/content";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIRECTORY, "..");
const DEFAULT_PUBLIC_DIRECTORY = path.join(PROJECT_ROOT, "public");
const DEFAULT_RUNTIME_CATALOG_PATH = path.join(
  PROJECT_ROOT,
  "generated",
  "content-catalog.json",
);

export const FIXED_OUTPUT_PATHS = [
  "robots.txt",
  "sitemap.xml",
  "rss.xml",
  "feed.json",
  "content-index.json",
  "llms.txt",
  "llms-full.txt",
] as const;

const FIXED_OUTPUT_SET = new Set<string>(FIXED_OUTPUT_PATHS);
const GENERATED_MARKDOWN_PATTERN = /^(projects|writing)\/[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

export type GeneratedArtifacts = Record<string, string>;

export interface ArtifactIoOptions {
  publicDirectory?: string;
}

export interface GeneratorOptions extends ContentOptions, ArtifactIoOptions {
  check?: boolean;
}

export interface ArtifactCheckResult {
  clean: boolean;
  missing: string[];
  changed: string[];
  stale: string[];
}

function serializeRuntimeCatalog(entries: PublishedEntry[]): string {
  return withLf(JSON.stringify(sortedEntries(entries), null, 2));
}

function checkRuntimeCatalog(entries: PublishedEntry[]): boolean {
  return (
    fs.existsSync(DEFAULT_RUNTIME_CATALOG_PATH) &&
    fs.readFileSync(DEFAULT_RUNTIME_CATALOG_PATH, "utf8") ===
      serializeRuntimeCatalog(entries)
  );
}

function writeRuntimeCatalog(entries: PublishedEntry[]): void {
  const directory = path.dirname(DEFAULT_RUNTIME_CATALOG_PATH);
  assertNoSymlinkComponents(PROJECT_ROOT, DEFAULT_RUNTIME_CATALOG_PATH);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(
    DEFAULT_RUNTIME_CATALOG_PATH,
    serializeRuntimeCatalog(entries),
    "utf8",
  );
}

function withLf(value: string): string {
  return `${value.replace(/\r\n?/g, "\n").trimEnd()}\n`;
}

function escapeXml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeCdata(value: string): string {
  return value.replace(/]]>/g, "]]]]><![CDATA[>");
}

function escapeMarkdownText(value: string): string {
  return value.replace(/([\\\[\]])/g, "\\$1");
}

export function markdownToText(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/[*_>`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toRfc3339(value: string): string {
  return `${value}T00:00:00.000Z`;
}

function toRfc822(value: string): string {
  return new Date(`${value}T00:00:00.000Z`).toUTCString();
}

function compareForPublication(left: PublishedEntry, right: PublishedEntry): number {
  return (
    right.datePublished.localeCompare(left.datePublished) ||
    left.kind.localeCompare(right.kind) ||
    left.slug.localeCompare(right.slug)
  );
}

function sortedEntries(entries: PublishedEntry[]): PublishedEntry[] {
  return [...entries].sort(compareForPublication);
}

function latestContentDate(entries: PublishedEntry[]): string | null {
  return entries.reduce<string | null>(
    (latest, entry) => (!latest || entry.contentUpdated > latest ? entry.contentUpdated : latest),
    null,
  );
}

function repositoryForPublication(entry: PublishedEntry) {
  if (!entry.repository) return null;
  if (entry.repository.visibility === "public") {
    return {
      visibility: entry.repository.visibility,
      url: entry.repository.url,
      created: entry.repository.created,
      updated: entry.repository.updated,
    };
  }

  // Project private-repository metadata explicitly has no URL. Keep this
  // projection defensive even if an untyped caller constructs an invalid
  // PublishedEntry instead of using the validated content loader.
  return {
    visibility: entry.repository.visibility,
    created: entry.repository.created,
    updated: entry.repository.updated,
  };
}

function renderMetadataLine(label: string, value: string | null, url?: string | null) {
  if (!value) return null;
  return url
    ? `- ${label}: [${escapeMarkdownText(value)}](${url})`
    : `- ${label}: ${value}`;
}

export function renderMarkdownDocument(entry: PublishedEntry): string {
  const repositoryUrl =
    entry.repository?.visibility === "public" ? entry.repository.url : null;
  const metadata = [
    renderMetadataLine("Canonical page", entry.url, entry.url),
    renderMetadataLine("Content type", entry.kind),
    renderMetadataLine("Published", entry.datePublished),
    renderMetadataLine("Content updated", entry.contentUpdated),
    renderMetadataLine("Language", entry.language),
    renderMetadataLine("Topics", entry.topics.join(", ")),
    renderMetadataLine("Repository visibility", entry.repository?.visibility ?? null),
    renderMetadataLine("Repository created", entry.repositoryCreated),
    renderMetadataLine("Repository updated", entry.repositoryUpdated),
    renderMetadataLine("Source code", repositoryUrl, repositoryUrl),
    renderMetadataLine("Live project", entry.demoUrl, entry.demoUrl),
    renderMetadataLine("License", entry.license?.name ?? null, entry.license?.url),
    renderMetadataLine("License scope", entry.license?.scope ?? null),
    renderMetadataLine("License verified", entry.license?.verified ?? null),
  ].filter((line): line is string => Boolean(line));

  const sections = [
    `# ${entry.title}`,
    `> ${entry.summary}`,
    metadata.join("\n"),
    "## Content",
    entry.body,
    "## Provenance and freshness",
    `First-party publication by ${siteConfig.author.name}. The content was last updated on ${entry.contentUpdated}.`,
  ];

  if (entry.aliases.length > 0) {
    sections.push(
      "### Previous addresses",
      entry.aliases.map((alias) => `- ${alias}`).join("\n"),
    );
  }

  if (entry.sources.length > 0) {
    sections.push(
      "### Sources",
      entry.sources
        .map((source) => `- [${escapeMarkdownText(source.title)}](${source.url})`)
        .join("\n"),
    );
  }

  return withLf(sections.join("\n\n"));
}

export function buildRobotsTxt(): string {
  return withLf(`User-agent: *
Allow: /

Sitemap: ${siteConfig.absoluteUrl("/sitemap.xml")}`);
}

export function buildSitemap(entries: PublishedEntry[]): string {
  const projects = entries.filter((entry) => entry.kind === "project");
  const writing = entries.filter((entry) => entry.kind === "post");
  const urls = [
    { url: siteConfig.url, lastmod: latestContentDate(entries) },
    { url: siteConfig.absoluteUrl(siteConfig.routes.about), lastmod: null },
    { url: siteConfig.absoluteUrl(siteConfig.routes.projects), lastmod: latestContentDate(projects) },
    { url: siteConfig.absoluteUrl(siteConfig.routes.writing), lastmod: latestContentDate(writing) },
    { url: siteConfig.absoluteUrl(siteConfig.routes.contact), lastmod: null },
    ...sortedEntries(entries).map((entry) => ({ url: entry.url, lastmod: entry.contentUpdated })),
  ];

  return withLf(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ url, lastmod }) => `  <url>
    <loc>${escapeXml(url)}</loc>${lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ""}
  </url>`,
  )
  .join("\n")}
</urlset>`);
}

function bodyAsHtml(entry: PublishedEntry): string {
  return entry.body
    .split(/\n\n+/)
    .map(markdownToText)
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeXml(paragraph)}</p>`)
    .join("");
}

export function buildRss(entries: PublishedEntry[]): string {
  const items = sortedEntries(entries.filter((entry) => entry.kind === "post"))
    .map((entry) => {
      const categories = entry.topics
        .map((topic) => `      <category>${escapeXml(topic)}</category>`)
        .join("\n");
      const rights = entry.license
        ? `\n      <dc:rights>${escapeXml(`${entry.license.name} (${entry.license.scope})`)}</dc:rights>`
        : "";

      return `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${escapeXml(entry.url)}</link>
      <guid isPermaLink="true">${escapeXml(entry.url)}</guid>
      <pubDate>${toRfc822(entry.datePublished)}</pubDate>
      <dc:date>${escapeXml(entry.contentUpdated)}</dc:date>
      <dc:creator>${escapeXml(siteConfig.author.name)}</dc:creator>${rights}
${categories}
      <description>${escapeXml(entry.summary)}</description>
      <content:encoded><![CDATA[${escapeCdata(bodyAsHtml(entry))}]]></content:encoded>
    </item>`;
    })
    .join("\n");

  return withLf(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${escapeXml(siteConfig.url)}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>${escapeXml(siteConfig.language)}</language>
    <atom:link href="${escapeXml(siteConfig.absoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`);
}

export function buildJsonFeed(entries: PublishedEntry[]) {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: siteConfig.title,
    home_page_url: siteConfig.url,
    feed_url: siteConfig.absoluteUrl("/feed.json"),
    description: siteConfig.description,
    language: siteConfig.language,
    authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
    items: sortedEntries(entries.filter((entry) => entry.kind === "post")).map((entry) => ({
      id: entry.url,
      url: entry.url,
      external_url: entry.demoUrl ?? undefined,
      title: entry.title,
      summary: entry.summary,
      content_text: markdownToText(entry.body),
      date_published: toRfc3339(entry.datePublished),
      date_modified: toRfc3339(entry.contentUpdated),
      language: entry.language,
      authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
      tags: entry.topics,
    })),
  };
}

export function buildContentIndex(entries: PublishedEntry[]) {
  return {
    schema_version: "1.2",
    site: {
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      language: siteConfig.language,
      author: { ...siteConfig.author },
    },
    items: sortedEntries(entries).map((entry) => ({
      id: entry.url,
      kind: entry.kind,
      slug: entry.slug,
      title: entry.title,
      summary: entry.summary,
      url: entry.url,
      aliases: entry.aliases,
      markdown_url: entry.markdownUrl,
      markdown_sha256: createHash("sha256")
        .update(renderMarkdownDocument(entry), "utf8")
        .digest("hex"),
      date_published: entry.datePublished,
      date_modified: entry.contentUpdated,
      content_updated: entry.contentUpdated,
      language: entry.language,
      topics: entry.topics,
      repository: repositoryForPublication(entry),
      repository_created: entry.repositoryCreated,
      repository_updated: entry.repositoryUpdated,
      demo_url: entry.demoUrl,
      sources: entry.sources,
      license: entry.license,
      provenance: {
        kind: "first_party",
        author: { ...siteConfig.author },
        canonical_url: entry.url,
        content_updated: entry.contentUpdated,
      },
      content_text: markdownToText(entry.body),
    })),
  };
}

function renderEntryList(entries: PublishedEntry[]): string {
  return sortedEntries(entries)
    .map(
      (entry) =>
        `- [${escapeMarkdownText(entry.title)}](${entry.markdownUrl}): ${entry.summary}`,
    )
    .join("\n");
}

export function buildLlmsTxt(entries: PublishedEntry[]): string {
  const projects = entries.filter((entry) => entry.kind === "project");
  const writing = entries.filter((entry) => entry.kind === "post");

  return withLf(`# ${siteConfig.title}

> ${siteConfig.description}

This is the canonical machine-readable index for ${siteConfig.url}. Prefer the linked Markdown documents for retrieval and their canonical HTML pages for citation.

## Key pages

- [Home](${siteConfig.url})
- [About](${siteConfig.absoluteUrl(siteConfig.routes.about)})
- [Projects](${siteConfig.absoluteUrl(siteConfig.routes.projects)})
- [Writing](${siteConfig.absoluteUrl(siteConfig.routes.writing)})
- [Contact](${siteConfig.absoluteUrl(siteConfig.routes.contact)})

## Projects

${renderEntryList(projects)}

## Writing

${renderEntryList(writing)}

## Machine-readable resources

- [Full context](${siteConfig.absoluteUrl("/llms-full.txt")})
- [Content index](${siteConfig.absoluteUrl("/content-index.json")})
- [JSON Feed](${siteConfig.absoluteUrl("/feed.json")})
- [RSS feed](${siteConfig.absoluteUrl("/rss.xml")})
- [Sitemap](${siteConfig.absoluteUrl("/sitemap.xml")})`);
}

export function buildLlmsFull(entries: PublishedEntry[]): string {
  const documents = sortedEntries(entries)
    .map((entry) => renderMarkdownDocument(entry).trim())
    .join("\n\n---\n\n");

  return withLf(`# ${siteConfig.title}: Full Content

> Complete machine-readable project and writing corpus. Canonical site: ${siteConfig.url}

${documents}`);
}

function assertAllowedOutput(relativePath: string): void {
  if (!FIXED_OUTPUT_SET.has(relativePath) && !GENERATED_MARKDOWN_PATTERN.test(relativePath)) {
    throw new Error(`Refusing unexpected generated output path: ${relativePath}`);
  }
}

function assertNoSymlinkComponents(root: string, outputPath: string): void {
  const candidates = [root];
  let current = root;
  for (const segment of path.relative(root, outputPath).split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    candidates.push(current);
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.lstatSync(candidate).isSymbolicLink()) {
      throw new Error(`Generated output path contains a symbolic link: ${candidate}`);
    }
  }
}

function resolveOutputPath(publicDirectory: string, relativePath: string): string {
  assertAllowedOutput(relativePath);
  const root = path.resolve(publicDirectory);
  const outputPath = path.resolve(root, relativePath);
  if (outputPath !== root && !outputPath.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Generated output escapes public directory: ${relativePath}`);
  }
  assertNoSymlinkComponents(root, outputPath);
  return outputPath;
}

export function createArtifacts(entries: PublishedEntry[] = getAllEntries()): GeneratedArtifacts {
  const artifacts: GeneratedArtifacts = {
    "robots.txt": buildRobotsTxt(),
    "sitemap.xml": buildSitemap(entries),
    "rss.xml": buildRss(entries),
    "feed.json": withLf(JSON.stringify(buildJsonFeed(entries), null, 2)),
    "content-index.json": withLf(JSON.stringify(buildContentIndex(entries), null, 2)),
    "llms.txt": buildLlmsTxt(entries),
    "llms-full.txt": buildLlmsFull(entries),
  };

  for (const entry of sortedEntries(entries)) {
    const relativePath = `${entry.kind === "project" ? "projects" : "writing"}/${entry.slug}.md`;
    if (artifacts[relativePath]) throw new Error(`Duplicate generated output: ${relativePath}`);
    artifacts[relativePath] = renderMarkdownDocument(entry);
  }

  for (const [relativePath, content] of Object.entries(artifacts)) {
    assertAllowedOutput(relativePath);
    if (content.includes("\r") || !content.endsWith("\n")) {
      throw new Error(`Generated output must use LF and end with a newline: ${relativePath}`);
    }
  }

  return artifacts;
}

function findStaleMarkdown(
  artifacts: GeneratedArtifacts,
  publicDirectory: string,
): string[] {
  const expected = new Set(Object.keys(artifacts));
  const stale: string[] = [];

  for (const directoryName of ["projects", "writing"]) {
    const directory = path.join(publicDirectory, directoryName);
    assertNoSymlinkComponents(path.resolve(publicDirectory), directory);
    if (!fs.existsSync(directory)) continue;
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      if (item.isSymbolicLink()) {
        throw new Error(
          `Generated output path contains a symbolic link: ${path.join(directory, item.name)}`,
        );
      }
      if (!item.isFile() || !item.name.endsWith(".md")) continue;
      const relativePath = `${directoryName}/${item.name}`;
      if (!expected.has(relativePath)) stale.push(relativePath);
    }
  }

  return stale.sort();
}

export function checkArtifacts(
  artifacts: GeneratedArtifacts,
  options: ArtifactIoOptions = {},
): ArtifactCheckResult {
  const publicDirectory = path.resolve(options.publicDirectory ?? DEFAULT_PUBLIC_DIRECTORY);
  const missing: string[] = [];
  const changed: string[] = [];

  for (const [relativePath, expected] of Object.entries(artifacts)) {
    const outputPath = resolveOutputPath(publicDirectory, relativePath);
    if (!fs.existsSync(outputPath)) {
      missing.push(relativePath);
    } else if (fs.readFileSync(outputPath, "utf8") !== expected) {
      changed.push(relativePath);
    }
  }

  const stale = findStaleMarkdown(artifacts, publicDirectory);
  return {
    clean: missing.length === 0 && changed.length === 0 && stale.length === 0,
    missing: missing.sort(),
    changed: changed.sort(),
    stale,
  };
}

export function writeArtifacts(
  artifacts: GeneratedArtifacts,
  options: ArtifactIoOptions = {},
): void {
  const publicDirectory = path.resolve(options.publicDirectory ?? DEFAULT_PUBLIC_DIRECTORY);

  // Validate the entire write set before mutating anything.
  for (const relativePath of Object.keys(artifacts)) {
    resolveOutputPath(publicDirectory, relativePath);
  }

  for (const relativePath of findStaleMarkdown(artifacts, publicDirectory)) {
    fs.unlinkSync(resolveOutputPath(publicDirectory, relativePath));
  }

  for (const [relativePath, content] of Object.entries(artifacts)) {
    const outputPath = resolveOutputPath(publicDirectory, relativePath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, content, "utf8");
  }
}

export function runGenerator(options: GeneratorOptions = {}): ArtifactCheckResult {
  const entries = getAllEntries({ contentDirectory: options.contentDirectory });
  const artifacts = createArtifacts(entries);
  if (options.check) return checkArtifacts(artifacts, options);

  writeArtifacts(artifacts, options);
  return checkArtifacts(artifacts, options);
}

function formatCheckFailure(result: ArtifactCheckResult): string {
  return [
    result.missing.length ? `missing: ${result.missing.join(", ")}` : null,
    result.changed.length ? `changed: ${result.changed.join(", ")}` : null,
    result.stale.length ? `stale: ${result.stale.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("; ");
}

function main(): void {
  const unknownArgs = process.argv.slice(2).filter((argument) => argument !== "--check");
  if (unknownArgs.length > 0) throw new Error(`Unknown arguments: ${unknownArgs.join(", ")}`);

  const check = process.argv.includes("--check");
  const entries = getAllEntries({ contentDirectory: path.join(PROJECT_ROOT, "content") });
  const artifacts = createArtifacts(entries);

  if (check) {
    const result = checkArtifacts(artifacts, { publicDirectory: DEFAULT_PUBLIC_DIRECTORY });
    const runtimeCatalogClean = checkRuntimeCatalog(entries);
    if (!result.clean || !runtimeCatalogClean) {
      const details = [
        formatCheckFailure(result),
        runtimeCatalogClean ? null : "changed: generated/content-catalog.json",
      ]
        .filter(Boolean)
        .join("; ");
      console.error(`Generated machine content is out of date (${details})`);
      process.exitCode = 1;
      return;
    }
    console.log(
      `Machine content is current: ${entries.length} entries, ${Object.keys(artifacts).length + 1} files`,
    );
    return;
  }

  writeArtifacts(artifacts, { publicDirectory: DEFAULT_PUBLIC_DIRECTORY });
  writeRuntimeCatalog(entries);
  console.log(
    `Machine content generated: ${entries.length} entries, ${Object.keys(artifacts).length + 1} files`,
  );
}

const isMain =
  Boolean(process.argv[1]) &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

// Compatibility aliases for tests and alternate script wrappers.
export const buildArtifacts = createArtifacts;
export const generateMachineContent = runGenerator;
