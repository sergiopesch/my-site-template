# Repository guidance

- Treat `config/site.ts` and Markdown under `content/` as authoritative inputs.
- Do not hand-edit generator-owned files under `public/`.
- Keep the public content model narrower than raw frontmatter.
- Never publish drafts or private repository URLs in HTML, RSC payloads, metadata, JSON-LD, feeds, indexes, Markdown, or logs.
- Do not add chat widgets, agent runtimes, AI SDKs, vector stores, API routes, analytics, or request-time content fetches without an explicit project decision.
- Prefer server components. Keep client boundaries small and measurable.
- Preserve canonical routes and permanent aliases when changing slugs.
- Run `npm run check` and `npm run test:e2e` after implementation changes.
