const FALLBACK_SITE_URL = "https://example.com";

/**
 * Validate the canonical public origin once, before any metadata is built.
 * Requiring the serialized origin also rejects paths, credentials, query
 * strings, fragments, whitespace, and trailing slashes.
 */
export function validateSiteUrl(value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid HTTPS origin without a trailing slash");
  }

  if (parsed.protocol !== "https:" || value !== parsed.origin) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid HTTPS origin without a trailing slash");
  }

  return parsed.origin;
}

const SITE_URL = validateSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_SITE_URL,
);

function absoluteUrl(value = "/"): string {
  const resolved = new URL(value, `${SITE_URL}/`);
  return resolved.pathname === "/" && !resolved.search && !resolved.hash
    ? SITE_URL
    : resolved.toString();
}

/**
 * Single source of truth for public identity and canonical URLs.
 * Replace these neutral values when starting a real site.
 */
export const siteConfig = Object.freeze({
  name: "Your Name",
  title: "Your Name — Projects and Thoughts",
  description:
    "A personal digital garden for projects, ideas, notes, and thoughtful experiments.",
  url: SITE_URL,
  email: "hello@example.com",
  language: "en",
  introduction:
    "Welcome to my digital garden. A space to share projects, ideas, and notes.",
  author: Object.freeze({
    name: "Your Name",
    email: "hello@example.com",
    url: `${SITE_URL}/about`,
  }),
  social: Object.freeze({
    x: "https://x.com/your-handle",
    github: "https://github.com/your-username",
    linkedin: "https://www.linkedin.com/in/your-name",
  }),
  about: Object.freeze([
    "My name is Your Name. I build useful things, document what I learn, and share work that may help other people.",
    "Outside of work, I make time for the people and interests that keep me curious. Replace this paragraph with the personal context you want readers to know.",
    "I use this site to explore ideas, publish experiments, and keep a durable record of projects as they evolve. Replace this paragraph with your own goals and point of view.",
  ]),
  routes: Object.freeze({
    about: "/about",
    contact: "/contact",
    projects: "/projects",
    writing: "/writing",
  }),
  absoluteUrl,
});

export type SiteConfig = typeof siteConfig;

// Convenient named exports for metadata and route modules.
export const SITE_NAME = siteConfig.name;
export const SITE_DESCRIPTION = siteConfig.description;
export const AUTHOR_NAME = siteConfig.author.name;
export const AUTHOR_URL = siteConfig.author.url;
export { SITE_URL, absoluteUrl };
