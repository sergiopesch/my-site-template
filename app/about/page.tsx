import type { Metadata } from "next";
import { ArrowUpRight, Github, Linkedin } from "lucide-react";

import { EditorialHeader } from "@/components/editorial-header";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.author.name} and this publication.`,
  alternates: { canonical: siteConfig.absoluteUrl("/about") },
};

export default function AboutPage() {
  const profilePage = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${siteConfig.absoluteUrl("/about")}#profile-page`,
    name: `About ${siteConfig.author.name}`,
    url: siteConfig.absoluteUrl("/about"),
    mainEntity: {
      "@type": "Person",
      "@id": `${siteConfig.author.url}#person`,
      name: siteConfig.author.name,
      url: siteConfig.author.url,
    },
    inLanguage: siteConfig.language,
  };

  return (
    <>
      <JsonLd data={profilePage} />
      <div className="site-shell--narrow site-page page-enter">
        <section className="about-intro">
          <EditorialHeader title="About" variant="about" align="center" />
        </section>
        <article className="about-body">
          <div className="about-copy">
            {siteConfig.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="social-links" aria-label="Social links">
            <a href={siteConfig.social.x} target="_blank" rel="noopener noreferrer" aria-label="X" title="X">
              <svg role="img" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
              <Github aria-hidden="true" />
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
              <Linkedin aria-hidden="true" />
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </article>
      </div>
    </>
  );
}
