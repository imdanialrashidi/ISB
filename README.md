# ISBATAB Corporate Website

Corporate RTL website for **ISBATAB (ایمن صنعت باتاب)** built for B2B presentation, trust-building, and lead conversion to phone/WhatsApp contact.

## Tech Stack

- Astro (SSG)
- TypeScript
- Tailwind CSS
- Static hosting target: GitHub Pages (static `dist/` artifact)

## Local Development

### Prerequisites

- Node.js LTS (recommended: latest LTS)

### Install

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Build production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Scripts

- `npm run dev` - start Astro dev server (http://localhost:4321)
- `npm run build` - build the static site to `dist`
- `npm run preview` - serve the built `dist/` locally (`npm run build` first)
- `npm run check` / `npm run typecheck` - Astro/Type diagnostics (`astro check`)
- `npm run lint` - ESLint
- `npm test` - Node test runner: product unit tests (`tests/unit/*.test.mjs`)
- `npm run validate:content` - contract validation of `src/content/*.json`
- `npm run format` - Prettier check (⚠ not enforced — see below)
- `npm run verify:fast` - fast static lane: lint + check + content validation
- `npm run verify:feature` - feature lane: fast + build + E2E smoke
- `npm run test:e2e` - Playwright smoke (`tests/e2e/`; chromium only, 1 worker, no video/trace/screenshots; builds+previews on port 4325 or reuses an ISBATAB server already running there)
- `bash scripts/verify.sh` - canonical gate: template self-checks, then the project lane in `scripts/project-verify.sh` (lint + check + content validation + unit tests + build)
- `npm run extract-content` - extract content from the source DOCX (set `DOCX_PATH`; defaults to `docs/private/` — kept out of git)

## Verification lanes (for agents and humans)

| Lane                | Command                           | Covers                                                                                |
| ------------------- | --------------------------------- | ------------------------------------------------------------------------------------- |
| Fast (static)       | `npm run verify:fast`             | ESLint + `astro check` + content validation                                           |
| Unit                | `npm test`                        | Product unit suites (`tests/unit/`)                                                   |
| Feature             | `npm run verify:feature`          | Fast + production build + committed browser smoke                                     |
| Full (canonical)    | `bash scripts/verify.sh`          | Template self-checks + project lane (lint + check + content + unit + build) — required before merge/release |

Browser E2E prerequisites: `npx playwright install chromium` once locally. Committed deterministic specs live in `tests/e2e/`; interactive browser exploration uses the agent's native browser tool.

Tiny low-risk edits: `/skill:quick-fix <change>` (targeted check only; escalates to `/build` when scope or risk grows).

> Note: Prettier is configured but **not enforced** — `npm run format` fails on pre-existing files and is deliberately absent from all verification lanes. Format only files you touch.

## Deploy to GitHub Pages

The site is a pure static build (`dist/`) deployed by
`.github/workflows/deploy-pages.yml` on every push to `main` (or manually via
**Actions → deploy-pages → Run workflow**).

One-time repository setup:

1. **Settings → Pages → Build and deployment → Source:** select **GitHub Actions**.
2. Keep the custom domain `isbatab.ir` in **Settings → Pages → Custom domain**
   (the domain is also committed as `public/CNAME`, so the artifact preserves it).
3. Point the domain's DNS at GitHub Pages (apex `A`/`AAAA` records or a `www`
   `CNAME`), then enable **Enforce HTTPS**.

Rollback: re-run the workflow for an earlier commit, or revert the commit on
`main` and let the workflow redeploy. GitHub Pages keeps the previous
deployment available in the repository's Actions run history.

### Response headers

GitHub Pages serves static files only and does not support custom response
headers, so the former `_headers` file (Cloudflare-specific caching and
security headers) was removed. `Cache-Control` is set by GitHub's CDN and
cannot be tuned per path; use hashed `_astro/*` URLs for immutable assets.
Document-level CSP is emitted as a `<meta http-equiv="Content-Security-Policy">`
tag in `BaseLayout.astro`; `frame-ancestors`/`X-Frame-Options` cannot be set on
GitHub Pages.

## Content Editing Guide

Main content files:

- `src/content/company.json`
- `src/content/contacts.json`
- `src/content/services.json`
- `src/content/projects.json`
- `src/content/certifications.json`
- Blog sample: `src/content/blog/intro-post.md`

If source DOCX is updated:

```bash
DOCX_PATH="/path/to/resume.docx" npm run extract-content
```

The extractor parses the project table (title/client pairs), the company
introduction, and the contact email from the DOCX, then rewrites the content
JSON files. It refuses to overwrite `projects.json` when it cannot parse any
projects, and it prints a warning instead. The raw paragraph dump goes to
`.artifacts/extracted.raw.json` (gitignored). Review and refine the generated
content before publishing.

Note: the ایتا/بله buttons currently link to the messengers' entry pages
(`https://eitaa.com`, `https://ble.ir`) with the company number displayed;
replace `messaging[].url` in `src/content/contacts.json` with the official
channel invite links when they are available.

## Performance Notes

Applied optimizations include:

- Reduced Persian font loading to critical weights only (400, 500, 700).
- `font-display: swap` with minimal preload for above-the-fold text.
- Inline stylesheet strategy in Astro build to reduce render-blocking CSS request chains.
- Hashed `_astro/*` asset filenames for long-lived CDN caching (caching itself is controlled by GitHub Pages).
- Width/height and lazy-loading applied to non-critical images for low CLS.
- All raster content images are optimized at build time to responsive WebP variants (`srcset`/`sizes`) sized for their rendered slot, so mobile browsers download smaller files than desktop; certificates/org-chart use conservative quality for text clarity. SVG placeholders and favicons remain in their original formats.

### Running Lighthouse

You can run Lighthouse from Chrome DevTools (Performance tab) against:

- local preview (`npm run preview`)
- production URL

Recommended checks:

- Performance (focus on FCP/LCP/Speed Index)
- Accessibility (contrast and accessible names)

## Search (SEO) notes

- **Canonical convention:** every indexable page identifies its preferred URL
  with a trailing slash (`https://isbatab.ir/about/`). Canonical tags, internal
  links, the XML sitemap, and GitHub Pages' automatic `/about` → `/about/` redirect
  all agree on this single form — keep new links on it.
- **Index policy:** pages opt out of indexing with the `noIndex` prop on
  `BaseLayout` (currently `/blog/` only — its post is demo content and the
  post is committed as `draft: true`). The sitemap filter in
  `astro.config.mjs` excludes the same paths; remove the filter entry and the
  `noIndex` prop when real articles are published.
- **Structured data:** Organization + WebSite JSON-LD is emitted on the
  homepage only (`orgSchema` prop); BreadcrumbList on service detail and blog
  pages; Article/BlogPosting on blog posts (author = the company). All data is
  derived from `src/content/*.json` — no invented properties.
- **Social image:** `og:image` is the rasterized cover
  `public/images/placeholders/og-cover.png` (SVG source sits next to it with
  the logo embedded as a data URI). Regenerate with:
  `rsvg-convert -w 1200 -h 630 public/images/placeholders/og-cover.svg -o public/images/placeholders/og-cover.png`.
- **Brand assets:** `public/images/brand/isbatab-logo.png` is a stable public
  copy of the logo (used by Organization `logo` JSON-LD); keep it in sync with
  `src/assets/images/brand/isbatab-logo.png`.
- **Preview environments:** canonical tags are absolute and always point to
  `https://isbatab.ir/...`, so preview/deploy URLs cannot become competing
  indexed copies of production.

## License

All rights reserved.
