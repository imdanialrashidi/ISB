# ISBATAB Corporate Website

Corporate RTL website for **ISBATAB (ایمن صنعت باتاب)** built for B2B presentation, trust-building, and lead conversion to phone/WhatsApp contact.

## Tech Stack

- Astro (SSG)
- TypeScript
- Tailwind CSS
- Static hosting target: Cloudflare Workers (static assets + minimal Astro runtime)

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
- `npm run build` - build static site to `dist` (Workers static-assets layout: `dist/_worker.js`)
- `npm run preview` - build + `wrangler dev` preview
- `npm run check` / `npm run typecheck` - Astro/Type diagnostics (`astro check`)
- `npm run lint` - ESLint
- `npm test` - Node test runner: harness suites (`tests/*.test.mjs`) + product unit tests (`tests/unit/*.test.mjs`)
- `npm run validate:content` - contract validation of `src/content/*.json`
- `npm run format` - Prettier check (⚠ not enforced — see below)
- `npm run verify:fast` - fast static lane: lint + check + content validation
- `npm run verify:feature` - feature lane: fast + build + E2E smoke
- `npm run test:e2e` - Playwright smoke (`tests/e2e/`; chromium only, 1 worker, no video/trace/screenshots; builds+previews on port 4325 or reuses an ISBATAB server already running there)
- `npm run deploy` - build + `wrangler deploy` (Cloudflare Workers)
- `node scripts/verify-affected.mjs` - affected-file verification routing (config: `.pi/verification.json`; unmatched files fall back to the full gate)
- `bash scripts/verify.sh` - canonical full gate: harness doctor (`--ci`) + typecheck + lint + unit tests + build
- `npm run extract-content` - extract content from the source DOCX (set `DOCX_PATH`; defaults to `docs/private/` — kept out of git)

## Verification lanes (for agents and humans)

| Lane                | Command                                          | Covers                                                                                 |
| ------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Targeted / affected | `node scripts/verify-affected.mjs --file <path>` | Routes in `.pi/verification.json`; conservative full-gate fallback for unmatched files |
| Fast (static)       | `npm run verify:fast`                            | ESLint + `astro check` + content validation                                          |
| Unit               | `npm test`                                      | Harness + product unit suites (`tests/`, `tests/unit/`)                              |
| Feature             | `npm run verify:feature`                         | Fast + production build + committed browser smoke                                      |
| Full (canonical)    | `bash scripts/verify.sh`                         | Harness doctor + typecheck + lint + unit tests + build — required before merge/release |

Browser E2E prerequisites: `npx playwright install chromium` once locally. Interactive browser exploration uses the Playwright MCP server (`.mcp.json`); committed deterministic specs live in `tests/e2e/`.

> Note: Prettier is configured but **not enforced** — `npm run format` fails on pre-existing files and is deliberately absent from all verification lanes. Format only files you touch.

## Deploy to Cloudflare Workers

The site builds to the Workers static-assets layout (`dist/` with `dist/_worker.js`)
and deploys with Wrangler:

1. Install the Wrangler CLI and authenticate (`npx wrangler login`) or set `CLOUDFLARE_API_TOKEN`.
2. `npm run deploy` (builds, then `wrangler deploy` using `wrangler.jsonc`).
3. Add the custom domain `isbatab.ir` in the Cloudflare dashboard (Workers → the deployed worker → Custom Domains).
4. Ensure HTTPS is enabled (Cloudflare Universal SSL).

Rollback: redeploy a previous commit (or `wrangler rollback` for the last version).
There is no CI deploy workflow yet — deploys are manual until one is added.

### `_headers` support

This project uses `public/_headers` to define:

- long-term immutable cache for `/_astro/*` and `/fonts/*`
- short cache for HTML routes
- baseline security headers (CSP, frame policy, referrer policy, etc.)

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
- Cloudflare cache headers for hashed assets and fonts.
- Width/height and lazy-loading applied to non-critical images for low CLS.

### Running Lighthouse

You can run Lighthouse from Chrome DevTools (Performance tab) against:

- local preview (`npm run preview`)
- production URL

Recommended checks:

- Performance (focus on FCP/LCP/Speed Index)
- Accessibility (contrast and accessible names)

## License

All rights reserved.
