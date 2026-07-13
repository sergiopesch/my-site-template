import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/config/site";
import { buildSiteMetadata, buildWebsiteJsonLd } from "@/lib/seo";

import "./globals.css";

const themeScript = `(() => {
  try {
    const stored = localStorage.getItem("theme");
    const preferred = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = stored === "dark" || stored === "light" ? stored : preferred;
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();`;

export const metadata: Metadata = {
  ...buildSiteMetadata(),
  twitter: {
    card: "summary",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0d10" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={siteConfig.language} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <JsonLd data={buildWebsiteJsonLd()} />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <div className="site-frame">
          <SiteHeader name={siteConfig.name} />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
