import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

import { siteConfig } from "../config/site";

export const ENTRY_KINDS = ["project", "post"] as const;
export type EntryKind = (typeof ENTRY_KINDS)[number];
export type EntryKindInput = EntryKind | "writing";

const KIND_DIRECTORIES: Record<EntryKind, string> = {
  project: "projects",
  post: "posts",
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LANGUAGE_PATTERN = /^[a-z]{2}(?:-[A-Z]{2})?$/;
const INTERNAL_ALIAS_PATTERN = /^\/[a-z0-9]+(?:[/-][a-z0-9]+)*$/;
const RESERVED_ALIAS_ROUTES = new Set([
  "/",
  "/about",
  "/blog",
  "/contact",
  "/projects",
  "/writing",
]);

function isRealIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

const singleLineText = (label: string, minimum = 1) =>
  z
    .string()
    .trim()
    .min(minimum, `${label} is required`)
    .refine((value) => !/[\u0000\r\n]/.test(value), `${label} must be a single line`);

export const isoDateSchema = z
  .string()
  .refine(isRealIsoDate, "must be a real ISO date in YYYY-MM-DD format");

export const httpsUrlSchema = z
  .string()
  .trim()
  .refine(isHttpsUrl, "must be an absolute HTTPS URL");

const aliasSchema = z
  .string()
  .trim()
  .refine((value) => {
    if (INTERNAL_ALIAS_PATTERN.test(value)) return true;
    return isHttpsUrl(value);
  }, "aliases must be lowercase site paths or absolute HTTPS URLs");

const sourceSchema = z
  .object({
    title: singleLineText("source title"),
    url: httpsUrlSchema,
  })
  .strict();

const licenseSchema = z
  .object({
    name: singleLineText("license name"),
    url: httpsUrlSchema,
    scope: singleLineText("license scope"),
    verified: isoDateSchema,
  })
  .strict();

const publicRepositorySchema = z
  .object({
    visibility: z.literal("public"),
    url: httpsUrlSchema,
    created: isoDateSchema,
    updated: isoDateSchema,
  })
  .strict();

const privateRepositorySchema = z
  .object({
    visibility: z.literal("private"),
    created: isoDateSchema,
    updated: isoDateSchema,
  })
  .strict();

export const repositorySchema = z.discriminatedUnion("visibility", [
  publicRepositorySchema,
  privateRepositorySchema,
]);

export const contentFrontmatterSchema = z
  .object({
    kind: z.enum(ENTRY_KINDS).optional(),
    title: singleLineText("title"),
    slug: z.string().trim().regex(SLUG_PATTERN, "slug must use lowercase kebab case"),
    summary: singleLineText("summary", 20),
    date: isoDateSchema,
    content_updated: isoDateSchema,
    draft: z.boolean().default(false),
    language: z.string().regex(LANGUAGE_PATTERN).default(siteConfig.language),
    topics: z.array(singleLineText("topic")).min(1),
    aliases: z.array(aliasSchema).default([]),
    repository: repositorySchema.optional(),
    demo_url: httpsUrlSchema.optional(),
    sources: z.array(sourceSchema).default([]),
    license: licenseSchema.optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.content_updated < value.date) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["content_updated"],
        message: "content_updated cannot be earlier than date",
      });
    }

    if (value.repository && value.repository.updated < value.repository.created) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["repository", "updated"],
        message: "repository updated cannot be earlier than repository created",
      });
    }

    const normalizedTopics = value.topics.map((topic) => topic.toLocaleLowerCase("en"));
    if (new Set(normalizedTopics).size !== normalizedTopics.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["topics"],
        message: "topics must be unique",
      });
    }

    if (new Set(value.aliases).size !== value.aliases.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["aliases"],
        message: "aliases must be unique within an entry",
      });
    }
  });

export type PublicRepository = z.infer<typeof publicRepositorySchema>;
export type PrivateRepository = z.infer<typeof privateRepositorySchema>;
export type PublishedRepository = PublicRepository | PrivateRepository;
export type PublishedSource = z.infer<typeof sourceSchema>;
export type PublishedLicense = z.infer<typeof licenseSchema>;

