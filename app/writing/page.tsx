import type { Metadata } from "next";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { EditorialHeader } from "@/components/editorial-header";
import { siteConfig } from "@/config/site";
import { getWriting } from "@/lib/catalog";
import { formatDate } from "@/lib/presentation";

export const metadata: Metadata = {
  title: "Thoughts",
  description: "Notes on building, learning, and making information last.",
  alternates: { canonical: siteConfig.absoluteUrl("/writing") },
};

export default function WritingPage() {
  const writing = getWriting();

  return (
    <div className="site-shell--narrow site-page page-enter">
      <section className="archive-intro archive-intro--thoughts">
        <EditorialHeader
          deck="Notes, thoughts, and field observations."
          variant="thought"
          align="center"
        />
      </section>
      <section className="thought-list" aria-label="Thoughts">
        {writing.map((entry) => (
          <Link className="thought-list__item" href={entry.route} key={entry.url}>
            <time dateTime={entry.datePublished}>{formatDate(entry.datePublished)}</time>
            <span className="thought-list__title">
              <span>{entry.title}</span>
              <ArrowUpRight aria-hidden="true" />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
