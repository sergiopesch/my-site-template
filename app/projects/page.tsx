import type { Metadata } from "next";

import { ContentRow } from "@/components/content-row";
import { siteConfig } from "@/config/site";
import { getProjects } from "@/lib/catalog";
import { formatShortDate } from "@/lib/presentation";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects, experiments, and practical work.",
  alternates: { canonical: siteConfig.absoluteUrl("/projects") },
};

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <>
      <header className="page-intro">
        <h1 className="page-heading">Projects</h1>
        <p>Selected projects, experiments, and practical work.</p>
      </header>
      <section className="content-list" aria-label="Projects">
        {projects.map((project) => (
          <ContentRow
            key={project.url}
            href={project.route}
            title={project.title}
            summary={project.summary}
            metadata={`Started ${formatShortDate(project.datePublished)}`}
            actionLabel="View project"
          />
        ))}
      </section>
    </>
  );
}
