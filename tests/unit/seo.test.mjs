import assert from "node:assert/strict";
import test from "node:test";
// Direct .ts import requires Node's built-in type stripping (Node >= 22.18).
import { jalaaliDateToIso } from "../../src/lib/locale.ts";
import {
  LOGO_URL,
  SITE_NAME,
  articleJsonLd,
  breadcrumbJsonLd,
  canonicalize,
  canonicalUrl,
  formatPageTitle,
  organizationJsonLd,
  summarize,
  websiteJsonLd,
} from "../../src/lib/seo.ts";
import companyData from "../../src/content/company.json" with { type: "json" };
import contactsData from "../../src/content/contacts.json" with { type: "json" };

test("jalaaliDateToIso converts the company registration date (24 Tir 1403)", () => {
  // 24 Tir 1403 = 14 July 2024 (verified: 1 Farvardin 1403 = 20 March 2024).
  assert.equal(jalaaliDateToIso("۲۴ تیر ۱۴۰۳"), "2024-07-14");
});

test("jalaaliDateToIso handles Persian and ASCII digits and year boundaries", () => {
  assert.equal(jalaaliDateToIso("۱ فروردین ۱۴۰۳"), "2024-03-20");
  assert.equal(jalaaliDateToIso("1 فروردین 1392"), "2013-03-21");
});

test("jalaaliDateToIso rejects malformed or out-of-range input", () => {
  assert.equal(jalaaliDateToIso(""), undefined);
  assert.equal(jalaaliDateToIso("۱۴۰۳ تیر ۲۴"), undefined); // wrong order
  assert.equal(jalaaliDateToIso("۳۲ تیر ۱۴۰۳"), undefined); // invalid day
  assert.equal(jalaaliDateToIso("۳۱ مهر ۱۴۰۳"), undefined); // Mahr has 30 days
  assert.equal(jalaaliDateToIso("24 foo 1403"), undefined); // unknown month
});

test("canonicalize enforces the single trailing-slash form for page paths", () => {
  assert.equal(canonicalize("/about"), "/about/");
  assert.equal(canonicalize("/about/"), "/about/");
  assert.equal(canonicalize("about"), "/about/");
  assert.equal(canonicalize("/"), "/");
  assert.equal(canonicalize("/services/lifting-equipment-inspection/"), "/services/lifting-equipment-inspection/");
});

test("canonicalUrl builds absolute trailing-slash canonical URLs on the production domain", () => {
  assert.equal(canonicalUrl("/about"), "https://isbatab.ir/about/");
  assert.equal(canonicalUrl("/"), "https://isbatab.ir/");
});

test("formatPageTitle appends the brand only when the title lacks it", () => {
  assert.equal(formatPageTitle("خدمات ایمن صنعت باتاب", false), "خدمات ایمن صنعت باتاب");
  assert.equal(formatPageTitle("بازرسی فنی جرثقیل", false), `بازرسی فنی جرثقیل | ${SITE_NAME}`);
  assert.equal(formatPageTitle("خانه", true), "خانه");
});

test("summarize caps a description at the first sentence boundary", () => {
  const text = "این جمله اول است. این جمله دوم است.";
  assert.equal(summarize(text), "این جمله اول است.");
  const long = "ح".repeat(200);
  assert.equal(summarize(long).length, 156); // 155 chars + ellipsis
});

test("summarize cuts long sentences at a word boundary", () => {
  const text = `${"کلمه ".repeat(40)}پایان`; // no sentence end within 155 chars
  const result = summarize(text, 40);
  assert.ok(result.length <= 41, `expected <= 41 chars, got ${result.length}: ${result}`);
  assert.ok(!result.includes("پایان"), "must not cut mid-word");
  assert.match(result, /…$/);
});

test("organizationJsonLd carries only supported real facts with a logo and no fabricated sameAs", () => {
  const ld = organizationJsonLd(companyData, contactsData);
  assert.equal(ld["@type"], "Organization");
  assert.equal(ld.name, companyData.name);
  assert.equal(ld.url, "https://isbatab.ir");
  assert.equal(ld.logo, `https://isbatab.ir${LOGO_URL}`);
  assert.deepEqual(ld.telephone, contactsData.phones.map((phone) => phone.number));
  assert.ok(Array.isArray(ld.address));
  assert.equal(ld.foundingDate, "2024-07-14");
  assert.equal(ld.sameAs, undefined, "no sameAs without verified external profiles");
  assert.equal(ld.email, contactsData.email);
});

test("websiteJsonLd has no SearchAction (sitelinks search box is retired)", () => {
  const ld = websiteJsonLd();
  assert.equal(ld["@type"], "WebSite");
  assert.equal(ld.name, SITE_NAME);
  assert.equal(ld.potentialAction, undefined);
});

test("breadcrumbJsonLd numbers items and omits the URL of the current page", () => {
  const ld = breadcrumbJsonLd([
    { name: "خانه", path: "/" },
    { name: "خدمات", path: "/services" },
    { name: "بازرسی جرثقیل" },
  ]);
  assert.equal(ld["@type"], "BreadcrumbList");
  assert.equal(ld.itemListElement.length, 3);
  assert.equal(ld.itemListElement[0].item, "https://isbatab.ir/");
  assert.equal(ld.itemListElement[1].item, "https://isbatab.ir/services/");
  assert.equal(ld.itemListElement[2].item, undefined);
  assert.deepEqual(ld.itemListElement.map((item) => item.position), [1, 2, 3]);
});

test("articleJsonLd uses the company as author/publisher (no fabricated person)", () => {
  const ld = articleJsonLd({
    headline: "عنوان مقاله",
    url: "https://isbatab.ir/blog/post/",
    datePublished: "2025-01-01",
    companyName: companyData.name,
    companyUrl: "https://isbatab.ir/",
    companyLogo: `https://isbatab.ir${LOGO_URL}`,
  });
  assert.equal(ld["@type"], "BlogPosting");
  assert.equal(ld.author["@type"], "Organization");
  assert.equal(ld.publisher.name, companyData.name);
  assert.equal(ld.datePublished, "2025-01-01");
  assert.equal(ld.publisher.logo.url, `https://isbatab.ir${LOGO_URL}`);
});
