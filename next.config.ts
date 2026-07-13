import type { NextConfig } from "next";

import contentIndex from "./public/content-index.json";

const siteUrl = contentIndex.site.url;

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "media-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Frame-Options", value: "DENY" },
];

const machineCacheHeader = {
  key: "Cache-Control",
  value: "public, max-age=0, must-revalidate",
};

function markdownHeaders(collection: "projects" | "writing") {
  return [
    { key: "Content-Type", value: "text/markdown; charset=utf-8" },
    {
      key: "Link",
      value: `<${siteUrl}/${collection}/:slug>; rel="canonical"; type="text/html"`,
    },
    machineCacheHeader,
  ];
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/projects/:slug.md", headers: markdownHeaders("projects") },
      { source: "/writing/:slug.md", headers: markdownHeaders("writing") },
      {
        source: "/llms.txt",
        headers: [
          { key: "Content-Type", value: "text/markdown; charset=utf-8" },
          machineCacheHeader,
        ],
      },
      {
        source: "/llms-full.txt",
        headers: [
          { key: "Content-Type", value: "text/markdown; charset=utf-8" },
          machineCacheHeader,
        ],
      },
      {
        source: "/content-index.json",
        headers: [
          { key: "Content-Type", value: "application/json; charset=utf-8" },
          machineCacheHeader,
        ],
      },
      {
        source: "/feed.json",
        headers: [
          { key: "Content-Type", value: "application/feed+json; charset=utf-8" },
          machineCacheHeader,
        ],
      },
      {
        source: "/rss.xml",
        headers: [
          { key: "Content-Type", value: "application/rss+xml; charset=utf-8" },
          machineCacheHeader,
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
          machineCacheHeader,
        ],
      },
    ];
  },
  async redirects() {
    const entries = contentIndex.items as Array<{
      aliases: string[];
      markdown_url: string;
      url: string;
    }>;
    const entryRedirects = entries.flatMap((entry) =>
      entry.aliases.flatMap((alias) => {
        const source = new URL(alias).pathname;
        const destination = new URL(entry.url).pathname;
        const markdownDestination = new URL(entry.markdown_url).pathname;
        return [
          { source, destination, permanent: true },
          { source: `${source}.md`, destination: markdownDestination, permanent: true },
        ];
      })
    );

    return [
      { source: "/blog", destination: "/writing", permanent: true },
      ...entryRedirects,
    ];
  },
};

export default nextConfig;
