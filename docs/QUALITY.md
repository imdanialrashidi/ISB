# Quality Contract

This file defines the evaluator-facing quality bar for meaningful changes. Keep it project-specific after `/bootstrap`; do not turn it into a generic checklist dump.

## Release rule

A change is not complete because the code compiles or the happy-path test passes. Every accepted behavior must be implemented rather than stubbed, exercised at the appropriate layer, and supported by evidence.

A required criterion that is unproven is **not passed**.

## Functional completeness

For accepted scope:

- controls that imply behavior must actually perform that behavior (e.g., the mobile menu opens/closes, project filters actually filter, the WhatsApp form actually composes a `wa.me` URL);
- persistence must survive the lifecycle promised by the product (static content — the "persistence" contract is that content renders identically from committed JSON across builds);
- displayed state must come from the authoritative source (`src/content/*.json` + `src/lib/types.ts`), never from copy pasted into components;
- required error, empty, loading, disabled, success, permission, retry, and recovery states must behave coherently — for this site: 404 page, WhatsApp `placeholder` disabled state (`contacts.json.whatsapp.status`), empty services details list, no-index pages, mobile-menu closed state;
- no accepted feature may be satisfied by a placeholder, TODO handler, mock response, display-only control, or hard-coded success path unless the contract explicitly says it is a prototype.

## Correctness

- Preserve domain invariants across success and failure paths.
- Validate external/untrusted data at boundaries. Currently all content is committed/trusted; if user-supplied content is ever introduced, it must be validated before rendering (zod at the content boundary is the established pattern via `src/content.config.ts`).
- Handle retries, duplicate requests, time, rounding, ordering, partial failure, and concurrency where they are material (static site: mostly not material; the only runtime code is inline enhancement JS).
- A production bug should gain regression evidence when practical.
- Tests should assert behavior and contracts rather than implementation trivia.
- A new regression test should demonstrably fail on pre-fix behavior (or a safe focused mutation/equivalent independent characterization) when practical, then pass after the fix.
- Generated tests must build, pass reliably, add a distinct behavioral signal, and isolate relevant state; line coverage alone is not acceptance evidence.

## Security and data integrity

For trust-boundary changes, require the `risk-review` workflow.

At minimum:

- authorization and ownership are enforced server-side — not applicable today (no server surface); do not introduce a server surface that bypasses this rule;
- client-provided roles, prices, payment/subscription states, ownership, and permissions are never authoritative — nothing client-authoritative exists; keep it that way;
- secrets and sensitive data do not enter source, logs, screenshots, fixtures, prompts, or public artifacts — the repo currently holds no secrets (`.pi/models.env` holds model routing only, no keys);
- money/callback/state-transition operations — none exist;
- schema/data changes have compatibility, rollback/recovery, and failure-path reasoning — content JSON changes must keep `src/lib/types.ts` in sync (build fails otherwise at render sites only if the shape is accessed; `astro check` does not validate JSON files, so a content edit can silently satisfy a wrong type — verify with `npm run build` and the affected lane).

## User-facing quality

For rendered interfaces:

- exercise the critical journey in the real browser when browser behavior matters (`tests/e2e/home.spec.mjs` is the committed lane; Playwright MCP for interactive exploration);
- preserve keyboard access, visible focus, semantic controls, labels, contrast, touch targets, and reduced-motion behavior — current implementation: `:focus-visible` outline, `prefers-reduced-motion` fallbacks, `aria-expanded`/`aria-controls` on the mobile menu, `aria-label`s on icon controls, Escape closes the mobile menu;
- check realistic data, long text, localization/RTL when relevant, and at least one narrow viewport for mobile-facing surfaces;
- follow the accepted `docs/DESIGN.md`; use existing design tokens/components when they remain sound and change them deliberately when the accepted direction requires it;
- do not add explanatory copy that merely restates obvious UI;
- visual polish cannot compensate for missing interaction depth or broken behavior.

Default accessibility baseline when the product has not chosen a stricter target:

- WCAG 2.2 AA;
- text contrast at least 4.5:1, or 3:1 for qualifying large text;
- non-text UI/state contrast at least 3:1 where WCAG requires it;
- reflow without loss of information/functionality at 320 CSS px where the content is not inherently two-dimensional;
- usable at 200% text zoom, with clear visible focus and meaning that does not depend on color alone.

### Visual excellence

For a new interface, redesign, launch surface, or explicitly high-aesthetic task, load `frontend-design` and evaluate the rendered result using its visual-quality rubric. The current site direction is documented in `docs/DESIGN.md`; do not invent a new direction during ordinary work.

Hard-gate failures cannot be offset by aesthetic scoring. The ordinary production craft threshold is 2.75/4 with no dimension below 2; an explicitly flagship surface requires 3.25/4 with every dimension at least 3. Any criterion that depends on rendered evidence is `UNPROVEN` when only code was inspected.

## Reliability and performance

Apply only where relevant to the changed path:

- avoid unbounded reads/work, N+1 access, duplicate calls, uncontrolled concurrency, and blocking hot paths — static build: keep the build fast; content additions are cheap;
- use explicit timeouts/cancellation/retries where the boundary requires them;
- preserve meaningful non-sensitive logs or diagnostics for critical transitions;
- performance claims require a reproducible baseline and after-measurement — the README lists applied optimizations (font weights 400/500/700, `font-display: swap`, inline stylesheets, cache headers, width/height + lazy images); there is **no committed Lighthouse/RUM evidence** — do not present these as measured;
- a flaky test or intermittent runtime path is a reliability defect, not automatic permission to weaken the gate.

