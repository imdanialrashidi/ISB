# Architecture Decisions

Record only durable constraints and decisions. Do not turn this into a diary.

## Current system

- Runtime/platform: Astro 5 static site generation (SSG) on Node.js 22 (CI pins 22.23.2; local is 22.23.1); output is static HTML/CSS/JS in `dist/`; no server runtime, no SSR endpoints, no database, no auth.
- Main modules:
  - `src/pages/*.astro` — routes: `/` (index), `/about`, `/services`, `/projects`, `/contact`, `/blog`, `/blog/[slug]`, `404`.
  - `src/components/*.astro` — presentational components (Header with mobile menu, Footer, Hero, SectionTitle, Badge, ContactCTA, ServiceCard, ServicesAccordion via `<details>`, ProjectsTable with status filter, ProjectCard, OrganizationChart, WhatsAppForm).
  - `src/content/*.json` — the single source of content truth: `company.json`, `contacts.json`, `services.json` (10 services, 5 categories), `projects.json` (13 projects, status `completed|in_progress`), `certifications.json`; plus `extracted.raw.json` (raw DOCX extraction artifact) and `blog/intro-post.md` (sample post).
  - `src/lib/` — typed helpers: `types.ts` (content interfaces mirroring the JSON shape), `locale.ts` (Persian digits, fa date formatting, phone display normalization), `seo.ts` (SITE_URL, canonical/OG/JSON-LD builders), `whatsapp.ts` (message/`wa.me` URL builders).
  - `src/content.config.ts` — Astro content collection schema (zod) for the `blog` collection only.
  - `scripts/extract-docx.mjs` — one-way DOCX → `src/content/*.json` content extraction pipeline (`npm run extract-content`, source path via `DOCX_PATH` env).
- Data stores: none at runtime. Content is committed JSON validated at build time by TypeScript (via `types.ts` casts) and by content collection schemas where defined. UNKNOWN: JSON is cast with `as` — no zod schema validates the JSON files at build time; `astro check` does not type-check JSON.
- External services: Cloudflare Pages (hosting, per README — deployment itself UNVERIFIED); Google Maps embed/links on `/contact`; `wa.me` and `tel:` deep links; `@astrojs/sitemap` generates `sitemap-index.xml` at build.
- Deployment topology: static `dist/` → Cloudflare Pages; `public/_headers` controls caching (immutable `/_astro/*`, `/fonts/*`, `/images/*`) and security headers (CSP, X-Frame-Options DENY, nosniff, referrer policy). No CI deploy workflow exists in `.github/workflows/` (only `quality.yml` — harness validation).

## Trust boundaries and critical data flows

1. Client browser → (no server): the WhatsApp form (`src/components/WhatsAppForm.astro`) composes a message and opens `https://wa.me/<number>?text=...` client-side. No data is transmitted to or stored by the site. The only "state" is a `placeholder` fallback message when `contacts.json.whatsapp.status !== "active"`.
2. Build-time content: `src/content/*.json` → typed interfaces (`src/lib/types.ts`) → components. Content is trusted (committed by the project) but any future user-supplied content must be validated at this boundary before rendering.
3. Outbound links only: `tel:`, `wa.me`, `mailto:`, Google Maps — all static, all `noopener noreferrer` on external links.

## Non-negotiable invariants

- Static-only: no server runtime, no SSR, no server-side user input handling. Keep it that way.
- Content single-source rule: product content lives in `src/content/*.json` (mirrored by `src/lib/types.ts`); pages/components must not hardcode company data that already exists there (e.g., phones, addresses, services, projects).
- Persian/RTL correctness: every page renders under `html lang="fa" dir="rtl"` (BaseLayout); Latin/numeral runs use `.latin-text`/`.num-text` or `toPersianDigits`; never mix raw ASCII digits into Persian UI text.
- Contacts normalization: phone/WhatsApp values are normalized only through `src/lib/locale.ts` and `src/lib/whatsapp.ts` helpers (digits-only `wa.me`/`tel:` hrefs, display formatting).
- Font licensing: only Vazirmatn (OFL-1.1, via `@fontsource/vazirmatn`; woff2 committed under `public/fonts/`) — weights 400/700 only (500 files exist but are unused).
- No new runtime dependencies without a demonstrated need; keep `package.json` scripts as the interface for all verification commands.

## Chosen patterns

| Area               | Decision                                                                                | Why                                            | Revisit when                        |
| ------------------ | --------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------- |
| Rendering          | Astro SSG, `inlineStylesheets: "always"`, Tailwind `applyBaseStyles: false`             | Small static site; minimal render-blocking CSS | A dynamic capability is required    |
| Content            | Committed JSON + TS interfaces, no CMS                                                  | Content is small, versioned, reviewable        | A non-technical editor is needed    |
| Styling            | Tailwind 3 + CSS variables in `:root` (global.css) mapped to `brand.*` theme colors     | One token surface for components               | Token system changes are accepted   |
| Contact conversion | Static `tel:`/`wa.me` links + client-side WhatsApp compose                              | No backend needed; Iran-friendly channel       | A server-side lead form is accepted |
| Blog               | Astro content collection (zod, `draft` flag)                                            | Schema-validated, draft-gated                  | Real editorial workflow arrives     |
| Verification       | npm scripts + `.pi/verification.json` affected routing + `scripts/verify.sh` full gate  | Deterministic, cheap, lane-aware               | Canonical gate changes are accepted |
| Browser QA         | Playwright MCP (interactive) + `@playwright/test` narrow committed spec (deterministic) | Separation of exploration from regression      | E2E coverage needs to grow          |

## Explicitly rejected complexity

- Server runtime/SSR/API routes for forms (client-side WhatsApp compose is sufficient and stateless).
- CMS/admin panel, accounts, payments, booking.
- Multi-language/i18n infrastructure (fa-IR only).
- A second content system (JSON files are the content layer; the blog collection is schema-validated where it matters).

## Operational baseline

- Configuration/secrets: none in the repo beyond `.pi/models.env` model routing (no API keys committed). Env vars read at build/runtime: none for the site itself; `DOCX_PATH` only for the extraction script.
- Migrations: none (static content).
- Backup and tested restore: content is Git history; redeploy from any commit. No restore drill recorded (UNVERIFIED).
- Logging/monitoring: none at runtime (static). Build/CI logs only.
- Rollback: redeploy a previous commit to Cloudflare Pages; no state to migrate (documented in README; not exercised).
