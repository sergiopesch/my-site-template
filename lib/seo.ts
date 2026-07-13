import { siteConfig } from "../config/site";
import type { PublishedEntry } from "./content";

export interface EntryMetadata {
  title: string;
  description: string;
  authors: Array<{ name: string; url: string }>;
  keywords: string[];
  alternates: {
    canonical: string;
    types: { "text/markdown": string };
  };
  openGraph: {
    type: "article";
    url: string;
    title: string;
    description: string;
    siteName: string;
    locale: string;
    publishedTime: string;
    modifiedTime: string;
  };
}

function personEntity() {
  return {
    "@type": "Person",
    "@id": `${siteConfig.author.url}#person`,
    name: siteConfig.author.name,
    url: siteConfig.author.url,
  };
}

function websiteEntity() {
  return {
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    publisher: { "@id": `${siteConfig.author.url}#person` },
  };
}

export function buildSiteMetadata() {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.title,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
    alternates: { canonical: siteConfig.url },
    openGraph: {
      type: "website" as const,
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: siteConfig.title,
      description: siteConfig.description,
      locale: siteConfig.language,
    },
  };
}

export function buildEntryMetadata(entry: PublishedEntry): EntryMetadata {
  return {
    title: entry.title,
    description: entry.summary,
    authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
    keywords: [...entry.topics],
    alternates: {
      canonical: entry.url,
      types: { "text/markdown": entry.markdownUrl },
    },
    openGraph: {
      type: "article",
      url: entry.url,
      title: entry.title,
      description: entry.summary,
      siteName: siteConfig.name,
      locale: entry.language,
      publishedTime: entry.datePublished,
      modifiedTime: entry.contentUpdated,
    },
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [personEntity(), websiteEntity()],
  };
}

export function buildBreadcrumbJsonLd(entry: PublishedEntry) {
  const collectionName = entry.kind === "project" ? "Projects" : "Writing";
  const collectionUrl = siteConfig.absoluteUrl(
    entry.kind === "project" ? siteConfig.routes.projects : siteConfig.routes.writing,
  );

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: collectionName, item: collectionUrl },
      { "@type": "ListItem", position: 3, name: entry.title, item: entry.url },
    ],
  };
}

export function buildEntryJsonLd(entry: PublishedEntry) {
  const articleId = `${entry.url}#article`;
  const workId = `${entry.url}#work`;
  const article: Record<string, unknown> = {
    "@type": "BlogPosting",
    "@id": articleId,
    headline: entry.title,
    description: entry.summary,
    url: entry.url,
    datePublished: entry.datePublished,
    dateModified: entry.contentUpdated,
    author: { "@id": `${siteConfig.author.url}#person` },
    publisher: { "@id": `${siteConfig.author.url}#person` },
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    mainEntityOfPage: { "@type": "WebPage", "@id": entry.url },
    inLanguage: entry.language,
    keywords: entry.topics,
    isAccessibleForFree: true,
  };

  if (entry.sources.length > 0) {
    article.citation = entry.sources.map((source) => source.url);
  }
  if (entry.kind === "project") article.about = { "@id": workId };

  const graph: Array<Record<string, unknown>> = [personEntity(), websiteEntity(), article];

  if (entry.kind === "project") {
    const sameAs = [
      entry.repository?.visibility === "public" ? entry.repository.url : null,
      entry.demoUrl,
    ].filter((value): value is string => Boolean(value));

    const work: Record<string, unknown> = {
      "@type": entry.repository ? "SoftwareSourceCode" : "CreativeWork",
      "@id": workId,
      name: entry.title,
      description: entry.summary,
      url: entry.url,
      author: { "@id": `${siteConfig.author.url}#person` },
      dateCreated: entry.datePublished,
      dateModified: entry.contentUpdated,
      inLanguage: entry.language,
      keywords: entry.topics,
      isAccessibleForFree: true,
      sameAs: sameAs.length > 0 ? sameAs : undefined,
      license: entry.license?.url,
      mainEntityOfPage: { "@id": entry.url },
    };

    if (entry.repository?.visibility === "public") {
      work.codeRepository = entry.repository.url;
    }
    graph.push(work);
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/**
 * Safe for use as the text content of an application/ld+json script element.
 * Escaping `<` prevents an authored value from terminating the script element.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/&/g, "\\u0026")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

// Naming aliases commonly used by App Router sites.
export const generateEntryMetadata = buildEntryMetadata;
export const generateEntryJsonLd = buildEntryJsonLd;
export const serializeJsonLdForScript = serializeJsonLd;