For production web surfaces without accepted product-specific field budgets, use current Core Web Vitals `good` thresholds as targets at the 75th percentile, segmented by mobile and desktop: LCP ≤ 2.5 s, INP ≤ 200 ms, and CLS ≤ 0.1. Before field data exists, require an accepted repeatable lab budget, RUM instrumentation, and a staged-rollout check. Lab results are pre-production signals; do not present them as field/RUM proof.

## Maintainability and architecture

- Prefer existing project patterns and stable framework/platform primitives.
- Keep public interfaces small and backward-compatible unless a breaking change is accepted.
- Keep business rules separable from presentation/transport when the existing architecture supports it (`src/lib/*` holds pure helpers; components stay presentational).
- New abstractions should solve more than one real current use case or remove a demonstrated risk/duplication.
- New dependencies require a concrete benefit over existing/platform capabilities.
- Architecture invariants that matter repeatedly should be enforced mechanically with types, lint rules, structural tests, schemas, or CI rather than prose alone.

## Evidence hierarchy

Prefer stronger evidence when practical:

1. deterministic automated test of the accepted behavior;
2. real browser/API/database exercise of the relevant journey;
3. type/lint/structural/static analysis for invariant classes;
4. reproducible measurement for performance/reliability claims;
5. focused independent-evaluator inspection for aspects that cannot be automated economically.

A reviewer or subagent opinion alone is not proof.

## Evaluator rubric

An evaluator should assess the accepted contract, not invent adjacent scope.

For each acceptance criterion return one of:

- **PASS** — implementation and evidence satisfy the criterion;
- **FAIL** — evidence demonstrates incorrect/incomplete behavior;
- **UNPROVEN** — implementation may exist but adequate evidence is missing;
- **BLOCKED** — a genuine prerequisite prevents verification.

Then inspect cross-cutting regression risk only where the diff makes it relevant.

The overall task cannot be called complete while a required criterion is `FAIL` or `UNPROVEN`, or while a required independent review has an unresolved BLOCKER/MAJOR finding.

## Project-specific quality invariants

Confirmed rules for this repository (evidence-backed at bootstrap):

1. **Canonical full gate:** `bash scripts/verify.sh` (harness doctor `--ci` + typecheck + lint + unit tests + build). Never claim delivery without it. Affected routing: `node scripts/verify-affected.mjs` (config `.pi/verification.json`); any unmatched file falls back to the canonical gate.
2. **Lanes:** fast/static `npm run verify:fast` (lint + `astro check` + content validation); unit `npm test` (harness + product unit suites); feature `npm run verify:feature` (fast + build + e2e); committed browser smoke `npm run test:e2e` (Playwright, chromium only, 1 worker, 0 retries, no video/trace/screenshots, reuses a running server at `http://localhost:4321` or builds+previews).
3. **Content single-source rule:** company/contacts/services/projects/certificates come only from `src/content/*.json` typed by `src/lib/types.ts`; components never hardcode that data. Mechanical check: `npm run validate:content` (contract + referenced images) via the affected router and `verify:fast`.
4. **Persian/RTL invariants:** all pages `lang="fa" dir="rtl"`; Persian digits via `toPersianDigits`; LTR runs via `.latin-text`/`.num-text`; `wa.me`/`tel:` hrefs built only through `src/lib/` helpers.
5. **Static-only boundary:** no SSR, no server endpoints, no server-side form handling; WhatsApp compose is client-side and stateless. Do not break this to "add a feature".
6. **Defect sensitivity (regression tests):** a new regression test must fail on pre-fix code (red-before-green) or a safe focused mutation, then pass after the fix — this is the acceptance bar for every regression test in this repo (see the committed `evals/fixtures/tiered-pricing` mutation fixture for the pattern).
7. **Flaky-test isolation, not retries:** Playwright runs with `retries: 0`, `workers: 1`, deterministic server reuse, and locator assertions (no fixed sleeps, no `networkidle`); node:test tests run without retry wrappers. A flaky test must be made deterministic or removed — never "fixed" by adding retries.
8. **Prettier is configured but NOT enforced:** `npm run format` fails on 32 pre-existing files (confirmed at bootstrap). It is deliberately absent from all verification lanes and the canonical gate. Format only files you touch; do not run a repo-wide reformat as a side effect.
9. **Font license:** Vazirmatn OFL-1.1 (`@fontsource/vazirmatn`; woff2 committed under `public/fonts/`); only weights 400/500/700 are loaded (600 synthesizes from 500). New fonts require a license record in `docs/DESIGN.md`.
10. **Accessibility target:** WCAG 2.2 AA default; no stricter target accepted; `prefers-reduced-motion` must keep working for any new motion.
11. **Performance evidence:** performance claims require measurement; README-listed optimizations are not evidence. No accepted lab budget or RUM yet — targets default to Core Web Vitals `good`.
12. **Content edits:** any `src/content/*.json` change must be verified with `npm run build` (renders every page) via the affected router; blog posts are validated by the content collection schema (zod) — keep `draft: true` until publishable.

Do not invent quality targets that the product or repository has not accepted.
