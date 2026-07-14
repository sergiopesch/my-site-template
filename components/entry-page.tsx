import Link from "next/link";

import type { PublishedEntry } from "@/lib/content";
import { buildBreadcrumbJsonLd, buildEntryJsonLd } from "@/lib/seo";
import { formatDate, stripAgentQuickStart } from "@/lib/presentation";
import { JsonLd } from "@/components/json-ld";
import { MarkdownBody } from "@/components/markdown-body";

export function EntryPage({ entry }: { entry: PublishedEntry }) {
  const collection = entry.kind === "project" ? "Projects" : "Writing";
  const collectionHref = entry.kind === "project" ? "/projects" : "/writing";
  const humanBody = stripAgentQuickStart(entry.body);

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
          <h1 className="article-title">{entry.title}</h1>
          <p className="content-meta">
            {formatDate(entry.datePublished)}
            {entry.contentUpdated !== entry.datePublished
              ? ` · Updated ${formatDate(entry.contentUpdated)}`
              : ""}
          </p>
          <p className="article-deck">{entry.summary}</p>
        </header>
        {entry.kind === "project" && entry.demoUrl ? (
          <p>
            <a className="arrow-link" href={entry.demoUrl} target="_blank" rel="noopener noreferrer">
              Open live project <span aria-hidden="true">↗</span>
            </a>
          </p>
        ) : null}
        <MarkdownBody markdown={humanBody} />
      </article>
    </>
  );
}
