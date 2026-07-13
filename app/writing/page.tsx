import type { Metadata } from "next";

import { ContentRow } from "@/components/content-row";
import { siteConfig } from "@/config/site";
import { getWriting } from "@/lib/catalog";
import { formatShortDate, readingMinutes } from "@/lib/presentation";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on building, learning, and making information last.",
  alternates: { canonical: siteConfig.absoluteUrl("/writing") },
};

export default function WritingPage() {
  const writing = getWriting();

  return (
    <>
      <header className="page-intro">
        <h1 className="page-heading">Writing</h1>
        <p>Notes on building, learning, and making information last.</p>
      </header>
      <section className="content-list" aria-label="Writing">
        {writing.map((entry) => (
          <ContentRow
            key={entry.url}
            href={entry.route}
            title={entry.title}
            summary={entry.summary}
            metadata={`${formatShortDate(entry.datePublished)} · ${readingMinutes(entry.body)} min read`}
            actionLabel="Read article"
          />
        ))}
      </section>
    </>
  );
}
