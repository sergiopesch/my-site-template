import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${siteConfig.author.name}.`,
  alternates: { canonical: siteConfig.absoluteUrl("/contact") },
};

export default function ContactPage() {
  return (
    <section className="simple-page">
      <h1>Contact</h1>
      <div className="simple-page__body">
        <p>
          Make it easy for readers to reach you without adding a form, database, or
          tracking script.
        </p>
        <p>
          <a className="arrow-link" href={`mailto:${siteConfig.email}`}>
            {siteConfig.email} <span aria-hidden="true">→</span>
          </a>
        </p>
      </div>
    </section>
  );
}
