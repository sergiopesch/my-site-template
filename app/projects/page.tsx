import type { Metadata } from "next";

import { EditorialHeader } from "@/components/editorial-header";
import { ProjectCard } from "@/components/project-card";
import { siteConfig } from "@/config/site";
import { getProjects } from "@/lib/catalog";
import { formatMonthYear } from "@/lib/presentation";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects, experiments, and practical work.",
  alternates: { canonical: siteConfig.absoluteUrl("/projects") },
};

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <div className="site-shell site-page page-enter">
      <section className="archive-intro">
        <EditorialHeader
          deck="A running archive of experiments, ideas, and practical work."
          variant="project"
          align="center"
        />
      </section>
      <section className="project-grid" aria-label="Projects">
        {projects.map((project) => (
          <ProjectCard
            key={project.url}
            project={project}
            eyebrow={`${project.repositoryCreated ? "Created" : "Started"} ${formatMonthYear(project.repositoryCreated ?? project.datePublished)}`}
          />
        ))}
      </section>
    </div>
  );
}