export interface PublishedEntry {
  kind: EntryKind;
  slug: string;
  title: string;
  summary: string;
  language: string;
  topics: string[];
  datePublished: string;
  contentUpdated: string;
  dateModified: string;
  route: string;
  url: string;
  markdownRoute: string;
  markdownUrl: string;
  aliasRoutes: string[];
  aliases: string[];
  repository: PublishedRepository | null;
  repositoryCreated: string | null;
  repositoryUpdated: string | null;
  demoUrl: string | null;
  sources: PublishedSource[];
  license: PublishedLicense | null;
  body: string;
}

interface ParsedEntry extends PublishedEntry {
  draft: boolean;
}

export interface ContentOptions {
  /** Absolute or relative path to the directory containing projects/ and posts/. */
  contentDirectory?: string;
}

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

function routeFor(kind: EntryKind, slug: string): string {
  return `${kind === "project" ? siteConfig.routes.projects : siteConfig.routes.writing}/${slug}`;
}

function normalizeAlias(alias: string): { route: string; url: string } {
  if (alias.startsWith("/")) {
    if (RESERVED_ALIAS_ROUTES.has(alias)) {
      throw new Error(`Alias cannot replace a reserved application route: ${alias}`);
    }
    return { route: alias, url: siteConfig.absoluteUrl(alias) };
  }

  const parsed = new URL(alias);
  const siteOrigin = new URL(siteConfig.url).origin;
  if (parsed.origin !== siteOrigin || parsed.search || parsed.hash) {
    throw new Error(`Alias must stay on ${siteOrigin} and cannot include query or hash: ${alias}`);
  }

  if (!INTERNAL_ALIAS_PATTERN.test(parsed.pathname)) {
    throw new Error(`Alias path must be lowercase and canonical: ${alias}`);
  }
  if (RESERVED_ALIAS_ROUTES.has(parsed.pathname)) {
    throw new Error(
      `Alias cannot replace a reserved application route: ${parsed.pathname}`,
    );
  }

  return { route: parsed.pathname, url: parsed.toString() };
}

