import type { CompanyContent, ContactsContent } from "./types";

export const SITE_URL = "https://isbatab.ir";
export const SITE_NAME = "ایمن صنعت باتاب";
export const DEFAULT_OG_IMAGE = "/images/placeholders/og-cover.svg";
export const SITE_KEYWORDS = [
  "ایمن صنعت باتاب",
  "ISBATAB",
  "خدمات ایمنی",
  "مشاوره ایمنی",
  "آموزش ایمنی",
  "بازرسی فنی",
  "HSE",
].join("، ");

export const absoluteUrl = (path = "/"): string => {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return new URL(clean, SITE_URL).toString();
};

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

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    alternateName: company.shortName,
    url: SITE_URL,
    email: contacts.email,
    telephone: phones,
    address: addresses,
    foundingDate: company.foundedAt,
    sameAs: [contacts.website],
  };
};

export const websiteJsonLd = (): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "ISBATAB",
  url: SITE_URL,
  inLanguage: "fa-IR",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});
