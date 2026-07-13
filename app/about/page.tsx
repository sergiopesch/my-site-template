import type { Metadata } from "next";

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
      <section className="simple-page">
        <h1>About</h1>
        <div className="simple-page__body">
          <p>
            This template gives independent makers, writers, researchers, and teams a
            durable place to publish work on the open web.
          </p>
          <p>
            Replace this page with a concise biography, the context readers need to
            understand your work, and links to profiles you control. Keep claims specific
            and keep dates, sources, and licensing honest.
          </p>
          <p>
            Every published entry is available as a human-readable page and a canonical
            Markdown document, with matching metadata generated from one validated record.
          </p>
        </div>
      </section>
    </>
  );
}
