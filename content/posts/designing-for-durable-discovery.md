---
kind: post
title: "Designing for durable discovery"
slug: "designing-for-durable-discovery"
summary: "Why canonical URLs, structured metadata, plain-text alternatives, and honest provenance make the open web easier to use."
date: "2026-04-12"
content_updated: "2026-04-18"
language: "en"
topics:
  - "Information architecture"
  - "Web publishing"
  - "Metadata"
aliases:
  - "/blog/durable-discovery"
sources:
  - title: "Cool URIs don't change"
    url: "https://www.w3.org/Provider/Style/URI"
license:
  name: "CC BY 4.0"
  url: "https://creativecommons.org/licenses/by/4.0/"
  scope: "article text"
  verified: "2026-04-18"
---

Discovery is durable when a reader can understand what a page is, where it came from, and whether it is still current without depending on one interface.

That starts with stable canonical URLs and honest dates. A publication date describes when an idea first became public. A content update describes an editorial change. Repository activity, when it exists, is useful context but should not silently rewrite either of those facts.

The same record can then support an HTML page, a concise Markdown alternate, a feed item, and a machine-readable index. Each representation should point back to the same canonical resource and carry the same title, summary, author, and freshness information.

Good metadata is not decoration. It is the connective tissue that lets browsers, readers, search engines, and future tools discover the same work without guessing.
