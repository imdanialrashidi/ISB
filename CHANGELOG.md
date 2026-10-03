# Changelog

All notable workflow changes are documented here. This project follows the spirit of Keep a Changelog; versioning begins when the first release is tagged.

## Unreleased

### Changed — Pi workflow upgrade to 1.0

- Adopted the upstream `pi-production-workflow-template` Pi 1.0 set: runtime pin `0.84.2` → `1.0.0` in `./p`, `Dockerfile.pi`, and doctor requirements; registry integrities re-verified against npm.
- Replaced the third-party MCP adapter and root `.mcp.json` with native Pi `.pi/mcp.json` (`@playwright/mcp` `0.0.79` → `0.0.83`), selective `deferred` browser tool exposure, and `tool_search` discovery. Guard enforcement now covers direct and codemode-nested `mcp__*` calls, plus Pi 1.0 credential paths.
- Moved the core tool allowlist from launcher `--tools` to project `defaultTools` in `.pi/settings.json` (nine schemas incl. `tool_search`), because a CLI allowlist hides native MCP tools from the registry. `./p` now passes leading native CLI subcommands through and no longer forces `PI_EXPERIMENTAL`.
- Dropped the `browser` capability group from `harness_tools` (native MCP owns it) and moved three package helpers into runtime-managed unloading. Bumped `@juicesharp/rpiv-todo` `2.6.2` → `2.12.0` and `@bytetrue/pi-web-search` `0.2.1` → `0.5.1`.
- Updated workflow docs (`HARNESS`, `TOOLING_SETUP`, `EVALUATION`, `RESEARCH`, `SECURITY`, `browser-qa`) and the affected-route/doctor/protected-path references to `.pi/mcp.json`. Project contracts (`docs/PRODUCT.md`, `PLAN`, `ARCHITECTURE`, `DESIGN`, `QUALITY` project invariants), the `product-*` verification routes, the canonical gate, CI e2e job, and Dependabot npm coverage are unchanged.

**Owner action required:** install the reviewed runtime before using `./p` — `npm install -g --ignore-scripts @earendil-works/pi-coding-agent@1.0.0`. `bash scripts/pi-doctor.sh` fails on any older Pi.

### Added

- SEO fundamentals pass: 11 service detail pages at `/services/<id>/` (only for services with real supporting content — intro copy, certificate/licence evidence, and related project experience; guarded by the content validator), visible breadcrumbs + `BreadcrumbList` JSON-LD, dormant `BlogPosting` schema on the blog template, `Organization`/`WebSite` JSON-LD on the homepage only (logo, founding date, address, phones — no fabricated properties), and committed SEO-contract e2e coverage (`tests/e2e/seo.spec.mjs`).
- `tests/unit/seo.test.mjs` (canonical/title/summary helpers, Jalaali→Gregorian conversion, JSON-LD builders) and anti-thin-page validator tests.

### Changed

- Canonical convention standardized to trailing-slash URLs (`https://isbatab.ir/about/`) across canonical tags, internal links, the sitemap, and Cloudflare asset serving; removed `<meta name="keywords">`, self-referencing `hreflang` alternates, redundant `index,follow` robots meta, and the per-page Organization/WebSite schema duplication.
- Unique descriptive Persian titles/descriptions and a single `h1` on every page (services, certifications, projects, contact, blog); contextual internal links from projects and services to their detail pages; footer quick links.
- Blog demo post is `draft: true` and `/blog/` is noindexed and sitemap-excluded until real articles exist; `og:image` is now a rasterized PNG cover (`og-cover.png`); `public/images/brand/isbatab-logo.png` is a stable public logo copy for schema; `ISO 45000/14000` aligned to the certified `ISO 45001/14001` standards in the HSE consulting service.

### Fixed

- Description summarization cuts at word boundaries; Jalaali date conversion validates month lengths; `og:url` no longer emitted on the 404 page.

---

### Added

- `npm test` (harness + product unit suites), `npm run typecheck`, and `npm run validate:content` scripts; the canonical gate (`scripts/verify.sh`) and CI now run typecheck, unit tests, `npm audit` (high/critical), and the browser e2e smoke.
- Content contract validation (`scripts/validate-content.mjs`) wired into `verify:fast` and the `product-content` affected route.
- Unit tests for the DOCX project parser, WhatsApp URL builders, and the content validator (`tests/unit/`).
- Dependabot coverage for npm dependencies.

