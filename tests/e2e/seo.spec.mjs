// Committed SEO contract smoke for the corporate site.
// Asserts the durable search-facing facts: canonical convention (trailing
// slash), single H1, homepage Organization+WebSite JSON-LD, absence of
// obsolete meta (keywords/hreflang), noindex policy, draft-gated 404, and
// mobile equivalence. Runs against wrangler dev (production-accurate assets).
import { expect, test } from "@playwright/test";

test.describe("seo contract", () => {
  test("homepage carries canonical, Organization+WebSite JSON-LD and no obsolete meta", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", "https://isbatab.ir/");
    await expect(page.locator("meta[name='keywords']")).toHaveCount(0);
    await expect(page.locator("link[rel='alternate'][hreflang]")).toHaveCount(0);
    await expect(page.locator("meta[name='robots']")).toHaveCount(0);

    const types = await page
      .locator("script[type='application/ld+json']")
      .evaluateAll((scripts) => scripts.map((s) => JSON.parse(s.textContent ?? "{}")["@type"]));
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
    expect(types).not.toContain("BreadcrumbList");
  });

  test("every primary page has exactly one H1 and a trailing-slash canonical", async ({ page }) => {
    for (const path of ["/", "/about/", "/services/", "/certifications/", "/projects/", "/contact/"]) {
      await page.goto(path);
      await expect(page.locator("h1")).toHaveCount(1, { timeout: 5_000 });
      await expect(page.locator("link[rel='canonical']")).toHaveAttribute(
        "href",
        `https://isbatab.ir${path === "/" ? "/" : path}`,
      );
    }
  });

  test("extensionless URLs resolve to the canonical trailing-slash form", async ({ page }) => {
    await page.goto("/about", { waitUntil: "commit" });
    await expect(page).toHaveURL(/\/about\/$/);
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", "https://isbatab.ir/about/");
  });

  test("service detail page renders one H1, breadcrumb and BreadcrumbList JSON-LD", async ({ page }) => {
    await page.goto("/services/lifting-equipment-inspection/");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "ارزیابی ایمنی و بازرسی فنی جرثقیل‌ها، لیفتراک و ماشین‌آلات", exact: true })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "مسیر صفحه" })).toBeVisible();
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute(
      "href",
      "https://isbatab.ir/services/lifting-equipment-inspection/",
    );

    const breadcrumbs = await page
      .locator("script[type='application/ld+json']")
      .evaluateAll((scripts) => scripts.map((s) => JSON.parse(s.textContent ?? "{}")["@type"]));
    expect(breadcrumbs).toContain("BreadcrumbList");
  });

  test("draft blog post returns a real 404 and the blog index is noindexed", async ({ page }) => {
    const draft = await page.goto("/blog/intro-post/");
    expect(draft?.status()).toBe(404);

    await page.goto("/blog/");
    await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", "noindex,nofollow");
  });

  test("service page stays equivalent and overflow-free on a narrow mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/services/tank-thickness-pressure/");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "ضخامت‌سنجی مخازن و ارزیابی ایمنی مخازن تحت فشار", exact: true })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBe(false);
  });
});
