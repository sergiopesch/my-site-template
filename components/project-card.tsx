import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { PublishedEntry } from "@/lib/content";

type ProjectCardProps = {
  project: PublishedEntry;
  eyebrow: string;
  featured?: boolean;
};

export function ProjectCard({ project, eyebrow, featured = false }: ProjectCardProps) {
  return (
    <article className={`project-card${featured ? " project-card--featured" : ""}`}>
      <Link
        className="project-card__overlay"
        href={project.route}
        aria-label={`View ${project.title} project details`}
      />
      <div className="project-card__content">
        <div className="project-card__topline">
          <span className="editorial-card-meta">{eyebrow}</span>
          <ArrowRight className="project-card__arrow" aria-hidden="true" />
        </div>
        <h2 className="editorial-card-title">{project.title}</h2>
        <p className="editorial-card-body">{project.summary}</p>
        {project.demoUrl ? (
          <div className="project-card__actions">
            <a
              className="project-card__action"
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${project.title} live site`}
            >
              Open site
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        ) : null}
        {project.image && project.imageAlt ? (
          <div className="project-card__media" style={{ aspectRatio: project.imageAspectRatio }}>
            <Image
              src={project.image}
              alt={project.imageAlt}
              fill
              sizes={featured ? "(max-width: 768px) 100vw, 672px" : "(max-width: 768px) 100vw, 50vw"}
              className={project.imageFit === "contain" ? "project-card__image project-card__image--contain" : "project-card__image"}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