function parseEntry(filePath: string, kind: EntryKind): ParsedEntry {
  const raw = normalizeLineEndings(fs.readFileSync(filePath, "utf8"));
  const parsed = matter(raw);
  const result = contentFrontmatterSchema.safeParse(parsed.data);
  const label = path.relative(process.cwd(), filePath);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "frontmatter"}: ${issue.message}`)
      .join("; ");
    throw new Error(`${label}: invalid frontmatter: ${details}`);
  }

  const data = result.data;
  if (data.kind && data.kind !== kind) {
    throw new Error(`${label}: kind must match its ${KIND_DIRECTORIES[kind]} directory`);
  }

  const fileSlug = path.basename(filePath, path.extname(filePath));
  if (fileSlug !== data.slug) {
    throw new Error(`${label}: filename must match slug ${data.slug}`);
  }

  const body = parsed.content.trim();
  if (!body) throw new Error(`${label}: content body is required`);

  const route = routeFor(kind, data.slug);
  const normalizedAliases = data.aliases.map(normalizeAlias);
  const repository = data.repository ?? null;

  return {
    kind,
    slug: data.slug,
    title: data.title,
    summary: data.summary,
    language: data.language,
    topics: [...data.topics],
    datePublished: data.date,
    contentUpdated: data.content_updated,
    dateModified: data.content_updated,
    route,
    url: siteConfig.absoluteUrl(route),
    markdownRoute: `${route}.md`,
    markdownUrl: siteConfig.absoluteUrl(`${route}.md`),
    aliasRoutes: normalizedAliases.map((alias) => alias.route),
    aliases: normalizedAliases.map((alias) => alias.url),
    repository,
    repositoryCreated: repository?.created ?? null,
    repositoryUpdated: repository?.updated ?? null,
    demoUrl: data.demo_url ?? null,
    sources: data.sources.map((source) => ({ ...source })),
    license: data.license ? { ...data.license } : null,
    body,
    draft: data.draft,
  };
}

function compareEntries(left: PublishedEntry, right: PublishedEntry): number {
  return (
    right.datePublished.localeCompare(left.datePublished) ||
    left.kind.localeCompare(right.kind) ||
    left.slug.localeCompare(right.slug)
  );
}

function validateCatalog(entries: ParsedEntry[]): void {
  const canonical = new Map<string, string>();
  const aliases = new Map<string, string>();

  for (const entry of entries) {
    if (canonical.has(entry.url)) {
      throw new Error(`Duplicate canonical URL: ${entry.url}`);
    }
    canonical.set(entry.url, `${entry.kind}/${entry.slug}`);
  }

  for (const entry of entries) {
    for (const alias of entry.aliases) {
      const owner = `${entry.kind}/${entry.slug}`;
      const canonicalOwner = canonical.get(alias);
      if (canonicalOwner) {
        throw new Error(`Alias ${alias} for ${owner} collides with canonical ${canonicalOwner}`);
      }
      const aliasOwner = aliases.get(alias);
      if (aliasOwner) {
        throw new Error(`Alias ${alias} is shared by ${aliasOwner} and ${owner}`);
      }
      aliases.set(alias, owner);
    }
  }
}

function loadCatalog(options: ContentOptions = {}): ParsedEntry[] {
  const contentDirectory =
    options.contentDirectory ?? path.join(process.cwd(), "content");
  const entries: ParsedEntry[] = [];

  for (const kind of ENTRY_KINDS) {
    const directory = path.join(contentDirectory, KIND_DIRECTORIES[kind]);
    if (!fs.existsSync(directory)) continue;

    const files = fs
      .readdirSync(directory, { withFileTypes: true })
      .filter((item) => item.isFile() && item.name.endsWith(".md"))
      .map((item) => item.name)
      .sort((left, right) => left.localeCompare(right));

    for (const fileName of files) {
      entries.push(parseEntry(path.join(directory, fileName), kind));
    }
  }

  validateCatalog(entries);
  return entries.sort(compareEntries);
}

function toPublishedEntry(entry: ParsedEntry): PublishedEntry {
  const published: Partial<ParsedEntry> = { ...entry };
  delete published.draft;
  return published as PublishedEntry;
}

/** Returns every validated, non-draft entry in deterministic order. */
export function getAllEntries(options: ContentOptions = {}): PublishedEntry[] {
  return loadCatalog(options)
    .filter((entry) => !entry.draft)
    .map(toPublishedEntry);
}

export function getEntriesByKind(
  kind: EntryKindInput,
  options: ContentOptions = {},
): PublishedEntry[] {
  const normalizedKind: EntryKind = kind === "writing" ? "post" : kind;
  return getAllEntries(options).filter((entry) => entry.kind === normalizedKind);
}

/** Resolves a canonical slug, route, URL, or declared alias. Drafts never resolve. */
export function getEntry(
  kind: EntryKindInput,
  slugOrAlias: string,
  options: ContentOptions = {},
): PublishedEntry | null {
  const entries = getEntriesByKind(kind, options);
  return (
    entries.find(
      (entry) =>
        entry.slug === slugOrAlias ||
        entry.route === slugOrAlias ||
        entry.url === slugOrAlias ||
        entry.aliasRoutes.includes(slugOrAlias) ||
        entry.aliases.includes(slugOrAlias),
    ) ?? null
  );
}

// App Router-friendly aliases.
export const getPublishedEntries = getAllEntries;
export const getEntryBySlug = getEntry;
export const findEntry = getEntry;
export const getProjects = (options: ContentOptions = {}) =>
  getEntriesByKind("project", options);
export const getWriting = (options: ContentOptions = {}) =>
  getEntriesByKind("post", options);
export const getPosts = getWriting;
