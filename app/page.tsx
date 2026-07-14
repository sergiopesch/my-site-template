import { EditorialHeader } from "@/components/editorial-header";
import { ProjectCard } from "@/components/project-card";
import { siteConfig } from "@/config/site";
import { getProjects } from "@/lib/catalog";

export default function HomePage() {
  const latestProject = getProjects()[0];

  return (
    <div className="site-shell site-page page-enter">
      <section className="home-intro">
        <EditorialHeader
          deck={siteConfig.introduction}
          variant="home"
          align="center"
        />
      </section>
      {latestProject ? (
        <section className="home-project">
          <ProjectCard
            project={latestProject}
            eyebrow="Latest Updated Project"
            featured
          />
        </section>
      ) : null}
    </div>
  );
}
