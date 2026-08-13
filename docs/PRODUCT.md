# Product Contract

Keep this document short. It is the durable source of truth for what the product must do.

## Users and problem

- Primary users: B2B buyers and technical decision-makers in Iranian industrial sectors (oil, gas, petrochemical, mining, construction) who procure HSE consulting, safety inspection, and training services; also ministry/qualification reviewers checking the company's licenses and certificates.
- Context, ability, language, and device assumptions: Persian-speaking (fa-IR), RTL reading; business professionals; mobile-first browsing assumed for Iran (not yet measured); the site must work without login and without JavaScript beyond small inline enhancements.
- Problem being solved: ISBATAB (ایمن صنعت باتاب) — an HSE consulting company with Tehran and Kermanshah offices — needs a credible corporate web presence that documents licenses, ISO certificates, services, and a project portfolio, and converts visitors to phone/WhatsApp contact.
- Current alternative / workaround: phone directories, word of mouth, and proposal documents; no prior owned web presence was found in the repository.
- Why now: the company has completed project work and holds active licenses/certificates (see `src/content/certifications.json`) that need trustworthy public documentation.

## MVP outcome

- Measurable outcome: qualified leads reach the company via `tel:`/`wa.me`/email links on the site (no analytics are implemented yet — UNKNOWN/placeholder until a measurement decision is made).
- Riskiest product assumption: published licenses/certificates and project portfolio will be trusted by industrial buyers without a third-party review channel. UNVERIFIED.
- Smallest experiment that tests it: launch the site, monitor contact-path clicks (needs analytics — not yet installed), and ask the first 5 inbound callers where they heard about the company.
- Deadline / hard constraints: none recorded in the repository. UNKNOWN.
- Supported platforms and environments: static HTML/JS/CSS, no server runtime; any modern browser; `lang="fa" dir="rtl"`; single locale (fa-IR), no LTR or multi-language support.

## Must-have user flows

1. Home → services/projects overview → contact page → phone call or WhatsApp message (main conversion path).
2. About → certificates/licenses and organizational chart → trust confirmation → contact.
3. Services → categorized accordion with details/notes → contact CTA.

## Non-goals

- No online payments, quotes, or booking.
- No user accounts, CMS, or admin interface.
- No multi-language/i18n (fa-IR only).
- No client-side data persistence beyond the WhatsApp compose flow (data never leaves the browser except by the user sending it).
- No blog beyond the single sample post until real content is accepted.

## Acceptance criteria

- [x] All pages render statically from `src/content/*.json` (single content source), verified by `npm run build`.
- [x] Contact paths (`tel:`, `wa.me`, email, Google Maps embed) are present on home/contact pages.
- [x] RTL Persian output with Persian digits throughout (`html lang="fa" dir="rtl"`; `toPersianDigits` helper).
- [x] SEO basics: title/description/canonical/OG/JSON-LD on every page; `robots.txt`, `sitemap-index.xml` generated.
- [x] 404 page exists and is indexed as noindex.
- [ ] Browser-verified journey evidence (deterministic E2E) — now covered by `tests/e2e/home.spec.mjs` after bootstrap.
- [ ] Live deployment to Cloudflare Pages (isbatab.ir) — UNVERIFIED from the repository (README documents the steps only).

## Security, privacy, and compliance constraints

- Data classification: public business data only (company facts, contacts, certificates). No personal data is collected or stored by the site.
- Critical access rules: static site, no server-side authorization surface; the WhatsApp form composes a `wa.me` URL client-side and stores nothing.
- External/payment providers: none. Only external links (`tel:`, `wa.me`, Google Maps iframe/links) and Cloudflare Pages hosting.
- Retention/deletion requirements: none — the site stores no user data.
- CSP and security headers are shipped via `public/_headers` (frame-ancestors 'none', X-Frame-Options DENY, nosniff, referrer policy).

## Performance and UX budgets

- Core page/API target: Core Web Vitals `good` thresholds (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at p75) as the default target; no product-specific budgets accepted yet; no lab or RUM evidence is committed (UNMEASURED).
- Supported device/network baseline: unknown; site is responsive from 320 px; images lazy-loaded with width/height; Persian font limited to weights 400/700 with `font-display: swap`.
- Accessibility target: WCAG 2.2 AA (project default; no stricter target accepted).
- Brand character (`x, not y`): industrial credibility and HSE seriousness, not a generic corporate template.
- Visual ambition (utility / product / flagship): product-level corporate site (see `docs/DESIGN.md` for the accepted current direction).
- Required locales and directions (LTR/RTL): fa-IR, RTL only.
- Link to accepted visual contract: `docs/DESIGN.md`

## Measurement and operations

- Activation / success event: contact-path interaction (tel/WhatsApp/email). NOT MEASURED — no analytics installed; decision pending.
- Guardrail metrics: none defined. UNKNOWN.
- Required product telemetry: none yet; must be decided before claiming measurement.
- Support / recovery expectation: static content on Cloudflare Pages; recovery = redeploy from Git history; no state to back up.

## Open product decisions

- Analytics/privacy tooling for contact-path measurement (to be decided by product owner).
- Blog content roadmap (single sample post exists; copy says "in the next version").
- Confirmation of live domain deployment and whether `contacts.json` WhatsApp number is the officially accepted channel (status field currently `active`).
