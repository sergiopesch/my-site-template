import catalog from "@/generated/content-catalog.json";

import type {
  EntryKind,
  EntryKindInput,
  PublishedEntry,
} from "@/lib/content";

const publishedEntries = catalog as unknown as PublishedEntry[];

export function getAllEntries(): PublishedEntry[] {
  return publishedEntries;
}

export function getEntriesByKind(kind: EntryKindInput): PublishedEntry[] {
  const normalizedKind: EntryKind = kind === "writing" ? "post" : kind;
  return publishedEntries.filter((entry) => entry.kind === normalizedKind);
}

export function getEntry(
  kind: EntryKindInput,
  slugOrAlias: string,
): PublishedEntry | null {
  return (
    getEntriesByKind(kind).find(
      (entry) =>
        entry.slug === slugOrAlias ||
        entry.route === slugOrAlias ||
        entry.url === slugOrAlias ||
        entry.aliasRoutes.includes(slugOrAlias) ||
        entry.aliases.includes(slugOrAlias),
    ) ?? null
  );
}

export const getProjects = () => getEntriesByKind("project");
export const getWriting = () => getEntriesByKind("post");
export const getPosts = getWriting;
