# Security policy

## Supported version

Security fixes are applied to the current `main` branch. Sites generated from this template should keep their lockfile and framework dependencies updated.

## Report a vulnerability

Please use the repository's **Security** tab to open a private vulnerability report. Do not publish exploit details in a public issue.

Include the affected revision, reproduction steps, realistic impact, and any suggested mitigation. Reports about content accuracy, broken links, or discoverability that do not cross a security boundary can use a normal issue.

## Security model

The default template is a public, read-only website with repository-authored content. It has no accounts, database, forms that mutate state, API routes, agent runtime, or model credentials. Its main security boundaries are build inputs, dependency/CI integrity, safe Markdown and JSON-LD serialization, generated-path containment, and prevention of draft or private-repository publication.
