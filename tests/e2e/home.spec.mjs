// Narrow committed browser smoke for the corporate site.
// Asserts structural, stable contract facts (RTL/Persian shell, navigation,
// conversion CTAs, WhatsApp form, 404) rather than volatile content strings,
// so content edits in src/content/*.json do not break this spec.
// Run: npm run test:e2e   (chromium only, 1 worker, 0 retries, no artifacts)
import { expect, test } from "@playwright/test";

// Identity guard: Playwright's webServer readiness check only tests HTTP 2xx, so a
// foreign application on the lane port would be silently reused. Fail fast with a
// clear diagnostic instead of ever asserting against the wrong server.
test.beforeAll(async () => {
  const response = await fetch("http://localhost:4325/");
  const body = await response.text();
  if (response.status !== 200 || !body.includes("ایمن صنعت باتاب")) {
    throw new Error(
      `http://localhost:4325 does not serve the ISBATAB site (status ${response.status}). ` +
        "Another application is likely running on port 4325. Stop it or change the port in playwright.config.mjs.",
    );
  }
});

test.describe("corporate site shell", () => {
  test("home page renders as a Persian RTL document with conversion CTAs", async ({ page }) => {
    await page.goto("/");

    // Locale/direction contract from BaseLayout.
    await expect(page.locator("html")).toHaveAttribute("lang", "fa");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page).toHaveTitle(/ایمن صنعت باتاب/);

    // Header navigation labels (stable, hardcoded in Header.astro).
    const nav = page.getByRole("navigation", { name: "منوی اصلی" });
    for (const label of ["خانه", "درباره ما", "خدمات", "گواهینامه‌ها", "پروژه‌ها", "تماس با ما", "بلاگ"]) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible();
    }

    // Conversion CTAs: phone and WhatsApp are reachable links.
    const phoneCta = page.getByRole("link", { name: /تماس تلفنی/ });
    await expect(phoneCta).toHaveAttribute("href", /^tel:/);
    await expect(page.getByRole("link", { name: "ارسال پیام در واتساپ" })).toHaveAttribute(
      "href",
      /^https:\/\/wa\.me\//,
    );
  });

  test("primary routes return the page and stay RTL", async ({ page }) => {
    for (const path of ["/", "/about", "/services", "/certifications", "/projects", "/contact", "/blog"]) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} should be 200`).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    }
  });

  test("unknown route serves the Persian 404 page", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "صفحه مورد نظر پیدا نشد" })).toBeVisible();
    await expect(page.getByRole("link", { name: "بازگشت به خانه" })).toBeVisible();
  });

  test("contact page exposes the WhatsApp lead form", async ({ page }) => {
    await page.goto("/contact#whatsapp");
    const form = page.locator("form[data-wa-form]");
    await expect(form).toBeVisible();
    await expect(form).toHaveAttribute("data-status", "active");
    await expect(form.locator("input[name='fullName']")).toBeVisible();
    await expect(form.locator("textarea[name='message']")).toBeVisible();
    await expect(form.getByRole("button", { name: "ارسال در واتساپ" })).toBeEnabled();
  });
});