### Changed

- Documented the Cloudflare Workers static-assets deployment (README, `docs/ARCHITECTURE.md`, `docs/PRODUCT.md`, `docs/PLAN.md`) — the code already built to `dist/_worker.js`; README no longer instructs Cloudflare Pages.
- Hero and header call CTAs now dial the company mobile number (0912…) when present in `contacts.json`; the ایتا and بله messenger channels are active with the 0912 number displayed.
- `/about` opens with a wide, properly set lead paragraph and a real `h1` heading.
- `src/lib/whatsapp.ts` is now the single WhatsApp message/URL implementation, used by the form's bundled script and the header/index/contact links.
- Maps embed URL moved from hardcoded component constants into `contacts.json.addresses[].embedUrl`.
- Vazirmatn 500 and Latin 700 faces are declared (files already shipped); JSON-LD no longer advertises a non-existent site search and escapes `<`; `/images/*` cache is short + `must-revalidate` instead of immutable.
- Extracted raw DOCX dump now goes to `.artifacts/extracted.raw.json` (gitignored); `docs/private/` is gitignored and its DOCX is untracked; unreferenced placeholder SVGs were removed.

### Fixed

- `npm run extract-content` parsed the source document's real two-column project table (title/client pairs) instead of assuming a 4-line/date format that never matched; it refuses to overwrite `projects.json` with an empty parse and no longer defaults to a hardcoded personal Windows path.
- Blog dates are formatted in the `Asia/Tehran` timezone.
- The WhatsApp status (`placeholder`) is honored consistently on the contact page.

### Added

- Product bootstrap: filled `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/QUALITY.md`, `docs/PLAN.md`, and `docs/DESIGN.md` with confirmed repository facts.
- Stack-specific verification lanes: `verify:fast`, `verify:feature`, `test:e2e` npm scripts, a low-resource Playwright lane (`playwright.config.mjs`, `tests/e2e/home.spec.mjs` — chromium only, 1 worker, 0 retries, no video/trace/screenshots, server reuse), and product routes in `.pi/verification.json` (content, source, config, e2e) with the full-gate fallback preserved.

### Changed

- README documents the verification lane table and exact commands.

- Behavioral coverage for autonomous/strict guard modes and launcher trust overrides.
- Product design contract, distinctive frontend-design skill, visual hard gates, and scored craft rubric.
- Idea-to-production prompts: discover, design, spec, ADR, build UI, design review, release plan, and incident response.
- Evidence-gated product roadmap template.
- Safety-guard behavior tests and a contained Docker launcher.
- Security reporting and dependency-review policy.
- `test-design` and `/test` workflows with red/pre-fix defect-sensitivity guidance.
- Deterministic affected-file verification routing with a conservative full-gate fallback.
- Workflow eval schema v2 with executable assertions, trace metrics, baseline comparison, and a real code/test repair fixture.
- Primary-source research and audit record in `docs/RESEARCH.md`.

### Changed

- Made `./p` trust the checked-out project and run autonomously by default: routine workflow edits, task-branch Git delivery, public browser navigation, and focused page evaluation no longer require intermediate approval; the optional Docker launcher selects strict mode.
- Narrowed the safety guard to high-blast-radius actions such as secret access, destructive host/Git commands, force/deleting pushes, publication/deployment/production mutation, and browser file exfiltration.
- Replaced archived `pi-context7` with maintained `pi-doc-search`.
- Removed delegated image-analysis extensions, model configuration, tools, and workflow guidance; browser QA now relies on browser-native evidence and saved screenshots as artifacts.
- Removed the template's forced model/provider selection.
- Pinned Pi installation guidance and GitHub Actions by immutable revision.
- Raised browser QA, accessibility, responsive, and Core Web Vitals requirements for visual work.
- Made the canonical full verification gate validate the template before product source is bootstrapped.
- Reduced duplicate always-loaded policy and added a combined context-size ratchet.
