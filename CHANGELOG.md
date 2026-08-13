# Changelog

All notable workflow changes are documented here. This project follows the spirit of Keep a Changelog; versioning begins when the first release is tagged.

## Unreleased

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
