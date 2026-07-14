# Agent-ready personal site

A reusable version of the same editorial design used on [sergiopesch.com](https://www.sergiopesch.com), filled with neutral placeholder content and links. It is fast, accessible, responsive, and ready for people, search engines, LLMs, and web agents.

[Live demo](https://agent-ready-site-template.vercel.app) · [Use this template](https://github.com/sergiopesch/my-site-template/generate)

![The neutral personal site template with an editorial introduction and featured project](docs/template-preview.jpg)

## Start here

1. Select **Use this template** on GitHub.
2. Use Node 22 and run `npm ci`.
3. Replace the identity and links in [`config/site.ts`](config/site.ts).
4. Replace the examples in `content/projects` and `content/posts`.
5. Run `npm run check`, then `npm run test:e2e`.

## Included

- Projects, thoughts, About, light mode, and dark mode
- Validated Markdown content and responsive project images
- Canonical URLs, JSON-LD, Markdown alternates, RSS, JSON Feed, sitemap, `llms.txt`, and a content index
- Draft and private repository protection
- Accessibility, metadata, security, browser, and machine-output tests

Set `NEXT_PUBLIC_SITE_URL` to the production origin before deployment. Generated files in `public/` come from the content catalog; update them with `npm run generate:machine` instead of editing them by hand.

MIT licensed. See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md) for project guidance.
