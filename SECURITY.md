# Security Policy

## Reporting a vulnerability

Do not open a public issue containing an exploitable vulnerability, secret, private log, or user data. Use the repository's private **Security → Report a vulnerability** flow when available. If private reporting is unavailable, contact the repository owner through a private channel and share only the minimum reproduction needed.

Include the affected version/commit, impact, prerequisites, a minimal reproduction, and any known mitigation. Remove credentials and personal data from evidence.

## Execution boundary

The agent runs with the operating-system permissions of the account that starts it. omp's approval tiers and `.omp/RULES.md` are defense in depth; they are not a sandbox and cannot reliably parse every shell/interpreter behavior or redirect. Real isolation must come from the operating system, container, or VM.

Solo default: the agent leaves the proven change in the working tree and reports its state. It never commits, pushes, merges, releases, deploys, or mutates production unless the current request explicitly asks for team delivery ("open a PR", "commit this", or equivalent), in which case it follows `docs/GIT_POLICY.md` exactly through the reviewed `scripts/omp-pr.mjs` helper on the fixed `ai-changes` lane. Main writes, PR merge, and other external actions still need exact owner authorization. Read-only inspection remains available. Secrets stay out of code, logs, screenshots, fixtures, prompts, traces, and artifacts. `OMP_PR_DELIVERY=off` opts out of delivery for local-only runs.

For an untrusted repository, unreviewed third-party instructions, or work exposed to meaningful credentials/private data:

1. Prefer an OS/container/VM boundary with only the required workspace and credentials.
2. Pass only the provider keys required for the task. Never mount the host agent home, SSH keys, cloud credentials, or Docker socket into an untrusted boundary.
3. Review the repository, `.omp/` config, commands, skills, and `scripts/` helpers before trusting them.
4. Review diffs and outputs before copying or deploying them to a trusted/production environment.

Autonomous browser use may navigate public HTTP(S) pages and use focused page evaluation. None of these settings is a network security boundary or redirect containment. Use network policy/container isolation when browsing untrusted applications or when egress matters.

## Third-party packages

Dependencies execute with the agent process's permissions. An exact pin is not a source review. Before updating:

- review the upstream repository, ownership, release diff, install scripts, dependencies, and published integrity;
- test the new pin in a disposable copy/container;
- update the changelog.

## Supported versions

Security fixes are applied to the current `main` branch. The repository does not currently publish versioned releases; once releases begin, list supported release lines here.
