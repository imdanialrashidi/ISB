# Contributing

Contributions should improve representative task outcomes, reduce risk/cost, or make the workflow easier to operate. More prompt text or orchestration is not automatically an improvement.

## Setup

1. Use Node.js 22.19.0 or newer.
2. Open the repository in omp (one binary, no packages or MCP setup); project config loads from `.omp/`.
3. Review third-party pins before trusting an update.
4. Run `bash scripts/verify.sh` before and after a workflow change.
5. Work in the repository directly. For an untrusted repository or meaningful credential/private-data exposure, use an OS/container/VM boundary as described in `SECURITY.md`.

## Change contract

For a non-trivial change, state:

- problem and accepted outcome;
- explicit non-goals;
- observable criteria and proof;
- compatibility, security, data, accessibility, performance, visual, and operational risk where relevant;
- rollback or targeted reversal.

Preserve unrelated work and keep one primary writer. Do not add dependencies without a concrete benefit over current/platform capabilities.

## Workflow-policy changes

Workflow maintenance follows `AGENTS.md` and `docs/HARNESS.md`. Keep it explicitly scoped, update all affected source-of-truth documents and `CHANGELOG.md`, and rely on the tested diff/CI evidence.

Run:

```bash
bash scripts/verify.sh
```

For a material harness change, compare baseline/candidate on representative cases. Do not publish model-eval artifacts containing repository content or credentials.

## Frontend contributions

- Follow the accepted `docs/DESIGN.md`; update it before introducing a new visual direction.
- Prove the critical journey and required states in the real browser.
- Include deterministic desktop/mobile/demanding-state evidence for a material visual change.
- Report `frontend-design` hard gates and craft score; aesthetics never cancel a functional/accessibility/performance failure.
- Record third-party font/media/icon source and license.

## Pull request evidence

Complete the pull-request template. Link exact commands and outcomes, not “tests pass.” Include screenshots only when they are deterministic, non-sensitive, and materially help review.

Report vulnerabilities privately using `SECURITY.md`, not a public issue or pull request.
