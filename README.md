# ISBATAB Corporate Website

Corporate RTL website for **ISBATAB (ایمن صنعت باتاب)** built for B2B presentation, trust-building, and lead conversion to phone/WhatsApp contact.

## Tech Stack

- Astro (SSG)
- TypeScript
- Tailwind CSS
- Static hosting target: Cloudflare Pages

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
- `npm run build` - build static site to `dist`
- `npm run preview` - preview build output
- `npm run check` - Astro/Type diagnostics (`astro check`)
- `npm run lint` - ESLint
- `npm run format` - Prettier check (⚠ not enforced — see below)
- `npm run verify:fast` - fast static lane: lint + check
- `npm run verify:feature` - feature lane: fast + build + E2E smoke
- `npm run test:e2e` - Playwright smoke (`tests/e2e/`; chromium only, 1 worker, no video/trace/screenshots; builds+previews on port 4325 or reuses an ISBATAB server already running there)
- `node scripts/verify-affected.mjs` - affected-file verification routing (config: `.pi/verification.json`; unmatched files fall back to the full gate)
- `bash scripts/verify.sh` - canonical full gate: harness doctor (`--ci`) + lint + build
- `npm run extract-content` - extract content from the source DOCX file

## Verification lanes (for agents and humans)

| Lane                | Command                                          | Covers                                                                                 |
| ------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Targeted / affected | `node scripts/verify-affected.mjs --file <path>` | Routes in `.pi/verification.json`; conservative full-gate fallback for unmatched files |
| Fast (static)       | `npm run verify:fast`                            | ESLint + `astro check`                                                                 |
| Feature             | `npm run verify:feature`                         | Fast + production build + committed browser smoke                                      |
| Full (canonical)    | `bash scripts/verify.sh`                         | Harness doctor + lint + build — required before merge/release                          |

Browser E2E prerequisites: `npx playwright install chromium` once locally. Interactive browser exploration uses the Playwright MCP server (`.mcp.json`); committed deterministic specs live in `tests/e2e/`.

> Note: Prettier is configured but **not enforced** — `npm run format` fails on pre-existing files and is deliberately absent from all verification lanes. Format only files you touch.

## Content Editing Guide

## Deploy to Cloudflare Pages

1. Push this repository to GitHub.
2. In Cloudflare Dashboard, go to **Pages** and create a new project.
3. Connect your GitHub repository.
4. Set build configuration:
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Deploy.
6. Add custom domain `isbatab.ir` in **Custom Domains**.
7. Ensure HTTPS is enabled (Cloudflare Universal SSL).

### `_headers` support

This project uses `public/_headers` for Cloudflare Pages to define:

- long-term immutable cache for `/_astro/*` and `/fonts/*`
- short cache for HTML routes
- baseline security headers (CSP, frame policy, referrer policy, etc.)

## Content Editing Guide

Main content files:

- `src/content/company.json`
- `src/content/contacts.json`
- `src/content/services.json`
- `src/content/projects.json`
- Blog sample: `src/content/blog/sample-post.md`

If source DOCX is updated:

```bash
npm run extract-content
```

Then review and refine generated content before publishing.

## Performance Notes

Applied optimizations include:

- Reduced Persian font loading to critical weights only (400, 700).
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
