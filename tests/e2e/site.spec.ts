import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const privateDraftTitle = "Unpublished workbench note";

test("security headers are enforced", async ({ request }) => {
  const response = await request.get("/");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-security-policy"]).toContain("default-src 'self'");
  expect(response.headers()["content-security-policy-report-only"]).toBeUndefined();
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(response.headers()["strict-transport-security"]).toContain("max-age=63072000");
});

test("machine publications are available, consistent, and private-safe", async ({ request }) => {
  const paths = [
    "/robots.txt",
    "/sitemap.xml",
    "/rss.xml",
    "/feed.json",
    "/content-index.json",
    "/llms.txt",
    "/llms-full.txt",
    "/projects/personal-site-foundation.md",
    "/writing/designing-for-durable-discovery.md",
  ];

  for (const path of paths) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }

  const indexResponse = await request.get("/content-index.json");
  const index = await indexResponse.json();
  const project = index.items.find(
    (entry: { slug: string }) => entry.slug === "small-tools-collection"
  );

  expect(index.schema_version).toBe("1.2");
  expect(index.items).toHaveLength(8);
  expect(project.repository).toEqual({
    visibility: "private",
    created: "2026-02-08",
    updated: "2026-03-01",
  });
  expect(JSON.stringify(index)).not.toContain(privateDraftTitle);
  expect(JSON.stringify(project.repository)).not.toContain("url");
  expect(project.markdown_sha256).toMatch(/^[a-f0-9]{64}$/);

  const feed = await (await request.get("/feed.json")).json();
  expect(feed.items).toHaveLength(4);
  expect(feed.items.every((item: { url: string }) => item.url.includes("/writing/"))).toBe(true);
});

test("home and content routes render canonical, accessible publication UI", async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Welcome to my digital garden. A space to share projects, ideas, and notes."
  );
  await expect(
    page.getByRole("heading", { name: "Personal Site Foundation" })
  ).toBeVisible();
  await expect(page.getByText(privateDraftTitle)).toHaveCount(0);

  if (testInfo.project.name === "chromium") {
    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(accessibility.violations).toEqual([]);
  }

  await page.goto("/writing/designing-for-durable-discovery");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Designing for durable discovery"
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://example.com/writing/designing-for-durable-discovery"
  );
  await expect(page.locator('link[rel="alternate"][type="text/markdown"]')).toHaveAttribute(
    "href",
    "https://example.com/writing/designing-for-durable-discovery.md"
  );

  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(jsonLd.some((value) => value.includes("BlogPosting"))).toBe(true);
  await expect(page.getByLabel("Content provenance")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Read as Markdown" })).toHaveCount(0);
  await expect(page.getByText("Agent Quick Start", { exact: true })).toHaveCount(0);
  expect(consoleErrors).toEqual([]);
});

test("internal links resolve and old addresses redirect permanently", async ({ page, request }) => {
  await page.goto("/");
  const internalLinks = await page.locator('a[href^="/"]').evaluateAll((links) =>
    [...new Set(links.map((link) => link.getAttribute("href")).filter(Boolean))]
  );

  for (const href of internalLinks) {
    const response = await request.get(href!, { maxRedirects: 0 });
    expect([200, 307, 308], href!).toContain(response.status());
  }

  const alias = await request.get("/blog/durable-discovery", { maxRedirects: 0 });
  expect(alias.status()).toBe(308);
  expect(alias.headers().location).toBe("/writing/designing-for-durable-discovery");

  const draft = await request.get("/writing/unpublished-workbench-note");
  expect(draft.status()).toBe(404);
});

test("navigation works when JavaScript is disabled", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-no-js", "No-JavaScript project only");

  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Thoughts", exact: true })
    .click();
  await expect(page).toHaveURL(/\/writing$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Notes, thoughts, and field observations."
  );
});

test("theme preference changes through the isolated client control", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "JavaScript project only");

  await page.goto("/");
  const initialTheme = await page.locator("html").getAttribute("data-theme");
  await page.getByRole("button", { name: "Toggle Dark Mode" }).click();
  const changedTheme = await page.locator("html").getAttribute("data-theme");

  expect(changedTheme).not.toBe(initialTheme);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", changedTheme!);
});

test("project post links are emphasized without changing navigation typography", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  for (const link of await page.getByRole("navigation").getByRole("link").all()) {
    await expect(link).not.toHaveCSS("font-style", "italic");
  }
  await expect(
    page.getByRole("link", { name: "Open Personal Site Foundation live site" })
  ).not.toHaveCSS("font-style", "italic");

  await page.goto("/projects/personal-site-foundation");

  const internalWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(internalWidth).toBeLessThanOrEqual(390);

  const link = page.getByRole("link", { name: "live project" });
  await expect(link).toBeVisible();
  await expect(link).toHaveCSS("font-weight", "700");
  await expect(link).toHaveCSS("font-style", "italic");
  await expect(page.getByAltText(/neutral personal site homepage/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "View site" })).not.toHaveCSS(
    "font-style",
    "italic"
  );

  for (const navigationLink of await page.getByRole("navigation").getByRole("link").all()) {
    await expect(navigationLink).not.toHaveCSS("font-style", "italic");
  }

  await page.goto("/writing/keeping-decisions-visible");
  const thoughtLink = page.getByRole("link", { name: "Architecture Decision Records guide" });
  await expect(thoughtLink).toBeVisible();
  await expect(thoughtLink).not.toHaveCSS("font-style", "italic");
});
