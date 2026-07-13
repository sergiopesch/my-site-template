# Agent-ready personal site template

A fast, accessible Next.js template for publishing projects and writing in forms that work equally well for people, search engines, LLMs, and web agents.

This project does not add a chatbot, an agent runtime, an API, or any model dependency. It focuses on the publishing foundation: stable URLs, useful page metadata, structured data, full-text feeds, Markdown alternates, provenance, and deterministic machine-readable indexes.

## What is included

- Static App Router pages with a small client boundary used only for theme preference
- Validated Markdown content for projects and writing
- Canonical URLs, permanent aliases, Open Graph metadata, and escaped JSON-LD
- Per-entry `.md` alternates with canonical response headers
- `robots.txt`, `sitemap.xml`, RSS, JSON Feed 1.1, `content-index.json`, `llms.txt`, and `llms-full.txt`
- Separate editorial and repository dates
- Draft exclusion and private-repository suppression across every public output
- Enforcing security headers and no request-time content fetches
- Unit, accessibility, browser, link, metadata, and machine-output tests
- Least-privilege CI, dependency updates, and reproducible generated artifacts

## Start a site

1. Use GitHub's **Use this template** button.
2. Clone your new repository.
3. Use Node 22 and install the locked dependencies:

   ```bash
   nvm use
   npm ci
   ```

4. Edit [`config/site.ts`](config/site.ts). Set your name, description, contact links, language, and production URL.
5. Replace the neutral examples in `content/projects` and `content/posts`.
6. Generate and validate every public representation:

   ```bash
   npm run generate:machine
   npm run check
   npm run test:e2e
   ```

7. Start the local site:

   ```bash
   npm run dev
   ```

## Content model

Each Markdown file has validated frontmatter and a normal Markdown body. Generation turns those files into one normalized, draft-free catalog that pages and public machine outputs share.

```yaml
kind: post
title: Designing for durable discovery
slug: designing-for-durable-discovery
summary: Why stable URLs and honest provenance make the open web easier to use.
date: "2026-04-12"
content_updated: "2026-04-18"
language: en
topics: [publishing, metadata]
draft: false
aliases: [/blog/designing-for-durable-discovery]
license:
  name: CC BY 4.0
  url: https://creativecommons.org/licenses/by/4.0/
  scope: article text
  verified: "2026-04-18"
sources:
  - title: W3C Data on the Web Best Practices
    url: https://www.w3.org/TR/dwbp/
```

Projects can also declare `demo_url` and a nested `repository` object. A public repository includes `visibility: public`, its HTTPS `url`, `created`, and `updated` dates. A private repository includes only `visibility: private`, `created`, and `updated`; its URL is intentionally not a valid field. Drafts and private repository URLs are excluded before routes, metadata, feeds, indexes, JSON-LD, Markdown alternates, or page props are created.

## Machine-readable publishing

`npm run generate:machine` creates all public machine surfaces from the same validated catalog:

| Resource | Purpose |
| --- | --- |
| `/llms.txt` | Concise site map for retrieval systems |
| `/llms-full.txt` | Full normalized content with document boundaries |
| `/content-index.json` | Versioned content, provenance, freshness, aliases, sources, and hashes |
| `/feed.json` | JSON Feed 1.1 for writing |
| `/rss.xml` | RSS 2.0 for writing |
| `/sitemap.xml` | Canonical HTML URLs with meaningful modification dates |
| `/projects/:slug.md` | Canonical Markdown project document |
| `/writing/:slug.md` | Canonical Markdown article document |

Run `npm run check:machine` in CI to detect stale, missing, or manually edited generated files.

## URL and deployment configuration

The repository defaults to `https://example.com` so generated repositories never inherit the original author's domain. Replace it in `config/site.ts`, or set `NEXT_PUBLIC_SITE_URL` during build. Use one stable production origin with no trailing slash.

Vercel can build the repository directly with the included `vercel.json`. Other Node hosts can run:

```bash
npm ci
npm run build
npm run start
```

The site performs no request-time content fetch and needs no database or secret.

## Quality commands

```bash
npm run lint            # ESLint and Next.js rules
npm run typecheck       # strict TypeScript check
npm run test:unit       # content, publication, and serialization invariants
npm run build           # optimized production build
npm run test:e2e        # browser, accessibility, route, metadata, and header tests
npm run check           # deterministic publishing + all static checks + build
```

## Security and privacy defaults

- No raw HTML is enabled in Markdown.
- JSON-LD escapes `<` before entering the script context.
- External URLs must use HTTPS.
- Generated paths are constrained to an explicit output allowlist.
- Drafts do not become routes or public artifacts.
- Private repository URLs are not part of the public model.
- CI permissions are read-only and actions are pinned to immutable commits.
- A restrictive CSP and complementary response headers are enabled in `next.config.ts`.

See [`SECURITY.md`](SECURITY.md) before reporting a vulnerability.

## Licensing

The template code is available under the [MIT License](LICENSE). That license does not automatically apply to the writing, images, or other content you publish with it. Choose and declare content licenses intentionally in each entry or in your own site policy.
