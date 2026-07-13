import Link from "next/link";

import type { PublishedEntry } from "@/lib/content";
import { buildBreadcrumbJsonLd, buildEntryJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/presentation";
import { JsonLd } from "@/components/json-ld";
import { MarkdownBody } from "@/components/markdown-body";
import { Provenance } from "@/components/provenance";

function primarySource(entry: PublishedEntry) {
  if (entry.repository?.visibility === "public") {
    return {
      value: "Source repository",
      href: entry.repository.url,
    };
  }
  if (entry.repository?.visibility === "private") {
    return { value: "Private repository", href: null };
  }
  if (entry.sources[0]) {
    return { value: entry.sources[0].title, href: entry.sources[0].url };
  }
  return { value: "First-party publication", href: null };
}

export function EntryPage({ entry }: { entry: PublishedEntry }) {
  const collection = entry.kind === "project" ? "Projects" : "Writing";
  const collectionHref = entry.kind === "project" ? "/projects" : "/writing";
  const source = primarySource(entry);

  return (
    <>
      <JsonLd data={buildEntryJsonLd(entry)} />
      <JsonLd data={buildBreadcrumbJsonLd(entry)} />
      <article className="article-shell">
        <Link className="back-link" href={collectionHref}>
          <span aria-hidden="true">←</span>
          All {collection.toLowerCase()}
        </Link>
        <header>
          <div className="article-header">
            <h1>{entry.title}</h1>
            <a className="arrow-link" href={entry.markdownRoute}>
              Read as Markdown <span aria-hidden="true">→</span>
            </a>
          </div>
          <p className="content-meta">
            {formatDate(entry.datePublished)}
            {entry.contentUpdated !== entry.datePublished
              ? ` · Updated ${formatDate(entry.contentUpdated)}`
              : ""}
          </p>
          <p className="article-deck">{entry.summary}</p>
        </header>
        <Provenance
          items={[
            { label: "Canonical URL", value: entry.url, href: entry.url },
            { label: "Last updated", value: formatDate(entry.contentUpdated) },
            { label: "Primary source", value: source.value, href: source.href },
            {
              label: "License",
              value: entry.license?.name ?? "Not specified",
              href: entry.license?.url ?? null,
            },
          ]}
        />
        {entry.kind === "project" && entry.demoUrl ? (
          <p>
            <a className="arrow-link" href={entry.demoUrl} target="_blank" rel="noopener noreferrer">
              Open live project <span aria-hidden="true">↗</span>
            </a>
          </p>
        ) : null}
        <MarkdownBody markdown={entry.body} />
      </article>
    </>
  );
}
