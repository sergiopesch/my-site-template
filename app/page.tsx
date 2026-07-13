import Link from "next/link";

import { ContentRow } from "@/components/content-row";
import { getProjects, getWriting } from "@/lib/catalog";
import { formatShortDate, readingMinutes } from "@/lib/presentation";

export default function HomePage() {
  const featuredProject =
    getProjects().find((entry) => entry.slug === "local-first-field-notes") ?? getProjects()[0];
  const recentWriting =
    getWriting().find((entry) => entry.slug === "designing-for-durable-discovery") ??
    getWriting()[0];

  return (
    <>
      <section className="home-hero">
        <div className="home-hero__copy">
          <h1>A clear home for your work and ideas.</h1>
          <p>
            Publish thoughtful writing, document projects, and make every page easy to
            find, understand, and cite.
          </p>
          <div className="hero-actions">
            <Link className="arrow-link" href="/projects">
              View projects <span aria-hidden="true">→</span>
            </Link>
            <Link className="arrow-link" href="/writing">
              Read writing <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="hero-rule" aria-hidden="true" />
      </section>
      {featuredProject ? (
        <ContentRow
          href={featuredProject.route}
          label="Featured project"
          title={featuredProject.title}
          summary={featuredProject.summary}
          metadata={`Started ${formatShortDate(featuredProject.datePublished)}`}
          actionLabel="View project"
        />
      ) : null}
      {recentWriting ? (
        <ContentRow
          href={recentWriting.route}
          label="Recent writing"
          title={recentWriting.title}
          summary={recentWriting.summary}
          metadata={`${formatShortDate(recentWriting.datePublished)} · ${readingMinutes(recentWriting.body)} min read`}
          actionLabel="Read article"
        />
      ) : null}
    </>
  );
}
