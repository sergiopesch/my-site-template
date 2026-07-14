import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { EditorialHeader } from "@/components/editorial-header";
import type { PublishedEntry } from "@/lib/content";
import { buildBreadcrumbJsonLd, buildEntryJsonLd } from "@/lib/seo";
import { formatDate, stripAgentQuickStart } from "@/lib/presentation";
import { JsonLd } from "@/components/json-ld";
import { MarkdownBody } from "@/components/markdown-body";

export function EntryPage({ entry }: { entry: PublishedEntry }) {
  const collection = entry.kind === "project" ? "Projects" : "Thoughts";
  const collectionHref = entry.kind === "project" ? "/projects" : "/writing";
  const humanBody = stripAgentQuickStart(entry.body);

  return (
    <>
      <JsonLd data={buildEntryJsonLd(entry)} />
      <JsonLd data={buildBreadcrumbJsonLd(entry)} />
      <div className="site-shell--narrow site-page--detail page-enter">
        <section className="entry-header">
          <Link className="back-link" href={collectionHref}>
            <ArrowLeft aria-hidden="true" />
            Back to {collection}
          </Link>
          <EditorialHeader
            title={entry.title}
            deck={entry.kind === "project" ? entry.summary : undefined}
            variant={entry.kind === "project" ? "project" : "thought"}
            align="left"
            meta={[
              <time dateTime={entry.datePublished} key="published">{entry.kind === "project" ? "Started " : ""}{formatDate(entry.datePublished)}</time>,
              entry.contentUpdated !== entry.datePublished ? <span key="updated">Updated <time dateTime={entry.contentUpdated}>{formatDate(entry.contentUpdated)}</time></span> : null,
            ].filter(Boolean)}
          >
            {entry.kind === "project" && entry.demoUrl ? (
              <a className="editorial-link-chip" href={entry.demoUrl} target="_blank" rel="noopener noreferrer">
                View site <ArrowUpRight aria-hidden="true" />
              </a>
            ) : null}
          </EditorialHeader>
        </section>
        <article className="entry-article">
          <MarkdownBody markdown={humanBody} />
        </article>
      </div>
    </>
  );
}
