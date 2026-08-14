import { jalaaliDateToIso } from "./locale.ts";
import type { CompanyContent, ContactsContent } from "./types";

export const SITE_URL = "https://isbatab.ir";
export const SITE_NAME = "ایمن صنعت باتاب";
export const SITE_SHORT_NAME = "ISBATAB";

/**
 * Social-sharing cover image (PNG, 1200×630). The SVG source lives next to it
 * at public/images/placeholders/og-cover.svg and is rasterized to this PNG;
 * keep both in sync when editing the cover. PNG is used because most social
 * platforms and crawlers do not render SVG og:image assets.
 */
export const DEFAULT_OG_IMAGE = "/images/placeholders/og-cover.png";

/**
 * Stable public URL of the real company logo (PNG copy of the brand asset in
 * src/assets/images/brand/). Used by Organization structured data (logo) and
 * stays stable across builds, unlike hashed build-time asset URLs.
 */
export const LOGO_URL = "/images/brand/isbatab-logo.png";

/**
 * Canonical URL convention: every indexable page identifies its preferred URL
 * with a trailing slash (https://isbatab.ir/about/), matching the XML sitemap
 * and Cloudflare's auto-trailing-slash asset behavior. Keep internal links,
 * canonical tags, and the sitemap on this single form.
 */
export const canonicalize = (path = "/"): string => {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return "/";
  return clean.endsWith("/") ? clean : `${clean}/`;
};

export const absoluteUrl = (path = "/"): string => {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return new URL(clean, SITE_URL).toString();
};

/** Absolute canonical URL for a page path (trailing-slash normalized). */
export const canonicalUrl = (path = "/"): string => absoluteUrl(canonicalize(path));

/**
 * Page title rule: descriptive page-specific titles, with the company name as
 * a concise suffix only when the title does not already contain it. Avoids
 * redundant repetitions such as «درباره شرکت ایمن صنعت باتاب | ایمن صنعت باتاب».
 */
export const formatPageTitle = (title: string, isHome = false): string => {
  if (isHome || title.includes(SITE_NAME)) return title;
  return `${title} | ${SITE_NAME}`;
};

/** First sentence of a text, capped at a word boundary for meta descriptions. */
export const summarize = (text: string, max = 155): string => {
  const end = text.search(/[.!؟]\s/);
  const head = end === -1 ? text : text.slice(0, end + 1);
  if (head.length <= max) return head;
  const cut = head.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim()}…`;
};

export interface BreadcrumbItem {
  name: string;
  /** URL path for all but the last (current) crumb. */
  path?: string;
}

export const breadcrumbJsonLd = (
  items: BreadcrumbItem[],
): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    ...(item.path ? { item: canonicalUrl(item.path) } : {}),
  })),
});

export const organizationJsonLd = (
  company: CompanyContent,
  contacts: ContactsContent,
): Record<string, unknown> => {
  const phones = contacts.phones.map((phone) => phone.number);
  const addresses = contacts.addresses.map((address) => ({
    "@type": "PostalAddress",
    addressCountry: "IR",
    addressLocality: address.city,
    streetAddress: address.fullAddress,
  }));
  const foundedAt = jalaaliDateToIso(company.foundedAt);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    alternateName: company.shortName,
    url: SITE_URL,
    logo: absoluteUrl(LOGO_URL),
    email: contacts.email,
    telephone: phones,
    address: addresses,
    ...(foundedAt ? { foundingDate: foundedAt } : {}),
  };
};

export const websiteJsonLd = (): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: SITE_SHORT_NAME,
  url: SITE_URL,
  inLanguage: "fa-IR",
});

/**
 * Article/BlogPosting structured data for blog posts. The author is the
 * company itself (publisher): individual authors are only added when the
 * author is genuinely known and named on the post.
 */
export const articleJsonLd = (post: {
  headline: string;
  url: string;
  datePublished: string;
  companyName: string;
  companyUrl: string;
  companyLogo: string;
}): Record<string, unknown> => {
  const publisher = {
    "@type": "Organization",
    name: post.companyName,
    url: post.companyUrl,
    logo: {
      "@type": "ImageObject",
      url: post.companyLogo,
    },
  };
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.headline,
    url: post.url,
    mainEntityOfPage: { "@type": "WebPage", "@id": post.url },
    datePublished: post.datePublished,
    author: publisher,
    publisher,
    inLanguage: "fa-IR",
  };
};
